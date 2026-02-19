import {Text,View,Image} from 'react-native'
import React from 'react'
import { images } from '@/constants/images'

type AiProps = {
    message: string;
  };

  
const Ai = ({message}:AiProps) => {
    if (message == "loading"){
        return <Image source={images.lhamo_mini_loading}/>
    } else {
    return (
        <View style={{gap:10,marginBottom:10}}>
            <Image source={images.lhamo_mini}/>
            <View style={{backgroundColor:"#8C8C8A",padding:15,maxWidth:"90%",borderRadius:10}}>
            <Text style={{fontSize:16, color:"#FFFFFF"}}>{message}</Text>
            </View>
        </View>
        )
    }
}


export default Ai

