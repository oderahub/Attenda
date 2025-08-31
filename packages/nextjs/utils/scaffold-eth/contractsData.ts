import scaffoldConfig from "~~/scaffold.config";
import { contracts } from "~~/utils/scaffold-eth/contract";

export function getAllContracts() {
  if (!scaffoldConfig.targetNetworks || scaffoldConfig.targetNetworks.length === 0) {
    return {};
  }
  
  const contractsData = contracts?.[scaffoldConfig.targetNetworks[0].id];
  return contractsData ? contractsData : {};
}
