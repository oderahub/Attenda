"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Clock, Eye, MousePointer, Activity } from "lucide-react";
import { useAttentionTracking } from "@/hooks/use-attention-tracking";
import { useProofOfAttention } from "@/hooks/use-contracts";
import { useToast } from "@/hooks/use-toast";

interface ProofSubmissionProps {
  campaignId: number;
  onProofSubmitted: () => void;
}

export function ProofSubmission({ campaignId, onProofSubmitted }: ProofSubmissionProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [proofHash, setProofHash] = useState("");
  const [isProofSubmitted, setIsProofSubmitted] = useState(false);
  
  const { metrics, isTracking, startTracking, stopTracking, resetMetrics } = useAttentionTracking();
  const { submitProof, isPending, error } = useProofOfAttention();
  const { toast } = useToast();

  const handleStartTracking = () => {
    startTracking();
    toast({
      title: "Attention Tracking Started",
      description: "We're now tracking your attention to this campaign",
    });
  };

  const handleStopTracking = async () => {
    const finalMetrics = stopTracking();
    
    if (finalMetrics.timeSpent < 10) {
      toast({
        title: "Insufficient Attention Time",
        description: "Please spend at least 10 seconds viewing the campaign",
        variant: "destructive",
      });
      return;
    }

    // Generate a simple proof hash for local testing
    setIsSubmitting(true);
    try {
      const proofData = {
        campaignId,
        timestamp: Date.now(),
        metrics: finalMetrics,
        userAgent: navigator.userAgent,
      };

      // Create a simple hash for local testing (in production, this would be IPFS)
      const proofString = JSON.stringify(proofData);
      const simpleHash = "0x" + Array.from(proofString)
        .map(char => char.charCodeAt(0).toString(16).padStart(2, '0'))
        .join('')
        .substring(0, 64);
      
      setProofHash(simpleHash);
      
      toast({
        title: "Proof Data Generated",
        description: "Your attention proof has been created",
      });

      // Submit proof to blockchain
      await submitProof(campaignId, finalMetrics.timeSpent, simpleHash);
      
      setIsProofSubmitted(true);
      onProofSubmitted();
      
      toast({
        title: "Proof Submitted Successfully!",
        description: "Your attention proof has been submitted to the blockchain",
      });
    } catch (error) {
      console.error("Proof submission error:", error);
      toast({
        title: "Proof Submission Failed",
        description: "There was an error submitting your proof",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getAttentionScoreColor = (score: number) => {
    if (score >= 80) return "bg-green-500";
    if (score >= 60) return "bg-yellow-500";
    return "bg-red-500";
  };

  if (isProofSubmitted) {
    return (
      <Card className="border-green-200 bg-green-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-800">
            <CheckCircle className="h-5 w-5" />
            Proof Submitted Successfully!
          </CardTitle>
          <CardDescription className="text-green-700">
            Your attention proof has been recorded on the blockchain
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <p className="text-sm text-green-700">
              <strong>Proof Hash:</strong> {proofHash.slice(0, 20)}...
            </p>
            <p className="text-sm text-green-700">
              <strong>Time Spent:</strong> {metrics.timeSpent} seconds
            </p>
            <p className="text-sm text-green-700">
              <strong>Attention Score:</strong> {metrics.attentionScore}/100
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Attention Tracking</CardTitle>
        <CardDescription>
          Track your attention to earn rewards for this campaign
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Attention Metrics Display */}
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-blue-500" />
            <span className="text-sm font-medium">Time Spent</span>
            <Badge variant="secondary">{metrics.timeSpent}s</Badge>
          </div>
          <div className="flex items-center gap-2">
            <Eye className="h-4 w-4 text-green-500" />
            <span className="text-sm font-medium">Focus Time</span>
            <Badge variant="secondary">{metrics.focusTime}s</Badge>
          </div>
          <div className="flex items-center gap-2">
            <MousePointer className="h-4 w-4 text-purple-500" />
            <span className="text-sm font-medium">Interactions</span>
            <Badge variant="secondary">{metrics.interactions}</Badge>
          </div>
          <div className="flex items-center gap-2">
            <Activity className="h-4 w-4 text-orange-500" />
            <span className="text-sm font-medium">Attention Score</span>
            <Badge className={getAttentionScoreColor(metrics.attentionScore)}>
              {metrics.attentionScore}/100
            </Badge>
          </div>
        </div>

        {/* Attention Score Progress */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Attention Score</span>
            <span>{metrics.attentionScore}/100</span>
          </div>
          <Progress value={metrics.attentionScore} className="h-2" />
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          {!isTracking ? (
            <Button onClick={handleStartTracking} className="flex-1">
              Start Tracking Attention
            </Button>
          ) : (
            <Button 
              onClick={handleStopTracking} 
              disabled={isSubmitting || isPending}
              className="flex-1"
            >
              {isSubmitting || isPending ? "Submitting Proof..." : "Stop & Submit Proof"}
            </Button>
          )}
          
          {isTracking && (
            <Button 
              variant="outline" 
              onClick={resetMetrics}
              disabled={isSubmitting || isPending}
            >
              Reset
            </Button>
          )}
        </div>

        {/* Error Display */}
        {error && (
          <div className="text-sm text-red-600 bg-red-50 p-3 rounded">
            Error: {error.message}
          </div>
        )}

        {/* Instructions */}
        <div className="text-xs text-muted-foreground bg-muted p-3 rounded">
          <p><strong>How it works:</strong></p>
          <ul className="list-disc list-inside mt-1 space-y-1">
            <li>Click &ldquo;Start Tracking Attention&rdquo; to begin monitoring</li>
            <li>Interact with the campaign content (scroll, click, etc.)</li>
            <li>Spend at least 10 seconds viewing the content</li>
            <li>Click &ldquo;Stop &amp; Submit Proof&rdquo; to submit your proof</li>
            <li>Your proof will be stored on the blockchain</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}

