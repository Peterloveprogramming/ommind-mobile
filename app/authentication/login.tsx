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
import BaseTextInput from "@/comp/base/BaseTextInput";
import BaseButton from '@/comp/base/BaseButton';
import { FONTS } from '@/theme';

let debugUi = false
type LoginDetails = {
  email: string;
  password: string;
};

export default function Login() {
  const [details, setDetails] = useState<LoginDetails>({
    email: '',
    password: '',
  });
  const [passwordSecurityEntry, setPasswordSecurityEntry] = useState(true);

  const handleInputChange = (field: keyof LoginDetails, value: string) => {
    setDetails((prevState) => ({
      ...prevState,
      [field]: value,
    }));
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
                  onPress={() => console.log("login pressed")}
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
