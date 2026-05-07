export interface PitchEstimate {
  frequency: number | null;
  clarity: number;
  rms: number;
  note: string;
}

const MIN_FREQUENCY = 65;
const MAX_FREQUENCY = 1200;
const SILENCE_RMS = 0.008;
const NOTE_NAMES = [
  "C",
  "C#",
  "D",
  "D#",
  "E",
  "F",
  "F#",
  "G",
  "G#",
  "A",
  "A#",
  "B",
];

export function estimatePitch(
  buffer: Float32Array<ArrayBufferLike>,
  sampleRate: number,
): PitchEstimate {
  const rms = rootMeanSquare(buffer);

  if (rms < SILENCE_RMS) {
    return { frequency: null, clarity: 0, rms, note: "Silence" };
  }

  const minLag = Math.max(2, Math.floor(sampleRate / MAX_FREQUENCY));
  const maxLag = Math.min(
    buffer.length - 2,
    Math.ceil(sampleRate / MIN_FREQUENCY),
  );
  let bestLag = -1;
  let bestCorrelation = 0;

  for (let lag = minLag; lag <= maxLag; lag += 1) {
    let correlation = 0;
    let leftEnergy = 0;
    let rightEnergy = 0;
    const limit = buffer.length - lag;

    for (let index = 0; index < limit; index += 1) {
      const left = buffer[index];
      const right = buffer[index + lag];
      correlation += left * right;
      leftEnergy += left * left;
      rightEnergy += right * right;
    }

    const normalized = correlation / Math.sqrt(leftEnergy * rightEnergy || 1);

    if (normalized > bestCorrelation) {
      bestCorrelation = normalized;
      bestLag = lag;
    }
  }

  if (bestLag < 0 || bestCorrelation < 0.35) {
    return { frequency: null, clarity: bestCorrelation, rms, note: "Noise" };
  }

  const frequency = sampleRate / bestLag;

  return {
    frequency,
    clarity: bestCorrelation,
    rms,
    note: frequencyToNote(frequency),
  };
}

export function frequencyToNote(frequency: number | null): string {
  if (!frequency || !Number.isFinite(frequency)) {
    return "Silence";
  }

  const midi = Math.round(69 + 12 * Math.log2(frequency / 440));
  const octave = Math.floor(midi / 12) - 1;
  const name = NOTE_NAMES[((midi % 12) + 12) % 12];

  return `${name}${octave}`;
}

export function rootMeanSquare(buffer: Float32Array<ArrayBufferLike>): number {
  if (buffer.length === 0) {
    return 0;
  }

  let sum = 0;

  for (const sample of buffer) {
    sum += sample * sample;
  }

  return Math.sqrt(sum / buffer.length);
}
