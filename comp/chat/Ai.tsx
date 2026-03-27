import {Text,View,Image, TouchableOpacity} from 'react-native'
import React, { useState } from 'react'
import { images } from '@/constants/images'
import FeedBackModal, { FeedBackPayload } from './FeedBackModal';
import ReportProblem from './ReportProblem';

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
    onFeedbackSubmit?: (payload: FeedBackPayload) => void;
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
}:AiProps) => {
    const [selectedRating, setSelectedRating] = useState(0);
    const [isReportProblemVisible, setIsReportProblemVisible] = useState(false);
    const [isFeedBackModalVisible, setIsFeedBackModalVisible] = useState(false);

    const handleFeedBackModalClose = () => {
        setIsFeedBackModalVisible(false);
        setSelectedRating(0);
    };

    const handleRatingPress = (rating:number) => {
        setSelectedRating(rating);

        if (rating <= 3) {
            setIsFeedBackModalVisible(true);
        } else {
            setIsFeedBackModalVisible(false);
        }
    };

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
                
                    {showRating ? (
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
                                {Array.from({ length: 5 }, (_, index) => {
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
                                })}
                            </View>
                            
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
                        </View>
                        </>
                    ) : null}
                </View>
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
                onSubmit={onFeedbackSubmit}
            />
        </>
        )
    }
}


export default Ai
