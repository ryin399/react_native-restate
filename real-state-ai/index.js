import { GoogleGenAI } from "@google/genai";

export default async ({ req, res, log, error }) => {
  try {
    if (req.method !== "POST") {
      return res.json(
        {
          success: false,
          error: "Method not allowed",
        },
        405
      );
    }

    const body = req.bodyJson || {};
    const message = body.message;

    if (!message || typeof message !== "string") {
      return res.json(
        {
          success: false,
          error: "Message is required",
        },
        400
      );
    }

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      error("GEMINI_API_KEY is missing");

      return res.json(
        {
          success: false,
          error: "Gemini API key is not configured",
        },
        500
      );
    }

    const ai = new GoogleGenAI({
      apiKey,
    });

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: message,
      config: {
        systemInstruction:
          "You are Real State AI, a helpful property assistant for the Real State application. Answer naturally and clearly. You can communicate in Bangla or English depending on the user's language.",
        maxOutputTokens: 500,
      },
    });

    return res.json({
      success: true,
      reply:
        response.text ||
        "Sorry, I could not generate a response.",
    });
  } catch (err) {
    error(
      `Gemini error: ${
        err instanceof Error
          ? err.message
          : String(err)
      }`
    );

    return res.json(
      {
        success: false,
        error: "Failed to get response from Gemini.",
      },
      500
    );
  }
};
