import React, { useEffect, useRef, useState } from 'react';
import { View, TextInput, Animated, TouchableOpacity, Text, StyleSheet,Image} from 'react-native';
// import { FONTS } from '@constants/Fonts';
import { images } from "@/constants/images";

interface OTPInputProps {
    value: string[];
    onChange: (value: string[]) => void;
    length?: number;
    disabled?: boolean;
    onResendOTP?: () => void;
    onConfirmCode?: () => void
}

export const OTPInput: React.FC<OTPInputProps> = ({
    value,
    onChange,
    length = 5,
    disabled = false,
    onResendOTP,
    onConfirmCode,
}) => {
    const inputRefs = useRef<TextInput[]>([]);
    const animatedValues = useRef<Animated.Value[]>([]);
    const [countdown, setCountdown] = useState(60);
    const [isResendActive, setIsResendActive] = useState(false);

    // Initialize animation values
    useEffect(() => {
        animatedValues.current = Array(length).fill(0).map(() => new Animated.Value(0));
    }, [length]);

    // Countdown timer
    useEffect(() => {
        let timer: NodeJS.Timeout;
        if (countdown > 0 && !isResendActive) {
            timer = setInterval(() => {
                setCountdown((prev) => prev - 1);
            }, 1000);
        } else if (countdown === 0) {
            setIsResendActive(true);
        }
        return () => {
            if (timer) clearInterval(timer);
        };
    }, [countdown, isResendActive]);

    const handleResendOTP = () => {
        if (isResendActive && onResendOTP) {
            onResendOTP();
            setCountdown(60);
            setIsResendActive(false);
            // Focus on first input after a small delay to ensure state is updated
            setTimeout(() => {
                focusInput(0);
            }, 50);
        }
    };

    const focusInput = (index: number) => {
        if (inputRefs.current[index]) {
            inputRefs.current[index].focus();

            // Trigger animation
            Animated.sequence([
                Animated.timing(animatedValues.current[index], {
                    toValue: 1,
                    duration: 100,
                    useNativeDriver: true,
                }),
                Animated.timing(animatedValues.current[index], {
                    toValue: 0,
                    duration: 100,
                    useNativeDriver: true,
                }),
            ]).start();
        }
    };

    const handleChange = (text: string, index: number) => {
        const newValue = [...value];
        newValue[index] = text;
        onChange(newValue);

        if (text && index < length - 1) {
            focusInput(index + 1);
        }
    };

    const handleKeyPress = (event: any, index: number) => {
        if (event.nativeEvent.key === 'Backspace' && !value[index] && index > 0) {
            focusInput(index - 1);
        }
    };

    return (
        <View style={styles.mainContainer}>
            <View style={styles.container}>
                {Array(length)
                    .fill(0)
                    .map((_, index) => {
                        const animatedStyle = {
                            transform: [
                                {
                                    scale: animatedValues.current[index]?.interpolate({
                                        inputRange: [0, 0.5, 1],
                                        outputRange: [1, 1.1, 1],
                                    }) || 1,
                                },
                            ],
                        };

                        return (
                            <Animated.View key={index} style={[styles.inputContainer, animatedStyle]}>
                                <TextInput
                                    ref={(ref) => {
                                        if (ref) inputRefs.current[index] = ref;
                                    }}
                                    style={[
                                        styles.input,
                                        value[index] ? styles.filledInput : {},
                                    ]}
                                    maxLength={1}
                                    keyboardType="number-pad"
                                    onChangeText={(text) => handleChange(text, index)}
                                    onKeyPress={(event) => handleKeyPress(event, index)}
                                    value={value[index]}
                                    editable={!disabled}
                                    selectTextOnFocus
                                    placeholder="●"
                                    placeholderTextColor="#B0B0B0"
                                />
                            </Animated.View>
                        );
                    })}
            </View>
            <View style={{flexDirection:"row",alignItems:"center",justifyContent:"space-evenly",marginTop:10}}>
                <TouchableOpacity
                    onPress={handleResendOTP}
                    disabled={!isResendActive}
                    style={styles.resendContainer}
                >
                    <Text
                        style={[
                            styles.resendText,
                            { opacity: 0.7 },
                        ]}
                    >
                        {isResendActive ? 'Send code again' : `Send code again in ${countdown}s`}
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={onConfirmCode}>
                    <Image source={images.next_button_icon} width={20} height={20} />
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    mainContainer: {
        width: '100%',
    },
    container: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '100%',
        marginVertical: 20,
    },
    inputContainer: {
        width: 66,
        height: 80,
        borderWidth: 1,
        borderRadius: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.5,
        elevation: 5,
    },
    input: {
        width: '100%',
        height: '100%',
        borderRadius: 10,
        backgroundColor: '#FFFFFF',
        textAlign: 'center',
        fontSize: 24,
        fontWeight: '600',
        color: '#000000',
    },
    filledInput: {
        backgroundColor: '#F0F0F0',
        borderColor: '#0000FF',
    },
    resendContainer: {
        alignItems: 'center',
    },
    resendText: {
        fontSize: 16,
        // fontFamily: FONTS.SemiBold,
    },
});

export default OTPInput;
