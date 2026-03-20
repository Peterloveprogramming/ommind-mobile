import { images } from "@/constants/images";
import { Image, StyleSheet, TouchableOpacity } from "react-native";

type OpenChatHistoryButtonProps = {
  onTouch: () => void;
};

const OpenChatHistoryButton = ({ onTouch }: OpenChatHistoryButtonProps) => {
  return (
    <TouchableOpacity
      onPressIn={onTouch}
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
