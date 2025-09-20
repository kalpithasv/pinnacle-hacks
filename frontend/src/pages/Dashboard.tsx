import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  TrendingUp, 
  Users, 
  Star, 
  GitFork,
  MessageCircle,
  MapPin,
  Calendar,
  BarChart3,
  Activity,
  Zap,
  Target,
  DollarSign
} from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts'

export default function Dashboard() {
  // Mock data for charts
  const scoreTrendData = [
    { month: 'Jan', techScore: 75, socialScore: 68, overallScore: 72 },
    { month: 'Feb', techScore: 78, socialScore: 72, overallScore: 75 },
    { month: 'Mar', techScore: 82, socialScore: 75, overallScore: 79 },
    { month: 'Apr', techScore: 85, socialScore: 78, overallScore: 82 },
    { month: 'May', techScore: 88, socialScore: 80, overallScore: 85 },
    { month: 'Jun', techScore: 90, socialScore: 82, overallScore: 87 }
  ]

  const industryData = [
    { name: 'Developer Tools', value: 35, color: '#8884d8' },
    { name: 'AI/ML', value: 25, color: '#82ca9d' },
    { name: 'HealthTech', value: 20, color: '#ffc658' },
    { name: 'Climate Tech', value: 15, color: '#ff7300' },
    { name: 'FinTech', value: 5, color: '#00ff00' }
  ]

  const stageData = [
    { stage: 'Idea', count: 12, funding: 500000 },
    { stage: 'MVP', count: 28, funding: 1200000 },
    { stage: 'Early', count: 45, funding: 3500000 },
    { stage: 'Growth', count: 32, funding: 8000000 },
    { stage: 'Scale', count: 8, funding: 15000000 }
  ]

  const recentActivity = [
    {
      id: 1,
      type: 'project_discovered',
      message: 'New project "EcoTrack" discovered via geo-social agent',
      timestamp: '2 hours ago',
      icon: MapPin
    },
    {
      id: 2,
      type: 'match_created',
      message: 'High-quality match created between TechVentures and AI Code Assistant',
      timestamp: '4 hours ago',
      icon: Zap
    },
    {
      id: 3,
      type: 'score_updated',
      message: 'HealthSync tech score updated to 82/100',
      timestamp: '6 hours ago',
      icon: TrendingUp
    },
    {
      id: 4,
      type: 'investor_joined',
      message: 'New investor Dr. Emily Rodriguez joined the platform',
      timestamp: '1 day ago',
      icon: Users
    }
  ]

  const topProjects = [
    { name: 'AI Code Assistant', score: 87, industry: 'Developer Tools', stage: 'Growth' },
    { name: 'EcoTrack', score: 85, industry: 'Climate Tech', stage: 'Early' },
    { name: 'HealthSync', score: 82, industry: 'HealthTech', stage: 'MVP' },
    { name: 'DataFlow', score: 80, industry: 'AI/ML', stage: 'Growth' },
    { name: 'GreenTech', score: 78, industry: 'Climate Tech', stage: 'Early' }
  ]

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">Dashboard</h1>
        <p className="text-muted-foreground">
          Overview of platform activity, metrics, and insights.
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              <div>
                <div className="text-2xl font-bold">1,247</div>
                <div className="text-sm text-muted-foreground">Active Projects</div>
              </div>
            </div>
            <div className="mt-2">
              <Badge variant="secondary" className="text-xs">
                +12% this month
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-green-500" />
              <div>
                <div className="text-2xl font-bold">342</div>
                <div className="text-sm text-muted-foreground">Active Investors</div>
              </div>
            </div>
            <div className="mt-2">
              <Badge variant="secondary" className="text-xs">
                +8% this month
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <Zap className="h-5 w-5 text-yellow-500" />
              <div>
                <div className="text-2xl font-bold">89</div>
                <div className="text-sm text-muted-foreground">Successful Matches</div>
              </div>
            </div>
            <div className="mt-2">
              <Badge variant="secondary" className="text-xs">
                94% success rate
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <DollarSign className="h-5 w-5 text-purple-500" />
              <div>
                <div className="text-2xl font-bold">$45.2M</div>
                <div className="text-sm text-muted-foreground">Total Funding</div>
              </div>
            </div>
            <div className="mt-2">
              <Badge variant="secondary" className="text-xs">
                +23% this quarter
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Score Trends */}
        <Card>
          <CardHeader>
            <CardTitle>Score Trends</CardTitle>
            <CardDescription>
              Average tech and social scores over time
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={scoreTrendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="techScore" stroke="#8884d8" strokeWidth={2} />
                <Line type="monotone" dataKey="socialScore" stroke="#82ca9d" strokeWidth={2} />
                <Line type="monotone" dataKey="overallScore" stroke="#ff7300" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Industry Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Industry Distribution</CardTitle>
            <CardDescription>
              Projects by industry category
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={industryData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {industryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Stage Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Projects by Stage</CardTitle>
            <CardDescription>
              Distribution of projects across development stages
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={stageData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="stage" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Top Projects */}
        <Card>
          <CardHeader>
            <CardTitle>Top Performing Projects</CardTitle>
            <CardDescription>
              Highest scoring projects this month
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topProjects.map((project, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-sm font-bold text-primary">#{index + 1}</span>
                    </div>
                    <div>
                      <div className="font-medium">{project.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {project.industry} • {project.stage}
                      </div>
                    </div>
                  </div>
                  <Badge variant="outline">{project.score}/100</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>
            Latest platform updates and discoveries
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentActivity.map((activity) => {
              const Icon = activity.icon
              return (
                <div key={activity.id} className="flex items-start space-x-3 p-3 border rounded-lg">
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <Icon className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex-1">
                    <div className="text-sm">{activity.message}</div>
                    <div className="text-xs text-muted-foreground">{activity.timestamp}</div>
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

