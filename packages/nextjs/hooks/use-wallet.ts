"use client";

import { useAccount, useConnect, useDisconnect, useBalance } from "wagmi";
import { useEffect } from "react";
import { useAttendaStore } from "@/lib/store";

export function useWallet() {
  const { address, isConnected, isConnecting } = useAccount();
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();
  const { data: balance } = useBalance({
    address,
  });

  const { setConnected, setUserProfile } = useAttendaStore();

  useEffect(() => {
    setConnected(isConnected);
    if (isConnected && address) {
      setUserProfile({
        address,
        availableBalance: balance ? Number.parseFloat(balance.formatted) : 0,
      });
    }
  }, [isConnected, address, balance, setConnected, setUserProfile]);

  const connectWallet = () => {
    const connector = connectors[0]; // Use first available connector
    if (connector) {
      connect({ connector });
    }
  };

  const disconnectWallet = () => {
    disconnect();
    setUserProfile({
      address: undefined,
      availableBalance: 0,
    });
  };

  return {
    address,
    isConnected,
    isConnecting,
    balance: balance?.formatted,
    connectWallet,
    disconnectWallet,
    connectors,
  };
}
