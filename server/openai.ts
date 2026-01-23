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
          content: `You are an expert market analyst AI specializing in hyperlocal business intelligence. Generate a highly accurate market analysis for a "${businessType}" at "${address}".
          
          Calculation Guidelines for TAM, SAM, SOM (5-mile radius):
          1. TAM (Total Addressable Market): Estimate total annual spending for this business category within the 5-mile radius based on population and national/regional average spend per capita.
          2. SAM (Serviceable Available Market): The portion of TAM that fits the specific sub-type and quality of this business, adjusted for local median income and regional demographics.
          3. SOM (Serviceable Obtainable Market): This must be a realistic first-year revenue target. Factor in:
             - Local competition density (how many similar businesses exist nearby?).
             - Physical accessibility and traffic patterns of "${address}".
             - A conservative market share (typically 1-5% in competitive areas, up to 15% in underserved areas).
             - Address-specific advantages/limitations.

          Return ONLY valid JSON matching this structure:
          {
            "marketSize": {
              "tam": { "value": number, "description": "string" },
              "sam": { "value": number, "description": "string" },
              "som": { "value": number, "description": "string" }
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
              "interests": ["string", "string"],
              "lifestyle": "string",
              "buyingBehavior": "string"
            },
            "weather": {
              "seasonalTrends": "string",
              "impactOnBusiness": "string"
            },
            "traffic": {
              "typicalTraffic": "string",
              "challenges": ["string", "string"],
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

export async function generateMissionStatement(input: string): Promise<string> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are a branding expert. Generate a concise, powerful mission statement based on the user's ideas. The mission statement should be professional, inspiring, and focus on the core value proposition. Return ONLY the mission statement text."
        },
        {
          role: "user",
          content: input
        }
      ]
    });

    const content = response.choices[0].message.content;
    if (!content) throw new Error("No content received from OpenAI");
    return content.trim();
  } catch (error) {
    console.error("Mission generation error:", error);
    throw new Error("Failed to generate mission statement");
  }
}
