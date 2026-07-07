import React, { useState } from 'react'
import { StyleSheet, Text, View, TextInput, TouchableOpacity, Image, Platform } from 'react-native'
import { Stack, useRouter } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { KeyboardAvoidingView } from 'react-native-keyboard-controller'
import { images } from '@/constants/images'
import Back from '@/assets/svg/header/Back'
import PrecautionButton from '@/assets/svg/chat/PrecautionButton'
import MicButton from '@/assets/svg/chat/MicButton'
import Ai from '@/comp/chat/Ai'

const GREETING_MESSAGE =
  "Hello😊,\nI will provide you with a personalized regimen based on the wisdom of Tibetan medicine. Please describe your symptoms."

const NewChatScreen = () => {
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const [inputText, setInputText] = useState('')

  return (
    <KeyboardAvoidingView
      style={styles.parent}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <Stack.Screen options={{ headerShown: false }} />

      <View style={[styles.headerRow, { paddingTop: insets.top + 8 }]}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={12}>
          <Back />
        </TouchableOpacity>

        <View style={styles.rinpochePill}>
          <Image source={images.lhamo_mini} />
          <Text style={styles.rinpocheText}>Rinpoche</Text>
        </View>

        <TouchableOpacity hitSlop={12}>
          <Ionicons name="share-outline" size={22} color="#474747" />
        </TouchableOpacity>
      </View>

      <View style={styles.precautionRow}>
        <Text style={styles.precautionText}>Precautionary note</Text>
        <PrecautionButton />
      </View>

      <View style={styles.chatBody}>
        <Ai message={GREETING_MESSAGE} showRating={false} />
      </View>

      <View style={[styles.inputView, { paddingBottom: Math.max(insets.bottom, 8) }]}>
        <View style={styles.inputPill}>
          <TextInput
            style={styles.inputBox}
            placeholder="You can type here to reply..."
            placeholderTextColor="#999"
            value={inputText}
            onChangeText={setInputText}
            multiline
          />
          <TouchableOpacity activeOpacity={0.85} style={styles.micButtonContainer}>
            <MicButton />
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  )
}

export default NewChatScreen

const styles = StyleSheet.create({
  parent: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  rinpochePill: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    width: 135,
    height: 40,
    borderRadius: 50,
    backgroundColor: 'rgba(71, 71, 71, 0.5)',
  },
  rinpocheText: {
    color: '#FFFFFF',
  },
  precautionRow: {
    flexDirection: 'row',
    gap: 5,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 5,
  },
  precautionText: {
    color: 'rgba(71, 71, 71, 0.5)',
  },
  chatBody: {
    flex: 1,
    paddingHorizontal: 10,
    paddingVertical: 10,
  },
  inputView: {
    paddingHorizontal: 10,
    paddingTop: 5,
  },
  inputPill: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 30,
    backgroundColor: '#F7F2E9',
    paddingLeft: 20,
    paddingRight: 6,
    minHeight: 56,
  },
  inputBox: {
    flex: 1,
    maxHeight: 80,
    paddingVertical: Platform.OS === 'ios' ? 14 : 10,
    fontSize: 16,
    color: '#333',
  },
  micButtonContainer: {
    marginLeft: 6,
  },
})
