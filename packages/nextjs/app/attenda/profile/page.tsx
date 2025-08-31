"use client";

import { useState } from "react";
import { Navigation } from "@/components/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  Wallet,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  Copy,
  ExternalLink,
  Star,
  Target,
  Activity,
} from "lucide-react";

// Mock data
const mockProfile = {
  address: "0x742d35Cc6634C0532925a3b8D4C2C4e4C4C4C4C4",
  username: "AttentionSeeker",
  joinDate: "2024-01-15",
  totalEarned: 2847,
  totalCampaigns: 47,
  averageAttention: 92,
  currentStreak: 12,
  rank: "Gold",
  stakingBalance: 1500,
  availableBalance: 1347,
};

const earningsData = [
  { month: "Jan", earnings: 245 },
  { month: "Feb", earnings: 312 },
  { month: "Mar", earnings: 189 },
  { month: "Apr", earnings: 456 },
  { month: "May", earnings: 378 },
  { month: "Jun", earnings: 523 },
  { month: "Jul", earnings: 612 },
  { month: "Aug", earnings: 489 },
];

const categoryData = [
  { name: "Technology", value: 35, color: "#8b5cf6" },
  { name: "Fashion", value: 25, color: "#06b6d4" },
  { name: "Education", value: 20, color: "#10b981" },
  { name: "Travel", value: 12, color: "#f59e0b" },
  { name: "Lifestyle", value: 8, color: "#ef4444" },
];

const attentionScores = [
  { campaign: "Smartphone Launch", score: 94, date: "2024-08-25" },
  { campaign: "Fashion Week", score: 88, date: "2024-08-24" },
  { campaign: "Crypto Course", score: 96, date: "2024-08-23" },
  { campaign: "Travel Guide", score: 91, date: "2024-08-22" },
  { campaign: "Cooking Tips", score: 87, date: "2024-08-21" },
];

const transactions = [
  {
    id: "1",
    type: "earned",
    amount: 50,
    campaign: "Smartphone Launch",
    date: "2024-08-25",
    status: "completed",
    hash: "0x1234...5678",
  },
  {
    id: "2",
    type: "earned",
    amount: 30,
    campaign: "Fashion Week",
    date: "2024-08-24",
    status: "completed",
    hash: "0x2345...6789",
  },
  {
    id: "3",
    type: "staked",
    amount: 500,
    campaign: "Staking Pool",
    date: "2024-08-20",
    status: "active",
    hash: "0x3456...7890",
  },
  {
    id: "4",
    type: "earned",
    amount: 75,
    campaign: "Crypto Course",
    date: "2024-08-19",
    status: "completed",
    hash: "0x4567...8901",
  },
];

export default function ProfilePage() {
  const [selectedTab, setSelectedTab] = useState("overview");

  const copyAddress = () => {
    navigator.clipboard.writeText(mockProfile.address);
  };

  const getRankColor = (rank: string) => {
    switch (rank) {
      case "Gold":
        return "text-yellow-600";
      case "Silver":
        return "text-gray-500";
      case "Bronze":
        return "text-orange-600";
      default:
        return "text-muted-foreground";
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Profile Header */}
        <div className="mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
                <Avatar className="w-20 h-20">
                  <AvatarImage src="/placeholder.svg" />
                  <AvatarFallback className="text-2xl font-bold bg-accent text-accent-foreground">
                    {mockProfile.username.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-3">
                    <h1 className="font-serif font-bold text-2xl sm:text-3xl">{mockProfile.username}</h1>
                    <Badge className={getRankColor(mockProfile.rank)} variant="outline">
                      <Star className="w-3 h-3 mr-1" />
                      {mockProfile.rank}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <span className="font-mono text-sm">
                      {mockProfile.address.slice(0, 10)}...{mockProfile.address.slice(-8)}
                    </span>
                    <Button variant="ghost" size="sm" onClick={copyAddress}>
                      <Copy className="w-3 h-3" />
                    </Button>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Member since {new Date(mockProfile.joinDate).toLocaleDateString()}
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-accent">{mockProfile.totalEarned}</div>
                    <div className="text-sm text-muted-foreground">ATT Earned</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">{mockProfile.totalCampaigns}</div>
                    <div className="text-sm text-muted-foreground">Campaigns</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">{mockProfile.averageAttention}%</div>
                    <div className="text-sm text-muted-foreground">Avg Score</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="earnings">Earnings</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
            <TabsTrigger value="staking">Staking</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Available Balance</CardTitle>
                  <Wallet className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-accent">{mockProfile.availableBalance} ATT</div>
                  <p className="text-xs text-muted-foreground">Ready to withdraw</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Staked Balance</CardTitle>
                  <Target className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{mockProfile.stakingBalance} ATT</div>
                  <p className="text-xs text-muted-foreground">Earning rewards</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Current Streak</CardTitle>
                  <Activity className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{mockProfile.currentStreak}</div>
                  <p className="text-xs text-muted-foreground">Days active</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">This Month</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">489 ATT</div>
                  <p className="text-xs text-muted-foreground">+12% from last month</p>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Earnings Chart */}
              <Card>
                <CardHeader>
                  <CardTitle className="font-serif">Monthly Earnings</CardTitle>
                  <CardDescription>Your ATT earnings over the past 8 months</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={earningsData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Line type="monotone" dataKey="earnings" stroke="#8b5cf6" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Category Distribution */}
              <Card>
                <CardHeader>
                  <CardTitle className="font-serif">Campaign Categories</CardTitle>
                  <CardDescription>Distribution of your campaign participation</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={categoryData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {categoryData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="mt-4 grid grid-cols-2 gap-2">
                    {categoryData.map(category => (
                      <div key={category.name} className="flex items-center gap-2 text-sm">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: category.color }} />
                        <span>{category.name}</span>
                        <span className="text-muted-foreground">{category.value}%</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Attention Scores */}
            <Card>
              <CardHeader>
                <CardTitle className="font-serif">Recent Attention Scores</CardTitle>
                <CardDescription>Your performance in recent campaigns</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {attentionScores.map((score, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex-1">
                        <p className="font-medium">{score.campaign}</p>
                        <p className="text-sm text-muted-foreground">{score.date}</p>
                      </div>
                      <div className="flex items-center gap-4">
                        <Progress value={score.score} className="w-24" />
                        <span className="font-bold text-accent w-12 text-right">{score.score}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Earnings Tab */}
          <TabsContent value="earnings" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle className="font-serif">Earnings Analytics</CardTitle>
                  <CardDescription>Detailed breakdown of your earnings over time</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={400}>
                    <BarChart data={earningsData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="earnings" fill="#8b5cf6" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="font-serif">Earnings Summary</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-sm">Total Earned</span>
                      <span className="font-bold">{mockProfile.totalEarned} ATT</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">This Month</span>
                      <span className="font-bold text-accent">489 ATT</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Last Month</span>
                      <span className="font-bold">437 ATT</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Average/Campaign</span>
                      <span className="font-bold">60.6 ATT</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between">
                      <span className="text-sm">Growth Rate</span>
                      <span className="font-bold text-green-600">+12%</span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="font-serif">Top Categories</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {categoryData.slice(0, 3).map(category => (
                        <div key={category.name} className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: category.color }} />
                            <span className="text-sm">{category.name}</span>
                          </div>
                          <span className="font-medium">{category.value}%</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* History Tab */}
          <TabsContent value="history" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="font-serif">Transaction History</CardTitle>
                <CardDescription>Complete record of your ATT transactions</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Type</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Campaign/Action</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Transaction</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {transactions.map(tx => (
                      <TableRow key={tx.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {tx.type === "earned" ? (
                              <ArrowUpRight className="w-4 h-4 text-green-600" />
                            ) : (
                              <ArrowDownRight className="w-4 h-4 text-blue-600" />
                            )}
                            <span className="capitalize">{tx.type}</span>
                          </div>
                        </TableCell>
                        <TableCell className="font-medium">
                          {tx.type === "earned" ? "+" : "-"}
                          {tx.amount} ATT
                        </TableCell>
                        <TableCell>{tx.campaign}</TableCell>
                        <TableCell>{tx.date}</TableCell>
                        <TableCell>
                          <Badge variant={tx.status === "completed" ? "default" : "secondary"}>{tx.status}</Badge>
                        </TableCell>
                        <TableCell>
                          <Button variant="ghost" size="sm">
                            <ExternalLink className="w-3 h-3" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Staking Tab */}
          <TabsContent value="staking" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="font-serif">Staking Overview</CardTitle>
                  <CardDescription>Earn passive rewards by staking your ATT tokens</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 bg-muted/50 rounded-lg">
                      <div className="text-2xl font-bold text-accent">{mockProfile.stakingBalance}</div>
                      <div className="text-sm text-muted-foreground">ATT Staked</div>
                    </div>
                    <div className="text-center p-4 bg-muted/50 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">8.5%</div>
                      <div className="text-sm text-muted-foreground">APY</div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-sm">Rewards Earned</span>
                      <span className="font-bold">127.5 ATT</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Next Reward</span>
                      <span className="font-bold">2.3 ATT in 3 days</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Lock Period</span>
                      <span className="font-bold">30 days</span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button className="flex-1">Stake More</Button>
                    <Button variant="outline" className="flex-1 bg-transparent">
                      Unstake
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="font-serif">Staking Rewards</CardTitle>
                  <CardDescription>Your staking performance over time</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={earningsData.map(d => ({ ...d, rewards: d.earnings * 0.1 }))}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Line type="monotone" dataKey="rewards" stroke="#10b981" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="font-serif">Staking Pools</CardTitle>
                <CardDescription>Available staking options with different rewards and lock periods</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-semibold">Flexible Pool</h4>
                      <Badge variant="outline">No Lock</Badge>
                    </div>
                    <div className="text-2xl font-bold text-accent mb-2">5.2% APY</div>
                    <p className="text-sm text-muted-foreground mb-4">Unstake anytime with no penalties</p>
                    <Button variant="outline" className="w-full bg-transparent">
                      Stake Now
                    </Button>
                  </div>

                  <div className="border rounded-lg p-4 border-accent">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-semibold">Standard Pool</h4>
                      <Badge>30 Days</Badge>
                    </div>
                    <div className="text-2xl font-bold text-accent mb-2">8.5% APY</div>
                    <p className="text-sm text-muted-foreground mb-4">Higher rewards with 30-day lock period</p>
                    <Button className="w-full">Stake Now</Button>
                  </div>

                  <div className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-semibold">Premium Pool</h4>
                      <Badge variant="secondary">90 Days</Badge>
                    </div>
                    <div className="text-2xl font-bold text-accent mb-2">12.8% APY</div>
                    <p className="text-sm text-muted-foreground mb-4">Maximum rewards with 90-day commitment</p>
                    <Button variant="outline" className="w-full bg-transparent">
                      Stake Now
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
