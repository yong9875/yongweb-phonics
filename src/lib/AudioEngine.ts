/* ── Phonics Flow — Microsoft Edge TTS Engine ──
   Cloudflare Worker bridge for high-quality neural voice.
   Provides SSML phoneme-level pronunciation control. */

const WORKER_URL = 'https://edge-tts-proxy.yong9875.workers.dev';
const VOICE_NAME = 'en-US-AriaNeural';

const audioCache = new Map<string, string>();

function wrapSSML(content: string, rate = '0%'): string {
  return `
    <speak version='1.0' xmlns='http://www.w3.org/2001/10/synthesis' xml:lang='en-US'>
      <voice name='${VOICE_NAME}'>
        <prosody rate='${rate}'>
          ${content}
        </prosody>
      </voice>
    </speak>`.trim();
}

async function fetchAudioUrl(ssml: string): Promise<string> {
  const cacheKey = btoa(unescape(encodeURIComponent(ssml)));
  if (audioCache.has(cacheKey)) return audioCache.get(cacheKey)!;

  const response = await fetch(WORKER_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain' },
    body: ssml,
  });

  if (!response.ok) throw new Error(`TTS Fetch Failed: ${response.status}`);

  const blob = await response.blob();
  const url = URL.createObjectURL(blob);
  audioCache.set(cacheKey, url);
  return url;
}

let currentAudio: HTMLAudioElement | null = null;

function playAudio(url: string): Promise<void> {
  return new Promise((resolve) => {
    if (currentAudio) {
      currentAudio.pause();
      currentAudio.currentTime = 0;
    }
    const audio = new Audio(url);
    currentAudio = audio;
    audio.onended = () => resolve();
    audio.onerror = () => resolve();
    audio.play().catch(() => resolve());
  });
}

/**
 * Speaks an "x for word" learning phrase using IPA phoneme for the letter sound.
 * e.g. grapheme="a", ipa="/æ/", word="apple" → speaks "/æ/ ... for ... apple"
 */
export async function speakLearningPhrase(grapheme: string, ipa: string, word: string): Promise<void> {
  const cleanIpa = ipa.replace(/\//g, '');

  const phonemeTag = cleanIpa
    ? `<phoneme alphabet="ipa" ph="${cleanIpa}">${grapheme}</phoneme>`
    : grapheme;

  const ssml = `
    <speak version='1.0' xmlns='http://www.w3.org/2001/10/synthesis' xml:lang='en-US'>
      <voice name='${VOICE_NAME}'>
        <s>
          <prosody rate='-10%'>${phonemeTag}</prosody>
          <break time='900ms'/>
          <prosody rate='-10%'>${phonemeTag}</prosody>
          <break time='900ms'/>
          <prosody rate='-10%'>${phonemeTag}</prosody>
        </s>
        <break time='800ms'/>
        <s>
          <prosody rate='-5%'>${word}</prosody>
        </s>
      </voice>
    </speak>`.trim();

  try {
    const url = await fetchAudioUrl(ssml);
    await playAudio(url);
  } catch {
    // Fallback to browser TTS if worker is unreachable
    fallbackSpeak(`${grapheme}, ${word}`);
  }
}

/**
 * Speaks a CVC blending phrase: "c...a...t... cat!"
 */
export async function speakBlend(text: string): Promise<void> {
  const ssml = wrapSSML(text, '-10%');
  try {
    const url = await fetchAudioUrl(ssml);
    await playAudio(url);
  } catch {
    fallbackSpeak(text);
  }
}

/** Browser speech synthesis fallback */
function fallbackSpeak(text: string, rate = 0.8) {
  if (!window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = 'en-US';
  u.rate = rate;
  window.speechSynthesis.speak(u);
}
