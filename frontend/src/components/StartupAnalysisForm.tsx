import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { 
  FileText, 
  Download, 
  MapPin, 
  Users, 
  Building, 
  Target,
  Loader2,
  CheckCircle,
  AlertCircle
} from 'lucide-react'

const analysisSchema = z.object({
  name: z.string().min(1, 'Startup name is required'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  employeeCount: z.number().min(1, 'Employee count must be at least 1'),
  location: z.string().min(1, 'Location is required'),
  businessModel: z.string().optional(),
  targetMarket: z.string().optional(),
  landType: z.string().optional(),
  landArea: z.number().positive().optional()
})

type AnalysisFormData = z.infer<typeof analysisSchema>

interface AnalysisResult {
  analysisId: string
  analysis: any
  generatedAt: string
}

export default function StartupAnalysisForm() {
  const [isGenerating, setIsGenerating] = useState(false)
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [progress, setProgress] = useState(0)

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch
  } = useForm<AnalysisFormData>({
    resolver: zodResolver(analysisSchema),
    defaultValues: {
      employeeCount: 1
    }
  })

  const onSubmit = async (data: AnalysisFormData) => {
    setIsGenerating(true)
    setError(null)
    setProgress(0)

    try {
      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval)
            return 90
          }
          return prev + 10
        })
      }, 500)

      const response = await fetch('/api/analysis/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(data)
      })

      clearInterval(progressInterval)
      setProgress(100)

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to generate analysis')
      }

      const result = await response.json()
      setAnalysisResult(result.data)
    } catch (error) {
      console.error('Analysis generation error:', error)
      setError(error instanceof Error ? error.message : 'Failed to generate analysis')
    } finally {
      setIsGenerating(false)
    }
  }

  const downloadPDF = async (analysisId: string, startupName: string) => {
    try {
      const response = await fetch(`/api/analysis/${analysisId}/pdf`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })

      if (!response.ok) {
        throw new Error('Failed to generate PDF')
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${startupName}-analysis-report.pdf`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error('PDF download error:', error)
      alert('Failed to download PDF report')
    }
  }

  if (analysisResult) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-6 w-6 text-green-500" />
                <h2 className="text-2xl font-bold">Analysis Complete!</h2>
              </div>
              <Button 
                onClick={() => downloadPDF(analysisResult.analysisId, watch('name'))}
                className="flex items-center space-x-2"
              >
                <Download className="h-4 w-4" />
                <span>Download PDF Report</span>
              </Button>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Startup Name</p>
                  <p className="font-medium">{watch('name')}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Location</p>
                  <p className="font-medium">{watch('location')}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Employee Count</p>
                  <p className="font-medium">{watch('employeeCount')}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Generated At</p>
                  <p className="font-medium">{new Date(analysisResult.generatedAt).toLocaleString()}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <AnalysisReportViewer analysis={analysisResult.analysis} />
        
        <div className="flex justify-center">
          <Button 
            onClick={() => {
              setAnalysisResult(null)
              setError(null)
              setProgress(0)
            }}
            variant="outline"
          >
            Generate New Analysis
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <FileText className="h-5 w-5" />
            <span>Startup Analysis Request</span>
          </CardTitle>
          <CardDescription>
            Get a comprehensive AI-powered analysis of your AgriTech startup using Google ADK.
            Provide your startup details and receive a detailed report with market analysis,
            business model insights, and recommendations.
          </CardDescription>
        </CardHeader>
      </Card>

      {isGenerating && (
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Loader2 className="h-5 w-5 animate-spin" />
                <span className="font-medium">Generating Analysis...</span>
              </div>
              <Progress value={progress} className="h-2" />
              <p className="text-sm text-muted-foreground">
                Our AI is analyzing your startup data and generating comprehensive insights.
                This may take a few moments.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {error && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2 text-red-600">
              <AlertCircle className="h-5 w-5" />
              <span className="font-medium">Error: {error}</span>
            </div>
          </CardContent>
        </Card>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Building className="h-5 w-5" />
              <span>Basic Information</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Startup Name *</label>
                <input
                  {...register('name')}
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="e.g., GreenTech Solutions"
                />
                {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Employee Count *</label>
                <input
                  {...register('employeeCount', { valueAsNumber: true })}
                  type="number"
                  min="1"
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                />
                {errors.employeeCount && <p className="text-red-500 text-sm mt-1">{errors.employeeCount.message}</p>}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Description *</label>
              <textarea
                {...register('description')}
                rows={4}
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Describe your startup, what problem it solves, your unique approach, and key features..."
              />
              {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Location *</label>
              <input
                {...register('location')}
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="e.g., Punjab, India"
              />
              {errors.location && <p className="text-red-500 text-sm mt-1">{errors.location.message}</p>}
            </div>
          </CardContent>
        </Card>

        {/* Business Details */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Target className="h-5 w-5" />
              <span>Business Details (Optional)</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Business Model</label>
                <input
                  {...register('businessModel')}
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="e.g., B2B SaaS, Marketplace, Direct Sales"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Target Market</label>
                <input
                  {...register('targetMarket')}
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="e.g., Small farmers, Agricultural cooperatives"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Land Details */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <MapPin className="h-5 w-5" />
              <span>Land Details (Optional)</span>
            </CardTitle>
            <CardDescription>
              Provide land details for enhanced geographical analysis and GI insights
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Land Type</label>
                <select
                  {...register('landType')}
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="">Select land type</option>
                  <option value="agricultural">Agricultural</option>
                  <option value="horticultural">Horticultural</option>
                  <option value="livestock">Livestock</option>
                  <option value="mixed">Mixed</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Land Area (acres)</label>
                <input
                  {...register('landArea', { valueAsNumber: true })}
                  type="number"
                  step="0.1"
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="e.g., 5.5"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Submit Button */}
        <div className="flex justify-center">
          <Button 
            type="submit" 
            size="lg" 
            disabled={isGenerating}
            className="px-8"
          >
            {isGenerating ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Generating Analysis...
              </>
            ) : (
              <>
                <FileText className="h-4 w-4 mr-2" />
                Generate Analysis
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}

// Component to display the analysis results
function AnalysisReportViewer({ analysis }: { analysis: any }) {
  return (
    <div className="space-y-6">
      {/* Executive Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Executive Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground leading-relaxed">{analysis.executiveSummary}</p>
        </CardContent>
      </Card>

      {/* Market Analysis */}
      <Card>
        <CardHeader>
          <CardTitle>Market Analysis</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-medium mb-2">Market Size</h4>
            <p className="text-muted-foreground">{analysis.marketAnalysis.marketSize}</p>
          </div>
          <div>
            <h4 className="font-medium mb-2">Competition</h4>
            <p className="text-muted-foreground">{analysis.marketAnalysis.competition}</p>
          </div>
          {analysis.marketAnalysis.opportunities.length > 0 && (
            <div>
              <h4 className="font-medium mb-2">Key Opportunities</h4>
              <ul className="list-disc list-inside space-y-1">
                {analysis.marketAnalysis.opportunities.map((opp: string, index: number) => (
                  <li key={index} className="text-muted-foreground">{opp}</li>
                ))}
              </ul>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Business Model Analysis */}
      <Card>
        <CardHeader>
          <CardTitle>Business Model Analysis</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-medium mb-2">Value Proposition</h4>
            <p className="text-muted-foreground">{analysis.businessModelAnalysis.valueProposition}</p>
          </div>
          <div>
            <h4 className="font-medium mb-2">Scalability</h4>
            <p className="text-muted-foreground">{analysis.businessModelAnalysis.scalability}</p>
          </div>
        </CardContent>
      </Card>

      {/* Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle>Recommendations</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {analysis.recommendations.immediate.length > 0 && (
            <div>
              <h4 className="font-medium mb-2">Immediate Actions (Next 3 Months)</h4>
              <ul className="list-disc list-inside space-y-1">
                {analysis.recommendations.immediate.map((rec: string, index: number) => (
                  <li key={index} className="text-muted-foreground">{rec}</li>
                ))}
              </ul>
            </div>
          )}
          {analysis.recommendations.shortTerm.length > 0 && (
            <div>
              <h4 className="font-medium mb-2">Short-term Goals (6-12 Months)</h4>
              <ul className="list-disc list-inside space-y-1">
                {analysis.recommendations.shortTerm.map((rec: string, index: number) => (
                  <li key={index} className="text-muted-foreground">{rec}</li>
                ))}
              </ul>
            </div>
          )}
        </CardContent>
      </Card>

      {/* GI Analysis */}
      {analysis.giAnalysis && (
        <Card>
          <CardHeader>
            <CardTitle>Geographical Indication Analysis</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium mb-2">Market Potential</h4>
                <Badge variant="outline">{analysis.giAnalysis.marketPotential}/100</Badge>
              </div>
              <div>
                <h4 className="font-medium mb-2">Uniqueness Score</h4>
                <Badge variant="outline">{analysis.giAnalysis.uniquenessScore}/100</Badge>
              </div>
            </div>
            {analysis.giAnalysis.identifiedProducts.length > 0 && (
              <div>
                <h4 className="font-medium mb-2">Identified GI Products</h4>
                <div className="flex flex-wrap gap-2">
                  {analysis.giAnalysis.identifiedProducts.map((product: string, index: number) => (
                    <Badge key={index} variant="secondary">{product}</Badge>
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
