import axios from "axios";

export interface ADKRequest {
  app_name: string;
  user_id: string;
  session_id: string;
  new_message: {
    parts: Array<{
      text: string;
    }>;
    role: string;
  };
  streaming?: boolean;
  state_delta?: any;
}

export interface ADKEvent {
  id: string;
  timestamp: string;
  author: string;
  content: {
    parts: Array<{
      text: string;
    }>;
    role: string;
  };
  [key: string]: any;
}

export interface StartupAnalysisRequest {
  name: string;
  description: string;
  employeeCount: number;
  location: string;
  businessModel?: string;
  targetMarket?: string;
  landType?: string;
  landArea?: number;
}

export interface StartupAnalysisReport {
  executiveSummary: string;
  marketAnalysis: {
    marketSize: string;
    competition: string;
    opportunities: string[];
    threats: string[];
  };
  businessModelAnalysis: {
    revenueStreams: string[];
    costStructure: string;
    valueProposition: string;
    scalability: string;
  };
  teamAnalysis: {
    teamSize: string;
    skillGaps: string[];
    recommendations: string[];
  };
  locationAnalysis: {
    geographicalAdvantages: string[];
    marketAccess: string;
    infrastructure: string;
    regulatoryEnvironment: string;
  };
  financialProjections: {
    revenueProjection: string;
    costProjection: string;
    breakEvenAnalysis: string;
    fundingRequirements: string;
  };
  riskAssessment: {
    technicalRisks: string[];
    marketRisks: string[];
    operationalRisks: string[];
    mitigationStrategies: string[];
  };
  recommendations: {
    immediate: string[];
    shortTerm: string[];
    longTerm: string[];
  };
  giAnalysis?: {
    identifiedProducts: string[];
    marketPotential: number;
    uniquenessScore: number;
    certificationStatus: string;
  };
}

class ADKService {
  private baseUrl: string;
  private apiKey: string;

  constructor() {
    this.baseUrl = process.env.ADK_API_URL || "http://localhost:8000";
    this.apiKey = process.env.ADK_API_KEY || "";
  }

  async generateStartupAnalysis(
    request: StartupAnalysisRequest
  ): Promise<StartupAnalysisReport> {
    try {
      const adkRequest: ADKRequest = {
        app_name: "startup-analysis-agent",
        user_id: "system",
        session_id: `startup-${Date.now()}`,
        new_message: {
          parts: [
            {
              text: this.buildAnalysisPrompt(request),
            },
          ],
          role: "user",
        },
        streaming: false,
      };

      const response = await axios.post(`${this.baseUrl}/run`, adkRequest, {
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          "Content-Type": "application/json",
        },
      });

      const events: ADKEvent[] = response.data;
      return this.parseAnalysisResponse(events, request);
    } catch (error) {
      console.error("ADK Analysis error:", error);
      throw new Error("Failed to generate startup analysis");
    }
  }

  private buildAnalysisPrompt(request: StartupAnalysisRequest): string {
    return `
Please provide a comprehensive analysis for the following AgriTech startup in JSON format:

**Startup Information:**
- Name: ${request.name}
- Description: ${request.description}
- Employee Count: ${request.employeeCount}
- Location: ${request.location}
- Business Model: ${request.businessModel || "Not specified"}
- Target Market: ${request.targetMarket || "Not specified"}
- Land Type: ${request.landType || "Not specified"}
- Land Area: ${request.landArea || "Not specified"} acres

**Please provide a detailed analysis covering the following aspects, structured as a JSON object:**

{
  "executiveSummary": "Brief overview of the startup, key strengths, and overall assessment (2-3 paragraphs)",
  "marketAnalysis": {
    "marketSize": "Market size and growth potential",
    "competition": "Competitive landscape",
    "opportunities": ["Key opportunities (list)"],
    "threats": ["Potential threats (list)"]
  },
  "businessModelAnalysis": {
    "revenueStreams": ["Revenue streams (list)"],
    "costStructure": "Cost structure",
    "valueProposition": "Value proposition",
    "scalability": "Scalability assessment"
  },
  "teamAnalysis": {
    "teamSize": "Team size assessment",
    "skillGaps": ["Identified skill gaps (list)"],
    "recommendations": ["Team building recommendations (list)"]
  },
  "locationAnalysis": {
    "geographicalAdvantages": ["Geographical advantages (list)"],
    "marketAccess": "Market access",
    "infrastructure": "Infrastructure assessment",
    "regulatoryEnvironment": "Regulatory environment"
  },
  "financialProjections": {
    "revenueProjection": "Revenue projections",
    "costProjection": "Cost projections",
    "breakEvenAnalysis": "Break-even analysis",
    "fundingRequirements": "Funding requirements"
  },
  "riskAssessment": {
    "technicalRisks": ["Technical risks (list)"],
    "marketRisks": ["Market risks (list)"],
    "operationalRisks": ["Operational risks (list)"],
    "mitigationStrategies": ["Mitigation strategies (list)"]
  },
  "recommendations": {
    "immediate": ["Immediate actions (next 3 months) (list)"],
    "shortTerm": ["Short-term goals (6-12 months) (list)"],
    "longTerm": ["Long-term strategy (1-3 years) (list)"]
  },
  "giAnalysis": {
    "identifiedProducts": ["Identified GI products in the region (list)"],
    "marketPotential": "Market potential for GI products (number)",
    "uniquenessScore": "Uniqueness score (number)",
    "certificationStatus": "Certification recommendations"
  }
}

Please ensure the response is a valid JSON object.
    `.trim();
  }

  private parseAnalysisResponse(
    events: ADKEvent[],
    request: StartupAnalysisRequest
  ): StartupAnalysisReport {
    // Extract the main content from the ADK response
    const mainEvent = events.find(
      (event) =>
        event.content &&
        event.content.parts &&
        event.content.parts.length > 0 &&
        event.content.parts[0].text
    );

    if (!mainEvent) {
      throw new Error("No valid analysis content received from ADK");
    }

    const analysisText = mainEvent.content.parts[0].text;

    try {
      const analysisJson = JSON.parse(analysisText);
      return this.mapToStartupAnalysisReport(analysisJson, request);
    } catch (error) {
      console.error("Error parsing JSON from ADK:", error);
      console.error("Raw ADK Response:", analysisText); // Log the raw response
      throw new Error("Failed to parse JSON response from ADK");
    }
  }

  private extractListItems(text: string): string[] {
    if (!text) return [];

    // Extract bullet points, numbered lists, or dash-separated items
    const items = text
      .split(/\n|;|,/)
      .map((item) => item.replace(/^[\s\-\*\d+\.\)]+/, "").trim())
      .filter((item) => item.length > 0);

    return items.slice(0, 10); // Limit to 10 items
  }
  private mapToStartupAnalysisReport(
    analysisJson: any,
    request: StartupAnalysisRequest
  ): StartupAnalysisReport {
    const report: StartupAnalysisReport = {
      executiveSummary:
        analysisJson.executiveSummary || "Analysis in progress...",
      marketAnalysis: {
        marketSize:
          analysisJson.marketAnalysis?.marketSize ||
          "Market analysis pending...",
        competition:
          analysisJson.marketAnalysis?.competition ||
          "Competitive analysis pending...",
        opportunities: analysisJson.marketAnalysis?.opportunities || [],
        threats: analysisJson.marketAnalysis?.threats || [],
      },
      businessModelAnalysis: {
        revenueStreams:
          analysisJson.businessModelAnalysis?.revenueStreams || [],
        costStructure:
          analysisJson.businessModelAnalysis?.costStructure ||
          "Cost analysis pending...",
        valueProposition:
          analysisJson.businessModelAnalysis?.valueProposition ||
          "Value proposition analysis pending...",
        scalability:
          analysisJson.businessModelAnalysis?.scalability ||
          "Scalability assessment pending...",
      },
      teamAnalysis: {
        teamSize:
          analysisJson.teamAnalysis?.teamSize ||
          `Current team size: ${request.employeeCount} employees`,
        skillGaps: analysisJson.teamAnalysis?.skillGaps || [],
        recommendations: analysisJson.teamAnalysis?.recommendations || [],
      },
      locationAnalysis: {
        geographicalAdvantages:
          analysisJson.locationAnalysis?.geographicalAdvantages || [],
        marketAccess:
          analysisJson.locationAnalysis?.marketAccess ||
          "Market access analysis pending...",
        infrastructure:
          analysisJson.locationAnalysis?.infrastructure ||
          "Infrastructure assessment pending...",
        regulatoryEnvironment:
          analysisJson.locationAnalysis?.regulatoryEnvironment ||
          "Regulatory analysis pending...",
      },
      financialProjections: {
        revenueProjection:
          analysisJson.financialProjections?.revenueProjection ||
          "Revenue projections pending...",
        costProjection:
          analysisJson.financialProjections?.costProjection ||
          "Cost projections pending...",
        breakEvenAnalysis:
          analysisJson.financialProjections?.breakEvenAnalysis ||
          "Break-even analysis pending...",
        fundingRequirements:
          analysisJson.financialProjections?.fundingRequirements ||
          "Funding analysis pending...",
      },
      riskAssessment: {
        technicalRisks: analysisJson.riskAssessment?.technicalRisks || [],
        marketRisks: analysisJson.riskAssessment?.marketRisks || [],
        operationalRisks: analysisJson.riskAssessment?.operationalRisks || [],
        mitigationStrategies:
          analysisJson.riskAssessment?.mitigationStrategies || [],
      },
      recommendations: {
        immediate: analysisJson.recommendations?.immediate || [],
        shortTerm: analysisJson.recommendations?.shortTerm || [],
        longTerm: analysisJson.recommendations?.longTerm || [],
      },
      giAnalysis: request.landType
        ? {
            identifiedProducts:
              analysisJson.giAnalysis?.identifiedProducts || [],
            marketPotential: analysisJson.giAnalysis?.marketPotential || 75,
            uniquenessScore: analysisJson.giAnalysis?.uniquenessScore || 70,
            certificationStatus:
              analysisJson.giAnalysis?.certificationStatus || "pending",
          }
        : undefined,
    };

    return report;
  }
  private extractNumber(text: string): number | null {
    if (!text) return null;

    const match = text.match(/\d+/);
    return match ? parseInt(match[0]) : null;
  }
}

export default new ADKService();
