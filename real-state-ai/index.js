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

    const userMessage = message.trim();

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
    // APPWRITE CREDENTIALS
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
          error: "Appwrite function credentials are missing",
        },
        500
      );
    }

    // ==========================================
    // APPWRITE CLIENT
    // ==========================================

    const client = new Client();

    client
      .setEndpoint("https://fra.cloud.appwrite.io/v1")
      .setProject(projectId)
      .setKey(appwriteApiKey);

    const tablesDB = new TablesDB(client);

    // ==========================================
    // DATABASE
    // ==========================================

    const databaseId =
      "6a5cb612000c39b9d496D";

    const propertiesTableId =
      "properties";

    // ==========================================
    // GET ALL PROPERTIES
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
      `Total properties fetched: ${properties.length}`
    );

    // ==========================================
    // NORMALIZE TEXT
    // ==========================================

    const normalize = (value) => {
      return String(value || "")
        .toLowerCase()
        .trim();
    };

    const normalizedMessage =
      normalize(userMessage);

    // ==========================================
    // DETECT BEDROOM COUNT
    // ==========================================

    let requestedBedrooms = null;

    const bedroomPatterns = [
      /(\d+)\s*bedrooms?/i,
      /(\d+)\s*bed\s*rooms?/i,
      /(\d+)\s*bed/i,
      /(\d+)\s*bedroom/i,
      /(\d+)\s*বেডরুম/i,
      /(\d+)\s*বেড\s*রুম/i,
    ];

    for (const pattern of bedroomPatterns) {
      const match =
        normalizedMessage.match(pattern);

      if (match) {
        requestedBedrooms =
          Number(match[1]);

        break;
      }
    }

    // ==========================================
    // DETECT PROPERTY TYPE
    // ==========================================

    let requestedType = null;

    if (
      normalizedMessage.includes("apartment") ||
      normalizedMessage.includes("flat") ||
      normalizedMessage.includes("ফ্ল্যাট") ||
      normalizedMessage.includes("অ্যাপার্টমেন্ট")
    ) {
      requestedType = "apartment";
    } else if (
      normalizedMessage.includes("condo") ||
      normalizedMessage.includes("কনডো")
    ) {
      requestedType = "condo";
    } else if (
      normalizedMessage.includes("house") ||
      normalizedMessage.includes("বাড়ি") ||
      normalizedMessage.includes("বাড়ি")
    ) {
      requestedType = "house";
    } else if (
      normalizedMessage.includes("villa") ||
      normalizedMessage.includes("ভিলা")
    ) {
      requestedType = "villa";
    } else if (
      normalizedMessage.includes("townhouse")
    ) {
      requestedType = "townhouse";
    }

    // ==========================================
    // DETECT LOCATION
    // ==========================================

    const knownLocations = [
      "shewrapara",
      "শেওড়াপাড়া",
      "শেওড়াপাড়া",
      "mirpur",
      "মিরপুর",
      "kazipara",
      "kazi para",
      "কাজীপাড়া",
      "কাজীপাড়া",
      "gulshan",
      "গুলশান",
      "banani",
      "বনানী",
      "dhanmondi",
      "ধানমন্ডি",
      "uttara",
      "উত্তরা",
      "mohammadpur",
      "মোহাম্মদপুর",
      "bashundhara",
      "বসুন্ধরা",
      "badda",
      "বাড্ডা",
      "farmgate",
      "ফার্মগেট",
      "motijheel",
      "মতিঝিল",
      "paltan",
      "পল্টন",
      "tejgaon",
      "তেজগাঁও",
      "khilgaon",
      "খিলগাঁও",
      "ramna",
      "রমনা",
    ];

    let requestedLocation = null;

    for (const location of knownLocations) {
      if (
        normalizedMessage.includes(
          normalize(location)
        )
      ) {
        requestedLocation = location;
        break;
      }
    }

    // ==========================================
    // LOG DETECTED FILTERS
    // ==========================================

    log(
      `Detected filters -> location: ${
        requestedLocation || "none"
      }, bedrooms: ${
        requestedBedrooms ?? "none"
      }, type: ${
        requestedType || "none"
      }`
    );

    // ==========================================
    // FILTER PROPERTIES
    // ==========================================

    const filteredProperties =
      properties.filter((property) => {
        // ----------------------------------------
        // BEDROOM FILTER
        // ----------------------------------------

        if (
          requestedBedrooms !== null &&
          Number(property.bedrooms) !==
            requestedBedrooms
        ) {
          return false;
        }

        // ----------------------------------------
        // PROPERTY TYPE FILTER
        // ----------------------------------------

        if (requestedType) {
          const propertyType =
            normalize(property.type);

          if (
            propertyType !== requestedType
          ) {
            return false;
          }
        }

        // ----------------------------------------
        // LOCATION FILTER
        // ----------------------------------------

        if (requestedLocation) {
          const searchableText = normalize(
            [
              property.address,
              property.description,
              property.geolocation,
              property.name,
            ].join(" ")
          );

          const location =
            normalize(requestedLocation);

          if (
            !searchableText.includes(location)
          ) {
            return false;
          }
        }

        return true;
      });

    // ==========================================
    // LOG FILTER RESULT
    // ==========================================

    log(
      `Matching properties: ${filteredProperties.length}`
    );

    // ==========================================
    // NO MATCHING PROPERTY
    // ==========================================

    if (filteredProperties.length === 0) {
      const isBangla =
        /[\u0980-\u09FF]/.test(userMessage);

      let noMatchReply;

      if (isBangla) {
        noMatchReply =
          "দুঃখিত, আপনার দেওয়া শর্ত অনুযায়ী আমাদের ডাটাবেসে কোনো matching property পাওয়া যায়নি। আপনি চাইলে অন্য এলাকা, bedroom সংখ্যা বা property type দিয়ে আবার খুঁজতে পারেন।";
      } else {
        noMatchReply =
          "Sorry, I couldn't find any property in our database matching your requirements. You can try another location, bedroom count, or property type.";
      }

      return res.json({
        success: true,
        reply: noMatchReply,
        properties: [],
        filters: {
          location: requestedLocation,
          bedrooms: requestedBedrooms,
          type: requestedType,
        },
      });
    }

    // ==========================================
    // PREPARE ONLY MATCHING PROPERTIES
    // ==========================================

    const propertyData =
      filteredProperties.map(
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

    // ==========================================
    // STRICT SYSTEM INSTRUCTION
    // ==========================================

    const systemInstruction = `
You are Real State AI, the official AI assistant
for a real estate application.

The backend has already filtered the database
according to the user's request.

IMPORTANT RULES:

1. ONLY use the property data provided below.

2. NEVER invent a property.

3. NEVER invent a price, address, area,
   bedroom count, bathroom count, rating,
   facility, or location.

4. Do NOT mention properties that are not
   included in the provided data.

5. If matching properties are provided,
   answer using ONLY those properties.

6. If multiple properties are provided,
   list the useful matching properties clearly.

7. Answer in the SAME LANGUAGE as the user.

8. Prices are in Bangladeshi Taka (BDT).

9. Do not use Markdown symbols such as **,
   ##, or unnecessary formatting.

10. Keep the answer natural and concise.

11. If the user asks a follow-up question about
    one of the provided properties, use the
    provided property data.

12. Do not claim that a property is in a location
    unless that location is explicitly present
    in the provided property data.

FILTERS DETECTED BY BACKEND:

Location:
${requestedLocation || "Not specified"}

Bedrooms:
${requestedBedrooms ?? "Not specified"}

Property type:
${requestedType || "Not specified"}

MATCHING PROPERTY DATA:

${JSON.stringify(
  propertyData,
  null,
  2
)}
`;

    // ==========================================
    // GENERATE RESPONSE
    // ==========================================

    const response =
      await ai.models.generateContent({
        model: "gemini-3.6-flash",
        contents: userMessage,
        config: {
          systemInstruction,
          maxOutputTokens: 700,
        },
      });

    const reply =
      response.text ||
      "Sorry, I could not generate a response.";

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
      reply,
      properties: propertyData,
      filters: {
        location: requestedLocation,
        bedrooms: requestedBedrooms,
        type: requestedType,
      },
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
