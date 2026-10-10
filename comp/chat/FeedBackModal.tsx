import React, { useMemo, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import {
  FeedbackChips,
  FeedbackSection,
  FeedbackSheet,
  FeedbackSheetCloseButton,
  FeedbackStars,
  FeedbackSubmitButton,
  FeedbackTextArea,
  sheetTextStyles,
} from "./FeedbackSheet";

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
  selectedIssues: string;
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
  onSubmit?: (payload: FeedBackPayload) => Promise<boolean | null> | boolean | null;
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
    setComment("");
    onClose();
  };

  const getNormalizedIssueValue = (issue: string) =>
    issue.toLowerCase().replace(/\s+/g, "_");

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

  const handleSubmit = async () => {
    const payload: FeedBackPayload = {
      overallRating,
      detailedRatings,
      selectedIssues: selectedIssues.map(getNormalizedIssueValue).join(","),
      comment: comment.trim(),
      session_id,
      message_id,
    };

    const didSubmit = await onSubmit?.(payload);

    if (!onSubmit) {
      console.log("feedback submitted", payload);
      handleClose();
      return;
    }

    if (didSubmit) {
      handleClose();
    }
  };

  return (
    <FeedbackSheet
      visible={visible}
      onClose={handleClose}
      header={
        <View style={styles.headerRow}>
          <View style={styles.headerText}>
            <Text style={sheetTextStyles.heading}>Help us improve this response</Text>
            <FeedbackStars value={overallRating} onChange={onOverallRatingChange} />
          </View>
          <FeedbackSheetCloseButton onPress={handleClose} />
        </View>
      }
    >
      <FeedbackSection title="Detailed Feedback">
        {DETAIL_OPTIONS.map((item) => (
          <View key={item.key} style={styles.detailRow}>
            <Text style={sheetTextStyles.body}>{item.label}</Text>
            <FeedbackStars
              value={detailedRatings[item.key]}
              onChange={(rating) => handleDetailedRatingChange(item.key, rating)}
            />
          </View>
        ))}
      </FeedbackSection>

      <FeedbackSection title="What was the issue?" topPadding>
        <FeedbackChips
          options={ISSUE_OPTIONS}
          selected={selectedIssues}
          onToggle={handleIssueToggle}
        />
      </FeedbackSection>

      <FeedbackSection title="Optional:" topPadding>
        <FeedbackTextArea
          value={comment}
          onChangeText={handleCommentChange}
          placeholder="Tell us what could be improved..."
          maxLength={MAX_COMMENT_LENGTH}
          counter={`${characterCount}/${MAX_COMMENT_LENGTH}`}
        />
      </FeedbackSection>

      <FeedbackSubmitButton onPress={handleSubmit} />
    </FeedbackSheet>
  );
};

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
  },
  headerText: {
    flex: 1,
    gap: 10,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
});

export default FeedBackModal;
