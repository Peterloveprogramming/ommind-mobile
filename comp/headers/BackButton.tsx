import Back from "@/assets/svg/header/Back";
import { TouchableOpacity } from "react-native";

type BackButtonProps = {
  onTouch: () => void;
};

const BackButton = ({ onTouch }: BackButtonProps) => {
  return (
    <TouchableOpacity
      onPress={onTouch}
      hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
      pressRetentionOffset={{ top: 24, bottom: 24, left: 24, right: 24 }}
    >
      <Back />
    </TouchableOpacity>
  );
};

export default BackButton;
