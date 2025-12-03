#!/usr/bin/env node

/**
 * Quick script to update deployedContracts.ts with new addresses
 * Usage: ts-node scripts/update-contracts.ts
 */

import fs from 'fs';
import path from 'path';

interface ContractAddresses {
  AttendaToken: string;
  CampaignManager: string;
  ProofOfAttention: string;
  BuyMeACoffee: string;
}

export function updateContracts(chainId: number, addresses: ContractAddresses) {
  const contractsPath = path.join(__dirname, '../contracts/deployedContracts.ts');
  
  if (!fs.existsSync(contractsPath)) {
    console.error('❌ deployedContracts.ts not found');
    return;
  }

  let content = fs.readFileSync(contractsPath, 'utf8');
  
  // Update AttendaToken
  content = content.replace(
    /AttendaToken:\s*{[^}]*address:\s*"[^"]*"/,
    `AttendaToken: {
      address: "${addresses.AttendaToken}"`
  );
  
  // Update CampaignManager
  content = content.replace(
    /CampaignManager:\s*{[^}]*address:\s*"[^"]*"/,
    `CampaignManager: {
      address: "${addresses.CampaignManager}"`
  );
  
  // Update ProofOfAttention
  content = content.replace(
    /ProofOfAttention:\s*{[^}]*address:\s*"[^"]*"/,
    `ProofOfAttention: {
      address: "${addresses.ProofOfAttention}"`
  );
  
  // Update BuyMeACoffee
  content = content.replace(
    /BuyMeACoffee:\s*{[^}]*address:\s*"[^"]*"/,
    `BuyMeACoffee: {
      address: "${addresses.BuyMeACoffee}"`
  );
  
  fs.writeFileSync(contractsPath, content);
  console.log(`✅ Updated contracts for chain ${chainId}`);
}

// Example usage - replace with actual addresses after deployment
export const celoSepoliaAddresses: ContractAddresses = {
  AttendaToken: "0x...", // Replace with actual address
  CampaignManager: "0x...", // Replace with actual address
  ProofOfAttention: "0x...", // Replace with actual address
  BuyMeACoffee: "0x...", // Replace with actual address
};

// Uncomment and run after deployment
// updateContracts(11142220, celoSepoliaAddresses);

console.log("🔧 Contract Update Script Ready");
console.log("1. Deploy contracts to Celo Sepolia");
console.log("2. Copy addresses from deployment output");
console.log("3. Update celoSepoliaAddresses object");
console.log("4. Uncomment updateContracts call");
console.log("5. Run: ts-node scripts/update-contracts.ts");



