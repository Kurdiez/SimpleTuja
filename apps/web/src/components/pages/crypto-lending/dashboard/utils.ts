/**
 * Formats a number as USD without the currency symbol
 * Example: 1234.5678 -> "1,234.57"
 */
export const formatUsdValue = (value: number): string => {
  return new Intl.NumberFormat(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
};

/**
 * Formats a cryptocurrency value with up to 8 decimal places, removing trailing zeros
 * Example: 1.23000000 -> "1.23"
 * Example: 1.23456789 -> "1.23456789"
 */
export const formatCryptoValue = (value: string | number): string => {
  const num = typeof value === "string" ? parseFloat(value) : value;
  if (isNaN(num)) return "0";

  return new Intl.NumberFormat(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 6,
  }).format(num);
};
