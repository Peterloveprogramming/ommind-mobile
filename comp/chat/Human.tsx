import {Text,View} from 'react-native'
import React from 'react'
import * as Clipboard from 'expo-clipboard'
import { useToast } from '@/context/useToast'

// Define prop types using an interface or type alias for better clarity
type HumanProps = {
    message: string;
  };


const Human = ({message}:HumanProps) => {
    const { showToastMessage } = useToast();

    const handleCopy = async () => {
        await Clipboard.setStringAsync(message);
        showToastMessage("Copied to clipboard", true);
    };

    return (
        <View style={{alignItems:"flex-end",marginBottom:10}}>
        <View style={{backgroundColor:"#000000",padding:15,maxWidth:"90%",borderRadius:10}}>
            <Text
                style={{fontSize:16,color:"white"}}
                selectable
                onLongPress={handleCopy}
            >{message}</Text>
        </View>
        </View>
    )
}


export default Human
