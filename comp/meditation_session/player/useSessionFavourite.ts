import { useCallback, useEffect, useMemo, useState } from "react";
import { useAppDispatch } from "@/store/hooks";
import { patchMeditationCourseSession } from "@/store/slices/MeditationSlice";
import { useToast } from "@/context/useToast";
import {
  checkIfLambdaResultIsSuccess,
  getLambdaErrorMessage,
  updateFavourite,
} from "@/utils/helper";
import type { FavouriteValue } from "./sessionPlayerParams";

type UseSessionFavouriteOptions = {
  kind: "course" | "generated";
  favourite: FavouriteValue;
  messageId?: string;
  meditationType?: string;
  courseUuid?: string;
  courseNumber?: number;
  sessionNumber?: number;
};

export function useSessionFavourite({
  kind,
  favourite,
  messageId,
  meditationType,
  courseUuid,
  courseNumber,
  sessionNumber,
}: UseSessionFavouriteOptions) {
  const dispatch = useAppDispatch();
  const { showToastMessage } = useToast();
  const [currentFavourite, setCurrentFavourite] = useState<FavouriteValue>(favourite);
  const [isFavouriteUpdating, setIsFavouriteUpdating] = useState(false);
  const favouriteResetKey = useMemo(
    () =>
      kind === "generated"
        ? `generated-${messageId ?? ""}`
        : `course-${meditationType ?? ""}-${courseNumber ?? ""}-${sessionNumber ?? ""}`,
    [courseNumber, kind, meditationType, messageId, sessionNumber]
  );

  useEffect(() => {
    setCurrentFavourite(favourite);
  }, [favourite, favouriteResetKey]);

  const handleBookmarkPress = useCallback(async () => {
    if (isFavouriteUpdating) {
      return;
    }

    const nextFavourite: FavouriteValue = currentFavourite === 1 ? 0 : 1;
    const hasCourseIdentity =
      meditationType &&
      typeof courseNumber === "number" &&
      typeof sessionNumber === "number" &&
      Number.isFinite(courseNumber) &&
      Number.isFinite(sessionNumber);
    const favouriteInput =
      kind === "generated"
        ? messageId
          ? {
              type: "generated_meditation" as const,
              message_id: messageId,
              favourite: nextFavourite,
            }
          : null
        : hasCourseIdentity
          ? {
              type: meditationType,
              course_number: courseNumber,
              session_number: sessionNumber,
              favourite: nextFavourite,
            }
          : null;

    if (!favouriteInput) {
      showToastMessage("Unable to update favourite for this session.", false);
      return;
    }

    setIsFavouriteUpdating(true);

    try {
      const result = await updateFavourite(favouriteInput);

      if (!checkIfLambdaResultIsSuccess(result)) {
        showToastMessage(getLambdaErrorMessage(result), false);
        return;
      }

      setCurrentFavourite(nextFavourite);
      showToastMessage(
        nextFavourite === 1 ? "Added to favourites" : "Removed from favourites",
        true
      );

      if (
        kind === "course" &&
        courseUuid &&
        typeof sessionNumber === "number" &&
        Number.isFinite(sessionNumber)
      ) {
        dispatch(
          patchMeditationCourseSession({
            uuid: courseUuid,
            sessionNumber,
            changes: { favourite: nextFavourite },
          })
        );
      }
    } catch (error) {
      console.error("Failed to update favourite", error);
      showToastMessage("Unable to update favourite.", false);
    } finally {
      setIsFavouriteUpdating(false);
    }
  }, [
    courseNumber,
    courseUuid,
    currentFavourite,
    dispatch,
    isFavouriteUpdating,
    kind,
    meditationType,
    messageId,
    sessionNumber,
    showToastMessage,
  ]);

  return {
    currentFavourite,
    isFavouriteUpdating,
    handleBookmarkPress,
  };
}
