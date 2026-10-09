import { Text, View, Image, StyleSheet } from 'react-native'
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import BaseButton from '@/comp/base/BaseButton';
import { images } from '@/constants/images';
import { FONTS } from '@/theme';

// Layout tokens for this screen (Figma 2279:11254, 393 × 852 frame). Kept
// here so a later colour/design-token spec can move them in one go.
const WELCOME_JOURNEY_UI = {
    backgroundColor: "#FFFCF2",
    maxContentWidth: 480,
    // Text block and button sit 23 from the screen edge (347 wide on 393).
    gutter: 23,
    // The image is 341 square on 393, so 26 from each edge.
    imageGutter: 26,
    statusBarToImage: 10,
    // The title starts 23 above the image's bottom edge, inside the
    // transparent padding under the clouds.
    imageToTitle: -23,
    titleFontSize: 32,
    titleLetterSpacing: 0.36,
    titleColor: "rgba(0,0,0,0.8)",
    titleToSubtitle: 11,
    subtitleFontSize: 16,
    subtitleLineHeight: 21,
    subtitleLetterSpacing: -0.32,
    subtitleColor: "rgba(0,0,0,0.7)",
    buttonFontSize: 15,
    buttonLineHeight: 20,
    buttonLetterSpacing: -0.5,
    buttonToTerms: 20,
    termsFontSize: 11,
    termsLineHeight: 13,
    termsLetterSpacing: 0.066,
    termsBoldLetterSpacing: 0.06,
    // Terms end 98 above the bottom edge on a 34 pt home-indicator inset
    // (button top 660, terms end 754 on the 852 frame).
    footerMinPaddingBottom: 16,
    footerExtraPaddingBottom: 64,
    maxFontSizeMultiplier: 1.3,
};

const WelcomeJourney = () => {
    const router = useRouter();
    const insets = useSafeAreaInsets();

    return (
        <View style={styles.root}>
            <View
                style={[
                    styles.content,
                    { paddingTop: insets.top + WELCOME_JOURNEY_UI.statusBarToImage },
                ]}
            >
                {/* The box sets the size: a require()d Image gets the file's
                    pixel height by default, which overrides aspectRatio. */}
                <View style={styles.imageBox}>
                    <Image
                        source={images.welcome_image}
                        style={styles.image}
                        resizeMode="cover"
                        accessibilityIgnoresInvertColors
                    />
                </View>
                <View style={styles.textBlock}>
                    <Text
                        style={styles.title}
                        maxFontSizeMultiplier={WELCOME_JOURNEY_UI.maxFontSizeMultiplier}
                        accessibilityRole="header"
                    >
                        Welcome to OmMind!
                    </Text>
                    <Text
                        style={styles.subtitle}
                        maxFontSizeMultiplier={WELCOME_JOURNEY_UI.maxFontSizeMultiplier}
                    >
                        Your journey toward inner clarity begins here.
                    </Text>
                </View>
            </View>
            <View
                style={[
                    styles.footer,
                    {
                        paddingBottom:
                            Math.max(insets.bottom, WELCOME_JOURNEY_UI.footerMinPaddingBottom) +
                            WELCOME_JOURNEY_UI.footerExtraPaddingBottom,
                    },
                ]}
            >
                <BaseButton
                    text="Begin Your Journey"
                    fontSize={WELCOME_JOURNEY_UI.buttonFontSize}
                    textStyle={styles.buttonText}
                    onPress={() => router.replace("/(tabs)")}
                />
                <Text
                    style={styles.terms}
                    maxFontSizeMultiplier={WELCOME_JOURNEY_UI.maxFontSizeMultiplier}
                >
                    By clicking on “Begin Your Journey”, you agree to the{" "}
                    <Text style={styles.termsBold}>Terms of Use and Privacy Policy</Text>
                </Text>
            </View>
        </View>
    )
}
export default WelcomeJourney

const styles = StyleSheet.create({
    root:{
        flex:1,
        backgroundColor:WELCOME_JOURNEY_UI.backgroundColor,
    },
    content:{
        flex:1,
        width:"100%",
        maxWidth:WELCOME_JOURNEY_UI.maxContentWidth,
        alignSelf:"center",
    },
    imageBox:{
        marginHorizontal:WELCOME_JOURNEY_UI.imageGutter,
        aspectRatio:1,
    },
    image:{
        width:"100%",
        height:"100%",
    },
    textBlock:{
        marginTop:WELCOME_JOURNEY_UI.imageToTitle,
        paddingHorizontal:WELCOME_JOURNEY_UI.gutter,
        gap:WELCOME_JOURNEY_UI.titleToSubtitle,
    },
    title:{
        fontFamily:FONTS.figtreeBold,
        fontSize:WELCOME_JOURNEY_UI.titleFontSize,
        letterSpacing:WELCOME_JOURNEY_UI.titleLetterSpacing,
        color:WELCOME_JOURNEY_UI.titleColor,
        textAlign:"center",
    },
    subtitle:{
        fontFamily:FONTS.interRegular,
        fontSize:WELCOME_JOURNEY_UI.subtitleFontSize,
        lineHeight:WELCOME_JOURNEY_UI.subtitleLineHeight,
        letterSpacing:WELCOME_JOURNEY_UI.subtitleLetterSpacing,
        color:WELCOME_JOURNEY_UI.subtitleColor,
        textAlign:"center",
    },
    footer:{
        width:"100%",
        maxWidth:WELCOME_JOURNEY_UI.maxContentWidth,
        alignSelf:"center",
        paddingHorizontal:WELCOME_JOURNEY_UI.gutter,
        gap:WELCOME_JOURNEY_UI.buttonToTerms,
    },
    buttonText:{
        fontFamily:FONTS.interSemiBold,
        lineHeight:WELCOME_JOURNEY_UI.buttonLineHeight,
        letterSpacing:WELCOME_JOURNEY_UI.buttonLetterSpacing,
    },
    terms:{
        fontFamily:FONTS.interRegular,
        fontSize:WELCOME_JOURNEY_UI.termsFontSize,
        lineHeight:WELCOME_JOURNEY_UI.termsLineHeight,
        letterSpacing:WELCOME_JOURNEY_UI.termsLetterSpacing,
        color:"#000000",
        textAlign:"center",
    },
    termsBold:{
        fontFamily:FONTS.interSemiBold,
        letterSpacing:WELCOME_JOURNEY_UI.termsBoldLetterSpacing,
    },
})
