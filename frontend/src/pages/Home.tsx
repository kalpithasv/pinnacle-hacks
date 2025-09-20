import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  TrendingUp, 
  Users, 
  Zap, 
  BarChart3, 
  ArrowRight,
  Github,
  Twitter,
  MapPin,
  Star
} from 'lucide-react'

export default function Home() {
  const features = [
    {
      icon: TrendingUp,
      title: 'Tech Scoring',
      description: 'AI-powered analysis of GitHub activity, commits, PRs, and code quality',
    },
    {
      icon: Twitter,
      title: 'Social Scoring',
      description: 'Twitter engagement analysis and social media presence evaluation',
    },
    {
      icon: MapPin,
      title: 'Geo-Social Discovery',
      description: 'Automated discovery of new businesses through location-based social scraping',
    },
    {
      icon: Zap,
      title: 'AI Matchmaking',
      description: 'Intelligent matching between investors and startups based on preferences',
    },
  ]

  const stats = [
    { label: 'Active Projects', value: '1,247', icon: TrendingUp },
    { label: 'Investors', value: '342', icon: Users },
    { label: 'Matches Made', value: '89', icon: Zap },
    { label: 'Success Rate', value: '94%', icon: BarChart3 },
  ]

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-background to-secondary/10">
        <div className="container mx-auto px-4 py-24">
          <div className="text-center max-w-4xl mx-auto">
            <Badge variant="secondary" className="mb-4">
              🚀 Now in Beta
            </Badge>
            <h1 className="text-5xl md:text-6xl font-bold tracking-tight mb-6">
              AgriTech
              <span className="text-primary"> Innovation</span>
              <br />Platform
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Connect with investors for your agricultural innovations. Get AI-powered insights 
              about Geographical Indication potential and access to the Innovation Voucher Programme.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" asChild>
                <Link to="/startups">
                  Explore Startups
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link to="/submit">
                  Submit Your Innovation
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat) => {
              const Icon = stat.icon
              return (
                <div key={stat.label} className="text-center">
                  <div className="flex justify-center mb-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                      <Icon className="h-6 w-6 text-primary" />
                    </div>
                  </div>
                  <div className="text-3xl font-bold mb-2">{stat.value}</div>
                  <div className="text-sm text-muted-foreground">{stat.label}</div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Powered by Advanced AI
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Our platform uses cutting-edge technology to analyze and score startups 
              across multiple dimensions, giving you unprecedented insights.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature) => {
              const Icon = feature.icon
              return (
                <Card key={feature.title} className="text-center">
                  <CardHeader>
                    <div className="flex justify-center mb-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                        <Icon className="h-6 w-6 text-primary" />
                      </div>
                    </div>
                    <CardTitle className="text-lg">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription>{feature.description}</CardDescription>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-24 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              How It Works
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              From discovery to investment, our platform streamlines the entire process.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="flex justify-center mb-6">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-primary-foreground text-2xl font-bold">
                  1
                </div>
              </div>
              <h3 className="text-xl font-semibold mb-4">Discover & Score</h3>
              <p className="text-muted-foreground">
                Our AI agents discover startups through GitHub, Twitter, and geo-social scraping, 
                then score them on tech and social metrics.
              </p>
            </div>

            <div className="text-center">
              <div className="flex justify-center mb-6">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-primary-foreground text-2xl font-bold">
                  2
                </div>
              </div>
              <h3 className="text-xl font-semibold mb-4">AI Matchmaking</h3>
              <p className="text-muted-foreground">
                Our intelligent matching engine connects investors with startups based on 
                preferences, investment criteria, and compatibility scores.
              </p>
            </div>

            <div className="text-center">
              <div className="flex justify-center mb-6">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-primary-foreground text-2xl font-bold">
                  3
                </div>
              </div>
              <h3 className="text-xl font-semibold mb-4">Connect & Invest</h3>
              <p className="text-muted-foreground">
                Investors can browse curated projects, view detailed analytics, 
                and connect directly with founders through our platform.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Ready to Find Your Next Investment?
            </h2>
            <p className="text-xl text-muted-foreground mb-8">
              Join thousands of investors and entrepreneurs who are already using 
              Pinnacle Hacks to discover and fund the next generation of startups.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" asChild>
                <Link to="/projects">
                  Start Exploring
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link to="/investors">
                  For Investors
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
