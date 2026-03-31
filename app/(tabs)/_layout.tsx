import { Tabs } from 'expo-router';
import BottomNavigationBar from '@/assets/svg/BottomNavigationBar';
import { View, Text,StyleSheet,Image,TouchableOpacity } from 'react-native';
import Home from '@/assets/svg/Home';
import Explore from '@/assets/svg/Explore';
import Journal from '@/assets/svg/Journal';
import Profile from '@/assets/svg/Profile';
import {useContext} from 'react';
import { BottomNavVisibilityContext } from '@/context/BottomNavVisibilityContext';
import LhamoHeader from "@/comp/headers/LhamoHeader";
import { COLORS, FONTS } from "@/theme.js";
import { useSafeAreaInsets } from 'react-native-safe-area-context';




const icon = (focused:Boolean, iconName:string) => {
  // Define a mapping between iconName and corresponding icon component
  const icons = {
    home: Home,
    explore: Explore,
    journal: Journal,
    profile: Profile
  };

  // Get the corresponding icon component based on iconName
  const IconComponent = icons[iconName.toLowerCase()];

  return (
    <View style={styles.iconWrapper}>
      <View style={{marginLeft:iconName == "journal"?4:0}}>
        <IconComponent color={focused ? "#242424" : "white"} />
      </View>
      <View>
        <Text style={[styles.iconText, { color: focused ? "#242424" : "white",marginLeft:iconName == "home"?3:0}]}>
          {iconName.charAt(0).toUpperCase() + iconName.slice(1)}
        </Text>
      </View>
    </View>
  );
};

export default function TabLayout() {
    const insets = useSafeAreaInsets();

  const {isVisible} = useContext(BottomNavVisibilityContext)
  console.log("bottomNavigationVisible",isVisible);
  return (
    <View style={{ flex: 1 }}>
      {/* Tabs Component */}
      <Tabs
        screenOptions={{
          tabBarActiveTintColor:"black",
          tabBarStyle: {
            backgroundColor: 'transparent', 
            borderTopWidth: 0, // Remove the top border
            elevation: 0, // Remove shadow on Android
            shadowOpacity: 0, // Remove shadow on iOS
            position: 'absolute', // Position the tab bar absolutely
            height: 90, // Adjust height as needed
            zIndex:1,
            justifyContent:"center",
            alignContent:"center",
            // bottom: isVisible ? -15 : -100, // Move the tab bar down
            bottom:insets.bottom - 25
          },
          tabBarItemStyle: {
            height:60,
            width: 60,
            // borderWidth:3,
            bottom:-10,
          },
          tabBarShowLabel:false
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: 'Home',
            headerShown: false,
            tabBarIcon: ({focused}) => icon(focused,"home"),
            
          }}
        />
        <Tabs.Screen
          name="explore"
          options={{
            title: 'Explore',
            tabBarIcon: ({focused}) => icon(focused,"explore"),
            headerShown:false,
          }}
        />
        
        {/* invisible only acts as a placeholder */}
        <Tabs.Screen
          name="lhamo"
          listeners={{
            tabPress: (e) => {
              e.preventDefault();
            },
          }}
          options={{
            tabBarIcon: ({ focused  }) => <View style={{height:50,width:50,bottom:-45}}><Text style={{color:focused?"#242424":"white",fontSize:13,left:4}}>Llhamo</Text></View>,
            tabBarButton: (props) => (
              <View style={props.style} pointerEvents="none">
                {props.children}
              </View>
            ),
            tabBarItemStyle: {
              width: 0, 
              height: 0, 
              // overflow: 'hidden', 
            },
            headerTitle: () => <LhamoHeader />,
            headerShown:true,
            headerTitleAlign: "center",   
            
          }}
        />
        
        <Tabs.Screen
          name="journal"
          options={{
            // title: 'Saved',
            tabBarIcon: ({focused}) => icon(focused,"journal"),
            headerShown:false,
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: 'Search',
            tabBarIcon: ({focused}) =>  icon(focused,"profile"),
          headerShown:false,
          }}
        />
      </Tabs>

      { isVisible && (
        <>
          {/* Custom Bottom Navigation Bar */}
          <View pointerEvents="box-none" style={[styles.bottomNavigationBar,{bottom:insets.bottom}]}>
            <BottomNavigationBar width="100%" preserveAspectRatio="none" height="100%"  />
          </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  bottomNavigationBar: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    height: 80, 
    zIndex: 0, 
    // borderWidth:3,
  },

  iconWrapper:{
    width:60, 
    height:50,
    left:5,
    // borderWidth:2,
    alignContent:"center"
  },
  iconText:{
      fontFamily: FONTS.inter,
      color: COLORS.light200,
      fontSize: 12,
  },
  
});
