import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";

/**
 * Deploys the CampaignManager contract
 *
 * @param hre HardhatRuntimeEnvironment object.
 */
const deployCampaignManager: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployer } = await hre.getNamedAccounts();
  const { deploy } = hre.deployments;

  console.log("Deploying CampaignManager...");

  // Get the deployed AttendaToken address
  const attendaToken = await hre.deployments.get("AttendaToken");
  if (!attendaToken) {
    throw new Error("AttendaToken must be deployed first");
  }

  await deploy("CampaignManager", {
    from: deployer,
    args: [attendaToken.address],
    log: true,
    autoMine: true,
  });

  const campaignManager = await hre.ethers.getContract("CampaignManager", deployer);
  console.log("CampaignManager deployed to:", await campaignManager.getAddress());

  // Cast to any to access contract methods (type safety handled by contract)
  const manager = campaignManager as any;
  console.log("AttendaToken address:", await manager.attendaToken());
  console.log("Platform fee:", await manager.platformFee());
};

export default deployCampaignManager;

deployCampaignManager.tags = ["CampaignManager"];
deployCampaignManager.dependencies = ["AttendaToken"];
