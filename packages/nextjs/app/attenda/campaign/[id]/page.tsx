"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { Navigation } from "@/components/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import {
  Eye,
  Clock,
  Users,
  Coins,
  Play,
  Pause,
  RotateCcw,
  CheckCircle,
  ArrowLeft,
  MousePointer,
  Activity,
  Target,
} from "lucide-react";

// Mock campaign data
const mockCampaignData = {
  "1": {
    id: "1",
    title: "New Smartphone Launch",
    description: "Watch our latest smartphone reveal and earn rewards for your attention",
    reward: "50 ATT",
    duration: 5,
    participants: 1234,
    category: "Technology",
    status: "active",
    image: "/smartphone-launch-tech.png",
    content: {
      type: "video",
      url: "/smartphone-launch-video.png",
      transcript: "Welcome to the future of mobile technology...",
    },
  },
  "2": {
    id: "2",
    title: "Sustainable Fashion Brand",
    description: "Learn about eco-friendly fashion and sustainable clothing practices",
    reward: "30 ATT",
    duration: 3,
    participants: 856,
    category: "Fashion",
    status: "active",
    image: "/sustainable-fashion-eco-clothing.png",
    content: {
      type: "image",
      url: "/sustainable-fashion-eco-clothing.png",
      transcript: "Discover sustainable fashion practices that help protect our planet...",
    },
  },
};

interface AttentionMetrics {
  timeSpent: number;
  scrollDepth: number;
  interactions: number;
  focusTime: number;
  attentionScore: number;
}

export default function CampaignViewer() {
  const params = useParams();
  const router = useRouter();
  const campaignId = params.id as string;
  const campaign = mockCampaignData[campaignId as keyof typeof mockCampaignData];

  const [isTracking, setIsTracking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [showProofSubmission, setShowProofSubmission] = useState(false);

  const [attentionMetrics, setAttentionMetrics] = useState<AttentionMetrics>({
    timeSpent: 0,
    scrollDepth: 0,
    interactions: 0,
    focusTime: 0,
    attentionScore: 0,
  });

  const contentRef = useRef<HTMLDivElement>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(0);

  useEffect(() => {
    if (!campaign) {
      router.push("/attenda");
      return;
    }
  }, [campaign, router]);

  useEffect(() => {
    if (isTracking && !isPaused) {
      intervalRef.current = setInterval(() => {
        setTimeElapsed(prev => {
          const newTime = prev + 1;
          const progress = (newTime / (campaign?.duration * 60)) * 100;

          // Update attention metrics
          setAttentionMetrics(prevMetrics => {
            const newScore = Math.min(95, Math.floor(Math.random() * 20) + 75 + progress * 0.2);
            return {
              ...prevMetrics,
              timeSpent: newTime,
              attentionScore: newScore,
              focusTime: newTime * 0.85, // Simulate 85% focus time
            };
          });

          // Check if campaign is completed
          if (progress >= 100) {
            setIsCompleted(true);
            setIsTracking(false);
            setShowProofSubmission(true);
            if (intervalRef.current) {
              clearInterval(intervalRef.current);
            }
          }

          return newTime;
        });
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isTracking, isPaused, campaign?.duration]);

  const handleStartTracking = () => {
    setIsTracking(true);
    setIsPaused(false);
    startTimeRef.current = Date.now();
  };

  const handlePauseTracking = () => {
    setIsPaused(!isPaused);
  };

  const handleRestart = () => {
    setIsTracking(false);
    setIsPaused(false);
    setTimeElapsed(0);
    setIsCompleted(false);
    setShowProofSubmission(false);
    setAttentionMetrics({
      timeSpent: 0,
      scrollDepth: 0,
      interactions: 0,
      focusTime: 0,
      attentionScore: 0,
    });
  };

  const handleInteraction = () => {
    if (isTracking && !isPaused) {
      setAttentionMetrics(prev => ({
        ...prev,
        interactions: prev.interactions + 1,
      }));
    }
  };

  const handleScroll = () => {
    if (contentRef.current && isTracking && !isPaused) {
      const element = contentRef.current;
      const scrollTop = element.scrollTop;
      const scrollHeight = element.scrollHeight - element.clientHeight;
      const scrollPercent = scrollHeight > 0 ? (scrollTop / scrollHeight) * 100 : 0;

      setAttentionMetrics(prev => ({
        ...prev,
        scrollDepth: Math.max(prev.scrollDepth, scrollPercent),
      }));
    }
  };

  const handleSubmitProof = () => {
    // Simulate proof submission
    alert("Proof of attention submitted successfully! You&apos;ve earned " + campaign?.reward);
    router.push("/attenda");
  };

  const progress = campaign ? (timeElapsed / (campaign.duration * 60)) * 100 : 0;
  const remainingTime = campaign ? Math.max(0, campaign.duration * 60 - timeElapsed) : 0;

  if (!campaign) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <div className="container mx-auto px-4 py-6 max-w-6xl">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="sm" onClick={() => router.push("/attenda")}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
          <div className="flex-1">
            <h1 className="font-serif font-bold text-2xl sm:text-3xl text-foreground">{campaign.title}</h1>
            <p className="text-muted-foreground">{campaign.description}</p>
          </div>
          <Badge variant="outline" className="text-accent border-accent">
            {campaign.reward}
          </Badge>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content Area */}
          <div className="lg:col-span-2 space-y-6">
            {/* Content Display */}
            <Card>
              <CardContent className="p-0">
                <div
                  ref={contentRef}
                  className="relative aspect-video bg-muted rounded-lg overflow-hidden"
                  onScroll={handleScroll}
                  onClick={handleInteraction}
                  onMouseMove={handleInteraction}
                >
                  <img
                    src={campaign.content.url || "/placeholder.svg"}
                    alt={campaign.title}
                    className="w-full h-full object-cover"
                  />

                  {/* Attention Tracking Overlay */}
                  {isTracking && (
                    <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                      <div className="bg-background/90 backdrop-blur-sm rounded-lg p-4 text-center">
                        <Activity className="w-8 h-8 text-accent mx-auto mb-2" />
                        <p className="text-sm font-medium">Tracking Attention</p>
                        <p className="text-xs text-muted-foreground">Score: {attentionMetrics.attentionScore}%</p>
                      </div>
                    </div>
                  )}

                  {/* Completion Overlay */}
                  {isCompleted && (
                    <div className="absolute inset-0 bg-accent/20 flex items-center justify-center">
                      <div className="bg-background rounded-lg p-6 text-center max-w-sm">
                        <CheckCircle className="w-12 h-12 text-accent mx-auto mb-4" />
                        <h3 className="font-serif font-bold text-lg mb-2">Campaign Completed!</h3>
                        <p className="text-muted-foreground mb-4">
                          You&apos;ve successfully completed this campaign with an attention score of{" "}
                          {attentionMetrics.attentionScore}%
                        </p>
                        <Button onClick={() => setShowProofSubmission(true)} className="w-full">
                          Submit Proof & Claim Reward
                        </Button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Content Controls */}
                <div className="p-4 border-t">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      {!isTracking ? (
                        <Button onClick={handleStartTracking}>
                          <Play className="w-4 h-4 mr-2" />
                          Start Campaign
                        </Button>
                      ) : (
                        <Button onClick={handlePauseTracking} variant="outline" className="bg-transparent">
                          {isPaused ? <Play className="w-4 h-4 mr-2" /> : <Pause className="w-4 h-4 mr-2" />}
                          {isPaused ? "Resume" : "Pause"}
                        </Button>
                      )}
                      <Button onClick={handleRestart} variant="outline" size="sm" className="bg-transparent">
                        <RotateCcw className="w-4 h-4" />
                      </Button>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {Math.floor(remainingTime / 60)}:{(remainingTime % 60).toString().padStart(2, "0")} remaining
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Progress</span>
                      <span>{Math.round(progress)}%</span>
                    </div>
                    <Progress value={progress} className="h-2" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Campaign Content */}
            <Card>
              <CardHeader>
                <CardTitle className="font-serif">Campaign Content</CardTitle>
                <CardDescription>Engage with the content below to maximize your attention score</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="prose prose-sm max-w-none">
                  <p>{campaign.content.transcript}</p>
                  <p>
                    This campaign is designed to showcase the latest innovations in {campaign.category.toLowerCase()}.
                    Pay close attention to the details presented and interact with the content to demonstrate your
                    engagement.
                  </p>
                  <p>
                    Your attention is being tracked through various metrics including time spent, scroll depth, mouse
                    interactions, and focus time. The higher your engagement, the better your attention score will be.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Attention Metrics */}
            <Card>
              <CardHeader>
                <CardTitle className="font-serif flex items-center gap-2">
                  <Target className="w-5 h-5 text-accent" />
                  Attention Metrics
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Time Spent</span>
                    <span className="font-medium">
                      {Math.floor(attentionMetrics.timeSpent / 60)}m {attentionMetrics.timeSpent % 60}s
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Scroll Depth</span>
                    <span className="font-medium">{Math.round(attentionMetrics.scrollDepth)}%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Interactions</span>
                    <span className="font-medium">{attentionMetrics.interactions}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Focus Time</span>
                    <span className="font-medium">
                      {Math.floor(attentionMetrics.focusTime / 60)}m {Math.floor(attentionMetrics.focusTime % 60)}s
                    </span>
                  </div>
                  <Separator />
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Attention Score</span>
                    <span className="font-bold text-accent text-lg">{attentionMetrics.attentionScore}%</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Campaign Info */}
            <Card>
              <CardHeader>
                <CardTitle className="font-serif">Campaign Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  <span>Duration: {campaign.duration} minutes</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Users className="w-4 h-4 text-muted-foreground" />
                  <span>Participants: {campaign.participants.toLocaleString()}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Coins className="w-4 h-4 text-muted-foreground" />
                  <span>Reward: {campaign.reward}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Eye className="w-4 h-4 text-muted-foreground" />
                  <span>Category: {campaign.category}</span>
                </div>
              </CardContent>
            </Card>

            {/* Proof Submission */}
            {showProofSubmission && (
              <Card className="border-accent">
                <CardHeader>
                  <CardTitle className="font-serif text-accent">Submit Proof of Attention</CardTitle>
                  <CardDescription>Your engagement has been verified. Claim your reward!</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="bg-accent/10 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <CheckCircle className="w-5 h-5 text-accent" />
                        <span className="font-medium">Verification Complete</span>
                      </div>
                      <div className="text-sm space-y-1">
                        <p>Attention Score: {attentionMetrics.attentionScore}%</p>
                        <p>
                          Time Engaged: {Math.floor(attentionMetrics.timeSpent / 60)}m {attentionMetrics.timeSpent % 60}
                          s
                        </p>
                        <p>Reward Earned: {campaign.reward}</p>
                      </div>
                    </div>
                    <Button onClick={handleSubmitProof} className="w-full">
                      <Coins className="w-4 h-4 mr-2" />
                      Claim {campaign.reward}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Tips */}
            <Card>
              <CardHeader>
                <CardTitle className="font-serif">Attention Tips</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <div className="flex items-start gap-2">
                    <MousePointer className="w-4 h-4 mt-0.5 text-accent" />
                    <span>Move your mouse and click to show engagement</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Eye className="w-4 h-4 mt-0.5 text-accent" />
                    <span>Keep the tab focused for maximum attention score</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Activity className="w-4 h-4 mt-0.5 text-accent" />
                    <span>Scroll through content to demonstrate interest</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
