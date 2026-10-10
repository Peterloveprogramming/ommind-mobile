import React, { useEffect, useRef, useState } from 'react';
import { Keyboard, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { FONTS } from '@/theme';

interface OTPInputProps {
    value: string;
    onChange: (value: string) => void;
    length?: number;
    disabled?: boolean;
    autoFocus?: boolean;
}

// A single hidden TextInput drives all the boxes. This avoids the per-box
// focus/backspace quirks that differ between iOS and Android, and lets the
// OS one-time-code autofill / paste fill the whole code at once.
export const OTPInput: React.FC<OTPInputProps> = ({
    value,
    onChange,
    length = 6,
    disabled = false,
    autoFocus = true,
}) => {
    const inputRef = useRef<TextInput>(null);
    const [isFocused, setIsFocused] = useState(false);

    useEffect(() => {
        if (!autoFocus || disabled) return;
        // Android often ignores autoFocus during the screen transition.
        const timer = setTimeout(() => inputRef.current?.focus(), 350);
        return () => clearTimeout(timer);
    }, [autoFocus, disabled]);

    useEffect(() => {
        // Android's back button hides the keyboard but keeps the input focused,
        // so a later focus() would not reopen it. Blur so tapping a box works again.
        const subscription = Keyboard.addListener('keyboardDidHide', () => {
            inputRef.current?.blur();
        });
        return () => subscription.remove();
    }, []);

    const handleChangeText = (text: string) => {
        onChange(text.replace(/\D/g, '').slice(0, length));
    };

    const activeIndex = Math.min(value.length, length - 1);

    return (
        <Pressable
            style={styles.row}
            onPress={() => inputRef.current?.focus()}
            disabled={disabled}
            accessibilityRole="none"
        >
            {Array.from({ length }).map((_, index) => {
                const isActive = isFocused && index === activeIndex;
                return (
                    <View key={index} style={[styles.box, isActive && styles.boxActive]}>
                        <Text style={styles.digit} allowFontScaling={false}>
                            {value[index] ?? ''}
                        </Text>
                    </View>
                );
            })}
            <TextInput
                ref={inputRef}
                value={value}
                onChangeText={handleChangeText}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                maxLength={length}
                keyboardType="number-pad"
                textContentType="oneTimeCode"
                autoComplete="one-time-code"
                editable={!disabled}
                caretHidden
                style={styles.hiddenInput}
                accessibilityLabel="Verification code"
            />
        </Pressable>
    );
};

const styles = StyleSheet.create({
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '100%',
        gap: 6,
    },
    box: {
        flex: 1,
        maxWidth: 50,
        aspectRatio: 50 / 60,
        borderWidth: 1,
        borderColor: '#D1D1D6',
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
    },
    boxActive: {
        borderColor: '#000000',
    },
    digit: {
        fontFamily: FONTS.interSemiBold,
        fontSize: 24,
        color: '#000000',
        includeFontPadding: false,
        textAlignVertical: 'center',
    },
    hiddenInput: {
        position: 'absolute',
        width: 1,
        height: 1,
        opacity: 0,
    },
});

export default OTPInput;
