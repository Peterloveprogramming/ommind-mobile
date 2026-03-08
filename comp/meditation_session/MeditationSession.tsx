import React from "react";
import { StyleSheet, ImageBackground, View, ScrollView ,Text} from "react-native";
import { images } from "@/constants/images";
import { FONTS } from "@/theme";
import BookmarkButton from "@/comp/headers/BookmarkButton";
import BaseButton from "../base/BaseButton";
const MeditationSession = () => {
  return (
    <View style={styles.container}>
          <ScrollView
            showsVerticalScrollIndicator={false}
          >
            <ImageBackground source={images.calm_abiding} style={styles.image} />
            <View style={{padding:25,gap:5}}>
              {/* 5 is prop - numberOfSessions */}
              <Text style={{fontFamily:FONTS.figtreeMedium,fontSize:16,color:"#8B8B8B"}}>5 Sessions • Guided Meditation</Text>
              
              <View style={styles.titleRow}>
                <Text style={styles.titleText}>
                  Calm Abiding 1: Foundation of Inner Stillness
                </Text>
                <BookmarkButton onTouch={() => console.log("Bookmark pressed")} />
              </View>
              <Text style={{fontFamily:FONTS.figtreeMedium,color:"#8B8B8B",fontSize:16}}>By Ommind</Text>

              <BaseButton onPress={()=>console.log("helloman")} text="Play" style={{marginVertical:10}} />

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
  titleRow: {
    // borderWidth: 1,
    width: "100%",
    minHeight: 100,
    gap: 8,
    flexDirection: "row",
    alignItems: "flex-start",
  },
  titleText: {
    flex: 1,
    flexShrink: 1,
    fontFamily: FONTS.figtreeSemiBold,
    fontSize: 24,
  },
});
