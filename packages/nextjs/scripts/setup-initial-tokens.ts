import { ethers } from "ethers";
import deployedContracts from "../contracts/deployedContracts";

// Script to distribute initial ATT tokens to advertisers
async function setupInitialTokens() {
  // Connect to local hardhat network
  const provider = new ethers.JsonRpcProvider("http://127.0.0.1:8545");
  
  // Get the AttendaToken contract
  const attendaTokenAddress = deployedContracts[31337]?.AttendaToken?.address;
  if (!attendaTokenAddress) {
    console.error("AttendaToken not found in deployed contracts");
    return;
  }

  const attendaToken = new ethers.Contract(
    attendaTokenAddress,
    deployedContracts[31337].AttendaToken.abi,
    provider
  );

  // Get the CampaignManager contract
  const campaignManagerAddress = deployedContracts[31337]?.CampaignManager?.address;
  if (!campaignManagerAddress) {
    console.error("CampaignManager not found in deployed contracts");
    return;
  }

  // const campaignManager = new ethers.Contract(
  //   campaignManagerAddress,
  //   deployedContracts[31337].CampaignManager.abi,
  //   provider
  // );

  // Get signer (you'll need to provide a private key)
  const privateKey = process.env.DEPLOYER_PRIVATE_KEY;
  if (!privateKey) {
    console.error("Please set DEPLOYER_PRIVATE_KEY environment variable");
    return;
  }

  const signer = new ethers.Wallet(privateKey, provider);

  try {
    // Mint initial tokens to the deployer
    const initialAmount = ethers.parseEther("10000"); // 10,000 ATT tokens
    
    console.log("Minting initial tokens...");
    const mintTx = await attendaToken.connect(signer).mint(signer.address, initialAmount);
    await mintTx.wait();
    
    console.log(`Minted ${ethers.formatEther(initialAmount)} ATT tokens to ${signer.address}`);
    
    // Check balance
    const balance = await attendaToken.balanceOf(signer.address);
    console.log(`Current balance: ${ethers.formatEther(balance)} ATT`);
    
    // Transfer some tokens to the CampaignManager for initial campaigns
    const transferAmount = ethers.parseEther("1000"); // 1,000 ATT tokens
    const transferTx = await attendaToken.connect(signer).transfer(campaignManagerAddress, transferAmount);
    await transferTx.wait();
    
    console.log(`Transferred ${ethers.formatEther(transferAmount)} ATT tokens to CampaignManager`);
    
    console.log("Initial token setup completed successfully!");
    
  } catch (error) {
    console.error("Error setting up initial tokens:", error);
  }
}

// Run the script
setupInitialTokens().catch(console.error);
