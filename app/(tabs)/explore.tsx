import { images } from "@/constants/images";
import MicTest from "@/dummy/tests/MicTest";
import React from "react";
import { ImageBackground, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { FONTS } from '@/theme';

const Explore = () => {
  return (
    // <MicTest />
    <View style={styles.container}>
      {/* <Text style={styles.title}>Coming Soon</Text> */}
      <View>
        <Text>Calm</Text>
        <View>
          <View>
            <TouchableOpacity>
              <View style={{borderRadius:12,width:270,height:120,flexDirection:"row",borderWidth:0.1,borderColor:"#8B8B8B",backgroundColor:"#FFFFFF",shadowColor:"#8B8B8B",shadowOffset:{width:0,height:1},shadowOpacity:0.02,shadowRadius:2,elevation:1}}>
                {/* left */}
                <ImageBackground
                  source={images.meditation_test}
                  style={{
                    width: 120,
                    height: 120,
                    borderTopLeftRadius: 12,
                    borderBottomLeftRadius: 12,
                    overflow: "hidden",
                  }}
                  imageStyle={{
                    borderTopLeftRadius: 12,
                    borderBottomLeftRadius: 12,
                  }}
                />


                {/* right */}
                <View style={{borderTopRightRadius:12, borderBottomRightRadius:12, padding: 10, justifyContent: "center",width:150,gap:5 }}>
                  {/* number of sessions */}
                  <View>
                    <Text style={{color:"#8B8B8B",fontFamily:FONTS.figtreeMedium}}>5 Sessions</Text>
                  </View>
                  
                  {/* title */}
                  <View>
                      <Text style={{ flexShrink: 1, flexWrap: "wrap",color:"#0F0909",fontFamily:FONTS.figtreeSemiBold}}>
                      Calm Abiding 1: Foundation of Inner Stillness
                      </Text>
                  </View>

                  <View>
                    <Text style={{color:"#8B8B8B",fontFamily:FONTS.figtreeMedium}}>Guided Meditation</Text>
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      

    </View>
  );
};

export default Explore

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop:30,
    paddingLeft:15
  }
});
