import { useState } from 'react';
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { useRouter } from "expo-router";
import { useUserApi } from '@/api/api';
import BaseTextInput from "@/comp/base/BaseTextInput";
import BaseButton from '@/comp/base/BaseButton';
import { FONTS } from '@/theme';
import { useToast } from '@/context/useToast';
import { checkIfLambdaResultIsSuccess, convertFieldNameToReadableFormat, storeAuthInfo } from '@/utils/helper';

let debugUi = false
type LoginDetails = {
  email: string;
  password: string;
};

export default function Login() {
  const router = useRouter();
  const [details, setDetails] = useState<LoginDetails>({
    email: '',
    password: '',
  });
  const [passwordSecurityEntry, setPasswordSecurityEntry] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const {
    loginUser: { loginUser },
  } = useUserApi();
  const { showToastMessage } = useToast();

  const handleInputChange = (field: keyof LoginDetails, value: string) => {
    setDetails((prevState) => ({
      ...prevState,
      [field]: value,
    }));
  };

  const handleLogin = async () => {
    setIsLoading(true);

    for (const key in details) {
      const value = details[key as keyof LoginDetails];
      if (!value) {
        showToastMessage(`${convertFieldNameToReadableFormat(key)} is missing`, false);
        setIsLoading(false);
        return;
      }
    }

    try {
      const loginUserResult = await loginUser({
        email: details.email,
        password: details.password,
      });

      const resultSuccess = checkIfLambdaResultIsSuccess(loginUserResult);
      if (!resultSuccess) {
        showToastMessage(loginUserResult.response, false);
        return;
      }

      await storeAuthInfo({
        userName: '',
        userId: 0,
        jwtToken: loginUserResult.data.jwt_token,
      });

      showToastMessage("Successfully Logged In!", true);
      router.replace("/(tabs)");
    } catch (error) {
      console.log("error is", error);
      showToastMessage("Error occurred while logging in", false);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 20 : 100}
      >
        <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
          <ScrollView contentContainerStyle={styles.scrollViewContainer}>
            <View style={styles.topSection}>
              <View>
                <Text style={styles.askEmailText}>Welcome back</Text>
              </View>

              <BaseTextInput
                value={details.email}
                label="Email"
                onChangeText={(newValue: string) => handleInputChange("email", newValue)}
                required={true}
                inputStyle={{
                  marginBottom: 5,
                }}
              />

              <BaseTextInput
                value={details.password}
                label="Password"
                onChangeText={(newValue: string) => handleInputChange("password", newValue)}
                required={true}
                securityEntry={passwordSecurityEntry}
                inputStyle={{
                  marginBottom: 5,
                }}
              />

              <TouchableOpacity
                onPress={() => {
                  setPasswordSecurityEntry((prevState) => !prevState);
                }}
              >
                <Text style={styles.showPasswordText}>
                  {passwordSecurityEntry ? 'Show Password' : 'Hide Password'}
                </Text>
              </TouchableOpacity>

              <View style={styles.loginButtonContainer}>
                <BaseButton
                  text='Login'
                  isLoading={isLoading}
                  onPress={handleLogin}
                />
              </View>
            </View>
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 10,
    borderWidth: debugUi ? 2 : 0,

  },
  scrollViewContainer: {
    flexGrow: 1,
    width: '100%',
    borderWidth: debugUi ? 2 : 0,

  },
  topSection: {
    marginTop: 20,
            borderWidth: debugUi ? 2 : 0,

  },
  askEmailText: {
    fontFamily: FONTS.figtreeSemiBold,
    fontSize: 32,
    marginBottom: 20,
  },
  showPasswordText: {
    marginLeft: 20,
    fontSize: 12,
    marginTop: 0,
  },
  loginButtonContainer: {
    marginTop: 20,
  },
});
