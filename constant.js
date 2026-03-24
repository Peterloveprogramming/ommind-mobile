// const URL = "https://api.hulolo.xyz";
const URL = "https://eb6b-185-13-153-44.ngrok-free.app";

//export constants 
export const LAMBDA_SERVICE_URL=URL + "/2015-03-31/functions/function/invocations"
//for audio to text using websocket 
export const TEXT_TO_AUDIO_URL = "wss://audio.hulolo.xyz";
// audio to text url
export const AUDIO_TO_TEXT_URL = "https://audio-to-text.hulolo.xyz/convert_audio_to_text";
// secret token for both TEXT_TO_AUDIO_URL and AUDIO_TO_TEXT_URL
export const SECRET_TOKEN = "Ommind2026"
const DEBUG = true

//mode constants
export const GENERAL = "general"
export const MEDITATION = "meditation"
export const GUIDED_MEDITATION = "guided meditation"
