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

    const geminiApiKey = process.env.GEMINI_API_KEY;

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

    // Appwrite automatically provides the dynamic
    // API key in the x-appwrite-key header
    const appwriteApiKey =
      req.headers["x-appwrite-key"];

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

    const client = new Client()
      .setEndpoint(
        "https://fra.cloud.appwrite.io/v1"
      )
      .setProject(projectId)
      .setKey(appwriteApiKey);

    const tablesDB = new TablesDB(client);

    // ==========================================
    // DATABASE / TABLE
    // ==========================================

    const databaseId =
      "6a5cb612000c39b9d496";

    const propertiesTableId =
      "properties";

    // ==========================================
    // GET PROPERTY DATA
    // ==========================================

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
    // PREPARE PROPERTY DATA
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
    // GEMINI AI
    // ==========================================

    const ai = new GoogleGenAI({
      apiKey: geminiApiKey,
    });

    // ==========================================
    // SYSTEM INSTRUCTION
    // ==========================================

    const systemInstruction = `
You are Real State AI, the official AI assistant
for a real estate application.

IMPORTANT RULES:

1. You MUST use only the property data provided
   below when answering property-related questions.

2. NEVER invent a property, price, address, area,
   bedroom count, bathroom count, rating,
   or facility.

3. If the requested property does not exist
   in the database data, clearly say that no
   matching property was found.

4. Do not pretend that a property exists when
   it is not present in the database.

5. If the user asks about properties, use the
   database data below.

6. If the user asks a general question that is
   not about properties, answer normally.

7. Answer in the same language as the user.

8. Prices are in Bangladeshi Taka (BDT).

9. If the user asks for a specific location,
   search the provided address/location data
   carefully before answering.

10. If there are no matching properties,
    clearly say that there are currently no
    matching properties in the database.

CURRENT PROPERTY DATABASE:

${JSON.stringify(propertyData, null, 2)}
`;

    // ==========================================
    // GENERATE AI RESPONSE
    // ==========================================

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

    // ==========================================
    // RETURN RESPONSE
    // ==========================================

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
