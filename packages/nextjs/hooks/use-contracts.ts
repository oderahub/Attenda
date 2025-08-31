"use client";

import { useWriteContract, useReadContract, useWaitForTransactionReceipt, useAccount } from "wagmi";
import { parseEther, formatEther } from "viem";
import deployedContracts from "@/contracts/deployedContracts";

// Contract addresses from deployed contracts
const ATTENDA_TOKEN_ADDRESS = deployedContracts[31337]?.AttendaToken?.address as `0x${string}`;
const CAMPAIGN_MANAGER_ADDRESS = deployedContracts[31337]?.CampaignManager?.address as `0x${string}`;
const PROOF_OF_ATTENTION_ADDRESS = deployedContracts[31337]?.ProofOfAttention?.address as `0x${string}`;

// Contract ABIs from deployed contracts
const ATTENDA_TOKEN_ABI = deployedContracts[31337]?.AttendaToken?.abi;
const CAMPAIGN_MANAGER_ABI = deployedContracts[31337]?.CampaignManager?.abi;
const PROOF_OF_ATTENTION_ABI = deployedContracts[31337]?.ProofOfAttention?.abi;

export function useAttendaToken() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
  });
  const { address } = useAccount();

  // Read balance hook
  const { data: balanceData, refetch: refetchBalance } = useReadContract({
    address: ATTENDA_TOKEN_ADDRESS,
    abi: ATTENDA_TOKEN_ABI,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
  });

  const getBalance = () => {
    return balanceData ? formatEther(balanceData) : "0";
  };

  const transfer = (to: `0x${string}`, amount: string) => {
    if (!ATTENDA_TOKEN_ADDRESS || !ATTENDA_TOKEN_ABI) return;

    writeContract({
      address: ATTENDA_TOKEN_ADDRESS,
      abi: ATTENDA_TOKEN_ABI,
      functionName: "transfer",
      args: [to, parseEther(amount)],
    });
  };

  const approve = (spender: `0x${string}`, amount: string) => {
    if (!ATTENDA_TOKEN_ADDRESS || !ATTENDA_TOKEN_ABI) return;

    writeContract({
      address: ATTENDA_TOKEN_ADDRESS,
      abi: ATTENDA_TOKEN_ABI,
      functionName: "approve",
      args: [spender, parseEther(amount)],
    });
  };

  return {
    getBalance,
    transfer,
    approve,
    refetchBalance,
    hash,
    isPending,
    isConfirming,
    isConfirmed,
    error,
  };
}

export function useCampaignManager() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
  });

  const createCampaign = (
    title: string,
    description: string,
    ipfsHash: string,
    rewardAmount: string,
    maxParticipants: number,
    duration: number,
  ) => {
    if (!CAMPAIGN_MANAGER_ADDRESS || !CAMPAIGN_MANAGER_ABI) return;

    writeContract({
      address: CAMPAIGN_MANAGER_ADDRESS,
      abi: CAMPAIGN_MANAGER_ABI,
      functionName: "createCampaign",
      args: [title, description, ipfsHash, parseEther(rewardAmount), BigInt(maxParticipants), BigInt(duration)],
    });
  };

  const submitProof = (campaignId: number, watchTime: number) => {
    if (!CAMPAIGN_MANAGER_ADDRESS || !CAMPAIGN_MANAGER_ABI) return;

    writeContract({
      address: CAMPAIGN_MANAGER_ADDRESS,
      abi: CAMPAIGN_MANAGER_ABI,
      functionName: "submitProof",
      args: [BigInt(campaignId), BigInt(watchTime)],
    });
  };

  const verifyProof = (proofId: number) => {
    if (!CAMPAIGN_MANAGER_ADDRESS || !CAMPAIGN_MANAGER_ABI) return;

    writeContract({
      address: CAMPAIGN_MANAGER_ADDRESS,
      abi: CAMPAIGN_MANAGER_ABI,
      functionName: "verifyProof",
      args: [BigInt(proofId)],
    });
  };

  const distributeRewards = (proofId: number) => {
    if (!CAMPAIGN_MANAGER_ADDRESS || !CAMPAIGN_MANAGER_ABI) return;

    writeContract({
      address: CAMPAIGN_MANAGER_ADDRESS,
      abi: CAMPAIGN_MANAGER_ABI,
      functionName: "distributeRewards",
      args: [BigInt(proofId)],
    });
  };

  const completeCampaign = (campaignId: number) => {
    if (!CAMPAIGN_MANAGER_ADDRESS || !CAMPAIGN_MANAGER_ABI) return;

    writeContract({
      address: CAMPAIGN_MANAGER_ADDRESS,
      abi: CAMPAIGN_MANAGER_ABI,
      functionName: "completeCampaign",
      args: [BigInt(campaignId)],
    });
  };

  return {
    createCampaign,
    submitProof,
    verifyProof,
    distributeRewards,
    completeCampaign,
    hash,
    isPending,
    isConfirming,
    isConfirmed,
    error,
  };
}

export function useCampaign(campaignId: number) {
  const { data: campaign, refetch: refetchCampaign } = useReadContract({
    address: CAMPAIGN_MANAGER_ADDRESS,
    abi: CAMPAIGN_MANAGER_ABI,
    functionName: "getCampaign",
    args: [BigInt(campaignId)],
  });

  return {
    campaign,
    refetchCampaign,
  };
}

export function useTotalCampaigns() {
  const { data: totalCampaigns, refetch: refetchTotal } = useReadContract({
    address: CAMPAIGN_MANAGER_ADDRESS,
    abi: CAMPAIGN_MANAGER_ABI,
    functionName: "getTotalCampaigns",
  });

  return {
    totalCampaigns: totalCampaigns ? Number(totalCampaigns) : 0,
    refetchTotal,
  };
}

export function useProofOfAttention() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
  });

  const submitProof = (campaignId: number, watchDuration: number, ipfsProofHash: string) => {
    if (!PROOF_OF_ATTENTION_ADDRESS || !PROOF_OF_ATTENTION_ABI) return;

    writeContract({
      address: PROOF_OF_ATTENTION_ADDRESS,
      abi: PROOF_OF_ATTENTION_ABI,
      functionName: "submitProof",
      args: [BigInt(campaignId), BigInt(watchDuration), ipfsProofHash],
    });
  };

  const validateProof = (proofId: number) => {
    if (!PROOF_OF_ATTENTION_ADDRESS || !PROOF_OF_ATTENTION_ABI) return;

    writeContract({
      address: PROOF_OF_ATTENTION_ADDRESS,
      abi: PROOF_OF_ATTENTION_ABI,
      functionName: "validateProof",
      args: [BigInt(proofId)],
    });
  };

  const distributeReward = (proofId: number) => {
    if (!PROOF_OF_ATTENTION_ADDRESS || !PROOF_OF_ATTENTION_ABI) return;

    writeContract({
      address: PROOF_OF_ATTENTION_ADDRESS,
      abi: PROOF_OF_ATTENTION_ABI,
      functionName: "distributeReward",
      args: [BigInt(proofId)],
    });
  };

  return {
    submitProof,
    validateProof,
    distributeReward,
    hash,
    isPending,
    isConfirming,
    isConfirmed,
    error,
  };
}

export function useProof(proofId: number) {
  const { data: proof, refetch: refetchProof } = useReadContract({
    address: PROOF_OF_ATTENTION_ADDRESS,
    abi: PROOF_OF_ATTENTION_ABI,
    functionName: "getProof",
    args: [BigInt(proofId)],
  });

  return {
    proof,
    refetchProof,
  };
}
