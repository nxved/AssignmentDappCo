// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/metatx/ERC2771Context.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";

/**
 * @title NFTMarketplace
 * @dev A contract for managing NFTs in a marketplace
 */
contract NFTMarketplace is
    ERC721,
    ERC2771Context,
    ERC721URIStorage,
    ReentrancyGuard,
    Ownable
{
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;

    struct NFT {
        uint256 id;
        string name;
        address payable owner;
        uint256 price;
        bool forSale;
    }

    mapping(uint256 => NFT) public nfts;

    mapping(address => uint256[]) public nftOwners;

    event Minted(
        address indexed owner,
        uint256 indexed id,
        string name,
        string tokenURI
    );

    event Listed(address indexed owner, uint256 indexed id, uint256 price);

    event Sold(
        address indexed buyer,
        address indexed seller,
        uint256 indexed id,
        uint256 price
    );

    /**
     * @dev Constructor for the NFTMarketplace contract
     */
    constructor()
        ERC721("NFTMarketplace", "NFT")
        ERC2771Context(0x69015912AA33720b842dCD6aC059Ed623F28d9f7)
    {
        //  trustedForwarder = 0x69015912AA33720b842dCD6aC059Ed623F28d9f7;
    }

    modifier onlyOwnerOf(uint256 id) {
        require(
            _msgSender() == nfts[id].owner,
            "Only owner can call this function"
        );
        _;
    }

    modifier nftExists(uint256 id) {
        require(_exists(id), "NFT does not exist");
        _;
    }

    modifier forSale(uint256 id) {
        require(nfts[id].forSale, "NFT is not for sale");
        _;
    }

    modifier validPrice(uint256 id) {
        require(
            msg.value >= nfts[id].price,
            "Insufficient funds to purchase the NFT"
        );
        _;
    }

    /**
     * @dev Mint a new NFT by providing a name and a token URI
     * @param name The name of the NFT
     * @param _tokenURI The URI pointing to the NFT's metadata
     * @return The minted token ID
     */
    function mint(
        string memory name,
        string memory _tokenURI
    ) public returns (uint256) {
        require(bytes(name).length > 0, "Name can't be empty");
        require(bytes(_tokenURI).length > 0, "Token URI can't be empty");
        _tokenIds.increment();
        uint256 id = _tokenIds.current();
        _safeMint(_msgSender(), id);
        _setTokenURI(id, _tokenURI);
        nfts[id] = NFT(id, name, payable(_msgSender()), 0, false);
        nftOwners[_msgSender()].push(id);
        emit Minted(_msgSender(), id, name, _tokenURI);
        return id;
    }

    /**
     * @dev List an NFT for sale with an asking price
     * @param id The ID of the NFT to be listed
     * @param price The price at which to list the NFT
     */
    function list(
        uint256 id,
        uint256 price
    ) public onlyOwnerOf(id) nftExists(id) {
        require(price > 0, "Price must be greater than zero");
        nfts[id].price = price;
        nfts[id].forSale = true;
        emit Listed(_msgSender(), id, price);
    }

    /**
     * @dev Purchase a listed NFT using Ether
     * @param id The ID of the NFT to be purchased
     */
    function buy(
        uint256 id
    ) public payable nonReentrant forSale(id) nftExists(id) validPrice(id) {
        address buyer = _msgSender();
        address payable seller = nfts[id].owner;
        uint256 price = nfts[id].price;
        _transfer(seller, buyer, id);
        seller.transfer(price);
        nfts[id].owner = payable(buyer);
        nfts[id].forSale = false;
        for (uint256 i = 0; i < nftOwners[seller].length; i++) {
            if (nftOwners[seller][i] == id) {
                nftOwners[seller][i] = nftOwners[seller][
                    nftOwners[seller].length - 1
                ];
                nftOwners[seller].pop();
                break;
            }
        }
        nftOwners[buyer].push(id);
        emit Sold(buyer, seller, id, price);
    }

    /**
     * @dev View all NFTs listed for sale
     * @return array of NFTs available for sale
     */
    function viewAll() public view returns (NFT[] memory) {
        uint256 counter = 0;
        for (uint256 i = 1; i <= _tokenIds.current(); i++) {
            if (nfts[i].forSale) {
                counter++;
            }
        }
        NFT[] memory nftsForSale = new NFT[](counter);
        uint256 index = 0;
        for (uint256 i = 1; i <= _tokenIds.current(); i++) {
            if (nfts[i].forSale) {
                nftsForSale[index] = nfts[i];
                index++;
            }
        }
        return nftsForSale;
    }

    /**
     * @dev View NFTs owned by a specific user
     * @param owner The address of the user whose NFTs are to be viewed
     * @return array of NFTs owned by the user
     */
    function viewOwned(address owner) public view returns (NFT[] memory) {
        NFT[] memory ownedNFTs = new NFT[](nftOwners[owner].length);
        for (uint256 i = 0; i < nftOwners[owner].length; i++) {
            ownedNFTs[i] = nfts[nftOwners[owner][i]];
        }
        return ownedNFTs;
    }

    function _msgData()
        internal
        view
        override(Context, ERC2771Context)
        returns (bytes calldata)
    {
        return ERC2771Context._msgData();
    }

    function _msgSender()
        internal
        view
        override(Context, ERC2771Context)
        returns (address)
    {
        return ERC2771Context._msgSender();
    }

    function _burn(
        uint256 tokenId
    ) internal override(ERC721, ERC721URIStorage) {
        super._burn(tokenId);
    }

    function tokenURI(
        uint256 tokenId
    ) public view override(ERC721, ERC721URIStorage) returns (string memory) {
        return super.tokenURI(tokenId);
    }

    function supportsInterface(
        bytes4 interfaceId
    ) public view override(ERC721, ERC721URIStorage) returns (bool) {
        return super.supportsInterface(interfaceId);
    }
}
