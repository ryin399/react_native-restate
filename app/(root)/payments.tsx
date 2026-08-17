import {
  Image,
  SafeAreaView,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { router } from "expo-router";

import icons from "@/constants/icons";

const Payments = () => {
  return (
    <SafeAreaView className="flex-1 bg-white">

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerClassName="pb-10 px-7"
      >

        {/* ==========================================
            HEADER
        ========================================== */}

        <View className="flex flex-row items-center justify-between mt-5">

          <TouchableOpacity
            onPress={() => router.back()}
            className="bg-primary-100 rounded-full size-11 items-center justify-center"
          >
            <Image
              source={icons.backArrow}
              className="size-5"
            />
          </TouchableOpacity>

          <Text className="text-xl font-rubik-bold text-black-300">
            Payments
          </Text>

          <View className="size-11" />

        </View>

        {/* ==========================================
            PAYMENT SUMMARY
        ========================================== */}

        <View className="bg-primary-300 rounded-2xl p-5 mt-8">

          <Text className="text-white text-sm font-rubik-medium">
            Total Paid
          </Text>

          <Text className="text-white text-3xl font-rubik-extrabold mt-2">
            ৳17,686
          </Text>

          <View className="flex flex-row justify-between mt-6">

            <View>
              <Text className="text-white/70 text-xs font-rubik">
                Paid
              </Text>

              <Text className="text-white text-lg font-rubik-bold mt-1">
                ৳17,686
              </Text>
            </View>

            <View>
              <Text className="text-white/70 text-xs font-rubik">
                Pending
              </Text>

              <Text className="text-white text-lg font-rubik-bold mt-1">
                ৳8,843
              </Text>
            </View>

            <View>
              <Text className="text-white/70 text-xs font-rubik">
                Transactions
              </Text>

              <Text className="text-white text-lg font-rubik-bold mt-1">
                3
              </Text>
            </View>

          </View>

        </View>

        {/* ==========================================
            PAYMENT METHODS
        ========================================== */}

        <View className="mt-8">

          <View className="flex flex-row items-center justify-between">

            <Text className="text-xl font-rubik-bold text-black-300">
              Payment Methods
            </Text>

            <TouchableOpacity>
              <Text className="text-primary-300 font-rubik-bold">
                + Add
              </Text>
            </TouchableOpacity>

          </View>

          {/* CARD */}

          <View className="flex flex-row items-center justify-between border border-primary-200 rounded-2xl p-4 mt-4">

            <View className="flex flex-row items-center">

              <View className="bg-primary-100 rounded-xl size-12 items-center justify-center">

                <Text className="text-primary-300 text-lg font-rubik-bold">
                  💳
                </Text>

              </View>

              <View className="ml-3">

                <Text className="text-black-300 text-base font-rubik-bold">
                  Visa Card
                </Text>

                <Text className="text-black-200 text-sm font-rubik mt-1">
                  **** **** **** 4242
                </Text>

              </View>

            </View>

            <Text className="text-green-600 text-sm font-rubik-bold">
              Active
            </Text>

          </View>

          {/* MOBILE BANKING */}

          <View className="flex flex-row items-center justify-between border border-primary-200 rounded-2xl p-4 mt-3">

            <View className="flex flex-row items-center">

              <View className="bg-primary-100 rounded-xl size-12 items-center justify-center">

                <Text className="text-primary-300 text-lg font-rubik-bold">
                  📱
                </Text>

              </View>

              <View className="ml-3">

                <Text className="text-black-300 text-base font-rubik-bold">
                  Mobile Banking
                </Text>

                <Text className="text-black-200 text-sm font-rubik mt-1">
                  **** 5678
                </Text>

              </View>

            </View>

            <Text className="text-black-200 text-sm font-rubik-medium">
              Available
            </Text>

          </View>

        </View>

        {/* ==========================================
            RECENT TRANSACTIONS
        ========================================== */}

        <View className="mt-8">

          <View className="flex flex-row items-center justify-between">

            <Text className="text-xl font-rubik-bold text-black-300">
              Recent Transactions
            </Text>

            <TouchableOpacity>
              <Text className="text-primary-300 font-rubik-bold">
                See All
              </Text>
            </TouchableOpacity>

          </View>

          {/* TRANSACTION 1 */}

          <View className="border border-primary-200 rounded-2xl p-4 mt-4">

            <View className="flex flex-row items-center justify-between">

              <View>

                <Text className="text-black-300 text-base font-rubik-bold">
                  Property 6
                </Text>

                <Text className="text-black-200 text-sm font-rubik mt-1">
                  Aug 29, 2026
                </Text>

              </View>

              <Text className="text-black-300 text-lg font-rubik-bold">
                ৳8,843
              </Text>

            </View>

            <View className="flex flex-row items-center justify-between mt-4">

              <Text className="text-black-200 text-xs font-rubik">
                Visa •••• 4242
              </Text>

              <View className="bg-green-100 px-3 py-1 rounded-full">

                <Text className="text-green-600 text-xs font-rubik-bold">
                  Paid
                </Text>

              </View>

            </View>

          </View>

          {/* TRANSACTION 2 */}

          <View className="border border-primary-200 rounded-2xl p-4 mt-3">

            <View className="flex flex-row items-center justify-between">

              <View>

                <Text className="text-black-300 text-base font-rubik-bold">
                  Property 7
                </Text>

                <Text className="text-black-200 text-sm font-rubik mt-1">
                  Aug 20, 2026
                </Text>

              </View>

              <Text className="text-black-300 text-lg font-rubik-bold">
                ৳4,500
              </Text>

            </View>

            <View className="flex flex-row items-center justify-between mt-4">

              <Text className="text-black-200 text-xs font-rubik">
                Mobile Banking
              </Text>

              <View className="bg-yellow-100 px-3 py-1 rounded-full">

                <Text className="text-yellow-600 text-xs font-rubik-bold">
                  Pending
                </Text>

              </View>

            </View>

          </View>

          {/* TRANSACTION 3 */}

          <View className="border border-primary-200 rounded-2xl p-4 mt-3">

            <View className="flex flex-row items-center justify-between">

              <View>

                <Text className="text-black-300 text-base font-rubik-bold">
                  Property 15
                </Text>

                <Text className="text-black-200 text-sm font-rubik mt-1">
                  Aug 14, 2026
                </Text>

              </View>

              <Text className="text-black-300 text-lg font-rubik-bold">
                ৳4,343
              </Text>

            </View>

            <View className="flex flex-row items-center justify-between mt-4">

              <Text className="text-black-200 text-xs font-rubik">
                Visa •••• 4242
              </Text>

              <View className="bg-green-100 px-3 py-1 rounded-full">

                <Text className="text-green-600 text-xs font-rubik-bold">
                  Paid
                </Text>

              </View>

            </View>

          </View>

        </View>

      </ScrollView>

    </SafeAreaView>
  );
};

export default Payments;