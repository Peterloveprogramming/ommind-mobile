import GradientDivider from "@/comp/home/GradientDivider";
import ProfileFormScreen, {
  PROFILE_FORM_UI,
  ProfileFormErrorText,
  ProfileFormSubmitButton,
  profileFormTextStyles,
  useProfileFormGap,
} from "@/comp/profile/ProfileFormScreen";
import { COLORS } from "@/theme";
import React from "react";
import { Linking, StyleSheet, Text, TextInput, View } from "react-native";

const MAX_SUBJECT_LENGTH = 100;
const MAX_MESSAGE_LENGTH = 1000;

type ProfileContactFormProps = {
  title: string;
  subjectPlaceholder?: string;
  messagePlaceholder?: string;
  submitLabel?: string;
  responseTimeText: string;
  emailLabel?: string;
  emailAddress: string;
  errorText?: string;
  isSubmitting?: boolean;
  onBackPress: () => void;
  onSubmitPress?: (subject: string, message: string) => void;
};

const ProfileContactForm = ({
  title,
  subjectPlaceholder = "Subject",
  messagePlaceholder = "Message",
  submitLabel = "Submit",
  responseTimeText,
  emailLabel = "Email:",
  emailAddress,
  errorText,
  isSubmitting = false,
  onBackPress,
  onSubmitPress,
}: ProfileContactFormProps) => {
  const gap = useProfileFormGap();
  const messageInputRef = React.useRef<TextInput>(null);
  const [subject, setSubject] = React.useState("");
  const [message, setMessage] = React.useState("");

  const handleSubmitPress = () => {
    onSubmitPress?.(subject, message);
  };

  const handleEmailPress = () => {
    Linking.openURL(`mailto:${emailAddress}`).catch((error) => {
      console.error("Failed to open email client", error);
    });
  };

  return (
    <ProfileFormScreen title={title} onBackPress={onBackPress}>
      <View style={styles.field}>
        <TextInput
          accessibilityLabel={subjectPlaceholder}
          editable={!isSubmitting}
          maxFontSizeMultiplier={PROFILE_FORM_UI.maxFontSizeMultiplier}
          maxLength={MAX_SUBJECT_LENGTH}
          onChangeText={setSubject}
          onSubmitEditing={() => messageInputRef.current?.focus()}
          placeholder={subjectPlaceholder}
          placeholderTextColor={PROFILE_FORM_UI.placeholderColor}
          returnKeyType="next"
          style={[profileFormTextStyles.input, styles.subjectInput]}
          submitBehavior="submit"
          value={subject}
        />
        <GradientDivider style={styles.divider} />
      </View>

      <View style={[styles.field, { marginTop: gap(150) }]}>
        <TextInput
          ref={messageInputRef}
          multiline
          accessibilityLabel={messagePlaceholder}
          editable={!isSubmitting}
          maxFontSizeMultiplier={PROFILE_FORM_UI.maxFontSizeMultiplier}
          maxLength={MAX_MESSAGE_LENGTH}
          onChangeText={setMessage}
          placeholder={messagePlaceholder}
          placeholderTextColor={PROFILE_FORM_UI.placeholderColor}
          style={[profileFormTextStyles.input, styles.messageInput]}
          value={message}
        />
        <GradientDivider style={styles.divider} />
      </View>

      <ProfileFormErrorText>{errorText}</ProfileFormErrorText>

      <View style={[styles.footer, { marginTop: gap(81), gap: gap(30) }]}>
        <ProfileFormSubmitButton
          isSubmitting={isSubmitting}
          label={submitLabel}
          onPress={handleSubmitPress}
        />

        <Text
          maxFontSizeMultiplier={PROFILE_FORM_UI.maxFontSizeMultiplier}
          style={[profileFormTextStyles.body, styles.responseTimeText]}
        >
          {responseTimeText}
        </Text>

        <Text
          maxFontSizeMultiplier={PROFILE_FORM_UI.maxFontSizeMultiplier}
          style={[profileFormTextStyles.body, styles.emailText]}
        >
          {`${emailLabel} `}
          <Text
            accessibilityRole="link"
            onPress={handleEmailPress}
            style={styles.emailAddress}
            suppressHighlighting
          >
            {emailAddress}
          </Text>
        </Text>
      </View>
    </ProfileFormScreen>
  );
};

export default ProfileContactForm;

const styles = StyleSheet.create({
  field: {
    alignSelf: "stretch",
  },
  subjectInput: {
    minHeight: 20,
  },
  messageInput: {
    minHeight: 20,
    maxHeight: 160,
  },
  divider: {
    marginTop: 20,
    marginHorizontal: PROFILE_FORM_UI.gutter,
  },
  footer: {
    alignItems: "center",
  },
  responseTimeText: {
    maxWidth: 218,
  },
  emailText: {
    maxWidth: 261,
  },
  emailAddress: {
    color: COLORS.brandYellow,
  },
});
