import { FONTS } from "@/theme";
import { useMeditationApi } from "@/api/meditation/requests";
import { checkSpeechToTextServiceHealthRequest } from "@/api/speechToText/requests";
import AudioTest from "@/dummy/tests/AudioTest";
import {
  getAudioServiceWebsocketUrl,
  requestAudioTestingAction,
  sendAudioTestingAction,
} from "@/development_testing/services/audioTestingService";
import { useAppDispatch } from "@/store/hooks";
import { clearHomePageInfo } from "@/store/slices/HomePageInfoSlice";
import { checkIfLambdaResultIsSuccess, getLambdaErrorMessage } from "@/utils/helper";
import React from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

type TestButtonsPopupProps = {
  visible: boolean;
  onClose: () => void;
};

const TestButtonsPopup = ({ visible, onClose }: TestButtonsPopupProps) => {
  const dispatch = useAppDispatch();
  const { resetDailyMood } = useMeditationApi();
  const [isResettingDailyMood, setIsResettingDailyMood] = React.useState(false);
  const [isAudioExpanded, setIsAudioExpanded] = React.useState(false);
  const [isAudioTestingVisible, setIsAudioTestingVisible] = React.useState(false);
  const [isSpeechToTextTestingVisible, setIsSpeechToTextTestingVisible] = React.useState(false);
  const [audioActionLoading, setAudioActionLoading] = React.useState<
    "start" | "stop" | "health" | null
  >(null);
  const [audioStatusText, setAudioStatusText] = React.useState("");
  const [statusText, setStatusText] = React.useState("");
  const [isCheckingSpeechToTextHealth, setIsCheckingSpeechToTextHealth] = React.useState(false);
  const [speechToTextStatusText, setSpeechToTextStatusText] = React.useState("");

  React.useEffect(() => {
    if (visible) {
      setIsAudioExpanded(false);
      setIsAudioTestingVisible(false);
      setIsSpeechToTextTestingVisible(false);
      setAudioStatusText("");
      setStatusText("");
      setSpeechToTextStatusText("");
    }
  }, [visible]);

  const showAudioResult = (message: string, wsUrl?: string) => {
    setAudioStatusText(wsUrl ? `${message}\n${wsUrl}` : message);
  };

  const handleStartAudioServicePress = async () => {
    if (audioActionLoading) {
      return;
    }

    setAudioActionLoading("start");
    showAudioResult("Checking audio service...");

    try {
      const healthResponse = await requestAudioTestingAction("health");
      const healthWsUrl = getAudioServiceWebsocketUrl(healthResponse);

      if (healthResponse.data?.isRunning) {
        showAudioResult("Audio service is already running.", healthWsUrl);
        return;
      }

      sendAudioTestingAction("start");
      showAudioResult("Audio service start request sent successfully.");
    } catch (error) {
      console.error("Failed to start audio service", error);
      showAudioResult("Unable to start audio service.");
    } finally {
      setAudioActionLoading(null);
    }
  };

  const handleStopAudioServicePress = async () => {
    if (audioActionLoading) {
      return;
    }

    setAudioActionLoading("stop");
    showAudioResult("Stopping audio service...");

    try {
      await requestAudioTestingAction("stop");
      showAudioResult("Audio service stopped.");
    } catch (error) {
      console.error("Failed to stop audio service", error);
      showAudioResult("Unable to stop audio service.");
    } finally {
      setAudioActionLoading(null);
    }
  };

  const handleCheckAudioHealthPress = async () => {
    if (audioActionLoading) {
      return;
    }

    setAudioActionLoading("health");
    showAudioResult("Checking audio health...");

    try {
      const response = await requestAudioTestingAction("health");
      const wsUrl = getAudioServiceWebsocketUrl(response);
      showAudioResult(
        response.data?.isRunning ? "Audio service is healthy." : "Audio service is not running.",
        wsUrl
      );
    } catch (error) {
      console.error("Failed to check audio health", error);
      showAudioResult("Unable to check audio health.");
    } finally {
      setAudioActionLoading(null);
    }
  };

  const handleCheckSpeechToTextHealthPress = async () => {
    if (isCheckingSpeechToTextHealth) {
      return;
    }

    setIsCheckingSpeechToTextHealth(true);
    setSpeechToTextStatusText("Checking service health...");

    try {
      const response = await checkSpeechToTextServiceHealthRequest();
      setSpeechToTextStatusText(`Service healthy.\n${JSON.stringify(response)}`);
    } catch (error) {
      console.error("Failed to check speech to text service health", error);
      setSpeechToTextStatusText("Unable to check service health.");
    } finally {
      setIsCheckingSpeechToTextHealth(false);
    }
  };

  const handleResetDailyMoodPress = async () => {
    if (isResettingDailyMood) {
      return;
    }

    setIsResettingDailyMood(true);
    setStatusText("Resetting your mood check-in...");

    try {
      const response = await resetDailyMood();

      if (!checkIfLambdaResultIsSuccess(response)) {
        const message = getLambdaErrorMessage(response);
        setStatusText(message);
        Alert.alert("Reset mood", message);
        return;
      }

      dispatch(clearHomePageInfo());
      setStatusText("Mood check-in reset.");
    } catch (error) {
      console.error("Failed to reset daily mood", error);
      const message = "Unable to reset your mood check-in right now.";
      setStatusText(message);
      Alert.alert("Reset mood", message);
    } finally {
      setIsResettingDailyMood(false);
    }
  };

  return (
    <Modal transparent animationType="fade" visible={visible} onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={styles.card} onPress={() => {}}>
          <View style={styles.header}>
            <Text style={styles.title}>Test Buttons</Text>
            <TouchableOpacity activeOpacity={0.8} onPress={onClose} style={styles.closeButton}>
              <Text style={styles.closeText}>x</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.subtitle}>Temporary testing popup.</Text>

          <TouchableOpacity
            activeOpacity={0.85}
            accessibilityRole="button"
            accessibilityLabel="Audio"
            accessibilityState={{ expanded: isAudioExpanded }}
            onPress={() => setIsAudioExpanded((currentValue) => !currentValue)}
            style={styles.resetDailyMoodButton}
          >
            <Text style={styles.resetDailyMoodButtonText}>Audio</Text>
          </TouchableOpacity>

          {isAudioExpanded ? (
            <View style={styles.audioActionsWrap}>
              <TouchableOpacity
                activeOpacity={0.85}
                accessibilityRole="button"
                disabled={Boolean(audioActionLoading)}
                onPress={handleStartAudioServicePress}
                style={[styles.audioActionButton, audioActionLoading && styles.buttonDisabled]}
              >
                <View style={styles.audioActionButtonContent}>
                  {audioActionLoading === "start" ? (
                    <ActivityIndicator color="#4B4748" size="small" />
                  ) : null}
                  <Text style={styles.audioActionButtonText}>Start Audio Service</Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.85}
                accessibilityRole="button"
                disabled={Boolean(audioActionLoading)}
                onPress={handleStopAudioServicePress}
                style={[styles.audioActionButton, audioActionLoading && styles.buttonDisabled]}
              >
                <View style={styles.audioActionButtonContent}>
                  {audioActionLoading === "stop" ? (
                    <ActivityIndicator color="#4B4748" size="small" />
                  ) : null}
                  <Text style={styles.audioActionButtonText}>Stop Audio Service</Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.85}
                accessibilityRole="button"
                disabled={Boolean(audioActionLoading)}
                onPress={handleCheckAudioHealthPress}
                style={[styles.audioActionButton, audioActionLoading && styles.buttonDisabled]}
              >
                <View style={styles.audioActionButtonContent}>
                  {audioActionLoading === "health" ? (
                    <ActivityIndicator color="#4B4748" size="small" />
                  ) : null}
                  <Text style={styles.audioActionButtonText}>Check Audio Health</Text>
                </View>
              </TouchableOpacity>
            </View>
          ) : null}

          {audioStatusText ? <Text style={styles.audioStatusText}>{audioStatusText}</Text> : null}

          <TouchableOpacity
            activeOpacity={0.85}
            accessibilityRole="button"
            accessibilityLabel="Audio Testing"
            onPress={() => setIsAudioTestingVisible(true)}
            style={styles.resetDailyMoodButton}
          >
            <Text style={styles.resetDailyMoodButtonText}>Audio Testing</Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.85}
            accessibilityRole="button"
            accessibilityLabel="Test Speech to Text"
            onPress={() => setIsSpeechToTextTestingVisible(true)}
            style={styles.resetDailyMoodButton}
          >
            <Text style={styles.resetDailyMoodButtonText}>Test Speech to Text</Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.85}
            accessibilityRole="button"
            accessibilityLabel="Reset Daily Mood"
            disabled={isResettingDailyMood}
            onPress={handleResetDailyMoodPress}
            style={[styles.resetDailyMoodButton, isResettingDailyMood && styles.buttonDisabled]}
          >
            <View style={styles.resetDailyMoodButtonContent}>
              {isResettingDailyMood ? <ActivityIndicator color="#9E3F3F" size="small" /> : null}
              <Text style={styles.resetDailyMoodButtonText}>Reset Daily Mood</Text>
            </View>
          </TouchableOpacity>

          {statusText ? <Text style={styles.statusText}>{statusText}</Text> : null}

          <TouchableOpacity activeOpacity={0.85} onPress={onClose} style={styles.primaryButton}>
            <Text style={styles.primaryButtonText}>Close</Text>
          </TouchableOpacity>
        </Pressable>
      </Pressable>

      <Modal
        transparent
        animationType="fade"
        visible={isAudioTestingVisible}
        onRequestClose={() => setIsAudioTestingVisible(false)}
      >
        <Pressable style={styles.overlay} onPress={() => setIsAudioTestingVisible(false)}>
          <Pressable style={styles.audioTestingCard} onPress={() => {}}>
            <View style={styles.header}>
              <Text style={styles.title}>Audio Testing</Text>
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => setIsAudioTestingVisible(false)}
                style={styles.closeButton}
              >
                <Text style={styles.closeText}>x</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.audioTestingContent}>
              <AudioTest />
            </View>
          </Pressable>
        </Pressable>
      </Modal>

      <Modal
        transparent
        animationType="fade"
        visible={isSpeechToTextTestingVisible}
        onRequestClose={() => setIsSpeechToTextTestingVisible(false)}
      >
        <Pressable
          style={styles.overlay}
          onPress={() => setIsSpeechToTextTestingVisible(false)}
        >
          <Pressable style={styles.card} onPress={() => {}}>
            <View style={styles.header}>
              <Text style={styles.title}>Speech to Text Testing</Text>
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => setIsSpeechToTextTestingVisible(false)}
                style={styles.closeButton}
              >
                <Text style={styles.closeText}>x</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              activeOpacity={0.85}
              accessibilityRole="button"
              accessibilityLabel="Check Service Health"
              disabled={isCheckingSpeechToTextHealth}
              onPress={handleCheckSpeechToTextHealthPress}
              style={[
                styles.audioActionButton,
                styles.speechToTextHealthButton,
                isCheckingSpeechToTextHealth && styles.buttonDisabled,
              ]}
            >
              <View style={styles.audioActionButtonContent}>
                {isCheckingSpeechToTextHealth ? (
                  <ActivityIndicator color="#4B4748" size="small" />
                ) : null}
                <Text style={styles.audioActionButtonText}>Check Service Health</Text>
              </View>
            </TouchableOpacity>

            {speechToTextStatusText ? (
              <Text style={styles.audioStatusText}>{speechToTextStatusText}</Text>
            ) : null}
          </Pressable>
        </Pressable>
      </Modal>
    </Modal>
  );
};

export default TestButtonsPopup;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(17, 17, 17, 0.45)",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  card: {
    borderRadius: 28,
    backgroundColor: "#FFFDF9",
    paddingHorizontal: 22,
    paddingVertical: 24,
    shadowColor: "#000000",
    shadowOpacity: 0.12,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 10 },
    elevation: 8,
  },
  audioTestingCard: {
    height: "72%",
    borderRadius: 28,
    backgroundColor: "#FFFDF9",
    paddingHorizontal: 22,
    paddingTop: 24,
    paddingBottom: 12,
    shadowColor: "#000000",
    shadowOpacity: 0.12,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 10 },
    elevation: 8,
  },
  audioTestingContent: {
    flex: 1,
    marginTop: 8,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  title: {
    flex: 1,
    fontFamily: FONTS.figtreeSemiBold,
    fontSize: 24,
    lineHeight: 30,
    color: "#111111",
  },
  closeButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "#F3EEE7",
    alignItems: "center",
    justifyContent: "center",
  },
  closeText: {
    fontFamily: FONTS.interSemiBold,
    fontSize: 22,
    lineHeight: 24,
    color: "#4B4748",
  },
  subtitle: {
    marginTop: 10,
    fontFamily: FONTS.inter,
    fontSize: 14,
    lineHeight: 20,
    color: "#7A7470",
  },
  audioActionsWrap: {
    marginTop: 10,
    gap: 8,
  },
  audioActionButton: {
    minHeight: 38,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#D8D0C6",
    backgroundColor: "#F7F2EA",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
  },
  audioActionButtonContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  audioActionButtonText: {
    fontFamily: FONTS.figtreeSemiBold,
    fontSize: 13,
    lineHeight: 18,
    color: "#4B4748",
  },
  speechToTextHealthButton: {
    marginTop: 16,
  },
  audioStatusText: {
    marginTop: 10,
    textAlign: "center",
    fontFamily: FONTS.inter,
    fontSize: 12,
    lineHeight: 18,
    color: "#7A7470",
  },
  resetDailyMoodButton: {
    marginTop: 24,
    minHeight: 46,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#C76767",
    backgroundColor: "#FFF8F8",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  resetDailyMoodButtonContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  resetDailyMoodButtonText: {
    fontFamily: FONTS.figtreeSemiBold,
    fontSize: 15,
    lineHeight: 20,
    color: "#9E3F3F",
  },
  statusText: {
    marginTop: 10,
    textAlign: "center",
    fontFamily: FONTS.inter,
    fontSize: 12,
    lineHeight: 18,
    color: "#7A7470",
  },
  primaryButton: {
    marginTop: 16,
    minHeight: 50,
    borderRadius: 999,
    backgroundColor: "#111111",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  primaryButtonText: {
    fontFamily: FONTS.figtreeSemiBold,
    fontSize: 15,
    lineHeight: 20,
    color: "#FFFFFF",
  },
});
