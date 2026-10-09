import Paperclip from "@/assets/svg/profile/Paperclip";
import GradientDivider from "@/comp/home/GradientDivider";
import ProfileFormScreen, {
  PROFILE_FORM_UI,
  ProfileFormErrorText,
  ProfileFormSubmitButton,
  profileFormTextStyles,
  useProfileFormGap,
} from "@/comp/profile/ProfileFormScreen";
import { FONTS } from "@/theme";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Image, Pressable, StyleSheet, Text, TextInput, View } from "react-native";

const MAX_DESCRIPTION_LENGTH = 1000;

type ProfileFeedbackFormProps = {
  title: string;
  titleVariant?: "regular" | "semibold";
  placeholder: string;
  attachmentHelperText: string;
  errorText?: string;
  imagePreviewUri?: string | null;
  isSubmitting?: boolean;
  submitLabel?: string;
  onBackPress: () => void;
  onAddImagePress?: () => void;
  onRemoveImagePress?: () => void;
  onSubmitPress?: (message: string) => void;
};

const ProfileFeedbackForm = ({
  title,
  titleVariant,
  placeholder,
  attachmentHelperText,
  errorText,
  imagePreviewUri,
  isSubmitting = false,
  submitLabel = "Submit",
  onBackPress,
  onAddImagePress,
  onRemoveImagePress,
  onSubmitPress,
}: ProfileFeedbackFormProps) => {
  const gap = useProfileFormGap();
  const [message, setMessage] = React.useState("");

  const handleSubmitPress = () => {
    onSubmitPress?.(message);
  };

  return (
    <ProfileFormScreen title={title} titleVariant={titleVariant} onBackPress={onBackPress}>
      <View style={styles.fieldGroup}>
        <TextInput
          multiline
          accessibilityLabel={placeholder}
          editable={!isSubmitting}
          maxFontSizeMultiplier={PROFILE_FORM_UI.maxFontSizeMultiplier}
          maxLength={MAX_DESCRIPTION_LENGTH}
          onChangeText={setMessage}
          placeholder={placeholder}
          placeholderTextColor={PROFILE_FORM_UI.placeholderColor}
          style={[profileFormTextStyles.input, styles.messageInput]}
          value={message}
        />

        <GradientDivider style={styles.divider} />

        <Pressable
          accessibilityRole="button"
          accessibilityLabel={imagePreviewUri ? "Change image" : "Add an image"}
          disabled={isSubmitting}
          hitSlop={6}
          onPress={onAddImagePress}
          style={({ pressed }) => [styles.addImageButton, pressed && styles.pressed]}
        >
          <Paperclip />
          <Text
            maxFontSizeMultiplier={PROFILE_FORM_UI.maxFontSizeMultiplier}
            numberOfLines={1}
            style={styles.addImageText}
          >
            {imagePreviewUri ? "Change image" : "Add an image"}
          </Text>
        </Pressable>

        {imagePreviewUri ? (
          <View style={styles.imagePreviewWrap}>
            <Image source={{ uri: imagePreviewUri }} style={styles.imagePreview} />
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Remove image"
              disabled={isSubmitting}
              hitSlop={8}
              onPress={onRemoveImagePress}
              style={styles.removeImageButton}
            >
              <Ionicons name="close" size={16} color="#FFFFFF" />
            </Pressable>
          </View>
        ) : null}

        <Text
          maxFontSizeMultiplier={PROFILE_FORM_UI.maxFontSizeMultiplier}
          style={[profileFormTextStyles.body, styles.helperText]}
        >
          {attachmentHelperText}
        </Text>

        <ProfileFormErrorText>{errorText}</ProfileFormErrorText>
      </View>

      <View style={{ marginTop: gap(81) }}>
        <ProfileFormSubmitButton
          isSubmitting={isSubmitting}
          label={submitLabel}
          onPress={handleSubmitPress}
        />
      </View>
    </ProfileFormScreen>
  );
};

export default ProfileFeedbackForm;

const styles = StyleSheet.create({
  fieldGroup: {
    alignSelf: "stretch",
    alignItems: "center",
  },
  messageInput: {
    minHeight: 20,
    maxHeight: 160,
  },
  divider: {
    marginTop: 20,
    marginHorizontal: PROFILE_FORM_UI.gutter,
  },
  addImageButton: {
    marginTop: 20,
    minWidth: 150,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#CBCBCB",
    backgroundColor: "#E4E4E4",
    paddingLeft: 10,
    paddingRight: 15,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
  },
  addImageText: {
    fontFamily: FONTS.figtreeMedium500,
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: -0.24,
    color: PROFILE_FORM_UI.inputColor,
  },
  pressed: {
    opacity: 0.8,
  },
  imagePreviewWrap: {
    marginTop: 20,
    width: 150,
    height: 100,
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: "#E4E4E4",
  },
  imagePreview: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  removeImageButton: {
    position: "absolute",
    top: 6,
    right: 6,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "rgba(17, 17, 17, 0.62)",
    alignItems: "center",
    justifyContent: "center",
  },
  helperText: {
    marginTop: 20,
    maxWidth: 261,
  },
});
