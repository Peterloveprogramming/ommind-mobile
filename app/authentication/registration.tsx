import { Checkbox } from 'expo-checkbox';
import { useState,useContext } from 'react';
import { StyleSheet, Text, View, KeyboardAvoidingView, Platform, TouchableOpacity, Image, ScrollView, TouchableWithoutFeedback, Keyboard } from 'react-native';
import { COLORS, FONTS } from "@/theme.js";
import BaseTextInput from "@/comp/base/BaseTextInput";
import OTPInput from '@/comp/OTPInput';
import { useRouter,Router } from "expo-router";
import { useUserApi } from '@/api/api';
import { useToast } from '@/context/useToast';
import { convertFieldNameToReadableFormat,checkIfLambdaResultIsSuccess } from '@/utils/helper';
import BaseButton from '@/comp/base/BaseButton';
import { storeAuthInfo } from '@/utils/helper';
let debugUi = false;
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

interface EmailVerificationProps {
  email:string,
  editEmail:()=>void
  router:Router
  showToastMessage: (message: string, success: boolean) => void;
}
const EmailVerification = ({
  email,
  editEmail,
  router,
  showToastMessage
}:EmailVerificationProps) => {
  const [emailVerificationCode,setEmailVerificationCode] = useState<String>("ok")
  const [otp, setOtp] = useState<string[]>(new Array(5).fill('')); // Adjust length based on OTP length
  const [isResendActive, setIsResendActive] = useState(false);
  const onConfirmCode = async () => {
    let codeMissing = false;
    otp.forEach((code,_)=>{
      if (code.trim().length==0){
        codeMissing = true
        return;
      }
    })
    if (codeMissing){
      console.log("please enter full code")
      showToastMessage("Please enter the full code",false)
    } else {
            await new Promise(resolve => setTimeout(resolve, 700)); // Use await for delay

       showToastMessage("OTP Successfully Verified!",true)
      await new Promise(resolve => setTimeout(resolve, 1000)); // Use await for delay
       router.replace('/authentication/registration_questions');
    }
  }
  
  const handleOtpChange = (newOtp: string[]) => {
    setOtp(newOtp);
  };
  console.log(otp)
    const handleResendOtp = () => {
    // Your logic to resend OTP
    console.log("Resending OTP...");
  };
  return (<>
    <View style={emailVerificationStyles.parent}>
      {/* Email */}
      <View>
        <Text style={styles.askEmailText}>Enter Code</Text>
      </View>
      <Text style={{opacity: 0.7}}>
        We’ve sent an activation code to your email address 
        <Text style={{fontWeight: 'bold'}}> {email}</Text> 
      </Text>
      <TouchableOpacity 
        style={{marginLeft:10}}
        onPress={editEmail}
      > 
        <Text style={{
          color:COLORS.brandYellow,
          marginTop:10
        }}>
          Edit Email
        </Text>
      </TouchableOpacity>
      <OTPInput
        value={otp}
        onChange={handleOtpChange}
        length={5} // Length of OTP
        onResendOTP={handleResendOtp}
        onConfirmCode={onConfirmCode}
      />
    </View>
  </>
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

  return (
    <View style={styles.container}>
      <KeyboardAvoidingView
        style={{ flex: 1 }} 
        behavior="padding"
        keyboardVerticalOffset={Platform.OS === 'ios' ? 20 : 100}
      >
        {/* Dismissing the keyboard when tapping outside */}
        <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
          <ScrollView contentContainerStyle={styles.scrollViewContainer}>
            {stage == REGISTER?
             <RegisterForm
              onPressRegister={handleRegistration}
              handleInputChange={handleInputChange}
              details={details}
              isLoading={isLoading}
            />:
            <EmailVerification
              email={details.email}
              editEmail={()=>setStage(REGISTER)}
              router={router}
              showToastMessage={showToastMessage}
            />
          }
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
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
    paddingVertical:30,
    paddingHorizontal:5
  }
})