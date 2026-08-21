import React, { useLayoutEffect } from "react";
import { useNavigation } from "expo-router";
import BackButton from "@/comp/headers/BackButton";

export function usePlayerBackButton(onBackToExplore: () => void) {
  const navigation = useNavigation();

  useLayoutEffect(() => {
    navigation.setOptions({
      headerLeft: () => (
        <BackButton
          debugLabel="HeaderBack:meditation_session/player"
          onTouch={onBackToExplore}
        />
      ),
    });
  }, [navigation, onBackToExplore]);
}
