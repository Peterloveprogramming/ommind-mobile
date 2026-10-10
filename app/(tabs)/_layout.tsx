import { Tabs } from 'expo-router';
import LhamoHeader from "@/comp/headers/LhamoHeader";
import AppTabBar from "@/comp/navigation/AppTabBar";

export default function TabLayout() {
  return (
    <Tabs
      tabBar={(props) => <AppTabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: 'Explore',
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="lhamo"
        options={{
          href: null,
          headerTitle: () => <LhamoHeader />,
          headerShown: true,
          headerTitleAlign: "center",
        }}
      />
      <Tabs.Screen
        name="journal"
        options={{
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Search',
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="recently-played"
        options={{
          href: null,
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="saved"
        options={{
          href: null,
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="focus"
        options={{
          href: null,
          headerShown: false,
        }}
      />
    </Tabs>
  );
}
