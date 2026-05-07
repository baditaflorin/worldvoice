export function createImpossibleImpulse(
  context: BaseAudioContext,
  seconds: number,
  color: number,
): AudioBuffer {
  const length = Math.max(1, Math.floor(context.sampleRate * seconds));
  const impulse = context.createBuffer(2, length, context.sampleRate);
  const left = impulse.getChannelData(0);
  const right = impulse.getChannelData(1);
  const decay = 2.2 + color * 4.2;
  const foldPoint = Math.floor(length * (0.34 + color * 0.18));

  for (let index = 0; index < length; index += 1) {
    const progress = index / length;
    const reverseProgress = Math.max(0, (foldPoint - index) / foldPoint);
    const impossibleBump =
      Math.sin(progress * Math.PI * (3 + color * 5)) * 0.18;
    const envelope =
      Math.exp(-decay * progress) +
      reverseProgress * color * 0.32 +
      impossibleBump;
    const shimmer = Math.sin(index * 0.021 + color * 4) * 0.28;
    const noise = (Math.random() * 2 - 1) * Math.max(0, envelope);

    left[index] = noise * (0.74 + shimmer);
    right[index] = noise * (0.74 - shimmer);
  }

  return impulse;
}
