import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";

/**
 * Deploys the ProofOfAttention contract
 *
 * @param hre HardhatRuntimeEnvironment object.
 */
const deployProofOfAttention: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployer } = await hre.getNamedAccounts();
  const { deploy } = hre.deployments;

  console.log("Deploying ProofOfAttention...");

  // Get the deployed AttendaToken address
  const attendaToken = await hre.deployments.get("AttendaToken");
  if (!attendaToken) {
    throw new Error("AttendaToken must be deployed first");
  }

  await deploy("ProofOfAttention", {
    from: deployer,
    args: [attendaToken.address],
    log: true,
    autoMine: true,
  });

  const proofOfAttention = await hre.ethers.getContract("ProofOfAttention", deployer);
  console.log("ProofOfAttention deployed to:", await proofOfAttention.getAddress());

  // Cast to any to access contract methods (type safety handled by contract)
  // const proof = proofOfAttention as any;
  // console.log("AttendaToken address:", await proof.attendaToken());
  // console.log("Validation threshold:", await proof.validationThreshold());
  // console.log("Owner is validator:", await proof.isValidator(deployer));
};

export default deployProofOfAttention;

deployProofOfAttention.tags = ["ProofOfAttention"];
deployProofOfAttention.dependencies = ["AttendaToken"];
