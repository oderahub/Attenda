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

  // Cast to any to access contract methods (type safety handled by contract)
  const token = attendaToken as any;
  console.log("Initial supply:", await token.totalSupply());
  console.log("Token name:", await token.name());
  console.log("Token symbol:", await token.symbol());
};

export default deployAttendaToken;

deployAttendaToken.tags = ["AttendaToken"];
