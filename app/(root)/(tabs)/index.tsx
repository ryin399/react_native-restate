import {
  ActivityIndicator,
  FlatList,
  Image,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { useEffect } from "react";

import {
  router,
  useLocalSearchParams,
} from "expo-router";

import { SafeAreaView } from "react-native-safe-area-context";

import icons from "@/constants/icons";

import Search from "@/components/Search";
import Filters from "@/components/Filters";
import NoResults from "@/components/NoResults";

import {
  Card,
  FeaturedCard,
} from "@/components/Cards";

import { useAppwrite } from "@/lib/useAppwrite";
import { useGlobalContext } from "@/lib/global-provider";

import {
  getLatestProperties,
  getProperties,
} from "@/lib/appwrite";

// =====================================================
// HOME HEADER
// =====================================================

const HomeHeader = ({
  user,
  latestProperties,
  latestPropertiesLoading,
}: {
  user: any;
  latestProperties: any[];
  latestPropertiesLoading: boolean;
}) => {

  // ===================================================
  // PROPERTY CARD PRESS
  // ===================================================

  const handleCardPress = (id: string) => {
    router.push(`/properties/${id}`);
  };

  // ===================================================
  // NOTIFICATIONS
  // ===================================================

  const handleNotifications = () => {
    console.log(
      "🔔 HOME NOTIFICATIONS PRESSED"
    );

    router.push("/notifications");
  };

  // ===================================================
  // AI CHATBOT
  // ===================================================

  const handleChatbot = () => {
    console.log(
      "🤖 AI CHATBOT PRESSED"
    );

    router.push("/(root)/chatbot");
  };

  return (
    <View className="px-5">

      {/* ==========================================
          USER HEADER
      ========================================== */}

      <View className="flex flex-row items-center justify-between mt-5">

        {/* USER */}

        <View className="flex flex-row">

          <Image
            source={{
              uri: user?.avatar,
            }}
            className="size-12 rounded-full"
          />

          <View className="flex flex-col items-start ml-2 justify-center">

            <Text className="text-xs font-rubik text-black-100">
              Good Morning
            </Text>

            <Text className="text-base font-rubik-medium text-black-300">
              {user?.name}
            </Text>

          </View>

        </View>

        {/* ==========================================
            AI + NOTIFICATION BUTTONS
        ========================================== */}

        <View className="flex flex-row items-center">

          {/* AI CHATBOT */}

          <TouchableOpacity
            onPress={handleChatbot}
            hitSlop={10}
            className="mr-1"
            activeOpacity={0.7}
          >

            <View className="bg-primary-100 rounded-full size-10 items-center justify-center">

              <Text className="text-lg">
                🤖
              </Text>

            </View>

          </TouchableOpacity>

          {/* NOTIFICATION BUTTON */}

          <TouchableOpacity
            onPress={handleNotifications}
            hitSlop={10}
            className="p-2"
            activeOpacity={0.7}
          >

            <Image
              source={icons.bell}
              className="size-6"
              resizeMode="contain"
            />

          </TouchableOpacity>

        </View>

      </View>

      {/* ==========================================
          SEARCH
      ========================================== */}

      <Search />

      {/* ==========================================
          FEATURED
      ========================================== */}

      <View className="my-5">

        <View className="flex flex-row items-center justify-between">

          <Text className="text-xl font-rubik-bold text-black-300">
            Featured
          </Text>

          <TouchableOpacity
            activeOpacity={0.7}
          >
            <Text className="text-base font-rubik-bold text-primary-300">
              See all
            </Text>
          </TouchableOpacity>

        </View>

        {latestPropertiesLoading ? (

          <ActivityIndicator
            size="large"
            className="text-primary-300"
          />

        ) : !latestProperties ||
          latestProperties.length === 0 ? (

          <NoResults />

        ) : (

          <FlatList
            data={latestProperties}
            renderItem={({ item }) => (
              <FeaturedCard
                item={item}
                onPress={() =>
                  handleCardPress(
                    item.$id
                  )
                }
              />
            )}
            keyExtractor={(item) =>
              item.$id
            }
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerClassName="flex gap-5 mt-5"
          />

        )}

      </View>

      {/* ==========================================
          OUR RECOMMENDATION
      ========================================== */}

      <View className="mt-5">

        <View className="flex flex-row items-center justify-between">

          <Text className="text-xl font-rubik-bold text-black-300">
            Our Recommendation
          </Text>

          <TouchableOpacity
            activeOpacity={0.7}
          >
            <Text className="text-base font-rubik-bold text-primary-300">
              See all
            </Text>
          </TouchableOpacity>

        </View>

        <Filters />

      </View>

    </View>
  );
};

// =====================================================
// HOME
// =====================================================

const Home = () => {

  console.log(
    "HOME SCREEN RENDERED"
  );

  const { user } =
    useGlobalContext();

  const params =
    useLocalSearchParams<{
      query?: string;
      filter?: string;
    }>();

  // ===================================================
  // LATEST PROPERTIES
  // ===================================================

  const {
    data: latestProperties,
    loading: latestPropertiesLoading,
  } = useAppwrite({
    fn: getLatestProperties,
  });

  // ===================================================
  // ALL PROPERTIES
  // ===================================================

  const {
    data: properties,
    refetch,
    loading,
  } = useAppwrite({
    fn: getProperties,

    params: {
      filter: params.filter!,
      query: params.query!,
      limit: 6,
    },

    skip: true,
  });

  // ===================================================
  // REFRESH PROPERTIES
  // ===================================================

  useEffect(() => {

    refetch({
      filter: params.filter!,
      query: params.query!,
      limit: 10,
    });

  }, [
    params.filter,
    params.query,
  ]);

  // ===================================================
  // PROPERTY CARD PRESS
  // ===================================================

  const handleCardPress = (
    id: string
  ) => {

    router.push(
      `/properties/${id}`
    );

  };

  // ===================================================
  // UI
  // ===================================================

  return (
    <SafeAreaView className="h-full bg-white">

      <FlatList
        data={properties}
        numColumns={2}

        renderItem={({ item }) => (

          <Card
            item={item}
            onPress={() =>
              handleCardPress(
                item.$id
              )
            }
          />

        )}

        keyExtractor={(item) =>
          item.$id
        }

        contentContainerClassName="pb-32"

        columnWrapperClassName="flex gap-5 px-5"

        showsVerticalScrollIndicator={false}

        ListEmptyComponent={

          loading ? (

            <ActivityIndicator
              size="large"
              className="text-primary-300 mt-5"
            />

          ) : (

            <NoResults />

          )

        }

        ListHeaderComponent={

          <HomeHeader
            user={user}
            latestProperties={
              latestProperties ?? []
            }
            latestPropertiesLoading={
              latestPropertiesLoading
            }
          />

        }

      />

    </SafeAreaView>
  );
};

export default Home;