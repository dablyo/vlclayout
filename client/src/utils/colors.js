export const COLOR_PALETTE = [
  '#0088ff',
  '#8b5cf6',
  '#06b6d4',
  '#f97316',
  '#ec4899',
  '#eab308',
  '#6366f1',
  '#d946ef',
  '#a0522d',
];

export function getModuleColor(moduleIndex) {
  return COLOR_PALETTE[moduleIndex % COLOR_PALETTE.length];
}
