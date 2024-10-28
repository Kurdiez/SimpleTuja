export enum CryptoToken {
  ETH = "ETH",
  WETH = "wETH",
  DAI = "DAI",
  USDC = "USDC",
}

export const CryptoTokenAddress = Object.freeze({
  [CryptoToken.ETH]: "0x0000000000000000000000000000000000000000",
  [CryptoToken.WETH]: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
  [CryptoToken.DAI]: "0x6B175474E89094C44Da98b954EedeAC495271d0F",
  [CryptoToken.USDC]: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
});

export const CryptoTokenDecimals = Object.freeze({
  [CryptoToken.ETH]: 18,
  [CryptoToken.WETH]: 18,
  [CryptoToken.DAI]: 18,
  [CryptoToken.USDC]: 6,
});
