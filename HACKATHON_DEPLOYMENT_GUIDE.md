# 🚀 HACKATHON MVP DEPLOYMENT GUIDE

## ⚡ QUICK DEPLOY TO LISK SEPOLIA

### Step 1: Get Testnet LSK
1. Go to [Lisk Sepolia Faucet](https://sepolia-faucet.lisk.com/)
2. Connect your wallet
3. Request testnet LSK tokens

### Step 2: Set Environment Variables
```bash
cd packages/hardhat
echo "DEPLOYER_PRIVATE_KEY=your_private_key_here" > .env
```

### Step 3: Deploy Contracts
```bash
npx hardhat run scripts/deploy-lisk-sepolia.ts --network liskSepolia
```

### Step 4: Update Frontend
Copy the deployed addresses to `packages/nextjs/contracts/deployedContracts.ts`

### Step 5: Deploy Frontend
```bash
cd packages/nextjs
yarn build
yarn vercel --prod
```

## 🎯 MVP FEATURES READY

✅ **Smart Contracts**
- AttendaToken (ERC20)
- CampaignManager
- ProofOfAttention
- BuyMeACoffee

✅ **Frontend**
- Dashboard
- Campaign Creation
- Attention Tracking
- Proof Submission
- IPFS Integration

✅ **Core Flow**
1. Create campaign → IPFS + Blockchain
2. View campaign → Track attention
3. Submit proof → IPFS + Blockchain
4. Claim rewards → Token distribution

## 🚨 HACKATHON PRIORITIES

1. **Deploy to Lisk Sepolia** (30 min)
2. **Test basic flow** (30 min)
3. **Record demo video** (30 min)
4. **Submit project** (30 min)

## 🔧 TROUBLESHOOTING

- **Out of gas**: Get more LSK from faucet
- **RPC issues**: Use alternative RPC endpoints
- **Contract errors**: Check deployment logs

## 🎉 SUCCESS METRICS

- ✅ Contracts deployed to Lisk Sepolia
- ✅ Frontend connected to contracts
- ✅ Basic attention tracking working
- ✅ Proof submission functional
- ✅ IPFS integration working

**Your Attenda MVP is ready to win! 🏆**

