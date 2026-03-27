import { Ionicons } from "@expo/vector-icons";
import React, { useMemo, useState } from "react";
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { images } from "@/constants/images";
import { Image } from "react-native";

const ISSUE_OPTIONS = [
  "Not relevant",
  "Incorrect info",
  "Not practical",
  "Unsafe content",
  "Missing meditation steps",
  "Confusing guidance",
  "Too abstract",
  "Other",
] as const;

const DETAIL_OPTIONS = [
  { key: "helpfulness", label: "Helpfulness" },
  { key: "accuracy", label: "Accuracy" },
  { key: "clarity", label: "Clarity" },
  { key: "tone", label: "Tone" },
] as const;

const MAX_COMMENT_LENGTH = 200;

type DetailedRatings = {
  helpfulness: number;
  accuracy: number;
  clarity: number;
  tone: number;
};

export type FeedBackPayload = {
  overallRating: number;
  detailedRatings: DetailedRatings;
  selectedIssues: string[];
  comment: string;
  session_id?: string | number;
  message_id?: string | number;
};

type FeedBackModalProps = {
  visible: boolean;
  onClose: () => void;
  overallRating: number;
  onOverallRatingChange: (rating: number) => void;
  session_id?: string | number;
  message_id?: string | number;
  onSubmit?: (payload: FeedBackPayload) => void;
};

const FeedBackModal = ({
  visible,
  onClose,
  overallRating,
  onOverallRatingChange,
  session_id,
  message_id,
  onSubmit,
}: FeedBackModalProps) => {
  const [detailedRatings, setDetailedRatings] = useState<DetailedRatings>({
    helpfulness: 3,
    accuracy: 3,
    clarity: 3,
    tone: 3,
  });
  const [selectedIssues, setSelectedIssues] = useState<string[]>([
  
  ]);
  const [comment, setComment] = useState("");

  const characterCount = useMemo(() => comment.length, [comment]);

  const handleClose = () => {
    setSelectedIssues([]);
    onClose();
  };

  const handleDetailedRatingChange = (key: keyof DetailedRatings, rating: number) => {
    setDetailedRatings((current) => ({
      ...current,
      [key]: rating,
    }));
  };

  const handleIssueToggle = (issue: string) => {
    setSelectedIssues((current) =>
      current.includes(issue)
        ? current.filter((currentIssue) => currentIssue !== issue)
        : [...current, issue]
    );
  };

  const handleCommentChange = (value: string) => {
    setComment(value.slice(0, MAX_COMMENT_LENGTH));
  };

  const handleSubmit = () => {
    const payload: FeedBackPayload = {
      overallRating,
      detailedRatings,
      selectedIssues,
      comment: comment.trim(),
      session_id,
      message_id,
    };

    onSubmit?.(payload);

    if (!onSubmit) {
      console.log("feedback submitted", payload);
    }

    handleClose();
  };

  const renderStars = (
    value: number,
    onPress: (rating: number) => void,
    size: number,
    gap: number
  ) => (
    <View style={[styles.starsRow, { gap }]}>
      {Array.from({ length: 5 }, (_, index) => {
        const rating = index + 1;
        const filled = index < value;

        return (
          <Pressable key={rating} onPress={() => onPress(rating)} hitSlop={8}>
            <Image
              source={filled ? images.star_filled : images.star_unfilled}
              style={{ width: size, height: size }}
              resizeMode="contain"
            />
          </Pressable>
        );
      })}
    </View>
  );

  return (
    <Modal transparent animationType="fade" visible={visible} onRequestClose={handleClose}>
      <KeyboardAvoidingView
        style={styles.keyboardContainer}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <View style={styles.overlay}>
          <View style={styles.card}>
            <ScrollView
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              keyboardDismissMode="interactive"
              contentContainerStyle={styles.content}
            >
              <View style={styles.headerRow}>
                <Text style={styles.title}>Help us improve this response</Text>
                <Pressable onPress={handleClose} style={styles.closeButton} hitSlop={8}>
                  <Ionicons name="close" size={22} color="#F2F2F2" />
                </Pressable>
              </View>

              {renderStars(overallRating, onOverallRatingChange, 30, 10)}

              <View style={styles.divider} />

              <Text style={styles.sectionTitle}>Detailed Feedback</Text>

              <View style={styles.detailRows}>
                {DETAIL_OPTIONS.map((item) => (
                  <View key={item.key} style={styles.detailRow}>
                    <Text style={styles.detailLabel}>{item.label}</Text>
                    {renderStars(
                      detailedRatings[item.key],
                      (rating) => handleDetailedRatingChange(item.key, rating),
                      24,
                      6
                    )}
                  </View>
                ))}
              </View>

              <Text style={[styles.sectionTitle, styles.issueSectionTitle]}>What was the issue?</Text>

              <View style={styles.chipsContainer}>
                {ISSUE_OPTIONS.map((issue) => {
                  const selected = selectedIssues.includes(issue);

                  return (
                    <Pressable
                      key={issue}
                      onPress={() => handleIssueToggle(issue)}
                      style={[styles.chip, selected && styles.chipSelected]}
                    >
                      <Text style={[styles.chipText, selected && styles.chipTextSelected]}>
                        {issue}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>

              <Text style={[styles.sectionTitle, styles.optionalLabel]}>Optional:</Text>

              <View style={styles.inputWrapper}>
                <TextInput
                  value={comment}
                  onChangeText={handleCommentChange}
                  placeholder="Tell us what could be improved..."
                  placeholderTextColor="#B5B5B5"
                  multiline
                  maxLength={MAX_COMMENT_LENGTH}
                  textAlignVertical="top"
                  style={styles.input}
                />
                <Text style={styles.counterText}>
                  {characterCount}/{MAX_COMMENT_LENGTH}
                </Text>
              </View>

              <View style={styles.submitRow}>
                <Pressable onPress={handleSubmit} style={styles.submitButton}>
                  <Ionicons name="paper-plane-outline" size={18} color="#FFFFFF" />
                  <Text style={styles.submitText}>Submit</Text>
                </Pressable>
              </View>
            </ScrollView>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  keyboardContainer: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.62)",
    justifyContent: "flex-end",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingBottom: 0,
  },
  card: {
    width: "100%",
    maxWidth: 560,
    maxHeight: "78%",
    backgroundColor: "#5A5A5A",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.35,
    shadowRadius: 20,
    elevation: 12,
    overflow: "hidden",
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 22,
    paddingBottom: 26,
    flexGrow: 1,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 16,
    marginBottom: 18,
  },
  title: {
    flex: 1,
    color: "#FFFFFF",
    fontSize: 22,
    fontWeight: "700",
  },
  closeButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "#6E6E6E",
    alignItems: "center",
    justifyContent: "center",
  },
  starsRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  divider: {
    height: 1,
    backgroundColor: "rgba(255,255,255,0.55)",
    marginTop: 18,
    marginBottom: 16,
    marginHorizontal: -20,
  },
  sectionTitle: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "700",
  },
  detailRows: {
    gap: 16,
    marginTop: 16,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  detailLabel: {
    flex: 1,
    color: "#F4F4F4",
    fontSize: 16,
  },
  issueSectionTitle: {
    marginTop: 22,
    marginBottom: 14,
  },
  chipsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  chip: {
    borderRadius: 999,
    borderWidth: 1.5,
    borderColor: "rgba(255,255,255,0.75)",
    backgroundColor: "transparent",
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  chipSelected: {
    backgroundColor: "#F1C44E",
    borderColor: "#F1C44E",
  },
  chipText: {
    color: "#F4F4F4",
    fontSize: 14,
  },
  chipTextSelected: {
    color: "#FFFFFF",
  },
  optionalLabel: {
    marginTop: 20,
    marginBottom: 12,
  },
  inputWrapper: {
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: "rgba(255,255,255,0.65)",
    backgroundColor: "#5F5F5F",
    paddingHorizontal: 14,
    paddingTop: 14,
    paddingBottom: 8,
  },
  input: {
    minHeight: 78,
    color: "#FFFFFF",
    fontSize: 16,
    padding: 0,
  },
  counterText: {
    alignSelf: "flex-end",
    color: "#F0F0F0",
    fontSize: 12,
    marginTop: 8,
  },
  submitRow: {
    alignItems: "center",
    marginTop: 22,
  },
  submitButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#F1C44E",
    paddingHorizontal: 22,
    paddingVertical: 12,
    borderRadius: 999,
  },
  submitText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
});

export default FeedBackModal;
