import { useUserApi } from "@/api/api";
import { RecentlyAccessedSession } from "@/api/types";
import MeditationSessionCard from "@/comp/meditation_session/MeditationSessionCard";
import ProfileScreenHeader, { PROFILE_HEADER_UI } from "@/comp/profile/ProfileScreenHeader";
import { FONTS } from "@/theme";
import { checkIfLambdaResultIsSuccess, getLambdaErrorMessage } from "@/utils/helper";
import { useFocusEffect, useRouter } from "expo-router";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import React from "react";
import {
  ActivityIndicator,
  BackHandler,
  FlatList,
  ListRenderItem,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from "react-native";

// Figma 2919:11933 list (394 x 852 frame): cards 8 apart, starting 26 below the header.
const SESSION_LIST_UI = {
  background: "#FAFAFA",
  topSpacing: 26,
  cardGap: 8,
  bottomSpacing: 24,
} as const;

const getSessionKey = (item: RecentlyAccessedSession, index: number) =>
  `${item.type}-${item.course_number ?? "generated"}-${item.session_number ?? item.message_id ?? "session"}-${item.id}-${index}`;

const Saved = () => {
  const router = useRouter();
  const tabBarHeight = useBottomTabBarHeight();
  const {
    getFavourite: { getFavourite },
  } = useUserApi();
  const [sessions, setSessions] = React.useState<RecentlyAccessedSession[]>([]);
  const [isInitialLoading, setIsInitialLoading] = React.useState(true);
  const [isRefreshing, setIsRefreshing] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState("");
  const isFetchingRef = React.useRef(false);
  const getFavouriteRef = React.useRef(getFavourite);

  React.useEffect(() => {
    getFavouriteRef.current = getFavourite;
  }, [getFavourite]);

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

  const loadSavedSessions = React.useCallback(async () => {
    if (isFetchingRef.current) {
      return;
    }

    isFetchingRef.current = true;
    setErrorMessage("");

    try {
      const result = await getFavouriteRef.current();

      if (!checkIfLambdaResultIsSuccess(result)) {
        setErrorMessage(getLambdaErrorMessage(result));
        return;
      }

      setSessions(result.data?.favourite_sessions ?? []);
    } catch (error) {
      console.error("Failed to fetch saved sessions", error);
      setErrorMessage("Unable to load saved sessions right now.");
    } finally {
      isFetchingRef.current = false;
      setIsInitialLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      void loadSavedSessions();
    }, [loadSavedSessions])
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

  const handleRefresh = () => {
    if (isFetchingRef.current) {
      return;
    }

    setIsRefreshing(true);
    void loadSavedSessions();
  };

  const renderSession: ListRenderItem<RecentlyAccessedSession> = ({ item }) => (
    <MeditationSessionCard
      variant="list"
      session_length={item.session_length_in_mins ?? 0}
      session_title={item.session_title}
      image_url={item.image_url ?? undefined}
      generated_meditation={item.is_generated}
      onPress={() => handleSessionPress(item)}
    />
  );

  return (
    <View style={styles.container}>
      <ProfileScreenHeader title="Saved" titleVariant="regular" onBackPress={handleBackPress} />

      {isInitialLoading ? (
        <View style={styles.loadingWrap}>
          <ActivityIndicator color="#B88A1A" size="large" />
        </View>
      ) : (
        <FlatList
          style={styles.list}
          data={sessions}
          keyExtractor={getSessionKey}
          renderItem={renderSession}
          contentContainerStyle={[
            styles.listContent,
            { paddingBottom: tabBarHeight + SESSION_LIST_UI.bottomSpacing },
            sessions.length === 0 && styles.emptyListContent,
          ]}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={handleRefresh}
              tintColor="#B88A1A"
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyWrap}>
              <Text style={styles.emptyTitle}>No saved sessions yet.</Text>
              {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}
            </View>
          }
        />
      )}
    </View>
  );
};

export default Saved;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: SESSION_LIST_UI.background,
  },
  list: {
    flex: 1,
  },
  loadingWrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  listContent: {
    width: "100%",
    maxWidth: PROFILE_HEADER_UI.maxContentWidth,
    alignSelf: "center",
    paddingHorizontal: PROFILE_HEADER_UI.gutter,
    paddingTop: SESSION_LIST_UI.topSpacing,
    gap: SESSION_LIST_UI.cardGap,
  },
  emptyListContent: {
    flexGrow: 1,
    justifyContent: "center",
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
