import React, { useCallback, useEffect } from "react";
import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import type {
  MeditationCourse,
  MeditationCourseDescriptionSection,
  MeditationCourseSession,
} from "@/api/meditation/types";
import { images } from "@/constants/images";
import { colors } from "@/constants/colors";
import { FONTS } from "@/theme";
import BaseButton from "../base/BaseButton";
import { useMeditationCourses } from "@/api/meditation/useMeditationCourses";
import ChevronLeft from "@/assets/svg/chat/ChevronLeft";
import ShareIcon from "@/assets/svg/meditation_session/ShareIcon";
import BookmarkIcon from "@/assets/svg/meditation_session/BookmarkIcon";
import PlayIcon from "@/assets/svg/meditation_session/PlayIcon";
import LockIcon from "@/assets/svg/meditation_session/LockIcon";
import CheckItemIcon from "@/assets/svg/meditation_session/CheckItemIcon";
import DotIcon from "@/assets/svg/meditation_session/DotIcon";

// Figma 37GSSpgSU44KPNvLuVKAOw node 2445:8309 (394pt-wide frame).
const SESSION_UI = {
  // Hero is 394×281 in Figma; keep that ratio and cap it on tablets.
  heroAspectRatio: 394 / 281,
  heroMaxHeight: 420,
  maxContentWidth: 600,
  gutter: 23,
  sectionGap: 24,
  // Nav bar sits 7pt above the bottom of the status bar (52 vs 59 in Figma).
  headerTopOffset: -7,
  headerMinTop: 12,
  headerButtonSize: 48,
  bottomPadding: 40,
  maxFontSizeMultiplier: 1.3,
} as const;

const TEXT = {
  muted: "#8B8B8B",
  subtle: "#8E8E93",
  heading: "rgba(15, 9, 9, 0.74)",
  tag: "#FFA800",
};

type SessionCardProps = {
  title: string;
  completed: boolean;
  locked: boolean;
  favourite: MeditationCourseSession["favourite"];
  messageId?: MeditationCourseSession["message_id"];
  courseUuid: string;
  courseNumber: number;
  sessionNumber: number;
  sessionLengthInMins: number;
  meditationType: string;
  imageUrl: string;
  backgroundUrl: string;
  sessionTitles: string;
  sessionMetadata: string;
  progress?: number | null;
};

type PlayerRouteProps = Omit<SessionCardProps, "completed" | "locked">;

const pushSessionPlayer = (
  router: ReturnType<typeof useRouter>,
  {
    title,
    favourite,
    messageId,
    courseUuid,
    courseNumber,
    sessionNumber,
    meditationType,
    imageUrl,
    backgroundUrl,
    sessionTitles,
    sessionMetadata,
    progress,
  }: PlayerRouteProps,
) => {
  router.push({
    pathname: "/meditation_session/player",
    params: {
      title,
      favourite: String(favourite),
      message_id: messageId == null ? "" : String(messageId),
      course_uuid: courseUuid,
      course_number: String(courseNumber),
      session_number: String(sessionNumber),
      type: meditationType,
      image_url: imageUrl,
      backgroundUrl: backgroundUrl,
      session_titles: sessionTitles,
      session_metadata: sessionMetadata,
      progress: progress == null ? "" : String(progress),
    },
  });
};

const SessionCard = ({ completed, locked, ...routeProps }: SessionCardProps) => {
  const router = useRouter();

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${routeProps.title}, ${routeProps.sessionLengthInMins} minutes`}
      accessibilityState={{ disabled: locked, checked: completed }}
      disabled={locked}
      onPress={() => pushSessionPlayer(router, routeProps)}
      style={({ pressed }) => [styles.sessionCard, pressed && styles.pressed]}
    >
      <Text maxFontSizeMultiplier={SESSION_UI.maxFontSizeMultiplier} style={styles.sessionCardTitle}>
        {routeProps.title}
      </Text>
      <View style={styles.sessionCardMetaRow}>
        <View style={styles.sessionCardDuration}>
          <CheckItemIcon checked={completed} />
          <Text
            maxFontSizeMultiplier={SESSION_UI.maxFontSizeMultiplier}
            style={styles.sessionCardDurationText}
          >
            {routeProps.sessionLengthInMins} Min
          </Text>
        </View>
        {locked ? <LockIcon /> : null}
      </View>
    </Pressable>
  );
};

const Tag = ({ tag }: { tag: string }) => (
  <View style={styles.tag}>
    <Text maxFontSizeMultiplier={SESSION_UI.maxFontSizeMultiplier} style={styles.tagText}>
      {tag}
    </Text>
  </View>
);

const BodyText = ({ children }: { children: React.ReactNode }) => (
  <Text maxFontSizeMultiplier={SESSION_UI.maxFontSizeMultiplier} style={styles.bodyText}>
    {children}
  </Text>
);

const DescriptionSection = ({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) => (
  <View style={styles.descriptionSection}>
    <Text
      accessibilityRole="header"
      maxFontSizeMultiplier={SESSION_UI.maxFontSizeMultiplier}
      style={styles.sectionHeading}
    >
      {title}
    </Text>
    <View>{children}</View>
  </View>
);

const renderParagraphs = (paragraphs: string[]) =>
  paragraphs.map((paragraph) => <BodyText key={paragraph}>{paragraph}</BodyText>);

const renderDescriptionSection = (section: MeditationCourseDescriptionSection) => (
  <>
    {section.intro ? <BodyText>{section.intro}</BodyText> : null}
    {section.bullets?.map((bullet) => (
      <BodyText key={bullet}>
        {"•"} {bullet}
      </BodyText>
    ))}
    {section.outro ? <BodyText>{section.outro}</BodyText> : null}
  </>
);

const MeditationSession = () => {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const params = useLocalSearchParams<{ uuid?: string; type?: string }>();
  const { courseDetails, detailsStatus, fetchMeditationCourseDetails } = useMeditationCourses({
    courseDetailsUuid: params.uuid,
    debugLabel: "MeditationSession",
    enableDebugLogging: true,
  });

  useEffect(() => {
    if (!__DEV__) {
      return;
    }

    console.log("[MeditationSession] render state", {
      uuid: params.uuid,
      type: params.type,
      hasCourseDetails: Boolean(courseDetails),
      detailsStatus,
      title: courseDetails?.title,
      sessionCount: courseDetails?.sessions.length ?? 0,
    });
  }, [courseDetails, detailsStatus, params.type, params.uuid]);

  const fetchDetails = useCallback(() => {
    if (!params.uuid || !params.type) {
      if (__DEV__) {
        console.log("[MeditationSession] missing route params; skipping course details fetch", {
          uuid: params.uuid,
          type: params.type,
        });
      }
      return;
    }

    void fetchMeditationCourseDetails({
      uuid: params.uuid,
      type: params.type as MeditationCourse["type"],
    });
  }, [fetchMeditationCourseDetails, params.type, params.uuid]);

  useFocusEffect(fetchDetails);

  const handleBack = () => {
    router.dismissTo("/explore");
  };

  const heroHeight = Math.min(width / SESSION_UI.heroAspectRatio, SESSION_UI.heroMaxHeight);
  const headerTop = Math.max(insets.top + SESSION_UI.headerTopOffset, SESSION_UI.headerMinTop);

  // Floats over the hero on every state so the back button is always reachable.
  const header = (
    <View style={[styles.header, { top: headerTop }]} pointerEvents="box-none">
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Go back"
        hitSlop={8}
        onPress={handleBack}
        style={({ pressed }) => [styles.headerButton, pressed && styles.pressed]}
      >
        <ChevronLeft />
      </Pressable>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Share"
        hitSlop={8}
        style={({ pressed }) => [styles.headerButton, pressed && styles.pressed]}
      >
        <ShareIcon />
      </Pressable>
    </View>
  );

  if (!courseDetails) {
    const failed = detailsStatus === "error";

    return (
      <View style={styles.screen}>
        <StatusBar style="dark" />
        <View style={[styles.stateContainer, { paddingTop: headerTop }]}>
          {failed ? null : <ActivityIndicator color={colors.brand3} />}
          <Text maxFontSizeMultiplier={SESSION_UI.maxFontSizeMultiplier} style={styles.stateTitle}>
            {failed ? "Couldn't Load This Course" : "Meditation Course Is Loading"}
          </Text>
          <Text
            maxFontSizeMultiplier={SESSION_UI.maxFontSizeMultiplier}
            style={styles.stateDescription}
          >
            {failed
              ? "Please check your connection and try again."
              : "Please wait while we prepare the course details for you."}
          </Text>
          {failed ? (
            <BaseButton text="Try Again" onPress={fetchDetails} height={44} style={styles.retry} />
          ) : null}
        </View>
        {header}
      </View>
    );
  }

  const sessionTitles = JSON.stringify(
    courseDetails.sessions.reduce<Record<string, string>>((titlesBySession, session) => {
      titlesBySession[String(session.session_number)] = `Session ${session.session_number}: ${session.session_title}`;
      return titlesBySession;
    }, {}),
  );
  const sessionMetadata = JSON.stringify(
    courseDetails.sessions.reduce<
      Record<string, Pick<MeditationCourseSession, "favourite" | "message_id">>
    >((metadataBySession, session) => {
      metadataBySession[String(session.session_number)] = {
        favourite: session.favourite,
        message_id: session.message_id ?? null,
      };
      return metadataBySession;
    }, {}),
  );
  const toRouteProps = (session: MeditationCourseSession): PlayerRouteProps => ({
    title: `Session ${session.session_number}: ${session.session_title}`,
    favourite: session.favourite,
    messageId: session.message_id,
    courseUuid: courseDetails.uuid,
    courseNumber: courseDetails.course_number,
    sessionNumber: session.session_number,
    sessionLengthInMins: session.session_length,
    meditationType: courseDetails.type,
    imageUrl: courseDetails.image_url,
    backgroundUrl: courseDetails.background_url,
    sessionTitles,
    sessionMetadata,
    progress: session.progress,
  });
  const firstSession = courseDetails.sessions[0];
  const handlePlay = () => {
    if (firstSession) {
      pushSessionPlayer(router, toRouteProps(firstSession));
    }
  };

  return (
    <View style={styles.screen}>
      <StatusBar style="dark" />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + SESSION_UI.bottomPadding }}
      >
        <Image
          source={courseDetails.image_url ? { uri: courseDetails.image_url } : images.meditation_test}
          resizeMode="cover"
          style={[styles.hero, { height: heroHeight }]}
          accessibilityIgnoresInvertColors
        />

        <View style={styles.content}>
          <View style={styles.intro}>
            <View style={styles.metaRow}>
              <Text maxFontSizeMultiplier={SESSION_UI.maxFontSizeMultiplier} style={styles.metaText}>
                {courseDetails.number_of_sessions} Sessions
              </Text>
              <DotIcon />
              <Text maxFontSizeMultiplier={SESSION_UI.maxFontSizeMultiplier} style={styles.metaText}>
                Guided Meditation
              </Text>
            </View>

            <View style={styles.titleRow}>
              <Text
                accessibilityRole="header"
                maxFontSizeMultiplier={SESSION_UI.maxFontSizeMultiplier}
                style={styles.title}
              >
                {`${courseDetails.proper_type_name} ${courseDetails.course_number}: ${courseDetails.title}`}
              </Text>
              {/* No course-level saved state in the API yet, so this mirrors Figma only. */}
              <BookmarkIcon color="#1E1E1E" />
            </View>

            <Text maxFontSizeMultiplier={SESSION_UI.maxFontSizeMultiplier} style={styles.metaText}>
              By <Text style={styles.underline}>OmMind</Text>
            </Text>
          </View>

          <BaseButton
            onPress={handlePlay}
            text="Play"
            height={44}
            useIcon
            icon={<PlayIcon />}
            disabled={!firstSession}
            style={styles.playButton}
          />

          <View style={styles.sessionList}>
            {courseDetails.sessions.map((session) => (
              <SessionCard
                key={session.session_number}
                {...toRouteProps(session)}
                completed={session.session_completed === 1}
                locked={false}
              />
            ))}
          </View>

          <DescriptionSection title="About This Series">
            {renderParagraphs(courseDetails.description.about_this_series)}
          </DescriptionSection>

          {courseDetails.tags.length > 0 ? (
            <View style={styles.tags}>
              {courseDetails.tags.map((tag) => (
                <Tag key={tag} tag={tag} />
              ))}
            </View>
          ) : null}

          <DescriptionSection title="Who This Is For">
            {renderDescriptionSection(courseDetails.description.who_this_is_for)}
          </DescriptionSection>

          <DescriptionSection title="Source & Integrity">
            {renderParagraphs(courseDetails.description.source_and_integrity)}
          </DescriptionSection>

          <DescriptionSection title="What You Can Expect">
            {renderDescriptionSection(courseDetails.description.what_you_can_expect)}
          </DescriptionSection>
        </View>
      </ScrollView>
      {header}
    </View>
  );
};

export default MeditationSession;

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#FAFAFA",
  },
  header: {
    position: "absolute",
    left: 0,
    right: 0,
    paddingHorizontal: SESSION_UI.gutter,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerButton: {
    width: SESSION_UI.headerButtonSize,
    height: SESSION_UI.headerButtonSize,
    borderRadius: SESSION_UI.headerButtonSize / 2,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(71, 71, 71, 0.3)",
  },
  pressed: {
    opacity: 0.7,
  },
  hero: {
    width: "100%",
    backgroundColor: "#E8E6E6",
  },
  content: {
    width: "100%",
    maxWidth: SESSION_UI.maxContentWidth,
    alignSelf: "center",
    paddingTop: 20,
    paddingHorizontal: SESSION_UI.gutter,
    gap: SESSION_UI.sectionGap,
  },
  intro: {
    gap: 10,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  metaText: {
    fontFamily: FONTS.figtreeMedium,
    fontSize: 16,
    lineHeight: 20,
    letterSpacing: 0.8,
    color: TEXT.muted,
  },
  underline: {
    textDecorationLine: "underline",
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    // 347pt row − 280pt title − 24pt icon in Figma.
    gap: 43,
  },
  title: {
    flex: 1,
    fontFamily: FONTS.figtreeSemiBold,
    fontSize: 24,
    lineHeight: 28,
    color: "#000000",
  },
  playButton: {
    paddingLeft: 20,
    paddingRight: 24,
  },
  sessionList: {
    gap: 5,
  },
  sessionCard: {
    backgroundColor: "#EFEFEF",
    borderRadius: 10,
    padding: 10,
    gap: 4,
  },
  sessionCardTitle: {
    fontFamily: FONTS.figtreeSemiBold,
    fontSize: 15,
    lineHeight: 22,
    letterSpacing: -0.408,
    color: "#000000",
  },
  sessionCardMetaRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  sessionCardDuration: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  sessionCardDurationText: {
    fontFamily: FONTS.figtreeMedium,
    fontSize: 13,
    lineHeight: 18,
    letterSpacing: -0.078,
    color: TEXT.subtle,
  },
  descriptionSection: {
    gap: 16,
  },
  sectionHeading: {
    fontFamily: FONTS.figtreeSemiBold,
    fontSize: 20,
    lineHeight: 24,
    letterSpacing: 0.4,
    color: TEXT.heading,
  },
  bodyText: {
    fontFamily: FONTS.figtreeMedium,
    fontSize: 16,
    lineHeight: 21,
    letterSpacing: 0.8,
    color: TEXT.muted,
  },
  tags: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  tag: {
    height: 36,
    paddingHorizontal: 15,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 25,
    borderWidth: 1,
    borderColor: colors.brand3,
    backgroundColor: "rgba(248, 198, 62, 0.2)",
  },
  tagText: {
    fontFamily: FONTS.interSemiBold,
    fontSize: 13,
    lineHeight: 18,
    letterSpacing: -0.078,
    color: TEXT.tag,
  },
  stateContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
    gap: 10,
  },
  stateTitle: {
    fontFamily: FONTS.figtreeSemiBold,
    fontSize: 24,
    lineHeight: 28,
    color: "#0F0909",
    textAlign: "center",
  },
  stateDescription: {
    fontFamily: FONTS.figtreeMedium,
    fontSize: 16,
    lineHeight: 24,
    color: TEXT.muted,
    textAlign: "center",
  },
  retry: {
    marginTop: 10,
    paddingHorizontal: 32,
  },
});
