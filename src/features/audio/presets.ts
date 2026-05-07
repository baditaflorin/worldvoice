export type PresetId = 'violin' | 'choir' | 'sax' | 'dream'

export interface EngineSettings {
  presetId: PresetId
  intensity: number
  space: number
  color: number
  batterySaver: boolean
}

export interface Preset {
  id: PresetId
  label: string
  accent: string
  background: string
  oscillatorType: OscillatorType
  harmonicRatios: readonly number[]
  harmonicGains: readonly number[]
  detuneCents: readonly number[]
  filterType: BiquadFilterType
  filterFrequency: number
  filterQ: number
  dryGain: number
  synthGain: number
  reverbGain: number
  delayTime: number
  shimmer: number
}

export const DEFAULT_SETTINGS: EngineSettings = {
  presetId: 'violin',
  intensity: 0.7,
  space: 0.58,
  color: 0.52,
  batterySaver: false,
}

export const PRESETS: readonly Preset[] = [
  {
    id: 'violin',
    label: 'Violin',
    accent: '#ff6f91',
    background: '#171111',
    oscillatorType: 'sawtooth',
    harmonicRatios: [1, 2, 3, 4, 5, 6],
    harmonicGains: [0.34, 0.22, 0.16, 0.1, 0.06, 0.04],
    detuneCents: [-4, 0, 5],
    filterType: 'bandpass',
    filterFrequency: 1900,
    filterQ: 3.4,
    dryGain: 0.1,
    synthGain: 0.9,
    reverbGain: 0.44,
    delayTime: 0.18,
    shimmer: 0.72,
  },
  {
    id: 'choir',
    label: 'Choir',
    accent: '#48d6c1',
    background: '#0f1715',
    oscillatorType: 'triangle',
    harmonicRatios: [0.5, 1, 1.5, 2, 3, 4],
    harmonicGains: [0.12, 0.32, 0.2, 0.16, 0.1, 0.05],
    detuneCents: [-18, -7, 0, 9, 19],
    filterType: 'lowpass',
    filterFrequency: 1280,
    filterQ: 1.2,
    dryGain: 0.08,
    synthGain: 0.82,
    reverbGain: 0.62,
    delayTime: 0.31,
    shimmer: 0.38,
  },
  {
    id: 'sax',
    label: 'Sax',
    accent: '#f4c95d',
    background: '#18140f',
    oscillatorType: 'square',
    harmonicRatios: [0.5, 1, 2, 3, 5],
    harmonicGains: [0.08, 0.42, 0.16, 0.12, 0.05],
    detuneCents: [-6, 0, 7],
    filterType: 'bandpass',
    filterFrequency: 820,
    filterQ: 2.1,
    dryGain: 0.12,
    synthGain: 0.84,
    reverbGain: 0.36,
    delayTime: 0.12,
    shimmer: 0.24,
  },
  {
    id: 'dream',
    label: 'Dream',
    accent: '#9ad66b',
    background: '#111711',
    oscillatorType: 'sine',
    harmonicRatios: [0.25, 0.5, 1, 1.25, 1.5, 2],
    harmonicGains: [0.08, 0.14, 0.24, 0.14, 0.11, 0.08],
    detuneCents: [-24, -11, 0, 13, 27],
    filterType: 'lowpass',
    filterFrequency: 1450,
    filterQ: 0.9,
    dryGain: 0.07,
    synthGain: 0.76,
    reverbGain: 0.74,
    delayTime: 0.42,
    shimmer: 0.58,
  },
] as const

export function getPreset(id: PresetId): Preset {
  return PRESETS.find((preset) => preset.id === id) ?? PRESETS[0]
}

export function clampSetting(value: number): number {
  return Math.min(1, Math.max(0, value))
}
