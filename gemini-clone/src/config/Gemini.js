import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = "AIzaSyDpcbhnB8o15_gaHO34tTnkUKscd6y_iD4";
const genAI = new GoogleGenerativeAI(API_KEY);

const sendToGemini = async function* (prompt) {
  console.log("📩 Prompt received in Gemini.js:", prompt);

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    console.log("📡 Calling generateContent...");

    const result = await model.generateContent([prompt]);
    const response = await result.response;
    const text = await response.text();

    console.log("✅ Gemini response:", text);

    // Simulate streaming by yielding chunks
    const chunkSize = 20;
    for (let i = 0; i < text.length; i += chunkSize) {
      const chunk = text.slice(i, i + chunkSize);
      yield { text: chunk };
      await new Promise(resolve => setTimeout(resolve, 50)); // simulate delay
    }

  } catch (error) {
    console.error("❌ Gemini API Error:", error);
    throw error;
  }
};

export default sendToGemini;
