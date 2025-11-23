# 🚨 **HACKATHON DEPLOYMENT CHECKLIST**

## ⏰ **TIMELINE: 2 HOURS REMAINING**

### **Phase 1: Smart Contract Deployment (30 min)**
- [ ] Get LSK testnet tokens from faucet
- [ ] Set DEPLOYER_PRIVATE_KEY in hardhat/.env
- [ ] Run deployment script: `npx hardhat run scripts/deploy-lisk-sepolia.ts --network liskSepolia`
- [ ] Copy deployed contract addresses
- [ ] Verify contracts on Lisk Sepolia explorer

### **Phase 2: Frontend Update (30 min)**
- [ ] Update `packages/nextjs/contracts/deployedContracts.ts` with new addresses
- [ ] Test contract connection locally
- [ ] Fix any remaining TypeScript errors
- [ ] Test basic functionality

### **Phase 3: Frontend Deployment (30 min)**
- [ ] Build frontend: `yarn build`
- [ ] Deploy to Vercel: `yarn vercel --prod`
- [ ] Test deployed frontend
- [ ] Verify IPFS integration works

### **Phase 4: Demo & Submission (30 min)**
- [ ] Record demo video (2-3 minutes)
- [ ] Test complete user flow
- [ ] Take screenshots
- [ ] Submit project

## 🎯 **CRITICAL MVP FEATURES**

### **✅ MUST WORK**
- [ ] Campaign creation with IPFS upload
- [ ] Campaign viewing with attention tracking
- [ ] Proof submission to blockchain
- [ ] Basic reward system
- [ ] Wallet connection

### **🎨 NICE TO HAVE**
- [ ] Attention score visualization
- [ ] Campaign dashboard
- [ ] User profile
- [ ] Transaction history

## 🚨 **EMERGENCY FIXES**

### **If Contracts Fail to Deploy**
- Check LSK balance
- Verify RPC endpoint
- Use alternative deployment method

### **If Frontend Fails to Build**
- Fix TypeScript errors
- Remove unused imports
- Simplify complex components

### **If IPFS Fails**
- Use fallback mock data
- Focus on blockchain functionality
- Document IPFS integration

## 📋 **SUBMISSION REQUIREMENTS**

- [ ] Project name: **Attenda**
- [ ] Description: Attention economy platform
- [ ] Live demo URL: [Your Vercel URL]
- [ ] GitHub repository: [Your repo]
- [ ] Video demo: [2-3 min walkthrough]
- [ ] Screenshots: [Key features]

## 🏆 **SUCCESS METRICS**

- ✅ **Smart contracts deployed** to Lisk Sepolia
- ✅ **Frontend functional** and deployed
- ✅ **Core user flow working** (create → view → track → submit → reward)
- ✅ **IPFS integration** functional
- ✅ **Blockchain interaction** working

## 🎉 **YOU'RE READY TO WIN!**

Your project has:
- **Innovative concept**: Attention economy on blockchain
- **Technical excellence**: Modern web3 stack
- **User experience**: Intuitive interface
- **Real-world value**: Solves attention monetization

**Go crush that hackathon! 🚀**



