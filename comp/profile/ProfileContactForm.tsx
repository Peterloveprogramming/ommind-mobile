import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { FONTS } from "@/theme";

type ProfileContactFormProps = {
  title: string;
  subjectPlaceholder?: string;
  messagePlaceholder?: string;
  submitLabel?: string;
  responseTimeText: string;
  emailLabel?: string;
  emailAddress: string;
  onBackPress: () => void;
  onSubmitPress?: (input: { subject: string; message: string }) => void;
};

const ProfileContactForm = ({
  title,
  subjectPlaceholder = "Subject",
  messagePlaceholder = "Message",
  submitLabel = "Submit",
  responseTimeText,
  emailLabel = "Email:",
  emailAddress,
  onBackPress,
  onSubmitPress,
}: ProfileContactFormProps) => {
  const [subject, setSubject] = React.useState("");
  const [message, setMessage] = React.useState("");

  const handleSubmitPress = () => {
    onSubmitPress?.({ subject, message });
  };

  return (
    <ScrollView
      contentContainerStyle={styles.contentContainer}
      keyboardShouldPersistTaps="handled"
      style={styles.container}
    >
      <View style={styles.header}>
        <TouchableOpacity
          activeOpacity={0.85}
          hitSlop={8}
          onPress={onBackPress}
          style={styles.backButton}
        >
          <Ionicons name="chevron-back" size={42} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.title}>{title}</Text>
        <View style={styles.headerSpacer} />
      </View>

      <View style={styles.formContent}>
        <TextInput
          value={subject}
          onChangeText={setSubject}
          placeholder={subjectPlaceholder}
          placeholderTextColor="#8F9097"
          textAlign="center"
          style={styles.subjectInput}
        />

        <View style={styles.divider} />

        <TextInput
          multiline
          value={message}
          onChangeText={setMessage}
          placeholder={messagePlaceholder}
          placeholderTextColor="#8F9097"
          textAlign="center"
          style={styles.messageInput}
        />

        <View style={styles.divider} />

        <TouchableOpacity
          activeOpacity={0.85}
          onPress={handleSubmitPress}
          style={styles.submitButton}
        >
          <Ionicons name="paper-plane-outline" size={22} color="#FFFFFF" />
          <Text style={styles.submitButtonText}>{submitLabel}</Text>
        </TouchableOpacity>

        <Text style={styles.responseTimeText}>{responseTimeText}</Text>

        <View style={styles.emailRow}>
          <Text style={styles.emailLabel}>{emailLabel} </Text>
          <Text style={styles.emailAddress}>{emailAddress}</Text>
        </View>
      </View>
    </ScrollView>
  );
};

export default ProfileContactForm;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9F9F9",
  },
  contentContainer: {
    flexGrow: 1,
    minHeight: 760,
    paddingHorizontal: 24,
    paddingTop: 52,
    paddingBottom: 140,
  },
  header: {
    minHeight: 76,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  backButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: "#C8C8C8",
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    flex: 1,
    marginHorizontal: 16,
    fontFamily: FONTS.figtreeSemiBold,
    fontSize: 22,
    lineHeight: 28,
    color: "#111111",
    textAlign: "center",
  },
  headerSpacer: {
    width: 70,
  },
  formContent: {
    flex: 1,
    alignItems: "center",
    paddingTop: 124,
  },
  subjectInput: {
    width: "100%",
    minHeight: 68,
    paddingHorizontal: 8,
    paddingVertical: 10,
    fontFamily: FONTS.inter,
    fontSize: 22,
    lineHeight: 28,
    color: "#333333",
  },
  messageInput: {
    width: "100%",
    minHeight: 216,
    paddingHorizontal: 8,
    paddingVertical: 92,
    fontFamily: FONTS.inter,
    fontSize: 22,
    lineHeight: 30,
    color: "#333333",
  },
  divider: {
    width: "100%",
    height: 1,
    backgroundColor: "#E6E6E6",
  },
  submitButton: {
    marginTop: 112,
    minHeight: 52,
    borderRadius: 26,
    backgroundColor: "#F7C331",
    paddingHorizontal: 24,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  submitButtonText: {
    marginLeft: 8,
    fontFamily: FONTS.interSemiBold,
    fontSize: 18,
    lineHeight: 24,
    color: "#FFFFFF",
  },
  responseTimeText: {
    marginTop: 40,
    maxWidth: 300,
    fontFamily: FONTS.inter,
    fontSize: 22,
    lineHeight: 30,
    color: "#8F9097",
    textAlign: "center",
  },
  emailRow: {
    marginTop: 52,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    flexWrap: "wrap",
  },
  emailLabel: {
    fontFamily: FONTS.inter,
    fontSize: 20,
    lineHeight: 28,
    color: "#8F9097",
  },
  emailAddress: {
    fontFamily: FONTS.inter,
    fontSize: 20,
    lineHeight: 28,
    color: "#F7C331",
  },
});
