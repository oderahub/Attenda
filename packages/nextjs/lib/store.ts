"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

interface Campaign {
  id: string;
  title: string;
  description: string;
  reward: string;
  duration: number;
  participants: number;
  category: string;
  status: string;
  image: string;
  ipfsHash?: string;
  contractAddress?: string;
}

interface AttentionMetrics {
  timeSpent: number;
  scrollDepth: number;
  interactions: number;
  focusTime: number;
  attentionScore: number;
}

interface UserProfile {
  address?: string;
  username?: string;
  totalEarned: number;
  totalCampaigns: number;
  averageAttention: number;
  currentStreak: number;
  rank: string;
  stakingBalance: number;
  availableBalance: number;
}

interface AttendaStore {
  // User state
  userProfile: UserProfile;
  isConnected: boolean;

  // Campaign state
  campaigns: Campaign[];
  activeCampaign: Campaign | null;
  attentionMetrics: AttentionMetrics;

  // IPFS state
  uploadProgress: number;
  isUploading: boolean;

  // Actions
  setUserProfile: (profile: Partial<UserProfile>) => void;
  setConnected: (connected: boolean) => void;
  setCampaigns: (campaigns: Campaign[]) => void;
  setActiveCampaign: (campaign: Campaign | null) => void;
  updateAttentionMetrics: (metrics: Partial<AttentionMetrics>) => void;
  setUploadProgress: (progress: number) => void;
  setUploading: (uploading: boolean) => void;
  resetAttentionMetrics: () => void;
}

export const useAttendaStore = create<AttendaStore>()(
  persist(
    set => ({
      // Initial state
      userProfile: {
        totalEarned: 0,
        totalCampaigns: 0,
        averageAttention: 0,
        currentStreak: 0,
        rank: "Bronze",
        stakingBalance: 0,
        availableBalance: 0,
      },
      isConnected: false,
      campaigns: [],
      activeCampaign: null,
      attentionMetrics: {
        timeSpent: 0,
        scrollDepth: 0,
        interactions: 0,
        focusTime: 0,
        attentionScore: 0,
      },
      uploadProgress: 0,
      isUploading: false,

      // Actions
      setUserProfile: profile =>
        set(state => ({
          userProfile: { ...state.userProfile, ...profile },
        })),

      setConnected: connected => set({ isConnected: connected }),

      setCampaigns: campaigns => set({ campaigns }),

      setActiveCampaign: campaign => set({ activeCampaign: campaign }),

      updateAttentionMetrics: metrics =>
        set(state => ({
          attentionMetrics: { ...state.attentionMetrics, ...metrics },
        })),

      setUploadProgress: progress => set({ uploadProgress: progress }),

      setUploading: uploading => set({ isUploading: uploading }),

      resetAttentionMetrics: () =>
        set({
          attentionMetrics: {
            timeSpent: 0,
            scrollDepth: 0,
            interactions: 0,
            focusTime: 0,
            attentionScore: 0,
          },
        }),
    }),
    {
      name: "attenda-store",
      partialize: state => ({
        userProfile: state.userProfile,
        campaigns: state.campaigns,
      }),
    },
  ),
);
