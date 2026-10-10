import React, { useMemo, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import useMessageReport from "@/api/messageReport/useMessageReport";
import {
  FeedbackChips,
  FeedbackSection,
  FeedbackSheet,
  FeedbackSheetCloseButton,
  FeedbackSubmitButton,
  FeedbackTextArea,
  sheetTextStyles,
} from "./FeedbackSheet";
import { FONTS } from "@/theme.js";

const REPORT_OPTIONS = [
  "Audio not playing",
  "Feature not working",
  "Message failed to load",
  "Layout issue",
  "Voice input not working",
  "App crashed",
  "Slow response",
  "Other",
] as const;

const MAX_WORDS = 200;

type ReportProblemProps = {
  visible: boolean;
  onClose: () => void;
  session_id?: string | number;
  message_id?: string | number;
};

const ReportProblem = ({
  visible,
  onClose,
  session_id,
  message_id,
}: ReportProblemProps) => {
  const [selectedReasons, setSelectedReasons] = useState<string[]>([]);
  const [details, setDetails] = useState("");
  const [validationError, setValidationError] = useState("");
  const { submitMessageReport, isLoading } = useMessageReport();

  const handleClose = () => {
    setSelectedReasons([]);
    setDetails("");
    setValidationError("");
    onClose();
  };

  const wordCount = useMemo(() => {
    const trimmedDetails = details.trim();
    return trimmedDetails ? trimmedDetails.split(/\s+/).length : 0;
  }, [details]);

  const handleChangeDetails = (nextValue: string) => {
    const normalizedValue = nextValue.replace(/\s+/g, " ").replace(/^\s/, "");
    const words = normalizedValue.trim() ? normalizedValue.trim().split(/\s+/) : [];

    if (words.length <= MAX_WORDS) {
      setDetails(nextValue);
      return;
    }

    setDetails(words.slice(0, MAX_WORDS).join(" "));
  };

  const handleSubmit = async () => {
    if (!selectedReasons.length) {
      setValidationError("Select at least one issue.");
      return;
    }

    if (!message_id || isLoading) {
      return;
    }

    const normalizedIssues = selectedReasons
      .map((reason) => reason.toLowerCase().replace(/\s+/g, "_"))
      .join(",");

    const response = await submitMessageReport({
      message_id,
      issues: [normalizedIssues],
      other_details: details.trim() || null,
    });

    if (response) {
      handleClose();
    }
  };

  const handleReasonToggle = (option: string) => {
    setValidationError("");
    setSelectedReasons((current) =>
      current.includes(option)
        ? current.filter((reason) => reason !== option)
        : [...current, option]
    );
  };

  return (
    <FeedbackSheet
      visible={visible}
      onClose={handleClose}
      header={
        <View style={styles.headerRow}>
          <Text style={[sheetTextStyles.heading, styles.headerTitle]}>Report a problem</Text>
          <FeedbackSheetCloseButton onPress={handleClose} />
        </View>
      }
    >
      <FeedbackSection title="What went wrong?" topPadding>
        <FeedbackChips
          options={REPORT_OPTIONS}
          selected={selectedReasons}
          onToggle={handleReasonToggle}
        />
        {validationError ? (
          <Text style={styles.validationError}>{validationError}</Text>
        ) : null}
      </FeedbackSection>

      <FeedbackSection title="Optional:" topPadding>
        <FeedbackTextArea
          value={details}
          onChangeText={handleChangeDetails}
          placeholder="Tell us more..."
          counter={`${wordCount}/${MAX_WORDS}`}
        />
      </FeedbackSection>

      <FeedbackSubmitButton
        onPress={() => {
          void handleSubmit();
        }}
        isLoading={isLoading}
      />
    </FeedbackSheet>
  );
};

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  headerTitle: {
    flex: 1,
  },
  validationError: {
    fontFamily: FONTS.interRegular,
    fontSize: 13,
    lineHeight: 18,
    color: "#FFB4B4",
  },
});

export default ReportProblem;
