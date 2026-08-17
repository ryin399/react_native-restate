import { GoogleGenAI } from "@google/genai";
import { Client, TablesDB, Query } from "node-appwrite";

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
    const message =
      typeof body.message === "string"
        ? body.message.trim()
        : "";

    if (!message) {
      return res.json(
        {
          success: false,
          error: "Message is required",
        },
        400
      );
    }

    log(`User message: ${message}`);

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
          error:
            "Appwrite function credentials are missing",
        },
        500
      );
    }

    log("Appwrite credentials detected");

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
    // DATABASE CONFIG
    // ==========================================

    // IMPORTANT:
    // Exact database ID.
    // DO NOT add D at the end.

    const databaseId =
      "6a5cb612000c39b9d496";

    const propertiesTableId =
      "properties";

    // ==========================================
    // FETCH PROPERTIES
    // ==========================================

    const propertyResult =
      await tablesDB.listRows({
        databaseId,
        tableId: propertiesTableId,
        queries: [
          Query.limit(100),
        ],
        total: false,
      });

    const properties =
      propertyResult.rows || [];

    log(
      `Total properties fetched: ${properties.length}`
    );

    // ==========================================
    // CLEAN PROPERTY DATA
    // ==========================================

    const propertyData = properties.map(
      (property) => ({
        id: property.$id,
        name: property.name ?? "",
        type: property.type ?? "",
        description:
          property.description ?? "",
        address: property.address ?? "",
        price: property.price ?? 0,
        area: property.area ?? 0,
        bedrooms:
          property.bedrooms ?? 0,
        bathrooms:
          property.bathrooms ?? 0,
        rating:
          property.rating ?? 0,
        facilities:
          property.facilities ?? [],
        geolocation:
          property.geolocation ?? "",
        image:
          property.image ?? "",
      })
    );

    // ==========================================
    // NORMALIZE TEXT
    // ==========================================

    const normalize = (text) =>
      String(text || "")
        .toLowerCase()
        .replace(/[.,!?;:()[\]{}]/g, " ")
        .replace(/\s+/g, " ")
        .trim();

    const normalizedMessage =
      normalize(message);

    // ==========================================
    // DETECT "ALL PROPERTIES" REQUEST
    // ==========================================

    const wantsAllProperties =
      normalizedMessage.includes("all property") ||
      normalizedMessage.includes("all properties") ||
      normalizedMessage.includes("sob property") ||
      normalizedMessage.includes("sobgulo property") ||
      normalizedMessage.includes("sob gula property") ||
      normalizedMessage.includes("সব property") ||
      normalizedMessage.includes("সবগুলো property") ||
      normalizedMessage.includes("সব property") ||
      normalizedMessage.includes("সবগুলো প্রপার্টি") ||
      normalizedMessage.includes("সব প্রপার্টি") ||
      normalizedMessage.includes("list all") ||
      normalizedMessage.includes("full list") ||
      normalizedMessage.includes("পুরো লিস্ট") ||
      normalizedMessage.includes("পুরো তালিকা");

    // ==========================================
    // DIRECT ALL PROPERTY LIST
    // ==========================================

    if (wantsAllProperties) {
      log("Detected request for all properties");

      if (propertyData.length === 0) {
        return res.json({
          success: true,
          reply:
            "দুঃখিত, বর্তমানে database-এ কোনো property পাওয়া যায়নি।",
        });
      }

      const list = propertyData
        .map(
          (property, index) =>
            `${index + 1}. ${property.name}
Type: ${property.type}
Address: ${property.address}
Price: ${property.price} BDT
Area: ${property.area} sq. ft.
Bedrooms: ${property.bedrooms}
Bathrooms: ${property.bathrooms}
Rating: ${property.rating}/5`
        )
        .join("\n\n");

      return res.json({
        success: true,
        reply:
          `বর্তমানে আমাদের database-এ ${propertyData.length}টি property আছে:\n\n${list}`,
      });
    }

    // ==========================================
    // DETECT PROPERTY NUMBER / NAME
    // ==========================================

    let selectedProperty = null;

    // Property 4
    const propertyNumberMatch =
      normalizedMessage.match(
        /property\s*(\d+)/
      );

    if (propertyNumberMatch) {
      const number =
        Number(propertyNumberMatch[1]);

      selectedProperty =
        propertyData.find(
          (property) =>
            normalize(property.name) ===
            `property ${number}`
        ) || null;
    }

    // ==========================================
    // DIRECT PROPERTY DETAILS
    // ==========================================

    if (selectedProperty) {
      log(
        `Direct property match: ${selectedProperty.name}`
      );

      const facilities =
        Array.isArray(
          selectedProperty.facilities
        )
          ? selectedProperty.facilities.join(
              ", "
            )
          : selectedProperty.facilities || "N/A";

      return res.json({
        success: true,
        reply:
          `Here are the details for ${selectedProperty.name}:\n\n` +
          `Name: ${selectedProperty.name}\n` +
          `Type: ${selectedProperty.type}\n` +
          `Address: ${selectedProperty.address}\n` +
          `Price: ${selectedProperty.price} BDT\n` +
          `Area: ${selectedProperty.area} sq. ft.\n` +
          `Bedrooms: ${selectedProperty.bedrooms}\n` +
          `Bathrooms: ${selectedProperty.bathrooms}\n` +
          `Rating: ${selectedProperty.rating}/5\n` +
          `Facilities: ${facilities}`,
      });
    }

    // ==========================================
    // DETECT BEDROOM FILTER
    // ==========================================

    let bedroomFilter = null;

    const bedroomMatch =
      normalizedMessage.match(
        /(\d+)\s*(bedroom|bedrooms|bed|বেডরুম|বেড)/
      );

    if (bedroomMatch) {
      bedroomFilter =
        Number(bedroomMatch[1]);
    }

    // ==========================================
    // DETECT BATHROOM FILTER
    // ==========================================

    let bathroomFilter = null;

    const bathroomMatch =
      normalizedMessage.match(
        /(\d+)\s*(bathroom|bathrooms|bath|বাথরুম|বাথ)/
      );

    if (bathroomMatch) {
      bathroomFilter =
        Number(bathroomMatch[1]);
    }

    // ==========================================
    // DETECT PROPERTY TYPE
    // ==========================================

    let typeFilter = null;

    if (
      normalizedMessage.includes(
        "apartment"
      ) ||
      normalizedMessage.includes(
        "অ্যাপার্টমেন্ট"
      )
    ) {
      typeFilter = "Apartment";
    } else if (
      normalizedMessage.includes(
        "villa"
      ) ||
      normalizedMessage.includes(
        "ভিলা"
      )
    ) {
      typeFilter = "Villa";
    } else if (
      normalizedMessage.includes(
        "condo"
      ) ||
      normalizedMessage.includes(
        "কন্ডো"
      )
    ) {
      typeFilter = "Condo";
    } else if (
      normalizedMessage.includes(
        "house"
      ) ||
      normalizedMessage.includes(
        "হাউস"
      )
    ) {
      typeFilter = "House";
    } else if (
      normalizedMessage.includes(
        "townhouse"
      )
    ) {
      typeFilter = "Townhouse";
    }

    // ==========================================
    // DETECT LOCATION
    // ==========================================

    const knownLocations = [
      "shewrapara",
      "mirpur",
      "gulshan",
      "banani",
      "dhanmondi",
      "uttara",
      "mohammadpur",
      "kazipara",
      "farmgate",
      "badda",
    ];

    let locationFilter = null;

    for (const location of knownLocations) {
      if (
        normalizedMessage.includes(location)
      ) {
        locationFilter = location;
        break;
      }
    }

    // ==========================================
    // FILTER PROPERTIES
    // ==========================================

    let matchingProperties =
      propertyData;

    if (bedroomFilter !== null) {
      matchingProperties =
        matchingProperties.filter(
          (property) =>
            Number(property.bedrooms) ===
            bedroomFilter
        );
    }

    if (bathroomFilter !== null) {
      matchingProperties =
        matchingProperties.filter(
          (property) =>
            Number(property.bathrooms) ===
            bathroomFilter
        );
    }

    if (typeFilter !== null) {
      matchingProperties =
        matchingProperties.filter(
          (property) =>
            normalize(property.type) ===
            normalize(typeFilter)
        );
    }

    if (locationFilter !== null) {
      matchingProperties =
        matchingProperties.filter(
          (property) => {
            const address =
              normalize(
                property.address
              );

            const description =
              normalize(
                property.description
              );

            const geo =
              normalize(
                property.geolocation
              );

            return (
              address.includes(
                locationFilter
              ) ||
              description.includes(
                locationFilter
              ) ||
              geo.includes(
                locationFilter
              )
            );
          }
        );
    }

    // ==========================================
    // LOG FILTERS
    // ==========================================

    log(
      `Detected filters -> location: ${
        locationFilter || "none"
      }, bedrooms: ${
        bedroomFilter ?? "none"
      }, bathrooms: ${
        bathroomFilter ?? "none"
      }, type: ${
        typeFilter || "none"
      }`
    );

    log(
      `Matching properties: ${matchingProperties.length}`
    );

    // ==========================================
    // NO MATCH
    // ==========================================

    const hasFilter =
      bedroomFilter !== null ||
      bathroomFilter !== null ||
      typeFilter !== null ||
      locationFilter !== null;

    if (
      hasFilter &&
      matchingProperties.length === 0
    ) {
      return res.json({
        success: true,
        reply:
          "দুঃখিত, বর্তমানে আমাদের database-এ আপনার চাহিদার সাথে মিলে এমন কোনো property পাওয়া যায়নি। আপনি অন্য location, bedroom সংখ্যা বা property type দিয়ে চেষ্টা করতে পারেন।",
      });
    }

    // ==========================================
    // DATA FOR GEMINI
    // ==========================================

    const dataForGemini =
      matchingProperties.map(
        (property) => ({
          id: property.id,
          name: property.name,
          type: property.type,
          description:
            property.description,
          address: property.address,
          price: property.price,
          area: property.area,
          bedrooms:
            property.bedrooms,
          bathrooms:
            property.bathrooms,
          rating:
            property.rating,
          facilities:
            property.facilities,
          geolocation:
            property.geolocation,
        })
      );

    // ==========================================
    // GEMINI
    // ==========================================

    const ai =
      new GoogleGenAI({
        apiKey: geminiApiKey,
      });

    const systemInstruction = `
You are Real State AI, the official AI assistant
for a real estate application.

STRICT RULES:

1. Use ONLY the property data provided below.

2. NEVER invent a property.

3. NEVER invent a price, address, area,
bedroom count, bathroom count, rating,
facility, or location.

4. If the provided property data contains
no matching property, say that no matching
property was found.

5. Do NOT create fake "Property 1",
"Property 2", etc.

6. Use the exact property name from the data.

7. If the user asks for property details,
use only the provided database information.

8. If the user asks for a list, include
all relevant properties from the provided data.

9. Do not say that you searched the internet.

10. Prices are in Bangladeshi Taka (BDT).

11. Answer in the same language/style as
the user's message.

12. Keep the answer concise and useful.

PROPERTY DATA:

${JSON.stringify(
  dataForGemini,
  null,
  2
)}
`;

    const response =
      await ai.models.generateContent({
        model: "gemini-3.6-flash",
        contents: message,
        config: {
          systemInstruction,
          maxOutputTokens: 2000,
        },
      });

    const reply =
      response.text?.trim();

    log(
      `Gemini response received: ${
        reply ? "yes" : "empty"
      }`
    );

    // ==========================================
    // FINAL RESPONSE
    // ==========================================

    return res.json({
      success: true,
      reply:
        reply ||
        "দুঃখিত, আমি এই মুহূর্তে উত্তর তৈরি করতে পারছি না।",
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
