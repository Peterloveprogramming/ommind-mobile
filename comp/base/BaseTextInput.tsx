import { TextInput, View,StyleSheet,Text} from "react-native";

let debugUi = false 
interface BaseTextInputProps  {
    onChangeText:(newValue:string)=>void,
    value:String,
    label?:String,
    required?:Boolean,
    securityEntry?:Boolean,
    inputStyle?:Object
}

export default function BaseTextInput({
    onChangeText,
    value,
    label,
    required= false,
    securityEntry=false,
    inputStyle
}:BaseTextInputProps) {
    return(
        <View style={styles.container}>
            <Text style={styles.label}>
                {label} {required?"*":null}
            </Text>
            <TextInput
                secureTextEntry={securityEntry}
                style={[styles.input, inputStyle]}  // Merge default and custom styles
                onChangeText={onChangeText}
                value={value}
            />
        </View>
    )

}


const styles = StyleSheet.create({
    container:{
        borderWidth:debugUi?2:0
    },
    label:{
        marginLeft:15,
        marginBottom:0
    },
   input: {
    height: 50,
    margin: 12,
    marginTop:5,
    borderWidth: 1,
    padding: 15,
    borderRadius:5,
    backgroundColor:"#F2F2F7"
  },
});

