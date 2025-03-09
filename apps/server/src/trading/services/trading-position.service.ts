import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import Big from 'big.js';
import { parseISO, subMinutes } from 'date-fns';
import { getTimezoneOffset } from 'date-fns-tz';
import { Not, Repository } from 'typeorm';
import { captureException } from '~/commons/error-handlers/capture-exception';
import { CronWithErrorHandling } from '~/commons/error-handlers/scheduled-tasks-errors';
import { CustomException } from '~/commons/errors/custom-exception';
import { TradingPerformanceReportEntity } from '~/database/entities/trading/trading-performance-report.entity';
import { TradingPositionEntity } from '~/database/entities/trading/trading-position.entity';
import {
  MIN_POSITIONS_FOR_REPORT,
  PositionDirection,
  TradingPositionStatus,
} from '../utils/const';
import { getTradingInfo } from '../utils/epic-trading-info';
import { IgClosedPositionActivity } from '../utils/ig-api.types';
import { GeminiAiService } from './gemini-ai.service';
import { IgApiService } from './ig-api.service';

@Injectable()
export class TradingPositionService {
  private readonly logger = new Logger(TradingPositionService.name);

  constructor(
    @InjectRepository(TradingPositionEntity)
    private readonly tradingPositionRepo: Repository<TradingPositionEntity>,
    @InjectRepository(TradingPerformanceReportEntity)
    private readonly performanceReportRepo: Repository<TradingPerformanceReportEntity>,
    private readonly igApiService: IgApiService,
    private readonly geminiAiService: GeminiAiService,
  ) {}

  @CronWithErrorHandling({
    cronTime: '*/15 * * * *',
    taskName: 'updatePositions',
  })
  async updatePositions() {
    this.logger.log('Starting position status update check');

    try {
      this.logger.log('Fetching positions data from IG API and database...');
      const { openPositions, pendingPositions, openedPositions } =
        await this.fetchPositionsData();

      this.logger.log('Fetched positions data', {
        igPositionsCount: openPositions.positions.length,
        pendingPositionsCount: pendingPositions.size,
        openedPositionsCount: openedPositions.size,
      });

      // Process current IG positions
      await this.updatePendingPositions(openPositions, pendingPositions);
      this.logger.log('Completed updating pending positions');

      // Handle positions no longer in IG API
      await this.handleRemovedPendingPositions(pendingPositions);
      this.logger.log('Completed handling removed pending positions');

      const closedPositions = await this.updateClosedPositions(
        openPositions,
        openedPositions,
      );
      this.logger.log('Completed updating closed positions');

      await this.updatePerformanceReport(closedPositions);
      this.logger.log('Completed updating performance reports');

      this.logger.log('Completed position status update check', {
        totalIgPositions: openPositions.positions.length,
        closedPositions: Array.from(openedPositions.values()).filter(
          (position) =>
            !new Set(
              openPositions.positions.map(({ position }) => position.dealId),
            ).has(position.igPositionOpenDealId),
        ).length,
      });
    } catch (error) {
      this.logger.error('Error updating positions', {
        error: error.message,
        stack: error.stack,
        errorName: error.name,
        errorCode: error.code,
      });
      throw new CustomException('Error updating positions', { error });
    }
  }

  private async fetchPositionsData() {
    // Get all positions from IG API
    const openPositions = await this.igApiService.getAllOpenPositions();

    // Get all non-closed positions from DB
    const dbPositions = await this.tradingPositionRepo.find({
      where: {
        status: Not(TradingPositionStatus.CLOSED),
      },
    });

    // Create maps for easier lookup
    const pendingPositions = new Map(
      dbPositions
        .filter((pos) => pos.status === TradingPositionStatus.PENDING)
        .map((pos) => [pos.igPositionOpenDealReference, pos]),
    );

    const openedPositions = new Map(
      dbPositions
        .filter((pos) => pos.status === TradingPositionStatus.OPENED)
        .map((pos) => [pos.igPositionOpenDealId, pos]),
    );

    return { openPositions, pendingPositions, openedPositions };
  }

  private async updatePendingPositions(
    openPositions: any,
    pendingPositions: Map<string, TradingPositionEntity>,
  ) {
    for (const { position: igPosition } of openPositions.positions) {
      // First check if this matches any pending position by dealReference
      const pendingPosition = pendingPositions.get(igPosition.dealReference);
      if (pendingPosition) {
        // Update pending position to opened status with full details
        await this.tradingPositionRepo.update(pendingPosition.id, {
          status: TradingPositionStatus.OPENED,
          igPositionOpenDealId: igPosition.dealId,
          size: new Big(igPosition.size),
          entryPrice: new Big(igPosition.level),
          stopLossPrice: igPosition.stopLevel
            ? new Big(igPosition.stopLevel)
            : null,
          takeProfitPrice: igPosition.limitLevel
            ? new Big(igPosition.limitLevel)
            : null,
        });
        pendingPositions.delete(igPosition.dealReference);
      }
    }
  }

  private async handleRemovedPendingPositions(
    pendingPositions: Map<string, TradingPositionEntity>,
  ) {
    for (const position of pendingPositions.values()) {
      try {
        const dealStatus = await this.igApiService.confirmDealStatus(
          position.igPositionOpenDealReference,
        );
        if (dealStatus.dealStatus === 'REJECTED') {
          await this.updateRejectedPosition(position, dealStatus.reason);
        }
      } catch (error) {
        await this.updateRejectedPosition(position, error.message);
      }
    }
  }

  private async updateRejectedPosition(
    position: TradingPositionEntity,
    rejectionReason: string,
  ) {
    await this.tradingPositionRepo.update(position.id, {
      status: TradingPositionStatus.CLOSED,
      exitedAt: new Date(),
      metadata: {
        ...position.metadata,
        rejectionReason,
      },
    });

    this.logger.log('Marked pending position as closed due to rejection', {
      positionId: position.id,
      igPositionOpenDealReference: position.igPositionOpenDealReference,
      reason: rejectionReason,
    });
  }

  private async updateClosedPositions(
    openPositionsInBroker: any,
    openedPositionsInDb: Map<string, TradingPositionEntity>,
  ): Promise<TradingPositionEntity[]> {
    const brokerOpenPositionIds = new Set(
      openPositionsInBroker.positions.map(({ position }) => position.dealId),
    );

    const positionsToClose = Array.from(openedPositionsInDb.values()).filter(
      (position) => !brokerOpenPositionIds.has(position.igPositionOpenDealId),
    );

    if (positionsToClose.length > 0) {
      // Get all position open deal IDs
      const positionOpenDealIds = positionsToClose.map(
        (position) => position.igPositionOpenDealId,
      );

      // Get closed position activity from IG API
      const closedPositionsActivity: Record<string, IgClosedPositionActivity> =
        await this.igApiService.getClosedPositionsActivity({
          positionOpenDealIds,
        });

      const updatedPositions = await Promise.all(
        positionsToClose.map(async (position) => {
          const activity =
            closedPositionsActivity[position.igPositionOpenDealId];

          let exitPrice: Big | null = null;
          if (
            activity?.details?.level != null &&
            !isNaN(activity.details.level)
          ) {
            try {
              exitPrice = new Big(activity.details.level);
            } catch (error) {
              this.logger.error('Failed to parse exit price', {
                level: activity.details.level,
                positionId: position.id,
                error,
              });
            }
          }

          const exitedAt = activity
            ? (() => {
                const tradingInfo = getTradingInfo(position.epic);
                const dubaiDate = parseISO(activity.date);
                const offsetMinutes =
                  getTimezoneOffset(tradingInfo.dataTimezone, dubaiDate) /
                  1000 /
                  60;
                return subMinutes(dubaiDate, offsetMinutes);
              })()
            : new Date();

          position.status = TradingPositionStatus.CLOSED;
          position.exitPrice = exitPrice;
          position.exitedAt = exitedAt;

          const savedPosition = await this.tradingPositionRepo.save(position);

          this.logger.log('Closed position', {
            positionId: position.id,
            brokerPositionId: position.igPositionOpenDealId,
            exitPrice: exitPrice?.toString() ?? null,
            exitedAt: activity?.date,
            timezone: getTradingInfo(position.epic).dataTimezone,
          });

          return savedPosition;
        }),
      );

      return updatedPositions;
    }

    return [];
  }

  async updatePerformanceReport(closedPositions: TradingPositionEntity[]) {
    if (closedPositions.length < MIN_POSITIONS_FOR_REPORT) {
      return;
    }

    const uniqueEpics = [
      ...new Set(closedPositions.map((position) => position.epic)),
    ];

    const recentPositionsByEpic = (
      await Promise.all(
        uniqueEpics.map(async (epic) => {
          // Get most recent closed positions for the epic
          const recentPositions = await this.tradingPositionRepo.find({
            where: {
              epic,
              status: TradingPositionStatus.CLOSED,
            },
            order: {
              exitedAt: 'DESC',
            },
            take: MIN_POSITIONS_FOR_REPORT,
          });

          const positionSummaries = recentPositions
            .map((position) => {
              // Calculate profit/loss based on direction, entry price, and exit price
              const entryPrice = position.entryPrice;
              const exitPrice = position.exitPrice;

              if (!entryPrice || !exitPrice) {
                this.logger.warn('Position missing entry or exit price', {
                  positionId: position.id,
                  epic: position.epic,
                  entryPrice: entryPrice?.toString(),
                  exitPrice: exitPrice?.toString(),
                });
                return null;
              }

              let isProfit = false;
              let isLoss = false;

              if (position.direction === PositionDirection.BUY) {
                isProfit = exitPrice.gt(entryPrice);
                isLoss = exitPrice.lt(entryPrice);
              } else {
                isProfit = exitPrice.lt(entryPrice);
                isLoss = exitPrice.gt(entryPrice);
              }

              return {
                epic: position.epic,
                isProfit,
                isLoss,
                signal: position.metadata?.signal || null,
              };
            })
            .filter(
              (summary): summary is NonNullable<typeof summary> =>
                summary !== null,
            );

          // Skip epics with no valid position summaries
          if (positionSummaries.length === 0) {
            this.logger.warn('No valid position summaries found for epic', {
              epic,
              totalPositionsQueried: recentPositions.length,
            });
            return null;
          }

          return {
            epic,
            positions: positionSummaries,
            summary: {
              totalPositions: positionSummaries.length,
              profitablePositions: positionSummaries.filter((p) => p.isProfit)
                .length,
              lossPositions: positionSummaries.filter((p) => p.isLoss).length,
            },
          };
        }),
      )
    ).filter((result): result is NonNullable<typeof result> => result !== null);

    // Process each epic's performance report in parallel
    await Promise.all(
      recentPositionsByEpic.map(async (epicData) => {
        try {
          const promptTemplate = `
        You are an expert trading performance analyst. Your task is to analyze the recent trading history for ${epicData.epic} and generate a comprehensive performance report.

        Trading Data Summary:
        - Total Positions: ${epicData.summary.totalPositions}
        - Profitable Positions: ${epicData.summary.profitablePositions}
        - Loss Positions: ${epicData.summary.lossPositions}
        - Win Rate: ${(
          (epicData.summary.profitablePositions /
            epicData.summary.totalPositions) *
          100
        ).toFixed(2)}%

        Detailed Position Data:
        ${JSON.stringify(epicData.positions, null, 2)}

        Please analyze this data and provide:

        1. Performance Overview:
           - Overall trading effectiveness
           - Win rate analysis
           - Pattern in profitable vs losing trades

        2. Signal Analysis:
           - Effectiveness of different trading signals
           - Which signals led to more profitable trades
           - Which signals resulted in losses

        3. Trading Patterns:
           - Common characteristics of winning trades
           - Common characteristics of losing trades
           - Any identifiable market conditions that affected performance

        4. Risk Management Assessment:
           - Analysis of position management
           - Suggestions for risk management improvements

        5. Recommendations:
           - Specific actionable improvements
           - What to continue doing (strengths)
           - What to stop doing (weaknesses)
           - What to start doing (opportunities)

        Format your response as a structured report with clear sections and bullet points.
        Focus on actionable insights that can improve future trading performance.
        Do not include the date of the report in your response.
        `;

          const performanceReport =
            await this.geminiAiService.generateRawResponse(promptTemplate);

          await this.performanceReportRepo.save({
            epic: epicData.epic,
            report: performanceReport,
          });
        } catch (error) {
          captureException({
            error: new CustomException(
              'Failed to generate performance report',
              {
                error,
                epic: epicData.epic,
              },
            ),
          });
        }
      }),
    );
  }
}
