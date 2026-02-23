import { Tabs } from 'expo-router';
import BottomNavigationBar from '@/assets/svg/BottomNavigationBar';
import { View, Text,StyleSheet,Image,TouchableOpacity } from 'react-native';
import {images} from "@/constants/images";
import Home from '@/assets/svg/Home';
import Explore from '@/assets/svg/Explore';
import Journal from '@/assets/svg/Journal';
import Profile from '@/assets/svg/Profile';
import { useRouter } from 'expo-router';
import {useContext} from 'react';
import { BottomNavVisibilityContext } from '@/context/BottomNavVisibilityContext';
import LhamoHeader from "@/comp/headers/LhamoHeader";
import { COLORS, FONTS } from "@/theme.js";
import { generateUniqueId } from '@/utils/helper';

const Rinpoche = () => {
  const router = useRouter(); // Initialize the router

  return (
    <View style={styles.rinpocheContainer}>
      <TouchableOpacity 
           onPress={() => router.push({
                pathname: '/chat/[id]',
                params: { id: 1, session_id: generateUniqueId() }
              })} 
      >
      <Image source={images.rinpoche_normal} style={styles.rinpocheImage} />
      </TouchableOpacity>
    </View>
  );
};
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
            bottom: isVisible ? -15 : -100, // Move the tab bar down
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
        <Tabs.Screen
          name="lhamo"
          options={{
            tabBarIcon: ({ focused  }) => <View style={{height:50,width:50,bottom:-55}}><Text style={{color:focused?"#242424":"white",fontSize:12,left:4}}>Llhamo</Text></View>,
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
          <Rinpoche />
          {/* Custom Bottom Navigation Bar */}
          <View style={styles.bottomNavigationBar}>
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
  rinpocheContainer: {
    // borderWidth:3,
    width: 80, // Adjust width as needed
    height: 87, // Adjust height as needed
    position:"absolute",
    borderRadius: 30, // Make it circular
    alignSelf:"center",
    bottom:30,
    zIndex: 10, // Ensure Rinpoche is above other elements
  },
  rinpocheImage: {
    width: "100%",
    height: "100%",
    resizeMode: "contain",
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
