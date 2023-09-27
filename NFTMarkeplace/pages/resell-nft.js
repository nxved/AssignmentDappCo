import { useEffect, useState } from "react";
import { ethers } from "ethers";
import { useRouter } from "next/router";
import axios from "axios";
import { NFTMarketplace, chainConfig } from "../config.js";
import {
  useWalletUpdate,
  useWallet,
  useNFTMarketContract,
} from "../context/WalletContext.js";
import { toast } from "react-toastify";
import { Biconomy } from "@biconomy/mexa";

export default function ResellNFT() {
  const [formInput, updateFormInput] = useState({ price: "", image: "" });
  const router = useRouter();
  const { id, tokenURI } = router.query;
  const { image, price } = formInput;
  const walletToggle = useWalletUpdate();
  const walletState = useWallet();
  const NFTcontract = useNFTMarketContract();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchNFT();
  }, [id]);

  async function fetchNFT() {
    if (!tokenURI) return;
    const meta = await axios.get(tokenURI);
    updateFormInput((state) => ({ ...state, image: meta.data.image }));
  }

  async function listNFTForSale() {
    if (!price) {
      toast.error("Enter Price");
      return;
    }
    setLoading(true);
    const priceFormatted = ethers.utils.parseUnits(
      formInput.price.toString(),
      "ether"
    );
    const priceString = priceFormatted.toString();
   //  if (typeof window.ethereum !== "undefined") {
   //    console.log("1");
   //    const biconomy = new Biconomy(window.ethereum, {
   //      apiKey: "UBh3_aHZV.1c752e3a-7c2b-439c-939d-95bbc4ec3e06",
   //      debug: true,
   //      contractAddresses: NFTMarketplace.address,
   //    });
   //    console.log(biconomy);
   //    console.log("2");

   //    const provider = await biconomy.provider;

   //    const contractInstance = new ethers.Contract(
   //      NFTMarketplace.address,
   //      NFTMarketplace.abi,
   //      biconomy.ethersProvider
   //    );
   //    console.log(contractInstance);
   //    await biconomy.init();
   //    console.log("3");

   //    const { data } = await contractInstance.populateTransaction.list(
   //      id.toString(),
   //      priceString
   //    );
   //    console.log(data);

   //    let txParams = {
   //      data: data,
   //      to: NFTMarketplace.address,
   //      from: walletState,
   //      signatureType: "EIP712_SIGN",
   //    };
   //    console.log("4");

   //    await provider
   //      .send("eth_sendTransaction", [txParams])
   //      .then(async (tx) => {
   //        console.log(tx);
   //        if (tx.status === 1) {
   //          console.log("Transaction successful:", tx);
   //          toast.success("Successfully Listed NFT");
   //        } else {
   //          console.error("Transaction failed:", tx);
   //          toast.error("Transaction failed. Please try again.");
   //        }
   //      })
   //      .catch((err) => {
   //        console.log(err);
   //        toast.error("Error in Listing");
   //      });
   //    console.log("5");
   //  }
try {
     let transaction = await NFTcontract.list(id.toString(), priceString);
     await transaction
       .wait()
       .then(async (tx) => {
         console.log(tx);
         if (tx.status === 1) {
           console.log("Transaction successful:", tx);
           toast.success("Successfully Listed NFT");
           router.push("/");
           setLoading(false);
         } else {
           console.error("Transaction failed:", tx);
           toast.error("Transaction failed. Please try again.");
           setLoading(false);
         }
       })
       .catch((err) => {
         console.log(err);
         toast.error("Error in Listing");
         setLoading(false);
       });
      } catch (error) {
         toast.error("User Rejected Transaction");
         setLoading(false);
      }
    setLoading(false);
  }

  return (
    <div className="flex justify-center">
      {!walletState ? (
        <button
          onClick={walletToggle}
          className="block px-8 py-4 mx-auto mt-40 font-semibold text-white bg-gray-900 rounded-lg hover:bg-gray-700"
        >
          Connect your wallet
        </button>
      ) : (
        <div className="flex flex-col w-1/2 pb-12">
          <input
            placeholder="Asset Price in Eth"
            className="p-4 mt-2 border rounded"
            onChange={(e) =>
              updateFormInput({ ...formInput, price: e.target.value })
            }
          />
          {image && <img className="mt-4 rounded" width="350" src={image} />}
          <button
            onClick={listNFTForSale}
            disabled={loading}
            className="p-4 mt-4 font-bold text-white bg-gray-500 rounded shadow-lg"
          >
            {loading ? "Listing..." : "List NFT"}
          </button>
        </div>
      )}
    </div>
  );
}
