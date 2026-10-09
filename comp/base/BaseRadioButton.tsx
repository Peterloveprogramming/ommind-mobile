import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { COLORS,FONTS } from '@/theme.js';

// Card values for the starter-questions screen (spec 05). Kept here so a
// later colour-token spec can move them in one go.
const RADIO_CARD = {
  minHeight: 58,
  borderRadius: 10,
  borderWidth: 1.5,
  borderColor: "#CFCFCF",
  selectedBorderColor: COLORS.brandYellow,
  paddingHorizontal: 20,
  paddingVertical: 12,
  radioToLabelGap: 10,
  labelColor: "#1E1E1E",
  labelFontSize: 16,
  labelLineHeight: 22,
  maxFontSizeMultiplier: 1.3,
};

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
      borderColor:"#757575",
      flexShrink:0,
    },buttonSelected:{
      height:16,
      width:16,
      borderRadius:50,
      justifyContent:"center",
      alignItems:"center",
      backgroundColor:"#E6E6E6",
      borderWidth:1,
      borderColor:COLORS.brandYellow,
      flexShrink:0,
    },
    buttonSelectedInner:{
      height:10,
      width:10,
      borderRadius:50,
      backgroundColor:COLORS.brandYellow,
      
    },
})

interface BaseRadioButtonProps {
  selected:boolean,
  label:string
  value:string,
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
        style={[
          styles.baseRadioButtonContainer,
          { borderColor: selected ? RADIO_CARD.selectedBorderColor : RADIO_CARD.borderColor },
        ]}
        onPress={() => onChange(value)}
        accessibilityRole="radio"
        accessibilityState={{ checked: selected }}
        accessibilityLabel={label}
      >
        <View style={styles.container}>
          {selected?<RadioButtonSelected/>:<RadioButtonNotSelected />}
          <Text
            style={styles.fontStyle}
            maxFontSizeMultiplier={RADIO_CARD.maxFontSizeMultiplier}
          >
            {label}
          </Text>
        </View>
      </TouchableOpacity>
  );
};

export default BaseRadioButton

const styles = StyleSheet.create({
    baseRadioButtonContainer:{
      borderWidth:RADIO_CARD.borderWidth,
      width:"100%",
      minHeight:RADIO_CARD.minHeight,
      borderRadius:RADIO_CARD.borderRadius,
      justifyContent:"center",
      paddingHorizontal:RADIO_CARD.paddingHorizontal,
      paddingVertical:RADIO_CARD.paddingVertical,
    },container:{
      flexDirection:"row",
      alignItems:'center',
      gap:RADIO_CARD.radioToLabelGap,
    },
    fontStyle:{
      flex:1,
      fontFamily:FONTS.figtreeMedium,
      fontSize:RADIO_CARD.labelFontSize,
      lineHeight:RADIO_CARD.labelLineHeight,
      color:RADIO_CARD.labelColor,
    }
})