import {
  Alert,
  Image,
  SafeAreaView,
  ScrollView,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { router } from "expo-router";
import { useState } from "react";

import icons from "@/constants/icons";

const Security = () => {
  // ==========================================
  // STATES
  // ==========================================

  const [
    biometricEnabled,
    setBiometricEnabled,
  ] = useState(false);

  const [
    rememberMe,
    setRememberMe,
  ] = useState(true);

  const [
    changePasswordVisible,
    setChangePasswordVisible,
  ] = useState(false);

  const [
    currentPassword,
    setCurrentPassword,
  ] = useState("");

  const [
    newPassword,
    setNewPassword,
  ] = useState("");

  const [
    confirmPassword,
    setConfirmPassword,
  ] = useState("");

  // ==========================================
  // CHANGE PASSWORD
  // ==========================================

  const handleChangePassword =
    () => {
      if (!currentPassword) {
        Alert.alert(
          "Required",
          "Please enter your current password."
        );
        return;
      }

      if (!newPassword) {
        Alert.alert(
          "Required",
          "Please enter a new password."
        );
        return;
      }

      if (
        newPassword.length < 8
      ) {
        Alert.alert(
          "Invalid Password",
          "Password must be at least 8 characters."
        );
        return;
      }

      if (
        newPassword !==
        confirmPassword
      ) {
        Alert.alert(
          "Password Mismatch",
          "New password and confirm password do not match."
        );
        return;
      }

      Alert.alert(
        "Success",
        "Your password has been changed successfully."
      );

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");

      setChangePasswordVisible(
        false
      );
    };

  // ==========================================
  // LOGOUT ALL DEVICES
  // ==========================================

  const handleLogoutAll =
    () => {
      Alert.alert(
        "Logout All Devices",
        "Are you sure you want to logout from all devices?",
        [
          {
            text: "Cancel",
            style: "cancel",
          },
          {
            text: "Logout",
            style: "destructive",
            onPress: () => {
              Alert.alert(
                "Success",
                "You have been logged out from all other devices."
              );
            },
          },
        ]
      );
    };

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
            onPress={() =>
              router.back()
            }
            className="bg-primary-100 rounded-full size-11 items-center justify-center"
          >
            <Image
              source={
                icons.backArrow
              }
              className="size-5"
            />
          </TouchableOpacity>

          <Text className="text-xl font-rubik-bold text-black-300">
            Security
          </Text>

          <View className="size-11" />

        </View>

        {/* ==========================================
            ACCOUNT SECURITY
        ========================================== */}

        <View className="mt-8">

          <Text className="text-xl font-rubik-bold text-black-300">
            Account Security
          </Text>

          <Text className="text-sm font-rubik text-black-200 mt-2">
            Manage your account security and privacy.
          </Text>

        </View>

        {/* ==========================================
            CHANGE PASSWORD
        ========================================== */}

        <View className="mt-7">

          <TouchableOpacity
            onPress={() =>
              setChangePasswordVisible(
                !changePasswordVisible
              )
            }
            className="flex flex-row items-center justify-between border border-primary-200 rounded-2xl p-4"
          >

            <View className="flex flex-row items-center">

              <View className="size-12 rounded-full bg-primary-100 items-center justify-center">

                <Text className="text-xl">
                  🔑
                </Text>

              </View>

              <View className="ml-4">

                <Text className="text-base font-rubik-bold text-black-300">
                  Change Password
                </Text>

                <Text className="text-sm font-rubik text-black-200 mt-1">
                  Update your account password
                </Text>

              </View>

            </View>

            <Image
              source={
                icons.rightArrow
              }
              className="size-5"
            />

          </TouchableOpacity>

          {/* PASSWORD FORM */}

          {changePasswordVisible && (

            <View className="border border-primary-200 rounded-2xl p-4 mt-3">

              <Text className="text-sm font-rubik-medium text-black-300">
                Current Password
              </Text>

              <TextInput
                value={
                  currentPassword
                }
                onChangeText={
                  setCurrentPassword
                }
                placeholder="Enter current password"
                placeholderTextColor="#999"
                secureTextEntry
                className="border border-primary-200 rounded-xl px-4 py-3 mt-2 text-black-300"
              />

              <Text className="text-sm font-rubik-medium text-black-300 mt-4">
                New Password
              </Text>

              <TextInput
                value={
                  newPassword
                }
                onChangeText={
                  setNewPassword
                }
                placeholder="Enter new password"
                placeholderTextColor="#999"
                secureTextEntry
                className="border border-primary-200 rounded-xl px-4 py-3 mt-2 text-black-300"
              />

              <Text className="text-sm font-rubik-medium text-black-300 mt-4">
                Confirm New Password
              </Text>

              <TextInput
                value={
                  confirmPassword
                }
                onChangeText={
                  setConfirmPassword
                }
                placeholder="Confirm new password"
                placeholderTextColor="#999"
                secureTextEntry
                className="border border-primary-200 rounded-xl px-4 py-3 mt-2 text-black-300"
              />

              <TouchableOpacity
                onPress={
                  handleChangePassword
                }
                className="bg-primary-300 rounded-full py-4 mt-5 items-center"
              >

                <Text className="text-white text-base font-rubik-bold">
                  Change Password
                </Text>

              </TouchableOpacity>

            </View>

          )}

        </View>

        {/* ==========================================
            LOGIN SECURITY
        ========================================== */}

        <View className="mt-7">

          <Text className="text-xl font-rubik-bold text-black-300">
            Login Security
          </Text>

          {/* BIOMETRIC */}

          <View className="flex flex-row items-center justify-between border border-primary-200 rounded-2xl p-4 mt-4">

            <View className="flex flex-row items-center">

              <View className="size-12 rounded-full bg-primary-100 items-center justify-center">

                <Text className="text-xl">
                  🔐
                </Text>

              </View>

              <View className="ml-4">

                <Text className="text-base font-rubik-bold text-black-300">
                  Biometric Login
                </Text>

                <Text className="text-sm font-rubik text-black-200 mt-1">
                  Use fingerprint or face unlock
                </Text>

              </View>

            </View>

            <Switch
              value={
                biometricEnabled
              }
              onValueChange={
                setBiometricEnabled
              }
            />

          </View>

          {/* REMEMBER ME */}

          <View className="flex flex-row items-center justify-between border border-primary-200 rounded-2xl p-4 mt-3">

            <View className="flex flex-row items-center">

              <View className="size-12 rounded-full bg-primary-100 items-center justify-center">

                <Text className="text-xl">
                  ✓
                </Text>

              </View>

              <View className="ml-4">

                <Text className="text-base font-rubik-bold text-black-300">
                  Remember Me
                </Text>

                <Text className="text-sm font-rubik text-black-200 mt-1">
                  Keep me signed in
                </Text>

              </View>

            </View>

            <Switch
              value={
                rememberMe
              }
              onValueChange={
                setRememberMe
              }
            />

          </View>

        </View>

        {/* ==========================================
            ACCOUNT PROTECTION
        ========================================== */}

        <View className="mt-7">

          <Text className="text-xl font-rubik-bold text-black-300">
            Account Protection
          </Text>

          {/* EMAIL */}

          <View className="flex flex-row items-center border border-primary-200 rounded-2xl p-4 mt-4">

            <View className="size-12 rounded-full bg-green-100 items-center justify-center">

              <Text className="text-lg">
                ✓
              </Text>

            </View>

            <View className="ml-4">

              <Text className="text-base font-rubik-bold text-black-300">
                Email Verified
              </Text>

              <Text className="text-sm font-rubik text-black-200 mt-1">
                Your email address is verified
              </Text>

            </View>

          </View>

          {/* PHONE */}

          <View className="flex flex-row items-center border border-primary-200 rounded-2xl p-4 mt-3">

            <View className="size-12 rounded-full bg-green-100 items-center justify-center">

              <Text className="text-lg">
                ✓
              </Text>

            </View>

            <View className="ml-4">

              <Text className="text-base font-rubik-bold text-black-300">
                Phone Verified
              </Text>

              <Text className="text-sm font-rubik text-black-200 mt-1">
                Your phone number is verified
              </Text>

            </View>

          </View>

        </View>

        {/* ==========================================
            ACTIVE SESSION
        ========================================== */}

        <View className="mt-7">

          <Text className="text-xl font-rubik-bold text-black-300">
            Active Sessions
          </Text>

          <View className="flex flex-row items-center justify-between border border-primary-200 rounded-2xl p-4 mt-4">

            <View className="flex flex-row items-center">

              <View className="size-12 rounded-full bg-primary-100 items-center justify-center">

                <Text className="text-xl">
                  💻
                </Text>

              </View>

              <View className="ml-4">

                <Text className="text-base font-rubik-bold text-black-300">
                  Chrome • Windows
                </Text>

                <Text className="text-sm font-rubik text-black-200 mt-1">
                  Dhaka, Bangladesh
                </Text>

              </View>

            </View>

            <View className="bg-green-100 px-3 py-1 rounded-full">

              <Text className="text-green-600 text-xs font-rubik-bold">
                Active
              </Text>

            </View>

          </View>

        </View>

        {/* ==========================================
            LOGOUT ALL DEVICES
        ========================================== */}

        <TouchableOpacity
          onPress={
            handleLogoutAll
          }
          className="border border-red-200 rounded-2xl p-4 mt-7 mb-5"
        >

          <Text className="text-red-500 text-base font-rubik-bold text-center">
            Logout from All Devices
          </Text>

        </TouchableOpacity>

      </ScrollView>

    </SafeAreaView>
  );
};

export default Security;