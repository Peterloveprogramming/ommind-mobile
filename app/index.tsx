import { useEffect, useState } from "react";
import { Redirect } from "expo-router";
import { getAuthInfo } from "@/utils/helper"; // Assuming this helper function is available

export default function Index() {
  const [initialRoute, setInitialRoute] = useState<string | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      console.log("checking authentication")
      const authInfo = await getAuthInfo(); // Retrieve auth information
      if (authInfo) {
        setInitialRoute("(tabs)"); // Redirect to dashboard if authenticated
      } else {
        setInitialRoute("welcome"); // Redirect to welcome if not authenticated
      }
    };

    checkAuth(); // Check auth status when component mounts
  }, []);

  // If the initial route is not yet determined, return null or a loading indicator.
  if (initialRoute === null) {
    return null; // You could also show a loading screen here
  }


  // return <Redirect href={initialRoute === "(tabs)" ? "/(tabs)" : "/welcome"} />;
  // testing Websocket.tsx
  return <Redirect href="/(tabs)" />;

}
