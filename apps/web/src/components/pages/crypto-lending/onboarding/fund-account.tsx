import React, { useState, useEffect, useCallback } from "react";
import {
  useAppKitProvider,
  useAppKitAccount,
  useAppKit,
} from "@reown/appkit/react";
import { BrowserProvider, Contract, parseUnits, Eip1193Provider } from "ethers";

const WETH_ADDRESS = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2";
const WETH_ABI = [
  "function balanceOf(address owner) view returns (uint256)",
  "function transfer(address to, uint256 amount) returns (bool)",
  "function deposit() payable",
] as const;

interface FundAccountProps {
  destinationAddress: string;
}

export const FundAccount: React.FC<FundAccountProps> = ({
  destinationAddress,
}) => {
  const [amount, setAmount] = useState<string>("");
  const [status, setStatus] = useState<string>("");
  const { address, isConnected } = useAppKitAccount();
  const { walletProvider } = useAppKitProvider("eip155");
  const { open } = useAppKit();

  const handleConnect = useCallback((): void => {
    try {
      open({ view: "Connect" });
    } catch (error) {
      console.error("Failed to open connection modal:", error);
      setStatus("Failed to open connection modal. Please try again.");
    }
  }, [open]);

  useEffect(() => {
    if (!isConnected) {
      handleConnect();
    }
  }, [handleConnect, isConnected]);

  const checkAndSendWETH = async (): Promise<void> => {
    if (!isConnected) {
      handleConnect();
      return;
    }

    if (!walletProvider || !address) {
      setStatus("Wallet provider or address not available");
      return;
    }

    try {
      const ethersProvider = new BrowserProvider(
        walletProvider as Eip1193Provider
      );
      const signer = await ethersProvider.getSigner();
      const wethContract = new Contract(WETH_ADDRESS, WETH_ABI, signer);
      const amountWei = parseUnits(amount, 18);

      const wethBalance = await wethContract.balanceOf(address);

      if (wethBalance < amountWei) {
        const ethBalance = await ethersProvider.getBalance(address);

        if (ethBalance < amountWei) {
          setStatus("Insufficient ETH and WETH balance");
          return;
        }

        const wrapConfirmed = window.confirm(
          "Insufficient WETH balance. Would you like to wrap ETH to WETH?"
        );
        if (wrapConfirmed) {
          setStatus("Wrapping ETH to WETH...");
          const tx = await wethContract.deposit({ value: amountWei });
          await tx.wait();
          setStatus("ETH wrapped to WETH successfully");
        } else {
          setStatus("Transaction cancelled");
          return;
        }
      }

      setStatus("Sending WETH...");
      const tx = await wethContract.transfer(destinationAddress, amountWei);
      await tx.wait();
      setStatus("WETH sent successfully");
    } catch (error) {
      console.error("Transaction failed:", error);
      setStatus(`Transaction failed: ${(error as Error).message}`);
    }
  };

  return (
    <div>
      <input
        type="text"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        placeholder="Amount in ETH"
      />
      <button onClick={checkAndSendWETH}>Fund Account with WETH</button>
      <p>{status}</p>
    </div>
  );
};

export default FundAccount;
