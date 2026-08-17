// import {
//   ActivityIndicator,
//   Text,
//   TouchableOpacity,
//   View,
//   ScrollView,
// } from "react-native";
// import { router, useLocalSearchParams } from "expo-router";
// import { useAppwrite } from "@/lib/useAppwrite";
// import { getPropertyById } from "@/lib/appwrite";

// const Booking = () => {
//   const { id } = useLocalSearchParams<{ id?: string }>();

//   const {
//     data: property,
//     loading,
//   } = useAppwrite({
//     fn: getPropertyById,
//     params: {
//       id: id!,
//     },
//     skip: !id,
//   });

//   if (loading) {
//     return (
//       <View className="flex-1 items-center justify-center bg-white">
//         <ActivityIndicator
//           size="large"
//           className="text-primary-300"
//         />
//       </View>
//     );
//   }

//   if (!property) {
//     return (
//       <View className="flex-1 items-center justify-center bg-white px-5">
//         <Text className="text-lg font-rubik-bold text-black-300">
//           Property not found
//         </Text>

//         <TouchableOpacity
//           onPress={() => router.back()}
//           className="mt-5 bg-primary-300 px-6 py-3 rounded-full"
//         >
//           <Text className="text-white font-rubik-bold">
//             Go Back
//           </Text>
//         </TouchableOpacity>
//       </View>
//     );
//   }

//   return (
//     <View className="flex-1 bg-white">
//       <ScrollView
//         showsVerticalScrollIndicator={false}
//         contentContainerClassName="pb-10"
//       >
//         {/* HEADER */}

//         <View className="px-5 pt-14">
//           <TouchableOpacity
//             onPress={() => router.back()}
//             className="size-11 bg-primary-200 rounded-full items-center justify-center"
//           >
//             <Text className="text-xl font-rubik-bold text-black-300">
//               ←
//             </Text>
//           </TouchableOpacity>

//           <Text className="text-2xl font-rubik-extrabold text-black-300 mt-6">
//             Book Property
//           </Text>
//         </View>

//         {/* PROPERTY */}

//         <View className="mx-5 mt-7 p-5 bg-primary-100 rounded-2xl">
//           <Text className="text-xl font-rubik-bold text-black-300">
//             {property.name}
//           </Text>

//           <Text className="text-sm font-rubik text-black-200 mt-2">
//             {property.address}
//           </Text>

//           <Text className="text-2xl font-rubik-bold text-primary-300 mt-4">
//             ${property.price}
//           </Text>
//         </View>

//         {/* CHECK IN */}

//         <View className="mx-5 mt-7">
//           <Text className="text-lg font-rubik-bold text-black-300">
//             Check-in
//           </Text>

//           <View className="border border-primary-200 rounded-xl px-4 py-4 mt-3">
//             <Text className="text-black-200 font-rubik">
//               Select check-in date
//             </Text>
//           </View>
//         </View>

//         {/* CHECK OUT */}

//         <View className="mx-5 mt-5">
//           <Text className="text-lg font-rubik-bold text-black-300">
//             Check-out
//           </Text>

//           <View className="border border-primary-200 rounded-xl px-4 py-4 mt-3">
//             <Text className="text-black-200 font-rubik">
//               Select check-out date
//             </Text>
//           </View>
//         </View>

//         {/* GUESTS */}

//         <View className="mx-5 mt-5">
//           <Text className="text-lg font-rubik-bold text-black-300">
//             Guests
//           </Text>

//           <View className="border border-primary-200 rounded-xl px-4 py-4 mt-3">
//             <Text className="text-black-300 font-rubik-medium">
//               1 Guest
//             </Text>
//           </View>
//         </View>

//         {/* CONFIRM */}

//         <TouchableOpacity
//           className="mx-5 mt-8 bg-primary-300 py-4 rounded-full items-center"
//           onPress={() => {
//             console.log(
//               "BOOKING BUTTON PRESSED:",
//               property.$id
//             );
//           }}
//         >
//           <Text className="text-white text-lg font-rubik-bold">
//             Confirm Booking
//           </Text>
//         </TouchableOpacity>
//       </ScrollView>
//     </View>
//   );
// };

// export default Booking;


import {
  ActivityIndicator,
  Alert,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";

import { getPropertyById, createBooking } from "@/lib/appwrite";
import { useAppwrite } from "@/lib/useAppwrite";

const Booking = () => {
  const { id } = useLocalSearchParams<{ id?: string }>();

  const {
    data: property,
    loading,
  } = useAppwrite({
    fn: getPropertyById,
    params: {
      id: id!,
    },
    skip: !id,
  });

  // ==========================================
  // BOOKING STATE
  // ==========================================

  const [checkIn, setCheckIn] = useState<Date | null>(null);
  const [checkOut, setCheckOut] = useState<Date | null>(null);

  const [showCheckInPicker, setShowCheckInPicker] =
    useState(false);

  const [showCheckOutPicker, setShowCheckOutPicker] =
    useState(false);

  const [guests, setGuests] = useState(1);

  const [bookingLoading, setBookingLoading] =
    useState(false);

  // ==========================================
  // FORMAT DATE
  // ==========================================

  const formatDate = (date: Date | null) => {
    if (!date) {
      return "";
    }

    const year = date.getFullYear();
    const month = String(
      date.getMonth() + 1
    ).padStart(2, "0");

    const day = String(
      date.getDate()
    ).padStart(2, "0");

    return `${year}-${month}-${day}`;
  };

  // ==========================================
  // CHECK IN
  // ==========================================

  const handleCheckInChange = (
    event: any,
    selectedDate?: Date
  ) => {
    setShowCheckInPicker(false);

    if (event.type === "dismissed") {
      return;
    }

    if (selectedDate) {
      setCheckIn(selectedDate);

      // If checkout is before new check-in,
      // clear checkout.
      if (
        checkOut &&
        selectedDate >= checkOut
      ) {
        setCheckOut(null);
      }
    }
  };

  // ==========================================
  // CHECK OUT
  // ==========================================

  const handleCheckOutChange = (
    event: any,
    selectedDate?: Date
  ) => {
    setShowCheckOutPicker(false);

    if (event.type === "dismissed") {
      return;
    }

    if (selectedDate) {
      setCheckOut(selectedDate);
    }
  };

  // ==========================================
  // GUESTS
  // ==========================================

  const increaseGuests = () => {
    setGuests((current) => current + 1);
  };

  const decreaseGuests = () => {
    setGuests((current) =>
      current > 1 ? current - 1 : 1
    );
  };

  // ==========================================
  // CONFIRM BOOKING
  // ==========================================

  const handleConfirmBooking = async () => {
    console.log("🔥 CONFIRM BOOKING PRESSED");

    if (!id) {
      Alert.alert(
        "Error",
        "Property ID is missing."
      );
      return;
    }

    if (!property) {
      Alert.alert(
        "Error",
        "Property information is not available."
      );
      return;
    }

    if (!checkIn) {
      Alert.alert(
        "Check-in required",
        "Please select your check-in date."
      );
      return;
    }

    if (!checkOut) {
      Alert.alert(
        "Check-out required",
        "Please select your check-out date."
      );
      return;
    }

    if (checkOut <= checkIn) {
      Alert.alert(
        "Invalid dates",
        "Check-out must be after check-in."
      );
      return;
    }

    try {
      setBookingLoading(true);

      console.log("📅 CHECK IN:", formatDate(checkIn));
      console.log("📅 CHECK OUT:", formatDate(checkOut));
      console.log("👥 GUESTS:", guests);
      console.log(
        "🏠 PROPERTY:",
        property.name
      );

      const result = await createBooking({
        propertyId: id,
        propertyName: property.name,
        checkIn: formatDate(checkIn),
        checkOut: formatDate(checkOut),
        guests,
      });

      if (!result) {
        Alert.alert(
          "Booking failed",
          "Could not create your booking. Please try again."
        );
        return;
      }

      console.log(
        "✅ BOOKING SUCCESS:",
        result
      );

      Alert.alert(
        "Booking Confirmed 🎉",
        `Your booking for ${property.name} has been submitted.`,
        [
          {
            text: "OK",
            onPress: () => router.back(),
          },
        ]
      );
    } catch (error) {
      console.error(
        "❌ BOOKING ERROR:",
        error
      );

      Alert.alert(
        "Booking failed",
        "Something went wrong. Please try again."
      );
    } finally {
      setBookingLoading(false);
    }
  };

  // ==========================================
  // LOADING
  // ==========================================

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator
          size="large"
          className="text-primary-300"
        />
      </View>
    );
  }

  // ==========================================
  // PROPERTY NOT FOUND
  // ==========================================

  if (!property) {
    return (
      <View className="flex-1 items-center justify-center bg-white px-5">
        <Text className="text-lg font-rubik-bold text-black-300">
          Property not found
        </Text>

        <TouchableOpacity
          onPress={() => router.back()}
          className="mt-5 bg-primary-300 px-6 py-3 rounded-full"
        >
          <Text className="text-white font-rubik-bold">
            Go Back
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  // ==========================================
  // UI
  // ==========================================

  return (
    <View className="flex-1 bg-white">

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerClassName="pb-10"
      >

        {/* HEADER */}

        <View className="px-5 pt-14">

          <TouchableOpacity
            onPress={() => router.back()}
            className="size-11 bg-primary-200 rounded-full items-center justify-center"
          >
            <Text className="text-xl font-rubik-bold text-black-300">
              ←
            </Text>
          </TouchableOpacity>

          <Text className="text-2xl font-rubik-extrabold text-black-300 mt-6">
            Book Property
          </Text>

        </View>

        {/* PROPERTY */}

        <View className="mx-5 mt-7 p-5 bg-primary-100 rounded-2xl">

          <Text className="text-xl font-rubik-bold text-black-300">
            {property.name}
          </Text>

          <Text className="text-sm font-rubik text-black-200 mt-2">
            {property.address}
          </Text>

          <Text className="text-2xl font-rubik-bold text-primary-300 mt-4">
            ${property.price}
          </Text>

        </View>

        {/* CHECK IN */}

        <View className="mx-5 mt-7">

          <Text className="text-lg font-rubik-bold text-black-300">
            Check-in
          </Text>

          <TouchableOpacity
            onPress={() =>
              setShowCheckInPicker(true)
            }
            className="border border-primary-200 rounded-xl px-4 py-4 mt-3"
          >

            <Text
              className={
                checkIn
                  ? "text-black-300 font-rubik-medium"
                  : "text-black-200 font-rubik"
              }
            >
              {checkIn
                ? formatDate(checkIn)
                : "Select check-in date"}
            </Text>

          </TouchableOpacity>

        </View>

        {/* CHECK IN DATE PICKER */}

        {showCheckInPicker && (
          <DateTimePicker
            value={checkIn || new Date()}
            mode="date"
            display={
              Platform.OS === "ios"
                ? "spinner"
                : "default"
            }
            minimumDate={new Date()}
            onChange={handleCheckInChange}
          />
        )}

        {/* CHECK OUT */}

        <View className="mx-5 mt-5">

          <Text className="text-lg font-rubik-bold text-black-300">
            Check-out
          </Text>

          <TouchableOpacity
            onPress={() => {
              if (!checkIn) {
                Alert.alert(
                  "Select check-in first",
                  "Please select your check-in date first."
                );
                return;
              }

              setShowCheckOutPicker(true);
            }}
            className="border border-primary-200 rounded-xl px-4 py-4 mt-3"
          >

            <Text
              className={
                checkOut
                  ? "text-black-300 font-rubik-medium"
                  : "text-black-200 font-rubik"
              }
            >
              {checkOut
                ? formatDate(checkOut)
                : "Select check-out date"}
            </Text>

          </TouchableOpacity>

        </View>

        {/* CHECK OUT DATE PICKER */}

        {showCheckOutPicker && checkIn && (
          <DateTimePicker
            value={
              checkOut ||
              new Date(
                checkIn.getTime() +
                  24 * 60 * 60 * 1000
              )
            }
            mode="date"
            display={
              Platform.OS === "ios"
                ? "spinner"
                : "default"
            }
            minimumDate={
              new Date(
                checkIn.getTime() +
                  24 * 60 * 60 * 1000
              )
            }
            onChange={handleCheckOutChange}
          />
        )}

        {/* GUESTS */}

        <View className="mx-5 mt-5">

          <Text className="text-lg font-rubik-bold text-black-300">
            Guests
          </Text>

          <View className="border border-primary-200 rounded-xl px-4 py-3 mt-3 flex-row items-center justify-between">

            {/* MINUS */}

            <Pressable
              onPress={decreaseGuests}
              className="size-10 bg-primary-100 rounded-full items-center justify-center"
            >
              <Text className="text-xl font-rubik-bold text-primary-300">
                −
              </Text>
            </Pressable>

            {/* NUMBER */}

            <View className="items-center">

              <Text className="text-lg font-rubik-bold text-black-300">
                {guests}
              </Text>

              <Text className="text-xs font-rubik text-black-200">
                {guests === 1
                  ? "Guest"
                  : "Guests"}
              </Text>

            </View>

            {/* PLUS */}

            <Pressable
              onPress={increaseGuests}
              className="size-10 bg-primary-100 rounded-full items-center justify-center"
            >
              <Text className="text-xl font-rubik-bold text-primary-300">
                +
              </Text>
            </Pressable>

          </View>

        </View>

        {/* CONFIRM BOOKING */}

        <TouchableOpacity
          disabled={bookingLoading}
          onPress={handleConfirmBooking}
          className={`mx-5 mt-8 py-4 rounded-full items-center ${
            bookingLoading
              ? "bg-primary-200"
              : "bg-primary-300"
          }`}
        >

          {bookingLoading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text className="text-white text-lg font-rubik-bold">
              Confirm Booking
            </Text>
          )}

        </TouchableOpacity>

      </ScrollView>

    </View>
  );
};

export default Booking;