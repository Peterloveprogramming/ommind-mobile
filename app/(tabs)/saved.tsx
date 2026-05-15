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

const getSessionKey = (item: RecentlyAccessedSession, index: number) =>
  `${item.type}-${item.course_number ?? "generated"}-${item.session_number ?? item.message_id ?? "session"}-${item.id}-${index}`;

const formatSessionLength = (value: number | null | undefined) => {
  const minutes = value ?? 0;
  return `${minutes} ${minutes === 1 ? "min" : "mins"}`;
};

const Saved = () => {
  const router = useRouter();
  const insets = useSafeAreaInsets();
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
        <Text style={styles.headerTitle}>Saved</Text>
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
