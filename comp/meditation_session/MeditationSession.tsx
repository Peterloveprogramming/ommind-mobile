import React from "react";
import { StyleSheet, ImageBackground, View, ScrollView ,Text} from "react-native";
import { images } from "@/constants/images";
import { FONTS } from "@/theme";
const MeditationSession = () => {
  return (
    <View style={styles.container}>
          <ScrollView
            showsVerticalScrollIndicator={false}
          >
            <ImageBackground source={images.calm_abiding} style={styles.image} />
            <View style={{padding:30,}}>
              {/* 5 is prop - numberOfSessions */}
              <Text style={{fontFamily:FONTS.figtreeMedium,fontSize:16,color:"#8B8B8B"}}>5 Sessions • Guided Meditation</Text>
              
              <View
                style={{borderWidth:1,width:"100%",minHeight:100,gap:5}}
              >
                {/* prop - description */}
                <Text
                  style={{
                    fontFamily:FONTS.figtreeSemiBold,
                    fontSize:24
                  }}
                >Calm Abiding 1: Foundation of Inner Stillness
                </Text>

                
              </View>
            </View>
            
          </ScrollView>
    </View>
  );
};

export default MeditationSession

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  image: {
    width: "100%",
    height: 281,
  },
});
