import { z } from "zod";

export const modelPackSchema = z.object({
  id: z.string(),
  kind: z.enum(["rnnoise", "crepe", "ddsp", "rave", "reverb"]),
  label: z.string(),
  description: z.string(),
  sizeMb: z.number().nonnegative(),
  runtime: z.string(),
  status: z.enum([
    "bundled",
    "adapter-ready",
    "external-checkpoint",
    "bring-your-own",
    "planned",
  ]),
  url: z.string().url().optional(),
  fallback: z.string(),
});

export const modelManifestSchema = z.object({
  schemaVersion: z.literal(1),
  generatedAt: z.string(),
  packs: z.array(modelPackSchema),
});

export type ModelManifest = z.infer<typeof modelManifestSchema>;
export type ModelPack = z.infer<typeof modelPackSchema>;

export const FALLBACK_MANIFEST: ModelManifest = {
  schemaVersion: 1,
  generatedAt: "2026-05-07T00:00:00.000Z",
  packs: [
    {
      id: "web-audio-core",
      kind: "ddsp",
      label: "WebAudio timbre core",
      description:
        "Browser-native harmonic resynthesis used when neural packs are unavailable.",
      sizeMb: 0,
      runtime: "Web Audio",
      status: "bundled",
      fallback: "Already active",
    },
  ],
};

export async function fetchModelManifest(
  baseUrl: string,
): Promise<ModelManifest> {
  const manifestUrl = new URL("models/manifest.json", window.location.origin);
  manifestUrl.pathname = `${baseUrl.replace(/\/$/, "")}/models/manifest.json`;

  const response = await fetch(manifestUrl);

  if (!response.ok) {
    return FALLBACK_MANIFEST;
  }

  const payload: unknown = await response.json();
  return modelManifestSchema.parse(payload);
}
