import axios from 'axios'

export interface ADKRequest {
  app_name: string
  user_id: string
  session_id: string
  new_message: {
    parts: Array<{
      text: string
    }>
    role: string
  }
  streaming?: boolean
  state_delta?: any
}

export interface ADKEvent {
  id: string
  timestamp: string
  author: string
  content: {
    parts: Array<{
      text: string
    }>
    role: string
  }
  [key: string]: any
}

export interface StartupAnalysisRequest {
  name: string
  description: string
  employeeCount: number
  location: string
  businessModel?: string
  targetMarket?: string
  landType?: string
  landArea?: number
}

export interface StartupAnalysisReport {
  executiveSummary: string
  marketAnalysis: {
    marketSize: string
    competition: string
    opportunities: string[]
    threats: string[]
  }
  businessModelAnalysis: {
    revenueStreams: string[]
    costStructure: string
    valueProposition: string
    scalability: string
  }
  teamAnalysis: {
    teamSize: string
    skillGaps: string[]
    recommendations: string[]
  }
  locationAnalysis: {
    geographicalAdvantages: string[]
    marketAccess: string
    infrastructure: string
    regulatoryEnvironment: string
  }
  financialProjections: {
    revenueProjection: string
    costProjection: string
    breakEvenAnalysis: string
    fundingRequirements: string
  }
  riskAssessment: {
    technicalRisks: string[]
    marketRisks: string[]
    operationalRisks: string[]
    mitigationStrategies: string[]
  }
  recommendations: {
    immediate: string[]
    shortTerm: string[]
    longTerm: string[]
  }
  giAnalysis?: {
    identifiedProducts: string[]
    marketPotential: number
    uniquenessScore: number
    certificationStatus: string
  }
}

class ADKService {
  private baseUrl: string
  private apiKey: string

  constructor() {
    this.baseUrl = process.env.ADK_API_URL || 'http://localhost:8000'
    this.apiKey = process.env.ADK_API_KEY || ''
  }

  async generateStartupAnalysis(request: StartupAnalysisRequest): Promise<StartupAnalysisReport> {
    try {
      const adkRequest: ADKRequest = {
        app_name: 'startup-analysis-agent',
        user_id: 'system',
        session_id: `startup-${Date.now()}`,
        new_message: {
          parts: [
            {
              text: this.buildAnalysisPrompt(request)
            }
          ],
          role: 'user'
        },
        streaming: false
      }

      const response = await axios.post(`${this.baseUrl}/run`, adkRequest, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        }
      })

      const events: ADKEvent[] = response.data
      return this.parseAnalysisResponse(events, request)

    } catch (error) {
      console.error('ADK Analysis error:', error)
      throw new Error('Failed to generate startup analysis')
    }
  }

  private buildAnalysisPrompt(request: StartupAnalysisRequest): string {
    return `
Please provide a comprehensive analysis for the following AgriTech startup:

**Startup Information:**
- Name: ${request.name}
- Description: ${request.description}
- Employee Count: ${request.employeeCount}
- Location: ${request.location}
- Business Model: ${request.businessModel || 'Not specified'}
- Target Market: ${request.targetMarket || 'Not specified'}
- Land Type: ${request.landType || 'Not specified'}
- Land Area: ${request.landArea || 'Not specified'} acres

**Please provide a detailed analysis covering:**

1. **Executive Summary** (2-3 paragraphs)
   - Brief overview of the startup
   - Key strengths and potential
   - Overall assessment

2. **Market Analysis**
   - Market size and growth potential
   - Competitive landscape
   - Key opportunities
   - Potential threats

3. **Business Model Analysis**
   - Revenue streams
   - Cost structure
   - Value proposition
   - Scalability assessment

4. **Team Analysis**
   - Team size assessment
   - Identified skill gaps
   - Team building recommendations

5. **Location Analysis**
   - Geographical advantages
   - Market access
   - Infrastructure assessment
   - Regulatory environment

6. **Financial Projections**
   - Revenue projections
   - Cost projections
   - Break-even analysis
   - Funding requirements

7. **Risk Assessment**
   - Technical risks
   - Market risks
   - Operational risks
   - Mitigation strategies

8. **Recommendations**
   - Immediate actions (next 3 months)
   - Short-term goals (6-12 months)
   - Long-term strategy (1-3 years)

9. **Geographical Indication Analysis** (if applicable)
   - Identified GI products in the region
   - Market potential for GI products
   - Uniqueness score
   - Certification recommendations

Please provide specific, actionable insights and data-driven recommendations. Focus on practical advice that can help this startup succeed in the AgriTech sector.
    `.trim()
  }

  private parseAnalysisResponse(events: ADKEvent[], request: StartupAnalysisRequest): StartupAnalysisReport {
    // Extract the main content from the ADK response
    const mainEvent = events.find(event => 
      event.content && 
      event.content.parts && 
      event.content.parts.length > 0 &&
      event.content.parts[0].text
    )

    if (!mainEvent) {
      throw new Error('No valid analysis content received from ADK')
    }

    const analysisText = mainEvent.content.parts[0].text

    // Parse the structured response
    return this.parseStructuredResponse(analysisText, request)
  }

  private parseStructuredResponse(text: string, request: StartupAnalysisRequest): StartupAnalysisReport {
    // This is a simplified parser - in a real implementation, you might want to use
    // more sophisticated parsing or ask the ADK to return structured JSON
    
    const sections = this.extractSections(text)
    
    return {
      executiveSummary: sections.executiveSummary || 'Analysis in progress...',
      marketAnalysis: {
        marketSize: sections.marketSize || 'Market analysis pending...',
        competition: sections.competition || 'Competitive analysis pending...',
        opportunities: this.extractListItems(sections.opportunities),
        threats: this.extractListItems(sections.threats)
      },
      businessModelAnalysis: {
        revenueStreams: this.extractListItems(sections.revenueStreams),
        costStructure: sections.costStructure || 'Cost analysis pending...',
        valueProposition: sections.valueProposition || 'Value proposition analysis pending...',
        scalability: sections.scalability || 'Scalability assessment pending...'
      },
      teamAnalysis: {
        teamSize: sections.teamSize || `Current team size: ${request.employeeCount} employees`,
        skillGaps: this.extractListItems(sections.skillGaps),
        recommendations: this.extractListItems(sections.teamRecommendations)
      },
      locationAnalysis: {
        geographicalAdvantages: this.extractListItems(sections.geographicalAdvantages),
        marketAccess: sections.marketAccess || 'Market access analysis pending...',
        infrastructure: sections.infrastructure || 'Infrastructure assessment pending...',
        regulatoryEnvironment: sections.regulatoryEnvironment || 'Regulatory analysis pending...'
      },
      financialProjections: {
        revenueProjection: sections.revenueProjection || 'Revenue projections pending...',
        costProjection: sections.costProjection || 'Cost projections pending...',
        breakEvenAnalysis: sections.breakEvenAnalysis || 'Break-even analysis pending...',
        fundingRequirements: sections.fundingRequirements || 'Funding analysis pending...'
      },
      riskAssessment: {
        technicalRisks: this.extractListItems(sections.technicalRisks),
        marketRisks: this.extractListItems(sections.marketRisks),
        operationalRisks: this.extractListItems(sections.operationalRisks),
        mitigationStrategies: this.extractListItems(sections.mitigationStrategies)
      },
      recommendations: {
        immediate: this.extractListItems(sections.immediateRecommendations),
        shortTerm: this.extractListItems(sections.shortTermRecommendations),
        longTerm: this.extractListItems(sections.longTermRecommendations)
      },
      giAnalysis: request.landType ? {
        identifiedProducts: this.extractListItems(sections.giProducts),
        marketPotential: this.extractNumber(sections.marketPotential) || 75,
        uniquenessScore: this.extractNumber(sections.uniquenessScore) || 70,
        certificationStatus: sections.certificationStatus || 'pending'
      } : undefined
    }
  }

  private extractSections(text: string): Record<string, string> {
    const sections: Record<string, string> = {}
    
    // Extract sections based on common patterns
    const sectionPatterns = [
      { key: 'executiveSummary', pattern: /executive summary[:\s]*(.*?)(?=\n\n|\n\d+\.|$)/is },
      { key: 'marketSize', pattern: /market size[:\s]*(.*?)(?=\n\n|\n\d+\.|$)/is },
      { key: 'competition', pattern: /competition[:\s]*(.*?)(?=\n\n|\n\d+\.|$)/is },
      { key: 'opportunities', pattern: /opportunities[:\s]*(.*?)(?=\n\n|\n\d+\.|$)/is },
      { key: 'threats', pattern: /threats[:\s]*(.*?)(?=\n\n|\n\d+\.|$)/is },
      { key: 'revenueStreams', pattern: /revenue streams[:\s]*(.*?)(?=\n\n|\n\d+\.|$)/is },
      { key: 'costStructure', pattern: /cost structure[:\s]*(.*?)(?=\n\n|\n\d+\.|$)/is },
      { key: 'valueProposition', pattern: /value proposition[:\s]*(.*?)(?=\n\n|\n\d+\.|$)/is },
      { key: 'scalability', pattern: /scalability[:\s]*(.*?)(?=\n\n|\n\d+\.|$)/is },
      { key: 'teamSize', pattern: /team size[:\s]*(.*?)(?=\n\n|\n\d+\.|$)/is },
      { key: 'skillGaps', pattern: /skill gaps[:\s]*(.*?)(?=\n\n|\n\d+\.|$)/is },
      { key: 'teamRecommendations', pattern: /team.*recommendations[:\s]*(.*?)(?=\n\n|\n\d+\.|$)/is },
      { key: 'geographicalAdvantages', pattern: /geographical advantages[:\s]*(.*?)(?=\n\n|\n\d+\.|$)/is },
      { key: 'marketAccess', pattern: /market access[:\s]*(.*?)(?=\n\n|\n\d+\.|$)/is },
      { key: 'infrastructure', pattern: /infrastructure[:\s]*(.*?)(?=\n\n|\n\d+\.|$)/is },
      { key: 'regulatoryEnvironment', pattern: /regulatory environment[:\s]*(.*?)(?=\n\n|\n\d+\.|$)/is },
      { key: 'revenueProjection', pattern: /revenue projection[:\s]*(.*?)(?=\n\n|\n\d+\.|$)/is },
      { key: 'costProjection', pattern: /cost projection[:\s]*(.*?)(?=\n\n|\n\d+\.|$)/is },
      { key: 'breakEvenAnalysis', pattern: /break.?even analysis[:\s]*(.*?)(?=\n\n|\n\d+\.|$)/is },
      { key: 'fundingRequirements', pattern: /funding requirements[:\s]*(.*?)(?=\n\n|\n\d+\.|$)/is },
      { key: 'technicalRisks', pattern: /technical risks[:\s]*(.*?)(?=\n\n|\n\d+\.|$)/is },
      { key: 'marketRisks', pattern: /market risks[:\s]*(.*?)(?=\n\n|\n\d+\.|$)/is },
      { key: 'operationalRisks', pattern: /operational risks[:\s]*(.*?)(?=\n\n|\n\d+\.|$)/is },
      { key: 'mitigationStrategies', pattern: /mitigation strategies[:\s]*(.*?)(?=\n\n|\n\d+\.|$)/is },
      { key: 'immediateRecommendations', pattern: /immediate.*recommendations[:\s]*(.*?)(?=\n\n|\n\d+\.|$)/is },
      { key: 'shortTermRecommendations', pattern: /short.?term.*recommendations[:\s]*(.*?)(?=\n\n|\n\d+\.|$)/is },
      { key: 'longTermRecommendations', pattern: /long.?term.*recommendations[:\s]*(.*?)(?=\n\n|\n\d+\.|$)/is },
      { key: 'giProducts', pattern: /gi products[:\s]*(.*?)(?=\n\n|\n\d+\.|$)/is },
      { key: 'marketPotential', pattern: /market potential[:\s]*(.*?)(?=\n\n|\n\d+\.|$)/is },
      { key: 'uniquenessScore', pattern: /uniqueness score[:\s]*(.*?)(?=\n\n|\n\d+\.|$)/is },
      { key: 'certificationStatus', pattern: /certification status[:\s]*(.*?)(?=\n\n|\n\d+\.|$)/is }
    ]

    for (const { key, pattern } of sectionPatterns) {
      const match = text.match(pattern)
      if (match) {
        sections[key] = match[1].trim()
      }
    }

    return sections
  }

  private extractListItems(text: string): string[] {
    if (!text) return []
    
    // Extract bullet points, numbered lists, or dash-separated items
    const items = text
      .split(/\n|;|,/)
      .map(item => item.replace(/^[\s\-\*\d+\.\)]+/, '').trim())
      .filter(item => item.length > 0)
    
    return items.slice(0, 10) // Limit to 10 items
  }

  private extractNumber(text: string): number | null {
    if (!text) return null
    
    const match = text.match(/\d+/)
    return match ? parseInt(match[0]) : null
  }
}

export default new ADKService()
