import {Text,View,Image, TouchableOpacity} from 'react-native'
import React from 'react'
import { images } from '@/constants/images'

type AiProps = {
    message: string;
    showPlaybackControl?: boolean;
    showPlayButton?: boolean;
    onPlaybackControlPress?: () => void;
    onReplayPress?: () => void;
    onFavouritePress?: () => void;
    showRating?:boolean;
  };

  
const Ai = ({
    message,
    showPlaybackControl = false,
    showPlayButton = false,
    onPlaybackControlPress,
    onReplayPress,
    onFavouritePress,
    showRating = false,
}:AiProps) => {
    if (message == "loading"){
        return <Image source={images.lhamo_mini_loading}/>
    } else {
    return (
        <View style={{gap:10,marginBottom:10}}>
            <Image source={images.lhamo_mini}/>
            <View style={{backgroundColor:"#8C8C8A",padding:15,maxWidth:"90%",borderRadius:10,flexDirection:"row",alignItems:"center",gap:8}}>
            <Text style={{fontSize:16, color:"#FFFFFF",flexShrink:1}}>{message}</Text>
            {showPlaybackControl ? (
                <View style={{ flexDirection: "row", alignItems: "center", gap: 5 }}>
                    <TouchableOpacity
                        onPress={onPlaybackControlPress}
                        hitSlop={6}
                        style={{
                            width: 30,
                            height: 30,
                            alignItems: "center",
                            justifyContent: "center",
                        }}
                    >
                        <Image
                            source={
                                showPlayButton
                                  ? images.play_button_guided_meditation
                                  : images.pause_button_guided_meditation
                            }
                            style={{ width: 30, height: 30 }}
                            resizeMode="contain"
                        />
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={onReplayPress}
                        hitSlop={6}
                        style={{
                            width: 30,
                            height: 30,
                            alignItems: "center",
                            justifyContent: "center",
                        }}
                    >
                        <Image
                            source={images.replay_button}
                            style={{ width: 30, height: 30 }}
                            resizeMode="contain"
                        />
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={onFavouritePress}
                        hitSlop={6}
                        style={{
                            width: 30,
                            height: 30,
                            alignItems: "center",
                            justifyContent: "center",
                        }}
                    >
                        <Image
                            source={images.favourite_button}
                            style={{ width: 30, height: 30 }}
                            resizeMode="contain"
                        />
                    </TouchableOpacity>
                </View>
            ) : null}
           
            </View>
        </View>
        )
    }
}


export default Ai
