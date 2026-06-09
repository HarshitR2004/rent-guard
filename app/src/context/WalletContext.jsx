import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { ethers } from "ethers";

const WalletContext = createContext(null);

const MONAD_CHAIN_ID_HEX = "0x279f"; // 10143
const MONAD_CHAIN_ID_DEC = 10143n;

export const MONAD_NETWORK_PARAMS = {
  chainId: MONAD_CHAIN_ID_HEX,
  chainName: "Monad Testnet",
  nativeCurrency: { name: "Monad", symbol: "MON", decimals: 18 },
  rpcUrls: ["https://testnet-rpc.monad.xyz"],
  blockExplorerUrls: ["https://testnet.monadscan.com"],
};

export function WalletProvider({ children }) {
  const [address, setAddress] = useState("");
  const [isConnected, setIsConnected] = useState(false);
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [isWrongNetwork, setIsWrongNetwork] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState("");

  const checkNetworkAndAccounts = useCallback(async (prov) => {
    try {
      const network = await prov.getNetwork();
      const isMonad = network.chainId === MONAD_CHAIN_ID_DEC;
      setIsWrongNetwork(!isMonad);

      const accounts = await prov.send("eth_accounts", []);
      if (accounts.length > 0) {
        const sign = await prov.getSigner();
        setAddress(accounts[0]);
        setSigner(sign);
        setIsConnected(true);
      } else {
        setAddress("");
        setSigner(null);
        setIsConnected(false);
      }
    } catch (err) {
      console.error("Error checking network/accounts:", err);
    }
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined" && window.ethereum) {
      const browserProvider = new ethers.BrowserProvider(window.ethereum);
      setProvider(browserProvider);
      checkNetworkAndAccounts(browserProvider);

      const handleAccountsChanged = async (accounts) => {
        if (accounts.length > 0) {
          const sign = await browserProvider.getSigner();
          setAddress(accounts[0]);
          setSigner(sign);
          setIsConnected(true);
        } else {
          setAddress("");
          setSigner(null);
          setIsConnected(false);
        }
      };

      const handleChainChanged = () => {
        window.location.reload();
      };

      window.ethereum.on("accountsChanged", handleAccountsChanged);
      window.ethereum.on("chainChanged", handleChainChanged);

      return () => {
        if (window.ethereum.removeListener) {
          window.ethereum.removeListener("accountsChanged", handleAccountsChanged);
          window.ethereum.removeListener("chainChanged", handleChainChanged);
        }
      };
    }
  }, [checkNetworkAndAccounts]);

  const connectWallet = async () => {
    if (!window.ethereum) {
      setError("No Web3 wallet detected. Please install MetaMask or another extension.");
      return;
    }
    setIsConnecting(true);
    setError("");
    try {
      const browserProvider = new ethers.BrowserProvider(window.ethereum);
      const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
      
      const network = await browserProvider.getNetwork();
      if (network.chainId !== MONAD_CHAIN_ID_DEC) {
        try {
          await window.ethereum.request({
            method: "wallet_switchEthereumChain",
            params: [{ chainId: MONAD_CHAIN_ID_HEX }],
          });
        } catch (switchError) {
          if (switchError.code === 4902) {
            await window.ethereum.request({
              method: "wallet_addEthereumChain",
              params: [MONAD_NETWORK_PARAMS],
            });
          } else {
            throw switchError;
          }
        }
      }

      const sign = await browserProvider.getSigner();
      setAddress(accounts[0]);
      setSigner(sign);
      setIsConnected(true);
      setIsWrongNetwork(false);
    } catch (err) {
      console.error("Wallet connection failed:", err);
      setError(err.message || "Failed to connect wallet.");
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnectWallet = () => {
    setAddress("");
    setIsConnected(false);
    setSigner(null);
  };

  return (
    <WalletContext.Provider
      value={{
        address,
        isConnected,
        provider,
        signer,
        isWrongNetwork,
        isConnecting,
        error,
        connectWallet,
        disconnectWallet,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error("useWallet must be used within a WalletProvider");
  }
  return context;
}
