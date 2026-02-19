import { images } from "@/constants/images";
import More from "@/assets/svg/header/More";
import { TouchableOpacity } from "react-native";

type MoreButtonProps = {
  onTouch: () => void;
};

const MoreButton = ({ onTouch }: MoreButtonProps) => {
  return (
    <TouchableOpacity onPress={onTouch}>
      <More />
    </TouchableOpacity>
  );
};

export default MoreButton;
