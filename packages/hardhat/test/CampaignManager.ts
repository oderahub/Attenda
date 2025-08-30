import { expect } from "chai";
import { ethers } from "hardhat";
import { ContractFactory } from "ethers";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";

describe("CampaignManager", function () {
  let AttendaToken: ContractFactory;
  let CampaignManager: ContractFactory;
  let attendaToken: any;
  let campaignManager: any;
  let owner: HardhatEthersSigner;
  let advertiser: HardhatEthersSigner;
  let user1: HardhatEthersSigner;
  let user2: HardhatEthersSigner;
  let user3: HardhatEthersSigner;

  const CAMPAIGN_REWARD = ethers.parseEther("100"); // 100 tokens per participant
  const MAX_PARTICIPANTS = 10;
  const CAMPAIGN_DURATION = 300; // 5 minutes

  beforeEach(async function () {
    // Get signers
    [owner, advertiser, user1, user2, user3] = await ethers.getSigners();

    // Deploy AttendaToken
    AttendaToken = await ethers.getContractFactory("AttendaToken");
    attendaToken = await AttendaToken.deploy();
    await attendaToken.waitForDeployment();

    // Deploy CampaignManager
    CampaignManager = await ethers.getContractFactory("CampaignManager");
    campaignManager = await CampaignManager.deploy(await attendaToken.getAddress());
    await campaignManager.waitForDeployment();

    // Transfer tokens to advertiser for campaign creation
    const campaignCost = CAMPAIGN_REWARD * BigInt(MAX_PARTICIPANTS);
    await attendaToken.transfer(advertiser.address, campaignCost);

    // Approve CampaignManager to spend advertiser's tokens
    await attendaToken.connect(advertiser).approve(await campaignManager.getAddress(), campaignCost);
  });

  describe("Deployment", function () {
    it("Should set the correct AttendaToken address", async function () {
      expect(await campaignManager.attendaToken()).to.equal(await attendaToken.getAddress());
    });

    it("Should set the correct owner", async function () {
      expect(await campaignManager.owner()).to.equal(owner.address);
    });

    it("Should set the correct platform fee", async function () {
      expect(await campaignManager.platformFee()).to.equal(500); // 5%
    });
  });

  describe("Campaign Creation", function () {
    const campaignTitle = "Test Campaign";
    const campaignDescription = "A test advertising campaign";
    const ipfsHash = "QmTestHash123";

    it("Should create a new campaign successfully", async function () {
      const campaignCost = CAMPAIGN_REWARD * BigInt(MAX_PARTICIPANTS);
      const initialAdvertiserBalance = await attendaToken.balanceOf(advertiser.address);
      const initialContractBalance = await attendaToken.balanceOf(await campaignManager.getAddress());

      const tx = await campaignManager
        .connect(advertiser)
        .createCampaign(
          campaignTitle,
          campaignDescription,
          ipfsHash,
          CAMPAIGN_REWARD,
          MAX_PARTICIPANTS,
          CAMPAIGN_DURATION,
        );

      const receipt = await tx.wait();
      const campaignCreatedEvent = receipt?.logs.find((log: any) => log.fragment?.name === "CampaignCreated");

      expect(campaignCreatedEvent).to.not.be.undefined;

      const campaign = await campaignManager.getCampaign(1);
      expect(campaign.id).to.equal(1);
      expect(campaign.advertiser).to.equal(advertiser.address);
      expect(campaign.title).to.equal(campaignTitle);
      expect(campaign.description).to.equal(campaignDescription);
      expect(campaign.ipfsHash).to.equal(ipfsHash);
      expect(campaign.rewardAmount).to.equal(CAMPAIGN_REWARD);
      expect(campaign.maxParticipants).to.equal(MAX_PARTICIPANTS);
      expect(campaign.currentParticipants).to.equal(0);
      expect(campaign.duration).to.equal(CAMPAIGN_DURATION);
      expect(campaign.isActive).to.be.true;
      expect(campaign.isCompleted).to.be.false;

      // Check token transfers
      expect(await attendaToken.balanceOf(advertiser.address)).to.equal(initialAdvertiserBalance - campaignCost);
      expect(await attendaToken.balanceOf(await campaignManager.getAddress())).to.equal(
        initialContractBalance + campaignCost,
      );
    });

    it("Should revert if title is empty", async function () {
      await expect(
        campaignManager
          .connect(advertiser)
          .createCampaign("", campaignDescription, ipfsHash, CAMPAIGN_REWARD, MAX_PARTICIPANTS, CAMPAIGN_DURATION),
      ).to.be.revertedWith("Title cannot be empty");
    });

    it("Should revert if description is empty", async function () {
      await expect(
        campaignManager
          .connect(advertiser)
          .createCampaign(campaignTitle, "", ipfsHash, CAMPAIGN_REWARD, MAX_PARTICIPANTS, CAMPAIGN_DURATION),
      ).to.be.revertedWith("Description cannot be empty");
    });

    it("Should revert if IPFS hash is empty", async function () {
      await expect(
        campaignManager
          .connect(advertiser)
          .createCampaign(campaignTitle, campaignDescription, "", CAMPAIGN_REWARD, MAX_PARTICIPANTS, CAMPAIGN_DURATION),
      ).to.be.revertedWith("IPFS hash cannot be empty");
    });

    it("Should revert if reward amount is zero", async function () {
      await expect(
        campaignManager
          .connect(advertiser)
          .createCampaign(campaignTitle, campaignDescription, ipfsHash, 0, MAX_PARTICIPANTS, CAMPAIGN_DURATION),
      ).to.be.revertedWith("Reward amount must be greater than 0");
    });

    it("Should revert if max participants is zero", async function () {
      await expect(
        campaignManager
          .connect(advertiser)
          .createCampaign(campaignTitle, campaignDescription, ipfsHash, CAMPAIGN_REWARD, 0, CAMPAIGN_DURATION),
      ).to.be.revertedWith("Max participants must be greater than 0");
    });

    it("Should revert if duration is zero", async function () {
      await expect(
        campaignManager
          .connect(advertiser)
          .createCampaign(campaignTitle, campaignDescription, ipfsHash, CAMPAIGN_REWARD, MAX_PARTICIPANTS, 0),
      ).to.be.revertedWith("Duration must be greater than 0");
    });

    it("Should revert if advertiser has insufficient tokens", async function () {
      const insufficientReward = ethers.parseEther("1000000"); // More than advertiser has

      await expect(
        campaignManager
          .connect(advertiser)
          .createCampaign(
            campaignTitle,
            campaignDescription,
            ipfsHash,
            insufficientReward,
            MAX_PARTICIPANTS,
            CAMPAIGN_DURATION,
          ),
      ).to.be.revertedWith("Insufficient token balance");
    });
  });

  describe("Proof Submission", function () {
    let campaignId: number;

    beforeEach(async function () {
      // Create a campaign first
      const tx = await campaignManager
        .connect(advertiser)
        .createCampaign(
          "Test Campaign",
          "A test advertising campaign",
          "QmTestHash123",
          CAMPAIGN_REWARD,
          MAX_PARTICIPANTS,
          CAMPAIGN_DURATION,
        );
      const receipt = await tx.wait();
      const campaignCreatedEvent = receipt?.logs.find((log: any) => log.fragment?.name === "CampaignCreated");
      campaignId = campaignCreatedEvent?.args?.campaignId || 1;
    });

    it("Should submit proof successfully", async function () {
      const watchTime = CAMPAIGN_DURATION + 10; // 10 seconds more than required

      const tx = await campaignManager.connect(user1).submitProof(campaignId, watchTime);

      const receipt = await tx.wait();
      const proofSubmittedEvent = receipt?.logs.find((log: any) => log.fragment?.name === "ProofSubmitted");

      expect(proofSubmittedEvent).to.not.be.undefined;

      const campaign = await campaignManager.getCampaign(campaignId);
      expect(campaign.currentParticipants).to.equal(1);

      expect(await campaignManager.hasUserParticipated(campaignId, user1.address)).to.be.true;

      const participants = await campaignManager.getCampaignParticipants(campaignId);
      expect(participants).to.include(user1.address);
    });

    it("Should revert if user already participated", async function () {
      const watchTime = CAMPAIGN_DURATION + 10;

      // Submit first proof
      await campaignManager.connect(user1).submitProof(campaignId, watchTime);

      // Try to submit again
      await expect(campaignManager.connect(user1).submitProof(campaignId, watchTime)).to.be.revertedWith(
        "User already participated",
      );
    });

    it("Should revert if campaign is full", async function () {
      const watchTime = CAMPAIGN_DURATION + 10;

      // Fill the campaign with unique users
      // We need to create more users since we only have 3 + owner
      // For this test, we'll use the available users multiple times
      // In a real scenario, you'd have more unique addresses

      // First, let's create a campaign with fewer participants for testing
      // We need to ensure the advertiser has enough tokens for this campaign
      const smallCampaignCost = CAMPAIGN_REWARD * BigInt(3); // 3 participants

      // Transfer additional tokens to advertiser if needed
      if ((await attendaToken.balanceOf(advertiser.address)) < smallCampaignCost) {
        await attendaToken.transfer(advertiser.address, smallCampaignCost);
        await attendaToken.connect(advertiser).approve(await campaignManager.getAddress(), smallCampaignCost);
      }

      const smallCampaignTx = await campaignManager.connect(advertiser).createCampaign(
        "Small Campaign",
        "A small test campaign",
        "QmSmallHash",
        CAMPAIGN_REWARD,
        3, // Only 3 participants
        CAMPAIGN_DURATION,
      );
      const smallCampaignReceipt = await smallCampaignTx.wait();
      const smallCampaignCreatedEvent = smallCampaignReceipt?.logs.find(
        (log: any) => log.fragment?.name === "CampaignCreated",
      );
      const smallCampaignId = smallCampaignCreatedEvent?.args?.campaignId || 2;

      // Fill the small campaign
      await campaignManager.connect(user1).submitProof(smallCampaignId, watchTime);
      await campaignManager.connect(user2).submitProof(smallCampaignId, watchTime);
      await campaignManager.connect(user3).submitProof(smallCampaignId, watchTime);

      // Try to submit one more
      await expect(campaignManager.connect(owner).submitProof(smallCampaignId, watchTime)).to.be.revertedWith(
        "Campaign is full",
      );
    });

    it("Should revert if watch time is less than campaign duration", async function () {
      const insufficientWatchTime = CAMPAIGN_DURATION - 10; // 10 seconds less than required

      await expect(campaignManager.connect(user1).submitProof(campaignId, insufficientWatchTime)).to.be.revertedWith(
        "Watch time must be at least campaign duration",
      );
    });

    it("Should revert if IPFS proof hash is empty", async function () {
      // Note: CampaignManager submitProof doesn't take IPFS hash parameter
      // This test is not applicable to CampaignManager
      // IPFS hash is part of campaign creation, not proof submission
    });
  });

  describe("Proof Verification", function () {
    let campaignId: number;
    let proofId: number;

    beforeEach(async function () {
      // Create a campaign
      const tx = await campaignManager
        .connect(advertiser)
        .createCampaign(
          "Test Campaign",
          "A test advertising campaign",
          "QmTestHash123",
          CAMPAIGN_REWARD,
          MAX_PARTICIPANTS,
          CAMPAIGN_DURATION,
        );
      const receipt = await tx.wait();
      const campaignCreatedEvent = receipt?.logs.find((log: any) => log.fragment?.name === "CampaignCreated");
      campaignId = campaignCreatedEvent?.args?.campaignId || 1;

      // Submit a proof
      const watchTime = CAMPAIGN_DURATION + 10;
      const proofTx = await campaignManager.connect(user1).submitProof(campaignId, watchTime);
      const proofReceipt = await proofTx.wait();
      const proofSubmittedEvent = proofReceipt?.logs.find((log: any) => log.fragment?.name === "ProofSubmitted");
      proofId = proofSubmittedEvent?.args?.proofId || 1;
    });

    it("Should verify proof successfully", async function () {
      const tx = await campaignManager.connect(advertiser).verifyProof(proofId);

      const receipt = await tx.wait();
      const proofVerifiedEvent = receipt?.logs.find((log: any) => log.fragment?.name === "ProofVerified");

      expect(proofVerifiedEvent).to.not.be.undefined;

      const proof = await campaignManager.getProof(proofId);
      expect(proof.isVerified).to.be.true;
    });

    it("Should revert if proof does not exist", async function () {
      await expect(campaignManager.connect(advertiser).verifyProof(999)).to.be.revertedWith("Proof does not exist");
    });

    it("Should revert if proof already verified", async function () {
      // Verify first time
      await campaignManager.connect(advertiser).verifyProof(proofId);

      // Try to verify again
      await expect(campaignManager.connect(advertiser).verifyProof(proofId)).to.be.revertedWith(
        "Proof already verified",
      );
    });

    it("Should revert if proof already rewarded", async function () {
      // Verify proof
      await campaignManager.connect(advertiser).verifyProof(proofId);

      // Distribute rewards
      await campaignManager.connect(advertiser).distributeRewards(proofId);

      // Try to verify again
      await expect(campaignManager.connect(advertiser).verifyProof(proofId)).to.be.revertedWith(
        "Proof already verified",
      );
    });

    it("Should revert if called by non-advertiser", async function () {
      await expect(campaignManager.connect(user2).verifyProof(proofId)).to.be.revertedWith(
        "Only advertiser can verify",
      );
    });
  });

  describe("Reward Distribution", function () {
    let campaignId: number;
    let proofId: number;

    beforeEach(async function () {
      // Create a campaign
      const tx = await campaignManager
        .connect(advertiser)
        .createCampaign(
          "Test Campaign",
          "A test advertising campaign",
          "QmTestHash123",
          CAMPAIGN_REWARD,
          MAX_PARTICIPANTS,
          CAMPAIGN_DURATION,
        );
      const receipt = await tx.wait();
      const campaignCreatedEvent = receipt?.logs.find((log: any) => log.fragment?.name === "CampaignCreated");
      campaignId = campaignCreatedEvent?.args?.campaignId || 1;

      // Submit and verify a proof
      const watchTime = CAMPAIGN_DURATION + 10;
      const proofTx = await campaignManager.connect(user1).submitProof(campaignId, watchTime);
      const proofReceipt = await proofTx.wait();
      const proofSubmittedEvent = proofReceipt?.logs.find((log: any) => log.fragment?.name === "ProofSubmitted");
      proofId = proofSubmittedEvent?.args?.proofId || 1;

      await campaignManager.connect(advertiser).verifyProof(proofId);
    });

    it("Should distribute rewards successfully", async function () {
      const initialUserBalance = await attendaToken.balanceOf(user1.address);
      const initialContractBalance = await attendaToken.balanceOf(await campaignManager.getAddress());

      const tx = await campaignManager.connect(advertiser).distributeRewards(proofId);

      const receipt = await tx.wait();
      const rewardDistributedEvent = receipt?.logs.find((log: any) => log.fragment?.name === "RewardDistributed");

      expect(rewardDistributedEvent).to.not.be.undefined;

      const proof = await campaignManager.getProof(proofId);
      expect(proof.isRewarded).to.be.true;

      // Check token transfers
      // Platform fee is 5%, so user gets 95% of the reward
      const platformFee = 500; // 5% in basis points
      const basisPoints = 10000;
      const expectedUserReward = CAMPAIGN_REWARD - (CAMPAIGN_REWARD * BigInt(platformFee)) / BigInt(basisPoints);

      expect(await attendaToken.balanceOf(user1.address)).to.equal(initialUserBalance + expectedUserReward);
      // Contract balance should be reduced by the full reward amount (user reward + platform fee)
      expect(await attendaToken.balanceOf(await campaignManager.getAddress())).to.equal(
        initialContractBalance - CAMPAIGN_REWARD,
      );
    });

    it("Should revert if proof is not verified", async function () {
      // Create another proof without verification
      const watchTime = CAMPAIGN_DURATION + 10;
      const anotherProofTx = await campaignManager.connect(user2).submitProof(campaignId, watchTime);
      const anotherProofReceipt = await anotherProofTx.wait();
      const anotherProofSubmittedEvent = anotherProofReceipt?.logs.find(
        (log: any) => log.fragment?.name === "ProofSubmitted",
      );
      const anotherProofId = anotherProofSubmittedEvent?.args?.proofId || 2;

      await expect(campaignManager.connect(advertiser).distributeRewards(anotherProofId)).to.be.revertedWith(
        "Proof must be verified first",
      );
    });

    it("Should revert if rewards already distributed", async function () {
      // Distribute rewards first time
      await campaignManager.connect(advertiser).distributeRewards(proofId);

      // Try to distribute again
      await expect(campaignManager.connect(advertiser).distributeRewards(proofId)).to.be.revertedWith(
        "Rewards already distributed",
      );
    });

    it("Should revert if called by non-advertiser", async function () {
      await expect(campaignManager.connect(user2).distributeRewards(proofId)).to.be.revertedWith(
        "Only advertiser can distribute rewards",
      );
    });
  });

  describe("Campaign Completion", function () {
    let campaignId: number;

    beforeEach(async function () {
      // Create a campaign
      const tx = await campaignManager
        .connect(advertiser)
        .createCampaign(
          "Test Campaign",
          "A test advertising campaign",
          "QmTestHash123",
          CAMPAIGN_REWARD,
          MAX_PARTICIPANTS,
          CAMPAIGN_DURATION,
        );
      const receipt = await tx.wait();
      const campaignCreatedEvent = receipt?.logs.find((log: any) => log.fragment?.name === "CampaignCreated");
      campaignId = campaignCreatedEvent?.args?.campaignId || 1;
    });

    it("Should complete campaign successfully after duration", async function () {
      // Fast forward time
      await ethers.provider.send("evm_increaseTime", [CAMPAIGN_DURATION + 60]); // 1 minute after end
      await ethers.provider.send("evm_mine");

      const initialAdvertiserBalance = await attendaToken.balanceOf(advertiser.address);
      const initialContractBalance = await attendaToken.balanceOf(await campaignManager.getAddress());

      const tx = await campaignManager.connect(advertiser).completeCampaign(campaignId);

      const receipt = await tx.wait();
      const campaignCompletedEvent = receipt?.logs.find((log: any) => log.fragment?.name === "CampaignCompleted");

      expect(campaignCompletedEvent).to.not.be.undefined;

      const campaign = await campaignManager.getCampaign(campaignId);
      expect(campaign.isActive).to.be.false;
      expect(campaign.isCompleted).to.be.true;

      // Check refund of unused tokens
      const expectedRefund = CAMPAIGN_REWARD * BigInt(MAX_PARTICIPANTS);
      expect(await attendaToken.balanceOf(advertiser.address)).to.equal(initialAdvertiserBalance + expectedRefund);
      expect(await attendaToken.balanceOf(await campaignManager.getAddress())).to.equal(
        initialContractBalance - expectedRefund,
      );
    });

    it("Should revert if campaign has not ended", async function () {
      await expect(campaignManager.connect(advertiser).completeCampaign(campaignId)).to.be.revertedWith(
        "Campaign has not ended yet",
      );
    });

    it("Should revert if campaign is already inactive", async function () {
      // Fast forward time and complete
      await ethers.provider.send("evm_increaseTime", [CAMPAIGN_DURATION + 60]);
      await ethers.provider.send("evm_mine");
      await campaignManager.connect(advertiser).completeCampaign(campaignId);

      // Try to complete again
      await expect(campaignManager.connect(advertiser).completeCampaign(campaignId)).to.be.revertedWith(
        "Campaign is already inactive",
      );
    });

    it("Should revert if called by non-advertiser", async function () {
      // Fast forward time
      await ethers.provider.send("evm_increaseTime", [CAMPAIGN_DURATION + 60]);
      await ethers.provider.send("evm_mine");

      await expect(campaignManager.connect(user1).completeCampaign(campaignId)).to.be.revertedWith(
        "Only advertiser can call this",
      );
    });
  });

  describe("Platform Fee Management", function () {
    it("Should allow owner to update platform fee", async function () {
      const newFee = 1000; // 10%

      const tx = await campaignManager.updatePlatformFee(newFee);

      const receipt = await tx.wait();
      const platformFeeUpdatedEvent = receipt?.logs.find((log: any) => log.fragment?.name === "PlatformFeeUpdated");

      expect(platformFeeUpdatedEvent).to.not.be.undefined;
      expect(await campaignManager.platformFee()).to.equal(newFee);
    });

    it("Should revert if non-owner tries to update platform fee", async function () {
      const newFee = 1000;

      await expect(campaignManager.connect(user1).updatePlatformFee(newFee)).to.be.revertedWith(
        "Ownable: caller is not the owner",
      );
    });
  });

  describe("Emergency Functions", function () {
    it("Should allow owner to emergency pause", async function () {
      // Create a campaign
      const tx = await campaignManager
        .connect(advertiser)
        .createCampaign(
          "Test Campaign",
          "A test advertising campaign",
          "QmTestHash123",
          CAMPAIGN_REWARD,
          MAX_PARTICIPANTS,
          CAMPAIGN_DURATION,
        );
      const receipt = await tx.wait();
      const campaignCreatedEvent = receipt?.logs.find((log: any) => log.fragment?.name === "CampaignCreated");
      const campaignId = campaignCreatedEvent?.args?.campaignId || 1;

      // Emergency pause
      await campaignManager.emergencyPause();

      const campaign = await campaignManager.getCampaign(campaignId);
      expect(campaign.isActive).to.be.false;
    });

    it("Should revert if non-owner tries to emergency pause", async function () {
      await expect(campaignManager.connect(user1).emergencyPause()).to.be.revertedWith(
        "Ownable: caller is not the owner",
      );
    });
  });

  describe("View Functions", function () {
    it("Should return correct campaign details", async function () {
      const campaignTitle = "Test Campaign";
      const campaignDescription = "A test advertising campaign";
      const ipfsHash = "QmTestHash123";

      const tx = await campaignManager
        .connect(advertiser)
        .createCampaign(
          campaignTitle,
          campaignDescription,
          ipfsHash,
          CAMPAIGN_REWARD,
          MAX_PARTICIPANTS,
          CAMPAIGN_DURATION,
        );
      const receipt = await tx.wait();
      const campaignCreatedEvent = receipt?.logs.find((log: any) => log.fragment?.name === "CampaignCreated");
      const campaignId = campaignCreatedEvent?.args?.campaignId || 1;

      const campaign = await campaignManager.getCampaign(campaignId);
      expect(campaign.title).to.equal(campaignTitle);
      expect(campaign.description).to.equal(campaignDescription);
      expect(campaign.ipfsHash).to.equal(ipfsHash);
    });

    it("Should return correct total counts", async function () {
      expect(await campaignManager.getTotalCampaigns()).to.equal(0);
      expect(await campaignManager.getTotalProofs()).to.equal(0);

      // Create a campaign
      await campaignManager
        .connect(advertiser)
        .createCampaign(
          "Test Campaign",
          "A test advertising campaign",
          "QmTestHash123",
          CAMPAIGN_REWARD,
          MAX_PARTICIPANTS,
          CAMPAIGN_DURATION,
        );

      expect(await campaignManager.getTotalCampaigns()).to.equal(1);
    });
  });
});
