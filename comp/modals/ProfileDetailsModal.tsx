import BaseTextInput from "@/comp/base/BaseTextInput";
import { FONTS } from "@/theme";
import React from "react";
import {
  ActivityIndicator,
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";

export type ProfileDetailsForm = {
  name: string;
  email: string;
  password: string;
};

type ProfileDetailsModalProps = {
  visible: boolean;
  details: ProfileDetailsForm;
  errorText?: string;
  isFetching?: boolean;
  isSubmitting?: boolean;
  onClose: () => void;
  onChange: (field: keyof ProfileDetailsForm, value: string) => void;
  onSubmit: () => void;
};

const ProfileDetailsModal = ({
  visible,
  details,
  errorText,
  isFetching = false,
  isSubmitting = false,
  onClose,
  onChange,
  onSubmit,
}: ProfileDetailsModalProps) => {
  const [passwordSecurityEntry, setPasswordSecurityEntry] = React.useState(true);
  const isBusy = isFetching || isSubmitting;

  React.useEffect(() => {
    if (visible) {
      setPasswordSecurityEntry(true);
    }
  }, [visible]);

  return (
    <Modal transparent animationType="fade" visible={visible} onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={onClose}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.keyboardWrap}
        >
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <Pressable style={styles.card} onPress={() => {}}>
              <View style={styles.header}>
                <Text style={styles.title}>Edit profile</Text>
                <TouchableOpacity
                  activeOpacity={0.8}
                  disabled={isBusy}
                  onPress={onClose}
                  style={styles.closeButton}
                >
                  <Text style={styles.closeText}>×</Text>
                </TouchableOpacity>
              </View>

              <Text style={styles.subtitle}>Update your name, email, or password.</Text>

              <ScrollView
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
                contentContainerStyle={styles.formContent}
              >
                <View style={isFetching && styles.disabledForm}>
                  <BaseTextInput
                    value={details.name}
                    label="Name"
                    onChangeText={(newValue: string) => onChange("name", newValue)}
                    required={true}
                    inputStyle={styles.input}
                  />

                  <BaseTextInput
                    value={details.email}
                    label="Email"
                    onChangeText={(newValue: string) => onChange("email", newValue)}
                    required={true}
                    inputStyle={styles.input}
                  />

                  <BaseTextInput
                    value={details.password}
                    label="Password"
                    onChangeText={(newValue: string) => onChange("password", newValue)}
                    securityEntry={passwordSecurityEntry}
                    inputStyle={styles.input}
                  />
                </View>

                <TouchableOpacity
                  activeOpacity={0.75}
                  disabled={isBusy}
                  onPress={() => setPasswordSecurityEntry((currentValue) => !currentValue)}
                  style={styles.passwordToggle}
                >
                  <Text style={styles.passwordToggleText}>
                    {passwordSecurityEntry ? "Show Password" : "Hide Password"}
                  </Text>
                </TouchableOpacity>

                {isFetching ? (
                  <View style={styles.inlineLoadingWrap}>
                    <ActivityIndicator color="#B88A1A" />
                  </View>
                ) : null}
              </ScrollView>

              {errorText ? <Text style={styles.errorText}>{errorText}</Text> : null}

              <TouchableOpacity
                activeOpacity={0.85}
                disabled={isBusy}
                onPress={onSubmit}
                style={[styles.primaryButton, isBusy && styles.primaryButtonDisabled]}
              >
                {isSubmitting ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.primaryButtonText}>Save changes</Text>
                )}
              </TouchableOpacity>
            </Pressable>
          </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
      </Pressable>
    </Modal>
  );
};

export default ProfileDetailsModal;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(17, 17, 17, 0.45)",
    justifyContent: "center",
    paddingHorizontal: 18,
    paddingVertical: 24,
  },
  keyboardWrap: {
    width: "100%",
  },
  card: {
    maxHeight: "92%",
    borderRadius: 28,
    backgroundColor: "#FFFDF9",
    paddingHorizontal: 18,
    paddingTop: 22,
    paddingBottom: 18,
    shadowColor: "#000000",
    shadowOpacity: 0.12,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 10 },
    elevation: 8,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  title: {
    flex: 1,
    fontFamily: FONTS.figtreeSemiBold,
    fontSize: 24,
    lineHeight: 30,
    color: "#111111",
  },
  closeButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "#F3EEE7",
    alignItems: "center",
    justifyContent: "center",
  },
  closeText: {
    fontFamily: FONTS.interSemiBold,
    fontSize: 22,
    lineHeight: 24,
    color: "#4B4748",
  },
  subtitle: {
    marginTop: 10,
    fontFamily: FONTS.inter,
    fontSize: 14,
    lineHeight: 20,
    color: "#7A7470",
  },
  formContent: {
    paddingTop: 18,
    paddingBottom: 4,
  },
  input: {
    marginHorizontal: 0,
    marginBottom: 8,
    backgroundColor: "#F2F2F7",
  },
  disabledForm: {
    opacity: 0.55,
  },
  inlineLoadingWrap: {
    height: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  passwordToggle: {
    alignSelf: "flex-start",
    paddingHorizontal: 2,
    paddingVertical: 6,
  },
  passwordToggleText: {
    fontFamily: FONTS.inter,
    fontSize: 12,
    lineHeight: 16,
    color: "#4B4748",
  },
  errorText: {
    marginTop: 8,
    textAlign: "center",
    fontFamily: FONTS.inter,
    fontSize: 12,
    lineHeight: 18,
    color: "#C2452D",
  },
  primaryButton: {
    marginTop: 18,
    minHeight: 50,
    borderRadius: 999,
    backgroundColor: "#111111",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  primaryButtonDisabled: {
    opacity: 0.7,
  },
  primaryButtonText: {
    fontFamily: FONTS.figtreeSemiBold,
    fontSize: 15,
    lineHeight: 20,
    color: "#FFFFFF",
  },
});
