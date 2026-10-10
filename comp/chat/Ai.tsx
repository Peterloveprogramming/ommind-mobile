import {Text,View,Image, Pressable, ActivityIndicator, Share, StyleSheet} from 'react-native'
import React, { useState } from 'react'
import * as Clipboard from 'expo-clipboard'
import { images } from '@/constants/images'
import FeedBackModal, { FeedBackPayload } from './FeedBackModal';
import ReportProblem from './ReportProblem';
import FeedbackThankYouModal from './FeedbackThankYouModal';
import { useToast } from '@/context/useToast'
import AiTypingIndicator from './AiTypingIndicator';
import Bookmark from '@/assets/svg/chat/Bookmark';
import ShareIcon from '@/assets/svg/chat/Share';
import Star from '@/assets/svg/chat/Star';
import Warning from '@/assets/svg/chat/Warning';
import { FONTS } from '@/theme.js';

type AiProps = {
    message: string;
    showPlaybackControl?: boolean;
    showPlayButton?: boolean;
    onPlaybackControlPress?: () => void;
    onReplayPress?: () => void;
    onFavouritePress?: () => void;
    isFavourite?: boolean;
    isFavouriteUpdating?: boolean;
    showRating?:boolean;
    showShare?: boolean;
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
    isFavourite = false,
    isFavouriteUpdating = false,
    showRating = true,
    showShare = true,
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
    const { showToastMessage } = useToast();

    const handleCopy = async () => {
        await Clipboard.setStringAsync(message);
        showToastMessage("Copied to clipboard", true);
    };

    const handleShare = async () => {
        try {
            await Share.share({ message });
        } catch (error) {
            console.error("Failed to share message:", error);
        }
    };

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
    const showBookmark = showPlaybackControl;
    const showReport = message_id != null;
    const hasActions = showBookmark || showShare || showReport;
    const hasFooter = hasActions || shouldShowRating;

    if (message === "loading"){
        return <AiTypingIndicator />
    }

    return (
        <>
            <View style={styles.container}>
                <Image source={images.lhamo_mini} style={styles.avatar} resizeMode="contain" />
                <View style={[styles.bubble, hasFooter && styles.bubbleWithFooter]}>
                    <Text
                        style={styles.messageText}
                        selectable
                        onLongPress={handleCopy}
                    >{message}</Text>

                    {hasFooter ? (
                        <View style={styles.footer}>
                            {hasActions ? (
                                <View style={styles.actionsRow}>
                                    {showBookmark ? (
                                        <Pressable
                                            onPress={onFavouritePress}
                                            disabled={isFavouriteUpdating}
                                            hitSlop={4}
                                            style={({ pressed }) => [styles.actionButton, pressed && styles.pressed]}
                                            accessibilityRole="button"
                                            accessibilityLabel={isFavourite ? "Remove from favourites" : "Add to favourites"}
                                        >
                                            {isFavouriteUpdating ? (
                                                <ActivityIndicator size="small" color="#FFFFFF" />
                                            ) : (
                                                <Bookmark filled={isFavourite} />
                                            )}
                                        </Pressable>
                                    ) : null}
                                    {showShare ? (
                                        <Pressable
                                            onPress={() => { void handleShare(); }}
                                            hitSlop={4}
                                            style={({ pressed }) => [styles.actionButton, pressed && styles.pressed]}
                                            accessibilityRole="button"
                                            accessibilityLabel="Share"
                                        >
                                            <ShareIcon />
                                        </Pressable>
                                    ) : null}
                                    {showReport ? (
                                        <Pressable
                                            onPress={() => setIsReportProblemVisible(true)}
                                            hitSlop={4}
                                            style={({ pressed }) => [styles.reportButton, pressed && styles.pressed]}
                                            accessibilityRole="button"
                                        >
                                            <Warning />
                                            <Text style={styles.reportText}>Report</Text>
                                        </Pressable>
                                    ) : null}
                                </View>
                            ) : null}

                            {shouldShowRating ? (
                                <View style={styles.ratingRow}>
                                    <View style={styles.ratingPill}>
                                        <Text style={styles.ratingLabel}>Rate this Response:</Text>
                                        {isRatingLoading ? (
                                            <View style={styles.ratingLoading}>
                                                <ActivityIndicator size="small" color="#FFFFFF" />
                                            </View>
                                        ) : (
                                            <View style={styles.starsRow}>
                                                {Array.from({ length: 5 }, (_, index) => (
                                                    <Pressable
                                                        key={index}
                                                        onPress={() => handleRatingPress(index + 1)}
                                                        hitSlop={{ top: 8, bottom: 8, left: 3, right: 3 }}
                                                        accessibilityRole="button"
                                                        accessibilityLabel={`Rate ${index + 1} star${index > 0 ? "s" : ""}`}
                                                    >
                                                        <Star filled={index < selectedRating} />
                                                    </Pressable>
                                                ))}
                                            </View>
                                        )}
                                    </View>
                                </View>
                            ) : null}
                        </View>
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
                onSubmit={handleFeedbackSubmit}
            />
            <FeedbackThankYouModal
                visible={showThankYouCard}
                onClose={() => setShowThankYouCard(false)}
            />
        </>
    )
}

const styles = StyleSheet.create({
    container: {
        gap: 5,
        marginBottom: 15,
        alignItems: "flex-start",
    },
    avatar: {
        width: 24,
        height: 24,
    },
    bubble: {
        maxWidth: 350,
        gap: 10,
        paddingTop: 16,
        paddingBottom: 16,
        borderRadius: 15,
        backgroundColor: "#8C8C8A",
    },
    bubbleWithFooter: {
        paddingBottom: 10,
    },
    messageText: {
        paddingHorizontal: 12,
        fontFamily: FONTS.interRegular,
        fontSize: 15,
        lineHeight: 20,
        letterSpacing: -0.24,
        color: "#FFFFFF",
    },
    footer: {
        gap: 10,
        paddingTop: 10,
        borderTopWidth: 1,
        borderTopColor: "#AFAFAF",
    },
    actionsRow: {
        flexDirection: "row",
        alignItems: "center",
        flexWrap: "wrap",
        gap: 8,
        paddingHorizontal: 12,
    },
    actionButton: {
        width: 33,
        height: 34,
        borderRadius: 17,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#A3A3A1",
    },
    reportButton: {
        height: 34,
        flexDirection: "row",
        alignItems: "center",
        gap: 5,
        paddingLeft: 10,
        paddingRight: 12,
        borderRadius: 17,
        backgroundColor: "#A3A3A1",
    },
    reportText: {
        fontFamily: FONTS.interRegular,
        fontSize: 15,
        lineHeight: 20,
        letterSpacing: -0.24,
        color: "#FFFFFF",
        includeFontPadding: false,
    },
    pressed: {
        opacity: 0.7,
    },
    ratingRow: {
        flexDirection: "row",
        paddingHorizontal: 12,
    },
    ratingPill: {
        height: 33,
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
        paddingHorizontal: 12,
        borderRadius: 50,
        borderWidth: 1,
        borderColor: "#FFFFFF",
        backgroundColor: "rgba(255, 255, 255, 0.2)",
    },
    ratingLabel: {
        fontFamily: FONTS.interRegular,
        fontSize: 13,
        lineHeight: 20,
        letterSpacing: -0.24,
        color: "#FFFFFF",
        includeFontPadding: false,
    },
    starsRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 7,
    },
    ratingLoading: {
        minWidth: 128,
        alignItems: "center",
    },
});

export default Ai
