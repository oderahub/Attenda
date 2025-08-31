"use client";

import { useEffect, useState } from "react";
import { PaginationButton, SearchBar, TransactionsTable } from "./_components";
import type { NextPage } from "next";
import { hardhat } from "viem/chains";
import { useFetchBlocks } from "~~/hooks/scaffold-eth";
import { useTargetNetwork } from "~~/hooks/scaffold-eth/useTargetNetwork";
import { notification } from "~~/utils/scaffold-eth";

const BlockExplorer: NextPage = () => {
  // Temporarily disabled for build fix
  return (
    <div className="container mx-auto my-10">
      <div className="text-center py-8">
        <h1 className="text-2xl font-bold mb-4">Block Explorer</h1>
        <p className="text-muted-foreground">
          Block explorer functionality is temporarily disabled for local development.
        </p>
      </div>
    </div>
  );
};

export default BlockExplorer;
