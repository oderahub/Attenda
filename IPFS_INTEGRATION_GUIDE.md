# 🌐 **IPFS Integration Guide for Attenda MVP**

## 🚀 **Integrate IPFS Storage with Your Attention Economy**

This guide will help you integrate IPFS services like Pinata to store advertisement content and proof data for your Attenda MVP system.

---

## 📋 **What You'll Integrate**

✅ **Advertisement Content**: Images, videos, text content  
✅ **Proof Data**: User engagement metrics, timestamps  
✅ **Campaign Metadata**: Descriptions, requirements  
✅ **Decentralized Storage**: IPFS for content permanence  

---

## 🔧 **Step 1: Choose Your IPFS Service**

### **Option A: Pinata (Recommended for Starters)**
- **Free Tier**: 1GB storage, 100 files/month
- **Paid Plans**: Starting at $20/month for more storage
- **Easy API**: Simple REST API integration
- **Pin Management**: Automatic pinning to keep content alive

### **Option B: Infura IPFS**
- **Free Tier**: 5GB storage
- **Enterprise Features**: Advanced pinning strategies
- **API Access**: REST and GraphQL APIs
- **Reliability**: High uptime and performance

### **Option C: Web3.Storage**
- **Free Tier**: 1TB storage
- **Filecoin Integration**: Decentralized storage network
- **Simple API**: Easy to integrate
- **Long-term Storage**: Content stays available

---

## 🚀 **Step 2: Pinata Integration Setup**

### **2.1 Create Pinata Account**
1. Go to [pinata.cloud](https://pinata.cloud)
2. Sign up for a free account
3. Verify your email address
4. Access your API keys

### **2.2 Get API Keys**
1. **API Key**: Found in your account dashboard
2. **Secret Access Key**: Keep this secure
3. **JWT Token**: For authenticated requests

### **2.3 Install Dependencies**
```bash
npm install @pinata/sdk axios
# or
yarn add @pinata/sdk axios
```

---

## 📤 **Step 3: Upload Content to IPFS**

### **3.1 Basic File Upload**
```javascript
import { create } from '@pinata/sdk';

const pinata = create({
  pinataApiKey: 'YOUR_API_KEY',
  pinataSecretApiKey: 'YOUR_SECRET_KEY'
});

async function uploadToIPFS(file) {
  try {
    const result = await pinata.pinFileToIPFS(file);
    return result.IpfsHash; // This is your CID
  } catch (error) {
    console.error('Error uploading to IPFS:', error);
    throw error;
  }
}
```

### **3.2 Upload Advertisement Content**
```javascript
async function uploadAdvertisement(imageFile, metadata) {
  // Upload image first
  const imageHash = await uploadToIPFS(imageFile);
  
  // Create metadata object
  const adMetadata = {
    name: metadata.title,
    description: metadata.description,
    image: `ipfs://${imageHash}`,
    attributes: [
      { trait_type: "Campaign Type", value: "Attention Reward" },
      { trait_type: "Duration", value: metadata.duration },
      { trait_type: "Reward", value: metadata.rewardAmount }
    ]
  };
  
  // Upload metadata
  const metadataHash = await uploadToIPFS(
    new Blob([JSON.stringify(adMetadata)], { type: 'application/json' })
  );
  
  return {
    imageHash,
    metadataHash
  };
}
```

### **3.3 Upload Proof Data**
```javascript
async function uploadProofData(proofData) {
  const proofMetadata = {
    campaignId: proofData.campaignId,
    userId: proofData.userId,
    watchDuration: proofData.watchDuration,
    timestamp: proofData.timestamp,
    engagementMetrics: proofData.metrics,
    ipfsHash: proofData.contentHash
  };
  
  const proofHash = await uploadToIPFS(
    new Blob([JSON.stringify(proofMetadata)], { type: 'application/json' })
  );
  
  return proofHash;
}
```

---

## 🔗 **Step 4: Integrate with Smart Contracts**

### **4.1 Update Campaign Creation**
```solidity
// In your CampaignManager contract
function createCampaign(
    string memory title,
    string memory description,
    string memory ipfsHash,        // IPFS hash of ad content
    string memory metadataHash,    // IPFS hash of metadata
    uint256 rewardAmount,
    uint256 maxParticipants,
    uint256 duration
) external returns (uint256) {
    // ... existing validation logic ...
    
    campaigns[campaignId] = Campaign({
        // ... existing fields ...
        ipfsHash: ipfsHash,
        metadataHash: metadataHash,  // Store metadata hash
        // ... rest of fields ...
    });
    
    emit CampaignCreated(campaignId, msg.sender, title, ipfsHash, metadataHash, rewardAmount);
    return campaignId;
}
```

### **4.2 Update Proof Submission**
```solidity
// In your ProofOfAttention contract
function submitProof(
    uint256 campaignId,
    uint256 watchDuration,
    string memory ipfsProofHash,    // IPFS hash of proof data
    string memory engagementHash    // IPFS hash of engagement metrics
) external returns (uint256) {
    // ... existing validation logic ...
    
    proofs[proofId] = AttentionProof({
        // ... existing fields ...
        ipfsProofHash: ipfsProofHash,
        engagementHash: engagementHash,  // Store engagement data
        // ... rest of fields ...
    });
    
    emit ProofSubmitted(proofId, campaignId, msg.sender, ipfsProofHash, engagementHash);
    return proofId;
}
```

---

## 🌐 **Step 5: Content Retrieval**

### **5.1 Retrieve Advertisement Content**
```javascript
function getAdvertisementContent(ipfsHash) {
  // Use IPFS gateway to retrieve content
  const gateway = 'https://gateway.pinata.cloud/ipfs/';
  const url = gateway + ipfsHash;
  
  return fetch(url)
    .then(response => response.json())
    .then(data => {
      return {
        title: data.name,
        description: data.description,
        imageUrl: data.image.replace('ipfs://', gateway),
        attributes: data.attributes
      };
    });
}
```

### **5.2 Retrieve Proof Data**
```javascript
function getProofData(proofHash) {
  const gateway = 'https://gateway.pinata.cloud/ipfs/';
  const url = gateway + proofHash;
  
  return fetch(url)
    .then(response => response.json())
    .then(data => {
      return {
        campaignId: data.campaignId,
        watchDuration: data.watchDuration,
        engagementMetrics: data.engagementMetrics,
        timestamp: data.timestamp
      };
    });
}
```

---

## 🔒 **Step 6: Security & Best Practices**

### **6.1 Content Validation**
```javascript
function validateIPFSContent(ipfsHash, expectedType) {
  // Validate hash format
  if (!ipfsHash.startsWith('Qm') && !ipfsHash.startsWith('bafy')) {
    throw new Error('Invalid IPFS hash format');
  }
  
  // Check content type
  return fetch(`https://gateway.pinata.cloud/ipfs/${ipfsHash}`)
    .then(response => {
      if (expectedType === 'image') {
        return response.headers.get('content-type').startsWith('image/');
      }
      return true;
    });
}
```

### **6.2 Rate Limiting**
```javascript
class IPFSUploadManager {
  constructor() {
    this.uploadQueue = [];
    this.isProcessing = false;
    this.rateLimit = 1000; // 1 second between uploads
  }
  
  async addToQueue(file) {
    this.uploadQueue.push(file);
    if (!this.isProcessing) {
      this.processQueue();
    }
  }
  
  async processQueue() {
    this.isProcessing = true;
    
    while (this.uploadQueue.length > 0) {
      const file = this.uploadQueue.shift();
      await this.uploadToIPFS(file);
      await new Promise(resolve => setTimeout(resolve, this.rateLimit));
    }
    
    this.isProcessing = false;
  }
}
```

---

## 📱 **Step 7: Frontend Integration**

### **7.1 Upload Component**
```jsx
import React, { useState } from 'react';
import { uploadToIPFS } from '../services/ipfs';

function AdUploadForm({ onUploadComplete }) {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  
  const handleUpload = async () => {
    if (!file) return;
    
    setUploading(true);
    try {
      const ipfsHash = await uploadToIPFS(file);
      onUploadComplete(ipfsHash);
    } catch (error) {
      console.error('Upload failed:', error);
    } finally {
      setUploading(false);
    }
  };
  
  return (
    <div>
      <input 
        type="file" 
        onChange={(e) => setFile(e.target.files[0])}
        accept="image/*,video/*"
      />
      <button onClick={handleUpload} disabled={uploading}>
        {uploading ? 'Uploading...' : 'Upload to IPFS'}
      </button>
    </div>
  );
}
```

### **7.2 Content Display Component**
```jsx
function AdvertisementDisplay({ ipfsHash }) {
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    if (ipfsHash) {
      getAdvertisementContent(ipfsHash)
        .then(setContent)
        .finally(() => setLoading(false));
    }
  }, [ipfsHash]);
  
  if (loading) return <div>Loading advertisement...</div>;
  if (!content) return <div>Advertisement not found</div>;
  
  return (
    <div className="advertisement">
      <img src={content.imageUrl} alt={content.title} />
      <h3>{content.title}</h3>
      <p>{content.description}</p>
    </div>
  );
}
```

---

## 🚨 **Common Issues & Solutions**

### **Issue: "Content not found on IPFS"**
**Solution**: Ensure content is properly pinned and gateway is accessible

### **Issue: "Upload failed"**
**Solution**: Check API keys, rate limits, and file size limits

### **Issue: "Slow content loading"**
**Solution**: Use multiple IPFS gateways and implement caching

---

## 🎯 **Next Steps**

1. **Test IPFS Integration**: Upload and retrieve test content
2. **Implement Caching**: Add local storage for frequently accessed content
3. **Add Multiple Gateways**: Use fallback IPFS gateways for reliability
4. **Monitor Performance**: Track upload/download speeds and success rates

---

## 📚 **Additional Resources**

- **Pinata Documentation**: [docs.pinata.cloud](https://docs.pinata.cloud)
- **IPFS Gateway List**: [ipfs.github.io/public-gateway-checker](https://ipfs.github.io/public-gateway-checker)
- **IPFS Best Practices**: [docs.ipfs.io](https://docs.ipfs.io)

---

**Your Attenda MVP is now ready for IPFS integration! 🌐** Start with Pinata for easy setup, then expand to other services as needed.
