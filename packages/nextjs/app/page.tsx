import { Navigation } from "@/components/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Eye, Coins, Shield, Users } from "lucide-react";
import Link from "next/link";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      {/* Hero Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <h1 className="font-serif font-bold text-4xl sm:text-6xl text-foreground mb-6 text-balance">
            Earn Crypto for Your <span className="text-accent">Attention</span>
          </h1>
          <p className="text-xl text-muted-foreground mb-8 text-pretty max-w-2xl mx-auto">
            Join the decentralized attention economy. Get rewarded for engaging with content while advertisers reach
            genuinely interested audiences.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="text-lg px-8">
              <Link href="/attenda">Start Earning</Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="text-lg px-8 bg-transparent">
              <Link href="/attenda/create">Create Campaign</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-muted/30">
        <div className="mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="font-serif font-bold text-3xl sm:text-4xl text-foreground mb-4">How Attenda Works</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              A transparent, decentralized platform that benefits both content creators and engaged users.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="text-center">
              <CardHeader>
                <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Eye className="w-6 h-6 text-accent" />
                </div>
                <CardTitle className="font-serif">Verified Attention</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Advanced tracking ensures genuine engagement, protecting both users and advertisers.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Coins className="w-6 h-6 text-accent" />
                </div>
                <CardTitle className="font-serif">Instant Rewards</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Earn ATT tokens immediately upon completing attention-based tasks and campaigns.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Shield className="w-6 h-6 text-accent" />
                </div>
                <CardTitle className="font-serif">Decentralized</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Built on blockchain technology with IPFS storage for transparency and security.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Users className="w-6 h-6 text-accent" />
                </div>
                <CardTitle className="font-serif">Fair Economy</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Anti-gaming mechanisms ensure fair distribution of rewards to genuine participants.
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="font-serif font-bold text-3xl sm:text-4xl text-foreground mb-6">
            Ready to Join the Attention Economy?
          </h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Connect your wallet and start earning rewards for your attention today.
          </p>
          <Button asChild size="lg" className="text-lg px-8">
            <Link href="/attenda">Get Started Now</Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
