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

interface NotificationItemProps {
  icon: any;
  title: string;
  message: string;
  time: string;
  unread?: boolean;
}

const NotificationItem = ({
  icon,
  title,
  message,
  time,
  unread = false,
}: NotificationItemProps) => {
  return (
    <TouchableOpacity
      className={`flex flex-row items-start p-4 rounded-2xl mb-3 ${
        unread
          ? "bg-primary-100"
          : "bg-gray-50"
      }`}
    >
      {/* ICON */}

      <View className="size-12 rounded-full bg-white items-center justify-center">
        <Image
          source={icon}
          className="size-6"
        />
      </View>

      {/* CONTENT */}

      <View className="flex-1 ml-3">

        <View className="flex flex-row items-center justify-between">

          <Text className="text-base font-rubik-bold text-black-300">
            {title}
          </Text>

          {unread && (
            <View className="size-2 rounded-full bg-primary-300" />
          )}

        </View>

        <Text
          numberOfLines={2}
          className="text-sm font-rubik text-black-200 mt-1 pr-2"
        >
          {message}
        </Text>

        <Text className="text-xs font-rubik text-black-100 mt-2">
          {time}
        </Text>

      </View>
    </TouchableOpacity>
  );
};

const Notifications = () => {
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
            Notifications
          </Text>

          <TouchableOpacity>
            <Text className="text-primary-300 text-sm font-rubik-bold">
              Read all
            </Text>
          </TouchableOpacity>

        </View>

        {/* ==========================================
            TODAY
        ========================================== */}

        <Text className="text-lg font-rubik-bold text-black-300 mt-8 mb-3">
          Today
        </Text>

        {/* BOOKING CONFIRMED */}

        <NotificationItem
          icon={icons.calendar}
          title="Booking Confirmed"
          message="Your booking for Property 6 has been confirmed successfully."
          time="10 min ago"
          unread
        />

        {/* NEW REVIEW */}

        <NotificationItem
          icon={icons.star}
          title="Review Submitted"
          message="Your review has been submitted successfully."
          time="1 hour ago"
          unread
        />

        {/* PAYMENT */}

        <NotificationItem
          icon={icons.wallet}
          title="Payment Received"
          message="Your payment for Property 15 was successfully received."
          time="3 hours ago"
          unread
        />

        {/* ==========================================
            EARLIER
        ========================================== */}

        <Text className="text-lg font-rubik-bold text-black-300 mt-7 mb-3">
          Earlier
        </Text>

        {/* BOOKING REMINDER */}

        <NotificationItem
          icon={icons.calendar}
          title="Booking Reminder"
          message="Your upcoming check-in is approaching. Don't forget your booking."
          time="Yesterday"
        />

        {/* FAVORITE */}

        <NotificationItem
          icon={icons.heart}
          title="Property Added to Favorites"
          message="You added a property to your favorite list."
          time="2 days ago"
        />

        {/* SECURITY */}

        <NotificationItem
          icon={icons.shield}
          title="Security Update"
          message="Your account information was recently updated."
          time="3 days ago"
        />

      </ScrollView>

    </SafeAreaView>
  );
};

export default Notifications;