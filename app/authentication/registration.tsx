import { Checkbox } from 'expo-checkbox';
import { useEffect, useState } from 'react';
import { StyleSheet, Text, View, KeyboardAvoidingView as KeyboardAvoidingViewRN, Platform, TouchableOpacity, Image, ScrollView, TouchableWithoutFeedback, Keyboard } from 'react-native';
import { COLORS, FONTS } from "@/theme.js";
import BaseTextInput from "@/comp/base/BaseTextInput";
import OTPInput from '@/comp/OTPInput';
import { Stack, useRouter, Router } from "expo-router";
import { KeyboardAvoidingView, useKeyboardState } from "react-native-keyboard-controller";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { images } from "@/constants/images";
import { useUserApi } from '@/api/api';
import { useToast } from '@/context/useToast';
import { convertFieldNameToReadableFormat,checkIfLambdaResultIsSuccess } from '@/utils/helper';
import BaseButton from '@/comp/base/BaseButton';
import { storeAuthInfo } from '@/utils/helper';
let debugUi = false;
const VERIFY_BACKGROUND = '#FAFAFA';
interface RegisterFormProps{
  onPressRegister:() => void
  handleInputChange:(field:keyof UserDetails,newValue:string)=>void
  details:UserDetails,
  isLoading:boolean
}

const RegisterForm = ({
    onPressRegister,
    handleInputChange,
    details,
    isLoading
  }:RegisterFormProps) => {
  const [isChecked, setChecked] = useState(true);
  const [passwordSecurityEntry, setPasswordSecurityEntry] = useState<Boolean>(true);

  return (
    <>
    <View style={styles.topSection}>
      {/* Information */}
      <View>
        <Text style={styles.askEmailText}>Could you share a few details with us?</Text>
      </View>
      <BaseTextInput
        value={details.first_name}
        label="First Name"
        onChangeText={(newValue: string) => handleInputChange("first_name", newValue)}
        required={true}
        inputStyle={{
          marginBottom: 5,
        }}
      />

      <BaseTextInput
        value={details.last_name}
        label="Last Name"
        onChangeText={(newValue: string) => handleInputChange("last_name", newValue)}
        required={true}
        inputStyle={{
          marginBottom: 5,
        }}
      />

      <BaseTextInput
        value={details.email}
        label="Email"
        onChangeText={(newValue: string) => handleInputChange("email", newValue)}
        required={true}
      />
      <BaseTextInput
        value={details.password}
        label="Password"
        onChangeText={(newValue: string) => handleInputChange("password", newValue)}
        required={true}
        securityEntry={passwordSecurityEntry}
        inputStyle={{
          marginBottom: 5,
        }}
      />
      <TouchableOpacity
        onPress={() => {
          setPasswordSecurityEntry((prevState) => !prevState);
        }}
      >
        <Text style={{ marginLeft: 20, fontSize: 12, marginTop: 0 }}>
          {passwordSecurityEntry ? 'Show Password' : 'Hide Password'}
        </Text>
      </TouchableOpacity>

      <View style={styles.marketingCommunication}>
        <Checkbox
          style={styles.checkbox}
          value={isChecked}
          onValueChange={setChecked}
          color={isChecked ? COLORS.brandYellow : undefined}
        />
        <View style={{ width: '60%',marginTop:30}}>
          <Text style={styles.marketingText}>
            Stay in the loop with our latest updates, exclusive deals, and special offers
          </Text>
        </View>
      </View>
      <BaseButton 
        text='Continue'
        isLoading={isLoading}
        onPress={onPressRegister}
      />
      
    </View>

  </>
  )
}

const OTP_LENGTH = 6;
const RESEND_COOLDOWN_SECONDS = 30;

const formatCountdown = (seconds: number) => {
  const minutes = Math.floor(seconds / 60);
  const remainder = seconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(remainder).padStart(2, '0')}`;
};

interface EmailVerificationProps {
  email:string,
  editEmail:()=>void
  router:Router
  showToastMessage: (message: string, success: boolean) => void;
}
// UI only for now: any complete code is accepted and "Send code again" just
// confirms with a toast. Real OTP verification/resend is not wired up yet.
const EmailVerification = ({
  email,
  editEmail,
  router,
  showToastMessage
}:EmailVerificationProps) => {
  const insets = useSafeAreaInsets();
  const isKeyboardVisible = useKeyboardState((s) => s.isVisible);
  const [otp, setOtp] = useState('');
  const [secondsLeft, setSecondsLeft] = useState(RESEND_COOLDOWN_SECONDS);
  const [isVerifying, setIsVerifying] = useState(false);
  const canResend = secondsLeft === 0;

  useEffect(() => {
    if (secondsLeft === 0) return;
    const timer = setTimeout(() => setSecondsLeft((prev) => prev - 1), 1000);
    return () => clearTimeout(timer);
  }, [secondsLeft]);

  const onConfirmCode = async () => {
    if (isVerifying) return;
    if (otp.length < OTP_LENGTH) {
      showToastMessage("Please enter the full code",false)
      return;
    }
    setIsVerifying(true)
    showToastMessage("OTP Successfully Verified!",true)
    await new Promise(resolve => setTimeout(resolve, 1000));
    router.replace('/authentication/registration_questions');
  }

  const handleResendOtp = () => {
    if (!canResend) return;
    showToastMessage("Code sent successfully",true)
    setOtp('')
    setSecondsLeft(RESEND_COOLDOWN_SECONDS)
  };

  return (
    <KeyboardAvoidingView
      style={emailVerificationStyles.parent}
      behavior="padding"
      automaticOffset
    >
      <ScrollView
        style={emailVerificationStyles.scroll}
        contentContainerStyle={emailVerificationStyles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={emailVerificationStyles.head}>
          <Text style={emailVerificationStyles.title}>Enter code</Text>
          <Text style={emailVerificationStyles.subtitle}>
            We’ve sent an activation code to your email address{' '}
            <Text style={emailVerificationStyles.subtitleBold}>{email}</Text>
            {'  •  '}
            <Text
              style={[emailVerificationStyles.subtitleBold, emailVerificationStyles.editLink]}
              onPress={editEmail}
              suppressHighlighting
            >
              Edit
            </Text>
          </Text>
        </View>
        <OTPInput
          value={otp}
          onChange={setOtp}
          length={OTP_LENGTH}
          disabled={isVerifying}
        />
      </ScrollView>

      <View
        style={[
          emailVerificationStyles.commands,
          { paddingBottom: isKeyboardVisible ? 18 : insets.bottom + 18 },
        ]}
      >
        <TouchableOpacity
          onPress={handleResendOtp}
          disabled={!canResend}
          hitSlop={{ top: 12, bottom: 12, left: 8, right: 8 }}
          style={emailVerificationStyles.resend}
        >
          <Text
            style={[
              emailVerificationStyles.resendText,
              canResend && emailVerificationStyles.resendTextActive,
            ]}
          >
            Send code again
          </Text>
          {!canResend && (
            <Text style={emailVerificationStyles.countdownText}>
              {formatCountdown(secondsLeft)}
            </Text>
          )}
        </TouchableOpacity>
        <TouchableOpacity
          onPress={onConfirmCode}
          disabled={isVerifying}
          accessibilityRole="button"
          accessibilityLabel="Verify code"
        >
          <Image source={images.next_button_icon} style={emailVerificationStyles.nextButton} />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  )
}

interface UserDetails {
  email: string;
  password: string;
  first_name:string;
  last_name:string
}

const REGISTER = "register"
const VERIFY_EMAIL = "verifyEmail"
type Stage = typeof REGISTER | typeof VERIFY_EMAIL

export default function Registration() {
  const [stage,setStage] = useState<Stage>(REGISTER)
  const router = useRouter(); // Initialize the router
  const [details, setDetails] = useState<UserDetails>({
    email: '',
    password: '',
    first_name:'',
    last_name:''
  });
  const [isLoading,setIsLoading] = useState(false);

  const {
      createUser:{createUser},
    } = useUserApi()
  
    const { showToastMessage } = useToast();


  
  const handleInputChange = (field: keyof UserDetails, value: string) => {
    setDetails((prevstate) => ({
      ...prevstate,
      [field]: value,
    }));
  };

  const handleRegistration = async () => {
    console.log("details are",details)
    setIsLoading(true)
    for (const key in details){
      const value = details[key as keyof UserDetails]
      if (!value){
        showToastMessage(`${convertFieldNameToReadableFormat(key)} is missing`,false)
        setIsLoading(false)
        return;
      }
    }
    try{
      const createUserResult = await createUser({
        email:details.email,
        name:details.first_name + " " + details.last_name,
        password:details.password
      })

      // check if lambda result is valid 
      
      console.log(createUserResult)
      const resultSuccess = checkIfLambdaResultIsSuccess(createUserResult)
      if (!resultSuccess){
          showToastMessage(createUserResult.response,false)
        return;
      }

      showToastMessage("Successfully Registered!",true)

      await storeAuthInfo({
        userName:createUserResult.data.name,
        userId:createUserResult.data.user_id,
        jwtToken:createUserResult.data.jwt_token
      })

      setStage(VERIFY_EMAIL)
    } catch (error){
      console.log("error is",error)
      showToastMessage('Error occurred while registering',false)
    } finally{
      console.log("finally...")
      setIsLoading(false)
    }
  }

  if (stage === VERIFY_EMAIL) {
    return (
      <>
        <Stack.Screen options={{ headerStyle: { backgroundColor: VERIFY_BACKGROUND }, headerShadowVisible: false }} />
        <EmailVerification
          email={details.email}
          editEmail={()=>setStage(REGISTER)}
          router={router}
          showToastMessage={showToastMessage}
        />
      </>
    )
  }

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerStyle: { backgroundColor: '#FFFFFF' }, headerShadowVisible: true }} />
      <KeyboardAvoidingViewRN
        style={{ flex: 1 }} 
        behavior="padding"
        keyboardVerticalOffset={Platform.OS === 'ios' ? 20 : 100}
      >
        {/* Dismissing the keyboard when tapping outside */}
        <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
          <ScrollView contentContainerStyle={styles.scrollViewContainer}>
            <RegisterForm
              onPressRegister={handleRegistration}
              handleInputChange={handleInputChange}
              details={details}
              isLoading={isLoading}
            />
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingViewRN>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 10,
    borderWidth: debugUi ? 2 : 0,
  },
  topSection: {
    marginTop: 20,
    // flex: 1,
    // backgroundColor:"pink",
    borderWidth: debugUi ? 2 : 0,
  },
  askEmailText: {
    fontFamily: FONTS.figtreeSemiBold,
    fontSize: 32,
    marginBottom: 20,
  },
  bottomSection: {
    // flex: 1,
    // justifyContent: 'flex-end',
  },
  marketingCommunication: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    borderWidth: debugUi ? 2 : 0,
    marginBottom: 20,
  },
  marketingText: {
    fontSize: 16,
    borderWidth: debugUi ? 2 : 0,
    textAlign: 'center',
    opacity: 0.7,
  },
  checkbox: {
    borderRadius: 5,
    margin: 8,
  },
  scrollViewContainer: {
    flexGrow: 1,
    justifyContent: 'space-between', // Ensures the content is spaced out correctly
  },
});

const emailVerificationStyles = StyleSheet.create({
  parent:{
    flex:1,
    backgroundColor: VERIFY_BACKGROUND,
  },
  scroll:{
    flex:1,
  },
  content:{
    width:'100%',
    maxWidth:440,
    alignSelf:'center',
    paddingHorizontal:23,
    paddingTop:24,
    paddingBottom:24,
    gap:34,
  },
  head:{
    gap:11,
  },
  title:{
    fontFamily: FONTS.figtreeSemiBold,
    fontSize: 32,
    letterSpacing: 0.36,
    color: '#000000',
  },
  subtitle:{
    fontFamily: FONTS.interRegular,
    fontSize: 16,
    lineHeight: 21,
    letterSpacing: -0.32,
    color: 'rgba(0,0,0,0.7)',
  },
  subtitleBold:{
    fontFamily: FONTS.interSemiBold,
  },
  editLink:{
    color: COLORS.brandYellow,
  },
  commands:{
    width:'100%',
    maxWidth:440,
    alignSelf:'center',
    flexDirection:'row',
    alignItems:'center',
    justifyContent:'space-between',
    paddingHorizontal:23,
    paddingTop:8,
  },
  resend:{
    flexDirection:'row',
    alignItems:'center',
    gap:13,
  },
  resendText:{
    fontFamily: FONTS.interSemiBold,
    fontSize: 16,
    lineHeight: 21,
    letterSpacing: -0.32,
    color: 'rgba(0,0,0,0.7)',
  },
  resendTextActive:{
    color: '#000000',
  },
  countdownText:{
    fontFamily: FONTS.interRegular,
    fontSize: 16,
    lineHeight: 21,
    letterSpacing: -0.32,
    color: 'rgba(0,0,0,0.7)',
    fontVariant: ['tabular-nums'],
  },
  nextButton:{
    width:48,
    height:48,
  },
})
