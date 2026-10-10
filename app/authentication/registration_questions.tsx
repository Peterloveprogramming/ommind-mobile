import {Text,View,StyleSheet,ScrollView,useWindowDimensions} from 'react-native'
import BaseProgressBar from '@/comp/base/BaseProgressBar';
import BaseRadioButtonGroups from '@/comp/base/BaseRadioButtonGroup';
import {ALL_QUESTIONS} from "@/constants/registration_questions/registrationQuestions"
import { useState,useContext,useEffect,useRef} from 'react';
import { FONTS } from '@/theme';
import { ToastVisibilityContext } from '@/context/useToast';
import BaseButton from '@/comp/base/BaseButton';
import BackHeader from '@/comp/headers/BackHeader';
import { useRouter } from "expo-router";
import { useRegistrationQuestionApi } from '@/api/api';
import { checkIfLambdaResultIsSuccess, getLambdaErrorMessage } from '@/utils/helper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Layout tokens for this screen (spec 05). Kept here so a later
// colour/design-token spec can move them in one go.
const QUESTIONS_UI = {
    gutter: 24,
    contentPaddingTop: 16,
    maxContentWidth: 480,
    compactHeightBreakpoint: 740,
    regular: {
        optionGap: 12,
        titleSize: 32,
        progressToTitle: 20,
        descriptionToOptions: 24,
    },
    compact: {
        optionGap: 8,
        titleSize: 28,
        progressToTitle: 12,
        descriptionToOptions: 16,
    },
    titleToDescription: 8,
    descriptionFontSize: 18,
    descriptionOpacity: 0.7,
    optionsPaddingBottom: 16,
    footerPaddingTop: 12,
    footerMinPaddingBottom: 16,
    footerGap: 10,
    maxFontSizeMultiplier: 1.3,
};

const RegistrationQuestions = () => {
    const router = useRouter(); // Initialize the router
    const insets = useSafeAreaInsets();
    const { height } = useWindowDimensions();
    const isCompact = height < QUESTIONS_UI.compactHeightBreakpoint;
    const { optionGap, titleSize, progressToTitle, descriptionToOptions } =
        isCompact ? QUESTIONS_UI.compact : QUESTIONS_UI.regular;
    const optionsScrollRef = useRef<ScrollView>(null);
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
    const currentAnswer = answers[String(currentBar) as keyof typeof answers]

    // Each question starts at its first option on small screens.
    useEffect(() => {
        optionsScrollRef.current?.scrollTo({ y: 0, animated: false });
    }, [currentBar]);

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
        <View style={styles.root}>
            <BackHeader onBack={() => router.back()} />
            <View style={styles.content}>
                {/* progress bar */}
                <View style={styles.progressBarContainer}>
                    <BaseProgressBar 
                        numberOfBars={numberOfQuestions}
                        currentBar={currentBar}
                    />
                </View>

                {/* question title */}
                <Text
                    style={[styles.questionTitle, { fontSize: titleSize, marginTop: progressToTitle }]}
                    maxFontSizeMultiplier={QUESTIONS_UI.maxFontSizeMultiplier}
                >
                    {currentQuestion.questionTitle}
                </Text>
                {/* question description */}
                <Text
                    style={[styles.questionDescription, { marginBottom: descriptionToOptions }]}
                    maxFontSizeMultiplier={QUESTIONS_UI.maxFontSizeMultiplier}
                >
                    {currentQuestion.questionDescription}
                </Text>
                {/* questions */}
                <ScrollView
                    ref={optionsScrollRef}
                    style={styles.optionsScroll}
                    contentContainerStyle={styles.optionsScrollContent}
                    showsVerticalScrollIndicator={false}
                >
                    <BaseRadioButtonGroups
                        selectedValue={answers[currentBar] || ''} // Get the selected answer for the current question
                        onChange={handleAnswerChange}
                        options={radioButtonOptions}
                        gap={optionGap}
                    />
                </ScrollView>
            </View>
            {/* buttons to go back and forth, pinned to the bottom */}
            <View
                style={[
                    styles.footer,
                    { paddingBottom: Math.max(insets.bottom, QUESTIONS_UI.footerMinPaddingBottom) },
                ]}
            >
                <BaseButton
                    onPress={async ()=>{
                        if (!answers[currentBar]){
                            showToastMessage("Please select an option",false)
                            return;
                        }
                        if (currentBar == numberOfQuestions){
                            try{
                                setSaveAnswersLoading(true)
                                const response = await saveAnswersForRegistrationQuestions(answers)
                                const answersSavedSuccessfully = checkIfLambdaResultIsSuccess(response)
                                if (answersSavedSuccessfully)
                                {
                                    showToastMessage("Answers have been saved",true)
                                    router.replace("/authentication/welcome_journey")
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
                    disabled={!currentAnswer}
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
        </View>
    )
}
export default RegistrationQuestions 

const styles = StyleSheet.create({
    root:{
        flex:1,
        backgroundColor:"white",
    },
    content:{
        flex:1,
        width:"100%",
        maxWidth:QUESTIONS_UI.maxContentWidth,
        alignSelf:"center",
        paddingHorizontal:QUESTIONS_UI.gutter,
        paddingTop:QUESTIONS_UI.contentPaddingTop,
    },
    progressBarContainer:{
        alignSelf:"center",
    },
    questionTitle:{
        fontFamily:FONTS.figtreeSemiBold,
        textAlign:"center"
    },
    questionDescription:{
        marginTop:QUESTIONS_UI.titleToDescription,
        fontFamily:FONTS.figtreeMedium,
        fontSize:QUESTIONS_UI.descriptionFontSize,
        opacity:QUESTIONS_UI.descriptionOpacity,
    },
    optionsScroll:{
        flex:1,
    },
    optionsScrollContent:{
        paddingBottom:QUESTIONS_UI.optionsPaddingBottom,
    },
    footer:{
        width:"100%",
        maxWidth:QUESTIONS_UI.maxContentWidth,
        alignSelf:"center",
        paddingHorizontal:QUESTIONS_UI.gutter,
        paddingTop:QUESTIONS_UI.footerPaddingTop,
        gap:QUESTIONS_UI.footerGap,
    },
})
