import {
  Alert,
  FlatList,
  Image,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Dimensions,
} from "react-native";

import {
  router,
  useLocalSearchParams,
} from "expo-router";

import { useEffect, useState } from "react";

import icons from "@/constants/icons";
import images from "@/constants/images";
import Comment from "@/components/Comment";
import { facilities } from "@/constants/data";

import { useAppwrite } from "@/lib/useAppwrite";

import {
  getPropertyById,
  addFavorite,
  isFavorite,
  removeFavorite,
  createReview,
  getPropertyReviews,
} from "@/lib/appwrite";

const Property = () => {
  const { id } =
    useLocalSearchParams<{ id?: string }>();

  const windowHeight =
    Dimensions.get("window").height;

  // =====================================================
  // PROPERTY
  // =====================================================

  const { data: property } =
    useAppwrite({
      fn: getPropertyById,
      params: {
        id: id!,
      },
    });

  console.log(
    "🏠 PROPERTY DATA:",
    property
  );

  // =====================================================
  // FAVORITE
  // =====================================================

  const [favorite, setFavorite] =
    useState(false);

  const [
    favoriteLoading,
    setFavoriteLoading,
  ] = useState(false);

  // =====================================================
  // REVIEWS
  // =====================================================

  const [reviews, setReviews] =
    useState<any[]>([]);

  const [
    reviewsLoading,
    setReviewsLoading,
  ] = useState(false);

  // =====================================================
  // REVIEW MODAL
  // =====================================================

  const [
    reviewModalVisible,
    setReviewModalVisible,
  ] = useState(false);

  const [
    reviewText,
    setReviewText,
  ] = useState("");

  const [
    reviewRating,
    setReviewRating,
  ] = useState(5);

  const [
    reviewLoading,
    setReviewLoading,
  ] = useState(false);

  // =====================================================
  // CHECK FAVORITE
  // =====================================================

  useEffect(() => {
    if (id) {
      checkFavorite();
    }
  }, [id]);

  const checkFavorite = async () => {
    if (!id) return;

    try {
      const result =
        await isFavorite({
          propertyId: id,
        });

      console.log(
        "❤️ CHECK DETAILS FAVORITE:",
        id,
        result
      );

      setFavorite(result);
    } catch (error) {
      console.error(
        "❌ Details Favorite Check Error:",
        error
      );
    }
  };

  // =====================================================
  // TOGGLE FAVORITE
  // =====================================================

  const handleFavorite = async () => {
    if (
      !id ||
      favoriteLoading
    ) {
      return;
    }

    console.log(
      "❤️ DETAILS HEART PRESSED:",
      id
    );

    try {
      setFavoriteLoading(true);

      // REMOVE
      if (favorite) {
        console.log(
          "🗑️ DETAILS REMOVING FAVORITE:",
          id
        );

        const removed =
          await removeFavorite({
            propertyId: id,
          });

        console.log(
          "🗑️ DETAILS REMOVE RESULT:",
          removed
        );

        if (removed) {
          setFavorite(false);
        }

        return;
      }

      // ADD
      console.log(
        "❤️ DETAILS ADDING FAVORITE:",
        id
      );

      const added =
        await addFavorite({
          propertyId: id,
        });

      console.log(
        "❤️ DETAILS ADD RESULT:",
        added
      );

      if (added) {
        setFavorite(true);
      }
    } catch (error) {
      console.error(
        "❌ Details Favorite Error:",
        error
      );
    } finally {
      setFavoriteLoading(false);
    }
  };

  // =====================================================
  // LOAD REVIEWS
  // =====================================================

  const loadReviews = async () => {
    if (!id) return;

    try {
      setReviewsLoading(true);

      console.log(
        "📋 LOADING REVIEWS FOR:",
        id
      );

      const result =
        await getPropertyReviews({
          propertyId: id,
        });

      console.log(
        "📋 REVIEWS RESULT:",
        result
      );

      setReviews(
        Array.isArray(result)
          ? result
          : []
      );
    } catch (error) {
      console.error(
        "❌ LOAD REVIEWS ERROR:",
        error
      );

      setReviews([]);
    } finally {
      setReviewsLoading(false);
    }
  };

  // =====================================================
  // LOAD REVIEWS WHEN PROPERTY ID CHANGES
  // =====================================================

  useEffect(() => {
    if (id) {
      loadReviews();
    }
  }, [id]);

  // =====================================================
  // AVERAGE RATING
  // =====================================================

  const averageRating =
    reviews.length > 0
      ? (
          reviews.reduce(
            (
              total: number,
              item: any
            ) =>
              total +
              Number(
                item?.rating || 0
              ),
            0
          ) / reviews.length
        ).toFixed(1)
      : Number(
          property?.rating || 0
        ).toFixed(1);

  // =====================================================
  // OPEN REVIEW MODAL
  // =====================================================

  const handleOpenReview = () => {
    console.log(
      "⭐ OPEN REVIEW MODAL:",
      id
    );

    setReviewText("");
    setReviewRating(5);

    setReviewModalVisible(true);
  };

  // =====================================================
  // SUBMIT REVIEW
  // =====================================================

  const handleSubmitReview =
    async () => {
      if (!id) {
        Alert.alert(
          "Error",
          "Property ID not found."
        );

        return;
      }

      if (!reviewText.trim()) {
        Alert.alert(
          "Review Required",
          "Please write a review first."
        );

        return;
      }

      if (reviewLoading) {
        return;
      }

      try {
        setReviewLoading(true);

        console.log(
          "⭐ SUBMIT REVIEW PRESSED"
        );

        console.log(
          "🏠 PROPERTY ID:",
          id
        );

        console.log(
          "⭐ RATING:",
          reviewRating
        );

        console.log(
          "💬 REVIEW:",
          reviewText
        );

        const result =
          await createReview({
            propertyId: id,
            review:
              reviewText.trim(),
            rating: reviewRating,
          });

        if (result) {
          console.log(
            "⭐ REVIEW CREATED:",
            result
          );

          setReviewText("");
          setReviewRating(5);
          setReviewModalVisible(
            false
          );

          await loadReviews();

          Alert.alert(
            "Success",
            "Your review has been submitted."
          );
        } else {
          Alert.alert(
            "Error",
            "Failed to submit review."
          );
        }
      } catch (error) {
        console.error(
          "❌ REVIEW SUBMIT ERROR:",
          error
        );

        Alert.alert(
          "Error",
          "Something went wrong while submitting your review."
        );
      } finally {
        setReviewLoading(false);
      }
    };

  // =====================================================
  // UI
  // =====================================================

  return (
    <View className="flex-1 bg-white">

      <ScrollView
        showsVerticalScrollIndicator={
          false
        }
        contentContainerClassName="pb-32 bg-white"
      >

        {/* =================================================
            HERO IMAGE
        ================================================= */}

        <View
          className="relative w-full"
          style={{
            height:
              windowHeight / 2,
          }}
        >

          <Image
            source={{
              uri: property?.image,
            }}
            className="size-full"
            resizeMode="cover"
          />

          <Image
            source={
              images.whiteGradient
            }
            className="absolute top-0 w-full z-40"
          />

          {/* =================================================
              TOP BUTTONS
          ================================================= */}

          <View
            className="z-50 absolute inset-x-7"
            style={{
              top:
                Platform.OS === "ios"
                  ? 70
                  : 20,
            }}
          >

            <View className="flex flex-row items-center w-full justify-between">

              {/* BACK */}

              <TouchableOpacity
                onPress={() =>
                  router.back()
                }
                className="flex flex-row bg-primary-200 rounded-full size-11 items-center justify-center"
              >

                <Image
                  source={
                    icons.backArrow
                  }
                  className="size-5"
                />

              </TouchableOpacity>

              {/* HEART + REVIEW */}

              <View className="flex flex-row items-center gap-3">

                {/* FAVORITE */}

                <Pressable
                  onPress={
                    handleFavorite
                  }
                  disabled={
                    favoriteLoading
                  }
                  hitSlop={12}
                  className="bg-white/90 rounded-full size-11 items-center justify-center"
                >

                  <Image
                    source={
                      icons.heartFilled
                        ? favorite
                          ? icons.heartFilled
                          : icons.heart
                        : icons.heart
                    }
                    className="size-6"
                    tintColor={
                      favorite
                        ? "#FF0000"
                        : "#191D31"
                    }
                  />

                </Pressable>

                {/* REVIEW */}

                <TouchableOpacity
                  onPress={
                    handleOpenReview
                  }
                  className="bg-white/90 rounded-full size-11 items-center justify-center"
                >

                  <Image
                    source={
                      icons.send
                    }
                    className="size-6"
                  />

                </TouchableOpacity>

              </View>

            </View>

          </View>
        </View>

        {/* =================================================
            PROPERTY INFORMATION
        ================================================= */}

        <View className="px-5 mt-7 flex gap-2">

          <Text className="text-2xl font-rubik-extrabold">
            {property?.name}
          </Text>

          <View className="flex flex-row items-center gap-3">

            <View className="flex flex-row items-center px-4 py-2 bg-primary-100 rounded-full">

              <Text className="text-xs font-rubik-bold text-primary-300">
                {property?.type}
              </Text>

            </View>

            <View className="flex flex-row items-center gap-2">

              <Image
                source={
                  icons.star
                }
                className="size-5"
              />

              <Text className="text-black-200 text-sm mt-1 font-rubik-medium">
                {averageRating} (
                {reviews.length}{" "}
                reviews)
              </Text>

            </View>

          </View>

          {/* =================================================
              BED / BATH / AREA
          ================================================= */}

          <View className="flex flex-row items-center mt-5">

            <View className="flex flex-row items-center justify-center bg-primary-100 rounded-full size-10">

              <Image
                source={icons.bed}
                className="size-4"
              />

            </View>

            <Text className="text-black-300 text-sm font-rubik-medium ml-2">
              {property?.bedrooms} Beds
            </Text>

            <View className="flex flex-row items-center justify-center bg-primary-100 rounded-full size-10 ml-7">

              <Image
                source={icons.bath}
                className="size-4"
              />

            </View>

            <Text className="text-black-300 text-sm font-rubik-medium ml-2">
              {property?.bathrooms} Baths
            </Text>

            <View className="flex flex-row items-center justify-center bg-primary-100 rounded-full size-10 ml-7">

              <Image
                source={icons.area}
                className="size-4"
              />

            </View>

            <Text className="text-black-300 text-sm font-rubik-medium ml-2">
              {property?.area} sqft
            </Text>

          </View>

          {/* =================================================
              AGENT
          ================================================= */}

          <View className="w-full border-t border-primary-200 pt-7 mt-5">

            <Text className="text-black-300 text-xl font-rubik-bold">
              Agent
            </Text>

            <View className="flex flex-row items-center justify-between mt-4">

              <View className="flex flex-row items-center">

                <Image
                  source={{
                    uri:
                      property?.agent
                        ?.avatar,
                  }}
                  className="size-14 rounded-full"
                />

                <View className="flex flex-col items-start justify-center ml-3">

                  <Text className="text-lg text-black-300 text-start font-rubik-bold">
                    {
                      property
                        ?.agent
                        ?.name
                    }
                  </Text>

                  <Text className="text-sm text-black-200 text-start font-rubik-medium">
                    {
                      property
                        ?.agent
                        ?.email
                    }
                  </Text>

                </View>

              </View>

              <View className="flex flex-row items-center gap-3">

                <Image
                  source={
                    icons.chat
                  }
                  className="size-7"
                />

                <Image
                  source={
                    icons.phone
                  }
                  className="size-7"
                />

              </View>

            </View>

          </View>

          {/* =================================================
              OVERVIEW
          ================================================= */}

          <View className="mt-7">

            <Text className="text-black-300 text-xl font-rubik-bold">
              Overview
            </Text>

            <Text className="text-black-200 text-base font-rubik mt-2">
              {property?.description}
            </Text>

          </View>

          {/* =================================================
              FACILITIES
          ================================================= */}

          <View className="mt-7">

            <Text className="text-black-300 text-xl font-rubik-bold">
              Facilities
            </Text>

            {property?.facilities
              ?.length > 0 && (

              <View className="flex flex-row flex-wrap items-start justify-start mt-2 gap-5">

                {property?.facilities?.map(
                  (
                    item: string,
                    index: number
                  ) => {

                    const facility =
                      facilities.find(
                        (
                          facility
                        ) =>
                          facility.title ===
                          item
                      );

                    return (
                      <View
                        key={index}
                        className="flex flex-1 flex-col items-center min-w-16 max-w-20"
                      >

                        <View className="size-14 bg-primary-100 rounded-full flex items-center justify-center">

                          <Image
                            source={
                              facility
                                ? facility.icon
                                : icons.info
                            }
                            className="size-6"
                          />

                        </View>

                        <Text
                          numberOfLines={
                            1
                          }
                          ellipsizeMode="tail"
                          className="text-black-300 text-sm text-center font-rubik mt-1.5"
                        >
                          {item}
                        </Text>

                      </View>
                    );
                  }
                )}

              </View>
            )}

          </View>

          {/* =================================================
              GALLERY
          ================================================= */}

          {property?.galleries
            ?.length > 0 && (

            <View className="mt-7">

              <Text className="text-black-300 text-xl font-rubik-bold">
                Gallery
              </Text>

              <FlatList
                contentContainerStyle={{
                  paddingRight: 20,
                }}
                data={
                  property?.galleries ??
                  []
                }
                keyExtractor={(
                  item
                ) => item.$id}
                horizontal
                showsHorizontalScrollIndicator={
                  false
                }
                renderItem={({
                  item,
                }) => (
                  <Image
                    source={{
                      uri: item.image,
                    }}
                    className="size-40 rounded-xl"
                  />
                )}
                contentContainerClassName="flex gap-4 mt-3"
              />

            </View>
          )}

          {/* =================================================
              LOCATION
          ================================================= */}

          <View className="mt-7">

            <Text className="text-black-300 text-xl font-rubik-bold">
              Location
            </Text>

            <View className="flex flex-row items-center justify-start mt-4 gap-2">

              <Image
                source={
                  icons.location
                }
                className="w-7 h-7"
              />

              <Text className="text-black-200 text-sm font-rubik-medium">
                {property?.address}
              </Text>

            </View>

            <Image
              source={images.map}
              className="h-52 w-full mt-5 rounded-xl"
            />

          </View>

          {/* =================================================
              REVIEWS
          ================================================= */}

          <View className="mt-7">

            <View className="flex flex-row items-center justify-between">

              <View className="flex flex-row items-center">

                <Image
                  source={
                    icons.star
                  }
                  className="size-6"
                />

                <Text className="text-black-300 text-xl font-rubik-bold ml-2">
                  {averageRating} (
                  {reviews.length}{" "}
                  reviews)
                </Text>

              </View>

              <TouchableOpacity
                onPress={
                  handleOpenReview
                }
              >

                <Text className="text-primary-300 text-base font-rubik-bold">
                  Write Review
                </Text>

              </TouchableOpacity>

            </View>

            {reviewsLoading ? (

              <Text className="text-black-200 font-rubik mt-5">
                Loading reviews...
              </Text>

            ) : reviews.length ===
              0 ? (

              <Text className="text-black-200 font-rubik mt-5">
                No reviews yet.
              </Text>

            ) : (

              <View className="mt-5">

                {reviews.map(
                  (
                    review
                  ) => (

                    <View
                      key={
                        review.$id
                      }
                      className="mb-5"
                    >

                      <Comment
                        item={
                          review
                        }
                      />

                    </View>

                  )
                )}

              </View>

            )}

          </View>

        </View>

      </ScrollView>

      {/* =====================================================
          BOTTOM BOOK NOW
      ===================================================== */}

      <View className="absolute bg-white bottom-0 w-full rounded-t-2xl border-t border-r border-l border-primary-200 p-7">

        <View className="flex flex-row items-center justify-between gap-10">

          <View className="flex flex-col items-start">

            <Text className="text-black-200 text-xs font-rubik-medium">
              Price
            </Text>

            <Text
              numberOfLines={1}
              className="text-primary-300 text-start text-2xl font-rubik-bold"
            >
              ${property?.price}
            </Text>

          </View>

          {/* BOOK NOW */}

          <TouchableOpacity
            onPress={() => {
              if (!id) {
                Alert.alert(
                  "Error",
                  "Property ID not found."
                );
                return;
              }

              console.log(
                "🏠 BOOK NOW PRESSED:",
                id
              );

              router.push({
                pathname:
                  "/booking/[id]",
                params: {
                  id: id,
                },
              });
            }}
            className="flex-1 flex flex-row items-center justify-center bg-primary-300 py-3 rounded-full shadow-md shadow-zinc-400"
          >

            <Text className="text-white text-lg text-center font-rubik-bold">
              Book Now
            </Text>

          </TouchableOpacity>

        </View>

      </View>

      {/* =====================================================
          REVIEW MODAL
      ===================================================== */}

      <Modal
        visible={
          reviewModalVisible
        }
        transparent
        animationType="slide"
        onRequestClose={() =>
          setReviewModalVisible(
            false
          )
        }
      >

        <View className="flex-1 justify-end bg-black/50">

          <View className="bg-white rounded-t-3xl px-6 pt-6 pb-10">

            {/* HEADER */}

            <View className="flex flex-row items-center justify-between">

              <Text className="text-2xl font-rubik-bold text-black-300">
                Write Review
              </Text>

              <TouchableOpacity
                onPress={() =>
                  setReviewModalVisible(
                    false
                  )
                }
                className="bg-gray-100 rounded-full size-10 items-center justify-center"
              >

                <Text className="text-xl font-rubik-bold text-black-300">
                  ×
                </Text>

              </TouchableOpacity>

            </View>

            {/* RATING */}

            <Text className="text-black-300 text-base font-rubik-bold mt-6">
              Your Rating
            </Text>

            <View className="flex flex-row items-center mt-3">

              {[1, 2, 3, 4, 5].map(
                (star) => (

                  <TouchableOpacity
                    key={star}
                    onPress={() =>
                      setReviewRating(
                        star
                      )
                    }
                    className="mr-3"
                  >

                    <Image
                      source={
                        icons.star
                      }
                      className="size-9"
                      tintColor={
                        star <=
                        reviewRating
                          ? "#FFB800"
                          : "#D1D5DB"
                      }
                    />

                  </TouchableOpacity>

                )
              )}

            </View>

            {/* REVIEW TEXT */}

            <Text className="text-black-300 text-base font-rubik-bold mt-6">
              Your Review
            </Text>

            <TextInput
              value={reviewText}
              onChangeText={
                setReviewText
              }
              placeholder="Write your review..."
              placeholderTextColor="#9CA3AF"
              multiline
              textAlignVertical="top"
              className="border border-primary-200 rounded-2xl mt-3 px-4 py-4 text-black-300 font-rubik"
              style={{
                minHeight: 130,
              }}
            />

            {/* SUBMIT */}

            <TouchableOpacity
              onPress={
                handleSubmitReview
              }
              disabled={
                reviewLoading
              }
              className={`mt-5 rounded-full py-4 items-center justify-center ${
                reviewLoading
                  ? "bg-gray-400"
                  : "bg-primary-300"
              }`}
            >

              <Text className="text-white text-lg font-rubik-bold">

                {reviewLoading
                  ? "Submitting..."
                  : "Submit Review"}

              </Text>

            </TouchableOpacity>

          </View>

        </View>

      </Modal>

    </View>
  );
};

export default Property;