import { Text, View, Button, StyleSheet,ImageBackground,ScrollView,Image,Platform } from "react-native";
import React from "react";
import { useState } from "react";
import { useRouter } from "expo-router";
import { COLORS, FONTS } from "@/theme.js";
import { images } from "@/constants/images";
import {SafeAreaView, SafeAreaProvider} from 'react-native-safe-area-context';
import { Dimensions } from "react-native";
//import button from base 
import BaseButton from "@/comp/base/BaseButton"
import { useTodoApi } from "@/api/api";
 

const Welcome = () => {
  const router = useRouter();
  const { height, width } = Dimensions.get("window");
  const [showLoginOptions,setShowLoginOptions] = useState(false);
  const handleLoginPress =() => {
    setShowLoginOptions(true);
  }


  const {
    getDodo:{getTodo,getTodoLoading,getTodoData},
  } = useTodoApi({id:"1"})

  return (
    <SafeAreaProvider>
      <SafeAreaView style={{flex:1,justifyContent:"center"}} edges={['left', 'right']}>
        <ImageBackground source={images.welcome_background} style={{flex:1,backgroundColor:"pink",paddingHorizontal:20}}>
          <ScrollView
            contentInsetAdjustmentBehavior="automatic"
            onScroll={()=>console.log("scroll")}
            style={{flex:1}}
            contentContainerStyle={{flexGrow:1, justifyContent:"center"}}
          >
            <View style={{height:height}}>
              <View style={{width:"100%",alignItems:"center",justifyContent:"center",flex:1,marginTop:15}}>
                <Image source={images.ommind_logo} style={{height:103,width:96}} />
              </View>
              <View style={{flex:2,justifyContent:"center",alignItems:"center",gap:5}}>
                <Text style={styles.welcomeMainText}>
                  WELCOME
                </Text>
                <Text style={styles.welcomeSubText}>
                  A sanctuary for meditation, insight, and inner transformation.
                </Text>
              </View>
              <View style={{backgroundColor:"transparent",flex:3,justifyContent:"flex-end",alignItems:"center",gap:10}}>
                {
                  showLoginOptions ? (
                    // If showLoginOptions is true, render nothing (empty fragment)
                    <>
                      <View style={{ width: "80%" }}>
                        <BaseButton  text={"Login with Email"} onPress={async ()=> {
                          console.log("login with email pressed")
                        }} />
                      </View>
                      <View style={{ width: "80%"}}>
                        <BaseButton 
                          backgroundColor="white" 
                          text={"Continue with Google"} 
                          onPress={()=>console.log("hello")} 
                          useIcon={true}
                          fontColor="black"
                          icon={<Image source={images.google_icon} height={20} width={20} />}
                        />
                      </View>
                      {
                        Platform.OS == "ios"?( <View style={{ width: "80%" }}>
                        <BaseButton 
                          backgroundColor="white" 
                          text={"Continue with Apple"} 
                          fontColor="black"
                          onPress={()=>console.log("hello")} 
                          useIcon={true}
                          icon={<Image source={images.apple_icon} height={20} width={20} />}
                        />
                      </View>
                        ):null
                      }

                      <View style={{ width: "80%" }}>
                        <BaseButton backgroundColor="transparent" text={"Return"} onPress={()=>setShowLoginOptions(false)} />
                      </View>
                    </>
                  ) : (
                    // If showLoginOptions is false, show the login and signup buttons
                    <>
                      <View style={{ width: "80%" }}>
                        <BaseButton  text={"Log in"} onPress={()=>setShowLoginOptions(true)} />
                      </View>
                      <View style={{ width: "80%" }}>
                        <BaseButton backgroundColor="transparent" text={"Sign up"} onPress={()=>router.push('/authentication/registration')} />
                      </View>
                    </>
                  )
                }

                
                <Text style={[styles.termsAndConditionText,{marginBottom:50}]}>
                  By clicking on “Let’s Start!” or “Sign In”, you agree to the Terms of Use and Privacy Policy
                </Text>
              </View>
            </View>

          
        </ScrollView> 
        </ImageBackground>
      </ SafeAreaView>
     </SafeAreaProvider>
  );
};

export default Welcome;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontFamily: FONTS.figtreeBold,
    color: COLORS.accent,
    fontSize: 24,
  },
  subtitle: {
    fontFamily: FONTS.inter,
    color: COLORS.light200,
    fontSize: 18,
  },
  welcomeMainText:{
    fontFamily: FONTS.figtreeBold,
    color:"#FFFF",
    fontSize:32
  },
  welcomeSubText:{
    fontFamily: FONTS.figtreeMedium,
    color:"#FFFF",
    fontSize:20,
    textAlign:"center"
  },
  termsAndConditionText:{
    fontFamily:FONTS.interThin,
    color:"#FFFF",
    fontSize:11,
    textAlign:"center"
  }
});


  {/* <View style={styles.container}>
      <Text style={styles.title}>Hello ss!</Text>
      <Text style={styles.subtitle}>Using global colors and fonts</Text>

      <View style={{ marginTop: 20 }}>
        <Button 
          title="Go to Tabs"
          color={COLORS.accent} // optional: use your branding color
          onPress={() => router.push("/(tabs)")} // navigate to the tabs page
        />
      </View> 
    </View> */}
