"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Wallet, Copy, ExternalLink } from "lucide-react";
import { useWallet } from "@/hooks/use-wallet";
import { useAttendaToken } from "@/hooks/use-contracts";

export function WalletStatus() {
  const { address, isConnected, balance, connectWallet } = useWallet();
  const { getBalance } = useAttendaToken();

  const attBalance = address ? getBalance(address as `0x${string}`) : null;

  const copyAddress = () => {
    if (address) {
      navigator.clipboard.writeText(address);
    }
  };

  const openEtherscan = () => {
    if (address) {
      window.open(`https://etherscan.io/address/${address}`, "_blank");
    }
  };

  if (!isConnected) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Wallet Status</CardTitle>
          <Wallet className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-destructive mb-2">Disconnected</div>
          <Button onClick={connectWallet} size="sm" className="w-full">
            Connect Wallet
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Wallet Status</CardTitle>
        <Badge variant="outline" className="text-green-600 border-green-600">
          Connected
        </Badge>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm">Address</span>
          <div className="flex items-center gap-1">
            <span className="font-mono text-xs">
              {address?.slice(0, 6)}...{address?.slice(-4)}
            </span>
            <Button variant="ghost" size="sm" onClick={copyAddress}>
              <Copy className="w-3 h-3" />
            </Button>
            <Button variant="ghost" size="sm" onClick={openEtherscan}>
              <ExternalLink className="w-3 h-3" />
            </Button>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm">ETH Balance</span>
          <span className="font-medium">{balance ? Number.parseFloat(balance).toFixed(4) : "0.0000"} ETH</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm">ATT Balance</span>
          <span className="font-medium">
            {attBalance?.data ? Number.parseFloat(attBalance.data.toString()).toFixed(2) : "0.00"} ATT
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
