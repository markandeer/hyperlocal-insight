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
          
          CRITICAL: Do not use any markdown formatting, bolding (asterisks), or special characters for emphasis in text descriptions. Keep all output text uniform.
          
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
          content: "You are a branding expert. Generate a concise, powerful mission statement based on the user's ideas. The mission statement should be professional, inspiring, and focus on the core value proposition. ABSOLUTELY NO MARKDOWN OR ASTERISKS. Do not use asterisks (**) for emphasis or titles. Return ONLY the plain text mission statement."
        },
        {
          role: "user",
          content: input
        }
      ]
    });

    const content = response.choices[0].message.content;
    if (!content) throw new Error("No content received from OpenAI");
    return content.trim().replace(/\*\*/g, '');
  } catch (error) {
    console.error("Mission generation error:", error);
    throw new Error("Failed to generate mission statement");
  }
}

export async function generateVisionStatement(input: string): Promise<string> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are a strategic brand consultant. Generate a compelling, forward-looking vision statement based on the user's input. The vision statement should be a single, powerful sentence that describes the long-term impact and future state the business aspires to achieve. Keep it inspiring, ambitious, and concise. ABSOLUTELY NO MARKDOWN OR ASTERISKS. Do not use asterisks (**) for emphasis. Do not explain anything, just provide the vision statement text."
        },
        {
          role: "user",
          content: `Create a vision statement for this concept: ${input}`
        }
      ]
    });

    const content = response.choices[0].message.content;
    if (!content) throw new Error("No content received from OpenAI");
    return content.trim().replace(/^"|"$/g, '');
  } catch (error) {
    console.error("Vision generation error:", error);
    throw new Error("Failed to generate vision statement");
  }
}

export async function generateValueProposition(input: string): Promise<string> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are a strategic marketing expert. Generate a clear, compelling value proposition based on the user's input. The value proposition should highlight the primary benefit, the target audience, and what makes the offering unique. Keep it punchy and persuasive. ABSOLUTELY NO MARKDOWN OR ASTERISKS. Do not use asterisks (**) for emphasis. Do not explain anything, just provide the value proposition statement text."
        },
        {
          role: "user",
          content: `Create a value proposition for this concept: ${input}`
        }
      ]
    });

    const content = response.choices[0].message.content;
    if (!content) throw new Error("No content received from OpenAI");
    return content.trim().replace(/^"|"$/g, '');
  } catch (error) {
    console.error("Value proposition generation error:", error);
    throw new Error("Failed to generate value proposition");
  }
}

export async function generateTargetMarket(input: string): Promise<string> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are a market research specialist. Generate a detailed target market profile based on the user's input. The profile should describe the ideal customer's demographics, psychographics, and key pain points. Keep it professional, data-driven, and concise. ABSOLUTELY NO MARKDOWN OR ASTERISKS. Do not use asterisks (**) for emphasis, bolding, or labels. Return ONLY the plain text content. If you need to separate sections, use simple line breaks."
        },
        {
          role: "user",
          content: `Create a target market profile for this concept: ${input}`
        }
      ]
    });

    const content = response.choices[0].message.content;
    if (!content) throw new Error("No content received from OpenAI");
    return content.trim().replace(/\*\*/g, '').replace(/^"|"$/g, '');
  } catch (error) {
    console.error("Target market generation error:", error);
    throw new Error("Failed to generate target market profile");
  }
}

export async function generateBackground(input: string): Promise<string> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are a professional business writer. Your task is to refine the user's business background. Perform spell check, grammar check, and make the text a touch more inspired and polished while maintaining the original meaning. ABSOLUTELY NO MARKDOWN OR ASTERISKS. Do not use asterisks (**) for emphasis. Do not explain anything, just provide the refined background text."
        },
        {
          role: "user",
          content: `Refine this business background: ${input}`
        }
      ]
    });

    const content = response.choices[0].message.content;
    if (!content) throw new Error("No content received from OpenAI");
    return content.trim().replace(/\*\*/g, '');
  } catch (error) {
    console.error("Background refinement error:", error);
    throw new Error("Failed to refine business background");
  }
}

export async function generateLiveInsights(address: string, businessType: string): Promise<any> {
  try {
    const currentDate = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    const currentTime = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', timeZoneName: 'short' });

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are a real-time market intelligence AI. Today is ${currentDate}, and the current time is ${currentTime}. 
          
          Provide the absolute most accurate current weather, traffic, and news insights for a "${businessType}" at the EXACT location: "${address}".
          
          CRITICAL INSTRUCTIONS:
          1. 2-Week Weather Forecast: Provide an accurate day-by-day weather forecast for the next 14 days for "${address}". Include date, expected high/low temp (Fahrenheit), and conditions. USE SEARCH/KNOWLEDGE TO FIND REAL CURRENT METEOROLOGICAL DATA FOR THIS SPECIFIC LOCATION. DO NOT hallucinate.
          2. Hyper-Local News: News must be within a 5-mile radius of "${address}". Categorize as "Local Events", "Business & Economy", or "Community Updates".
          3. Real-Time Traffic: Analyze traffic conditions on the specific roads surrounding "${address}" at this exact time (${currentTime}).
          4. NO MARKDOWN: Do not use any asterisks (**), bolding, or markdown formatting in any text fields. Keep all text uniform and plain.
          
          Return ONLY valid JSON with this exact structure (do not include any other keys):
          {
            "weather": {
              "forecast": [
                {
                  "date": "string",
                  "high": "string",
                  "low": "string",
                  "condition": "string"
                }
              ],
              "impact": "string"
            },
            "traffic": {
              "status": "Light | Moderate | Heavy",
              "delay": "string",
              "notablePatterns": "string"
            },
            "news": [
              {
                "title": "string",
                "source": "string",
                "summary": "string",
                "date": "string",
                "category": "Local Events | Business & Economy | Community Updates",
                "url": "string (MUST provide a valid HTTP/HTTPS URL to the source article)"
              }
            ]
          }`
        },
        {
          role: "user",
          content: `Search for current weather data and news within 5 miles of "${address}" and provide live insights for a "${businessType}".`
        }
      ],
      response_format: { type: "json_object" }
    });

    const content = response.choices[0].message.content;
    if (!content) throw new Error("No content received from OpenAI");
    return JSON.parse(content);
  } catch (error) {
    console.error("Live insights generation error:", error);
    throw new Error("Failed to generate live insights");
  }
}
