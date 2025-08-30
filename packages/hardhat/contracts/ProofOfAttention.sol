// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "./AttendaToken.sol";

/**
 * @title ProofOfAttention
 * @dev Handles verification and validation of user attention to advertisements
 */
contract ProofOfAttention is Ownable, ReentrancyGuard {
    using Counters for Counters.Counter;
    
    AttendaToken public attendaToken;
    
    struct AttentionProof {
        uint256 id;
        address user;
        uint256 campaignId;
        uint256 watchDuration;
        uint256 timestamp;
        string ipfsProofHash;
        bool isValidated;
        bool isRewarded;
        uint256 rewardAmount;
    }
    
    struct ValidationCriteria {
        uint256 minWatchDuration;
        uint256 maxWatchDuration;
        bool requireInteraction;
        bool requireScrollDepth;
        uint256 minScrollDepth;
    }
    
    Counters.Counter private _proofIds;
    
    mapping(uint256 => AttentionProof) public proofs;
    mapping(uint256 => ValidationCriteria) public campaignValidationCriteria;
    mapping(uint256 => mapping(address => bool)) public userProofSubmitted;
    mapping(uint256 => address[]) public campaignProofs;
    
    uint256 public validationThreshold = 3; // Number of validators required
    mapping(address => bool) public validators;
    mapping(uint256 => mapping(address => bool)) public proofValidations;
    mapping(uint256 => uint256) public proofValidationCount;
    
    event ProofSubmitted(uint256 indexed proofId, uint256 indexed campaignId, address indexed user);
    event ProofValidated(uint256 indexed proofId, address indexed validator);
    event ProofRejected(uint256 indexed proofId, address indexed validator, string reason);
    event RewardDistributed(uint256 indexed proofId, address indexed user, uint256 amount);
    event ValidatorAdded(address indexed validator);
    event ValidatorRemoved(address indexed validator);
    event ValidationCriteriaUpdated(uint256 indexed campaignId);
    
    modifier onlyValidator() {
        require(validators[msg.sender], "Only validators can call this");
        _;
    }
    
    modifier proofExists(uint256 proofId) {
        require(proofs[proofId].id != 0, "Proof does not exist");
        _;
    }
    
    modifier proofNotValidated(uint256 proofId) {
        require(!proofs[proofId].isValidated, "Proof already validated");
        _;
    }
    
    constructor(address _attendaToken) Ownable() {
        attendaToken = AttendaToken(_attendaToken);
        validators[msg.sender] = true; // Owner is initial validator
    }
    
    /**
     * @dev Submit proof of attention for a campaign
     */
    function submitProof(
        uint256 campaignId,
        uint256 watchDuration,
        string memory ipfsProofHash
    ) external nonReentrant returns (uint256) {
        require(bytes(ipfsProofHash).length > 0, "IPFS proof hash cannot be empty");
        require(watchDuration > 0, "Watch duration must be greater than 0");
        require(!userProofSubmitted[campaignId][msg.sender], "Proof already submitted for this campaign");
        
        // Validate against campaign criteria
        ValidationCriteria memory criteria = campaignValidationCriteria[campaignId];
        if (criteria.minWatchDuration > 0) {
            require(watchDuration >= criteria.minWatchDuration, "Watch duration too short");
        }
        if (criteria.maxWatchDuration > 0) {
            require(watchDuration <= criteria.maxWatchDuration, "Watch duration too long");
        }
        
        _proofIds.increment();
        uint256 proofId = _proofIds.current();
        
        proofs[proofId] = AttentionProof({
            id: proofId,
            user: msg.sender,
            campaignId: campaignId,
            watchDuration: watchDuration,
            timestamp: block.timestamp,
            ipfsProofHash: ipfsProofHash,
            isValidated: false,
            isRewarded: false,
            rewardAmount: 0
        });
        
        userProofSubmitted[campaignId][msg.sender] = true;
        campaignProofs[campaignId].push(msg.sender);
        
        emit ProofSubmitted(proofId, campaignId, msg.sender);
        return proofId;
    }
    
    /**
     * @dev Validate a proof of attention (only validators)
     */
    function validateProof(uint256 proofId) external onlyValidator proofExists(proofId) proofNotValidated(proofId) {
        require(!proofValidations[proofId][msg.sender], "Already validated this proof");
        
        AttentionProof storage proof = proofs[proofId];
        ValidationCriteria memory criteria = campaignValidationCriteria[proof.campaignId];
        
        // Basic validation logic
        bool isValid = true;
        string memory reason = "";
        
        if (criteria.minWatchDuration > 0 && proof.watchDuration < criteria.minWatchDuration) {
            isValid = false;
            reason = "Watch duration too short";
        }
        
        if (criteria.maxWatchDuration > 0 && proof.watchDuration > criteria.maxWatchDuration) {
            isValid = false;
            reason = "Watch duration too long";
        }
        
        // Additional validation can be added here (interaction checks, scroll depth, etc.)
        
        if (isValid) {
            proofValidations[proofId][msg.sender] = true;
            proofValidationCount[proofId]++;
            
            emit ProofValidated(proofId, msg.sender);
            
            // Check if enough validations reached
            if (proofValidationCount[proofId] >= validationThreshold) {
                proof.isValidated = true;
                // Calculate reward based on watch duration and campaign criteria
                proof.rewardAmount = calculateReward(proof.watchDuration, proof.campaignId);
            }
        } else {
            emit ProofRejected(proofId, msg.sender, reason);
        }
    }
    
    /**
     * @dev Distribute rewards for validated proofs
     */
    function distributeReward(uint256 proofId) external nonReentrant proofExists(proofId) {
        AttentionProof storage proof = proofs[proofId];
        require(proof.isValidated, "Proof must be validated first");
        require(!proof.isRewarded, "Reward already distributed");
        require(proof.rewardAmount > 0, "No reward to distribute");
        
        // Transfer tokens to user
        require(attendaToken.transfer(proof.user, proof.rewardAmount), "Reward transfer failed");
        
        proof.isRewarded = true;
        
        emit RewardDistributed(proofId, proof.user, proof.rewardAmount);
    }
    
    /**
     * @dev Set validation criteria for a campaign
     */
    function setValidationCriteria(
        uint256 campaignId,
        uint256 minWatchDuration,
        uint256 maxWatchDuration,
        bool requireInteraction,
        bool requireScrollDepth,
        uint256 minScrollDepth
    ) external onlyOwner {
        campaignValidationCriteria[campaignId] = ValidationCriteria({
            minWatchDuration: minWatchDuration,
            maxWatchDuration: maxWatchDuration,
            requireInteraction: requireInteraction,
            requireScrollDepth: requireScrollDepth,
            minScrollDepth: minScrollDepth
        });
        
        emit ValidationCriteriaUpdated(campaignId);
    }
    
    /**
     * @dev Add a new validator
     */
    function addValidator(address validator) external onlyOwner {
        require(validator != address(0), "Invalid validator address");
        require(!validators[validator], "Already a validator");
        
        validators[validator] = true;
        emit ValidatorAdded(validator);
    }
    
    /**
     * @dev Remove a validator
     */
    function removeValidator(address validator) external onlyOwner {
        require(validators[validator], "Not a validator");
        require(validator != owner(), "Cannot remove owner as validator");
        
        validators[validator] = false;
        emit ValidatorRemoved(validator);
    }
    
    /**
     * @dev Update validation threshold
     */
    function updateValidationThreshold(uint256 newThreshold) external onlyOwner {
        require(newThreshold > 0, "Threshold must be greater than 0");
        validationThreshold = newThreshold;
    }
    
    /**
     * @dev Calculate reward based on watch duration and campaign criteria
     */
    function calculateReward(uint256 watchDuration, uint256 /* campaignId */) internal pure returns (uint256) {
        // Base reward calculation - can be customized per campaign
        uint256 baseReward = 100 * 10**18; // 100 ATT base reward
        
        // Bonus for longer watch duration (up to 2x)
        uint256 durationBonus = 10; // Base multiplier
        if (watchDuration > 300) { // 5 minutes
            durationBonus = 20; // 2x
        } else if (watchDuration > 180) { // 3 minutes
            durationBonus = 15; // 1.5x
        }
        
        return (baseReward * durationBonus) / 10;
    }
    
    /**
     * @dev Get proof details
     */
    function getProof(uint256 proofId) external view returns (AttentionProof memory) {
        return proofs[proofId];
    }
    
    /**
     * @dev Get validation criteria for a campaign
     */
    function getValidationCriteria(uint256 campaignId) external view returns (ValidationCriteria memory) {
        return campaignValidationCriteria[campaignId];
    }
    
    /**
     * @dev Get campaign proofs
     */
    function getCampaignProofs(uint256 campaignId) external view returns (address[] memory) {
        return campaignProofs[campaignId];
    }
    
    /**
     * @dev Check if user has submitted proof for campaign
     */
    function hasUserSubmittedProof(uint256 campaignId, address user) external view returns (bool) {
        return userProofSubmitted[campaignId][user];
    }
    
    /**
     * @dev Get proof validation count
     */
    function getProofValidationCount(uint256 proofId) external view returns (uint256) {
        return proofValidationCount[proofId];
    }
    
    /**
     * @dev Check if proof is validated by specific validator
     */
    function isProofValidatedBy(uint256 proofId, address validator) external view returns (bool) {
        return proofValidations[proofId][validator];
    }
    
    /**
     * @dev Get total proofs count
     */
    function getTotalProofs() external view returns (uint256) {
        return _proofIds.current();
    }
    
    /**
     * @dev Check if address is validator
     */
    function isValidator(address validator) external view returns (bool) {
        return validators[validator];
    }
    
    /**
     * @dev Emergency pause for all validations (only owner)
     */
    function emergencyPause() external onlyOwner {
        for (uint256 i = 1; i <= _proofIds.current(); i++) {
            if (proofs[i].isValidated && !proofs[i].isRewarded) {
                proofs[i].isValidated = false;
            }
        }
    }
} 