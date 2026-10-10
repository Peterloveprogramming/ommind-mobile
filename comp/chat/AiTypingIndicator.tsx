import React, { useEffect, useRef } from "react";
import { Animated, Easing, Image, View } from "react-native";
import { images } from "@/constants/images";

const AiTypingIndicator = () => {
  const dotAnimations = useRef([0, 1, 2].map(() => new Animated.Value(0))).current;

  useEffect(() => {
    const animations = dotAnimations.map((dotAnimation, index) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(index * 160),
          Animated.timing(dotAnimation, {
            toValue: 1,
            duration: 260,
            easing: Easing.out(Easing.quad),
            useNativeDriver: true,
          }),
          Animated.timing(dotAnimation, {
            toValue: 0,
            duration: 260,
            easing: Easing.in(Easing.quad),
            useNativeDriver: true,
          }),
          Animated.delay(500 - index * 160),
        ])
      )
    );

    animations.forEach((animation) => animation.start());

    return () => {
      animations.forEach((animation) => animation.stop());
    };
  }, [dotAnimations]);

  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 15 }}>
      <Image source={images.lhamo_mini} style={{ width: 24, height: 24, resizeMode: "contain" }} />
      <View style={{ flexDirection: "row", alignItems: "center", gap: 5 }}>
        {dotAnimations.map((dotAnimation, index) => {
          const translateY = dotAnimation.interpolate({
            inputRange: [0, 1],
            outputRange: [0, -4],
          });
          const opacity = dotAnimation.interpolate({
            inputRange: [0, 1],
            outputRange: [0.35, 0.9],
          });
          const scale = dotAnimation.interpolate({
            inputRange: [0, 1],
            outputRange: [0.9, 1.05],
          });

          return (
            <Animated.View
              key={index}
              style={{
                width: 6,
                height: 6,
                borderRadius: 3,
                backgroundColor: "#8C8C8A",
                opacity,
                transform: [{ translateY }, { scale }],
              }}
            />
          );
        })}
      </View>
    </View>
  );
};

export default AiTypingIndicator;
