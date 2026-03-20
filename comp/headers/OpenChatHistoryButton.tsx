import { images } from "@/constants/images";
import { useGlobalSearchParams, useRouter } from "expo-router";
import { Image, StyleSheet, TouchableOpacity } from "react-native";

type OpenChatHistoryButtonProps = {
  onTouch?: () => void;
};

const OpenChatHistoryButton = ({ onTouch }: OpenChatHistoryButtonProps) => {
  const router = useRouter();
  const { id, session_id } = useGlobalSearchParams<{ id?: string | string[]; session_id?: string | string[] }>();

  const normalizeParam = (value?: string | string[]) => {
    if (Array.isArray(value)) {
      return value[0];
    }

    return value;
  };

  const handlePress = () => {
    if (onTouch) {
      onTouch();
      return;
    }

    const normalizedId = normalizeParam(id);
    const normalizedSessionId = normalizeParam(session_id);

    if (!normalizedId) {
      return;
    }

    router.push({
      pathname: "/chat/history/[id]",
      params: {
        id: normalizedId,
        ...(normalizedSessionId ? { session_id: normalizedSessionId } : {}),
      },
    });
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
      pressRetentionOffset={{ top: 45, bottom: 45, left: 45, right: 45 }}
    >
      <Image
        source={images.open_chat_history}
        style={styles.icon}
        resizeMode="contain"
      />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  icon: {
    width: 45,
    height: 45,
  },
});

export default OpenChatHistoryButton;
