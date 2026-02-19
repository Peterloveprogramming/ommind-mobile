import { Stack } from "expo-router";
import { View, StyleSheet } from "react-native"; 
import { useRouter } from "expo-router";
import { Platform } from "react-native";
import { useEffect, useState } from "react";
import BackButton from "@/comp/headers/BackButton";
import MoreButton from "@/comp/headers/MoreButton";
import LhamoHeader from "@/comp/headers/LhamoHeader";
import * as SplashScreen from "expo-splash-screen";
import { useFonts as useFigtree, Figtree_400Regular,Figtree_600SemiBold, Figtree_700Bold } from "@expo-google-fonts/figtree";
import { useFonts as useInter, Inter_400Regular, Inter_600SemiBold, Inter_500Medium } from "@expo-google-fonts/inter";
import GlobalProviders from "@/context/GlobalProviders";
import { getAuthInfo } from "@/utils/helper";
SplashScreen.preventAutoHideAsync();


export default function RootLayout() {
  const router = useRouter(); // Initialize the router

  const [figtreeLoaded] = useFigtree({
    Figtree_400Regular,
    Figtree_600SemiBold,
    Figtree_700Bold,
    Inter_500Medium,
  });
  const [interLoaded] = useInter({
    Inter_400Regular,
    Inter_600SemiBold,
  });

  const [initialRoute,setInitialRoute] = useState<string|null>(null);

  const everythingReady = figtreeLoaded && interLoaded && initialRoute;

  useEffect(()=>{
    const initializeRoute = async () => {
      const authInfo = await getAuthInfo();
      if (authInfo){
        setInitialRoute("welcome")
      } else {
        setInitialRoute("welcome")
      }
    };
    initializeRoute();
  },[])

  useEffect(() => {
    if (everythingReady) {
      console.log("everything good to go")
      SplashScreen.hideAsync();
    }
  }, [everythingReady]);

  if (!everythingReady) {
    console.log("not fully loaded yet")
    return null
  };
  console.log("initial route is",initialRoute)
  return (
    <GlobalProviders>
      <Stack>
         <Stack.Screen
          name="welcome"
          options={{
            headerShown: false,
            // headerTitle: () => rinpocheHeader(),
            // headerTitleAlign: "center", // Center the header title
            // headerStyle: {
            // }
          }}
        />

        <Stack.Screen
          name="(tabs)"
          options={{
            headerShown: false,
            // headerTitle: () => rinpocheHeader(),
            // headerTitleAlign: "center", // Center the header title
            // headerStyle: {
            // }
          }}
        />

        <Stack.Screen
          name="authentication/registration"
          options={{
            headerShown: true,
            headerTitle: () => <View></View>,
            headerLeft:()=> <BackButton onTouch={() => router.back()} />,
            // headerTitleAlign: "center", // Center the header title
            // headerStyle: {
            // }
          }}
        />

        <Stack.Screen
          name="authentication/registration_questions"
          options={{
            headerShown: true,
            headerTitle: () => <View></View>,
            headerLeft:()=> <BackButton onTouch={() => router.back()} />,
            // headerTitleAlign: "center", // Center the header title
            // headerStyle: {
            // }
          }}
        />

        
        <Stack.Screen
          name="chat/[id]"
          options={{
            headerTitle: () => <LhamoHeader />,
            headerShown: true,
            headerLeft:()=> <BackButton onTouch={() => router.back()} />,
            headerRight:()=><MoreButton onTouch={() => console.log("More pressed")} />
            }}
          />
        </Stack>
      </GlobalProviders>
  );
}


const styles = StyleSheet.create({
  headerParent:{
    paddingBottom: Platform.OS === 'ios' ? 12 : 0,
    width:"100%",
    justifyContent:"center",
    alignItems:"center",
  },
  RinpocheContainer: {
    // borderWidth:3,
    width:135,
    height:40,
    flexDirection:"row",
    alignItems:"center",
    justifyContent:"center",
    borderRadius:50,
    backgroundColor: 'rgba(71, 71, 71, 0.5)', 
    gap:5,
  },
})