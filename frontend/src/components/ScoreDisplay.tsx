import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { TrendingUp, Users, Star, MapPin } from 'lucide-react'

interface ScoreDisplayProps {
  techScore?: {
    score: number
    codeActivity: number
    communityEngagement: number
    projectMaintenance: number
    codeQuality: number
  }
  socialScore?: {
    score: number
    reach: number
    engagement: number
    activity: number
  }
  giScore?: {
    marketPotential: number
    uniquenessScore: number
    giProducts: string[]
    geographicalRegion: string
  }
  overallScore?: number
  loading?: boolean
}

export default function ScoreDisplay({ 
  techScore, 
  socialScore, 
  giScore, 
  overallScore, 
  loading = false 
}: ScoreDisplayProps) {
  if (loading) {
    return <ScoreDisplaySkeleton />
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600'
    if (score >= 60) return 'text-yellow-600'
    if (score >= 40) return 'text-orange-600'
    return 'text-red-600'
  }

  const getScoreLabel = (score: number) => {
    if (score >= 80) return 'Excellent'
    if (score >= 60) return 'Good'
    if (score >= 40) return 'Fair'
    return 'Poor'
  }

  return (
    <div className="space-y-6">
      {/* Overall Score */}
      {overallScore !== undefined && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5" />
              <span>Overall Score</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold">{overallScore}/100</span>
                <Badge className={`${getScoreColor(overallScore)} bg-opacity-20`}>
                  {getScoreLabel(overallScore)}
                </Badge>
              </div>
              <Progress value={overallScore} className="h-3" />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Technical Score */}
      {techScore && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Star className="h-5 w-5" />
              <span>Technical Score</span>
              <Badge variant="outline">{techScore.score}/100</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Progress value={techScore.score} className="h-2" />
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Code Activity</span>
                  <span className="font-medium">{techScore.codeActivity}/100</span>
                </div>
                <Progress value={techScore.codeActivity} className="h-1" />
                <p className="text-xs text-muted-foreground">Weight: 30%</p>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Community Engagement</span>
                  <span className="font-medium">{techScore.communityEngagement}/100</span>
                </div>
                <Progress value={techScore.communityEngagement} className="h-1" />
                <p className="text-xs text-muted-foreground">Weight: 25%</p>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Project Maintenance</span>
                  <span className="font-medium">{techScore.projectMaintenance}/100</span>
                </div>
                <Progress value={techScore.projectMaintenance} className="h-1" />
                <p className="text-xs text-muted-foreground">Weight: 25%</p>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Code Quality</span>
                  <span className="font-medium">{techScore.codeQuality}/100</span>
                </div>
                <Progress value={techScore.codeQuality} className="h-1" />
                <p className="text-xs text-muted-foreground">Weight: 20%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Social Score */}
      {socialScore && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Users className="h-5 w-5" />
              <span>Social Score</span>
              <Badge variant="outline">{socialScore.score}/100</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Progress value={socialScore.score} className="h-2" />
            
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Reach</span>
                  <span className="font-medium">{socialScore.reach}/100</span>
                </div>
                <Progress value={socialScore.reach} className="h-1" />
                <p className="text-xs text-muted-foreground">Weight: 40%</p>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Engagement</span>
                  <span className="font-medium">{socialScore.engagement}/100</span>
                </div>
                <Progress value={socialScore.engagement} className="h-1" />
                <p className="text-xs text-muted-foreground">Weight: 35%</p>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Activity</span>
                  <span className="font-medium">{socialScore.activity}/100</span>
                </div>
                <Progress value={socialScore.activity} className="h-1" />
                <p className="text-xs text-muted-foreground">Weight: 25%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* GI Score */}
      {giScore && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <MapPin className="h-5 w-5" />
              <span>Geographical Indication Analysis</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Market Potential</span>
                  <span className="font-medium">{giScore.marketPotential}/100</span>
                </div>
                <Progress value={giScore.marketPotential} className="h-2" />
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Uniqueness Score</span>
                  <span className="font-medium">{giScore.uniquenessScore}/100</span>
                </div>
                <Progress value={giScore.uniquenessScore} className="h-2" />
              </div>
            </div>
            
            <div className="space-y-2">
              <p className="text-sm font-medium">Geographical Region:</p>
              <Badge variant="secondary">{giScore.geographicalRegion}</Badge>
            </div>
            
            {giScore.giProducts.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm font-medium">Identified GI Products:</p>
                <div className="flex flex-wrap gap-2">
                  {giScore.giProducts.map((product, index) => (
                    <Badge key={index} variant="outline">
                      {product}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}

function ScoreDisplaySkeleton() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-32" />
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-3 w-full" />
          <div className="flex justify-between">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-20" />
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-40" />
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-2 w-full" />
          <div className="grid grid-cols-2 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-1 w-full" />
                <Skeleton className="h-3 w-16" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

