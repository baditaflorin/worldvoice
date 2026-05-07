import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { WorldVoiceEngine, type EngineMetrics } from "./audioEngine";
import { INITIAL_ENHANCEMENTS } from "./enhancements";
import { clampSetting, DEFAULT_SETTINGS, type EngineSettings } from "./presets";
import { loadEngineSettings, saveEngineSettings } from "./storage";

const INITIAL_METRICS: EngineMetrics = {
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

export function useWorldVoice() {
  const engineRef = useRef<WorldVoiceEngine | null>(null);
  const [settings, setSettingsState] =
    useState<EngineSettings>(DEFAULT_SETTINGS);
  const [metrics, setMetrics] = useState<EngineMetrics>(INITIAL_METRICS);

  useEffect(() => {
    let active = true;

    void loadEngineSettings().then((storedSettings) => {
      if (active) {
        setSettingsState(storedSettings);
      }
    });

    return () => {
      active = false;
      void engineRef.current?.stop();
    };
  }, []);

  const setSettings = useCallback((patch: Partial<EngineSettings>) => {
    setSettingsState((current) => {
      const next = {
        ...current,
        ...patch,
        intensity: clampSetting(patch.intensity ?? current.intensity),
        space: clampSetting(patch.space ?? current.space),
        color: clampSetting(patch.color ?? current.color),
      };
      engineRef.current?.updateSettings(next);
      void saveEngineSettings(next);
      return next;
    });
  }, []);

  const start = useCallback(async () => {
    if (!engineRef.current) {
      engineRef.current = new WorldVoiceEngine(setMetrics);
    }

    await engineRef.current.start(settings);
  }, [settings]);

  const stop = useCallback(async () => {
    await engineRef.current?.stop();
  }, []);

  const running = metrics.status === "running" || metrics.status === "starting";

  return useMemo(
    () => ({
      metrics,
      settings,
      running,
      setSettings,
      start,
      stop,
    }),
    [metrics, running, setSettings, settings, start, stop],
  );
}
