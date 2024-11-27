import {
  LiquidationFailedReason,
  NftFiLoanStatus,
  NftTransferFailedReason,
} from "@simpletuja/shared";
import { format } from "date-fns";
import { BigNumber, ethers } from "ethers";

/**
 * Formats a value representing ETH (in wei) to a human-readable string
 * @param value BigNumber or string in wei
 * @param decimals Number of decimal places to show (default: 4)
 * @returns Formatted string with ETH value
 */
export const formatEther = (
  value: BigNumber | string,
  decimals: number = 4
): string => {
  try {
    // If it's already a BigNumber, use it directly
    if (BigNumber.isBigNumber(value)) {
      const formatted = Number(ethers.utils.formatEther(value));
      return formatted.toFixed(decimals);
    }

    // If it's a string, check if it's already in decimal format
    if (value.includes(".")) {
      // It's already in decimal format, just format it
      return Number(value).toFixed(decimals);
    }

    // Otherwise, treat it as wei
    const bnValue = BigNumber.from(value);
    const formatted = Number(ethers.utils.formatEther(bnValue));
    return formatted.toFixed(decimals);
  } catch (error) {
    console.error("Error formatting ether value:", error);
    return "0.0000";
  }
};

/**
 * Formats an APR value (basis points) to a percentage string
 * @param aprBasisPoints APR in basis points (100 = 1%) as number or string
 * @param decimals Number of decimal places to show (default: 2)
 * @returns Formatted percentage string
 */
export const formatApr = (
  aprBasisPoints: number | string,
  decimals: number = 2
): string => {
  const aprValue =
    typeof aprBasisPoints === "string"
      ? parseFloat(aprBasisPoints)
      : aprBasisPoints;
  const percentage = aprValue;
  return percentage.toFixed(decimals);
};

/**
 * Formats a date string or timestamp into a human-readable format
 * @param date Date string or timestamp
 * @param formatString Custom format string (default: 'MMM d, yyyy')
 * @returns Formatted date string
 */
export const formatDateTime = (
  date: string | number | Date,
  formatString: string = "MMM d, yyyy"
): string => {
  try {
    const dateObj = typeof date === "string" ? new Date(date) : date;
    return format(dateObj, formatString);
  } catch (error) {
    console.error("Error formatting date:", error);
    return "Invalid Date";
  }
};

/**
 * Formats a number to include thousand separators
 * @param value Number to format
 * @returns Formatted string with thousand separators
 */
export const formatNumber = (value: number): string => {
  return new Intl.NumberFormat().format(value);
};

/**
 * Formats a currency value
 * @param value Number to format
 * @param currency Currency code (default: 'USD')
 * @param locale Locale string (default: 'en-US')
 * @returns Formatted currency string
 */
export const formatCurrency = (
  value: number,
  currency: string = "USD",
  locale: string = "en-US"
): string => {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: currency,
  }).format(value);
};

/**
 * Truncates an Ethereum address
 * @param address Full Ethereum address
 * @param startLength Number of characters to show at start (default: 6)
 * @param endLength Number of characters to show at end (default: 4)
 * @returns Truncated address with ellipsis
 */
export const truncateAddress = (
  address: string,
  startLength: number = 6,
  endLength: number = 4
): string => {
  if (!address) return "";
  if (address.length <= startLength + endLength) return address;

  return `${address.slice(0, startLength)}...${address.slice(-endLength)}`;
};

/**
 * Formats a duration in seconds to a human-readable string
 * @param seconds Number of seconds
 * @returns Formatted duration string
 */
export const formatDuration = (seconds: number): string => {
  const days = Math.floor(seconds / (24 * 60 * 60));
  const hours = Math.floor((seconds % (24 * 60 * 60)) / (60 * 60));
  const minutes = Math.floor((seconds % (60 * 60)) / 60);

  const parts = [];
  if (days > 0) parts.push(`${days}d`);
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0) parts.push(`${minutes}m`);

  return parts.join(" ") || "0m";
};

/**
 * Gets the reason for NFT transfer failure
 */
export const getTransferFailReason = (
  reason: NftTransferFailedReason | null
): string => {
  switch (reason) {
    case NftTransferFailedReason.InsufficientEthForGasFee:
      return "Insufficient ETH for GAS fee";
    case NftTransferFailedReason.UnknownError:
      return "Unexpected error occurred";
    default:
      return "";
  }
};

/**
 * Gets the transfer status text and color class
 */
export const getTransferStatus = (status: NftFiLoanStatus) => {
  switch (status) {
    case NftFiLoanStatus.NftTransferred:
      return { text: "Transferred", className: "text-green-500" };
    case NftFiLoanStatus.NftTransferFailed:
      return { text: "Failed", className: "text-red-500" };
    case NftFiLoanStatus.Liquidated:
      return { text: "Transfer pending", className: "text-gray-200" };
    default:
      return { text: "", className: "text-gray-200" };
  }
};

/**
 * Gets the reason for liquidation failure
 */
export const getLiquidationFailReason = (
  reason: LiquidationFailedReason | null
): string => {
  switch (reason) {
    case LiquidationFailedReason.InsufficientEthForGasFee:
      return "Insufficient ETH for GAS fee";
    case LiquidationFailedReason.UnknownError:
      return "Unexpected error occurred";
    default:
      return "";
  }
};
