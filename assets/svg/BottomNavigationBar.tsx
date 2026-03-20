

import * as React from "react";
import { View,Text,TouchableOpacity,StyleSheet,Image} from "react-native";
import Svg, {
  ForeignObject,
  Path,
  Defs,
  ClipPath,
  LinearGradient,
  Stop,
} from "react-native-svg";
import {images} from "@/constants/images";
import { useRouter } from 'expo-router';
import { generateUniqueId } from '@/utils/helper';
/* SVGR has dropped some elements not supported by react-native-svg: div */


const Rinpoche = () => {
  const router = useRouter(); // Initialize the router
  return (
  
    <View style={styles.rinpocheContainer}>
      <TouchableOpacity 
           onPress={() => router.push({
                pathname: '/chat',
                params: { session_id: generateUniqueId() }
              })} 
      >
      <Image source={images.rinpoche_normal} style={styles.rinpocheImage} />
      </TouchableOpacity> 
    </View>
  );
};

const BottomNavigationBar = (props) => (
  <View>
    <Rinpoche />
  <Svg
    width={394}
    height={89}
    viewBox="0 0 394 89"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <ForeignObject
      x={-10}
      y={-9.22852}
      width={414.027}
      height={108}
    ></ForeignObject>
    <Path
      data-figma-bg-blur-radius={10}
      d="M394 88.7715H0L0.000138391 41.1013C0.000203054 18.8278 18.0565 0.771484 40.3301 0.771484H130.499C140.846 0.771484 149.805 7.96053 152.046 18.0627C156.528 38.2671 174.445 52.6452 195.14 52.6452H197.411C218.185 52.6452 236.21 38.3054 240.88 18.0627C243.215 7.94138 252.227 0.771484 262.615 0.771484C262.615 0.771484 309.827 0.771484 353.163 0.771484C396.5 0.771484 394 41.6082 394 41.6082V88.7715Z"
      fill="url(#paint0_linear_2199_9552)"
    />
    <Defs>
      <ClipPath
        id="bgblur_0_2199_9552_clip_path"
        transform="translate(10 9.22852)"
      >
        <Path d="M394 88.7715H0L0.000138391 41.1013C0.000203054 18.8278 18.0565 0.771484 40.3301 0.771484H130.499C140.846 0.771484 149.805 7.96053 152.046 18.0627C156.528 38.2671 174.445 52.6452 195.14 52.6452H197.411C218.185 52.6452 236.21 38.3054 240.88 18.0627C243.215 7.94138 252.227 0.771484 262.615 0.771484C262.615 0.771484 309.827 0.771484 353.163 0.771484C396.5 0.771484 394 41.6082 394 41.6082V88.7715Z" />
      </ClipPath>
      <LinearGradient
        id="paint0_linear_2199_9552"
        x1={197}
        y1={-16.3654}
        x2={197}
        y2={106.835}
        gradientUnits="userSpaceOnUse"
      >
        <Stop stopColor="#D7D7D7" stopOpacity={0.8} />
        <Stop offset={1} stopColor="#868484" stopOpacity={0.6} />
      </LinearGradient>
    </Defs>
  </Svg>
  </View>
);
export default BottomNavigationBar;


const styles = StyleSheet.create({
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
});
