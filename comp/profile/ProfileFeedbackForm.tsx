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

type ProfileFeedbackFormProps = {
  title: string;
  placeholder: string;
  attachmentHelperText: string;
  submitLabel?: string;
  onBackPress: () => void;
  onAddImagePress?: () => void;
  onSubmitPress?: (message: string) => void;
};

const ProfileFeedbackForm = ({
  title,
  placeholder,
  attachmentHelperText,
  submitLabel = "Submit",
  onBackPress,
  onAddImagePress,
  onSubmitPress,
}: ProfileFeedbackFormProps) => {
  const [message, setMessage] = React.useState("");

  const handleAddImagePress = () => {
    onAddImagePress?.();
  };

  const handleSubmitPress = () => {
    onSubmitPress?.(message);
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
          multiline
          value={message}
          onChangeText={setMessage}
          placeholder={placeholder}
          placeholderTextColor="#8F9097"
          textAlign="center"
          style={styles.messageInput}
        />

        <View style={styles.divider} />

        <TouchableOpacity
          activeOpacity={0.85}
          onPress={handleAddImagePress}
          style={styles.addImageButton}
        >
          <Ionicons name="attach-outline" size={26} color="#8F9097" />
          <Text style={styles.addImageText}>Add an image</Text>
        </TouchableOpacity>

        <Text style={styles.attachmentHelperText}>{attachmentHelperText}</Text>

        <TouchableOpacity
          activeOpacity={0.85}
          onPress={handleSubmitPress}
          style={styles.submitButton}
        >
          <Ionicons name="paper-plane-outline" size={22} color="#FFFFFF" />
          <Text style={styles.submitButtonText}>{submitLabel}</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

export default ProfileFeedbackForm;

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
    width: 60,
    height: 60,
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
    color: "#333333",
    textAlign: "center",
  },
  headerSpacer: {
    width: 70,
  },
  formContent: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingBottom: 120,
  },
  messageInput: {
    width: "100%",
    minHeight: 92,
    paddingHorizontal: 8,
    paddingVertical: 12,
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
  addImageButton: {
    marginTop: 30,
    minHeight: 52,
    borderRadius: 26,
    borderWidth: 1,
    borderColor: "#C9C9C9",
    backgroundColor: "#E9E9E9",
    paddingHorizontal: 28,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  addImageText: {
    marginLeft: 10,
    fontFamily: FONTS.interSemiBold,
    fontSize: 18,
    lineHeight: 24,
    color: "#111111",
  },
  attachmentHelperText: {
    marginTop: 26,
    maxWidth: 310,
    fontFamily: FONTS.inter,
    fontSize: 20,
    lineHeight: 30,
    color: "#8F9097",
    textAlign: "center",
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
});
