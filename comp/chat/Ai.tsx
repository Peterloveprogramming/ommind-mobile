import {ActivityIndicator, Text,View,Image, TouchableOpacity} from 'react-native'
import React, { useEffect, useState } from 'react'
import { images } from '@/constants/images'
import PauseButton from '@/assets/svg/chat/PauseButton'
import PlayButton from '@/assets/svg/chat/PlayButton'

type AiProps = {
    message: string;
    showSpinner?: boolean;
  };

  
const Ai = ({message, showSpinner = false}:AiProps) => {
    const [showPlayButton, setShowPlayButton] = useState(false);

    useEffect(() => {
        if (!showSpinner) {
            setShowPlayButton(false);
        }
    }, [showSpinner]);

    if (message == "loading"){
        return <Image source={images.lhamo_mini_loading}/>
    } else {
    return (
        <View style={{gap:10,marginBottom:10}}>
            <Image source={images.lhamo_mini}/>
            <View style={{backgroundColor:"#8C8C8A",padding:15,maxWidth:"90%",borderRadius:10,flexDirection:"row",alignItems:"center",gap:8}}>
            <Text style={{fontSize:16, color:"#FFFFFF",flexShrink:1}}>{message}</Text>
            {showSpinner ? (
                <TouchableOpacity onPress={() => {
                    setShowPlayButton((prevState) => !prevState);
                    console.log(showPlayButton ? "play pressed" : "pause pressed");
                }}>
                    {showPlayButton ? <PlayButton /> : <PauseButton />}
                </TouchableOpacity>
            ) : null}
            </View>
        </View>
        )
    }
}


export default Ai
