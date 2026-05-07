import { openDB, type IDBPDatabase } from "idb";
import { DEFAULT_SETTINGS, type EngineSettings } from "./presets";

const DB_NAME = "worldvoice";
const DB_VERSION = 1;
const SETTINGS_STORE = "settings";
const ENGINE_SETTINGS_KEY = "engine-settings";

type WorldVoiceDb = IDBPDatabase<{
  settings: {
    key: string;
    value: EngineSettings;
  };
}>;

async function database(): Promise<WorldVoiceDb> {
  return openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(SETTINGS_STORE)) {
        db.createObjectStore(SETTINGS_STORE);
      }
    },
  }) as Promise<WorldVoiceDb>;
}

export async function loadEngineSettings(): Promise<EngineSettings> {
  try {
    const db = await database();
    const settings = await db.get(SETTINGS_STORE, ENGINE_SETTINGS_KEY);
    return settings ?? DEFAULT_SETTINGS;
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export async function saveEngineSettings(
  settings: EngineSettings,
): Promise<void> {
  try {
    const db = await database();
    await db.put(SETTINGS_STORE, settings, ENGINE_SETTINGS_KEY);
  } catch {
    window.localStorage.setItem(ENGINE_SETTINGS_KEY, JSON.stringify(settings));
  }
}
