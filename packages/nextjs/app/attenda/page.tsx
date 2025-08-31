"use client";

import { useState, useEffect } from "react";
import { Navigation } from "@/components/navigation";
import { WalletStatus } from "@/components/wallet-status";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Eye, Coins, Clock, Users, Search, Play, TrendingUp } from "lucide-react";
import Link from "next/link";
import { useAttendaStore } from "@/lib/store";
import { useTotalCampaigns } from "@/hooks/use-contracts";

const categories = ["All", "Technology", "Fashion", "Education", "Travel", "Lifestyle"];

export default function AttendaDashboard() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [sortBy, setSortBy] = useState("reward");
  const [blockchainCampaigns, setBlockchainCampaigns] = useState<any[]>([]);
  const [isLoadingCampaigns, setIsLoadingCampaigns] = useState(false);

  const { campaigns, userProfile } = useAttendaStore();
  const { totalCampaigns } = useTotalCampaigns();

  // Fetch campaigns from blockchain
  useEffect(() => {
    const fetchBlockchainCampaigns = async () => {
      if (!totalCampaigns || totalCampaigns === 0) return;

      setIsLoadingCampaigns(true);
      try {
        // This would fetch actual campaigns from the blockchain
        // For now, we'll use mock data
        const mockCampaigns = Array.from({ length: Math.min(totalCampaigns, 10) }, (_, i) => ({
          id: i + 1,
          title: `Campaign ${i + 1}`,
          description: `This is a sample campaign description for campaign ${i + 1}`,
          reward: "50",
          duration: "5",
          participants: Math.floor(Math.random() * 1000),
          category: categories[Math.floor(Math.random() * categories.length)],
          status: "active",
          image: "/placeholder.svg",
        }));
        setBlockchainCampaigns(mockCampaigns);
      } catch (error) {
        console.error("Error fetching campaigns:", error);
      } finally {
        setIsLoadingCampaigns(false);
      }
    };

    fetchBlockchainCampaigns();
  }, [totalCampaigns]);

  // Use blockchain campaigns if available, otherwise use store campaigns
  const displayCampaigns = blockchainCampaigns.length > 0 ? blockchainCampaigns : campaigns;

  const filteredCampaigns = displayCampaigns
    .filter(campaign => {
      const matchesSearch =
        campaign.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        campaign.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === "All" || campaign.category === selectedCategory;
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "reward":
          return Number.parseInt(b.reward) - Number.parseInt(a.reward);
        case "duration":
          return Number.parseInt(a.duration) - Number.parseInt(b.duration);
        case "participants":
          return b.participants - a.participants;
        default:
          return 0;
      }
    });

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header Section */}
        <div className="mb-8">
          <h1 className="font-serif font-bold text-3xl sm:text-4xl text-foreground mb-2">Dashboard</h1>
          <p className="text-muted-foreground text-lg">
            Discover campaigns and start earning rewards for your attention
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Earned</CardTitle>
              <Coins className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-accent">{userProfile.totalEarned} ATT</div>
              <p className="text-xs text-muted-foreground">+12% from last month</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Campaigns Completed</CardTitle>
              <Eye className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{userProfile.totalCampaigns}</div>
              <p className="text-xs text-muted-foreground">+3 this week</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Average Attention</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{userProfile.averageAttention}%</div>
              <p className="text-xs text-muted-foreground">Above average</p>
            </CardContent>
          </Card>

          <WalletStatus />
        </div>

        {/* Tabs for different views */}
        <Tabs defaultValue="discover" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 lg:w-[400px]">
            <TabsTrigger value="discover">Discover Campaigns</TabsTrigger>
            <TabsTrigger value="active">My Active Campaigns</TabsTrigger>
          </TabsList>

          <TabsContent value="discover" className="space-y-6">
            {/* Search and Filter Controls */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search campaigns..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(category => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="reward">Highest Reward</SelectItem>
                  <SelectItem value="duration">Shortest Duration</SelectItem>
                  <SelectItem value="participants">Most Popular</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Campaign Grid */}
            {isLoadingCampaigns ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent mx-auto mb-4"></div>
                <p className="text-muted-foreground">Loading campaigns from blockchain...</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredCampaigns.map(campaign => (
                  <Card key={campaign.id} className="group hover:shadow-lg transition-shadow cursor-pointer">
                    <div className="aspect-video relative overflow-hidden rounded-t-lg">
                      <img
                        src={campaign.image || "/placeholder.svg"}
                        alt={campaign.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute top-3 right-3">
                        <Badge variant="secondary" className="bg-background/80 backdrop-blur-sm">
                          {campaign.category}
                        </Badge>
                      </div>
                    </div>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <CardTitle className="font-serif text-lg line-clamp-2">{campaign.title}</CardTitle>
                        <Badge variant="outline" className="ml-2 text-accent border-accent">
                          {campaign.reward}
                        </Badge>
                      </div>
                      <CardDescription className="line-clamp-2">{campaign.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {campaign.duration}
                        </div>
                        <div className="flex items-center gap-1">
                          <Users className="h-4 w-4" />
                          {campaign.participants.toLocaleString()}
                        </div>
                      </div>
                      <Button asChild className="w-full">
                        <Link href={`/attenda/campaign/${campaign.id}`}>
                          <Play className="w-4 h-4 mr-2" />
                          Start Campaign
                        </Link>
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="active" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="font-serif">Active Campaigns</CardTitle>
                <CardDescription>Campaigns you are currently participating in</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Eye className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="font-serif text-lg font-semibold mb-2">No Active Campaigns</h3>
                  <p className="text-muted-foreground mb-4">Start a campaign to see your progress here</p>
                  <Button asChild>
                    <Link href="#discover">Browse Campaigns</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
