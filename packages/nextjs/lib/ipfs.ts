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
      // Start progress tracking
      if (onProgress) {
        onProgress(10); // Start at 10%
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

      // Update progress to 90% when response is received
      if (onProgress) {
        onProgress(90);
      }

      const result = await response.json();

      // Complete progress
      if (onProgress) {
        onProgress(100);
      }

      return {
        hash: result.IpfsHash,
        url: `https://gateway.pinata.cloud/ipfs/${result.IpfsHash}`,
        size: result.PinSize,
      };
    } catch (error) {
      console.error("IPFS upload error:", error);
      throw error; // Re-throw the error instead of returning mock data
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
