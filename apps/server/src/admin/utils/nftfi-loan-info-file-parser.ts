export interface NftCollectionInfo {
  collection: string;
  loanVolume: string;
  avgLoanSize: string;
  loanCount: number;
  avgLoanDuration: string;
}

export function parseNftfiLoanInfoFile(
  fileContent: string,
): NftCollectionInfo[] {
  const nftEntries = fileContent.split('\n\n').map((entry) => entry.trim());

  const nfts: NftCollectionInfo[] = nftEntries
    .map((entry) => {
      const lines = entry
        .split('\n')
        .map((line) => line.trim())
        .filter((line) => line !== '');

      // Check for exactly 5 lines
      if (lines.length !== 5) {
        return null; // Exclude entries with invalid line count
      }

      const [collection, loanVolume, avgLoanSize, loanCount, avgLoanDuration] =
        lines;
      return {
        collection,
        loanVolume,
        avgLoanSize,
        loanCount: parseInt(loanCount, 10),
        avgLoanDuration,
      };
    })
    .filter((nft) => nft !== null) as NftCollectionInfo[]; // Filter out null entries

  return nfts;
}
