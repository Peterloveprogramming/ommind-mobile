import React, { useEffect } from "react";
import { View,Text,StyleSheet,Animated} from "react-native"

let debugUI = false;
interface ToastProps {
    setToast: React.Dispatch<React.SetStateAction<boolean>>
    message:String,
    success:Boolean
}
const Toast = ({
    setToast,
    message,
    success
}:ToastProps) => {
    const bottom = React.useRef(new Animated.Value(-80)).current;
    const opacity = React.useRef(new Animated.Value(1)).current;

   function animate() {
    Animated.timing(bottom, {
        toValue: 20,
        duration: success?1000:500,
        useNativeDriver: false,
    }).start(() => {
        // Wait 2 seconds before fading out
        setTimeout(() => {
        Animated.timing(opacity, {
            toValue: 0,
            duration: success?700:350,
            useNativeDriver: false,
        }).start(() => {
            setToast(false);
        });
        }, 1500); // 👈 change this number to control how long the toast stays
    });
    }

    useEffect(()=>{
        animate()
    },[])
    return (
        <Animated.View style={[styles.container, { bottom, opacity }]}>
        <Text style={{ color: "white", fontSize: 25 }}>
            {success ? "✅️" : "⚠️"}
        </Text>
        <View style={styles.toastContent}>
            <Text style={{ fontWeight: "bold", color: "white" }}>{success?"Success":"Error"}</Text>
            <Text style={{ fontSize: 15, color: "white" }}>{message}</Text>
        </View>
        </Animated.View>
    )
}

export default Toast
const styles = StyleSheet.create({
    container: {
        flexDirection: "row",
        backgroundColor: "#555555",
        paddingHorizontal: 20,
        paddingVertical: 10,
        position: "absolute",
        left: 40, // Align the container to the left
        right:40, // Align the container to the right
        alignItems: "center", // Center horizontally
        justifyContent: "center", // Center vertically if necessary
        borderWidth: debugUI ? 2 : 0,
    },
    toastContent: {
        // alignItems: 'center',
        marginLeft:12
    }
});
