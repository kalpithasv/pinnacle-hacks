import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  FileText, 
  Download, 
  Clock, 
  User,
  MapPin,
  Building
} from 'lucide-react'
import StartupAnalysisForm from '@/components/StartupAnalysisForm'

interface AnalysisHistory {
  id: string
  startupName: string
  location: string
  employeeCount: number
  status: string
  generatedBy: {
    name: string
    email: string
  }
  generatedAt: string
}

export default function Analysis() {
  const [analyses, setAnalyses] = useState<AnalysisHistory[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)

  useEffect(() => {
    fetchAnalyses()
  }, [])

  const fetchAnalyses = async () => {
    try {
      const response = await fetch('/api/analysis', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setAnalyses(data.data)
      }
    } catch (error) {
      console.error('Error fetching analyses:', error)
    } finally {
      setLoading(false)
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

  if (showForm) {
    return (
      <div className="container mx-auto py-8">
        <div className="mb-6">
          <Button 
            onClick={() => setShowForm(false)}
            variant="outline"
            className="mb-4"
          >
            ← Back to Analysis History
          </Button>
        </div>
        <StartupAnalysisForm />
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Startup Analysis</h1>
        <p className="text-muted-foreground">
          Generate comprehensive AI-powered analysis reports for your AgriTech startup using Google ADK.
        </p>
      </div>

      <div className="mb-6">
        <Button 
          onClick={() => setShowForm(true)}
          className="flex items-center space-x-2"
        >
          <FileText className="h-4 w-4" />
          <span>Generate New Analysis</span>
        </Button>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i}>
              <CardContent className="pt-6">
                <div className="animate-pulse space-y-4">
                  <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : analyses.length === 0 ? (
        <Card>
          <CardContent className="pt-6 text-center">
            <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-medium mb-2">No Analysis Reports Yet</h3>
            <p className="text-muted-foreground mb-4">
              Generate your first startup analysis report to get started.
            </p>
            <Button onClick={() => setShowForm(true)}>
              Generate Analysis
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Analysis History</h2>
          {analyses.map((analysis) => (
            <Card key={analysis.id}>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <h3 className="text-lg font-medium">{analysis.startupName}</h3>
                      <Badge 
                        variant={analysis.status === 'completed' ? 'default' : 'secondary'}
                      >
                        {analysis.status}
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center space-x-1">
                        <MapPin className="h-4 w-4" />
                        <span>{analysis.location}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Building className="h-4 w-4" />
                        <span>{analysis.employeeCount} employees</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <User className="h-4 w-4" />
                        <span>{analysis.generatedBy.name}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Clock className="h-4 w-4" />
                        <span>{new Date(analysis.generatedAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex space-x-2">
                    <Button 
                      variant="outline"
                      size="sm"
                      onClick={() => downloadPDF(analysis.id, analysis.startupName)}
                      className="flex items-center space-x-1"
                    >
                      <Download className="h-4 w-4" />
                      <span>PDF</span>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
