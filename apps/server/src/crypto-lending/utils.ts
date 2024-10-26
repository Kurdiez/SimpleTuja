import { CryptoToken, CryptoTokenDecimals } from '@simpletuja/shared';
import Big from 'big.js';

export const scientificToReal = (
  scientific: number | Big,
  token: CryptoToken,
) => new Big(scientific).div(new Big(10).pow(CryptoTokenDecimals[token]));

export const realToScientific = (real: number | Big, token: CryptoToken) =>
  new Big(real).mul(new Big(10).pow(CryptoTokenDecimals[token]));
