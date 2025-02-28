import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import Big from 'big.js';
import { parseISO, subMinutes } from 'date-fns';
import { getTimezoneOffset } from 'date-fns-tz';
import { Not, Repository } from 'typeorm';
import { CronWithErrorHandling } from '~/commons/error-handlers/scheduled-tasks-errors';
import { CustomException } from '~/commons/errors/custom-exception';
import { TradingPositionEntity } from '~/database/entities/trading/trading-position.entity';
import { TradingPositionStatus } from '../utils/const';
import { getTradingInfo } from '../utils/epic-trading-info';
import { IgClosedPositionActivity } from '../utils/ig-api.types';
import { IgApiService } from './ig-api.service';

@Injectable()
export class TradingPositionService {
  private readonly logger = new Logger(TradingPositionService.name);

  constructor(
    @InjectRepository(TradingPositionEntity)
    private readonly tradingPositionRepo: Repository<TradingPositionEntity>,
    private readonly igApiService: IgApiService,
  ) {}

  @CronWithErrorHandling({
    cronTime: '*/15 * * * *',
    taskName: 'updatePositions',
  })
  async updatePositions() {
    this.logger.log('Starting position status update check');

    try {
      this.logger.log('Fetching positions data from IG API and database...');
      const { igPositions, pendingPositions, openedPositions } =
        await this.fetchPositionsData();

      this.logger.log('Fetched positions data', {
        igPositionsCount: igPositions.positions.length,
        pendingPositionsCount: pendingPositions.size,
        openedPositionsCount: openedPositions.size,
      });

      // Process current IG positions
      this.logger.log('Starting to update pending positions...');
      await this.updatePendingPositions(igPositions, pendingPositions);
      this.logger.log('Completed updating pending positions');

      // Handle positions no longer in IG API
      this.logger.log('Starting to handle removed pending positions...');
      await this.handleRemovedPendingPositions(pendingPositions);
      this.logger.log('Completed handling removed pending positions');

      this.logger.log('Starting to update closed positions...');
      await this.updateClosedPositions(igPositions, openedPositions);
      this.logger.log('Completed updating closed positions');

      this.logger.log('Completed position status update check', {
        totalIgPositions: igPositions.positions.length,
        closedPositions: Array.from(openedPositions.values()).filter(
          (position) =>
            !new Set(
              igPositions.positions.map(({ position }) => position.dealId),
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
    const igPositions = await this.igApiService.getAllOpenPositions();

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

    return { igPositions, pendingPositions, openedPositions };
  }

  private async updatePendingPositions(
    igPositions: any,
    pendingPositions: Map<string, TradingPositionEntity>,
  ) {
    for (const { position: igPosition } of igPositions.positions) {
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
    igPositions: any,
    openedPositions: Map<string, TradingPositionEntity>,
  ) {
    const igPositionIds = new Set(
      igPositions.positions.map(({ position }) => position.dealId),
    );

    const positionsToClose = Array.from(openedPositions.values()).filter(
      (position) => !igPositionIds.has(position.igPositionOpenDealId),
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

      await Promise.all(
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

          await this.tradingPositionRepo.update(position.id, {
            status: TradingPositionStatus.CLOSED,
            exitPrice,
            exitedAt,
          });

          this.logger.log('Closed position', {
            positionId: position.id,
            brokerPositionId: position.igPositionOpenDealId,
            exitPrice: exitPrice?.toString() ?? null,
            exitedAt: activity?.date,
            timezone: getTradingInfo(position.epic).dataTimezone,
          });
        }),
      );
    }
  }
}
