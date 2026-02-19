import {StyleSheet,Text,View,Image} from 'react-native'
import React from 'react'
import { images } from '@/constants/images'

const ChatContainerTwoImage = () => {
    return (
        <View style={{ left:50,flexDirection: "row",justifyContent:"flex-end",flex:1,width:"100%",alignItems:"flex-end"}}>
            <Image resizeMode="contain"style={{height:"100%",width:"145%",position:"absolute"}}source={images.chat_container_two}/>
        </View>
    )
}


export default ChatContainerTwoImage

const styles = StyleSheet.create({})