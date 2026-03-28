import {Text,View,Image, TouchableOpacity, ActivityIndicator} from 'react-native'
import React, { useState } from 'react'
import { images } from '@/constants/images'
import FeedBackModal, { FeedBackPayload } from './FeedBackModal';
import ReportProblem from './ReportProblem';
import { Ionicons } from '@expo/vector-icons';

type AiProps = {
    message: string;
    showPlaybackControl?: boolean;
    showPlayButton?: boolean;
    onPlaybackControlPress?: () => void;
    onReplayPress?: () => void;
    onFavouritePress?: () => void;
    showRating?:boolean;
    message_id?:string|number;
    session_id?:string|number;
    onFeedbackSubmit?: (payload: FeedBackPayload) => Promise<boolean | null> | boolean | null;
    isRatingLoading?: boolean;
    onPositiveRatingSelect?: (payload: {
        rating: number;
        message_id?: string | number;
        session_id?: string | number;
    }) => Promise<boolean | null> | boolean | null;
  };

  
const Ai = ({
    message,
    showPlaybackControl = false,
    showPlayButton = false,
    onPlaybackControlPress,
    onReplayPress,
    onFavouritePress,
    showRating = true,
    message_id,
    session_id,
    onFeedbackSubmit,
    isRatingLoading = false,
    onPositiveRatingSelect,
}:AiProps) => {
    const [selectedRating, setSelectedRating] = useState(0);
    const [isReportProblemVisible, setIsReportProblemVisible] = useState(false);
    const [isFeedBackModalVisible, setIsFeedBackModalVisible] = useState(false);
    const [hasSubmittedRating, setHasSubmittedRating] = useState(false);
    const [showThankYouCard, setShowThankYouCard] = useState(false);

    const handleRatingSuccess = () => {
        setHasSubmittedRating(true);
        setShowThankYouCard(true);
    };

    const handleFeedBackModalClose = () => {
        setIsFeedBackModalVisible(false);
        setSelectedRating(0);
    };

    const handleRatingPress = async (rating:number) => {
        if (isRatingLoading) {
            return;
        }

        setSelectedRating(rating);

        if (rating <= 3) {
            setIsFeedBackModalVisible(true);
        } else {
            setIsFeedBackModalVisible(false);
            const didSubmit = await onPositiveRatingSelect?.({
                rating,
                message_id,
                session_id,
            });

            if (didSubmit) {
                handleRatingSuccess();
            }
        }
    };

    const handleFeedbackSubmit = async (payload: FeedBackPayload): Promise<boolean | null> => {
        const didSubmit = onFeedbackSubmit ? await onFeedbackSubmit(payload) : null;

        if (didSubmit) {
            handleFeedBackModalClose();
            handleRatingSuccess();
        }

        return didSubmit ?? null;
    };

    const shouldShowRating = showRating && !hasSubmittedRating;

    if (message == "loading"){
        return <Image source={images.lhamo_mini_loading}/>
    } else {
    return (
        <>
            <View style={{gap:10,marginBottom:10}}>
                <Image source={images.lhamo_mini}/>
                <View style={{backgroundColor:"#8C8C8A",maxWidth:"90%",borderRadius:10}}>
                    <View style={{padding:15,gap:12}}>
                        <Text style={{fontSize:16, color:"#FFFFFF",flexShrink:1}}>{message}</Text>
                        {showPlaybackControl ? (
                            <View style={{ flexDirection: "row", alignItems: "center", gap: 5 }}>
                                <TouchableOpacity
                                    onPress={onPlaybackControlPress}
                                    hitSlop={6}
                                    style={{
                                        width: 30,
                                        height: 30,
                                        alignItems: "center",
                                        justifyContent: "center",
                                    }}
                                >
                                    <Image
                                        source={
                                            showPlayButton
                                              ? images.play_button_guided_meditation
                                              : images.pause_button_guided_meditation
                                        }
                                        style={{ width: 30, height: 30 }}
                                        resizeMode="contain"
                                    />
                                </TouchableOpacity>
                                <TouchableOpacity
                                    onPress={onReplayPress}
                                    hitSlop={6}
                                    style={{
                                        width: 30,
                                        height: 30,
                                        alignItems: "center",
                                        justifyContent: "center",
                                    }}
                                >
                                    <Image
                                        source={images.replay_button}
                                        style={{ width: 30, height: 30 }}
                                        resizeMode="contain"
                                    />
                                </TouchableOpacity>
                                <TouchableOpacity
                                    onPress={onFavouritePress}
                                    hitSlop={6}
                                    style={{
                                        width: 30,
                                        height: 30,
                                        alignItems: "center",
                                        justifyContent: "center",
                                    }}
                                >
                                    <Image
                                        source={images.favourite_button}
                                        style={{ width: 30, height: 30 }}
                                        resizeMode="contain"
                                    />
                                </TouchableOpacity>
                            </View>
                        ) : null}
                    </View>
                
                    {shouldShowRating ? (
                        <>
                        <View 
                            style={{height:1,borderWidth:0.5,width:"100%",borderColor:"#AFAFAF"}}
                        />
                            
                            <View style={{ padding:10, flexDirection: "row", alignItems: "center", gap: 3 }}>
                                <View 
                                    style={{flexDirection: "row",gap:3,backgroundColor:"#AFAFAF",paddingVertical:10, paddingHorizontal:10,borderWidth:0.5,borderColor:"#ffffff",borderRadius:50}}
                                >
                                <Text style={{
                                    fontSize:15,
                                    color:"#ffffff"
                                }}>Rate this Response:</Text>
                                {isRatingLoading ? (
                                    <View style={{justifyContent:"center", marginLeft:6, minWidth: 32}}>
                                        <ActivityIndicator size="small" color="#ffffff" />
                                    </View>
                                ) : (
                                    Array.from({ length: 5 }, (_, index) => {
                                        const isFilled = index < selectedRating;

                                        return (
                                            <TouchableOpacity
                                                key={index}
                                                onPress={() => handleRatingPress(index + 1)}
                                                hitSlop={6}
                                            >
                                                <Image
                                                    source={isFilled ? images.star_filled : images.star_unfilled}
                                                    style={{ width: 24, height: 24 }}
                                                    resizeMode="contain"
                                                />
                                            </TouchableOpacity>
                                        );
                                    })
                                )}
                            </View>
                            
                            {isRatingLoading ? null : (
                                <TouchableOpacity
                                    style={{marginLeft:3}}
                                    onPress={() => setIsReportProblemVisible(true)}
                                >
                                    <Image
                                        source={images.report}
                                        style={{ width: 30, height: 30 }}
                                        resizeMode="contain"
                                    />
                                </TouchableOpacity>
                            )}
                        </View>
                        </>
                    ) : null}
                </View>

                {showThankYouCard ? (
                    <View
                        style={{
                            marginTop: 8,
                            alignSelf: "center",
                            width: "82%",
                            backgroundColor: "#5A5A5A",
                            borderRadius: 22,
                            paddingHorizontal: 18,
                            paddingVertical: 18,
                            alignItems: "center",
                        }}
                    >
                        <View
                            style={{
                                width: 48,
                                height: 48,
                                borderRadius: 24,
                                backgroundColor: "#8A8A8A",
                                alignItems: "center",
                                justifyContent: "center",
                                marginBottom: 14,
                            }}
                        >
                            <Ionicons name="checkmark" size={28} color="#FFFFFF" />
                        </View>
                        <Text style={{ color: "#FFFFFF", fontSize: 18, fontWeight: "700", marginBottom: 10 }}>
                            Thank you for your feedback!
                        </Text>
                        <Text style={{ color: "#FFFFFF", fontSize: 14, textAlign: "center", lineHeight: 22 }}>
                            Your input helps us improve.
                        </Text>
                        <Text style={{ color: "#FFFFFF", fontSize: 14, textAlign: "center", lineHeight: 22, marginBottom: 16 }}>
                            We appreciate your help!{"\uD83D\uDC9B"}
                        </Text>
                        <TouchableOpacity
                            onPress={() => setShowThankYouCard(false)}
                            style={{
                                backgroundColor: "#F7C948",
                                borderRadius: 999,
                                paddingHorizontal: 22,
                                paddingVertical: 10,
                            }}
                        >
                            <Text style={{ color: "#FFFFFF", fontSize: 16, fontWeight: "700" }}>OK</Text>
                        </TouchableOpacity>
                    </View>
                ) : null}
            </View>
            <ReportProblem
                visible={isReportProblemVisible}
                onClose={() => setIsReportProblemVisible(false)}
                session_id={session_id}
                message_id={message_id}
            />
            <FeedBackModal
                visible={isFeedBackModalVisible}
                onClose={handleFeedBackModalClose}
                overallRating={selectedRating}
                onOverallRatingChange={setSelectedRating}
                session_id={session_id}
                message_id={message_id}
                onSubmit={handleFeedbackSubmit}
            />
        </>
        )
    }
}


export default Ai
