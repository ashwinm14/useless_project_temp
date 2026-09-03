"use server";

import { GoogleGenerativeAI } from "@google/generative-ai";

// Ensure the API key is set
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function analyzeBiscuitAction(originalDataUrl: string, currentDataUrl: string) {
  try {
    if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === "your_api_key_here") {
      throw new Error("Missing Gemini API Key. Please add it to your .env.local file.");
    }

    // Initialize the model
    const model = genAI.getGenerativeModel({
      model: "gemini-3.8-flash",
      generationConfig: {
        responseMimeType: "application/json",
      },
    });

    // Helper to convert base64 data URL to the format the API expects
    const urlToGenerativePart = (dataUrl: string) => {
      const parts = dataUrl.split(";base64,");
      return {
        inlineData: {
          data: parts[1],
          mimeType: parts[0].split(":")[1],
        },
      };
    };

    const originalImagePart = urlToGenerativePart(originalDataUrl);
    const currentImagePart = urlToGenerativePart(currentDataUrl);

    const prompt = `You are an expert, highly meticulous "Biscuit Analyst". 
I am giving you two images. The first image is a whole biscuit before being eaten. The second image is the same biscuit after someone took a bite out of it.

Your job is to look at both images and determine exactly what percentage of the biscuit remains in the second image. 

Rules:
1. Compare the size of the biscuit in the first image with the size in the second image.
2. Estimate the percentage remaining (0 to 100). If it looks entirely untouched, return 100. If it's mostly eaten, return a low number like 15.
3. Estimate how many bites are left assuming average bite sizes.
4. Write a funny, slightly condescending personality joke about their biting pattern based on the shape of the bite.

Respond ONLY with a valid JSON object strictly matching this schema, with no markdown formatting:
{
  "remainingPercentage": number,
  "estimatedBitesLeft": number,
  "personalityJoke": string
}`;

    const result = await model.generateContent([
      prompt,
      originalImagePart,
      currentImagePart,
    ]);
    
    const responseText = result.response.text();
    
    // Parse the JSON (the model is configured to return JSON)
    const jsonResponse = JSON.parse(responseText);

    return {
      success: true,
      data: {
        remainingPercentage: jsonResponse.remainingPercentage,
        estimatedBitesLeft: jsonResponse.estimatedBitesLeft,
        personalityJoke: jsonResponse.personalityJoke,
      },
    };
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    return {
      success: false,
      error: error.message || "An error occurred while analyzing the biscuit.",
    };
  }
}
