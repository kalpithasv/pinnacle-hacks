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

  // Template function to create structured prompt
  const createAnalysisPrompt = (data: AnalysisFormData): string => {
    let prompt = `Please conduct a comprehensive market analysis for the following agricultural technology startup:

**STARTUP DETAILS:**
- Company Name: ${data.name}
- Description: ${data.description}
- Location: ${data.location}
- Team Size: ${data.employeeCount} employees`

    // Add optional business details
    if (data.businessModel) {
      prompt += `\n- Business Model: ${data.businessModel}`
    }
    
    if (data.targetMarket) {
      prompt += `\n- Target Market: ${data.targetMarket}`
    }

    // Add land details if provided
    if (data.landType || data.landArea) {
      prompt += `\n\n**LAND/AGRICULTURAL FOCUS:**`
      if (data.landType) {
        prompt += `\n- Land Type: ${data.landType}`
      }
      if (data.landArea) {
        prompt += `\n- Land Area: ${data.landArea} acres`
      }
    }

    prompt += `

**ANALYSIS REQUIREMENTS:**
Please provide a detailed analysis covering the following areas:

1. **Executive Summary**: Brief overview of the startup's potential and key findings

2. **Market Analysis**:
   - Market size and growth potential in the agricultural technology sector
   - Competitive landscape analysis
   - Key market opportunities and challenges
   - Regional market considerations for ${data.location}

3. **Business Model Evaluation**:
   - Strengths and weaknesses of the current approach
   - Revenue potential and scalability assessment
   - Value proposition analysis

4. **Target Market Assessment**:
   - Customer segment analysis
   - Market penetration strategies
   - Customer acquisition potential

5. **Geographical Indication (GI) Analysis**:
   - Potential for GI product integration
   - Regional agricultural product opportunities
   - Market uniqueness score and potential

6. **Strategic Recommendations**:
   - Immediate actions (next 3 months)
   - Short-term goals (6-12 months)
   - Long-term strategic direction

7. **Risk Assessment**:
   - Market risks and mitigation strategies
   - Operational challenges
   - Regulatory considerations

Please structure your response as a comprehensive business analysis report suitable for investors and stakeholders.`

    return prompt
  }

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

      // Create the structured prompt
      const analysisPrompt = createAnalysisPrompt(data)

      // Format the request according to ADK structure
      const requestBody = {
        app_name: "startup-analysis-tool",
        user_id: localStorage.getItem('userId') || 'anonymous_user',
        session_id: `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        streaming: false,
        new_message: {
          parts: [
            {
              text: analysisPrompt
            }
          ],
          role: "user"
        }
      }

      console.log('Sending request:', requestBody)

      const response = await fetch('http://127.0.0.1:8080/run', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(requestBody)
      })

      clearInterval(progressInterval)
      setProgress(100)

      if (!response.ok) {
        const errorText = await response.text()
        console.error('API Error Response:', errorText)
        throw new Error(`API Error: ${response.status} - ${errorText}`)
      }

      const result = await response.json()
      console.log('API Response:', result)

      // Transform the ADK response to our expected format
      const transformedResult = {
        analysisId: `analysis_${Date.now()}`,
        analysis: parseAnalysisResponse(result[0]?.content?.parts?.[0]?.text || ''),
        generatedAt: new Date().toISOString()
      }

      setAnalysisResult(transformedResult)
    } catch (error) {
      console.error('Analysis generation error:', error)
      setError(error instanceof Error ? error.message : 'Failed to generate analysis')
    } finally {
      setIsGenerating(false)
    }
  }

  // Function to parse the AI response and structure it
  const parseAnalysisResponse = (responseText: string) => {
    // Basic parsing - you can enhance this based on your needs
    return {
      executiveSummary: extractSection(responseText, 'Executive Summary') || 'Analysis completed successfully.',
      marketAnalysis: {
        marketSize: extractSection(responseText, 'Market Analysis') || 'Market analysis provided.',
        competition: extractSection(responseText, 'Competitive') || 'Competitive analysis included.',
        opportunities: extractBulletPoints(responseText, 'opportunities') || []
      },
      businessModelAnalysis: {
        valueProposition: extractSection(responseText, 'Value Proposition') || 'Business model evaluated.',
        scalability: extractSection(responseText, 'Scalability') || 'Scalability assessment provided.'
      },
      recommendations: {
        immediate: extractBulletPoints(responseText, 'Immediate') || [],
        shortTerm: extractBulletPoints(responseText, 'Short-term') || []
      },
      giAnalysis: {
        marketPotential: Math.floor(Math.random() * 40) + 60, // Mock score
        uniquenessScore: Math.floor(Math.random() * 40) + 60, // Mock score
        identifiedProducts: []
      },
      fullText: responseText // Keep the full response for display
    }
  }

  // Helper function to extract sections (basic implementation)
  const extractSection = (text: string, sectionName: string): string => {
    const regex = new RegExp(`\\*\\*${sectionName}[^\\*]*\\*\\*([^\\*]+)`, 'i')
    const match = text.match(regex)
    return match ? match[1].trim() : ''
  }

  // Helper function to extract bullet points
  const extractBulletPoints = (text: string, keyword: string): string[] => {
    const lines = text.split('\n')
    const bulletPoints: string[] = []
    let inSection = false
    
    for (const line of lines) {
      if (line.toLowerCase().includes(keyword.toLowerCase())) {
        inSection = true
        continue
      }
      if (inSection && (line.startsWith('-') || line.startsWith('•') || line.match(/^\d+\./))) {
        bulletPoints.push(line.replace(/^[-•\d.]\s*/, '').trim())
      } else if (inSection && line.trim() === '') {
        continue
      } else if (inSection && line.startsWith('**')) {
        break
      }
    }
    
    return bulletPoints.slice(0, 5) // Limit to 5 items
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

// Component to display the analysis results - enhanced to show full text
function AnalysisReportViewer({ analysis }: { analysis: any }) {
  return (
    <div className="space-y-6">
      {/* Full AI Response */}
      <Card>
        <CardHeader>
          <CardTitle>AI Analysis Report</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="prose prose-sm max-w-none">
            <pre className="whitespace-pre-wrap text-sm text-muted-foreground leading-relaxed">
              {analysis.fullText}
            </pre>
          </div>
        </CardContent>
      </Card>

      {/* Structured Sections (if parsing worked) */}
      {analysis.executiveSummary && (
        <Card>
          <CardHeader>
            <CardTitle>Executive Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground leading-relaxed">{analysis.executiveSummary}</p>
          </CardContent>
        </Card>
      )}

      {/* Market Analysis */}
      {analysis.marketAnalysis && (
        <Card>
          <CardHeader>
            <CardTitle>Market Analysis</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">Market Overview</h4>
              <p className="text-muted-foreground">{analysis.marketAnalysis.marketSize}</p>
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
      )}

      {/* Recommendations */}
      {(analysis.recommendations.immediate.length > 0 || analysis.recommendations.shortTerm.length > 0) && (
        <Card>
          <CardHeader>
            <CardTitle>Recommendations</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {analysis.recommendations.immediate.length > 0 && (
              <div>
                <h4 className="font-medium mb-2">Immediate Actions</h4>
                <ul className="list-disc list-inside space-y-1">
                  {analysis.recommendations.immediate.map((rec: string, index: number) => (
                    <li key={index} className="text-muted-foreground">{rec}</li>
                  ))}
                </ul>
              </div>
            )}
            {analysis.recommendations.shortTerm.length > 0 && (
              <div>
                <h4 className="font-medium mb-2">Short-term Goals</h4>
                <ul className="list-disc list-inside space-y-1">
                  {analysis.recommendations.shortTerm.map((rec: string, index: number) => (
                    <li key={index} className="text-muted-foreground">{rec}</li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}