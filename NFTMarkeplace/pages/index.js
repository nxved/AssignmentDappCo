import { ethers, Contract } from "ethers";
import { useEffect, useState } from "react";
import axios from "axios";
import Web3Modal from "web3modal";
import Loading from "../components/Buttons/GlobalLoading";

import { NFTMarketplace, chainConfig } from "../config.js";
import {
  useWalletUpdate,
  useWallet,
  useNFTMarketContract,
} from "../context/WalletContext.js";
import { Biconomy } from "@biconomy/mexa";
import { toast } from "react-toastify";

export default function Home() {
  const walletToggle = useWalletUpdate();
  const walletState = useWallet();
  const NFTcontract = useNFTMarketContract();

  const [nfts, setNfts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [globalLoading, setGlobalLoading] = useState(false);
  const [loadingNftId, setLoadingNftId] = useState(null);


  const [loadingState, setLoadingState] = useState("not-loaded");
  useEffect(() => {
    loadNFTs();
  }, []);

  async function loadNFTs() {
    setGlobalLoading(true);
    const provider = new ethers.getDefaultProvider(chainConfig.rpcUrls[0]);
    const contract = new ethers.Contract(
      NFTMarketplace.address,
      NFTMarketplace.abi,
      provider
    );
    const data = await contract.viewAll();
    const items = await Promise.all(
      data.map(async (i) => {
        const meta = await contract.tokenURI(i[0].toString());
        let price = ethers.utils.formatUnits(i[3].toString(), "ether");
        try {
          const response = await fetch(meta);
          if (!response.ok) {
            throw new Error("Network response was not ok");
          }
          const metaData = await response.json();
          const item = {
            price,
            tokenId: i[0].toString(),
            owner: i.owner.toString(),
            image: metaData.image,
            name: i[1].toString(),
            description: metaData.description,
          };
          return item;
        } catch (error) {
          console.error("Error fetching data:", error);
        }
      })
    );
    setNfts(items);
    setGlobalLoading(false);
    setLoadingState("loaded");
  }

  async function buyNft(nft) {
    // if (typeof window.ethereum !== 'undefined') {
    //   console.log("1")
    //   const biconomy = new Biconomy(
    //     window.ethereum,
    //     {
    //       apiKey: "UBh3_aHZV.1c752e3a-7c2b-439c-939d-95bbc4ec3e06",
    //       debug: true,
    //       contractAddresses: "0xafEC87E63C497b568f1d3B6A1aE087f22005974D",
    //     }
    //   );
    //   console.log(biconomy)
    //   console.log("2")

    //   const provider = await biconomy.provider;

    //   const contractInstance = new ethers.Contract(
    //     NFTMarketplace.address,
    //     NFTMarketplace.abi,
    //     biconomy.ethersProvider
    //   );
    //   console.log(contractInstance)
    //   await biconomy.init();
    //   console.log("3")

    //   const price = ethers.utils.parseUnits(nft.price.toString(), "ether");
    //   const { data } = await contractInstance.populateTransaction.buy(nft.tokenId);
    //   console.log(data)

    //   let txParams = {
    //     data: data,
    //     to: NFTMarketplace.address,
    //     from: walletState,
    //     value: price,
    //     signatureType: "EIP712_SIGN",
    //   };
    //   console.log("4")

    //   await provider.send("eth_sendTransaction", [txParams]);
    //   console.log("5")

    // }

    setLoading(true);
    setLoadingNftId(nft.tokenId);
    const price = ethers.utils.parseUnits(nft.price.toString(), "ether");
try{
    const transaction = await NFTcontract.buy(nft.tokenId, {
      value: price,
    });
    await transaction
      .wait()
      .then(async (tx) => {
        console.log(tx);
        if (tx.status === 1) {
          console.log("Transaction successful:", tx);
          toast.success("Successfully Bought NFT");
          loadNFTs();
          setLoadingNftId(null);

          setLoading(false);

        } else {
          console.error("Transaction failed:", tx);
          toast.error("Transaction failed. Please try again.");
          setLoading(false);
          setLoadingNftId(null);

        }
      })
      .catch((err) => {
        console.log(err);
        toast.error("Error in Buying");
        setLoading(false);
        setLoadingNftId(null);

      });
    } catch (error) {
      toast.error("User Rejected Transaction");
      setLoading(false);
      setLoadingNftId(null);
   }
    setLoading(false);
    setLoadingNftId(null);

  }

  if (loadingState === "loaded" && !nfts.length)
    return (
      <h1 className="w-full px-12 py-2 mt-4 font-bold text-white bg-gray-900 rounded">
        No items in marketplace
      </h1>
    );
  return (
    <div className="dark:bg-gray-dark dark:text-white">
      {!walletState ? (
        <button
          onClick={walletToggle}
          className="block px-8 py-4 mx-auto mt-40 font-semibold text-white bg-gray-900 rounded-lg hover:bg-gray-700"
        >
          Connect your wallet
        </button>
      ) : (
        <div className="px-4" style={{ maxWidth: "1600px" }}>
          {globalLoading && <Loading />}
          <div className="grid grid-cols-1 gap-4 pt-4 sm:grid-cols-2 lg:grid-cols-4">
            {nfts.map((nft, i) => (
              <div key={i} className="overflow-hidden border shadow rounded-xl">
                <img src={nft.image} />
                <div className="p-4">
                  <p
                    style={{ height: "64px" }}
                    className="text-2xl font-semibold"
                  >
                    {nft.name}
                  </p>
                  <div style={{ height: "70px", overflow: "hidden" }}>
                    <p className="text-gray-400">{nft.description}</p>
                  </div>
                </div>
                <div className="p-4 bg-black">
                  <p className="text-2xl font-bold text-white">
                    {nft.price} ETH
                  </p>
                  <button
                    className="w-full px-12 py-2 mt-4 font-bold text-white bg-gray-500 rounded"
                    onClick={() => buyNft(nft)}
                    disabled={loading}
                  > {loadingNftId === nft.tokenId ? "Buying" : "BUY"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
  