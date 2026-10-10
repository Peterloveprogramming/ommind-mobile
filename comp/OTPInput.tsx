import React, { useEffect, useRef, useState } from 'react';
import { NativeSyntheticEvent, StyleSheet, TextInput, TextInputKeyPressEventData, View } from 'react-native';
import { FONTS } from '@/theme';

interface OTPInputProps {
    value: string;
    onChange: (value: string) => void;
    length?: number;
    disabled?: boolean;
    autoFocus?: boolean;
}

const toCells = (value: string, length: number) =>
    Array.from({ length }, (_, index) => value[index] ?? '');

// One real TextInput per box (like the original OTP screen): tapping a box
// focuses exactly that box, typing a digit jumps to the next one and
// backspace on an empty box steps back. Pasting / OS autofill of the whole
// code into any box spreads it across the boxes from there.
export const OTPInput: React.FC<OTPInputProps> = ({
    value,
    onChange,
    length = 6,
    disabled = false,
    autoFocus = true,
}) => {
    const inputRefs = useRef<(TextInput | null)[]>([]);
    const [cells, setCells] = useState<string[]>(() => toCells(value, length));
    const [focusedIndex, setFocusedIndex] = useState<number | null>(null);

    // Follow outside resets (e.g. "Send code again" clears the code).
    useEffect(() => {
        if (value !== cells.join('')) setCells(toCells(value, length));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [value, length]);

    useEffect(() => {
        if (!autoFocus || disabled) return;
        // Android often ignores autoFocus during the screen transition.
        const timer = setTimeout(() => inputRefs.current[0]?.focus(), 350);
        return () => clearTimeout(timer);
    }, [autoFocus, disabled]);

    const focusInput = (index: number) => {
        inputRefs.current[Math.max(0, Math.min(index, length - 1))]?.focus();
    };

    const updateCells = (next: string[]) => {
        setCells(next);
        onChange(next.join(''));
    };

    const handleChangeText = (text: string, index: number) => {
        const digits = text.replace(/\D/g, '');
        const current = cells[index];
        const next = [...cells];

        if (!digits) {
            next[index] = '';
            updateCells(next);
            return;
        }

        // Typing into a box that already has a digit gives two characters;
        // keep the one the user just typed.
        if (current && digits.length === 2) {
            next[index] = digits.startsWith(current) ? digits[1] : digits[0];
            updateCells(next);
            focusInput(index + 1);
            return;
        }

        // Paste / autofill: spread the digits from this box onwards.
        const pasted = digits.slice(0, length - index).split('');
        pasted.forEach((digit, offset) => {
            next[index + offset] = digit;
        });
        updateCells(next);

        const lastFilled = index + pasted.length - 1;
        if (lastFilled < length - 1) {
            focusInput(lastFilled + 1);
        } else {
            inputRefs.current[lastFilled]?.blur();
        }
    };

    const handleKeyPress = (
        event: NativeSyntheticEvent<TextInputKeyPressEventData>,
        index: number
    ) => {
        if (event.nativeEvent.key !== 'Backspace' || cells[index] || index === 0) return;
        const next = [...cells];
        next[index - 1] = '';
        updateCells(next);
        focusInput(index - 1);
    };

    return (
        <View style={styles.row}>
            {cells.map((digit, index) => (
                <TextInput
                    key={index}
                    ref={(ref) => {
                        inputRefs.current[index] = ref;
                    }}
                    value={digit}
                    onChangeText={(text) => handleChangeText(text, index)}
                    onKeyPress={(event) => handleKeyPress(event, index)}
                    onFocus={() => setFocusedIndex(index)}
                    onBlur={() => setFocusedIndex((prev) => (prev === index ? null : prev))}
                    keyboardType="number-pad"
                    textContentType="oneTimeCode"
                    autoComplete={index === 0 ? 'one-time-code' : 'off'}
                    editable={!disabled}
                    caretHidden
                    allowFontScaling={false}
                    style={[styles.box, focusedIndex === index && styles.boxActive]}
                    accessibilityLabel={`Verification code digit ${index + 1}`}
                />
            ))}
        </View>
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
        padding: 0,
        textAlign: 'center',
        textAlignVertical: 'center',
        includeFontPadding: false,
        fontFamily: FONTS.interSemiBold,
        fontSize: 24,
        color: '#000000',
    },
    boxActive: {
        borderColor: '#000000',
    },
});

export default OTPInput;
