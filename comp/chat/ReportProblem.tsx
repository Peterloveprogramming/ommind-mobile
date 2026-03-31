import { Ionicons } from "@expo/vector-icons";
import React, { useMemo, useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import useMessageReport from "@/services/useMessageReport";

const REPORT_OPTIONS = [
  "audio not playing",
  "feature not working",
  "message failed to load",
  "layout issue",
  "voice input not working",
  "app crashed",
  "slow response",
  "other",
] as const;

const DEFAULT_DETAILS_TEXT = "Tell us more";
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
  const [details, setDetails] = useState(DEFAULT_DETAILS_TEXT);
  const [validationError, setValidationError] = useState("");
  const { submitMessageReport, isLoading } = useMessageReport();

  const handleClose = () => {
    setSelectedReasons([]);
    setDetails(DEFAULT_DETAILS_TEXT);
    setValidationError("");
    onClose();
  };

  const wordCount = useMemo(() => {
    const trimmedDetails = details.trim();
    if (!trimmedDetails || trimmedDetails === DEFAULT_DETAILS_TEXT) {
      return 0;
    }

    return trimmedDetails.split(/\s+/).length;
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
      other_details: details === DEFAULT_DETAILS_TEXT ? null : details.trim() || null,
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
    <Modal
      transparent
      animationType="fade"
      visible={visible}
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        style={styles.keyboardContainer}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <Pressable style={styles.overlay} onPress={handleClose}>
          <Pressable style={styles.modalCard} onPress={(event) => event.stopPropagation()}>
            <View style={styles.header}>
              <Text style={styles.title}>Report a problem</Text>
              <TouchableOpacity onPress={handleClose} hitSlop={8} style={styles.closeButton}>
                <Ionicons name="close" size={22} color="#F2F2F2" />
              </TouchableOpacity>
            </View>

            <View style={styles.divider} />

            <ScrollView
              contentContainerStyle={styles.content}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              keyboardDismissMode="interactive"
            >
              <Text style={styles.sectionTitle}>What went wrong?</Text>

              <View style={styles.optionGroup}>
                {REPORT_OPTIONS.map((option) => {
                  const isSelected = selectedReasons.includes(option);

                  return (
                    <TouchableOpacity
                      key={option}
                      style={[styles.optionChip, isSelected && styles.optionChipSelected]}
                      onPress={() => handleReasonToggle(option)}
                      activeOpacity={0.85}
                    >
                      <Text style={[styles.optionChipText, isSelected && styles.optionChipTextSelected]}>
                        {option}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {validationError ? (
                <Text style={styles.validationError}>{validationError}</Text>
              ) : null}

              <View style={styles.detailsGroup}>
                <Text style={styles.label}>Optional:</Text>
                <View style={styles.inputWrapper}>
                  <TextInput
                    value={details}
                    onFocus={() => {
                      if (details === DEFAULT_DETAILS_TEXT) {
                        setDetails("");
                      }
                    }}
                    onBlur={() => {
                      if (!details.trim()) {
                        setDetails(DEFAULT_DETAILS_TEXT);
                      }
                    }}
                    onChangeText={handleChangeDetails}
                    multiline
                    textAlignVertical="top"
                    placeholderTextColor="#D0D0D0"
                    style={styles.input}
                  />
                  <Text style={styles.wordCount}>{wordCount}/{MAX_WORDS}</Text>
                </View>
              </View>

              <View style={styles.submitRow}>
                <TouchableOpacity
                  style={[styles.submitButton, isLoading && styles.submitButtonDisabled]}
                  onPress={() => {
                    void handleSubmit();
                  }}
                  activeOpacity={0.85}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <Ionicons name="paper-plane-outline" size={18} color="#FFFFFF" />
                  )}
                  <Text style={styles.submitText}>Submit</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </Pressable>
        </Pressable>
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
    backgroundColor: "rgba(0,0,0,0.48)",
    justifyContent: "flex-end",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingBottom: 0,
  },
  modalCard: {
    width: "100%",
    maxWidth: 560,
    maxHeight: "72%",
    backgroundColor: "#5A5A5A",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    overflow: "hidden",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 20,
    paddingTop: 28,
    paddingBottom: 18,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#777777",
    alignItems: "center",
    justifyContent: "center",
  },
  divider: {
    height: 1,
    backgroundColor: "rgba(255,255,255,0.55)",
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 26,
    flexGrow: 1,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#FFFFFF",
    marginBottom: 16,
  },
  optionGroup: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 20,
  },
  optionChip: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: "transparent",
    borderWidth: 1.5,
    borderColor: "rgba(255,255,255,0.9)",
  },
  optionChipSelected: {
    backgroundColor: "#F1C44E",
    borderColor: "#F1C44E",
  },
  optionChipText: {
    fontSize: 14,
    color: "#FFFFFF",
    textTransform: "capitalize",
  },
  optionChipTextSelected: {
    color: "#FFFFFF",
  },
  detailsGroup: {
    gap: 12,
  },
  validationError: {
    color: "#FFB4B4",
    fontSize: 13,
    marginTop: -6,
    marginBottom: 16,
  },
  label: {
    fontSize: 17,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  inputWrapper: {
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: "rgba(255,255,255,0.8)",
    backgroundColor: "#6A6A6A",
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 18,
  },
  input: {
    minHeight: 80,
    fontSize: 16,
    color: "#FFFFFF",
    padding: 0,
  },
  wordCount: {
    fontSize: 12,
    color: "#F3F3F3",
    textAlign: "right",
    marginTop: 8,
  },
  submitRow: {
    alignItems: "center",
  },
  submitButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#F1C44E",
    borderRadius: 999,
    paddingHorizontal: 22,
    paddingVertical: 12,
  },
  submitButtonDisabled: {
    opacity: 0.75,
  },
  submitText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
});

export default ReportProblem;
