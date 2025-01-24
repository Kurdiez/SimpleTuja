import Big from 'big.js';
import { IGPriceSnapshot, PriceQuote } from '~/trading/utils/types';

export const igPriceSnapshotTransformer = {
  to: (snapshot: IGPriceSnapshot | null) => {
    if (!snapshot) return null;

    const transformQuote = (quote: PriceQuote) => ({
      bid: quote.bid instanceof Big ? quote.bid.toNumber() : quote.bid,
      ask: quote.ask instanceof Big ? quote.ask.toNumber() : quote.ask,
      lastTraded:
        quote.lastTraded instanceof Big
          ? quote.lastTraded.toNumber()
          : quote.lastTraded,
    });

    return {
      ...snapshot,
      openPrice: transformQuote(snapshot.openPrice),
      closePrice: transformQuote(snapshot.closePrice),
      highPrice: transformQuote(snapshot.highPrice),
      lowPrice: transformQuote(snapshot.lowPrice),
      lastTradedVolume:
        snapshot.lastTradedVolume instanceof Big
          ? snapshot.lastTradedVolume.toNumber()
          : snapshot.lastTradedVolume,
    };
  },
  from: (snapshot: IGPriceSnapshot | null) => {
    if (!snapshot) return null;

    const transformQuote = (quote: PriceQuote) => ({
      bid: new Big(quote.bid),
      ask: new Big(quote.ask),
      lastTraded: quote.lastTraded !== null ? new Big(quote.lastTraded) : null,
    });

    return {
      ...snapshot,
      openPrice: transformQuote(snapshot.openPrice),
      closePrice: transformQuote(snapshot.closePrice),
      highPrice: transformQuote(snapshot.highPrice),
      lowPrice: transformQuote(snapshot.lowPrice),
      lastTradedVolume: new Big(snapshot.lastTradedVolume),
    };
  },
};
