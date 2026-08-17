import {
  Client,
  Account,
  Databases,
  OAuthProvider,
  Avatars,
  Query,
  Storage,
  ID,
  Permission,
  Role,
} from "react-native-appwrite";

import * as Linking from "expo-linking";
import { openAuthSessionAsync } from "expo-web-browser";

// ==========================================
// CONFIG
// ==========================================

export const config = {
  platform: "com.ryin.realestate",

  endpoint:
    process.env.EXPO_PUBLIC_APPWRITE_ENDPOINT,

  projectId:
    process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID,

  databaseId:
    process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID,

  galleriesCollectionId:
    process.env
      .EXPO_PUBLIC_APPWRITE_GALLERIES_COLLECTION_ID,

  reviewsCollectionId:
    process.env
      .EXPO_PUBLIC_APPWRITE_REVIEWS_COLLECTION_ID,

  agentsCollectionId:
    process.env
      .EXPO_PUBLIC_APPWRITE_AGENTS_COLLECTION_ID,

  propertiesCollectionId:
    process.env
      .EXPO_PUBLIC_APPWRITE_PROPERTIES_COLLECTION_ID,

  bucketId:
    process.env.EXPO_PUBLIC_APPWRITE_BUCKET_ID,

  // ==========================================
  // FAVORITES
  // ==========================================

  favoritesCollectionId: "favorites",

  // ==========================================
  // BOOKINGS
  // ==========================================

  bookingsCollectionId: "bookings",
};

// ==========================================
// APPWRITE CLIENT
// ==========================================

export const client = new Client();

client
  .setEndpoint(config.endpoint!)
  .setProject(config.projectId!)
  .setPlatform(config.platform!);

export const avatar =
  new Avatars(client);

export const account =
  new Account(client);

export const databases =
  new Databases(client);

export const storage =
  new Storage(client);

// ==========================================
// GOOGLE LOGIN
// ==========================================

export async function login() {
  try {
    const redirectUri =
      Linking.createURL("/");

    const response =
      await account.createOAuth2Token(
        OAuthProvider.Google,
        redirectUri,
        redirectUri
      );

    if (!response) {
      throw new Error(
        "Create OAuth2 token failed"
      );
    }

    const browserResult =
      await openAuthSessionAsync(
        response.toString(),
        redirectUri
      );

    if (
      browserResult.type !==
      "success"
    ) {
      throw new Error(
        "Browser auth failed"
      );
    }

    const url = new URL(
      browserResult.url
    );

    const secret =
      url.searchParams.get(
        "secret"
      );

    const userId =
      url.searchParams.get(
        "userId"
      );

    if (!secret || !userId) {
      throw new Error(
        "Secret or User ID missing"
      );
    }

    await account.createSession(
      userId,
      secret
    );

    return true;
  } catch (error) {
    console.error(
      "Google Login Error:",
      error
    );

    return false;
  }
}

// ==========================================
// LOGOUT
// ==========================================

export async function logout() {
  try {
    return await account.deleteSession(
      "current"
    );
  } catch (error) {
    console.error(
      "Logout Error:",
      error
    );

    return false;
  }
}

// ==========================================
// CURRENT USER
// ==========================================

export async function getCurrentUser() {
  try {
    const result =
      await account.get();

    if (result.$id) {
      const userAvatar =
        avatar.getInitials(
          result.name
        );

      return {
        ...result,
        avatar:
          userAvatar.toString(),
      };
    }

    return null;
  } catch (error) {
    console.error(
      "Get Current User Error:",
      error
    );

    return null;
  }
}

// ==========================================
// LATEST PROPERTIES
// ==========================================

export async function getLatestProperties() {
  try {
    const result =
      await databases.listDocuments(
        config.databaseId!,
        config.propertiesCollectionId!,
        [
          Query.orderAsc(
            "$createdAt"
          ),
          Query.limit(5),
        ]
      );

    return result.documents;
  } catch (error) {
    console.error(
      "Get Latest Properties Error:",
      error
    );

    return [];
  }
}

// ==========================================
// GET PROPERTIES
// ==========================================

export async function getProperties({
  filter,
  query,
  limit,
}: {
  filter: string;
  query: string;
  limit?: number;
}) {
  try {
    const searchText =
      query?.trim() || "";

    const buildQuery = [
      Query.orderDesc(
        "$createdAt"
      ),
    ];

    // ==========================================
    // CATEGORY FILTER
    // ==========================================

    if (
      filter &&
      filter !== "All"
    ) {
      buildQuery.push(
        Query.equal(
          "type",
          filter
        )
      );
    }

    // ==========================================
    // SEARCH: PROPERTY
    // ==========================================

    if (
      searchText.toLowerCase() ===
      "property"
    ) {
      const result =
        await databases.listDocuments(
          config.databaseId!,
          config.propertiesCollectionId!,
          [
            Query.limit(100),
          ]
        );

      let filteredDocuments =
        result.documents.filter(
          (item) =>
            item.name
              ?.trim()
              .toLowerCase()
              .startsWith(
                "property "
              )
        );

      if (
        filter &&
        filter !== "All"
      ) {
        filteredDocuments =
          filteredDocuments.filter(
            (item) =>
              item.type
                ?.trim()
                .toLowerCase() ===
              filter
                .trim()
                .toLowerCase()
          );
      }

      return limit
        ? filteredDocuments.slice(
            0,
            limit
          )
        : filteredDocuments;
    }

    // ==========================================
    // PROPERTY NUMBER SEARCH
    // ==========================================

    const propertyNumberMatch =
      searchText.match(
        /^property\s+(\d+)$/i
      ) ||
      searchText.match(
        /^(\d+)$/
      );

    if (propertyNumberMatch) {
      const propertyNumber =
        propertyNumberMatch[1];

      const result =
        await databases.listDocuments(
          config.databaseId!,
          config.propertiesCollectionId!,
          [
            Query.limit(100),
          ]
        );

      const exactPropertyName =
        `Property ${propertyNumber}`.toLowerCase();

      let filteredDocuments =
        result.documents.filter(
          (item) =>
            item.name
              ?.trim()
              .toLowerCase() ===
            exactPropertyName
        );

      if (
        filter &&
        filter !== "All"
      ) {
        filteredDocuments =
          filteredDocuments.filter(
            (item) =>
              item.type
                ?.trim()
                .toLowerCase() ===
              filter
                .trim()
                .toLowerCase()
          );
      }

      return limit
        ? filteredDocuments.slice(
            0,
            limit
          )
        : filteredDocuments;
    }

    // ==========================================
    // NORMAL SEARCH
    // ==========================================

    if (searchText) {
      buildQuery.push(
        Query.or([
          Query.search(
            "name",
            searchText
          ),
          Query.search(
            "address",
            searchText
          ),
          Query.search(
            "type",
            searchText
          ),
        ])
      );
    }

    if (limit) {
      buildQuery.push(
        Query.limit(limit)
      );
    }

    const result =
      await databases.listDocuments(
        config.databaseId!,
        config.propertiesCollectionId!,
        buildQuery
      );

    return result.documents;
  } catch (error) {
    console.error(
      "getProperties error:",
      error
    );

    return [];
  }
}

// ==========================================
// GET PROPERTY BY ID
// ==========================================

export async function getPropertyById({
  id,
}: {
  id: string;
}) {
  try {
    return await databases.getDocument(
      config.databaseId!,
      config.propertiesCollectionId!,
      id
    );
  } catch (error) {
    console.error(
      "Get Property By ID Error:",
      error
    );

    return null;
  }
}

// ==========================================
// ADD FAVORITE
// ==========================================

export async function addFavorite({
  propertyId,
}: {
  propertyId: string;
}) {
  try {
    const user =
      await account.get();

    const existingFavorites =
      await databases.listDocuments(
        config.databaseId!,
        config.favoritesCollectionId,
        [
          Query.equal(
            "userId",
            user.$id
          ),
          Query.equal(
            "propertyId",
            propertyId
          ),
          Query.limit(1),
        ]
      );

    if (
      existingFavorites.documents
        .length > 0
    ) {
      return existingFavorites
        .documents[0];
    }

    const favorite =
      await databases.createDocument(
        config.databaseId!,
        config.favoritesCollectionId,
        ID.unique(),
        {
          userId: user.$id,
          propertyId,
        },
        [
          Permission.read(
            Role.user(
              user.$id
            )
          ),
          Permission.delete(
            Role.user(
              user.$id
            )
          ),
        ]
      );

    return favorite;
  } catch (error) {
    console.error(
      "Add Favorite Error:",
      error
    );

    return null;
  }
}

// ==========================================
// REMOVE FAVORITE
// ==========================================

export async function removeFavorite({
  propertyId,
}: {
  propertyId: string;
}) {
  try {
    const user =
      await account.get();

    const result =
      await databases.listDocuments(
        config.databaseId!,
        config.favoritesCollectionId,
        [
          Query.equal(
            "userId",
            user.$id
          ),
          Query.equal(
            "propertyId",
            propertyId
          ),
          Query.limit(1),
        ]
      );

    if (
      result.documents.length ===
      0
    ) {
      return false;
    }

    const favoriteId =
      result.documents[0].$id;

    await databases.deleteDocument(
      config.databaseId!,
      config.favoritesCollectionId,
      favoriteId
    );

    return true;
  } catch (error) {
    console.error(
      "Remove Favorite Error:",
      error
    );

    return false;
  }
}

// ==========================================
// CHECK IF FAVORITE
// ==========================================

export async function isFavorite({
  propertyId,
}: {
  propertyId: string;
}) {
  try {
    const user =
      await account.get();

    const result =
      await databases.listDocuments(
        config.databaseId!,
        config.favoritesCollectionId,
        [
          Query.equal(
            "userId",
            user.$id
          ),
          Query.equal(
            "propertyId",
            propertyId
          ),
          Query.limit(1),
        ]
      );

    return (
      result.documents.length > 0
    );
  } catch (error) {
    console.error(
      "Check Favorite Error:",
      error
    );

    return false;
  }
}

// ==========================================
// GET ALL FAVORITES
// ==========================================

export async function getFavorites() {
  try {
    const user =
      await account.get();

    const result =
      await databases.listDocuments(
        config.databaseId!,
        config.favoritesCollectionId,
        [
          Query.equal(
            "userId",
            user.$id
          ),
          Query.orderDesc(
            "$createdAt"
          ),
          Query.limit(100),
        ]
      );

    return result.documents;
  } catch (error) {
    console.error(
      "Get Favorites Error:",
      error
    );

    return [];
  }
}

// ==========================================
// CREATE BOOKING
// ==========================================

export async function createBooking({
  propertyId,
  propertyName,
  checkIn,
  checkOut,
  guests,
}: {
  propertyId: string;
  propertyName: string;
  checkIn: string;
  checkOut: string;
  guests: number;
}) {
  try {
    const user =
      await account.get();

    const booking =
      await databases.createDocument(
        config.databaseId!,
        config.bookingsCollectionId,
        ID.unique(),
        {
          userId: user.$id,
          propertyId,
          propertyName,
          checkIn,
          checkOut,
          guests,
          status: "pending",
        },
        [
          Permission.read(
            Role.user(
              user.$id
            )
          ),
          Permission.update(
            Role.user(
              user.$id
            )
          ),
          Permission.delete(
            Role.user(
              user.$id
            )
          ),
        ]
      );

    console.log(
      "✅ BOOKING CREATED:",
      booking
    );

    return booking;
  } catch (error) {
    console.error(
      "❌ Create Booking Error:",
      error
    );

    return null;
  }
}

// ==========================================
// GET MY BOOKINGS
// ==========================================

export async function getMyBookings() {
  try {
    const user =
      await account.get();

    const result =
      await databases.listDocuments(
        config.databaseId!,
        config.bookingsCollectionId!,
        [
          Query.equal(
            "userId",
            user.$id
          ),
          Query.orderDesc(
            "$createdAt"
          ),
        ]
      );

    return result.documents;
  } catch (error) {
    console.error(
      "❌ Get My Bookings Error:",
      error
    );

    return [];
  }
}

// ==========================================
// CREATE REVIEW
// ==========================================

export async function createReview({
  propertyId,
  review,
  rating,
}: {
  propertyId: string;
  review: string;
  rating: number;
}) {
  try {
    const user =
      await account.get();

    const userAvatar =
      avatar.getInitials(
        user.name || "User"
      );

    const result =
      await databases.createDocument(
        config.databaseId!,
        config.reviewsCollectionId!,
        ID.unique(),
        {
          name:
            user.name || "User",

          avatar:
            userAvatar.toString(),

          review:
            review.trim(),

          rating,

          userId:
            user.$id,

          property:
            propertyId,

          propertyId:
            propertyId,
        }
      );

    console.log(
      "⭐ REVIEW CREATED:",
      result
    );

    return result;
  } catch (error) {
    console.error(
      "❌ Create Review Error:",
      error
    );

    return null;
  }
}

// ==========================================
// GET PROPERTY REVIEWS
// ==========================================

export async function getPropertyReviews({
  propertyId,
}: {
  propertyId: string;
}) {
  try {
    const result =
      await databases.listDocuments(
        config.databaseId!,
        config.reviewsCollectionId!,
        [
          Query.equal(
            "propertyId",
            propertyId
          ),
          Query.orderDesc(
            "$createdAt"
          ),
        ]
      );

    console.log(
      "⭐ PROPERTY REVIEWS:",
      propertyId,
      result.documents
    );

    return result.documents;
  } catch (error) {
    console.error(
      "❌ Get Property Reviews Error:",
      error
    );

    return [];
  }
}