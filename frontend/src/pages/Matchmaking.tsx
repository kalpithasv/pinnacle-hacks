import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  Zap, 
  MessageCircle, 
  TrendingUp,
  Users,
  Star,
  ArrowRight,
  Filter,
  Sparkles,
  Target,
  Heart
} from 'lucide-react'

// Mock matchmaking data
const mockMatches = [
  {
    id: '1',
    investorId: '1',
    projectId: '1',
    score: 92,
    reasons: [
      'Perfect industry alignment (Developer Tools)',
      'Strong tech score (85/100) meets your minimum (70+)',
      'Team size (12) exceeds your preference (3+)',
      'Growth stage matches your investment focus',
      'Located in your preferred region (San Francisco)'
    ],
    status: 'pending',
    createdAt: '2024-01-20T10:00:00Z',
    updatedAt: '2024-01-20T10:00:00Z',
    investor: {
      name: 'Sarah Johnson',
      company: 'TechVentures Capital',
      avatar: ''
    },
    project: {
      name: 'AI Code Assistant',
      description: 'Revolutionary AI-powered code completion and debugging tool',
      industry: 'Developer Tools',
      stage: 'growth',
      techScore: 85,
      socialScore: 72,
      location: 'San Francisco, CA',
      teamSize: 12,
      fundingGoal: 5000000,
      currentFunding: 2500000
    }
  },
  {
    id: '2',
    investorId: '2',
    projectId: '2',
    score: 88,
    reasons: [
      'Climate tech focus aligns with your expertise',
      'Strong social engagement (65/100)',
      'Early stage fits your investment criteria',
      'Growing team with relevant experience',
      'High potential for environmental impact'
    ],
    status: 'pending',
    createdAt: '2024-01-19T15:30:00Z',
    updatedAt: '2024-01-19T15:30:00Z',
    investor: {
      name: 'Michael Chen',
      company: 'Green Future Fund',
      avatar: ''
    },
    project: {
      name: 'EcoTrack',
      description: 'IoT platform for real-time environmental monitoring',
      industry: 'Climate Tech',
      stage: 'early',
      techScore: 78,
      socialScore: 65,
      location: 'Austin, TX',
      teamSize: 8,
      fundingGoal: 2000000,
      currentFunding: 500000
    }
  },
  {
    id: '3',
    investorId: '3',
    projectId: '3',
    score: 85,
    reasons: [
      'HealthTech sector matches your specialization',
      'Excellent tech score (82/100)',
      'MVP stage aligns with your investment focus',
      'Strong team with medical expertise',
      'Addresses critical healthcare challenges'
    ],
    status: 'accepted',
    createdAt: '2024-01-18T09:15:00Z',
    updatedAt: '2024-01-19T14:20:00Z',
    investor: {
      name: 'Dr. Emily Rodriguez',
      company: 'HealthTech Ventures',
      avatar: ''
    },
    project: {
      name: 'HealthSync',
      description: 'Blockchain-based health data platform',
      industry: 'HealthTech',
      stage: 'mvp',
      techScore: 82,
      socialScore: 58,
      location: 'Boston, MA',
      teamSize: 15,
      fundingGoal: 3000000,
      currentFunding: 800000
    }
  }
]

export default function Matchmaking() {
  const [matches] = useState(mockMatches)
  const [selectedFilter, setSelectedFilter] = useState('all')

  const filters = [
    { value: 'all', label: 'All Matches' },
    { value: 'pending', label: 'Pending' },
    { value: 'accepted', label: 'Accepted' },
    { value: 'rejected', label: 'Rejected' }
  ]

  const filteredMatches = matches.filter(match => 
    selectedFilter === 'all' || match.status === selectedFilter
  )

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600 bg-green-50'
    if (score >= 80) return 'text-blue-600 bg-blue-50'
    if (score >= 70) return 'text-yellow-600 bg-yellow-50'
    return 'text-orange-600 bg-orange-50'
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'accepted': return 'text-green-600 bg-green-50'
      case 'rejected': return 'text-red-600 bg-red-50'
      case 'contacted': return 'text-blue-600 bg-blue-50'
      default: return 'text-yellow-600 bg-yellow-50'
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="flex items-center space-x-2 mb-4">
          <Sparkles className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold">AI Matchmaking</h1>
        </div>
        <p className="text-muted-foreground">
          Discover perfect matches between investors and startups using our advanced AI algorithm.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <Target className="h-5 w-5 text-primary" />
              <div>
                <div className="text-2xl font-bold">{matches.length}</div>
                <div className="text-sm text-muted-foreground">Total Matches</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <Heart className="h-5 w-5 text-green-500" />
              <div>
                <div className="text-2xl font-bold">
                  {matches.filter(m => m.status === 'accepted').length}
                </div>
                <div className="text-sm text-muted-foreground">Accepted</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <MessageCircle className="h-5 w-5 text-blue-500" />
              <div>
                <div className="text-2xl font-bold">
                  {matches.filter(m => m.status === 'pending').length}
                </div>
                <div className="text-sm text-muted-foreground">Pending</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-purple-500" />
              <div>
                <div className="text-2xl font-bold">
                  {Math.round(matches.reduce((acc, m) => acc + m.score, 0) / matches.length)}
                </div>
                <div className="text-sm text-muted-foreground">Avg Score</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="mb-6">
        <div className="flex gap-2">
          {filters.map((filter) => (
            <Button
              key={filter.value}
              variant={selectedFilter === filter.value ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedFilter(filter.value)}
            >
              {filter.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Matches */}
      <div className="space-y-6">
        {filteredMatches.map((match) => (
          <Card key={match.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-4 mb-2">
                    <div className="flex items-center space-x-2">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <Users className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <div className="font-semibold">{match.investor.name}</div>
                        <div className="text-sm text-muted-foreground">{match.investor.company}</div>
                      </div>
                    </div>
                    <ArrowRight className="h-4 w-4 text-muted-foreground" />
                    <div className="flex items-center space-x-2">
                      <div className="h-10 w-10 rounded-full bg-secondary/10 flex items-center justify-center">
                        <TrendingUp className="h-5 w-5 text-secondary-foreground" />
                      </div>
                      <div>
                        <div className="font-semibold">{match.project.name}</div>
                        <div className="text-sm text-muted-foreground">{match.project.industry}</div>
                      </div>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">
                    {match.project.description}
                  </p>
                </div>
                <div className="flex flex-col items-end space-y-2">
                  <Badge className={`${getScoreColor(match.score)} border-0`}>
                    {match.score}/100 Match
                  </Badge>
                  <Badge variant="outline" className={getStatusColor(match.status)}>
                    {match.status.charAt(0).toUpperCase() + match.status.slice(1)}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              {/* Project Details */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <div className="text-muted-foreground">Stage</div>
                  <div className="font-medium capitalize">{match.project.stage}</div>
                </div>
                <div>
                  <div className="text-muted-foreground">Location</div>
                  <div className="font-medium">{match.project.location}</div>
                </div>
                <div>
                  <div className="text-muted-foreground">Team Size</div>
                  <div className="font-medium">{match.project.teamSize} members</div>
                </div>
                <div>
                  <div className="text-muted-foreground">Funding</div>
                  <div className="font-medium">
                    ${(match.project.currentFunding / 1000000).toFixed(1)}M / ${(match.project.fundingGoal / 1000000).toFixed(1)}M
                  </div>
                </div>
              </div>

              {/* Scores */}
              <div className="flex space-x-4">
                <div className="flex items-center space-x-2">
                  <div className="text-sm text-muted-foreground">Tech Score:</div>
                  <Badge variant="outline">{match.project.techScore}/100</Badge>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="text-sm text-muted-foreground">Social Score:</div>
                  <Badge variant="outline">{match.project.socialScore}/100</Badge>
                </div>
              </div>

              {/* Match Reasons */}
              <div className="space-y-2">
                <div className="text-sm font-medium">Why this is a great match:</div>
                <ul className="space-y-1">
                  {match.reasons.map((reason, index) => (
                    <li key={index} className="flex items-start space-x-2 text-sm">
                      <Star className="h-3 w-3 text-yellow-500 mt-1 flex-shrink-0" />
                      <span className="text-muted-foreground">{reason}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-4">
                {match.status === 'pending' && (
                  <>
                    <Button size="sm">
                      <Heart className="h-4 w-4 mr-2" />
                      Accept Match
                    </Button>
                    <Button size="sm" variant="outline">
                      Decline
                    </Button>
                  </>
                )}
                {match.status === 'accepted' && (
                  <>
                    <Button size="sm">
                      <MessageCircle className="h-4 w-4 mr-2" />
                      Start Conversation
                    </Button>
                    <Button size="sm" variant="outline">
                      View Details
                    </Button>
                  </>
                )}
                <Button size="sm" variant="outline">
                  Learn More
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredMatches.length === 0 && (
        <div className="text-center py-12">
          <div className="flex justify-center mb-4">
            <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center">
              <Target className="h-8 w-8 text-muted-foreground" />
            </div>
          </div>
          <h3 className="text-lg font-semibold mb-2">No matches found</h3>
          <p className="text-muted-foreground">
            Try adjusting your filters or check back later for new matches.
          </p>
        </div>
      )}

      {/* CTA Section */}
      <div className="mt-16 text-center">
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle>Want better matches?</CardTitle>
            <CardDescription>
              Update your preferences to get more personalized recommendations
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button>
                <Filter className="h-4 w-4 mr-2" />
                Update Preferences
              </Button>
              <Button variant="outline">
                View All Projects
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

