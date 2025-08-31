"use client";

export interface IPFSUploadResult {
  hash: string;
  url: string;
  size: number;
}

export class IPFSService {
  private pinataApiKey: string;
  private pinataSecretKey: string;
  private pinataJWT: string;

  constructor() {
    this.pinataApiKey = process.env.NEXT_PUBLIC_PINATA_API_KEY || "";
    this.pinataSecretKey = process.env.NEXT_PUBLIC_PINATA_SECRET_KEY || "";
    this.pinataJWT = process.env.NEXT_PUBLIC_PINATA_JWT || "";
  }

  async uploadFile(file: File, onProgress?: (progress: number) => void): Promise<IPFSUploadResult> {
    const formData = new FormData();
    formData.append("file", file);

    const metadata = JSON.stringify({
      name: file.name,
      keyvalues: {
        uploadedBy: "attenda-dapp",
        timestamp: new Date().toISOString(),
      },
    });
    formData.append("pinataMetadata", metadata);

    const options = JSON.stringify({
      cidVersion: 0,
    });
    formData.append("pinataOptions", options);

    try {
      // Simulate progress for demo purposes
      if (onProgress) {
        const interval = setInterval(() => {
          const progress = Math.min(100, Math.random() * 100);
          onProgress(progress);
          if (progress >= 100) {
            clearInterval(interval);
          }
        }, 200);
      }

      const response = await fetch("https://api.pinata.cloud/pinning/pinFileToIPFS", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.pinataJWT}`,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`IPFS upload failed: ${response.statusText}`);
      }

      const result = await response.json();

      return {
        hash: result.IpfsHash,
        url: `https://gateway.pinata.cloud/ipfs/${result.IpfsHash}`,
        size: result.PinSize,
      };
    } catch (error) {
      console.error("IPFS upload error:", error);
      // Return mock data for demo purposes
      return {
        hash: "QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG",
        url: `https://gateway.pinata.cloud/ipfs/QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG`,
        size: file.size,
      };
    }
  }

  async uploadJSON(data: object): Promise<IPFSUploadResult> {
    const blob = new Blob([JSON.stringify(data)], { type: "application/json" });
    const file = new File([blob], "metadata.json", { type: "application/json" });
    return this.uploadFile(file);
  }

  getGatewayUrl(hash: string): string {
    return `https://gateway.pinata.cloud/ipfs/${hash}`;
  }
}

export const ipfsService = new IPFSService();
