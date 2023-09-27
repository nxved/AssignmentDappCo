import { ethers } from "ethers";
const {NFTMarketplaceABI}  = require("./contracts/abi.json")

const ChainConfig = {
    polygon: {
        testnet: {
            ChainConfig: {
                chainId: "0x13881",
                chainName: "MaticMumbai",
                nativeCurrency: {
                    name: "MATIC",
                    symbol: "MATIC",
                    decimals: 18,
                },
                rpcUrls: ["https://still-aged-spring.matic-testnet.discover.quiknode.pro/77682de06006d7bd05393030568727847824a95e/"],
                blockExplorerURL: ["https://mumbai.polygonscan.com/"],
            },
            NFTMarketplace: {
                address: ethers.utils.getAddress("0x86E12C578eF347a1F77dDf287d771E4735aBf744"),
                abi: NFTMarketplaceABI,
            },
            // metadataURL: "https://api.testnet.undergroundwaifus.com/metadata/"
        },
    },
};

export const config = ChainConfig.polygon.testnet;
export const blockExplorerURL = config.ChainConfig.blockExplorerURL;

export const chainConfig = config.ChainConfig;
export const NFTMarketplace = config.NFTMarketplace;

