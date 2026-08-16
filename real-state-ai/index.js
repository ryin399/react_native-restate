import { GoogleGenAI } from "@google/genai";
import { Client, TablesDB } from "node-appwrite";

export default async ({ req, res, log, error }) => {
  try {
    // ==========================================
    // ONLY POST REQUEST
    // ==========================================

    if (req.method !== "POST") {
      return res.json(
        {
          success: false,
          error: "Method not allowed",
        },
        405
      );
    }

    // ==========================================
    // USER MESSAGE
    // ==========================================

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

    // ==========================================
    // GEMINI API KEY
    // ==========================================

    const geminiApiKey =
      process.env.GEMINI_API_KEY;

    if (!geminiApiKey) {
      error("GEMINI_API_KEY is missing");

      return res.json(
        {
          success: false,
          error: "Gemini API key is not configured",
        },
        500
      );
    }

    // ==========================================
    // APPWRITE CONFIG
    // ==========================================

    const projectId =
      process.env.APPWRITE_FUNCTION_PROJECT_ID;

    const appwriteApiKey =
      process.env.APPWRITE_FUNCTION_API_KEY;

    if (!projectId || !appwriteApiKey) {
      error("Appwrite function credentials are missing");

      return res.json(
        {
          success: false,
          error:
            "Appwrite function credentials are missing",
        },
        500
      );
    }

    // ==========================================
    // APPWRITE CLIENT
    // ==========================================

    const client = new Client();

    client
      .setEndpoint(
        "https://fra.cloud.appwrite.io/v1"
      )
      .setProject(projectId)
      .setKey(appwriteApiKey);

    const tablesDB = new TablesDB(client);

    // ==========================================
    // GET PROPERTY DATA
    // ==========================================

    const databaseId =
      "6a5cb612000c39b9d496";

    const propertiesTableId =
      "properties";

    const propertyResult =
      await tablesDB.listRows({
        databaseId,
        tableId: propertiesTableId,
        queries: [],
        total: false,
      });

    const properties =
      propertyResult.rows || [];

    log(
      `Properties fetched: ${properties.length}`
    );

    // ==========================================
    // PREPARE PROPERTY DATA FOR GEMINI
    // ==========================================

    const propertyData = properties.map(
      (property) => ({
        id: property.$id,
        name: property.name,
        type: property.type,
        description: property.description,
        address: property.address,
        price: property.price,
        area: property.area,
        bedrooms: property.bedrooms,
        bathrooms: property.bathrooms,
        rating: property.rating,
        facilities: property.facilities,
        geolocation: property.geolocation,
        image: property.image,
      })
    );

    // ==========================================
    // GEMINI
    // ==========================================

    const ai = new GoogleGenAI({
      apiKey: geminiApiKey,
    });

    const systemInstruction = `
You are Real State AI, the official AI assistant
for a real estate application.

IMPORTANT RULES:

1. You MUST use only the property data provided
   below.

2. NEVER invent a property, price, address,
   area, bedroom count, bathroom count,
   rating, or facility.

3. If the requested property does not exist
   in the provided database data, clearly say
   that no matching property was found.

4. Do not pretend that a property exists when
   it is not present in the database.

5. If the user asks about properties, use the
   database data to answer.

6. If the user asks a general question that is
   not about properties, answer normally.

7. Answer in the same language as the user.

8. Prices are in Bangladeshi Taka (BDT).

CURRENT PROPERTY DATABASE:

${JSON.stringify(propertyData, null, 2)}
`;

    const response =
      await ai.models.generateContent({
        model: "gemini-3.6-flash",
        contents: message,
        config: {
          systemInstruction,
          maxOutputTokens: 700,
        },
      });

    const reply = response.text;

    log(
      `Gemini response received: ${
        reply ? "yes" : "empty"
      }`
    );

    return res.json({
      success: true,
      reply:
        reply ||
        "Sorry, I could not generate a response.",
    });
  } catch (err) {
    const errorMessage =
      err instanceof Error
        ? err.message
        : String(err);

    error(
      `Real State AI error: ${errorMessage}`
    );

    return res.json(
      {
        success: false,
        error: errorMessage,
      },
      500
    );
  }
};
