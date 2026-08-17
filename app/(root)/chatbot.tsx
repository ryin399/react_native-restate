import {
  FlatList,
  Image,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ActivityIndicator,
} from "react-native";

import { useState } from "react";
import { router } from "expo-router";

import icons from "@/constants/icons";

interface Message {
  id: string;
  text: string;
  sender: "user" | "ai";
}

const FUNCTION_URL =
  "https://6a8214ae003a8f4497da.fra.appwrite.run";

const Chatbot = () => {
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      text:
        "Hi! 👋 I'm Real State AI Assistant. How can I help you find your ideal property?",
      sender: "ai",
    },
  ]);

  // ==========================================
  // SEND MESSAGE
  // ==========================================

  const handleSend = async () => {
    const trimmedMessage = message.trim();

    if (!trimmedMessage || loading) return;

    // USER MESSAGE
    const userMessage: Message = {
      id: `${Date.now()}-user`,
      text: trimmedMessage,
      sender: "user",
    };

    setMessages((previous) => [
      ...previous,
      userMessage,
    ]);

    setMessage("");
    setLoading(true);

    try {
      // ==========================================
      // CALL APPWRITE FUNCTION
      // ==========================================

      const response = await fetch(FUNCTION_URL, {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          message: trimmedMessage,
        }),
      });

      // ==========================================
      // GET RESPONSE TEXT
      // ==========================================

      const responseText = await response.text();

      console.log(
        "Appwrite status:",
        response.status
      );

      console.log(
        "Appwrite response:",
        responseText
      );

      // ==========================================
      // HTTP ERROR
      // ==========================================

      if (!response.ok) {
        throw new Error(
          `HTTP ${response.status}: ${responseText}`
        );
      }

      // ==========================================
      // PARSE JSON
      // ==========================================

      let data: {
        success?: boolean;
        reply?: string;
        error?: string;
      };

      try {
        data = JSON.parse(responseText);
      } catch {
        throw new Error(
          "Invalid JSON response from Appwrite"
        );
      }

      // ==========================================
      // APPWRITE FUNCTION ERROR
      // ==========================================

      if (!data.success) {
        throw new Error(
          data.error ||
            "Appwrite function returned an error"
        );
      }

      // ==========================================
      // AI REPLY
      // ==========================================

      const aiReply =
        data.reply ||
        "Sorry, I couldn't generate a response.";

      const aiMessage: Message = {
        id: `${Date.now()}-ai`,
        text: aiReply,
        sender: "ai",
      };

      setMessages((previous) => [
        ...previous,
        aiMessage,
      ]);
    } catch (error) {
      console.error(
        "Real State AI error:",
        error
      );

      const errorMessage: Message = {
        id: `${Date.now()}-error`,
        text:
          "Sorry 😔 I couldn't connect to the AI right now. Please try again.",
        sender: "ai",
      };

      setMessages((previous) => [
        ...previous,
        errorMessage,
      ]);
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // MESSAGE ITEM
  // ==========================================

  const renderMessage = ({
    item,
  }: {
    item: Message;
  }) => {
    const isUser =
      item.sender === "user";

    return (
      <View
        className={`flex flex-row mb-4 ${
          isUser
            ? "justify-end"
            : "justify-start"
        }`}
      >
        <View
          className={`max-w-[82%] rounded-2xl px-4 py-3 ${
            isUser
              ? "bg-primary-300 rounded-br-sm"
              : "bg-primary-100 rounded-bl-sm"
          }`}
        >
          <Text
            className={`text-base font-rubik ${
              isUser
                ? "text-white"
                : "text-black-300"
            }`}
          >
            {item.text}
          </Text>
        </View>
      </View>
    );
  };

  // ==========================================
  // UI
  // ==========================================

  return (
    <SafeAreaView className="flex-1 bg-white">

      <KeyboardAvoidingView
        className="flex-1"
        behavior={
          Platform.OS === "ios"
            ? "padding"
            : undefined
        }
        keyboardVerticalOffset={10}
      >

        {/* ==========================================
            HEADER
        ========================================== */}

        <View className="flex flex-row items-center justify-between px-5 py-4 border-b border-primary-100">

          <TouchableOpacity
            onPress={() => router.back()}
            className="bg-primary-100 rounded-full size-11 items-center justify-center"
            activeOpacity={0.7}
          >
            <Image
              source={icons.backArrow}
              className="size-5"
              resizeMode="contain"
            />
          </TouchableOpacity>

          <View className="flex flex-row items-center">

            <View className="bg-primary-100 rounded-full size-10 items-center justify-center">
              <Text className="text-lg">
                🤖
              </Text>
            </View>

            <View className="ml-3">

              <Text className="text-lg font-rubik-bold text-black-300">
                Real State AI
              </Text>

              <Text className="text-xs font-rubik text-green-600">
                {loading
                  ? "Thinking..."
                  : "Online"}
              </Text>

            </View>

          </View>

          <View className="size-11" />

        </View>

        {/* ==========================================
            CHAT MESSAGES
        ========================================== */}

        <FlatList
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item) =>
            item.id
          }
          contentContainerStyle={{
            paddingHorizontal: 20,
            paddingTop: 20,
            paddingBottom: 20,
          }}
          showsVerticalScrollIndicator={false}
        />

        {/* ==========================================
            INPUT
        ========================================== */}

        <View className="flex flex-row items-center px-4 py-3 border-t border-primary-100 bg-white">

          <View className="flex-1 bg-primary-100 rounded-full px-5 py-3 mr-3">

            <TextInput
              value={message}
              onChangeText={setMessage}
              placeholder="Ask about properties..."
              placeholderTextColor="#8C8E98"
              className="text-base font-rubik text-black-300"
              multiline
              maxLength={500}
              editable={!loading}
            />

          </View>

          <TouchableOpacity
            onPress={handleSend}
            disabled={
              !message.trim() ||
              loading
            }
            activeOpacity={0.7}
            className={`rounded-full size-12 items-center justify-center ${
              message.trim() &&
              !loading
                ? "bg-primary-300"
                : "bg-primary-100"
            }`}
          >

            {loading ? (
              <ActivityIndicator
                size="small"
                color="#8C8E98"
              />
            ) : (
              <Text
                className={`text-xl ${
                  message.trim()
                    ? "text-white"
                    : "text-black-200"
                }`}
              >
                ➤
              </Text>
            )}

          </TouchableOpacity>

        </View>

      </KeyboardAvoidingView>

    </SafeAreaView>
  );
};

export default Chatbot;