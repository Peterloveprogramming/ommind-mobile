import {StyleSheet,Text,View} from 'react-native'
import React from 'react'
import * as Clipboard from 'expo-clipboard'
import { useToast } from '@/context/useToast'
import { FONTS } from '@/theme.js'

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
        <View style={styles.container}>
            <View style={styles.bubble}>
                <Text
                    style={styles.messageText}
                    selectable
                    onLongPress={handleCopy}
                >{message}</Text>
            </View>
        </View>
    )
}


export default Human

const styles = StyleSheet.create({
    container: {
        alignItems: "flex-end",
        marginBottom: 15,
    },
    bubble: {
        maxWidth: 350,
        padding: 12,
        borderRadius: 15,
        backgroundColor: "#000000",
    },
    messageText: {
        fontFamily: FONTS.interRegular,
        fontSize: 15,
        lineHeight: 20,
        letterSpacing: -0.24,
        color: "#FFFFFF",
    },
})
