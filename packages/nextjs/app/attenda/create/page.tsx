"use client";

import type React from "react";

import { useState, useEffect } from "react";
import { Navigation } from "@/components/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import {
  Upload,
  FileVideo,
  FileImage,
  FileText,
  X,
  ChevronLeft,
  ChevronRight,
  Eye,
  Clock,
  Users,
  Coins,
  AlertCircle,
  CheckCircle,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { useAccount } from "wagmi";
import { useCampaignManager, useAttendaToken } from "@/hooks/use-contracts";
import deployedContracts from "@/contracts/deployedContracts";
import { ipfsService } from "@/lib/ipfs";

interface CampaignData {
  title: string;
  description: string;
  category: string;
  mediaFile: File | null;
  mediaPreview: string;
  rewardAmount: string;
  duration: string;
  maxParticipants: string;
  targetAudience: string;
}

const categories = ["Technology", "Fashion", "Education", "Travel", "Lifestyle", "Finance", "Health", "Entertainment"];

const steps = [
  { id: 1, title: "Campaign Details", description: "Basic information about your campaign" },
  { id: 2, title: "Media Upload", description: "Upload your campaign content" },
  { id: 3, title: "Configuration", description: "Set rewards and parameters" },
  { id: 4, title: "Review & Deploy", description: "Review and deploy your campaign" },
];

const CAMPAIGN_MANAGER_ADDRESS = deployedContracts[31337]?.CampaignManager?.address as `0x${string}`;

export default function CreateCampaign() {
  const [currentStep, setCurrentStep] = useState(1);
  const [campaignData, setCampaignData] = useState<CampaignData>({
    title: "",
    description: "",
    category: "",
    mediaFile: null,
    mediaPreview: "",
    rewardAmount: "",
    duration: "",
    maxParticipants: "",
    targetAudience: "",
  });
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [ipfsHash, setIpfsHash] = useState("");
  const [isDeploying, setIsDeploying] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const { toast } = useToast();
  const { address, isConnected } = useAccount();
  const { createCampaign, isPending, isConfirmed, error } = useCampaignManager();
  const { getBalance, approve, isPending: isApproving } = useAttendaToken();

  // Check token balance
  const [tokenBalance, setTokenBalance] = useState("0");

  const fetchBalance = async () => {
    if (address) {
      const balance = await getBalance();
      setTokenBalance(balance);
    }
  };

  useEffect(() => {
    fetchBalance();
  }, [address, getBalance]);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Create preview URL first
    const previewUrl = URL.createObjectURL(file);
    setCampaignData(prev => ({
      ...prev,
      mediaFile: file,
      mediaPreview: previewUrl,
    }));

    // Start real IPFS upload
    setIsUploading(true);
    setUploadProgress(0);

    try {
      const result = await ipfsService.uploadFile(file, (progress) => {
        setUploadProgress(progress);
      });

      setIpfsHash(result.hash);
      toast({
        title: "File uploaded successfully!",
        description: `File uploaded to IPFS: ${result.hash.substring(0, 10)}...`,
      });
    } catch (error) {
      console.error("IPFS upload failed:", error);
      toast({
        title: "Upload failed",
        description: "Failed to upload file to IPFS. Please try again.",
        variant: "destructive",
      });
      // Remove the file if upload fails
      setCampaignData(prev => ({
        ...prev,
        mediaFile: null,
        mediaPreview: "",
      }));
    } finally {
      setIsUploading(false);
    }
  };

  const removeFile = () => {
    if (campaignData.mediaPreview) {
      URL.revokeObjectURL(campaignData.mediaPreview);
    }
    setCampaignData(prev => ({
      ...prev,
      mediaFile: null,
      mediaPreview: "",
    }));
    setUploadProgress(0);
    setIpfsHash("");
  };

  const getFileIcon = (file: File | null) => {
    if (!file) return FileText;
    if (file.type.startsWith("video/")) return FileVideo;
    if (file.type.startsWith("image/")) return FileImage;
    return FileText;
  };

  const canProceedToNext = () => {
    switch (currentStep) {
      case 1:
        return campaignData.title && campaignData.description && campaignData.category;
      case 2:
        return campaignData.mediaFile && uploadProgress === 100 && ipfsHash;
      case 3:
        return campaignData.rewardAmount && campaignData.duration && campaignData.maxParticipants;
      default:
        return true;
    }
  };

  const handleDeployCampaign = async () => {
    if (!isConnected) {
      toast({
        title: "Wallet not connected",
        description: "Please connect your wallet to deploy a campaign",
        variant: "destructive",
      });
      return;
    }

    const totalCost = Number.parseFloat(campaignData.rewardAmount) * Number.parseFloat(campaignData.maxParticipants);
    const currentBalance = Number.parseFloat(tokenBalance);

    if (currentBalance < totalCost) {
      toast({
        title: "Insufficient balance",
        description: `You need ${totalCost} ATT tokens. Current balance: ${currentBalance} ATT`,
        variant: "destructive",
      });
      return;
    }

    setIsDeploying(true);

    try {
      // First approve the campaign manager to spend tokens
      await approve(CAMPAIGN_MANAGER_ADDRESS, totalCost.toString());

      // Then create the campaign
      createCampaign(
        campaignData.title,
        campaignData.description,
        ipfsHash,
        campaignData.rewardAmount,
        Number.parseInt(campaignData.maxParticipants),
        Number.parseInt(campaignData.duration) * 60, // Convert minutes to seconds
      );

      toast({
        title: "Campaign deployment initiated",
        description: "Your campaign is being created on the blockchain",
      });
    } catch (error) {
      toast({
        title: "Deployment failed",
        description: "There was an error deploying your campaign",
        variant: "destructive",
      });
    } finally {
      setIsDeploying(false);
    }
  };

  // Handle deployment success
  useEffect(() => {
    if (isConfirmed) {
      setShowSuccessModal(true);
      toast({
        title: "Campaign deployed successfully!",
        description: "Your campaign is now live on the blockchain",
      });
    }
  }, [isConfirmed, toast]);

  // Handle deployment errors
  useEffect(() => {
    if (error) {
      toast({
        title: "Deployment failed",
        description: error.message || "There was an error deploying your campaign",
        variant: "destructive",
      });
    }
  }, [error, toast]);

  const estimatedGasFee = "0.0045 ETH";
  const totalCost = campaignData.rewardAmount
    ? (Number.parseFloat(campaignData.rewardAmount) * Number.parseFloat(campaignData.maxParticipants || "1")).toString()
    : "0";

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="font-serif font-bold text-3xl sm:text-4xl text-foreground mb-2">Create Campaign</h1>
          <p className="text-muted-foreground text-lg">Launch your attention-based campaign on the decentralized web</p>
        </div>

        {/* Wallet Connection Check */}
        {!isConnected && (
          <Card className="mb-8 border-destructive">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-destructive" />
                <div>
                  <h3 className="font-semibold text-destructive">Wallet not connected</h3>
                  <p className="text-muted-foreground">Please connect your wallet to create a campaign</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Token Balance */}
        {isConnected && (
          <Card className="mb-8">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Token Balance</span>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-bold text-accent">{tokenBalance} ATT</span>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={fetchBalance}
                    className="h-6 px-2 text-xs"
                  >
                    Refresh
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div
                  className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium",
                    currentStep >= step.id
                      ? "bg-accent text-accent-foreground"
                      : "bg-muted text-muted-foreground border-2 border-muted",
                  )}
                >
                  {currentStep > step.id ? <CheckCircle className="w-5 h-5" /> : step.id}
                </div>
                {index < steps.length - 1 && (
                  <div className={cn("h-0.5 w-16 sm:w-24 mx-2", currentStep > step.id ? "bg-accent" : "bg-muted")} />
                )}
              </div>
            ))}
          </div>
          <div className="text-center">
            <h3 className="font-serif font-semibold text-lg">{steps[currentStep - 1].title}</h3>
            <p className="text-muted-foreground text-sm">{steps[currentStep - 1].description}</p>
          </div>
        </div>

        {/* Step Content */}
        <Card className="mb-8">
          <CardContent className="p-6">
            {/* Step 1: Campaign Details */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="title">Campaign Title</Label>
                  <Input
                    id="title"
                    placeholder="Enter a compelling title for your campaign"
                    value={campaignData.title}
                    onChange={e => setCampaignData(prev => ({ ...prev, title: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Describe what users will see and learn from your campaign"
                    rows={4}
                    value={campaignData.description}
                    onChange={e => setCampaignData(prev => ({ ...prev, description: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select
                    value={campaignData.category}
                    onValueChange={value => setCampaignData(prev => ({ ...prev, category: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map(category => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="audience">Target Audience</Label>
                  <Input
                    id="audience"
                    placeholder="e.g., Tech enthusiasts, Fashion lovers, Students"
                    value={campaignData.targetAudience}
                    onChange={e => setCampaignData(prev => ({ ...prev, targetAudience: e.target.value }))}
                  />
                </div>
              </div>
            )}

            {/* Step 2: Media Upload */}
            {currentStep === 2 && (
              <div className="space-y-6">
                {!campaignData.mediaFile ? (
                  <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center">
                    <Upload className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="font-serif font-semibold text-lg mb-2">Upload Campaign Media</h3>
                    <p className="text-muted-foreground mb-4">
                      Upload images, videos, or documents that users will engage with
                    </p>
                    <div className="flex flex-col sm:flex-row gap-2 justify-center mb-4">
                      <Badge variant="outline">Images: JPG, PNG, GIF</Badge>
                      <Badge variant="outline">Videos: MP4, WebM</Badge>
                      <Badge variant="outline">Max size: 100MB</Badge>
                    </div>
                    <input
                      type="file"
                      accept="image/*,video/*"
                      onChange={handleFileUpload}
                      className="hidden"
                      id="file-upload"
                    />
                    <Button asChild>
                      <label htmlFor="file-upload" className="cursor-pointer">
                        Choose File
                      </label>
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-serif font-semibold text-lg">Uploaded Media</h3>
                      <Button variant="outline" size="sm" onClick={removeFile}>
                        <X className="w-4 h-4 mr-2" />
                        Remove
                      </Button>
                    </div>

                    {isUploading && (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span>Uploading to IPFS...</span>
                          <span>{uploadProgress}%</span>
                        </div>
                        <Progress value={uploadProgress} />
                      </div>
                    )}

                    <div className="border rounded-lg p-4">
                      <div className="flex items-start space-x-4">
                        <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center">
                          {(() => {
                            const Icon = getFileIcon(campaignData.mediaFile);
                            return <Icon className="w-6 h-6 text-muted-foreground" />;
                          })()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{campaignData.mediaFile?.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {campaignData.mediaFile && (campaignData.mediaFile.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                          {uploadProgress === 100 && ipfsHash && (
                            <div className="flex items-center mt-2 text-sm text-green-600">
                              <CheckCircle className="w-4 h-4 mr-1" />
                              Uploaded to IPFS: {ipfsHash.substring(0, 10)}...
                            </div>
                          )}
                        </div>
                      </div>

                      {campaignData.mediaFile?.type.startsWith("image/") && campaignData.mediaPreview && (
                        <div className="mt-4">
                          <img
                            src={campaignData.mediaPreview || "/placeholder.svg"}
                            alt="Preview"
                            className="max-w-full h-48 object-cover rounded-lg"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Step 3: Configuration */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="reward">Reward per User (ATT)</Label>
                    <Input
                      id="reward"
                      type="number"
                      placeholder="50"
                      value={campaignData.rewardAmount}
                      onChange={e => setCampaignData(prev => ({ ...prev, rewardAmount: e.target.value }))}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="duration">Expected Duration (minutes)</Label>
                    <Input
                      id="duration"
                      type="number"
                      placeholder="5"
                      value={campaignData.duration}
                      onChange={e => setCampaignData(prev => ({ ...prev, duration: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="participants">Maximum Participants</Label>
                  <Input
                    id="participants"
                    type="number"
                    placeholder="1000"
                    value={campaignData.maxParticipants}
                    onChange={e => setCampaignData(prev => ({ ...prev, maxParticipants: e.target.value }))}
                  />
                </div>

                <Separator />

                <div className="bg-muted/50 rounded-lg p-4 space-y-3">
                  <h4 className="font-serif font-semibold">Campaign Summary</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <Coins className="w-4 h-4 text-accent" />
                      <span>Reward: {campaignData.rewardAmount || "0"} ATT per user</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-accent" />
                      <span>Duration: {campaignData.duration || "0"} minutes</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-accent" />
                      <span>Max participants: {campaignData.maxParticipants || "0"}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Eye className="w-4 h-4 text-accent" />
                      <span>Total cost: {totalCost} ATT</span>
                    </div>
                  </div>
                </div>

                {/* Balance Check */}
                {Number.parseFloat(totalCost) > Number.parseFloat(tokenBalance) && (
                  <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 text-destructive mt-0.5" />
                      <div>
                        <h4 className="font-semibold text-destructive">Insufficient Balance</h4>
                        <p className="text-sm text-muted-foreground mt-1">
                          You need {totalCost} ATT tokens. Current balance: {tokenBalance} ATT
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Step 4: Review & Deploy */}
            {currentStep === 4 && (
              <div className="space-y-6">
                <div className="bg-muted/50 rounded-lg p-6">
                  <h3 className="font-serif font-semibold text-lg mb-4">Campaign Review</h3>
                  <div className="space-y-4">
                    <div>
                      <Label className="text-sm font-medium">Title</Label>
                      <p className="text-foreground">{campaignData.title}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Description</Label>
                      <p className="text-foreground">{campaignData.description}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm font-medium">Category</Label>
                        <p className="text-foreground">{campaignData.category}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium">Target Audience</Label>
                        <p className="text-foreground">{campaignData.targetAudience}</p>
                      </div>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">IPFS Hash</Label>
                      <p className="text-foreground font-mono text-sm">{ipfsHash}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-accent/10 border border-accent/20 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-accent mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-accent">Transaction Details</h4>
                      <div className="mt-2 space-y-1 text-sm">
                        <p>Campaign deposit: {totalCost} ATT</p>
                        <p>Estimated gas fee: {estimatedGasFee}</p>
                        <p className="font-medium">
                          Total: {totalCost} ATT + {estimatedGasFee}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="text-center">
                  <Button
                    size="lg"
                    className="px-8"
                    onClick={handleDeployCampaign}
                    disabled={!isConnected || isDeploying || isPending || isApproving}
                  >
                    {isDeploying || isPending || isApproving ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        {isApproving ? "Approving..." : "Deploying..."}
                      </>
                    ) : (
                      "Deploy Campaign"
                    )}
                  </Button>
                  <p className="text-sm text-muted-foreground mt-2">This will create your campaign on the blockchain</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Navigation Buttons */}
        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={() => setCurrentStep(prev => Math.max(1, prev - 1))}
            disabled={currentStep === 1}
            className="bg-transparent"
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            Previous
          </Button>

          {currentStep < 4 ? (
            <Button onClick={() => setCurrentStep(prev => prev + 1)} disabled={!canProceedToNext()}>
              Next
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          ) : (
            <Button variant="outline" className="bg-transparent">
              Save Draft
            </Button>
          )}
        </div>
      </div>

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-background border rounded-lg p-8 max-w-md mx-4 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="font-serif font-semibold text-xl mb-2">Campaign Created Successfully!</h3>
            <p className="text-muted-foreground mb-6">
              Your campaign has been deployed to the blockchain and is now live.
            </p>
            {ipfsHash && (
              <div className="bg-muted/50 rounded-lg p-3 mb-4 text-left">
                <p className="text-sm font-medium mb-1">IPFS Hash:</p>
                <p className="text-xs font-mono text-muted-foreground break-all">
                  {ipfsHash}
                </p>
                <a 
                  href={`https://gateway.pinata.cloud/ipfs/${ipfsHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-accent hover:underline mt-1 inline-block"
                >
                  View on IPFS Gateway →
                </a>
              </div>
            )}
            <div className="space-y-3">
              <Button 
                onClick={() => {
                  setShowSuccessModal(false);
                  // Reset form
                  setCurrentStep(1);
                  setCampaignData({
                    title: "",
                    description: "",
                    category: "",
                    mediaFile: null,
                    mediaPreview: "",
                    rewardAmount: "",
                    duration: "",
                    maxParticipants: "",
                    targetAudience: "",
                  });
                  setIpfsHash("");
                }}
                className="w-full"
              >
                Create Another Campaign
              </Button>
              <Button 
                variant="outline" 
                onClick={() => {
                  setShowSuccessModal(false);
                  // Redirect to dashboard
                  window.location.href = "/attenda";
                }}
                className="w-full"
              >
                Go to Dashboard
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
