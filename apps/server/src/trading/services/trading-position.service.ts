import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import Big from 'big.js';
import { Not, Repository } from 'typeorm';
import { CustomException } from '~/commons/errors/custom-exception';
import { TradingPositionEntity } from '~/database/entities/trading/trading-position.entity';
import { TradingPositionStatus } from '../utils/const';
import { IgApiService } from './ig-api.service';

@Injectable()
export class TradingPositionService {
  private readonly logger = new Logger(TradingPositionService.name);

  constructor(
    @InjectRepository(TradingPositionEntity)
    private readonly tradingPositionRepo: Repository<TradingPositionEntity>,
    private readonly igApiService: IgApiService,
  ) {}

  // @CronWithErrorHandling({
  //   cronTime: '*/15 * * * *',
  //   taskName: 'updatePositions',
  // })
  async updatePositions() {
    this.logger.log('Starting position status update check');

    try {
      const { igPositions, pendingPositions, openedPositions } =
        await this.fetchPositionsData();

      // Process current IG positions
      await this.processIgPositions(igPositions, pendingPositions);

      // Handle positions no longer in IG API
      await this.handleRemovedPendingPositions(pendingPositions);
      await this.closeRemovedOpenPositions(igPositions, openedPositions);

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
        .map((pos) => [pos.igOrderDealId, pos]),
    );

    const openedPositions = new Map(
      dbPositions
        .filter((pos) => pos.status === TradingPositionStatus.OPENED)
        .map((pos) => [pos.igPositionOpenDealId, pos]),
    );

    return { igPositions, pendingPositions, openedPositions };
  }

  private async processIgPositions(
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
          position.igOrderDealId,
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
      brokerDealId: position.igOrderDealId,
      reason: rejectionReason,
    });
  }

  private async closeRemovedOpenPositions(
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
      await Promise.all(
        positionsToClose.map(async (position) => {
          await this.tradingPositionRepo.update(position.id, {
            status: TradingPositionStatus.CLOSED,
            exitedAt: new Date(),
          });

          this.logger.log('Closed position', {
            positionId: position.id,
            brokerPositionId: position.igPositionOpenDealId,
          });
        }),
      );
    }
  }
}
