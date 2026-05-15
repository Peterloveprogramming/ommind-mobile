import { useUserApi } from "@/api/api";
import { RecentlyAccessedSession } from "@/api/types";
import BackButton from "@/comp/headers/BackButton";
import { images } from "@/constants/images";
import { FONTS } from "@/theme";
import { checkIfLambdaResultIsSuccess, getLambdaErrorMessage } from "@/utils/helper";
import { useFocusEffect, useRouter } from "expo-router";
import React from "react";
import {
  ActivityIndicator,
  BackHandler,
  FlatList,
  Image,
  ImageSourcePropType,
  ListRenderItem,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const PAGE_SIZE = 5;

const getSessionKey = (item: RecentlyAccessedSession, index: number) =>
  `${item.type}-${item.course_number ?? "generated"}-${item.session_number ?? item.message_id ?? "session"}-${item.id}-${index}`;

const formatSessionLength = (value: number | null | undefined) => {
  const minutes = value ?? 0;
  return `${minutes} ${minutes === 1 ? "min" : "mins"}`;
};

const RecentlyPlayed = () => {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const {
    getRecentlyAccessedMeditationSessionsByUserId: {
      getRecentlyAccessedMeditationSessionsByUserId,
    },
  } = useUserApi();
  const [sessions, setSessions] = React.useState<RecentlyAccessedSession[]>([]);
  const [isInitialLoading, setIsInitialLoading] = React.useState(true);
  const [isFetchingMore, setIsFetchingMore] = React.useState(false);
  const [isRefreshing, setIsRefreshing] = React.useState(false);
  const [hasMoreSessions, setHasMoreSessions] = React.useState(true);
  const [errorMessage, setErrorMessage] = React.useState("");
  const nextOffsetRef = React.useRef(0);
  const isFetchingRef = React.useRef(false);
  const hasMoreSessionsRef = React.useRef(true);
  const fetchRecentlyPlayedRef = React.useRef(getRecentlyAccessedMeditationSessionsByUserId);

  React.useEffect(() => {
    fetchRecentlyPlayedRef.current = getRecentlyAccessedMeditationSessionsByUserId;
  }, [getRecentlyAccessedMeditationSessionsByUserId]);

  const handleBackPress = React.useCallback(() => {
    router.replace("/profile");
  }, [router]);

  const handleSessionPress = (item: RecentlyAccessedSession) => {
    const isGenerated = item.is_generated === 1;

    router.push({
      pathname: "/meditation_session/player",
      params: {
        type: item.type,
        favourite: String(item.favourite ?? 0),
        course_number: item.course_number == null ? "" : String(item.course_number),
        session_number: item.session_number == null ? "" : String(item.session_number),
        title: item.session_title,
        image_url: item.image_url ?? "",
        backgroundUrl: item.background_url ?? "",
        progress: item.session_progress_in_secs == null ? "" : String(item.session_progress_in_secs),
        is_generated: isGenerated ? "1" : "0",
        message_id: item.message_id == null ? "" : String(item.message_id),
      },
    });
  };

  const loadRecentlyPlayed = React.useCallback(
    async ({ reset = false }: { reset?: boolean } = {}) => {
      if (isFetchingRef.current || (!reset && !hasMoreSessionsRef.current)) {
        return;
      }

      isFetchingRef.current = true;
      setErrorMessage("");

      if (reset) {
        nextOffsetRef.current = 0;
        hasMoreSessionsRef.current = true;
        setHasMoreSessions(true);
      }

      const requestedOffset = nextOffsetRef.current;

      try {
        const result = await fetchRecentlyPlayedRef.current({
          offset: requestedOffset,
          limit: PAGE_SIZE,
        });

        if (!checkIfLambdaResultIsSuccess(result)) {
          setErrorMessage(getLambdaErrorMessage(result));
          return;
        }

        const nextSessions = result.data?.recently_accessed_sessions ?? [];

        setSessions((currentSessions) => (
          reset ? nextSessions : [...currentSessions, ...nextSessions]
        ));
        nextOffsetRef.current = requestedOffset + PAGE_SIZE;
        hasMoreSessionsRef.current = nextSessions.length === PAGE_SIZE;
        setHasMoreSessions(hasMoreSessionsRef.current);
      } catch (error) {
        console.error("Failed to fetch recently played sessions", error);
        setErrorMessage("Unable to load recently played sessions right now.");
      } finally {
        isFetchingRef.current = false;
        setIsInitialLoading(false);
        setIsFetchingMore(false);
        setIsRefreshing(false);
      }
    },
    []
  );

  useFocusEffect(
    React.useCallback(() => {
      void loadRecentlyPlayed({ reset: true });
    }, [loadRecentlyPlayed])
  );

  useFocusEffect(
    React.useCallback(() => {
      const backSubscription = BackHandler.addEventListener("hardwareBackPress", () => {
        handleBackPress();
        return true;
      });

      return () => backSubscription.remove();
    }, [handleBackPress])
  );

  const handleEndReached = () => {
    if (isInitialLoading || isFetchingMore || isFetchingRef.current || !hasMoreSessions) {
      return;
    }

    setIsFetchingMore(true);
    void loadRecentlyPlayed();
  };

  const handleRefresh = () => {
    if (isFetchingRef.current) {
      return;
    }

    setIsRefreshing(true);
    void loadRecentlyPlayed({ reset: true });
  };

  const renderSession: ListRenderItem<RecentlyAccessedSession> = ({ item }) => {
    const imageSource: ImageSourcePropType = item.image_url
      ? { uri: item.image_url }
      : images.meditation_test;

    return (
      <TouchableOpacity
        activeOpacity={0.86}
        onPress={() => handleSessionPress(item)}
        style={styles.sessionCard}
      >
        <Image source={imageSource} style={styles.sessionImage} />

        <View style={styles.sessionDetails}>
          {item.is_generated === 1 ? null : (
            <Text style={styles.sessionLength}>{formatSessionLength(item.session_length_in_mins)}</Text>
          )}
          <Text style={styles.sessionTitle} numberOfLines={2}>
            {item.session_title}
          </Text>
          <Text style={styles.sessionType}>
            {item.is_generated === 1 ? "Generated Guided Meditation" : "Guided Meditation"}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: Math.max(insets.top, 20) }]}>
        <View style={styles.backButtonWrap}>
          <BackButton onTouch={handleBackPress} />
        </View>
        <Text style={styles.headerTitle}>Recently Played</Text>
        <View style={styles.headerSpacer} />
      </View>

      {isInitialLoading ? (
        <View style={styles.loadingWrap}>
          <ActivityIndicator color="#B88A1A" size="large" />
        </View>
      ) : (
        <FlatList
          data={sessions}
          keyExtractor={getSessionKey}
          renderItem={renderSession}
          contentContainerStyle={[
            styles.listContent,
            { paddingBottom: insets.bottom + 126 },
            sessions.length === 0 && styles.emptyListContent,
          ]}
          showsVerticalScrollIndicator={false}
          onEndReached={handleEndReached}
          onEndReachedThreshold={0.45}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={handleRefresh}
              tintColor="#B88A1A"
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyWrap}>
              <Text style={styles.emptyTitle}>No recently played sessions yet.</Text>
              {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}
            </View>
          }
          ListFooterComponent={
            isFetchingMore ? (
              <View style={styles.footerLoading}>
                <ActivityIndicator color="#B88A1A" />
              </View>
            ) : errorMessage && sessions.length > 0 ? (
              <Text style={styles.footerError}>{errorMessage}</Text>
            ) : null
          }
        />
      )}
    </View>
  );
};

export default RecentlyPlayed;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F7F7F7",
  },
  header: {
    minHeight: 86,
    paddingHorizontal: 20,
    paddingBottom: 18,
    flexDirection: "row",
    alignItems: "center",
  },
  backButtonWrap: {
    width: 62,
    alignItems: "flex-start",
  },
  headerTitle: {
    flex: 1,
    textAlign: "center",
    fontFamily: FONTS.figtreeSemiBold,
    fontSize: 20,
    lineHeight: 26,
    color: "#000000",
  },
  headerSpacer: {
    width: 62,
  },
  loadingWrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  listContent: {
    paddingHorizontal: 20,
    gap: 12,
  },
  emptyListContent: {
    flexGrow: 1,
    justifyContent: "center",
  },
  sessionCard: {
    height: 154,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#E4E1DD",
    backgroundColor: "#FFFFFF",
    overflow: "hidden",
    flexDirection: "row",
  },
  sessionImage: {
    width: 154,
    height: 154,
    resizeMode: "cover",
  },
  sessionDetails: {
    flex: 1,
    paddingHorizontal: 14,
    paddingVertical: 18,
    justifyContent: "center",
  },
  sessionLength: {
    fontFamily: FONTS.figtreeMedium,
    fontSize: 15,
    lineHeight: 20,
    color: "#8B8B8B",
  },
  sessionTitle: {
    marginTop: 6,
    fontFamily: FONTS.figtreeSemiBold,
    fontSize: 20,
    lineHeight: 24,
    color: "#4D4A4A",
  },
  sessionType: {
    marginTop: 22,
    fontFamily: FONTS.figtreeMedium,
    fontSize: 15,
    lineHeight: 20,
    color: "#8B8B8B",
  },
  footerLoading: {
    paddingVertical: 20,
  },
  footerError: {
    paddingVertical: 16,
    textAlign: "center",
    fontFamily: FONTS.inter,
    fontSize: 14,
    lineHeight: 20,
    color: "#B73A45",
  },
  emptyWrap: {
    alignItems: "center",
    paddingHorizontal: 24,
  },
  emptyTitle: {
    textAlign: "center",
    fontFamily: FONTS.inter,
    fontSize: 15,
    lineHeight: 22,
    color: "#8B8B8B",
  },
  errorText: {
    marginTop: 10,
    textAlign: "center",
    fontFamily: FONTS.inter,
    fontSize: 14,
    lineHeight: 20,
    color: "#B73A45",
  },
});
