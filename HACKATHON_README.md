# 🎯 **ATTENDA - Attention Economy MVP**

## 🚀 **Hackathon Project: Decentralized Attention Rewards**

**Attenda** is a revolutionary platform that rewards users for their genuine attention to digital content using blockchain technology and IPFS storage.

## ✨ **Key Features**

### 🔐 **Smart Contracts (Deployed on Lisk Sepolia)**
- **AttendaToken**: ERC20 token for rewards
- **CampaignManager**: Create and manage advertising campaigns
- **ProofOfAttention**: Validate and reward user attention
- **BuyMeACoffee**: Bonus donation system

### 🎨 **Frontend (Next.js + Wagmi v2)**
- **Dashboard**: Browse available campaigns
- **Campaign Creation**: Upload content to IPFS + deploy to blockchain
- **Attention Tracking**: Real-time monitoring of user engagement
- **Proof Submission**: Submit attention proof for rewards
- **Reward System**: Claim ATT tokens for attention

### 🌐 **IPFS Integration**
- **Pinata Service**: Decentralized content storage
- **Proof Storage**: Attention metrics stored on IPFS
- **Content Permanence**: Campaign content never disappears

## 🎯 **How It Works**

1. **Advertisers** create campaigns with content and rewards
2. **Users** view campaigns while attention is tracked
3. **Proof** of attention is submitted to IPFS + blockchain
4. **Rewards** are distributed in ATT tokens
5. **Validators** ensure proof authenticity

## 🛠 **Tech Stack**

- **Blockchain**: Lisk Sepolia Testnet
- **Smart Contracts**: Solidity + Hardhat
- **Frontend**: Next.js 15 + React 19
- **Web3**: Wagmi v2 + Viem v2
- **Storage**: IPFS (Pinata)
- **State**: Zustand
- **UI**: Tailwind CSS + Radix UI

## 🚀 **Quick Start**

### 1. **Deploy Contracts**
```bash
cd packages/hardhat
npx hardhat run scripts/deploy-lisk-sepolia.ts --network liskSepolia
```

### 2. **Update Frontend**
```bash
cd packages/nextjs
ts-node scripts/update-contracts.ts
```

### 3. **Deploy Frontend**
```bash
yarn build
yarn vercel --prod
```

## 🎬 **Demo Flow**

1. **Create Campaign**: Upload image/video + set rewards
2. **View Campaign**: Start attention tracking
3. **Interact**: Scroll, click, move mouse
4. **Submit Proof**: Stop tracking + submit proof
5. **Claim Rewards**: Receive ATT tokens

## 🌟 **Innovation Highlights**

- **First-of-its-kind**: Attention economy on blockchain
- **IPFS Integration**: Decentralized content storage
- **Real-time Tracking**: Live attention metrics
- **Proof Validation**: Multi-validator system
- **Token Economics**: ATT token rewards

## 🔗 **Live Demo**

- **Frontend**: [Your Vercel URL]
- **Blockchain**: Lisk Sepolia Testnet
- **Explorer**: https://sepolia-blockscout.lisk.com

## 📱 **Screenshots**

- Dashboard with campaigns
- Campaign creation form
- Attention tracking interface
- Proof submission
- Reward claiming

## 🏆 **Hackathon Impact**

This project demonstrates:
- **Blockchain Innovation**: Novel use case for smart contracts
- **User Experience**: Intuitive attention tracking
- **Technical Excellence**: Modern web3 stack
- **Real-world Value**: Attention economy implementation

## 🚀 **Future Roadmap**

- Multi-chain deployment
- Advanced attention metrics
- Validator incentives
- Mobile app
- Enterprise partnerships

---

**Built with ❤️ for the hackathon community**

*Attenda - Where Attention Meets Rewards*
