import BaseButton from "@/comp/base/BaseButton";
import React, { useMemo, useState } from "react";
import { COLORS } from "@/theme.js";
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

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
  const [selectedReason, setSelectedReason] = useState<string | null>(null);
  const [details, setDetails] = useState(DEFAULT_DETAILS_TEXT);

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

  const handleSubmit = () => {
    console.log("session id and message id and reason",session_id,message_id,selectedReason)
    const payload = {
      session_id,
      message_id,
      reason: selectedReason,
      details: details === DEFAULT_DETAILS_TEXT ? "" : details.trim(),
    };

    void payload;
  };

  return (
    <Modal
      transparent
      animationType="fade"
      visible={visible}
      onRequestClose={onClose}
    >
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={styles.modalCard} onPress={(event) => event.stopPropagation()}>
          <View style={styles.header}>
            <View>
              <Text style={styles.title}>Report a Problem</Text>
              <Text style={styles.subtitle}>Tell us what went wrong with this response.</Text>
            </View>
            <TouchableOpacity onPress={onClose} hitSlop={8}>
              <Text style={styles.closeText}>Close</Text>
            </TouchableOpacity>
          </View>

          <ScrollView
            contentContainerStyle={styles.content}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.optionGroup}>
              {REPORT_OPTIONS.map((option) => {
                const isSelected = selectedReason === option;

                return (
                  <TouchableOpacity
                    key={option}
                    style={[styles.optionChip, isSelected && styles.optionChipSelected]}
                    onPress={() => setSelectedReason(option)}
                    activeOpacity={0.85}
                  >
                    <Text style={[styles.optionChipText, isSelected && styles.optionChipTextSelected]}>
                      {option}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <View style={styles.detailsGroup}>
              <Text style={styles.label}>More details</Text>
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
                style={styles.input}
              />
              <Text style={styles.wordCount}>{wordCount}/{MAX_WORDS} words</Text>
            </View>

            <BaseButton
              text="Submit"
              onPress={handleSubmit}
              height={48}
              useIcon={false}
              isLoading={false}
            />
          </ScrollView>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalCard: {
    width: "100%",
    maxWidth: 380,
    maxHeight: "85%",
    backgroundColor: "#F8F3E8",
    borderRadius: 24,
    padding: 20,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 12,
    marginBottom: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 20,
    color: "#6B7280",
    maxWidth: 260,
  },
  closeText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#6B7280",
  },
  content: {
    gap: 18,
  },
  optionGroup: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  optionChip: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: "#FFFDF8",
    borderWidth: 1,
    borderColor: "#E1D6C2",
  },
  optionChipSelected: {
    backgroundColor: COLORS.brandYellow,
    borderColor: COLORS.brandYellow,
  },
  optionChipText: {
    fontSize: 13,
    color: "#4B5563",
    textTransform: "capitalize",
  },
  optionChipTextSelected: {
    color: "#ffff",
  },
  detailsGroup: {
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1F2937",
  },
  input: {
    minHeight: 120,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#D9CCB6",
    backgroundColor: "#FFFDF8",
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: "#1F2937",
  },
  wordCount: {
    fontSize: 12,
    color: "#6B7280",
    textAlign: "right",
  },
});

export default ReportProblem;
