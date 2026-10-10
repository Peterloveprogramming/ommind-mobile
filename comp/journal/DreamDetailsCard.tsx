import React from "react";
import { Image, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import ChevronDown from "@/assets/svg/journal/ChevronDown";
import CollapseChevron from "@/assets/svg/journal/CollapseChevron";
import { FONTS } from "@/theme.js";
import {
  DREAM_DETAIL_SECTIONS,
  DREAM_DETAIL_TEXT_MAX_LENGTH,
  getSelectedDreamDetailOption,
  type DreamDetailChipSection,
  type DreamDetailKey,
  type DreamDetailSection,
  type DreamDetailTextSection,
  type DreamDetailValues,
} from "./dreamDetails";

const MAX_FONT_SIZE_MULTIPLIER = 1.3;
const CHIP_HIT_SLOP = { top: 4, bottom: 4 };

type DreamDetailsCardProps = {
  isExpanded: boolean;
  values: DreamDetailValues;
  onToggleExpanded: (isExpanded: boolean) => void;
  onChipPress: (section: DreamDetailChipSection, option: string) => void;
  onTextChange: (detailKey: DreamDetailKey, text: string) => void;
};

const DetailsTitle = () => (
  <Text style={styles.detailsTitle} maxFontSizeMultiplier={MAX_FONT_SIZE_MULTIPLIER}>
    <Text style={styles.detailsTitleSparkle}>✨</Text>
    {"  "}Optional details for a deeper reading
  </Text>
);

const DetailGroupHeader = ({ section }: { section: DreamDetailSection }) => (
  <View style={[styles.groupHeader, { gap: section.headerGap ?? 8 }]}>
    <Image
      source={section.icon}
      resizeMode={section.iconResizeMode ?? "cover"}
      style={{ width: section.iconSize, height: section.iconSize }}
    />
    <Text style={styles.groupTitle} maxFontSizeMultiplier={MAX_FONT_SIZE_MULTIPLIER}>
      {section.title}
    </Text>
  </View>
);

const DetailChipGroup = ({
  section,
  value,
  onChipPress,
}: {
  section: DreamDetailChipSection;
  value: string | null;
  onChipPress: DreamDetailsCardProps["onChipPress"];
}) => {
  const selectedOption = getSelectedDreamDetailOption(section, value);

  return (
    <View style={styles.group}>
      <DetailGroupHeader section={section} />
      <View style={styles.chips}>
        {section.options.map((option) => {
          const isSelected = option === selectedOption;

          return (
            <Pressable
              key={option}
              onPress={() => onChipPress(section, option)}
              hitSlop={CHIP_HIT_SLOP}
              accessibilityRole="button"
              accessibilityLabel={`${section.title}: ${option}`}
              accessibilityState={{ selected: isSelected }}
              style={styles.chip}
            >
              <Text
                numberOfLines={1}
                maxFontSizeMultiplier={MAX_FONT_SIZE_MULTIPLIER}
                style={[styles.chipText, isSelected && styles.chipTextSelected]}
              >
                {option}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
};

const DetailTextGroup = ({
  section,
  value,
  onTextChange,
}: {
  section: DreamDetailTextSection;
  value: string | null;
  onTextChange: DreamDetailsCardProps["onTextChange"];
}) => (
  <View style={styles.group}>
    <DetailGroupHeader section={section} />
    <TextInput
      multiline
      scrollEnabled={false}
      value={value ?? ""}
      onChangeText={(text) => onTextChange(section.key, text)}
      maxLength={DREAM_DETAIL_TEXT_MAX_LENGTH}
      placeholder={section.placeholder}
      placeholderTextColor="#757575"
      textAlignVertical="top"
      accessibilityLabel={section.title}
      style={styles.textInput}
    />
  </View>
);

export default function DreamDetailsCard({
  isExpanded,
  values,
  onToggleExpanded,
  onChipPress,
  onTextChange,
}: DreamDetailsCardProps) {
  if (!isExpanded) {
    return (
      <Pressable
        onPress={() => onToggleExpanded(true)}
        accessibilityRole="button"
        accessibilityLabel="Optional details for a deeper reading"
        accessibilityState={{ expanded: false }}
        style={[styles.card, styles.collapsedRow]}
      >
        <View style={styles.collapsedTitleWrap}>
          <DetailsTitle />
        </View>
        <ChevronDown />
      </Pressable>
    );
  }

  return (
    <View style={[styles.card, styles.expandedCard]}>
      <View style={styles.expandedContent}>
        <Pressable
          onPress={() => onToggleExpanded(false)}
          accessibilityRole="button"
          accessibilityLabel="Optional details for a deeper reading"
          accessibilityState={{ expanded: true }}
          style={styles.expandedHeader}
        >
          <DetailsTitle />
        </Pressable>

        {DREAM_DETAIL_SECTIONS.map((section) =>
          section.kind === "chips" ? (
            <DetailChipGroup
              key={section.key}
              section={section}
              value={values[section.key]}
              onChipPress={onChipPress}
            />
          ) : (
            <DetailTextGroup
              key={section.key}
              section={section}
              value={values[section.key]}
              onTextChange={onTextChange}
            />
          )
        )}
      </View>

      <Pressable
        onPress={() => onToggleExpanded(false)}
        hitSlop={{ top: 10, bottom: 10 }}
        accessibilityRole="button"
        accessibilityLabel="Collapse optional dream details"
        style={styles.collapseButton}
      >
        <CollapseChevron />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 20,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "rgba(143,143,143,0.34)",
    borderRadius: 10,
  },
  collapsedRow: {
    height: 40,
    flexDirection: "row",
    alignItems: "center",
    paddingLeft: 10,
    paddingRight: 20,
  },
  collapsedTitleWrap: {
    flex: 1,
    marginRight: 10,
  },
  detailsTitle: {
    fontFamily: FONTS.figtreeMedium500,
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: -0.24,
    color: "#000000",
    includeFontPadding: false,
  },
  detailsTitleSparkle: {
    fontSize: 15,
    color: "#F8C63E",
  },
  expandedCard: {
    paddingTop: 9,
    paddingBottom: 15,
    overflow: "hidden",
  },
  expandedContent: {
    paddingHorizontal: 7,
    gap: 10,
  },
  expandedHeader: {
    minHeight: 20,
    justifyContent: "center",
  },
  group: {
    paddingVertical: 3,
    gap: 6,
  },
  groupHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 7,
    paddingVertical: 1,
  },
  groupTitle: {
    flexShrink: 1,
    fontFamily: FONTS.figtreeMedium500,
    fontSize: 15,
    lineHeight: 20,
    letterSpacing: -0.24,
    color: "#000000",
    includeFontPadding: false,
  },
  chips: {
    flexDirection: "row",
    flexWrap: "wrap",
    rowGap: 5,
    columnGap: 6,
    paddingHorizontal: 5,
  },
  chip: {
    height: 27,
    paddingHorizontal: 9,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FAFAFA",
    borderWidth: 0.5,
    borderColor: "#ECE0D7",
    borderRadius: 5,
  },
  chipText: {
    fontFamily: FONTS.figtreeMedium500,
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: -0.24,
    color: "#757575",
    includeFontPadding: false,
  },
  chipTextSelected: {
    color: "#000000",
  },
  textInput: {
    marginHorizontal: 5,
    minHeight: 47,
    paddingHorizontal: 9,
    paddingVertical: 4,
    backgroundColor: "#FAFAFA",
    borderWidth: 0.5,
    borderColor: "#ECE0D7",
    borderRadius: 5,
    fontFamily: FONTS.figtreeMedium500,
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: -0.24,
    color: "#000000",
    includeFontPadding: false,
  },
  collapseButton: {
    height: 15,
    marginTop: 5,
    alignItems: "center",
    justifyContent: "center",
  },
});
