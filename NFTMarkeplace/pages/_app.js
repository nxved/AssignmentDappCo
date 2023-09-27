import "../styles/globals.css";
import Link from "next/link";
import WalletProvider from "../context/WalletContext";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";


function MyApp({ Component, pageProps }) {

  return (
    <div>
      <WalletProvider>
        <nav className="p-6 bg-gray-100 border-b">
          <p className="text-4xl font-bold text-yellow-9000">NFT Marketplace</p>
          <div className="flex mt-4">
            <Link href="/" className="mr-4 text-gray-900 border-b">
              Home
            </Link>
            <Link href="/create-nft" className="mr-6 text-gray-900 border-b">
              Create NFT
            </Link>
            <Link href="/my-nfts" className="mr-6 text-gray-900 border-b">
              My NFTs
            </Link>
            {/* <button
              className="block px-4 py-2 font-semibold text-white bg-gray-900 rounded-lg hover:bg-gray-700"
              onClick={walletToggle}
              // disabled={walletState}
            >
             {walletState? "Wallet Connected" : "Connect Wallet" }
            </button> */}
          </div>
        </nav>
        <Component {...pageProps} />
        <ToastContainer position="bottom-right" theme="dark" />
      </WalletProvider>
    </div>
  );
}

export default MyApp;
