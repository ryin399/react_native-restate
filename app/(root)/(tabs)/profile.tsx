import {
  Alert,
  Image,
  ImageSourcePropType,
  SafeAreaView,
  ScrollView,
  Share,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { logout } from "@/lib/appwrite";
import { useGlobalContext } from "@/lib/global-provider";

import icons from "@/constants/icons";
import { settings } from "@/constants/data";
import { router } from "expo-router";

interface SettingsItemProp {
  icon: ImageSourcePropType;
  title: string;
  onPress?: () => void;
  textStyle?: string;
  showArrow?: boolean;
}

const SettingsItem = ({
  icon,
  title,
  onPress,
  textStyle,
  showArrow = true,
}: SettingsItemProp) => (
  <TouchableOpacity
    onPress={onPress}
    activeOpacity={0.7}
    className="flex flex-row items-center justify-between py-3"
  >
    <View className="flex flex-row items-center gap-3">
      <Image
        source={icon}
        style={{
          width: 24,
          height: 24,
        }}
        resizeMode="contain"
      />

      <Text
        className={`text-lg font-rubik-medium text-black-300 ${
          textStyle ?? ""
        }`}
      >
        {title}
      </Text>
    </View>

    {showArrow && (
      <Image
        source={icons.rightArrow}
        style={{
          width: 20,
          height: 20,
        }}
        resizeMode="contain"
      />
    )}
  </TouchableOpacity>
);

const Profile = () => {
  const {
    user,
    refetch,
  } = useGlobalContext();

  // ==========================================
  // LOGOUT
  // ==========================================

  const handleLogout = async () => {
    const result = await logout();

    if (result) {
      Alert.alert(
        "Success",
        "Logged out successfully"
      );

      refetch();
    } else {
      Alert.alert(
        "Error",
        "Failed to logout"
      );
    }
  };

  // ==========================================
  // MY BOOKINGS
  // ==========================================

  const handleMyBookings = () => {
    console.log(
      "📋 MY BOOKINGS PRESSED"
    );

    router.push("/my-bookings");
  };

  // ==========================================
  // MY FAVOURITES
  // ==========================================

  const handleMyFavourites = () => {
    console.log(
      "❤️ MY FAVOURITES PRESSED"
    );

    router.push("/my-favorites");
  };

  // ==========================================
  // PAYMENTS
  // ==========================================

  const handlePayments = () => {
    console.log(
      "💳 PAYMENTS PRESSED"
    );

    router.push("/payments");
  };

  // ==========================================
  // NOTIFICATIONS
  // ==========================================

  const handleNotifications = () => {
    console.log(
      "🔔 NOTIFICATIONS PRESSED"
    );

    router.push("/notifications");
  };

  // ==========================================
  // LANGUAGE
  // ==========================================

  const handleLanguage = () => {
    console.log(
      "🌐 LANGUAGE PRESSED"
    );

    router.push("/language");
  };

  // ==========================================
  // SECURITY
  // ==========================================

  const handleSecurity = () => {
    console.log(
      "🔐 SECURITY PRESSED"
    );

    router.push("/(root)/security");
  };

  // ==========================================
  // INVITE FRIEND
  // ==========================================

  const handleInviteFriend = async () => {
    console.log(
      "👥 INVITE FRIEND PRESSED"
    );

    try {
      const result = await Share.share({
        message:
          "🏠 Check out Real State!\n\n" +
          "Find your ideal property easily with Real State. " +
          "Explore properties, save your favourites, and find your perfect home.",
      });

      if (result.action === Share.sharedAction) {
        console.log(
          "✅ INVITE SHARED SUCCESSFULLY"
        );
      } else if (
        result.action === Share.dismissedAction
      ) {
        console.log(
          "ℹ️ SHARE SHEET DISMISSED"
        );
      }
    } catch (error) {
      console.error(
        "❌ INVITE FRIEND ERROR:",
        error
      );

      Alert.alert(
        "Error",
        "Unable to open sharing options."
      );
    }
  };

  return (
    <SafeAreaView className="h-full bg-white">

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerClassName="pb-32 px-7"
      >

        {/* ==========================================
            HEADER
        ========================================== */}

        <View className="flex flex-row items-center justify-between mt-5">

          <Text className="text-xl font-rubik-bold">
            Profile
          </Text>

          <TouchableOpacity
            onPress={
              handleNotifications
            }
            hitSlop={10}
            activeOpacity={0.7}
          >
            <Image
              source={icons.bell}
              style={{
                width: 20,
                height: 20,
              }}
              resizeMode="contain"
            />
          </TouchableOpacity>

        </View>

        {/* ==========================================
            PROFILE
        ========================================== */}

        <View className="flex flex-row justify-center mt-5">

          <View className="flex flex-col items-center relative mt-5">

            <Image
              source={{
                uri: user?.avatar,
              }}
              className="size-44 relative rounded-full"
            />

            <TouchableOpacity
              className="absolute bottom-11 right-2"
              activeOpacity={0.7}
            >
              <Image
                source={icons.edit}
                className="size-9"
                resizeMode="contain"
              />
            </TouchableOpacity>

            <Text className="text-2xl font-rubik-bold mt-2">
              {user?.name}
            </Text>

          </View>

        </View>

        {/* ==========================================
            ACCOUNT
        ========================================== */}

        <View className="flex flex-col mt-10">

          {/* MY BOOKINGS */}

          <SettingsItem
            icon={icons.calendar}
            title="My Bookings"
            onPress={
              handleMyBookings
            }
          />

          {/* MY FAVOURITES */}

          <TouchableOpacity
            onPress={
              handleMyFavourites
            }
            activeOpacity={0.7}
            className="flex flex-row items-center justify-between py-3"
          >

            <View className="flex flex-row items-center gap-3">

              <Image
                source={
                  icons.heartFilled
                }
                style={{
                  width: 24,
                  height: 24,
                }}
                resizeMode="contain"
              />

              <Text className="text-lg font-rubik-medium text-black-300">
                My Favourites
              </Text>

            </View>

            <Image
              source={
                icons.rightArrow
              }
              style={{
                width: 20,
                height: 20,
              }}
              resizeMode="contain"
            />

          </TouchableOpacity>

          {/* PAYMENTS */}

          <SettingsItem
            icon={icons.wallet}
            title="Payments"
            onPress={
              handlePayments
            }
          />

        </View>

        {/* ==========================================
            SETTINGS
        ========================================== */}

        <View className="flex flex-col mt-5 border-t pt-5 border-primary-200">

          {settings
            .slice(2)
            .filter(
              (item) =>
                item.title !==
                  "Profile" &&
                item.title !==
                  "Help Center" &&
                item.title !==
                  "Invite Friend"
            )
            .map(
              (item, index) => {

                let onPress:
                  | (() => void)
                  | undefined;

                // NOTIFICATIONS

                if (
                  item.title ===
                  "Notifications"
                ) {
                  onPress =
                    handleNotifications;
                }

                // LANGUAGE

                if (
                  item.title ===
                  "Language"
                ) {
                  onPress =
                    handleLanguage;
                }

                // SECURITY

                if (
                  item.title ===
                  "Security"
                ) {
                  onPress =
                    handleSecurity;
                }

                return (
                  <SettingsItem
                    key={index}
                    {...item}
                    onPress={
                      onPress
                    }
                  />
                );
              }
            )}

          {/* ==========================================
              INVITE FRIEND
          ========================================== */}

          <SettingsItem
            icon={icons.send}
            title="Invite Friend"
            onPress={
              handleInviteFriend
            }
          />

        </View>

        {/* ==========================================
            LOGOUT
        ========================================== */}

        <View className="flex flex-col border-t mt-5 pt-5 border-primary-200">

          <SettingsItem
            icon={icons.logout}
            title="Logout"
            textStyle="text-danger"
            showArrow={false}
            onPress={
              handleLogout
            }
          />

        </View>

      </ScrollView>

    </SafeAreaView>
  );
};

export default Profile;