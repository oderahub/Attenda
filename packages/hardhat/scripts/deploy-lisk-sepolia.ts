import { ethers } from "hardhat";

async function main() {
  console.log("🚀 Deploying Attenda MVP to Lisk Sepolia...");

  // Get deployer account
  const [deployer] = await ethers.getSigners();
  console.log("Deploying from account:", deployer.address);
  console.log("Account balance:", (await deployer.provider?.getBalance(deployer.address))?.toString());

  // Deploy AttendaToken
  console.log("\n📝 Deploying AttendaToken...");
  const AttendaToken = await ethers.getContractFactory("AttendaToken");
  const attendaToken = await AttendaToken.deploy();
  await attendaToken.waitForDeployment();
  const attendaTokenAddress = await attendaToken.getAddress();
  console.log("✅ AttendaToken deployed to:", attendaTokenAddress);

  // Deploy CampaignManager
  console.log("\n📝 Deploying CampaignManager...");
  const CampaignManager = await ethers.getContractFactory("CampaignManager");
  const campaignManager = await CampaignManager.deploy(attendaTokenAddress);
  await campaignManager.waitForDeployment();
  const campaignManagerAddress = await campaignManager.getAddress();
  console.log("✅ CampaignManager deployed to:", campaignManagerAddress);

  // Deploy ProofOfAttention
  console.log("\n📝 Deploying ProofOfAttention...");
  const ProofOfAttention = await ethers.getContractFactory("ProofOfAttention");
  const proofOfAttention = await ProofOfAttention.deploy(attendaTokenAddress);
  await proofOfAttention.waitForDeployment();
  const proofOfAttentionAddress = await proofOfAttention.getAddress();
  console.log("✅ ProofOfAttention deployed to:", proofOfAttentionAddress);

 

  console.log("\n🎉 All contracts deployed successfully to Lisk Sepolia!");
  console.log("\n📋 Contract Addresses:");
  console.log("AttendaToken:", attendaTokenAddress);
  console.log("CampaignManager:", campaignManagerAddress);
  console.log("ProofOfAttention:", proofOfAttentionAddress);
  

  console.log("\n🔗 Lisk Sepolia Explorer: https://sepolia-blockscout.lisk.com");
  console.log("\n⚠️  IMPORTANT: Update your frontend deployedContracts.ts with these addresses!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });



