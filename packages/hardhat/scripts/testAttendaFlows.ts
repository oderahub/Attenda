import { ethers } from "hardhat";
import { parseEther, formatEther } from "ethers";

async function main() {
  console.log("🧪 Testing Attenda MVP Flows...\n");

  // Get signers
  const [owner, advertiser, user1, user2] = await ethers.getSigners();

  console.log("👥 Test Accounts:");
  console.log(`Owner: ${owner.address}`);
  console.log(`Advertiser: ${advertiser.address}`);
  console.log(`User 1: ${user1.address}`);
  console.log(`User 2: ${user2.address}\n`);

  // Deploy contracts if they don't exist
  console.log("📜 Deploying contracts...");

  const AttendaToken = await ethers.getContractFactory("AttendaToken");
  const token = await AttendaToken.deploy();
  await token.waitForDeployment();
  const tokenAddress = await token.getAddress();
  console.log(`AttendaToken deployed to: ${tokenAddress}`);

  const CampaignManager = await ethers.getContractFactory("CampaignManager");
  const manager = await CampaignManager.deploy(tokenAddress);
  await manager.waitForDeployment();
  const managerAddress = await manager.getAddress();
  console.log(`CampaignManager deployed to: ${managerAddress}`);

  const ProofOfAttention = await ethers.getContractFactory("ProofOfAttention");
  const proofContract = await ProofOfAttention.deploy(tokenAddress);
  await proofContract.waitForDeployment();
  const proofAddress = await proofContract.getAddress();
  console.log(`ProofOfAttention deployed to: ${proofAddress}`);

  console.log("✅ All contracts deployed successfully\n");

  // Test 1: Check initial token distribution
  console.log("🔍 Test 1: Initial Token Distribution");
  const ownerBalance = await token.balanceOf(owner.address);
  console.log(`Owner balance: ${formatEther(ownerBalance)} ATT`);

  // Transfer tokens to advertiser for testing
  const transferAmount = parseEther("1000");
  await token.transfer(advertiser.address, transferAmount);
  console.log(`Transferred ${formatEther(transferAmount)} ATT to advertiser`);

  // Transfer tokens to ProofOfAttention contract for rewards
  const rewardTransferAmount = parseEther("10000");
  await token.transfer(proofAddress, rewardTransferAmount);
  console.log(`Transferred ${formatEther(rewardTransferAmount)} ATT to ProofOfAttention contract for rewards\n`);

  // Test 2: Create Campaign
  console.log("📢 Test 2: Creating Campaign");
  const campaignTitle = "Test Ad Campaign";
  const campaignDescription = "A test campaign for attention rewards";
  const ipfsHash = "QmTestHash123456789";
  const rewardAmount = parseEther("1"); // 1 ATT per view
  const maxParticipants = 100;
  const duration = 300; // 5 minutes

  console.log("Campaign Details:");
  console.log(`- Title: ${campaignTitle}`);
  console.log(`- Reward: ${formatEther(rewardAmount)} ATT per view`);
  console.log(`- Max Participants: ${maxParticipants}`);
  console.log(`- Duration: ${duration} seconds`);

  // Approve tokens for campaign manager
  const approvalAmount = rewardAmount * BigInt(maxParticipants);
  await token.connect(advertiser).approve(managerAddress, approvalAmount);
  console.log(`Approved ${formatEther(approvalAmount)} ATT for campaign manager`);

  // Create campaign
  const createTx = await manager
    .connect(advertiser)
    .createCampaign(campaignTitle, campaignDescription, ipfsHash, rewardAmount, maxParticipants, duration);

  const receipt = await createTx.wait();
  console.log("✅ Campaign created successfully!");

  // Get campaign ID from events
  const campaignCreatedEvent = receipt?.logs.find(
    (log: any) => "fragment" in log && log.fragment?.name === "CampaignCreated",
  ) as any;

  if (campaignCreatedEvent && campaignCreatedEvent.args) {
    const campaignId = campaignCreatedEvent.args[0];
    console.log(`Campaign ID: ${campaignId}\n`);

    // Test 3: Submit Proof of Attention
    console.log("👤 Test 3: Submitting Proof of Attention");

    const watchTime = 60; // 1 minute
    const proofIpfsHash = "QmProofHash987654321";

    console.log("Proof Details:");
    console.log(`- Campaign ID: ${campaignId}`);
    console.log(`- Watch Time: ${watchTime} seconds`);
    console.log(`- Proof IPFS Hash: ${proofIpfsHash}`);

    // Submit proof
    const submitTx = await proofContract.connect(user1).submitProof(campaignId, watchTime, proofIpfsHash);

    await submitTx.wait();
    console.log("✅ Proof submitted successfully!\n");

    // Test 4: Validate Proof
    console.log("🔍 Test 4: Validating Proof");

    // Add validators
    await proofContract.addValidator(user2.address);
    console.log("✅ Added user2 as validator");

    // Add one more validator to meet the threshold of 3
    await proofContract.addValidator(user1.address);
    console.log("✅ Added user1 as validator");

    // Get proof ID (assuming it's 1 for first proof)
    const proofId = 1;

    // Validate proof with first validator (owner is already a validator)
    const validateTx1 = await proofContract.connect(owner).validateProof(proofId);
    await validateTx1.wait();
    console.log("✅ Proof validated by owner");

    // Validate proof with second validator
    const validateTx2 = await proofContract.connect(user2).validateProof(proofId);
    await validateTx2.wait();
    console.log("✅ Proof validated by user2");

    // Validate proof with third validator
    const validateTx3 = await proofContract.connect(user1).validateProof(proofId);
    await validateTx3.wait();
    console.log("✅ Proof validated by user1");

    // Check validation status
    const proof = await proofContract.getProof(proofId);
    console.log(`Proof validation count: ${await proofContract.getProofValidationCount(proofId)}`);
    console.log(`Proof is validated: ${proof.isValidated}`);
    console.log("✅ Proof validation completed!\n");

    // Test 5: Distribute Reward
    console.log("💰 Test 5: Distributing Reward");

    const user1BalanceBefore = await token.balanceOf(user1.address);
    console.log(`User1 balance before: ${formatEther(user1BalanceBefore)} ATT`);

    // Distribute reward
    const distributeTx = await proofContract.connect(owner).distributeReward(proofId);
    await distributeTx.wait();
    console.log("✅ Reward distributed successfully!");

    const user1BalanceAfter = await token.balanceOf(user1.address);
    console.log(`User1 balance after: ${formatEther(user1BalanceAfter)} ATT`);
    const rewardReceived = user1BalanceAfter - user1BalanceBefore;
    console.log(`Reward received: ${formatEther(rewardReceived)} ATT\n`);

    // Test 6: Campaign Status
    console.log("📊 Test 6: Campaign Status");
    const campaign = await manager.campaigns(campaignId);
    console.log("Campaign Details:");
    console.log(`- ID: ${campaign.id}`);
    console.log(`- Title: ${campaign.title}`);
    console.log(`- Advertiser: ${campaign.advertiser}`);
    console.log(`- Reward Amount: ${formatEther(campaign.rewardAmount)} ATT`);
    console.log(`- Max Participants: ${campaign.maxParticipants}`);
    console.log(`- Current Participants: ${campaign.currentParticipants}`);
    console.log(`- Duration: ${campaign.duration} seconds`);
    console.log(`- Is Active: ${campaign.isActive}`);
    console.log(`- Is Completed: ${campaign.isCompleted}`);
  } else {
    console.log("❌ Failed to create campaign");
  }

  console.log("\n🎉 All tests completed successfully!");
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
