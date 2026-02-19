import { Text, View, StyleSheet, ScrollView, TouchableOpacity,ImageBackground } from "react-native";
import { colors } from "@/constants/colors";
import { BottomNavVisibilityContext } from '@/context/BottomNavVisibilityContext';
import { images } from "@/constants/images";
import { useState, useContext } from "react";
import { useRouter } from "expo-router";
import { generateUniqueId } from "@/utils/helper";

interface LhamoButtonProps {
  onPress: () => void;
}

const LhamoButton = ({ onPress }: LhamoButtonProps) => {
  return (
    <TouchableOpacity onPress={onPress}>
      <View style={{height:44,width:120,backgroundColor:colors.brand3,borderRadius:25,justifyContent:"center",alignItems:"center"}}>
          <Text style={{fontSize:17,color:"#FFFF"}}>Start</Text>
      </View>
    </TouchableOpacity>
  )
}

interface LhamoComponentProps {
  title: string;
  message: string;
  componentNumber: number;
  onPress: () => void;
}

const LhamoComponent = ({title, message, componentNumber,onPress}: LhamoComponentProps) => {
  let backgroundImage;
  if (componentNumber == 1){
    backgroundImage = images.lhamo_background_one
  } else if (componentNumber == 2){
    backgroundImage = images.lhamo_background_two
  } else if (componentNumber == 3){
    backgroundImage = images.lhamo_background_three
  }
  return (
    <ImageBackground source={backgroundImage} resizeMode="cover" style={{gap:5,width:347,height:200,paddingHorizontal:20,justifyContent:"center",borderRadius:20,overflow:"hidden"}}>
      <Text style={{color:"#FFFF",fontSize:20,fontWeight:"bold"}}>{title}</Text>
      <Text style={{color:"#FFFF",fontSize:14}}>{message}</Text>
      <LhamoButton onPress={onPress}/>
    </ImageBackground>
  )
}

export default function Lhamo() {
  const router = useRouter();
  const {setIsVisible} = useContext(BottomNavVisibilityContext)
  const [lastOffset, setLastOffset] = useState(0);

  const handleScroll = (event) => {
    const currentOffset = event.nativeEvent.contentOffset.y;
    const contentHeight = event.nativeEvent.contentSize.height;
    const layoutHeight = event.nativeEvent.layoutMeasurement.height;

    // Check if you're at the bottom
    if (currentOffset + layoutHeight >= contentHeight) {
      // at bottom 
      setIsVisible(false);
    } else {
      // not at bottom 
      setIsVisible(true)
    }

    // Update the last offset
    setLastOffset(currentOffset);
  };
      
  return (
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        onScroll={handleScroll}
        style={{flex:1}}
      >
        <View style={{  alignItems: "center" ,flex:1,gap:20}}>
          <View />
            <LhamoComponent 
              title="Speak with Lhamo" message="Receive gentle guidance on your spiritual journey — from meditation to self-inquiry and awakening." 
              componentNumber={1} 
              onPress={() => router.push({
                pathname: '/chat/[id]',
                params: { id: 1, session_id: "abcdd" }
              })} />
            <LhamoComponent title="Dream with Lhamo" message="Share your dreams and explore their deeper meaning through a Tibetan-inspired lens of awareness." componentNumber={2} onPress={() => router.push('/chat/2')} />
            <LhamoComponent title="Meditate with Lhamo" message="Let Lhamo create the perfect meditation for your mind, body, and spirit—anytime you need it." componentNumber={3} onPress={() => router.push('/chat/3')} />
          <View />

        </View>
      </ScrollView>
  );
}

{/* <View style={styles.LhamoMessageContainer}>
  <View style={styles.LhamoMessage}>
    <Text style={{ fontSize: 14, color: "#FFFFFF" }}>
      Hi, I’m Lhamo, your personal healing mentor. Would you like to talk to me? 🧘🏻
    </Text>
  </View>
</View>  */}

const styles = StyleSheet.create({
  LhamoMessageContainer: {
    // borderWidth: 3,
    width: 347,
    height: 70,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 10,
    backgroundColor: '#000000',
  },
  LhamoMessage: {
    height: 40,
    width: 307,
  }
});
