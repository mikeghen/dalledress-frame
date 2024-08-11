// SPDX-License-Identifier: MIT
// Compatible with OpenZeppelin Contracts ^5.0.0
pragma solidity ^0.8.20;

import "@openzeppelin/contracts@5.0.2/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts@5.0.2/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts@5.0.2/token/ERC721/extensions/ERC721Pausable.sol";
import "@openzeppelin/contracts@5.0.2/access/Ownable.sol";

contract DalleDressV1 is ERC721, ERC721URIStorage, ERC721Pausable, Ownable {
    uint256 mintCost = 0.005 ether;
    uint256 tokenId = 0;

    constructor(address initialOwner)
        ERC721("DalleDressV1", "DD")
        Ownable(initialOwner)
    {}

    function _baseURI() internal pure override returns (string memory) {
        return "http://192.34.63.136:8080/dalle/simple/";
    }

    function pause() public onlyOwner {
        _pause();
    }

    function unpause() public onlyOwner {
        _unpause();
    }

    function safeMint(address to, string memory uri)
        public
        payable
    {
        tokenId = tokenId + 1;
        require(msg.value == mintCost, "No enough ETH");
        bool sent = payable(owner()).send(msg.value);
        require(sent, "Failed to send Ether");

        _safeMint(to, tokenId);
        _setTokenURI(tokenId, uri);
    }

    // The following functions are overrides required by Solidity.

    function _update(address to, uint256 tokenId, address auth)
        internal
        override(ERC721, ERC721Pausable)
        returns (address)
    {
        return super._update(to, tokenId, auth);
    }

    function tokenURI(uint256 tokenId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (string memory)
    {
        return super.tokenURI(tokenId);
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}
