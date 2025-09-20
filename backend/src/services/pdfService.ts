import PDFDocument from 'pdfkit'
import { StartupAnalysisReport, StartupAnalysisRequest } from './adkService'

export class PDFReportService {
  generateStartupReport(
    request: StartupAnalysisRequest, 
    analysis: StartupAnalysisReport
  ): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({
          size: 'A4',
          margins: {
            top: 50,
            bottom: 50,
            left: 50,
            right: 50
          }
        })

        const buffers: Buffer[] = []
        doc.on('data', buffers.push.bind(buffers))
        doc.on('end', () => {
          const pdfData = Buffer.concat(buffers)
          resolve(pdfData)
        })

        // Header
        this.addHeader(doc, request.name)
        
        // Executive Summary
        this.addSection(doc, 'Executive Summary', analysis.executiveSummary)
        
        // Market Analysis
        this.addSection(doc, 'Market Analysis', this.formatMarketAnalysis(analysis.marketAnalysis))
        
        // Business Model Analysis
        this.addSection(doc, 'Business Model Analysis', this.formatBusinessModelAnalysis(analysis.businessModelAnalysis))
        
        // Team Analysis
        this.addSection(doc, 'Team Analysis', this.formatTeamAnalysis(analysis.teamAnalysis))
        
        // Location Analysis
        this.addSection(doc, 'Location Analysis', this.formatLocationAnalysis(analysis.locationAnalysis))
        
        // Financial Projections
        this.addSection(doc, 'Financial Projections', this.formatFinancialProjections(analysis.financialProjections))
        
        // Risk Assessment
        this.addSection(doc, 'Risk Assessment', this.formatRiskAssessment(analysis.riskAssessment))
        
        // Recommendations
        this.addSection(doc, 'Recommendations', this.formatRecommendations(analysis.recommendations))
        
        // GI Analysis (if available)
        if (analysis.giAnalysis) {
          this.addSection(doc, 'Geographical Indication Analysis', this.formatGIAnalysis(analysis.giAnalysis))
        }
        
        // Footer
        this.addFooter(doc)
        
        doc.end()
      } catch (error) {
        reject(error)
      }
    })
  }

  private addHeader(doc: InstanceType<typeof PDFDocument>, startupName: string) {
    // Title
    doc.fontSize(24)
      .font('Helvetica-Bold')
      .fillColor('#2D3748')
      .text(`${startupName} - Startup Analysis Report`, 50, 50, { align: 'center' })
    
    // Subtitle
    doc.fontSize(14)
      .font('Helvetica')
      .fillColor('#4A5568')
      .text('Comprehensive Business Analysis & Recommendations', 50, 90, { align: 'center' })
    
    // Date
    doc.fontSize(10)
      .fillColor('#718096')
      .text(`Generated on: ${new Date().toLocaleDateString()}`, 50, 120, { align: 'center' })
    
    // Line separator
    doc.moveTo(50, 140)
      .lineTo(545, 140)
      .stroke('#E2E8F0')
    
    doc.y = 160
  }

  private addSection(doc: InstanceType<typeof PDFDocument>, title: string, content: string) {
    // Check if we need a new page
    if (doc.y > 700) {
      doc.addPage()
    }
    
    // Section title
    doc.fontSize(16)
      .font('Helvetica-Bold')
      .fillColor('#2D3748')
      .text(title, 50, doc.y)
    
    doc.y += 25
    
    // Section content
    doc.fontSize(11)
      .font('Helvetica')
      .fillColor('#4A5568')
      .text(content, 50, doc.y, {
        width: 495,
        align: 'left',
        lineGap: 3
      })
    
    doc.y += 20
  }

  private formatMarketAnalysis(analysis: any): string {
    let content = `Market Size: ${analysis.marketSize}\n\n`
    content += `Competition: ${analysis.competition}\n\n`
    
    if (analysis.opportunities.length > 0) {
      content += `Key Opportunities:\n`
      analysis.opportunities.forEach((opp: string, index: number) => {
        content += `• ${opp}\n`
      })
      content += '\n'
    }
    
    if (analysis.threats.length > 0) {
      content += `Potential Threats:\n`
      analysis.threats.forEach((threat: string, index: number) => {
        content += `• ${threat}\n`
      })
    }
    
    return content
  }

  private formatBusinessModelAnalysis(analysis: any): string {
    let content = `Value Proposition: ${analysis.valueProposition}\n\n`
    content += `Cost Structure: ${analysis.costStructure}\n\n`
    content += `Scalability: ${analysis.scalability}\n\n`
    
    if (analysis.revenueStreams.length > 0) {
      content += `Revenue Streams:\n`
      analysis.revenueStreams.forEach((stream: string) => {
        content += `• ${stream}\n`
      })
    }
    
    return content
  }

  private formatTeamAnalysis(analysis: any): string {
    let content = `Team Size Assessment: ${analysis.teamSize}\n\n`
    
    if (analysis.skillGaps.length > 0) {
      content += `Identified Skill Gaps:\n`
      analysis.skillGaps.forEach((gap: string) => {
        content += `• ${gap}\n`
      })
      content += '\n'
    }
    
    if (analysis.recommendations.length > 0) {
      content += `Team Building Recommendations:\n`
      analysis.recommendations.forEach((rec: string) => {
        content += `• ${rec}\n`
      })
    }
    
    return content
  }

  private formatLocationAnalysis(analysis: any): string {
    let content = `Market Access: ${analysis.marketAccess}\n\n`
    content += `Infrastructure: ${analysis.infrastructure}\n\n`
    content += `Regulatory Environment: ${analysis.regulatoryEnvironment}\n\n`
    
    if (analysis.geographicalAdvantages.length > 0) {
      content += `Geographical Advantages:\n`
      analysis.geographicalAdvantages.forEach((advantage: string) => {
        content += `• ${advantage}\n`
      })
    }
    
    return content
  }

  private formatFinancialProjections(analysis: any): string {
    let content = `Revenue Projections: ${analysis.revenueProjection}\n\n`
    content += `Cost Projections: ${analysis.costProjection}\n\n`
    content += `Break-even Analysis: ${analysis.breakEvenAnalysis}\n\n`
    content += `Funding Requirements: ${analysis.fundingRequirements}`
    
    return content
  }

  private formatRiskAssessment(analysis: any): string {
    let content = ''
    
    if (analysis.technicalRisks.length > 0) {
      content += `Technical Risks:\n`
      analysis.technicalRisks.forEach((risk: string) => {
        content += `• ${risk}\n`
      })
      content += '\n'
    }
    
    if (analysis.marketRisks.length > 0) {
      content += `Market Risks:\n`
      analysis.marketRisks.forEach((risk: string) => {
        content += `• ${risk}\n`
      })
      content += '\n'
    }
    
    if (analysis.operationalRisks.length > 0) {
      content += `Operational Risks:\n`
      analysis.operationalRisks.forEach((risk: string) => {
        content += `• ${risk}\n`
      })
      content += '\n'
    }
    
    if (analysis.mitigationStrategies.length > 0) {
      content += `Mitigation Strategies:\n`
      analysis.mitigationStrategies.forEach((strategy: string) => {
        content += `• ${strategy}\n`
      })
    }
    
    return content
  }

  private formatRecommendations(analysis: any): string {
    let content = ''
    
    if (analysis.immediate.length > 0) {
      content += `Immediate Actions (Next 3 Months):\n`
      analysis.immediate.forEach((rec: string) => {
        content += `• ${rec}\n`
      })
      content += '\n'
    }
    
    if (analysis.shortTerm.length > 0) {
      content += `Short-term Goals (6-12 Months):\n`
      analysis.shortTerm.forEach((rec: string) => {
        content += `• ${rec}\n`
      })
      content += '\n'
    }
    
    if (analysis.longTerm.length > 0) {
      content += `Long-term Strategy (1-3 Years):\n`
      analysis.longTerm.forEach((rec: string) => {
        content += `• ${rec}\n`
      })
    }
    
    return content
  }

  private formatGIAnalysis(analysis: any): string {
    let content = `Market Potential: ${analysis.marketPotential}/100\n\n`
    content += `Uniqueness Score: ${analysis.uniquenessScore}/100\n\n`
    content += `Certification Status: ${analysis.certificationStatus}\n\n`
    
    if (analysis.identifiedProducts.length > 0) {
      content += `Identified GI Products:\n`
      analysis.identifiedProducts.forEach((product: string) => {
        content += `• ${product}\n`
      })
    }
    
    return content
  }

  private addFooter(doc: InstanceType<typeof PDFDocument>) {
    const pageHeight = doc.page.height
    const footerY = pageHeight - 50
    
    doc.fontSize(8)
      .font('Helvetica')
      .fillColor('#718096')
      .text('Generated by AgriTech Innovation Platform', 50, footerY, { align: 'center' })
  }
}

export default new PDFReportService()
