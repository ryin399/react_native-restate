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

const Language = () => {
  const languages = [
    {
      id: "english",
      title: "English",
      subtitle: "English",
    },
    {
      id: "bangla",
      title: "বাংলা",
      subtitle: "Bangla",
    },
  ];

  // আপাতত English selected থাকবে
  const selectedLanguage = "english";

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
            Language
          </Text>

          <View className="size-11" />

        </View>

        {/* ==========================================
            TITLE
        ========================================== */}

        <View className="mt-10">

          <Text className="text-2xl font-rubik-bold text-black-300">
            Choose Language
          </Text>

          <Text className="text-sm font-rubik text-black-200 mt-2">
            Select your preferred language
          </Text>

        </View>

        {/* ==========================================
            LANGUAGE OPTIONS
        ========================================== */}

        <View className="mt-7">

          {languages.map((language) => {

            const selected =
              selectedLanguage ===
              language.id;

            return (
              <TouchableOpacity
                key={language.id}
                className={`flex flex-row items-center justify-between p-5 rounded-2xl mb-4 border ${
                  selected
                    ? "border-primary-300 bg-primary-100"
                    : "border-primary-200 bg-white"
                }`}
              >

                <View className="flex flex-row items-center">

                  {/* LANGUAGE ICON */}

                  <View className="size-12 rounded-full bg-white items-center justify-center">

                    <Text className="text-xl">
                      🌐
                    </Text>

                  </View>

                  {/* LANGUAGE NAME */}

                  <View className="ml-4">

                    <Text className="text-lg font-rubik-bold text-black-300">
                      {language.title}
                    </Text>

                    <Text className="text-sm font-rubik text-black-200 mt-1">
                      {language.subtitle}
                    </Text>

                  </View>

                </View>

                {/* CHECK */}

                {selected && (
                  <View className="bg-primary-300 rounded-full size-7 items-center justify-center">

                    <Text className="text-white text-base font-rubik-bold">
                      ✓
                    </Text>

                  </View>
                )}

              </TouchableOpacity>
            );
          })}

        </View>

      </ScrollView>

    </SafeAreaView>
  );
};

export default Language;
