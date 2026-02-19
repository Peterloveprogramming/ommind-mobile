import {Text,View} from 'react-native'
import React from 'react'

// Define prop types using an interface or type alias for better clarity
type HumanProps = {
    message: string;
  };

  
const Human = ({message}:HumanProps) => {
    return (
        <View style={{alignItems:"flex-end",marginBottom:10}}>
        <View style={{backgroundColor:"#000000",padding:15,maxWidth:"90%",borderRadius:10}}>
            <Text style={{fontSize:16,color:"white"}}>{message}</Text>
        </View>
        </View>
    )
}


export default Human
