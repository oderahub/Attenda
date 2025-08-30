// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "./AttendaToken.sol";

/**
 * @title CampaignManager
 * @dev Manages advertising campaigns and proof-of-attention verification
 */
contract CampaignManager is Ownable, ReentrancyGuard {
    using Counters for Counters.Counter;
    
    AttendaToken public attendaToken;
    
    struct Campaign {
        uint256 id;
        address advertiser;
        string title;
        string description;
        string ipfsHash;
        uint256 rewardAmount;
        uint256 maxParticipants;
        uint256 currentParticipants;
        uint256 duration;
        uint256 startTime;
        uint256 endTime;
        bool isActive;
        bool isCompleted;
    }
    
    struct ProofOfAttention {
        uint256 campaignId;
        address user;
        uint256 watchTime;
        uint256 timestamp;
        bool isVerified;
        bool isRewarded;
    }
    
    Counters.Counter private _campaignIds;
    Counters.Counter private _proofIds;
    
    mapping(uint256 => Campaign) public campaigns;
    mapping(uint256 => ProofOfAttention) public proofs;
    mapping(uint256 => mapping(address => bool)) public userParticipated;
    mapping(uint256 => address[]) public campaignParticipants;
    
    uint256 public platformFee = 500; // 5% (500 basis points)
    uint256 public constant BASIS_POINTS = 10000;
    
    event CampaignCreated(uint256 indexed campaignId, address indexed advertiser, string title, uint256 rewardAmount);
    event CampaignActivated(uint256 indexed campaignId);
    event CampaignCompleted(uint256 indexed campaignId);
    event ProofSubmitted(uint256 indexed proofId, uint256 indexed campaignId, address indexed user);
    event ProofVerified(uint256 indexed proofId, uint256 indexed campaignId, address indexed user);
    event RewardDistributed(uint256 indexed campaignId, address indexed user, uint256 amount);
    event PlatformFeeUpdated(uint256 newFee);
    
    modifier campaignExists(uint256 campaignId) {
        require(campaigns[campaignId].id != 0, "Campaign does not exist");
        _;
    }
    
    modifier onlyAdvertiser(uint256 campaignId) {
        require(campaigns[campaignId].advertiser == msg.sender, "Only advertiser can call this");
        _;
    }
    
    modifier campaignActive(uint256 campaignId) {
        require(campaigns[campaignId].isActive, "Campaign is not active");
        require(block.timestamp >= campaigns[campaignId].startTime, "Campaign has not started");
        require(block.timestamp <= campaigns[campaignId].endTime, "Campaign has ended");
        _;
    }
    
    constructor(address _attendaToken) Ownable() {
        attendaToken = AttendaToken(_attendaToken);
    }
    
    /**
     * @dev Create a new advertising campaign
     */
    function createCampaign(
        string memory title,
        string memory description,
        string memory ipfsHash,
        uint256 rewardAmount,
        uint256 maxParticipants,
        uint256 duration
    ) external nonReentrant returns (uint256) {
        require(bytes(title).length > 0, "Title cannot be empty");
        require(bytes(description).length > 0, "Description cannot be empty");
        require(bytes(ipfsHash).length > 0, "IPFS hash cannot be empty");
        require(rewardAmount > 0, "Reward amount must be greater than 0");
        require(maxParticipants > 0, "Max participants must be greater than 0");
        require(duration > 0, "Duration must be greater than 0");
        
        // Check if advertiser has enough tokens
        uint256 totalRequired = rewardAmount * maxParticipants;
        require(attendaToken.balanceOf(msg.sender) >= totalRequired, "Insufficient token balance");
        
        // Transfer tokens to contract
        require(attendaToken.transferFrom(msg.sender, address(this), totalRequired), "Token transfer failed");
        
        _campaignIds.increment();
        uint256 campaignId = _campaignIds.current();
        
        campaigns[campaignId] = Campaign({
            id: campaignId,
            advertiser: msg.sender,
            title: title,
            description: description,
            ipfsHash: ipfsHash,
            rewardAmount: rewardAmount,
            maxParticipants: maxParticipants,
            currentParticipants: 0,
            duration: duration,
            startTime: block.timestamp,
            endTime: block.timestamp + duration,
            isActive: true,
            isCompleted: false
        });
        
        emit CampaignCreated(campaignId, msg.sender, title, rewardAmount);
        return campaignId;
    }
    
    /**
     * @dev Submit proof of attention for a campaign
     */
    function submitProof(
        uint256 campaignId,
        uint256 watchTime
    ) external campaignExists(campaignId) campaignActive(campaignId) nonReentrant {
        require(!userParticipated[campaignId][msg.sender], "User already participated");
        require(campaigns[campaignId].currentParticipants < campaigns[campaignId].maxParticipants, "Campaign is full");
        require(watchTime >= campaigns[campaignId].duration, "Watch time must be at least campaign duration");
        
        _proofIds.increment();
        uint256 proofId = _proofIds.current();
        
        proofs[proofId] = ProofOfAttention({
            campaignId: campaignId,
            user: msg.sender,
            watchTime: watchTime,
            timestamp: block.timestamp,
            isVerified: false,
            isRewarded: false
        });
        
        userParticipated[campaignId][msg.sender] = true;
        campaignParticipants[campaignId].push(msg.sender);
        campaigns[campaignId].currentParticipants++;
        
        emit ProofSubmitted(proofId, campaignId, msg.sender);
    }
    
    /**
     * @dev Verify proof of attention (only advertiser)
     */
    function verifyProof(uint256 proofId) external nonReentrant {
        require(proofs[proofId].campaignId != 0, "Proof does not exist");
        require(!proofs[proofId].isVerified, "Proof already verified");
        require(!proofs[proofId].isRewarded, "Proof already rewarded");
        
        uint256 campaignId = proofs[proofId].campaignId;
        require(campaigns[campaignId].advertiser == msg.sender, "Only advertiser can verify");
        
        proofs[proofId].isVerified = true;
        
        emit ProofVerified(proofId, campaignId, proofs[proofId].user);
    }
    
    /**
     * @dev Distribute rewards for verified proofs
     */
    function distributeRewards(uint256 proofId) external nonReentrant {
        require(proofs[proofId].isVerified, "Proof must be verified first");
        require(!proofs[proofId].isRewarded, "Rewards already distributed");
        
        uint256 campaignId = proofs[proofId].campaignId;
        require(campaigns[campaignId].advertiser == msg.sender, "Only advertiser can distribute rewards");
        
        uint256 rewardAmount = campaigns[campaignId].rewardAmount;
        address user = proofs[proofId].user;
        
        // Calculate platform fee
        uint256 platformFeeAmount = (rewardAmount * platformFee) / BASIS_POINTS;
        uint256 userReward = rewardAmount - platformFeeAmount;
        
        // Transfer reward to user
        require(attendaToken.transfer(user, userReward), "Reward transfer failed");
        
        // Transfer platform fee to owner
        if (platformFeeAmount > 0) {
            require(attendaToken.transfer(owner(), platformFeeAmount), "Platform fee transfer failed");
        }
        
        proofs[proofId].isRewarded = true;
        
        emit RewardDistributed(campaignId, user, userReward);
    }
    
    /**
     * @dev Complete a campaign (only advertiser)
     */
    function completeCampaign(uint256 campaignId) external campaignExists(campaignId) onlyAdvertiser(campaignId) {
        require(campaigns[campaignId].isActive, "Campaign is already inactive");
        require(block.timestamp > campaigns[campaignId].endTime, "Campaign has not ended yet");
        
        campaigns[campaignId].isActive = false;
        campaigns[campaignId].isCompleted = true;
        
        // Refund unused tokens to advertiser
        uint256 unusedTokens = campaigns[campaignId].rewardAmount * 
            (campaigns[campaignId].maxParticipants - campaigns[campaignId].currentParticipants);
        
        if (unusedTokens > 0) {
            require(attendaToken.transfer(msg.sender, unusedTokens), "Refund transfer failed");
        }
        
        emit CampaignCompleted(campaignId);
    }
    
    /**
     * @dev Get campaign details
     */
    function getCampaign(uint256 campaignId) external view returns (Campaign memory) {
        return campaigns[campaignId];
    }
    
    /**
     * @dev Get proof details
     */
    function getProof(uint256 proofId) external view returns (ProofOfAttention memory) {
        return proofs[proofId];
    }
    
    /**
     * @dev Get campaign participants
     */
    function getCampaignParticipants(uint256 campaignId) external view returns (address[] memory) {
        return campaignParticipants[campaignId];
    }
    
    /**
     * @dev Check if user participated in campaign
     */
    function hasUserParticipated(uint256 campaignId, address user) external view returns (bool) {
        return userParticipated[campaignId][user];
    }
    
    /**
     * @dev Update platform fee (only owner)
     */
    function updatePlatformFee(uint256 newFee) external onlyOwner {
        require(newFee <= 2000, "Platform fee cannot exceed 20%");
        platformFee = newFee;
        emit PlatformFeeUpdated(newFee);
    }
    
    /**
     * @dev Get total campaigns count
     */
    function getTotalCampaigns() external view returns (uint256) {
        return _campaignIds.current();
    }
    
    /**
     * @dev Get total proofs count
     */
    function getTotalProofs() external view returns (uint256) {
        return _proofIds.current();
    }
    
    /**
     * @dev Emergency pause for all campaigns (only owner)
     */
    function emergencyPause() external onlyOwner {
        for (uint256 i = 1; i <= _campaignIds.current(); i++) {
            if (campaigns[i].isActive) {
                campaigns[i].isActive = false;
            }
        }
    }
} 