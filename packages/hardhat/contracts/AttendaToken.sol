// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title AttendaToken
 * @dev ERC20 token for the Attenda MVP system
 * This token will be used for rewards and payments in the attention economy
 */
contract AttendaToken is ERC20, Ownable {
    uint256 public constant INITIAL_SUPPLY = 1_000_000 * 10**18; // 1 million tokens
    uint256 public constant MAX_TEST_MINT = 1000 * 10**18; // 1000 tokens max for testing
    
    constructor() ERC20("Attenda Token", "ATT") Ownable() {
        _mint(msg.sender, INITIAL_SUPPLY);
    }
    
    /**
     * @dev Mint new tokens (only owner)
     * @param to Address to mint tokens to
     * @param amount Amount of tokens to mint
     */
    function mint(address to, uint256 amount) public onlyOwner {
        _mint(to, amount);
    }
    
    /**
     * @dev Public minting for testing purposes (anyone can call)
     * @param amount Amount of tokens to mint (max 1000 for testing)
     */
    function mintForTesting(uint256 amount) public {
        require(amount <= MAX_TEST_MINT, "Amount exceeds max test mint");
        require(balanceOf(msg.sender) == 0, "Already has tokens");
        _mint(msg.sender, amount);
    }
    
    /**
     * @dev Burn tokens from caller's account
     * @param amount Amount of tokens to burn
     */
    function burn(uint256 amount) public {
        _burn(msg.sender, amount);
    }
    
    /**
     * @dev Burn tokens from a specific account (only owner)
     * @param from Address to burn tokens from
     * @param amount Amount of tokens to burn
     */
    function burnFrom(address from, uint256 amount) public onlyOwner {
        _burn(from, amount);
    }
} 