import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  Search, 
  Building2, 
  MapPin, 
  DollarSign,
  TrendingUp,
  Users,
  Mail,
  ExternalLink
} from 'lucide-react'

// Mock investor data
const mockInvestors = [
  {
    id: '1',
    name: 'Sarah Johnson',
    email: 'sarah@techventures.com',
    company: 'TechVentures Capital',
    title: 'Managing Partner',
    bio: 'Former Google executive with 15+ years in tech investing. Focus on AI, SaaS, and developer tools.',
    avatar: '',
    location: 'San Francisco, CA',
    investmentRange: { min: 100000, max: 5000000 },
    preferredStages: ['early', 'growth'],
    preferredIndustries: ['Developer Tools', 'AI', 'SaaS'],
    portfolio: ['1', '2', '3'],
    preferences: {
      techScoreMin: 70,
      socialScoreMin: 60,
      teamSizeMin: 3,
      foundedYearMin: 2020
    },
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-20T00:00:00Z'
  },
  {
    id: '2',
    name: 'Michael Chen',
    email: 'michael@greenfund.com',
    company: 'Green Future Fund',
    title: 'Investment Director',
    bio: 'Climate tech specialist with deep expertise in sustainable technology and impact investing.',
    avatar: '',
    location: 'Austin, TX',
    investmentRange: { min: 500000, max: 10000000 },
    preferredStages: ['mvp', 'early', 'growth'],
    preferredIndustries: ['Climate Tech', 'Clean Energy', 'Sustainability'],
    portfolio: ['2', '4', '5'],
    preferences: {
      techScoreMin: 65,
      socialScoreMin: 55,
      teamSizeMin: 5,
      foundedYearMin: 2019
    },
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-20T00:00:00Z'
  },
  {
    id: '3',
    name: 'Dr. Emily Rodriguez',
    email: 'emily@healthtech.vc',
    company: 'HealthTech Ventures',
    title: 'Principal',
    bio: 'Medical doctor turned investor, specializing in health technology and digital health solutions.',
    avatar: '',
    location: 'Boston, MA',
    investmentRange: { min: 250000, max: 3000000 },
    preferredStages: ['idea', 'mvp', 'early'],
    preferredIndustries: ['HealthTech', 'MedTech', 'Digital Health'],
    portfolio: ['3', '6', '7'],
    preferences: {
      techScoreMin: 75,
      socialScoreMin: 65,
      teamSizeMin: 4,
      foundedYearMin: 2021
    },
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-20T00:00:00Z'
  }
]

export default function Investors() {
  const [investors] = useState(mockInvestors)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedIndustry, setSelectedIndustry] = useState('')
  const [selectedStage, setSelectedStage] = useState('')

  const industries = ['All', 'Developer Tools', 'AI', 'SaaS', 'Climate Tech', 'HealthTech', 'MedTech', 'FinTech']
  const stages = ['All', 'idea', 'mvp', 'early', 'growth', 'scale']

  const filteredInvestors = investors.filter(investor => {
    const matchesSearch = investor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         investor.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         investor.bio.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         investor.preferredIndustries.some(industry => 
                           industry.toLowerCase().includes(searchTerm.toLowerCase())
                         )
    const matchesIndustry = !selectedIndustry || selectedIndustry === 'All' || 
                           investor.preferredIndustries.includes(selectedIndustry)
    const matchesStage = !selectedStage || selectedStage === 'All' || 
                        investor.preferredStages.includes(selectedStage)
    
    return matchesSearch && matchesIndustry && matchesStage
  })

  const formatInvestmentRange = (range: { min: number; max: number }) => {
    const min = range.min >= 1000000 ? `${(range.min / 1000000).toFixed(0)}M` : `${(range.min / 1000).toFixed(0)}K`
    const max = range.max >= 1000000 ? `${(range.max / 1000000).toFixed(0)}M` : `${(range.max / 1000).toFixed(0)}K`
    return `$${min} - $${max}`
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">Find Investors</h1>
        <p className="text-muted-foreground">
          Connect with investors who are actively looking for opportunities in your space.
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
                placeholder="Search investors, companies, or focus areas..."
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

      {/* Investors Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredInvestors.map((investor) => (
          <Card key={investor.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start space-x-4">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <div className="flex-1">
                  <CardTitle className="text-lg">{investor.name}</CardTitle>
                  <CardDescription className="text-sm">
                    {investor.title} at {investor.company}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              {/* Bio */}
              <p className="text-sm text-muted-foreground line-clamp-3">
                {investor.bio}
              </p>

              {/* Location */}
              <div className="flex items-center space-x-2 text-sm">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">{investor.location}</span>
              </div>

              {/* Investment Range */}
              <div className="flex items-center space-x-2 text-sm">
                <DollarSign className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">
                  Investment Range: {formatInvestmentRange(investor.investmentRange)}
                </span>
              </div>

              {/* Preferred Industries */}
              <div className="space-y-2">
                <div className="text-sm font-medium">Focus Areas</div>
                <div className="flex flex-wrap gap-1">
                  {investor.preferredIndustries.slice(0, 3).map((industry) => (
                    <Badge key={industry} variant="outline" className="text-xs">
                      {industry}
                    </Badge>
                  ))}
                  {investor.preferredIndustries.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{investor.preferredIndustries.length - 3} more
                    </Badge>
                  )}
                </div>
              </div>

              {/* Preferred Stages */}
              <div className="space-y-2">
                <div className="text-sm font-medium">Investment Stages</div>
                <div className="flex flex-wrap gap-1">
                  {investor.preferredStages.map((stage) => (
                    <Badge key={stage} variant="secondary" className="text-xs capitalize">
                      {stage}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Portfolio Count */}
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Portfolio Companies</span>
                <span className="font-medium">{investor.portfolio.length}</span>
              </div>

              {/* Criteria */}
              <div className="space-y-2">
                <div className="text-sm font-medium">Minimum Requirements</div>
                <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                  <div>Tech Score: {investor.preferences.techScoreMin}+</div>
                  <div>Social Score: {investor.preferences.socialScoreMin}+</div>
                  <div>Team Size: {investor.preferences.teamSizeMin}+</div>
                  <div>Founded: {investor.preferences.foundedYearMin}+</div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-2">
                <Button size="sm" className="flex-1">
                  <Mail className="h-4 w-4 mr-2" />
                  Contact
                </Button>
                <Button size="sm" variant="outline">
                  View Profile
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredInvestors.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No investors found matching your criteria.</p>
        </div>
      )}

      {/* CTA Section */}
      <div className="mt-16 text-center">
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle>Are you an investor?</CardTitle>
            <CardDescription>
              Join our platform to discover and connect with promising startups
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button>
                <Building2 className="h-4 w-4 mr-2" />
                Join as Investor
              </Button>
              <Button variant="outline">
                Learn More
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

