export type EnhancementStatus = 'idle' | 'loading' | 'ready' | 'fallback' | 'error'

export interface EnhancementState {
  id: string
  label: string
  status: EnhancementStatus
  detail: string
}

export const INITIAL_ENHANCEMENTS: readonly EnhancementState[] = [
  {
    id: 'rnnoise',
    label: 'RNNoise WASM',
    status: 'idle',
    detail: 'Queued',
  },
  {
    id: 'onnx',
    label: 'ONNX Runtime Web',
    status: 'idle',
    detail: 'Queued',
  },
  {
    id: 'tone',
    label: 'Tone.js transport',
    status: 'idle',
    detail: 'Queued',
  },
]

type EnhancementUpdate = (state: EnhancementState) => void

export async function probeEnhancements(onUpdate: EnhancementUpdate): Promise<void> {
  await probeRnnoise(onUpdate)
  await probeOnnx(onUpdate)
  await probeTone(onUpdate)
}

async function probeRnnoise(onUpdate: EnhancementUpdate): Promise<void> {
  onUpdate({ id: 'rnnoise', label: 'RNNoise WASM', status: 'loading', detail: 'Loading WASM' })

  try {
    const { Rnnoise } = await import('@shiguredo/rnnoise-wasm')
    const rnnoise = await Rnnoise.load()
    const state = rnnoise.createDenoiseState()
    state.destroy()
    onUpdate({
      id: 'rnnoise',
      label: 'RNNoise WASM',
      status: 'ready',
      detail: `${rnnoise.frameSize} sample frames`,
    })
  } catch (error) {
    onUpdate({
      id: 'rnnoise',
      label: 'RNNoise WASM',
      status: 'fallback',
      detail: error instanceof Error ? error.message : 'Noise gate active',
    })
  }
}

async function probeOnnx(onUpdate: EnhancementUpdate): Promise<void> {
  onUpdate({ id: 'onnx', label: 'ONNX Runtime Web', status: 'loading', detail: 'Checking runtime' })

  try {
    const ort = await import('onnxruntime-web')
    ort.env.wasm.numThreads = 1
    onUpdate({
      id: 'onnx',
      label: 'ONNX Runtime Web',
      status: 'ready',
      detail: 'Runtime available',
    })
  } catch (error) {
    onUpdate({
      id: 'onnx',
      label: 'ONNX Runtime Web',
      status: 'fallback',
      detail: error instanceof Error ? error.message : 'WebAudio fallback active',
    })
  }
}

async function probeTone(onUpdate: EnhancementUpdate): Promise<void> {
  onUpdate({ id: 'tone', label: 'Tone.js transport', status: 'loading', detail: 'Loading scheduler' })

  try {
    const tone = await import('tone')
    onUpdate({
      id: 'tone',
      label: 'Tone.js transport',
      status: 'ready',
      detail: `${tone.Transport.bpm.value} bpm clock`,
    })
  } catch (error) {
    onUpdate({
      id: 'tone',
      label: 'Tone.js transport',
      status: 'fallback',
      detail: error instanceof Error ? error.message : 'Native timers active',
    })
  }
}
