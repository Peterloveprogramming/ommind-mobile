import React from "react";
import { StyleSheet, ImageBackground, View, ScrollView ,Text, TouchableOpacity, Image} from "react-native";
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
            <View style={{padding:20,gap:5}}>
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


              {/* flastlist */}
              <TouchableOpacity>
                <View
                  style={{width:"100%",minHeight:64,borderRadius:10,backgroundColor:"#E8E6E6",padding:10}}
                >
                  <View>
                    {/* title prop  */}
                    <Text style={{fontSize:14,fontFamily:FONTS.figtreeSemiBold}}>Session 1: The Truth of Your Being Is Already Pure</Text>
                  </View>

                  <View
                    style={{flexDirection:"row",alignItems:"center",justifyContent:"space-between"}}
                  >
                    <View style={{flexDirection:"row",gap:12,marginTop:8,alignItems:"center"}}>
                      {/* <Image source={images.unchecked} style={{width:14,height:14}} resizeMode="contain" /> */}
                      <Image source={images.checked} style={{width:14,height:14}} resizeMode="contain" />
                      <Text style={{fontFamily:FONTS.figtreeMedium,color:"#8E8E93"}}>20 Min</Text>
                    </View>
                    <View>
                      <Image source={images.lock} style={{width:14,height:14}} resizeMode="contain" />
                    </View>
                  </View>

                </View>
              </TouchableOpacity>


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
