import { useParams } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  ArrowLeft,
  Star, 
  GitFork, 
  MessageCircle, 
  TrendingUp,
  MapPin,
  Calendar,
  Users,
  ExternalLink,
  Github,
  Twitter,
  DollarSign,
  BarChart3,
  Heart,
  Share2
} from 'lucide-react'
import { Link } from 'react-router-dom'

export default function ProjectDetail() {
  const { id } = useParams()
  
  // Mock project data - in real app, fetch by ID
  const project = {
    id: '1',
    name: 'AI Code Assistant',
    description: 'Revolutionary AI-powered code completion and debugging tool for developers. Our platform uses advanced machine learning to understand code context and provide intelligent suggestions, making development faster and more efficient.',
    longDescription: `AI Code Assistant is a cutting-edge development tool that leverages state-of-the-art machine learning models to revolutionize how developers write code. 

Our platform analyzes millions of code repositories to understand patterns, best practices, and common solutions, then provides intelligent code completions, bug fixes, and optimization suggestions in real-time.

Key Features:
• Intelligent code completion with context awareness
• Automated bug detection and fixing suggestions
• Code optimization recommendations
• Multi-language support (Python, JavaScript, TypeScript, Go, Rust)
• IDE integration for popular editors
• Team collaboration features
• Privacy-first approach with local processing options

The team consists of experienced engineers from top tech companies, with deep expertise in machine learning, compiler design, and developer tools. We're backed by leading VCs and have already secured partnerships with major tech companies.`,
    githubUrl: 'https://github.com/example/ai-code-assistant',
    twitterUrl: 'https://twitter.com/aicodeassistant',
    website: 'https://aicodeassistant.com',
    location: 'San Francisco, CA',
    industry: 'Developer Tools',
    stage: 'growth',
    fundingGoal: 5000000,
    currentFunding: 2500000,
    teamSize: 12,
    foundedYear: 2022,
    techScore: 85,
    socialScore: 72,
    overallScore: 80,
    isDiscovered: false,
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-20T15:30:00Z',
    tags: ['AI', 'Developer Tools', 'SaaS', 'Machine Learning'],
    metrics: {
      githubStars: 1250,
      githubForks: 89,
      githubCommits: 450,
      githubPrs: 67,
      githubIssues: 23,
      twitterFollowers: 3200,
      twitterTweets: 156,
      twitterEngagement: 8.5
    },
    team: [
      { name: 'Sarah Chen', role: 'CEO & Co-founder', experience: 'Ex-Google, 8 years' },
      { name: 'Michael Rodriguez', role: 'CTO & Co-founder', experience: 'Ex-Microsoft, 10 years' },
      { name: 'Emily Johnson', role: 'Head of ML', experience: 'Ex-OpenAI, 6 years' },
      { name: 'David Kim', role: 'Head of Engineering', experience: 'Ex-Stripe, 7 years' }
    ]
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-50'
    if (score >= 60) return 'text-yellow-600 bg-yellow-50'
    if (score >= 40) return 'text-orange-600 bg-orange-50'
    return 'text-red-600 bg-red-50'
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Link to="/projects" className="inline-flex items-center text-muted-foreground hover:text-foreground mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Projects
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Header */}
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-3xl mb-2">{project.name}</CardTitle>
                  <CardDescription className="text-lg">
                    {project.description}
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <Heart className="h-4 w-4 mr-2" />
                    Save
                  </Button>
                  <Button variant="outline" size="sm">
                    <Share2 className="h-4 w-4 mr-2" />
                    Share
                  </Button>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-2 mt-4">
                {project.tags.map((tag) => (
                  <Badge key={tag} variant="secondary">
                    {tag}
                  </Badge>
                ))}
              </div>
            </CardHeader>
          </Card>

          {/* About */}
          <Card>
            <CardHeader>
              <CardTitle>About</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground whitespace-pre-line">
                {project.longDescription}
              </p>
            </CardContent>
          </Card>

          {/* Team */}
          <Card>
            <CardHeader>
              <CardTitle>Team</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {project.team.map((member, index) => (
                  <div key={index} className="flex items-center space-x-3 p-3 border rounded-lg">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <Users className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <div className="font-medium">{member.name}</div>
                      <div className="text-sm text-muted-foreground">{member.role}</div>
                      <div className="text-xs text-muted-foreground">{member.experience}</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Key Metrics */}
          <Card>
            <CardHeader>
              <CardTitle>Key Metrics</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Overall Score</span>
                <Badge className={`${getScoreColor(project.overallScore)} border-0`}>
                  {project.overallScore}/100
                </Badge>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Tech Score</span>
                  <span className="font-medium">{project.techScore}/100</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div 
                    className="bg-blue-500 h-2 rounded-full" 
                    style={{ width: `${project.techScore}%` }}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Social Score</span>
                  <span className="font-medium">{project.socialScore}/100</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div 
                    className="bg-green-500 h-2 rounded-full" 
                    style={{ width: `${project.socialScore}%` }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Project Info */}
          <Card>
            <CardHeader>
              <CardTitle>Project Info</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center space-x-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{project.location}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{project.teamSize} team members</span>
              </div>
              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">Founded {project.foundedYear}</span>
              </div>
              <div className="flex items-center space-x-2">
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm capitalize">{project.stage} stage</span>
              </div>
            </CardContent>
          </Card>

          {/* GitHub Stats */}
          <Card>
            <CardHeader>
              <CardTitle>GitHub Activity</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Star className="h-4 w-4 text-yellow-500" />
                  <span className="text-sm">Stars</span>
                </div>
                <span className="font-medium">{project.metrics.githubStars}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <GitFork className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Forks</span>
                </div>
                <span className="font-medium">{project.metrics.githubForks}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <MessageCircle className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Issues</span>
                </div>
                <span className="font-medium">{project.metrics.githubIssues}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <BarChart3 className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Commits</span>
                </div>
                <span className="font-medium">{project.metrics.githubCommits}</span>
              </div>
            </CardContent>
          </Card>

          {/* Funding */}
          <Card>
            <CardHeader>
              <CardTitle>Funding</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Progress</span>
                  <span>{Math.round((project.currentFunding! / project.fundingGoal) * 100)}%</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div 
                    className="bg-primary h-2 rounded-full" 
                    style={{ width: `${(project.currentFunding! / project.fundingGoal) * 100}%` }}
                  />
                </div>
              </div>
              <div className="flex justify-between text-sm">
                <span>Raised</span>
                <span className="font-medium">${(project.currentFunding! / 1000000).toFixed(1)}M</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Goal</span>
                <span className="font-medium">${(project.fundingGoal / 1000000).toFixed(1)}M</span>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-3">
                <Button className="w-full">
                  <DollarSign className="h-4 w-4 mr-2" />
                  Express Interest
                </Button>
                <Button variant="outline" className="w-full">
                  Contact Team
                </Button>
                <div className="flex gap-2">
                  {project.githubUrl && (
                    <Button variant="outline" size="sm" className="flex-1" asChild>
                      <a href={project.githubUrl} target="_blank" rel="noopener noreferrer">
                        <Github className="h-4 w-4 mr-2" />
                        GitHub
                      </a>
                    </Button>
                  )}
                  {project.website && (
                    <Button variant="outline" size="sm" className="flex-1" asChild>
                      <a href={project.website} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Website
                      </a>
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

