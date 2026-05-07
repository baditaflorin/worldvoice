import { useQuery } from "@tanstack/react-query";
import type { CSSProperties } from "react";
import {
  AudioLines,
  BatteryMedium,
  CircleStop,
  Gauge,
  Mic,
  Music2,
  Play,
  Sparkles,
  Volume2,
  Waves,
} from "lucide-react";
import { MeterCanvas } from "./components/MeterCanvas";
import { fetchModelManifest } from "./features/audio/modelManifest";
import { PRESETS, type PresetId } from "./features/audio/presets";
import { useWorldVoice } from "./features/audio/useWorldVoice";

const presetIcons: Record<PresetId, typeof Music2> = {
  violin: Music2,
  choir: AudioLines,
  sax: Volume2,
  dream: Sparkles,
};

function App() {
  const { metrics, settings, running, setSettings, start, stop } =
    useWorldVoice();
  const manifest = useQuery({
    queryKey: ["model-manifest", import.meta.env.BASE_URL],
    queryFn: () => fetchModelManifest(import.meta.env.BASE_URL),
    staleTime: 1000 * 60 * 30,
  });

  const handlePower = async () => {
    if (running) {
      await stop();
    } else {
      await start();
    }
  };

  return (
    <main className="app-shell">
      <section className="control-panel" aria-label="WorldVoice controls">
        <div className="brand-row">
          <div className="brand-mark" aria-hidden="true">
            <Waves size={24} />
          </div>
          <div>
            <h1>WorldVoice</h1>
            <p>{metrics.message}</p>
          </div>
        </div>

        <button
          type="button"
          className="power-button"
          onClick={handlePower}
          aria-pressed={running}
          title={running ? "Stop live audio" : "Start live audio"}
        >
          {running ? <CircleStop size={22} /> : <Play size={22} />}
          <span>{running ? "Stop" : "Start"}</span>
        </button>

        <div
          className="segmented"
          role="tablist"
          aria-label="Transformation preset"
        >
          {PRESETS.map((preset) => {
            const Icon = presetIcons[preset.id];
            const active = settings.presetId === preset.id;

            return (
              <button
                key={preset.id}
                type="button"
                role="tab"
                aria-selected={active}
                className={active ? "segment active" : "segment"}
                onClick={() => setSettings({ presetId: preset.id })}
                style={{ "--accent": preset.accent } as CSSProperties}
                title={preset.label}
              >
                <Icon size={18} />
                <span>{preset.label}</span>
              </button>
            );
          })}
        </div>

        <label className="range-control">
          <span>Intensity</span>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={settings.intensity}
            onChange={(event) =>
              setSettings({ intensity: event.currentTarget.valueAsNumber })
            }
          />
        </label>

        <label className="range-control">
          <span>Space</span>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={settings.space}
            onChange={(event) =>
              setSettings({ space: event.currentTarget.valueAsNumber })
            }
          />
        </label>

        <label className="range-control">
          <span>Color</span>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={settings.color}
            onChange={(event) =>
              setSettings({ color: event.currentTarget.valueAsNumber })
            }
          />
        </label>

        <label className="toggle-row">
          <input
            type="checkbox"
            checked={settings.batterySaver}
            onChange={(event) =>
              setSettings({ batterySaver: event.currentTarget.checked })
            }
          />
          <BatteryMedium size={18} />
          <span>Battery saver</span>
        </label>
      </section>

      <section className="stage-panel" aria-label="Live performance view">
        <MeterCanvas metrics={metrics} settings={settings} />
        <div className="stage-readout">
          <div>
            <span className="readout-label">Pitch</span>
            <strong>
              {metrics.pitchHz
                ? `${Math.round(metrics.pitchHz)} Hz`
                : metrics.note}
            </strong>
          </div>
          <div>
            <span className="readout-label">Level</span>
            <strong>{Math.round(metrics.level * 100)}%</strong>
          </div>
          <div>
            <span className="readout-label">Latency</span>
            <strong>
              {metrics.latencyMs ? `${metrics.latencyMs} ms` : "Standby"}
            </strong>
          </div>
        </div>
      </section>

      <section className="status-panel" aria-label="Engine status">
        <div className="status-strip">
          <span className={`status-dot ${metrics.status}`} aria-hidden="true" />
          <strong>{metrics.status}</strong>
        </div>

        <div className="meter-stack">
          <div>
            <span>Clarity</span>
            <meter min="0" max="1" value={metrics.clarity} />
          </div>
          <div>
            <span>Input</span>
            <meter min="0" max="1" value={metrics.level} />
          </div>
        </div>

        <div className="module-list">
          <h2>Enhancements</h2>
          {metrics.enhancements.map((enhancement) => (
            <div className="module-row" key={enhancement.id}>
              <Gauge size={16} />
              <div>
                <strong>{enhancement.label}</strong>
                <span>{enhancement.detail}</span>
              </div>
              <em>{enhancement.status}</em>
            </div>
          ))}
        </div>

        <div className="module-list">
          <h2>Model Packs</h2>
          {(manifest.data?.packs ?? []).map((pack) => (
            <div className="module-row" key={pack.id}>
              <Mic size={16} />
              <div>
                <strong>{pack.label}</strong>
                <span>{pack.runtime}</span>
              </div>
              <em>{pack.status}</em>
            </div>
          ))}
          {manifest.isError ? (
            <p className="inline-error">Manifest fallback active</p>
          ) : null}
        </div>
      </section>
    </main>
  );
}

export default App;
