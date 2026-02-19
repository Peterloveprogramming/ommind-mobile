import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import React from 'react';
import { FONTS } from "@/theme.js";
import { COLORS } from '@/theme.js';

interface BaseProgressBarProps {
  active: boolean; // active determines if the bar is highlighted or not
}

const Bar = ({ active }: BaseProgressBarProps) => {
  return (
    <View
      style={[
        barStyles.bar,
        { backgroundColor: active ? COLORS.brandYellow : "#E0E0E0" }, // Apply color conditionally
      ]}
    />
  );
};

const barStyles = StyleSheet.create({
  bar: {
    height: 4,
    width: 40,
    borderRadius: 20,
  },
});


interface BaseProgressBarProps {
    numberOfBars:number,
    currentBar:number
}
const BaseProgressBar = ({
 numberOfBars,
 currentBar
}: BaseProgressBarProps) => {
    let counter = 0;
  return (
   <View style={baseProgressBarStyles.barContainer}>
       {Array.from({length:numberOfBars},(_,index)=>{
        counter += 1
            return(<Bar 
                active={counter<=currentBar}
            />)
    })}
   </View>
  );
};

export default BaseProgressBar;

const baseProgressBarStyles = StyleSheet.create({
  barContainer:{
    flexDirection:"row",
    gap:1.5
  }
});


