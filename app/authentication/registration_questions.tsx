import {Text,View,StyleSheet, TouchableOpacity,ScrollView} from 'react-native'
import BaseProgressBar from '@/comp/base/BaseProgressBar';
import BaseRadioButtonGroups from '@/comp/base/BaseRadioButtonGroup';
import {ALL_QUESTIONS} from "@/constants/registration_questions/registrationQuestions"
import { useState,useContext} from 'react';
import { FONTS } from '@/theme';
import { ToastVisibilityContext } from '@/context/useToast';
import BaseButton from '@/comp/base/BaseButton';
import { useRouter } from "expo-router";
import { useRegistrationQuestionApi } from '@/api/api';
import { checkIfLambdaResultIsSuccess, getLambdaErrorMessage } from '@/utils/helper';
import {SafeAreaView, SafeAreaProvider} from 'react-native-safe-area-context';
// debug
let debug = false;

const RegistrationQuestions = () => {
    const router = useRouter(); // Initialize the router
    const [currentBar,setCurrentBar] = useState<number>(1);
    const [saveAnswersLoading,setSaveAnswersLoading] = useState<boolean>(false);
    const [answers, setAnswers] = useState<{
        "1":string;
        "2":string;
        "3":string
        "4":string
        "5":string
    }>({
        "1":"",
        "2":"",
        "3":"",
        "4":"",
        "5":""
    }); // Store answers here
    const numberOfQuestions = ALL_QUESTIONS.length;
    const {showToastMessage} = useContext(ToastVisibilityContext)

    
    // const increaseCurrentBar = () => {
    //     if (currentBar<numberOfQuestions){
    //         setCurrentBar((prevState)=>prevState+=1)
    //     }
    // }

    const currentQuestion = ALL_QUESTIONS[currentBar-1]

     // Handle answer selection for each question
    const handleAnswerChange = (value: string) => {
        setAnswers((prevAnswers) => ({
            ...prevAnswers,
            [currentBar]: value, // Update the answer for the current question
        }));
    };
    
    const radioButtonOptions = currentQuestion.questionOptions.map(option=>({
        label:option.label,
        value:option.value
    }))
  const {
      saveAnswers:{saveAnswersForRegistrationQuestions},
    } = useRegistrationQuestionApi()

    // console.log(currentQuestion)
    return (
        <SafeAreaProvider>
            <SafeAreaView style={{flex:1,justifyContent:"center"}} edges={['left', 'right', 'bottom']}>
          <ScrollView
            contentInsetAdjustmentBehavior="automatic"
            onScroll={()=>console.log("scroll")}
            style={styles.container}
            contentContainerStyle={styles.scrollContent}
          >
            {/* progress bar */}
            <View style={styles.progressBarContainer}>
                <BaseProgressBar 
                    numberOfBars={numberOfQuestions}
                    currentBar={currentBar}
                />
            </View>

            {/* question title */}
            <View>
                <Text style={styles.questionTitle}>
                    {currentQuestion.questionTitle}
                </Text>
            </View>
            {/* question description */}
            <View>
                <Text style={styles.questionDescription}>
                    {currentQuestion.questionDescription}
                </Text>
            </View>
            {/* questions */}
            <BaseRadioButtonGroups
                selectedValue={answers[currentBar] || ''} // Get the selected answer for the current question
                onChange={handleAnswerChange}
                options={radioButtonOptions}
            />
            {/* buttons to go back and forth */}
            <View style={styles.buttonContainer}>
                <BaseButton
                    onPress={async ()=>{
                        if (!answers[currentBar]){
                            showToastMessage("Please select an option",false)
                            return;
                        }
                        if (currentBar == numberOfQuestions){
                            try{
                                setSaveAnswersLoading(true)
                                console.log("all questions have been answered")
                                const response = await saveAnswersForRegistrationQuestions(answers)
                                console.log("the response is",response)
                                const answersSavedSuccessfully = checkIfLambdaResultIsSuccess(response)
                                if (answersSavedSuccessfully)
                                {
                                    showToastMessage("Answers have been saved",true)
                                    router.replace("/(tabs)")
                                    return;
                                } else {
                                    showToastMessage(getLambdaErrorMessage(response as Record<string, unknown>),false)
                                    return;
                                }

                            } catch(e){
                                console.error("An error has occurred while attempting to save answers",e)
                                showToastMessage("An error has occurred while attempting to save answers",false)

                            }finally {
                                setSaveAnswersLoading(false)

                            }
                        } else {
                            setCurrentBar((prevState)=>prevState+1)

                        }
                    }}
                    text="Continue"
                    isLoading={saveAnswersLoading}
                />

                <BaseButton
                    onPress={()=>{
                        if (currentBar !=1){
                            setCurrentBar((prevState)=>prevState-1)
                        }
                    }}
                    text="Go Back"
                    backgroundColor='transparent'
                    fontColor='black'
                    style={{
                        marginBottom:10,
                        borderWidth:1,
                        borderColor:"#757575"
                    }}
                />
            </View>
        </ScrollView>
        </ SafeAreaView>
        </ SafeAreaProvider>
    )
}
export default RegistrationQuestions 

const styles = StyleSheet.create({
    container:{
        padding:15,
        flex:1,
    },
    scrollContent:{
        flexGrow:1,
        justifyContent:"center",
        paddingBottom:30,
    },
    progressBarContainer:{
        marginBottom:20,
        alignItems:"center",
    },
    questionTitle:{
        fontFamily:FONTS.figtreeSemiBold,
        fontSize:32,
        marginTop:10,
        textAlign:"center"
    },
    questionDescription:{
        marginTop:10,
        fontSize:18,
        opacity:0.7,
        marginBottom:10,
    },
    buttonContainer:{
        marginTop:10,
        gap:10,
        borderWidth:debug?1:0,
        width:"100%",
        paddingBottom:20,
    }
})
