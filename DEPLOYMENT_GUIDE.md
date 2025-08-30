# Attenda MVP Deployment Guide

## 🚀 **Quick Start**

### **Prerequisites**
- Node.js >= v18.17
- Yarn package manager
- Git

### **1. Clone and Setup**
```bash
git clone <repository-url>
cd scaffold-lisk
yarn install
```

### **2. Local Development**
```bash
# Terminal 1: Start local Hardhat network
yarn chain

# Terminal 2: Deploy contracts
yarn deploy

# Terminal 3: Start frontend
yarn start
```

### **3. Run Tests**
```bash
yarn hardhat:test
```

## 🌐 **Network Deployment**

### **Lisk Sepolia Testnet**

1. **Get Testnet ETH**
   - Visit: https://app.optimism.io/faucet
   - Request Sepolia ETH for Lisk network

2. **Configure Environment**
   ```bash
   cd packages/hardhat
   cp .env.example .env
   ```

3. **Set Private Key**
   ```bash
   # .env file
   DEPLOYER_PRIVATE_KEY="your_private_key_with_sepolia_ETH"
   ```

4. **Deploy to Testnet**
   ```bash
   yarn deploy --network liskSepolia
   ```

### **Other Networks**

The system supports deployment to multiple networks:
- **Ethereum**: Mainnet, Sepolia
- **L2 Solutions**: Optimism, Arbitrum, Base, Scroll
- **Polygon**: Mainnet, Mumbai, zkEVM
- **Custom**: Any EVM-compatible network

## 📋 **Deployment Order**

Contracts must be deployed in this specific order:

1. **AttendaToken** - ERC20 token contract
2. **CampaignManager** - Depends on AttendaToken
3. **ProofOfAttention** - Depends on AttendaToken

## 🔧 **Configuration**

### **Hardhat Config**
```typescript
// packages/hardhat/hardhat.config.ts
networks: {
  liskSepolia: {
    url: "https://rpc.sepolia-api.lisk.com",
    accounts: [process.env.DEPLOYER_PRIVATE_KEY],
  }
}
```

### **Frontend Config**
```typescript
// packages/nextjs/scaffold.config.ts
targetNetworks: [chains.hardhat, liskSepolia]
```

## 📊 **Contract Addresses**

After deployment, contract addresses will be:
- Stored in `packages/nextjs/contracts/deployedContracts.ts`
- Automatically generated and updated
- Available in the frontend for contract interactions

## 🧪 **Verification**

### **Contract Verification**
```bash
# Verify on Lisk Blockscout
yarn verify --network liskSepolia <contract-address> <constructor-args>
```

### **Test Deployment**
```bash
# Run full test suite
yarn hardhat:test

# Check gas usage
yarn hardhat:test --gas
```

## 🚨 **Troubleshooting**

### **Common Issues**

1. **Network Connection Failed**
   - Check RPC endpoint availability
   - Verify network configuration
   - Ensure sufficient testnet ETH

2. **Deployment Failed**
   - Check private key format
   - Verify sufficient gas
   - Review contract compilation errors

3. **Frontend Issues**
   - Check contract addresses
   - Verify network configuration
   - Review browser console errors

### **Debug Commands**
```bash
# Check network status
yarn hardhat node --network hardhat

# Compile contracts
yarn compile

# Generate types
yarn generate

# Check deployment status
yarn hardhat:deployments
```

## 📈 **Monitoring**

### **Post-Deployment**
- Monitor contract events
- Track user interactions
- Monitor gas usage
- Validate reward distributions

### **Analytics**
- Campaign performance metrics
- User engagement rates
- Token circulation data
- Platform fee collection

## 🔐 **Security Checklist**

- [ ] Private keys secured
- [ ] Contract addresses verified
- [ ] Access controls tested
- [ ] Emergency functions tested
- [ ] Gas limits optimized
- [ ] Reentrancy protection verified

## 📞 **Support**

For deployment issues:
1. Check test results
2. Review contract logs
3. Verify network configuration
4. Consult documentation
5. Open GitHub issue

## 🎯 **Next Steps**

After successful deployment:
1. **Frontend Development**: Build user interface
2. **Testing**: User acceptance testing
3. **Audit**: Security audit (recommended)
4. **Mainnet**: Production deployment
5. **Marketing**: User acquisition campaigns 