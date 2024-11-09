/**
 * Converts a camel case string into a readable format
 * Example: "InsufficientTokenBalance" -> "Insufficient Token Balance"
 */
export const formatCamelCase = (text: string): string => {
  return (
    text
      // Add space between camel case words
      .replace(/([A-Z])/g, " $1")
      // Trim any extra spaces and capitalize first letter
      .trim()
      // Handle consecutive capital letters (like "NFT")
      .replace(/\s+([A-Z]{2,})/g, " $1")
  );
};
