import { useState } from "react";
import { ethers } from "ethers";
import { create as ipfsHttpClient } from "ipfs-http-client";
import { useRouter } from "next/router";

const client = ipfsHttpClient("https://ipfs.infura.io:5001/api/v0");
import { NFTMarketplace, chainConfig } from "../config.js";
import {
  useWalletUpdate,
  useWallet,
  useNFTMarketContract,
} from "../context/WalletContext.js";
import { toast } from "react-toastify";

export default function CreateItem() {
  const [fileUrl, setFileUrl] = useState(null);
  const [formInput, updateFormInput] = useState({ nameNFT: "", tokenURI: "" });
  const router = useRouter();
  const walletToggle = useWalletUpdate();
  const walletState = useWallet();
  const NFTcontract = useNFTMarketContract();
  const [loading, setLoading] = useState(false);

  async function mint() {
    const { nameNFT, tokenURI } = formInput;
    if (!nameNFT || !tokenURI) {
      toast.error("Fill all the Details");
      return;
    }
    setLoading(true);
    let transaction = await NFTcontract.mint(nameNFT, tokenURI);
    await transaction
      .wait()
      .then(async (tx) => {
        console.log(tx);
        if (tx.status === 1) {
          console.log("Transaction successful:", tx);
          toast.success("Successfully Created NFT");
        } else {
          console.error("Transaction failed:", tx);
          toast.error("Transaction failed. Please try again.");
        }
      })
      .catch((err) => {
        console.log(err);
        toast.error("Error in Creating");
      });
    setLoading(false);

    router.push("/");
  }

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
        <div className="flex flex-col w-1/2 pb-12">
          <input
            placeholder="Asset Name"
            className="p-4 mt-8 border rounded"
            onChange={(e) =>
              updateFormInput({ ...formInput, nameNFT: e.target.value })
            }
          />
          <textarea
            placeholder="Token URI"
            className="p-4 mt-2 border rounded"
            onChange={(e) =>
              updateFormInput({ ...formInput, tokenURI: e.target.value })
            }
          />
          <button
            onClick={mint}
            disabled={loading}
            className="p-4 mt-4 font-bold text-white bg-gray-900 rounded shadow-lg"
          >
            {loading ? "Creating NFT..." : "Create NFT"}
          </button>
        </div>
      )}
    </div>
  );
}
