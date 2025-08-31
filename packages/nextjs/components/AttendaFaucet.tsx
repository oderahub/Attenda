"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Coins, Loader2, CheckCircle } from "lucide-react";
import { useAttendaToken } from "@/hooks/use-contracts";
import { useAccount } from "wagmi";
import { useToast } from "@/hooks/use-toast";

export function AttendaFaucet() {
  const [isMinting, setIsMinting] = useState(false);
  const [hasMinted, setHasMinted] = useState(false);
  
  const { address, isConnected } = useAccount();
  const { mintForTesting, getBalance, refetchBalance, isConfirmed } = useAttendaToken();
  const { toast } = useToast();
  
  const [balance, setBalance] = useState("0");

  const handleMintTokens = async () => {
    if (!isConnected || !address) {
      toast({
        title: "Wallet not connected",
        description: "Please connect your wallet to mint tokens",
        variant: "destructive",
      });
      return;
    }

    setIsMinting(true);
    try {
      // Mint 1000 ATT tokens using the public testing function
      const amount = "1000";
      await mintForTesting(amount);
      
      toast({
        title: "Transaction submitted",
        description: "Your mint transaction has been submitted to the blockchain",
      });
      
    } catch (error) {
      console.error("Minting error:", error);
      toast({
        title: "Minting failed",
        description: "There was an error submitting the mint transaction",
        variant: "destructive",
      });
      setIsMinting(false);
    }
  };

  const refreshBalance = async () => {
    if (address) {
      const newBalance = await getBalance();
      setBalance(newBalance);
    }
  };

  // Refresh balance when address changes
  useEffect(() => {
    if (address) {
      refreshBalance();
    }
  }, [address]);

  // Watch for transaction confirmation and refresh balance
  useEffect(() => {
    if (isConfirmed) {
      setHasMinted(true);
      setIsMinting(false);
      
      // Refresh balance after successful mint
      setTimeout(() => {
        refetchBalance();
        refreshBalance();
      }, 1000);
      
      toast({
        title: "Tokens minted successfully!",
        description: "You received 1000 ATT tokens",
      });
    }
  }, [isConfirmed, refetchBalance, toast]);

  if (!isConnected) {
    return null;
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Coins className="h-5 w-5 text-yellow-500" />
          ATT Token Faucet
        </CardTitle>
        <CardDescription>
          Get free ATT tokens for testing campaigns
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Current Balance:</span>
          <Badge variant="secondary" className="text-lg">
            {balance} ATT
          </Badge>
        </div>
        
        {!hasMinted ? (
          <Button 
            onClick={handleMintTokens} 
            disabled={isMinting}
            className="w-full"
          >
            {isMinting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Minting...
              </>
            ) : (
              <>
                <Coins className="w-4 h-4 mr-2" />
                Mint 1000 ATT Tokens
              </>
            )}
          </Button>
        ) : (
          <div className="flex items-center gap-2 text-green-600 bg-green-50 p-3 rounded-lg">
            <CheckCircle className="w-5 h-5" />
            <span className="text-sm font-medium">Tokens minted successfully!</span>
          </div>
        )}
        
        <Button 
          variant="outline" 
          onClick={refreshBalance}
          className="w-full"
        >
          Refresh Balance
        </Button>
        
        <div className="text-xs text-muted-foreground text-center">
          This faucet is only available on the local hardhat network for testing purposes.
        </div>
      </CardContent>
    </Card>
  );
}
