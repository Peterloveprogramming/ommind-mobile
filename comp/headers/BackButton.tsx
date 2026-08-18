import Back from "@/assets/svg/header/Back";
import { TouchableOpacity } from "react-native";

type BackButtonProps = {
  onTouch: () => void;
  debugLabel?: string;
};

const BackButton = ({ onTouch, debugLabel = "BackButton" }: BackButtonProps) => {
  const handlePress = () => {
    if (__DEV__) {
      console.log(`[${debugLabel}] back button pressed`);
    }

    onTouch();
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
      pressRetentionOffset={{ top: 24, bottom: 24, left: 24, right: 24 }}
    >
      <Back />
    </TouchableOpacity>
  );
};

export default BackButton;
