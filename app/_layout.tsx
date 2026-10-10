import { Stack } from "expo-router";
import { View, StyleSheet } from "react-native";
import { Platform } from "react-native";
import * as SplashScreen from "expo-splash-screen";
import { useFonts as useFigtree, Figtree_400Regular, Figtree_500Medium, Figtree_600SemiBold, Figtree_600SemiBold_Italic, Figtree_700Bold } from "@expo-google-fonts/figtree";
import { useFonts as useInter, Inter_400Regular, Inter_600SemiBold, Inter_500Medium, Inter_700Bold, Inter_800ExtraBold, Inter_900Black } from "@expo-google-fonts/inter";
import { Afacad_400Regular, Afacad_700Bold } from "@expo-google-fonts/afacad";
import GlobalProviders from "@/context/GlobalProviders";
import { KeyboardProvider } from "react-native-keyboard-controller";
import * as Sentry from "@sentry/react-native";
import { SENTRY_DSN } from "@/constant";
SplashScreen.preventAutoHideAsync();

// Zero production error/crash reporting existed before this — this is the
// app-wide baseline (navigation/render errors), independent of the
// chat-specific breadcrumbs added via utils/chatTelemetry.ts.
Sentry.init({
  dsn: SENTRY_DSN,
  environment: __DEV__ ? "development" : "production",
  tracesSampleRate: 0.2,
  enableAutoSessionTracking: true,
});

function RootLayout() {
  const [figtreeLoaded] = useFigtree({
    Figtree_400Regular,
    Figtree_500Medium,
    Figtree_600SemiBold,
    Figtree_600SemiBold_Italic,
    Figtree_700Bold,
    Inter_500Medium,
    Afacad_400Regular,
    Afacad_700Bold,
  });
  const [interLoaded] = useInter({
    Inter_400Regular,
    Inter_600SemiBold,
    Inter_700Bold,
    Inter_800ExtraBold,
    Inter_900Black,
  });

  // The splash screen is hidden by app/index.tsx once the auth redirect is
  // decided, so the unstyled index route is never visible.
  const everythingReady = figtreeLoaded && interLoaded;

  if (!everythingReady) {
    console.log("not fully loaded yet")
    return null
  };
  return (
    <KeyboardProvider>
    <GlobalProviders>
      <Stack>
        <Stack.Screen
          name="index"
          options={{
            headerShown: false,
          }}
        />

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
          // Draws its own back button (BackHeader) so it lines up identically
          // on iOS and Android.
          options={{ headerShown: false }}
        />

        <Stack.Screen
          name="authentication/login"
          // Draws its own back button (BackHeader) so it lines up identically
          // on iOS and Android.
          options={{ headerShown: false }}
        />

        <Stack.Screen
          name="meditation_session/session"
          // The course screen draws its own back/share bar over the hero image
          // (MeditationSession) so it lines up identically on iOS and Android.
          options={{ headerShown: false }}
        />

        <Stack.Screen
          name="meditation_session/player"
          // The player draws its own close/share bar (PlayerScaffold) so it
          // lines up identically on iOS and Android.
          options={{ headerShown: false }}
        />

        <Stack.Screen
          name="authentication/registration_questions"
          // Draws its own back button (BackHeader) so it lines up identically
          // on iOS and Android.
          options={{ headerShown: false }}
        />

        <Stack.Screen
          name="authentication/welcome_journey"
          options={{
            headerShown: false,
            gestureEnabled: false,
          }}
        />

        <Stack.Screen
          name="chat/new_index"
          options={{
            headerShown: false,
            }}
          />

        <Stack.Screen
          name="chat/history"
          options={{
            headerShown: false,
            presentation: "transparentModal",
            animation: "slide_from_left",
            contentStyle: {
              backgroundColor: "transparent",
            },
            }}
          />

        <Stack.Screen
          name="journal/write"
          options={{
            headerShown: false,
          }}
        />
        </Stack>
      </GlobalProviders>
    </KeyboardProvider>
  );
}

export default Sentry.wrap(RootLayout);

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
