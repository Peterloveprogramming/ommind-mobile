import { images } from "@/constants/images";
import Back from "@/assets/svg/header/Back";
import { TouchableOpacity } from "react-native";

type BackButtonProps = {
  onTouch: () => void;
};

const BackButton = ({ onTouch }: BackButtonProps) => {
  return (
    <TouchableOpacity onPress={onTouch}>
      <Back />
    </TouchableOpacity>
  );
};

export default BackButton;
