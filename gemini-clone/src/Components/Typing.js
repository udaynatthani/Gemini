import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: "AIzaSyDpcbhnB8o15_gaHO34tTnkUKscd6y_iD4" });

async function main() {
  const response = await ai.models.generateContentStream({
    model: "gemini-2.0-flash",
    contents: "Explain how AI works",
  });

  for await (const chunk of response) {
    console.log(chunk.text);
  }
}

await main();
