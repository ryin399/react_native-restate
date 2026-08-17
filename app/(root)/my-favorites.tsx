import {
  ActivityIndicator,
  FlatList,
  Image,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import {
  router,
} from "expo-router";

import {
  SafeAreaView,
} from "react-native-safe-area-context";

import {
  useEffect,
  useState,
} from "react";

import icons from "@/constants/icons";

import {
  getFavorites,
  getPropertyById,
} from "@/lib/appwrite";

import {
  Card,
} from "@/components/Cards";

const MyFavorites = () => {

  const [
    properties,
    setProperties,
  ] = useState<any[]>([]);

  const [
    loading,
    setLoading,
  ] = useState(true);

  // ==========================================
  // FETCH MY FAVOURITES
  // ==========================================

  const fetchFavorites = async () => {
    try {
      setLoading(true);

      console.log(
        "❤️ FETCHING MY FAVOURITES..."
      );

      // Get favorite records
      const favorites =
        await getFavorites();

      console.log(
        "❤️ FAVORITES:",
        favorites
      );

      if (
        !favorites ||
        favorites.length === 0
      ) {
        setProperties([]);
        return;
      }

      // ==========================================
      // GET ACTUAL PROPERTY DATA
      // ==========================================

      const propertyResults =
        await Promise.all(
          favorites.map(
            async (favorite) => {

              if (
                !favorite.propertyId
              ) {
                return null;
              }

              const property =
                await getPropertyById({
                  id: favorite.propertyId,
                });

              return property;
            }
          )
        );

      const validProperties =
        propertyResults.filter(
          (property) =>
            property !== null
        );

      console.log(
        "🏠 FAVOURITE PROPERTIES:",
        validProperties
      );

      setProperties(
        validProperties
      );

    } catch (error) {

      console.error(
        "❌ FETCH FAVOURITES ERROR:",
        error
      );

      setProperties([]);

    } finally {

      setLoading(false);

    }
  };

  // ==========================================
  // LOAD ON SCREEN OPEN
  // ==========================================

  useEffect(() => {
    fetchFavorites();
  }, []);

  // ==========================================
  // PROPERTY PRESS
  // ==========================================

  const handlePropertyPress = (
    id: string
  ) => {
    router.push(
      `/properties/${id}`
    );
  };

  // ==========================================
  // HEADER
  // ==========================================

  const renderHeader = () => (
    <View className="px-5">

      <View className="flex flex-row items-center mt-5">

        <TouchableOpacity
          onPress={() =>
            router.back()
          }
          className="mr-4"
          hitSlop={10}
        >
          <Image
            source={icons.backArrow}
            className="size-6"
          />
        </TouchableOpacity>

        <Text className="text-2xl font-rubik-bold text-black-300">
          My Favourites
        </Text>

      </View>

      {!loading &&
        properties.length > 0 && (
          <Text className="text-sm font-rubik text-black-200 mt-2">
            {properties.length}{" "}
            {properties.length === 1
              ? "property"
              : "properties"}{" "}
            saved
          </Text>
        )}

    </View>
  );

  // ==========================================
  // LOADING
  // ==========================================

  if (loading) {
    return (
      <SafeAreaView className="h-full bg-white">

        {renderHeader()}

        <View className="flex-1 justify-center items-center">

          <ActivityIndicator
            size="large"
            className="text-primary-300"
          />

          <Text className="text-base font-rubik text-black-200 mt-3">
            Loading your favourites...
          </Text>

        </View>

      </SafeAreaView>
    );
  }

  // ==========================================
  // EMPTY
  // ==========================================

  if (
    !loading &&
    properties.length === 0
  ) {
    return (
      <SafeAreaView className="h-full bg-white">

        {renderHeader()}

        <View className="flex-1 justify-center items-center px-10">

          <Text className="text-5xl">
            ❤️
          </Text>

          <Text className="text-xl font-rubik-bold text-black-300 text-center mt-5">
            No Favourites Yet
          </Text>

          <Text className="text-base font-rubik text-black-200 text-center mt-2">
            Save properties you love and they will appear here.
          </Text>

          <TouchableOpacity
            onPress={() =>
              router.push("/")
            }
            className="bg-primary-300 rounded-full px-8 py-4 mt-6"
          >
            <Text className="text-white text-base font-rubik-medium">
              Explore Properties
            </Text>
          </TouchableOpacity>

        </View>

      </SafeAreaView>
    );
  }

  // ==========================================
  // MAIN
  // ==========================================

  return (
    <SafeAreaView className="h-full bg-white">

      <FlatList
        data={properties}
        numColumns={2}

        renderItem={({
          item,
        }) => (
          <Card
            item={item}
            onPress={() =>
              handlePropertyPress(
                item.$id
              )
            }
          />
        )}

        keyExtractor={(
          item
        ) =>
          item.$id
        }

        ListHeaderComponent={
          renderHeader
        }

        contentContainerClassName="pb-32"

        columnWrapperClassName="flex gap-5 px-5"

        showsVerticalScrollIndicator={
          false
        }

        refreshing={loading}

        onRefresh={
          fetchFavorites
        }
      />

    </SafeAreaView>
  );
};

export default MyFavorites;