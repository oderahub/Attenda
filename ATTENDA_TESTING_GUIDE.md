# 🧪 Attenda MVP Testing Guide

## 🚀 **Complete Testing Workflow for Attenda MVP**

This guide will walk you through testing all the flows you've envisioned for your Attenda MVP system.

## 📋 **Prerequisites**

✅ **Contracts Deployed**: All smart contracts are deployed and tested (108 tests passing)  
✅ **Local Network Running**: Hardhat local network is active  
✅ **Frontend Running**: Next.js app is accessible at `http://localhost:3000`  
✅ **MetaMask Connected**: Wallet connected to local Hardhat network  

---

## 🔹 **1. Advertiser Flow Testing**

### **Step 1: Connect Wallet**
1. Open `http://localhost:3000` in your browser
2. Click "Connect Wallet" button
3. **Expected Result**: MetaMask should connect and display your address
4. **Verify**: Check that the connected address is displayed on the homepage

### **Step 2: Create Campaign**
1. Navigate to the Debug Contracts page (`/debug`)
2. **Test Campaign Creation**:
   ```solidity
   // Function: createCampaign
   // Parameters:
   title: "Test Ad Campaign"
   description: "A test campaign for attention rewards"
   ipfsHash: "QmTestHash123456789"
   rewardAmount: "1000000000000000000" // 1 ATT token
   maxParticipants: 100
   duration: 300 // 5 minutes in seconds
   ```

3. **Expected Results**:
   - Transaction should succeed
   - Campaign ID should be returned
   - Campaign should be created and active
   - Advertiser's tokens should be locked in escrow

### **Step 3: View Dashboard**
1. **Check Campaign Status**:
   - Campaign should be listed as active
   - Budget should show the locked amount
   - Participant count should be 0
   - Duration should be counting down

---

## 🔹 **2. User Flow Testing**

### **Step 1: Connect Different Wallet**
1. **Switch to User Account**:
   - Use MetaMask to switch to a different account
   - Or import a new test account from Hardhat
   - **Expected**: New address should be displayed

### **Step 2: Browse Campaigns**
1. **View Available Campaigns**:
   - User should see the test campaign created by advertiser
   - Display should show:
     - Campaign thumbnail (IPFS image)
     - Reward per view (1 ATT)
     - "View Ad" button
     - Campaign duration remaining

### **Step 3: View Advertisement (Proof-of-Attention)**
1. **Start Ad Viewing**:
   - Click "View Ad" button
   - Modal/page should open with ad content
   - Timer should start (5 seconds countdown)
   - Progress bar should fill up

2. **Complete Viewing Process**:
   - Keep ad in focus until timer completes
   - **Expected**: Timer reaches 0, view is marked as complete

### **Step 4: Receive Reward**
1. **Reward Distribution**:
   - Frontend should call `completeView(campaignId)` on contract
   - **Expected Results**:
     - 1 ATT token transferred from campaign budget to user
     - `RewardDistributed` event emitted
     - Toast notification: "You earned 1 ATT token 🎉"
     - User's balance should increase

---

## 🔹 **3. Smart Contract Flow Testing**

### **AttendaToken Testing**
1. **Check Token Balance**:
   ```solidity
   // Function: balanceOf
   // Parameter: userAddress
   // Expected: Should return user's ATT token balance
   ```

2. **Test Token Transfers**:
   ```solidity
   // Function: transfer
   // Parameters: recipient, amount
   // Expected: Tokens should transfer between accounts
   ```

### **CampaignManager Testing**
1. **Campaign Creation**:
   ```solidity
   // Function: createCampaign
   // Verify: Campaign data stored, tokens locked
   ```

2. **Proof Submission**:
   ```solidity
   // Function: submitProof
   // Verify: Proof recorded, user marked as participant
   ```

3. **Reward Distribution**:
   ```solidity
   // Function: completeView
   // Verify: Tokens transferred, campaign budget updated
   ```

### **ProofOfAttention Testing**
1. **Proof Validation**:
   ```solidity
   // Function: validateProof
   // Verify: Multi-validator consensus working
   ```

2. **Reward Calculation**:
   ```solidity
   // Function: distributeReward
   // Verify: Dynamic rewards based on engagement
   ```

---

## 🔹 **4. Off-Chain Services Testing**

### **IPFS Integration**
1. **Upload Test Image**:
   - Use IPFS service to upload a test advertisement image
   - Get the CID (Content Identifier)
   - Use this CID in campaign creation

2. **Content Retrieval**:
   - Verify ad content loads from IPFS
   - Check that images display correctly in frontend

---

## 🧪 **Manual Testing Commands**

### **Using Hardhat Console**
```bash
# Start Hardhat console
yarn hardhat console

# Get contract instances
const AttendaToken = await ethers.getContractFactory("AttendaToken")
const token = await AttendaToken.attach("0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9")

const CampaignManager = await ethers.getContractFactory("CampaignManager")
const manager = await CampaignManager.attach("0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9")

# Test functions
await token.balanceOf("0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266")
await manager.createCampaign("Test", "Description", "QmHash", ethers.utils.parseEther("1"), 100, 300)
```

### **Using Hardhat Console**
```bash
# Start Hardhat console for interactive testing
yarn hardhat console

# Get contract instances
const AttendaToken = await ethers.getContractFactory("AttendaToken")
const token = await AttendaToken.attach("0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9")

const CampaignManager = await ethers.getContractFactory("CampaignManager")
const manager = await CampaignManager.attach("0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9")

# Test functions
await token.balanceOf("0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266")
await manager.createCampaign("Test", "Description", "QmHash", ethers.utils.parseEther("1"), 100, 300)
```

---

## 🔍 **Testing Checklist**

### **Advertiser Flow** ✅
- [ ] Wallet connection works
- [ ] Campaign creation succeeds
- [ ] Tokens are locked in escrow
- [ ] Campaign dashboard displays correctly
- [ ] Campaign metadata is accurate

### **User Flow** ✅
- [ ] User can browse campaigns
- [ ] Ad viewing process works
- [ ] Timer and progress bar function
- [ ] Rewards are distributed correctly
- [ ] User balance updates properly

### **Smart Contract Integration** ✅
- [ ] All contract functions work
- [ ] Events are emitted correctly
- [ ] Gas usage is reasonable
- [ ] Error handling works properly
- [ ] Access control is enforced

### **Contract Integration** ✅
- [ ] All contract functions work
- [ ] Events are emitted correctly
- [ ] Gas usage is reasonable
- [ ] Error handling works properly
- [ ] Access control is enforced

---

## 🚨 **Common Issues & Solutions**

### **Issue: "Cannot connect to network localhost"**
**Solution**: Make sure Hardhat network is running with `yarn chain`

### **Issue: "Contract not found"**
**Solution**: Verify contracts are deployed with `yarn deploy`

### **Issue: "Insufficient funds"**
**Solution**: Use Hardhat faucet or mint tokens to test accounts

### **Issue: "Transaction failed"**
**Solution**: Check gas limits and ensure account has enough ETH

---

## 📊 **Testing Results Tracking**

| Test Category | Status | Notes |
|---------------|--------|-------|
| Advertiser Flow | ⏳ | In Progress |
| User Flow | ⏳ | In Progress |
| Smart Contracts | ✅ | 108 tests passing |
| Contract Integration | ✅ | All functions working |
| IPFS Integration | ⏳ | In Progress |

---

## 🎯 **Next Steps After Testing**

1. **Fix Any Issues**: Address bugs or failures found during testing
2. **Performance Optimization**: Optimize gas usage and transaction costs
3. **User Experience**: Improve UI/UX based on testing feedback
4. **Security Audit**: Conduct thorough security review
5. **Mainnet Deployment**: Deploy to Lisk mainnet when ready

---

## 📚 **Additional Resources**

- **Contract Addresses**: Check `deployments/localhost/` for deployed addresses
- **Test Files**: Review `packages/hardhat/test/` for comprehensive test coverage
- **Deployment Scripts**: Check `packages/hardhat/deploy/` for contract deployment
- **Configuration**: Check `hardhat.config.ts` for network settings

---

**Happy Testing! 🚀** Your Attenda MVP is ready for comprehensive testing of all the flows you've envisioned.
