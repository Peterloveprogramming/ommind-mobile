import {StyleSheet,Text,View,Image} from 'react-native'
import React from 'react'
import { images } from '@/constants/images'

const ChatContainerOneImage = () => {
    return (
        <View>
            <Image resizeMode="contain" style={{position:"absolute"}}source={images.chat_container_one_tree}/>
            <Image resizeMode="contain"  style={{bottom:-110,width:150}} source={images.chat_container_one_people}/>
        </View>
    )
}


export default ChatContainerOneImage

const styles = StyleSheet.create({})