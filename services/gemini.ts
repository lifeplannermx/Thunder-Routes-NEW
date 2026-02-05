import { GoogleGenAI } from "@google/genai";
import { LocationData } from "../types";

const parseLocationResponse = (responseText: string, originalInputs: string[]): LocationData[] => {
  // This is a fallback parser if we don't strictly rely on grounding chunks structure
  // Ideally we want to map the original inputs to the found places.
  // For simplicity in this demo, we will rely on the fact that we ask Gemini to return a JSON string in the text.
  
  try {
    const jsonMatch = responseText.match(/```json\n([\s\S]*?)\n```/) || responseText.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      const jsonStr = jsonMatch[1] || jsonMatch[0];
      const parsed = JSON.parse(jsonStr);
      
      if (Array.isArray(parsed)) {
        return parsed.map((item: any, index: number) => ({
          id: `loc-${Date.now()}-${index}`,
          originalInput: item.originalInput || originalInputs[index] || "Unknown",
          name: item.name,
          address: item.address,
          lat: item.latitude,
          lng: item.longitude,
          googleMapsUri: item.googleMapsUri
        }));
      }
    }
  } catch (e) {
    console.error("Failed to parse Gemini JSON response", e);
  }
  return [];
};

export const resolveLocationsWithGemini = async (inputs: string[]): Promise<LocationData[]> => {
  if (!process.env.API_KEY) {
    throw new Error("API Key is missing");
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  // We process inputs in batches if necessary, but here we do all at once for context.
  // We ask Gemini to find these places.
  const prompt = `
    I have a list of location descriptions. For each one, use Google Maps to find the official name, address, and coordinates (latitude, longitude).
    
    Locations:
    ${inputs.map((input, i) => `${i + 1}. ${input}`).join('\n')}
    
    Return a JSON array where each object has these fields:
    - originalInput: the string I provided
    - name: the official name of the place found
    - address: the full address
    - latitude: number
    - longitude: number
    - googleMapsUri: URL to the place on Google Maps (if available)

    IMPORTANT: strictly return ONLY valid JSON inside a code block.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        tools: [{ googleMaps: {} }],
      }
    });

    // Strategy: Prefer the structured JSON we asked for, but use grounding chunks to verify or enhance if needed.
    // In many cases, the model will synthesize the grounding data into the JSON response we requested.
    
    const text = response.text || "";
    const resolvedLocations = parseLocationResponse(text, inputs);

    // If the model returned fewer items than inputs, we might need to handle errors, but for now we return what we found.
    return resolvedLocations;

  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};
