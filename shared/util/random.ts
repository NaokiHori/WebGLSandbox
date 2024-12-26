export function genRange({
  minValue,
  maxValue,
}: {
  minValue: number;
  maxValue: number;
}): number {
  return minValue + Math.random() * (maxValue - minValue);
}
