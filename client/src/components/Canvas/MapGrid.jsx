import { useMemo, useState } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Line, Text } from '@react-three/drei';
import { getGridLevel } from '../../utils/grid';

export default function MapGrid() {
  const { camera } = useThree();
  const [gridStep, setGridStep] = useState(100);

  useFrame(() => {
    const { step } = getGridLevel(camera.position.y);
    if (step !== gridStep) {
      setGridStep(step);
    }
  });

  const lines = useMemo(() => {
    const result = [];
    const size = 1000;
    for (let z = 0; z <= size; z += gridStep) {
      result.push([[0, 0, z], [size, 0, z]]);
    }
    for (let x = 0; x <= size; x += gridStep) {
      result.push([[x, 0, 0], [x, 0, size]]);
    }
    return result;
  }, [gridStep]);

  // Labels at 100cm intervals always (sufficient for all zoom levels)
  const labels = useMemo(() => {
    const result = [];
    for (let v = 0; v <= 1000; v += 100) {
      result.push({ pos: [v, 1, -15], text: String(v) });
      result.push({ pos: [-15, 1, v], text: String(v) });
    }
    return result;
  }, []);

  const fontSize = gridStep <= 1 ? 8 : gridStep <= 10 ? 15 : 25;

  return (
    <group>
      {lines.map((pts, i) => (
        <Line key={`g${i}`} points={pts} color="#dddddd" lineWidth={1} />
      ))}
      <Line
        points={[[0, 0, 0], [1000, 0, 0], [1000, 0, 1000], [0, 0, 1000], [0, 0, 0]]}
        color="#999999"
        lineWidth={2}
      />
      {labels.map((l, i) => (
        <Text key={`l${i}`} position={l.pos} fontSize={fontSize} color="#666666" anchorX="center" anchorY="middle">
          {l.text}
        </Text>
      ))}
    </group>
  );
}
