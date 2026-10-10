// const URL = "https://api.hulolo.xyz";
// const URL = "http://192.168.5.29:8000"
const URL = "https://b30f-43-230-10-131.ngrok-free.app"
//export constants 
export const LAMBDA_SERVICE_URL = URL + "/2015-03-31/functions/function/invocations"
// export const LAMBDA_SERVICE_URL="https://dyhmz23j13.execute-api.eu-west-2.amazonaws.com/dev/"
export const LAMBDA_SERVICE_API_KEY="oJQnTrxKjeaD7YG6cd6xA8q0J9CSRFiUarJSyjx7"

export const DEFAULT_HOME_PAGE_TEXT = "How are you feeling today?"
export const DEFAULT_MOOD = ""
export const DEFAULT_INTENTION = "Compassion"
export const DEFAULT_AFFIRMATION = "\u201cI am grounded and soft with myself today.\u201d"
//for audio to text using websocket 
// if testing locally then use "ipconfig getifaddr en0" to get the actual ip address for testing
export let TEXT_TO_AUDIO_URL = "ws://192.168.5.98:9001";
export const setTextToAudioUrl = (url) => {
  TEXT_TO_AUDIO_URL = url;
};
// audio to text url
// export const AUDIO_TO_TEXT_URL = "http://192.168.5.76:9002/2015-03-31/functions/function/invocations";
export const AUDIO_TO_TEXT_URL = "https://dyhmz23j13.execute-api.eu-west-2.amazonaws.com/dev/convert_audio_to_text";
export const TEXT_AUDIO_TESTING_URL = "https://dyhmz23j13.execute-api.eu-west-2.amazonaws.com/dev/text_to_audio";
// secret token for both TEXT_TO_AUDIO_URL and AUDIO_TO_TEXT_URL
export const SECRET_TOKEN = "Ommind2026"
const DEBUG = true

// Public Sentry client key. Set this in `.env.local` for local builds and as
// an EAS environment variable/secret for cloud builds.
export const SENTRY_DSN = process.env.EXPO_PUBLIC_SENTRY_DSN ?? ""

// "development" shows dev-only UI (e.g. Profile's Test Buttons).
export const APP_ENVIRONMENT = process.env.EXPO_PUBLIC_APP_ENVIRONMENT ?? ""
export const IS_DEVELOPMENT_ENVIRONMENT = APP_ENVIRONMENT === "development"

//mode constants
export const GENERAL = "general"
export const MEDITATION = "meditation"
export const GUIDED_MEDITATION = "guided_meditation"
export const DREAM = "dream"
