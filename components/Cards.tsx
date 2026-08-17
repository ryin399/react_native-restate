import icons from "@/constants/icons";
import images from "@/constants/images";
import {
  Image,
  Text,
  TouchableOpacity,
  View,
  Pressable,
} from "react-native";
import { Models } from "react-native-appwrite";
import { useEffect, useState } from "react";

import {
  addFavorite,
  isFavorite,
  removeFavorite,
} from "@/lib/appwrite";

interface Props {
  item: Models.Document;
  onPress?: () => void;
}

// =====================================================
// BDT PRICE FORMAT
// =====================================================

const formatBDT = (price: any) => {
  if (
    price === null ||
    price === undefined ||
    price === ""
  ) {
    return "৳ 0";
  }

  const numericPrice =
    Number(
      String(price).replace(/,/g, "")
    );

  if (Number.isNaN(numericPrice)) {
    return `৳ ${price}`;
  }

  return `৳ ${numericPrice.toLocaleString(
    "en-IN"
  )}`;
};

// =====================================================
// FEATURED CARD
// =====================================================

export const FeaturedCard = ({
  item,
  onPress,
}: Props) => {
  const [favorite, setFavorite] =
    useState(false);

  const [loading, setLoading] =
    useState(false);

  // -----------------------------------------------------
  // CHECK FAVORITE
  // -----------------------------------------------------

  useEffect(() => {
    checkFavorite();
  }, [item.$id]);

  const checkFavorite = async () => {
    try {
      const result =
        await isFavorite({
          propertyId: item.$id,
        });

      console.log(
        "❤️ CHECK FEATURED FAVORITE:",
        item.$id,
        result
      );

      setFavorite(result);
    } catch (error) {
      console.error(
        "❌ Featured Favorite Check Error:",
        error
      );
    }
  };

  // -----------------------------------------------------
  // TOGGLE FAVORITE
  // -----------------------------------------------------

  const handleFavorite = async () => {
    if (loading) return;

    console.log(
      "❤️ HEART PRESSED FEATURED:",
      item.$id
    );

    try {
      setLoading(true);

      if (favorite) {
        console.log(
          "🗑️ REMOVING FEATURED FAVORITE:",
          item.$id
        );

        const removed =
          await removeFavorite({
            propertyId: item.$id,
          });

        console.log(
          "🗑️ REMOVE RESULT:",
          removed
        );

        if (removed) {
          setFavorite(false);
        }
      } else {
        console.log(
          "❤️ ADDING FEATURED FAVORITE:",
          item.$id
        );

        const added =
          await addFavorite({
            propertyId: item.$id,
          });

        console.log(
          "❤️ ADD RESULT:",
          added
        );

        if (added) {
          setFavorite(true);
        }
      }
    } catch (error) {
      console.error(
        "❌ Featured Favorite Error:",
        error
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      className="flex flex-col items-start w-60 h-80 relative"
    >
      {/* ==========================================
          PROPERTY IMAGE
      ========================================== */}

      <Image
        source={{
          uri: item.image,
        }}
        className="w-full h-full rounded-2xl"
        resizeMode="cover"
      />

      {/* ==========================================
          GRADIENT
      ========================================== */}

      <Image
        source={images.cardGradient}
        className="size-full rounded-2xl absolute bottom-0"
      />

      {/* ==========================================
          RATING
      ========================================== */}

      <View className="flex flex-row items-center bg-white/90 px-3 py-1.5 rounded-full absolute top-5 right-5">
        <Image
          source={icons.star}
          className="size-3.5"
        />

        <Text className="text-xs font-rubik-bold text-primary-300 ml-1">
          {item.rating}
        </Text>
      </View>

      {/* ==========================================
          PROPERTY INFORMATION
      ========================================== */}

      <View className="flex flex-col items-start absolute bottom-5 inset-x-5">

        <Text
          className="text-xl font-rubik-extrabold text-white"
          numberOfLines={1}
        >
          {item.name}
        </Text>

        <Text
          className="text-base font-rubik text-white"
          numberOfLines={1}
        >
          {item.address}
        </Text>

        <View className="flex flex-row items-center justify-between w-full">

          {/* BDT PRICE */}

          <Text className="text-xl font-rubik-extrabold text-white">
            {formatBDT(item.price)}
          </Text>

          {/* FEATURED HEART */}

          <Pressable
            onPress={(event) => {
              event.stopPropagation();
              handleFavorite();
            }}
            disabled={loading}
            hitSlop={12}
            className="p-2"
          >
            <Image
              source={
                favorite
                  ? icons.heartFilled
                  : icons.heart
              }
              className="size-5"
              tintColor={
                favorite
                  ? undefined
                  : "#FFFFFF"
              }
            />
          </Pressable>

        </View>
      </View>
    </TouchableOpacity>
  );
};

// =====================================================
// NORMAL PROPERTY CARD
// =====================================================

export const Card = ({
  item,
  onPress,
}: Props) => {
  const [favorite, setFavorite] =
    useState(false);

  const [loading, setLoading] =
    useState(false);

  // -----------------------------------------------------
  // CHECK FAVORITE
  // -----------------------------------------------------

  useEffect(() => {
    checkFavorite();
  }, [item.$id]);

  const checkFavorite = async () => {
    try {
      const result =
        await isFavorite({
          propertyId: item.$id,
        });

      console.log(
        "❤️ CHECK FAVORITE:",
        item.$id,
        result
      );

      setFavorite(result);
    } catch (error) {
      console.error(
        "❌ Favorite Check Error:",
        error
      );
    }
  };

  // -----------------------------------------------------
  // TOGGLE FAVORITE
  // -----------------------------------------------------

  const handleFavorite = async () => {
    if (loading) return;

    console.log(
      "❤️ HEART PRESSED:",
      item.$id
    );

    try {
      setLoading(true);

      // -----------------------------------------------
      // REMOVE
      // -----------------------------------------------

      if (favorite) {
        console.log(
          "🗑️ REMOVING FAVORITE:",
          item.$id
        );

        const removed =
          await removeFavorite({
            propertyId: item.$id,
          });

        console.log(
          "🗑️ REMOVE RESULT:",
          removed
        );

        if (removed) {
          setFavorite(false);
        }

        return;
      }

      // -----------------------------------------------
      // ADD
      // -----------------------------------------------

      console.log(
        "❤️ ADDING FAVORITE:",
        item.$id
      );

      const added =
        await addFavorite({
          propertyId: item.$id,
        });

      console.log(
        "❤️ ADD RESULT:",
        added
      );

      if (added) {
        setFavorite(true);
      }
    } catch (error) {
      console.error(
        "❌ Favorite Error:",
        error
      );
    } finally {
      setLoading(false);
    }
  };

  // ===================================================
  // UI
  // ===================================================

  return (
    <TouchableOpacity
      onPress={onPress}
      className="flex-1 bg-white rounded-xl shadow-sm p-2 mb-4 h-[245px]"
    >
      {/* ==========================================
          RATING
      ========================================== */}

      <View className="absolute top-3 right-3 z-10 flex flex-row items-center bg-white px-2 py-1 rounded-full">

        <Image
          source={icons.star}
          className="size-3"
        />

        <Text className="text-xs font-rubik-bold text-primary-300 ml-1">
          {item.rating}
        </Text>

      </View>

      {/* ==========================================
          PROPERTY IMAGE
      ========================================== */}

      <Image
        source={{
          uri: item.image,
        }}
        className="w-full h-40 rounded-lg"
        resizeMode="cover"
      />

      {/* ==========================================
          PROPERTY INFORMATION
      ========================================== */}

      <View className="flex flex-col mt-2">

        <Text
          className="text-base font-rubik-bold text-black-300"
          numberOfLines={1}
        >
          {item.name}
        </Text>

        <Text
          className="text-xs font-rubik text-black-100"
          numberOfLines={1}
        >
          {item.address}
        </Text>

        {/* ==========================================
            PRICE + HEART
        ========================================== */}

        <View className="flex flex-row items-center justify-between mt-1">

          {/* BDT PRICE */}

          <Text
            className="text-base font-rubik-bold text-primary-300"
            numberOfLines={1}
          >
            {formatBDT(item.price)}
          </Text>

          {/* NORMAL CARD HEART */}

          <Pressable
            onPress={(event) => {
              event.stopPropagation();
              handleFavorite();
            }}
            disabled={loading}
            hitSlop={12}
            className="p-2"
          >
            <Image
              source={
                favorite
                  ? icons.heartFilled
                  : icons.heart
              }
              className="w-5 h-5"
              tintColor={
                favorite
                  ? undefined
                  : "#191D31"
              }
            />
          </Pressable>

        </View>
      </View>
    </TouchableOpacity>
  );
};