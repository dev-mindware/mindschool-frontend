/**
 * AudioBuffer cache to prevent repeated fetching of sound files.
 */
let beepBuffer: AudioBuffer | null = null;
const audioBufferCache = new Map<string, AudioBuffer>();
const AudioContextClass =
  typeof window !== "undefined"
    ? window.AudioContext || (window as any).webkitAudioContext
    : null;

let audioCtx: AudioContext | null = null;

const getAudioContext = (): AudioContext | null => {
  if (typeof window === "undefined" || !AudioContextClass) return null;
  if (!audioCtx) {
    try {
      audioCtx = new AudioContextClass();
    } catch {
      audioCtx = null;
    }
  }
  return audioCtx;
};

const normalizeSoundSrc = (src: string): string => {
  if (src === "/notification-2.mp3") {
    return "/sound-effects/notification-2.mp3";
  }
  return src;
};

const resumeAudioContext = async (): Promise<boolean> => {
  const ctx = getAudioContext();
  if (!ctx) return false;

  try {
    if (ctx.state === "suspended") {
      await ctx.resume();
    }
    return ctx.state === "running";
  } catch {
    return false;
  }
};

const preloadAudioBuffer = async (rawSrc: string): Promise<AudioBuffer | null> => {
  const ctx = getAudioContext();
  if (!ctx) return null;

  const src = normalizeSoundSrc(rawSrc);
  const cachedBuffer = audioBufferCache.get(src);
  if (cachedBuffer) return cachedBuffer;

  try {
    const response = await fetch(src);
    if (!response.ok) {
      // If /sound-effects/ failed, try original rawSrc
      if (rawSrc !== src) {
        const fallbackRes = await fetch(rawSrc);
        if (fallbackRes.ok) {
          const arrayBuffer = await fallbackRes.arrayBuffer();
          const decodedBuffer = await ctx.decodeAudioData(arrayBuffer);
          audioBufferCache.set(src, decodedBuffer);
          return decodedBuffer;
        }
      }
      return null;
    }
    const arrayBuffer = await response.arrayBuffer();
    const decodedBuffer = await ctx.decodeAudioData(arrayBuffer);
    audioBufferCache.set(src, decodedBuffer);
    return decodedBuffer;
  } catch (error) {
    console.warn("Failed to preload sound:", src, error);
    return null;
  }
};

/**
 * Preloads the scanner beep sound to ensure zero latency during operations.
 */
const preloadScannerSound = async () => {
  if (beepBuffer) return;
  beepBuffer = await preloadAudioBuffer("/sound-effects/store-scanner-beep.mp3");
};

// Start preloading scanner sound on browser load
if (typeof window !== "undefined") {
  setTimeout(() => {
    preloadScannerSound().catch(() => {});
  }, 1000);
}

/**
 * Fallback to HTML5 Audio element when Web Audio API fails or is restricted.
 */
const playViaHtmlAudio = async (src: string, volume = 0.5): Promise<boolean> => {
  if (typeof window === "undefined") return false;
  try {
    const audio = new Audio(normalizeSoundSrc(src));
    audio.volume = Math.max(0, Math.min(1, volume));
    await audio.play();
    return true;
  } catch (err) {
    console.warn("HTML5 audio playback fallback failed:", err);
    return false;
  }
};

/**
 * Plays the store scanner beep sound using the Web Audio API with HTML5 fallback.
 */
export const playScannerBeep = async () => {
  try {
    const ctx = getAudioContext();
    if (ctx) {
      const isReady = await resumeAudioContext();
      if (isReady) {
        if (!beepBuffer) {
          await preloadScannerSound();
        }
        if (beepBuffer) {
          const source = ctx.createBufferSource();
          source.buffer = beepBuffer;
          source.connect(ctx.destination);
          source.start(0);
          return;
        }
      }
    }
    // Fallback
    await playViaHtmlAudio("/sound-effects/store-scanner-beep.mp3", 0.7);
  } catch (error) {
    console.warn("Audio feedback failed:", error);
  }
};

export const primeAudioPlayback = async (rawSrc?: string): Promise<boolean> => {
  try {
    const ctx = getAudioContext();
    if (ctx) {
      await resumeAudioContext();
    }
    if (rawSrc) {
      const src = normalizeSoundSrc(rawSrc);
      await preloadAudioBuffer(src);
    }
    return true;
  } catch (error) {
    console.warn("Audio priming failed:", error);
    return false;
  }
};

export const playSoundEffect = async (
  rawSrc: string,
  volume = 0.5,
): Promise<boolean> => {
  const src = normalizeSoundSrc(rawSrc);
  try {
    const ctx = getAudioContext();
    if (ctx) {
      const isReady = await resumeAudioContext();
      if (isReady) {
        const audioBuffer = await preloadAudioBuffer(src);
        if (audioBuffer) {
          const source = ctx.createBufferSource();
          const gainNode = ctx.createGain();

          source.buffer = audioBuffer;
          gainNode.gain.value = Math.max(0, Math.min(1, volume));

          source.connect(gainNode);
          gainNode.connect(ctx.destination);
          source.start(0);
          return true;
        }
      }
    }

    // Fallback if Web Audio context is unavailable or cannot decode
    return await playViaHtmlAudio(src, volume);
  } catch (error) {
    console.warn("Sound effect failed, attempting HTML5 fallback:", error);
    return await playViaHtmlAudio(src, volume);
  }
};
