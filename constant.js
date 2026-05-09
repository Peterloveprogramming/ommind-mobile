// const URL = "https://api.hulolo.xyz";
const URL = "https://ec1d-103-224-173-84.ngrok-free.app"
//export constants 
export const LAMBDA_SERVICE_URL = URL + "/2015-03-31/functions/function/invocations"
//for audio to text using websocket 
// export const TEXT_TO_AUDIO_URL = "wss://audio.hulolo.xyz";
// if testing locally then use "ipconfig getifaddr en0" to get the actual ip address for testing
export const TEXT_TO_AUDIO_URL = "ws://192.168.5.4:9001";
// audio to text url
export const AUDIO_TO_TEXT_URL = "https://audio-to-text.hulolo.xyz/convert_audio_to_text";
// secret token for both TEXT_TO_AUDIO_URL and AUDIO_TO_TEXT_URL
export const SECRET_TOKEN = "Ommind2026"
const DEBUG = true

//mode constants
export const GENERAL = "general"
export const MEDITATION = "meditation"
export const GUIDED_MEDITATION = "guided_meditation"
