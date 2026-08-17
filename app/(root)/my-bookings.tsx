import {
  ActivityIndicator,
  Alert,
  RefreshControl,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { useCallback, useEffect, useState } from "react";
import { router } from "expo-router";
import { Query } from "react-native-appwrite";

import {
  account,
  databases,
  config,
} from "@/lib/appwrite";

const MyBookings = () => {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // ==========================================
  // FETCH MY BOOKINGS
  // ==========================================

  const loadBookings = useCallback(async () => {
    try {
      console.log("📋 LOADING MY BOOKINGS...");

      const user = await account.get();

      console.log("👤 CURRENT USER:", user.$id);

      const result = await databases.listDocuments(
        config.databaseId!,
        config.bookingsCollectionId!,
        [
          Query.equal("userId", user.$id),
          Query.orderDesc("$createdAt"),
        ]
      );

      console.log(
        "📋 MY BOOKINGS RESULT:",
        result.documents
      );

      setBookings(result.documents);
    } catch (error) {
      console.error(
        "❌ MY BOOKINGS FETCH ERROR:",
        error
      );

      Alert.alert(
        "Error",
        "Failed to load your bookings."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  // ==========================================
  // FIRST LOAD
  // ==========================================

  useEffect(() => {
    loadBookings();
  }, [loadBookings]);

  // ==========================================
  // REFRESH
  // ==========================================

  const handleRefresh = async () => {
    setRefreshing(true);

    await loadBookings();

    setRefreshing(false);
  };

  // ==========================================
  // LOADING
  // ==========================================

  if (loading) {
    return (
      <View className="flex-1 bg-white items-center justify-center">
        <ActivityIndicator
          size="large"
          color="#0061FF"
        />

        <Text className="mt-4 text-black-300 font-rubik-medium">
          Loading your bookings...
        </Text>
      </View>
    );
  }

  // ==========================================
  // SCREEN
  // ==========================================

  return (
    <View className="flex-1 bg-white">

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerClassName="px-7 pb-32"
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
          />
        }
      >

        {/* HEADER */}

        <View className="mt-14">

          <TouchableOpacity
            onPress={() => router.back()}
            className="mb-8"
          >
            <Text className="text-2xl text-black-300">
              ←
            </Text>
          </TouchableOpacity>

          <Text className="text-2xl font-rubik-bold text-black-300">
            My Bookings
          </Text>

          <Text className="text-sm font-rubik text-black-200 mt-1">
            View your property bookings
          </Text>

        </View>

        {/* NO BOOKINGS */}

        {bookings.length === 0 ? (

          <View className="items-center justify-center mt-24">

            <Text className="text-lg font-rubik-bold text-black-300">
              No bookings yet
            </Text>

            <Text className="text-sm font-rubik text-black-200 mt-2 text-center">
              Your bookings will appear here.
            </Text>

            <TouchableOpacity
              onPress={() => router.push("/explore")}
              className="bg-primary-300 rounded-full px-7 py-4 mt-6"
            >
              <Text className="text-white font-rubik-bold">
                Browse Properties
              </Text>
            </TouchableOpacity>

          </View>

        ) : (

          /* BOOKINGS */

          <View className="mt-8">

            {bookings.map((booking) => (

              <View
                key={booking.$id}
                className="bg-white border border-primary-200 rounded-2xl p-5 mb-4"
              >

                {/* PROPERTY */}

                <Text className="text-lg font-rubik-bold text-black-300">
                  {booking.propertyName || "Property"}
                </Text>

                {/* STATUS */}

                <View className="flex-row items-center mt-4">

                  <Text className="text-sm font-rubik-medium text-black-200">
                    Status:
                  </Text>

                  <Text className="text-sm font-rubik-bold text-primary-300 ml-2">
                    {booking.status || "pending"}
                  </Text>

                </View>

                {/* CHECK IN */}

                <View className="mt-4">

                  <Text className="text-sm font-rubik-medium text-black-200">
                    Check-in
                  </Text>

                  <Text className="text-base font-rubik-medium text-black-300 mt-1">
                    {booking.checkIn || "-"}
                  </Text>

                </View>

                {/* CHECK OUT */}

                <View className="mt-4">

                  <Text className="text-sm font-rubik-medium text-black-200">
                    Check-out
                  </Text>

                  <Text className="text-base font-rubik-medium text-black-300 mt-1">
                    {booking.checkOut || "-"}
                  </Text>

                </View>

                {/* GUESTS */}

                <View className="mt-4">

                  <Text className="text-sm font-rubik-medium text-black-200">
                    Guests
                  </Text>

                  <Text className="text-base font-rubik-medium text-black-300 mt-1">
                    {booking.guests || 0}
                  </Text>

                </View>

              </View>

            ))}

          </View>

        )}

      </ScrollView>

    </View>
  );
};

export default MyBookings;