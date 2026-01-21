import OpenAI from "openai";
import { AnalysisData } from "@shared/schema";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024.
const openai = new OpenAI({ 
  apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY,
  baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL
});

export async function generateMarketAnalysis(address: string, businessType: string): Promise<AnalysisData> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are an expert market analyst AI. Generate a detailed hyperlocal market analysis for a business at a specific location.
          
          Return ONLY valid JSON matching this structure:
          {
            "marketSize": {
              "tam": { "value": number, "description": "string" }, // Total Addressable Market
              "sam": { "value": number, "description": "string" }, // Serviceable Available Market
              "som": { "value": number, "description": "string" }  // Serviceable Obtainable Market
            },
            "demographics": {
              "population": number,
              "medianIncome": number,
              "ageGroups": [
                { "range": "18-24", "percentage": number },
                { "range": "25-34", "percentage": number },
                { "range": "35-44", "percentage": number },
                { "range": "45-54", "percentage": number },
                { "range": "55+", "percentage": number }
              ],
              "description": "string"
            },
            "psychographics": {
              "interests": ["string", "string", ...],
              "lifestyle": "string",
              "buyingBehavior": "string"
            },
            "weather": {
              "seasonalTrends": "string",
              "impactOnBusiness": "string"
            },
            "traffic": {
              "typicalTraffic": "string",
              "challenges": ["string", "string", ...],
              "peakHours": "string"
            }
          }
          
          Analysis Context: 5-mile radius around the address.
          Ensure all numbers are realistic estimates based on general knowledge of the location type (urban/suburban/rural) if specific data is unavailable.
          `
        },
        {
          role: "user",
          content: `Analyze the market for a "${businessType}" at "${address}".`
        }
      ],
      response_format: { type: "json_object" }
    });

    const content = response.choices[0].message.content;
    if (!content) {
      throw new Error("No content received from OpenAI");
    }

    return JSON.parse(content) as AnalysisData;
  } catch (error) {
    console.error("OpenAI API Error:", error);
    throw new Error("Failed to generate market analysis");
  }
}
