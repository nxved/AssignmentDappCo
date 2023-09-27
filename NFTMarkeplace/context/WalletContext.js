import React, { useContext, useEffect, useState, useRef } from "react";
import { ethers } from "ethers";
import { NFTMarketplace, chainConfig } from "../config";
import Web3Modal from "web3modal";
import { toast } from "react-toastify";
import { useRouter } from "next/router";

const WalletContext = React.createContext();
const WalletUpdateContext = React.createContext();
const NFTMarketContractUpdateContext = React.createContext();

export function useWallet() {
  return useContext(WalletContext);
}

export function useWalletUpdate() {
  return useContext(WalletUpdateContext);
}

export function useNFTMarketContract() {
  return useContext(NFTMarketContractUpdateContext);
}

const returnContract = (details, signer) => {
  return new ethers.Contract(details.address, details.abi, signer);
};

export default function WalletProvider({ children }) {
  const router = useRouter();
  const [walletAddress, setWalletAddress] = useState(null);
  const [NFTMarketContract, setNFTMarketContract] = useState(null);
  const [walletConnected, setWalletConnected] = useState(false);

  const provider = new ethers.providers.JsonRpcProvider(chainConfig.rpcUrls[0]);

  useEffect(() => {
    if (walletConnected) {
      checkChainId();
      console.log(walletAddress)
    }
  }, [walletAddress, walletConnected]);

  useEffect(() => {
    console.log(walletAddress)
    toggleWalletButton();
      checkChainId();
  }, []);

  useEffect(() => {
    setContract();
  }, []);

  const toggleWalletButton = async () => {
    try {
      const walletProvider = await connectWallet();
      const signer = walletProvider.getSigner();
      const address = await signer.getAddress();
      setWalletConnected(true);
      setWalletAddress(address);
      toast.success("Wallet Connected")
    } catch (err) {
      console.error(err);
     toast.error("Failed to connect MetaMask wallet.");
    }
  };

  const connectWallet = async () => {
    const web3Modal = new Web3Modal();
    const connection = await web3Modal.connect();
    const walletProvider = new ethers.providers.Web3Provider(connection);
    const network = await walletProvider.getNetwork();
    if (network.chainId !== 80001) {
       toast.error("Change the network to Mumbai")
     // window.alert("Change the network to Mumbai")
      try {
        await ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: '0x13881' }],
        });
      } catch (switchError) {
        // This error code indicates that the chain has not been added to MetaMask.
        if (switchError.code === 4902) {
          try {
            await ethereum.request({
              method: 'wallet_addEthereumChain',
              params: [
                {
                  chainId: '0x13881',
                  chainName: 'PolygonMumbai',
                  rpcUrls: chainConfig.rpcUrls,
                },
              ],
            });
          } catch (addError) {
          }
        }
      }    }
    return walletProvider;
  };

  const checkChainId = async () => {
    if (walletAddress) {
      setWalletAddress(ethers.utils.getAddress(walletAddress));
      setContract();
    }
  };

  const setContract = async () => {
    if (walletAddress) {
      const walletProvider = await connectWallet();
      const signer = walletProvider.getSigner();
      const NFTMarketplaceContract = returnContract(NFTMarketplace, signer);
      setNFTMarketContract(NFTMarketplaceContract);
    }
  };

  return (
    <WalletContext.Provider value={walletAddress}>
      <WalletUpdateContext.Provider value={toggleWalletButton}>
        <NFTMarketContractUpdateContext.Provider value={NFTMarketContract}>
          {children}
        </NFTMarketContractUpdateContext.Provider>
      </WalletUpdateContext.Provider>
    </WalletContext.Provider>
  );
}
