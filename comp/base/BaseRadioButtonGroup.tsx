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
  style?:ViewStyle
}

const BaseRadioButtonGroup = ({  
  options,
  selectedValue,
  onChange,
  style
}: BaseRadioButtonGroupProps) => {
  return (
    <View
      style={[styles.baseRadioButtonGroupContainer,style]}
    >
      {options.map((option)=>{
        // console.log(option)
        return <BaseRadioButton
        label={option.label}
        value={option.value}
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
      alignItems:"center",
      gap:15
    },
})