import { expect } from "chai";
import { ethers } from "hardhat";
import { ContractFactory } from "ethers";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";

describe("ProofOfAttention", function () {
  let AttendaToken: ContractFactory;
  let ProofOfAttention: ContractFactory;
  let attendaToken: any;
  let proofOfAttention: any;
  let owner: HardhatEthersSigner;
  let validator1: HardhatEthersSigner;
  let validator2: HardhatEthersSigner;
  let user1: HardhatEthersSigner;
  let user2: HardhatEthersSigner;
  let user3: HardhatEthersSigner;

  const CAMPAIGN_ID = 1;
  const WATCH_DURATION = 300; // 5 minutes
  const IPFS_PROOF_HASH = "QmProofHash123";

  beforeEach(async function () {
    // Get signers
    [owner, validator1, validator2, user1, user2, user3] = await ethers.getSigners();

    // Deploy AttendaToken
    AttendaToken = await ethers.getContractFactory("AttendaToken");
    attendaToken = await AttendaToken.deploy();
    await attendaToken.waitForDeployment();

    // Deploy ProofOfAttention
    ProofOfAttention = await ethers.getContractFactory("ProofOfAttention");
    proofOfAttention = await ProofOfAttention.deploy(await attendaToken.getAddress());
    await proofOfAttention.waitForDeployment();

    // Add additional validators
    await proofOfAttention.addValidator(validator1.address);
    await proofOfAttention.addValidator(validator2.address);

    // Transfer tokens to contract for rewards
    const rewardAmount = ethers.parseEther("10000"); // 10k tokens
    await attendaToken.transfer(await proofOfAttention.getAddress(), rewardAmount);
  });

  describe("Deployment", function () {
    it("Should set the correct AttendaToken address", async function () {
      expect(await proofOfAttention.attendaToken()).to.equal(await attendaToken.getAddress());
    });

    it("Should set the correct owner", async function () {
      expect(await proofOfAttention.owner()).to.equal(owner.address);
    });

    it("Should set owner as initial validator", async function () {
      expect(await proofOfAttention.isValidator(owner.address)).to.be.true;
    });

    it("Should set the correct validation threshold", async function () {
      expect(await proofOfAttention.validationThreshold()).to.equal(3);
    });
  });

  describe("Validator Management", function () {
    it("Should add new validator successfully", async function () {
      const newValidator = user1.address;

      await proofOfAttention.addValidator(newValidator);

      expect(await proofOfAttention.isValidator(newValidator)).to.be.true;
    });

    it("Should emit ValidatorAdded event", async function () {
      const newValidator = user1.address;

      const tx = await proofOfAttention.addValidator(newValidator);
      const receipt = await tx.wait();
      const validatorAddedEvent = receipt?.logs.find((log: any) => log.fragment?.name === "ValidatorAdded");

      expect(validatorAddedEvent).to.not.be.undefined;
    });

    it("Should revert if non-owner tries to add validator", async function () {
      const newValidator = user1.address;

      await expect(proofOfAttention.connect(user2).addValidator(newValidator)).to.be.revertedWith(
        "Ownable: caller is not the owner",
      );
    });

    it("Should revert if adding zero address as validator", async function () {
      await expect(proofOfAttention.addValidator(ethers.ZeroAddress)).to.be.revertedWith("Invalid validator address");
    });

    it("Should revert if adding existing validator", async function () {
      const existingValidator = validator1.address;

      await expect(proofOfAttention.addValidator(existingValidator)).to.be.revertedWith("Already a validator");
    });

    it("Should remove validator successfully", async function () {
      const validatorToRemove = validator1.address;

      await proofOfAttention.removeValidator(validatorToRemove);

      expect(await proofOfAttention.isValidator(validatorToRemove)).to.be.false;
    });

    it("Should emit ValidatorRemoved event", async function () {
      const validatorToRemove = validator1.address;

      const tx = await proofOfAttention.removeValidator(validatorToRemove);
      const receipt = await tx.wait();
      const validatorRemovedEvent = receipt?.logs.find((log: any) => log.fragment?.name === "ValidatorRemoved");

      expect(validatorRemovedEvent).to.not.be.undefined;
    });

    it("Should revert if non-owner tries to remove validator", async function () {
      const validatorToRemove = validator1.address;

      await expect(proofOfAttention.connect(user2).removeValidator(validatorToRemove)).to.be.revertedWith(
        "Ownable: caller is not the owner",
      );
    });

    it("Should revert if removing non-validator", async function () {
      const nonValidator = user1.address;

      await expect(proofOfAttention.removeValidator(nonValidator)).to.be.revertedWith("Not a validator");
    });

    it("Should revert if trying to remove owner as validator", async function () {
      await expect(proofOfAttention.removeValidator(owner.address)).to.be.revertedWith(
        "Cannot remove owner as validator",
      );
    });

    it("Should update validation threshold successfully", async function () {
      const newThreshold = 5;

      await proofOfAttention.updateValidationThreshold(newThreshold);

      expect(await proofOfAttention.validationThreshold()).to.equal(newThreshold);
    });

    it("Should revert if non-owner tries to update threshold", async function () {
      const newThreshold = 5;

      await expect(proofOfAttention.connect(user1).updateValidationThreshold(newThreshold)).to.be.revertedWith(
        "Ownable: caller is not the owner",
      );
    });

    it("Should revert if setting zero threshold", async function () {
      await expect(proofOfAttention.updateValidationThreshold(0)).to.be.revertedWith(
        "Threshold must be greater than 0",
      );
    });
  });

  describe("Validation Criteria Management", function () {
    it("Should set validation criteria successfully", async function () {
      const minWatchDuration = 180; // 3 minutes
      const maxWatchDuration = 600; // 10 minutes
      const requireInteraction = true;
      const requireScrollDepth = true;
      const minScrollDepth = 50;

      const tx = await proofOfAttention.setValidationCriteria(
        CAMPAIGN_ID,
        minWatchDuration,
        maxWatchDuration,
        requireInteraction,
        requireScrollDepth,
        minScrollDepth,
      );

      const receipt = await tx.wait();
      const criteriaUpdatedEvent = receipt?.logs.find((log: any) => log.fragment?.name === "ValidationCriteriaUpdated");

      expect(criteriaUpdatedEvent).to.not.be.undefined;

      const criteria = await proofOfAttention.getValidationCriteria(CAMPAIGN_ID);
      expect(criteria.minWatchDuration).to.equal(minWatchDuration);
      expect(criteria.maxWatchDuration).to.equal(maxWatchDuration);
      expect(criteria.requireInteraction).to.equal(requireInteraction);
      expect(criteria.requireScrollDepth).to.equal(requireScrollDepth);
      expect(criteria.minScrollDepth).to.equal(minScrollDepth);
    });

    it("Should revert if non-owner tries to set criteria", async function () {
      await expect(
        proofOfAttention.connect(user1).setValidationCriteria(CAMPAIGN_ID, 180, 600, true, true, 50),
      ).to.be.revertedWith("Ownable: caller is not the owner");
    });
  });

  describe("Proof Submission", function () {
    it("Should submit proof successfully", async function () {
      const tx = await proofOfAttention.connect(user1).submitProof(CAMPAIGN_ID, WATCH_DURATION, IPFS_PROOF_HASH);

      const receipt = await tx.wait();
      const proofSubmittedEvent = receipt?.logs.find((log: any) => log.fragment?.name === "ProofSubmitted");

      expect(proofSubmittedEvent).to.not.be.undefined;

      const proof = await proofOfAttention.getProof(1);
      expect(proof.campaignId).to.equal(CAMPAIGN_ID);
      expect(proof.user).to.equal(user1.address);
      expect(proof.watchDuration).to.equal(WATCH_DURATION);
      expect(proof.ipfsProofHash).to.equal(IPFS_PROOF_HASH);
      expect(proof.isValidated).to.be.false;
      expect(proof.isRewarded).to.be.false;

      expect(await proofOfAttention.hasUserSubmittedProof(CAMPAIGN_ID, user1.address)).to.be.true;

      const participants = await proofOfAttention.getCampaignProofs(CAMPAIGN_ID);
      expect(participants).to.include(user1.address);
    });

    it("Should revert if IPFS proof hash is empty", async function () {
      await expect(proofOfAttention.connect(user1).submitProof(CAMPAIGN_ID, WATCH_DURATION, "")).to.be.revertedWith(
        "IPFS proof hash cannot be empty",
      );
    });

    it("Should revert if watch duration is zero", async function () {
      await expect(proofOfAttention.connect(user1).submitProof(CAMPAIGN_ID, 0, IPFS_PROOF_HASH)).to.be.revertedWith(
        "Watch duration must be greater than 0",
      );
    });

    it("Should revert if user already submitted proof for campaign", async function () {
      // Submit first proof
      await proofOfAttention.connect(user1).submitProof(CAMPAIGN_ID, WATCH_DURATION, IPFS_PROOF_HASH);

      // Try to submit again
      await expect(
        proofOfAttention.connect(user1).submitProof(CAMPAIGN_ID, WATCH_DURATION, "QmAnotherHash"),
      ).to.be.revertedWith("Proof already submitted for this campaign");
    });

    it("Should revert if watch duration is less than minimum criteria", async function () {
      // Set validation criteria
      await proofOfAttention.setValidationCriteria(CAMPAIGN_ID, 600, 0, false, false, 0); // 10 min minimum

      await expect(
        proofOfAttention.connect(user1).submitProof(CAMPAIGN_ID, WATCH_DURATION, IPFS_PROOF_HASH),
      ).to.be.revertedWith("Watch duration too short");
    });

    it("Should revert if watch duration is more than maximum criteria", async function () {
      // Set validation criteria
      await proofOfAttention.setValidationCriteria(CAMPAIGN_ID, 0, 120, false, false, 0); // 2 min maximum

      await expect(
        proofOfAttention.connect(user1).submitProof(CAMPAIGN_ID, WATCH_DURATION, IPFS_PROOF_HASH),
      ).to.be.revertedWith("Watch duration too long");
    });
  });

  describe("Proof Validation", function () {
    let proofId: number;

    beforeEach(async function () {
      // Submit a proof first
      const tx = await proofOfAttention.connect(user1).submitProof(CAMPAIGN_ID, WATCH_DURATION, IPFS_PROOF_HASH);
      const receipt = await tx.wait();
      const proofSubmittedEvent = receipt?.logs.find((log: any) => log.fragment?.name === "ProofSubmitted");
      proofId = proofSubmittedEvent?.args?.proofId || 1;
    });

    it("Should validate proof successfully", async function () {
      const tx = await proofOfAttention.connect(owner).validateProof(proofId);

      const receipt = await tx.wait();
      const proofValidatedEvent = receipt?.logs.find((log: any) => log.fragment?.name === "ProofValidated");

      expect(proofValidatedEvent).to.not.be.undefined;

      expect(await proofOfAttention.isProofValidatedBy(proofId, owner.address)).to.be.true;
      expect(await proofOfAttention.getProofValidationCount(proofId)).to.equal(1);
    });

    it("Should revert if proof does not exist", async function () {
      await expect(proofOfAttention.connect(owner).validateProof(999)).to.be.revertedWith("Proof does not exist");
    });

    it("Should revert if proof already validated", async function () {
      // Validate first time
      await proofOfAttention.connect(owner).validateProof(proofId);

      // Try to validate again
      await expect(proofOfAttention.connect(owner).validateProof(proofId)).to.be.revertedWith(
        "Already validated this proof",
      );
    });

    it("Should revert if called by non-validator", async function () {
      await expect(proofOfAttention.connect(user2).validateProof(proofId)).to.be.revertedWith(
        "Only validators can call this",
      );
    });

    it("Should reject proof if validation criteria not met", async function () {
      // Set strict validation criteria
      await proofOfAttention.setValidationCriteria(CAMPAIGN_ID, 600, 0, false, false, 0); // 10 min minimum

      const tx = await proofOfAttention.connect(owner).validateProof(proofId);

      const receipt = await tx.wait();
      const proofRejectedEvent = receipt?.logs.find((log: any) => log.fragment?.name === "ProofRejected");

      expect(proofRejectedEvent).to.not.be.undefined;
      expect(await proofOfAttention.getProofValidationCount(proofId)).to.equal(0);
    });

    it("Should mark proof as validated when threshold reached", async function () {
      // Validate with all three validators
      await proofOfAttention.connect(owner).validateProof(proofId);
      await proofOfAttention.connect(validator1).validateProof(proofId);
      await proofOfAttention.connect(validator2).validateProof(proofId);

      const proof = await proofOfAttention.getProof(proofId);
      expect(proof.isValidated).to.be.true;
      expect(proof.rewardAmount).to.be.gt(0);
    });
  });

  describe("Reward Distribution", function () {
    let proofId: number;

    beforeEach(async function () {
      // Submit and validate a proof
      const tx = await proofOfAttention.connect(user1).submitProof(CAMPAIGN_ID, WATCH_DURATION, IPFS_PROOF_HASH);
      const receipt = await tx.wait();
      const proofSubmittedEvent = receipt?.logs.find((log: any) => log.fragment?.name === "ProofSubmitted");
      proofId = proofSubmittedEvent?.args?.proofId || 1;

      // Validate with enough validators to reach threshold
      await proofOfAttention.connect(owner).validateProof(proofId);
      await proofOfAttention.connect(validator1).validateProof(proofId);
      await proofOfAttention.connect(validator2).validateProof(proofId);
    });

    it("Should distribute rewards successfully", async function () {
      const initialUserBalance = await attendaToken.balanceOf(user1.address);
      const initialContractBalance = await attendaToken.balanceOf(await proofOfAttention.getAddress());

      const proof = await proofOfAttention.getProof(proofId);
      const expectedReward = proof.rewardAmount;

      const tx = await proofOfAttention.connect(user1).distributeReward(proofId);

      const receipt = await tx.wait();
      const rewardDistributedEvent = receipt?.logs.find((log: any) => log.fragment?.name === "RewardDistributed");

      expect(rewardDistributedEvent).to.not.be.undefined;

      const updatedProof = await proofOfAttention.getProof(proofId);
      expect(updatedProof.isRewarded).to.be.true;

      // Check token transfers
      expect(await attendaToken.balanceOf(user1.address)).to.equal(initialUserBalance + expectedReward);
      expect(await attendaToken.balanceOf(await proofOfAttention.getAddress())).to.equal(
        initialContractBalance - expectedReward,
      );
    });

    it("Should revert if proof is not validated", async function () {
      // Create another proof without validation
      const anotherProofTx = await proofOfAttention
        .connect(user2)
        .submitProof(CAMPAIGN_ID, WATCH_DURATION, "QmAnotherHash");
      const anotherProofReceipt = await anotherProofTx.wait();
      const anotherProofSubmittedEvent = anotherProofReceipt?.logs.find(
        (log: any) => log.fragment?.name === "ProofSubmitted",
      );
      const anotherProofId = anotherProofSubmittedEvent?.args?.proofId || 2;

      await expect(proofOfAttention.connect(user2).distributeReward(anotherProofId)).to.be.revertedWith(
        "Proof must be validated first",
      );
    });

    it("Should revert if rewards already distributed", async function () {
      // Distribute rewards first time
      await proofOfAttention.connect(user1).distributeReward(proofId);

      // Try to distribute again
      await expect(proofOfAttention.connect(user1).distributeReward(proofId)).to.be.revertedWith(
        "Reward already distributed",
      );
    });
  });

  describe("Reward Calculation", function () {
    it("Should calculate base reward correctly", async function () {
      const shortWatchTime = 180; // 3 minutes
      const mediumWatchTime = 300; // 5 minutes
      const longWatchTime = 600; // 10 minutes

      // Submit proofs with different watch times
      await proofOfAttention.connect(user1).submitProof(CAMPAIGN_ID, shortWatchTime, "QmShort");
      await proofOfAttention.connect(user2).submitProof(CAMPAIGN_ID, mediumWatchTime, "QmMedium");
      await proofOfAttention.connect(user3).submitProof(CAMPAIGN_ID, longWatchTime, "QmLong");

      // Validate all proofs
      const proofIds = [1, 2, 3];
      for (const proofId of proofIds) {
        await proofOfAttention.connect(owner).validateProof(proofId);
        await proofOfAttention.connect(validator1).validateProof(proofId);
        await proofOfAttention.connect(validator2).validateProof(proofId);
      }

      // Check reward amounts
      const shortProof = await proofOfAttention.getProof(1);
      const mediumProof = await proofOfAttention.getProof(2);
      const longProof = await proofOfAttention.getProof(3);

      // Long watch time should get higher reward (2x)
      expect(longProof.rewardAmount).to.be.gt(mediumProof.rewardAmount);
      expect(mediumProof.rewardAmount).to.be.gt(shortProof.rewardAmount);
    });
  });

  describe("View Functions", function () {
    it("Should return correct proof details", async function () {
      await proofOfAttention.connect(user1).submitProof(CAMPAIGN_ID, WATCH_DURATION, IPFS_PROOF_HASH);

      const proof = await proofOfAttention.getProof(1);
      expect(proof.campaignId).to.equal(CAMPAIGN_ID);
      expect(proof.user).to.equal(user1.address);
      expect(proof.watchDuration).to.equal(WATCH_DURATION);
      expect(proof.ipfsProofHash).to.equal(IPFS_PROOF_HASH);
    });

    it("Should return correct campaign participants", async function () {
      await proofOfAttention.connect(user1).submitProof(CAMPAIGN_ID, WATCH_DURATION, IPFS_PROOF_HASH);
      await proofOfAttention.connect(user2).submitProof(CAMPAIGN_ID, WATCH_DURATION, "QmAnotherHash");

      const participants = await proofOfAttention.getCampaignProofs(CAMPAIGN_ID);
      expect(participants).to.include(user1.address);
      expect(participants).to.include(user2.address);
      expect(participants.length).to.equal(2);
    });

    it("Should return correct total counts", async function () {
      expect(await proofOfAttention.getTotalProofs()).to.equal(0);

      await proofOfAttention.connect(user1).submitProof(CAMPAIGN_ID, WATCH_DURATION, IPFS_PROOF_HASH);

      expect(await proofOfAttention.getTotalProofs()).to.equal(1);
    });

    it("Should check validator status correctly", async function () {
      expect(await proofOfAttention.isValidator(owner.address)).to.be.true;
      expect(await proofOfAttention.isValidator(validator1.address)).to.be.true;
      expect(await proofOfAttention.isValidator(user1.address)).to.be.false;
    });
  });

  describe("Emergency Functions", function () {
    it("Should allow owner to emergency pause", async function () {
      // Submit and validate a proof
      await proofOfAttention.connect(user1).submitProof(CAMPAIGN_ID, WATCH_DURATION, IPFS_PROOF_HASH);
      await proofOfAttention.connect(owner).validateProof(1);
      await proofOfAttention.connect(validator1).validateProof(1);
      await proofOfAttention.connect(validator2).validateProof(1);

      // Emergency pause
      await proofOfAttention.emergencyPause();

      const proof = await proofOfAttention.getProof(1);
      expect(proof.isValidated).to.be.false;
    });

    it("Should revert if non-owner tries to emergency pause", async function () {
      await expect(proofOfAttention.connect(user1).emergencyPause()).to.be.revertedWith(
        "Ownable: caller is not the owner",
      );
    });
  });
});
