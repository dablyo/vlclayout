export function getGridLevel(cameraY) {
  if (cameraY < 200) return { step: 1, label: '1cm' };
  if (cameraY < 500) return { step: 10, label: '10cm' };
  return { step: 100, label: '100cm' };
}
