import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";

/**
 * Deploys the AttendaToken contract
 *
 * @param hre HardhatRuntimeEnvironment object.
 */
const deployAttendaToken: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployer } = await hre.getNamedAccounts();
  const { deploy } = hre.deployments;

  console.log("Deploying AttendaToken...");

  await deploy("AttendaToken", {
    from: deployer,
    log: true,
    autoMine: true,
  });

  const attendaToken = await hre.ethers.getContract("AttendaToken", deployer);
  console.log("AttendaToken deployed to:", await attendaToken.getAddress());

  // Try to get contract info, but don't fail if it doesn't work
  try {
    const token = attendaToken as any;
    console.log("Initial supply:", await token.totalSupply());
    console.log("Token name:", await token.name());
    console.log("Token symbol:", await token.symbol());
  } catch (error) {
    console.log("Contract deployed successfully, but couldn't read initial state (this is normal for some networks)");
    console.log("Error details:", error.message);
  }
};

export default deployAttendaToken;

deployAttendaToken.tags = ["AttendaToken"];
