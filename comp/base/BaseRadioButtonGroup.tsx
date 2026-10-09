import { StyleSheet, Text, View, TouchableOpacity,ViewStyle } from 'react-native';
import BaseRadioButton from './BaseRadioButton';
import { Checkbox } from 'expo-checkbox';
import { COLORS,FONTS } from '@/theme.js';
import { Dispatch,SetStateAction } from 'react';

let debug = false;


interface Option {
  label: string;  // The label displayed next to the radio button
  value: string | number;  // The value associated with the option
}
interface BaseRadioButtonGroupProps {
  options:Option[];
  selectedValue:string,
  onChange: (value:string)=>void,
  style?:ViewStyle,
  gap?:number
}

const BaseRadioButtonGroup = ({  
  options,
  selectedValue,
  onChange,
  style,
  gap = 12
}: BaseRadioButtonGroupProps) => {
  return (
    <View
      style={[styles.baseRadioButtonGroupContainer,{gap},style]}
      accessibilityRole="radiogroup"
    >
      {options.map((option)=>{
        // console.log(option)
        return <BaseRadioButton
        key={String(option.value)}
        label={option.label}
        value={String(option.value)}
        onChange={onChange}
        selected={option.value === selectedValue }
        />
      })}
      
    </View>
  );
};

export default BaseRadioButtonGroup

const styles = StyleSheet.create({
    baseRadioButtonGroupContainer:{
      borderWidth:debug?1:0,
      width:"100%",
      alignItems:"stretch",
    },
})