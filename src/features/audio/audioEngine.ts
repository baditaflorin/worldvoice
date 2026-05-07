import {
  probeEnhancements,
  INITIAL_ENHANCEMENTS,
  type EnhancementState,
} from "./enhancements";
import { createImpossibleImpulse } from "./impulse";
import { estimatePitch } from "./pitch";
import {
  DEFAULT_SETTINGS,
  getPreset,
  type EngineSettings,
  type Preset,
} from "./presets";

export type EngineStatus =
  | "idle"
  | "starting"
  | "running"
  | "stopping"
  | "error";

export interface EngineMetrics {
  status: EngineStatus;
  level: number;
  pitchHz: number | null;
  note: string;
  clarity: number;
  latencyMs: number;
  presetId: string;
  enhancements: readonly EnhancementState[];
  message: string;
}

interface VoiceNode {
  oscillator: OscillatorNode;
  gain: GainNode;
  ratio: number;
  baseGain: number;
}

interface AudioGraph {
  source: MediaStreamAudioSourceNode;
  highpass: BiquadFilterNode;
  compressor: DynamicsCompressorNode;
  analyser: AnalyserNode;
  dryGain: GainNode;
  synthGain: GainNode;
  sculptor: BiquadFilterNode;
  delay: DelayNode;
  feedback: GainNode;
  convolver: ConvolverNode;
  reverbGain: GainNode;
  master: GainNode;
  voices: VoiceNode[];
}

const DEFAULT_METRICS: EngineMetrics = {
  status: "idle",
  level: 0,
  pitchHz: null,
  note: "Silence",
  clarity: 0,
  latencyMs: 0,
  presetId: DEFAULT_SETTINGS.presetId,
  enhancements: INITIAL_ENHANCEMENTS,
  message: "Idle",
};

export class WorldVoiceEngine {
  private context: AudioContext | null = null;
  private stream: MediaStream | null = null;
  private graph: AudioGraph | null = null;
  private inputBuffer: Float32Array<ArrayBuffer> | null = null;
  private tickId = 0;
  private settings: EngineSettings = DEFAULT_SETTINGS;
  private metrics: EngineMetrics = DEFAULT_METRICS;
  private smoothedPitch = 220;
  private readonly onMetrics: (metrics: EngineMetrics) => void;

  constructor(onMetrics: (metrics: EngineMetrics) => void) {
    this.onMetrics = onMetrics;
  }

  async start(settings: EngineSettings): Promise<void> {
    if (this.context) {
      return;
    }

    this.settings = settings;
    this.emit({ status: "starting", message: "Requesting microphone" });

    if (!navigator.mediaDevices?.getUserMedia) {
      this.emit({
        status: "error",
        message: "Microphone API unavailable in this browser",
      });
      return;
    }

    try {
      this.stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          autoGainControl: false,
          echoCancellation: false,
          noiseSuppression: false,
        },
      });

      this.context = new AudioContext({ latencyHint: "interactive" });
      await this.context.resume();
      this.graph = this.createGraph(
        this.context,
        this.stream,
        getPreset(settings.presetId),
      );
      this.inputBuffer = new Float32Array(this.graph.analyser.fftSize);
      this.applySettings(settings);
      this.startTicker();
      this.emit({ status: "running", message: "Live" });
      void probeEnhancements((state) => this.updateEnhancement(state));
    } catch (error) {
      this.emit({
        status: "error",
        message:
          error instanceof Error
            ? error.message
            : "Could not start audio engine",
      });
      await this.stop();
    }
  }

  updateSettings(settings: EngineSettings): void {
    this.settings = settings;
    this.applySettings(settings);
  }

  async stop(): Promise<void> {
    this.emit({ status: "stopping", message: "Stopping" });
    window.clearInterval(this.tickId);
    this.tickId = 0;

    if (this.graph) {
      for (const voice of this.graph.voices) {
        voice.gain.gain.cancelScheduledValues(0);
        voice.gain.gain.value = 0;
        voice.oscillator.stop();
      }
    }

    this.stream?.getTracks().forEach((track) => track.stop());
    this.stream = null;
    this.graph = null;
    this.inputBuffer = null;

    if (this.context) {
      await this.context.close();
      this.context = null;
    }

    this.emit({
      status: "idle",
      level: 0,
      pitchHz: null,
      note: "Silence",
      clarity: 0,
      latencyMs: 0,
      message: "Idle",
    });
  }

  private createGraph(
    context: AudioContext,
    stream: MediaStream,
    preset: Preset,
  ): AudioGraph {
    const source = context.createMediaStreamSource(stream);
    const highpass = context.createBiquadFilter();
    const compressor = context.createDynamicsCompressor();
    const analyser = context.createAnalyser();
    const dryGain = context.createGain();
    const synthGain = context.createGain();
    const sculptor = context.createBiquadFilter();
    const delay = context.createDelay(1);
    const feedback = context.createGain();
    const convolver = context.createConvolver();
    const reverbGain = context.createGain();
    const master = context.createGain();
    const voices = this.createVoices(context, preset);

    highpass.type = "highpass";
    highpass.frequency.value = 70;
    compressor.threshold.value = -34;
    compressor.knee.value = 18;
    compressor.ratio.value = 6;
    compressor.attack.value = 0.004;
    compressor.release.value = 0.18;
    analyser.fftSize = 2048;
    analyser.smoothingTimeConstant = 0.72;
    master.gain.value = 0.82;
    feedback.gain.value = 0.18;

    source.connect(highpass);
    highpass.connect(compressor);
    compressor.connect(analyser);
    compressor.connect(dryGain);
    dryGain.connect(master);

    for (const voice of voices) {
      voice.oscillator.connect(voice.gain);
      voice.gain.connect(synthGain);
      voice.oscillator.start();
    }

    synthGain.connect(sculptor);
    sculptor.connect(master);
    sculptor.connect(delay);
    delay.connect(feedback);
    feedback.connect(delay);
    delay.connect(master);
    sculptor.connect(convolver);
    convolver.connect(reverbGain);
    reverbGain.connect(master);
    master.connect(context.destination);

    return {
      source,
      highpass,
      compressor,
      analyser,
      dryGain,
      synthGain,
      sculptor,
      delay,
      feedback,
      convolver,
      reverbGain,
      master,
      voices,
    };
  }

  private createVoices(context: AudioContext, preset: Preset): VoiceNode[] {
    const voices: VoiceNode[] = [];

    for (const [harmonicIndex, ratio] of preset.harmonicRatios.entries()) {
      for (const detune of preset.detuneCents) {
        const oscillator = context.createOscillator();
        const gain = context.createGain();
        oscillator.type = preset.oscillatorType;
        oscillator.frequency.value = 220 * ratio;
        oscillator.detune.value = detune;
        gain.gain.value = 0;
        voices.push({
          oscillator,
          gain,
          ratio,
          baseGain: preset.harmonicGains[harmonicIndex] ?? 0.04,
        });
      }
    }

    return voices;
  }

  private applySettings(settings: EngineSettings): void {
    if (!this.context || !this.graph) {
      return;
    }

    const preset = getPreset(settings.presetId);
    const now = this.context.currentTime;
    const saver = settings.batterySaver ? 0.68 : 1;
    const space = settings.batterySaver
      ? Math.min(settings.space, 0.36)
      : settings.space;

    this.graph.dryGain.gain.setTargetAtTime(
      preset.dryGain * (1 - settings.intensity * 0.42),
      now,
      0.05,
    );
    this.graph.synthGain.gain.setTargetAtTime(
      preset.synthGain * saver,
      now,
      0.05,
    );
    this.graph.reverbGain.gain.setTargetAtTime(
      preset.reverbGain * space * saver,
      now,
      0.08,
    );
    this.graph.delay.delayTime.setTargetAtTime(
      preset.delayTime * (0.5 + space),
      now,
      0.08,
    );
    this.graph.feedback.gain.setTargetAtTime(0.08 + space * 0.22, now, 0.08);
    this.graph.sculptor.type = preset.filterType;
    this.graph.sculptor.frequency.setTargetAtTime(
      preset.filterFrequency * (0.72 + settings.color * 0.76),
      now,
      0.08,
    );
    this.graph.sculptor.Q.setTargetAtTime(preset.filterQ, now, 0.08);
    this.graph.convolver.buffer = createImpossibleImpulse(
      this.context,
      1.2 + space * 3.4,
      settings.color,
    );

    for (const voice of this.graph.voices) {
      voice.oscillator.type = preset.oscillatorType;
    }

    this.emit({ presetId: settings.presetId });
  }

  private startTicker(): void {
    window.clearInterval(this.tickId);
    this.tickId = window.setInterval(
      () => this.tick(),
      this.settings.batterySaver ? 66 : 33,
    );
  }

  private tick(): void {
    if (!this.context || !this.graph || !this.inputBuffer) {
      return;
    }

    this.graph.analyser.getFloatTimeDomainData(this.inputBuffer);
    const estimate = estimatePitch(this.inputBuffer, this.context.sampleRate);
    const preset = getPreset(this.settings.presetId);
    const now = this.context.currentTime;
    const pitch = estimate.frequency ?? this.smoothedPitch;
    const level = Math.min(1, estimate.rms * 5.4);
    const voiced = estimate.frequency !== null && estimate.clarity > 0.35;
    this.smoothedPitch = voiced
      ? this.smoothedPitch * 0.78 + pitch * 0.22
      : this.smoothedPitch;

    for (const voice of this.graph.voices) {
      const targetPitch = Math.min(
        5200,
        Math.max(28, this.smoothedPitch * voice.ratio),
      );
      const gain = voiced
        ? level *
          voice.baseGain *
          this.settings.intensity *
          (this.settings.batterySaver ? 0.72 : 1)
        : 0;
      voice.oscillator.frequency.setTargetAtTime(targetPitch, now, 0.018);
      voice.gain.gain.setTargetAtTime(gain, now, 0.045);
    }

    this.emit({
      status: "running",
      level,
      pitchHz: estimate.frequency,
      note: estimate.note,
      clarity: estimate.clarity,
      latencyMs: this.estimateLatency(),
      presetId: preset.id,
      message: voiced ? "Tracking" : "Listening",
    });
  }

  private estimateLatency(): number {
    if (!this.context) {
      return 0;
    }

    const outputLatency =
      "outputLatency" in this.context ? this.context.outputLatency : 0;
    return Math.round((this.context.baseLatency + outputLatency) * 1000 + 28);
  }

  private updateEnhancement(state: EnhancementState): void {
    const enhancements = this.metrics.enhancements.map((item) =>
      item.id === state.id ? state : item,
    );
    this.emit({ enhancements });
  }

  private emit(partial: Partial<EngineMetrics>): void {
    this.metrics = {
      ...this.metrics,
      ...partial,
    };
    this.onMetrics(this.metrics);
  }
}
