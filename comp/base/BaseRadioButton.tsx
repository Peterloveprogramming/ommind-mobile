import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { Checkbox } from 'expo-checkbox';
import { COLORS,FONTS } from '@/theme.js';
import { Dispatch,SetStateAction } from 'react';

let debug = true;

const RadioButtonNotSelected = () => {
  return <View style={RadioButtonStyles.buttonNotSelected}>
    
  </View>
}

const RadioButtonSelected = () => {
  return <View style={RadioButtonStyles.buttonSelected}>
    <View style={RadioButtonStyles.buttonSelectedInner}>

    </View>
  </View>
}

const RadioButtonStyles = StyleSheet.create({
    buttonNotSelected:{
      height:16,
      width:16,
      borderRadius:50,
      backgroundColor:"white",
      borderWidth:1,
      borderColor:"#757575"
    },buttonSelected:{
      height:16,
      width:16,
      borderRadius:50,
      justifyContent:"center",
      alignItems:"center",
      backgroundColor:"#E6E6E6",
      borderWidth:1,
      borderColor:COLORS.brandYellow
    },
    buttonSelectedInner:{
      height:10,
      width:10,
      borderRadius:50,
      backgroundColor:COLORS.brandYellow,
      
    },
})

interface BaseRadioButtonProps {
  selected:Boolean,
  label:String
  value:String,
  onChange: (value:string)=>void,
}

const BaseRadioButton = ({
    selected = false,
    label,
    value,
    onChange
  }: BaseRadioButtonProps) => {
  return (
      <TouchableOpacity 
        style={styles.baseRadioButtonContainer}
        onPress={() => onChange(value)}
      >
        <View style={styles.container}>
          {selected?<RadioButtonSelected/>:<RadioButtonNotSelected />}
          <Text style={styles.fontStyle}>{label}</Text>
        </View>
      </TouchableOpacity>
  );
};

export default BaseRadioButton

const styles = StyleSheet.create({
    baseRadioButtonContainer:{
      borderWidth:1.5,
      width:360,
      height:58,
      borderRadius:10,
      borderColor:"#CFCFCF",
      justifyContent:"center",
      // flexDirection:"row",
      // alignItems:'center',
      // gap:5,
    },container:{
      flexDirection:"row",
      alignItems:'center',
      gap:5,
      marginLeft:10,
    },
    fontStyle:{
      fontFamily:FONTS.figtreeMedium,
      fontSize:17
    }
})