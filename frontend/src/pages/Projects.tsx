import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  Search, 
  Filter, 
  Star, 
  GitFork, 
  MessageCircle, 
  TrendingUp,
  MapPin,
  Calendar,
  Users,
  ExternalLink,
  Github,
  Twitter
} from 'lucide-react'
import { Project } from '../../../shared/types'

// Mock data for demonstration
const mockProjects: Project[] = [
  {
    id: '1',
    name: 'AI Code Assistant',
    description: 'Revolutionary AI-powered code completion and debugging tool for developers',
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
    tags: ['AI', 'Developer Tools', 'SaaS'],
    metrics: {
      githubStars: 1250,
      githubForks: 89,
      githubCommits: 450,
      githubPrs: 67,
      githubIssues: 23,
      twitterFollowers: 3200,
      twitterTweets: 156,
      twitterEngagement: 8.5
    }
  },
  {
    id: '2',
    name: 'EcoTrack',
    description: 'IoT platform for real-time environmental monitoring and carbon footprint tracking',
    githubUrl: 'https://github.com/example/ecotrack',
    location: 'Austin, TX',
    industry: 'Climate Tech',
    stage: 'early',
    fundingGoal: 2000000,
    currentFunding: 500000,
    teamSize: 8,
    foundedYear: 2023,
    techScore: 78,
    socialScore: 65,
    overallScore: 73,
    isDiscovered: true,
    createdAt: '2024-01-10T08:00:00Z',
    updatedAt: '2024-01-18T12:00:00Z',
    tags: ['IoT', 'Climate', 'Hardware'],
    metrics: {
      githubStars: 340,
      githubForks: 45,
      githubCommits: 280,
      githubPrs: 34,
      githubIssues: 12,
      twitterFollowers: 890,
      twitterTweets: 67,
      twitterEngagement: 6.2
    }
  },
  {
    id: '3',
    name: 'HealthSync',
    description: 'Blockchain-based health data platform for secure patient record management',
    githubUrl: 'https://github.com/example/healthsync',
    twitterUrl: 'https://twitter.com/healthsync',
    location: 'Boston, MA',
    industry: 'HealthTech',
    stage: 'mvp',
    fundingGoal: 3000000,
    currentFunding: 800000,
    teamSize: 15,
    foundedYear: 2022,
    techScore: 82,
    socialScore: 58,
    overallScore: 72,
    isDiscovered: false,
    createdAt: '2024-01-05T14:00:00Z',
    updatedAt: '2024-01-19T09:00:00Z',
    tags: ['Blockchain', 'HealthTech', 'Security'],
    metrics: {
      githubStars: 890,
      githubForks: 67,
      githubCommits: 520,
      githubPrs: 89,
      githubIssues: 34,
      twitterFollowers: 2100,
      twitterTweets: 98,
      twitterEngagement: 7.1
    }
  }
]

export default function Projects() {
  const [projects] = useState<Project[]>(mockProjects)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedIndustry, setSelectedIndustry] = useState('')
  const [selectedStage, setSelectedStage] = useState('')

  const industries = ['All', 'Developer Tools', 'Climate Tech', 'HealthTech', 'FinTech', 'EdTech']
  const stages = ['All', 'idea', 'mvp', 'early', 'growth', 'scale']

  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    const matchesIndustry = !selectedIndustry || selectedIndustry === 'All' || project.industry === selectedIndustry
    const matchesStage = !selectedStage || selectedStage === 'All' || project.stage === selectedStage
    
    return matchesSearch && matchesIndustry && matchesStage
  })

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-50'
    if (score >= 60) return 'text-yellow-600 bg-yellow-50'
    if (score >= 40) return 'text-orange-600 bg-orange-50'
    return 'text-red-600 bg-red-50'
  }

  const getScoreLabel = (score: number) => {
    if (score >= 80) return 'Excellent'
    if (score >= 60) return 'Good'
    if (score >= 40) return 'Fair'
    return 'Poor'
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">Discover Projects</h1>
        <p className="text-muted-foreground">
          Explore startups discovered through our AI-powered platform and geo-social agents.
        </p>
      </div>

      {/* Filters */}
      <div className="mb-8 space-y-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <input
                type="text"
                placeholder="Search projects, tags, or descriptions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>
          
          <div className="flex gap-2">
            <select
              value={selectedIndustry}
              onChange={(e) => setSelectedIndustry(e.target.value)}
              className="px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            >
              {industries.map(industry => (
                <option key={industry} value={industry === 'All' ? '' : industry}>
                  {industry}
                </option>
              ))}
            </select>
            
            <select
              value={selectedStage}
              onChange={(e) => setSelectedStage(e.target.value)}
              className="px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            >
              {stages.map(stage => (
                <option key={stage} value={stage === 'All' ? '' : stage}>
                  {stage.charAt(0).toUpperCase() + stage.slice(1)}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProjects.map((project) => (
          <Card key={project.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg mb-2">{project.name}</CardTitle>
                  <CardDescription className="line-clamp-2">
                    {project.description}
                  </CardDescription>
                </div>
                {project.isDiscovered && (
                  <Badge variant="secondary" className="ml-2">
                    <MapPin className="h-3 w-3 mr-1" />
                    Discovered
                  </Badge>
                )}
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              {/* Tags */}
              <div className="flex flex-wrap gap-2">
                {project.tags.map((tag) => (
                  <Badge key={tag} variant="outline" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>

              {/* Metrics */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center space-x-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">{project.location}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">{project.teamSize} members</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Founded {project.foundedYear}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground capitalize">{project.stage} stage</span>
                </div>
              </div>

              {/* GitHub Metrics */}
              {project.metrics.githubStars && (
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-1">
                      <Star className="h-4 w-4 text-yellow-500" />
                      <span>{project.metrics.githubStars}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <GitFork className="h-4 w-4 text-muted-foreground" />
                      <span>{project.metrics.githubForks}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <MessageCircle className="h-4 w-4 text-muted-foreground" />
                      <span>{project.metrics.githubIssues}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Scores */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Overall Score</span>
                  <Badge className={`${getScoreColor(project.overallScore)} border-0`}>
                    {project.overallScore}/100 - {getScoreLabel(project.overallScore)}
                  </Badge>
                </div>
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Tech: {project.techScore}</span>
                  <span>Social: {project.socialScore}</span>
                </div>
              </div>

              {/* Funding */}
              {project.fundingGoal && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Funding Progress</span>
                    <span>{Math.round((project.currentFunding! / project.fundingGoal) * 100)}%</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div 
                      className="bg-primary h-2 rounded-full" 
                      style={{ width: `${(project.currentFunding! / project.fundingGoal) * 100}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>${(project.currentFunding! / 1000000).toFixed(1)}M raised</span>
                    <span>${(project.fundingGoal / 1000000).toFixed(1)}M goal</span>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-2 pt-2">
                <Button size="sm" className="flex-1">
                  View Details
                </Button>
                <Button size="sm" variant="outline">
                  <ExternalLink className="h-4 w-4" />
                </Button>
              </div>

              {/* Social Links */}
              <div className="flex gap-2">
                {project.githubUrl && (
                  <a 
                    href={project.githubUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-foreground"
                  >
                    <Github className="h-4 w-4" />
                  </a>
                )}
                {project.twitterUrl && (
                  <a 
                    href={project.twitterUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-foreground"
                  >
                    <Twitter className="h-4 w-4" />
                  </a>
                )}
                {project.website && (
                  <a 
                    href={project.website} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-foreground"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </a>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredProjects.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No projects found matching your criteria.</p>
        </div>
      )}
    </div>
  )
}

