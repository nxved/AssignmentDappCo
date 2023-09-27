import { ethers } from "ethers";
import { useEffect, useState } from "react";
import axios from "axios";
import Web3Modal from "web3modal";
import { useRouter } from "next/router";
import { toast } from "react-toastify";
import { NFTMarketplace, chainConfig } from "../config.js";
import {
  useWalletUpdate,
  useWallet,
  useNFTMarketContract,
} from "../context/WalletContext.js";
import Loading from "../components/Buttons/GlobalLoading";

export default function MyAssets() {
  const [nfts, setNfts] = useState([]);
  const walletToggle = useWalletUpdate();
  const walletState = useWallet();
  const NFTcontract = useNFTMarketContract();
  const [loading, setLoading] = useState(false);
  const [globalLoading, setGlobalLoading] = useState(false);

  const [loadingState, setLoadingState] = useState("not-loaded");
  const router = useRouter();
  useEffect(() => {
    loadNFTs();
  }, [walletState]);
  
  async function loadNFTs() {
    if (walletState) {
      setGlobalLoading(true);
      try {
        const myNftsResponse = await NFTcontract.viewOwned(walletState);
        const myNftItems = await Promise.all(
          myNftsResponse.map(async (i) => {
            console.log(i);
            const meta = await NFTcontract.tokenURI(i[0].toString());
            const metaDataResponse = await fetch(meta);
            const metaData = await metaDataResponse.json();
            let price = ethers.utils.formatUnits(i.price.toString(), "ether");

            let item = {
              price,
              tokenId: i[0].toNumber(),
              owner: i.owner,
              image: metaData.image,
              tokenURI: meta,
              forSale: i.forSale,
            };
            return item;
          })
        );
        setNfts(myNftItems);
        setGlobalLoading(false);
        setLoadingState("loaded");
      } catch (error) {
        console.error("Error fetching user's NFTs:", error);
      }
    }
  }
  function listNFT(nft) {
    console.log("nft:", nft);
    router.push(`/resell-nft?id=${nft.tokenId}&tokenURI=${nft.tokenURI}`);
  }
  if (loadingState === "loaded" && !nfts.length)
    return <h1 className="px-20 py-10 text-3xl">No NFTs owned</h1>;
  return (
    <div className="flex justify-center">
      {!walletState ? (
        <button
          onClick={walletToggle}
          className="block px-8 py-4 mx-auto mt-40 font-semibold text-white bg-gray-900 rounded-lg hover:bg-blue-700"
        >
          Connect your wallet
        </button>
      ) : (
        <div className="p-4">
          {globalLoading && <Loading />}
          <div className="grid grid-cols-1 gap-4 pt-4 sm:grid-cols-2 lg:grid-cols-4">
            {nfts.map((nft, i) => (
              <div key={i} className="overflow-hidden border shadow rounded-xl">
                <img src={nft.image} className="rounded" />
                <div className="p-4 bg-black">
                  <p className="text-2xl font-bold text-white">
                    Price - {nft.price} Eth
                  </p>
                  <button
                    className="w-full px-12 py-2 mt-4 font-bold text-white bg-gray-500 rounded"
                    onClick={() => listNFT(nft)}
                    disabled={nft.forSale}
                  >
                    {nft.forSale ? "Already Listed" : "List"}
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
