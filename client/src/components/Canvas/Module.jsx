import { useMemo } from 'react';
import { Line, Text } from '@react-three/drei';
import { useScene } from '../../hooks/useScene';

export default function Module({ id, x, z, height, angle, color, isSelected, showCoverage }) {
  const { selectModule } = useScene();

  // Coverage math (from reference files)
  const { groundDistance, d, leftGround, rightGround, circlePoints, squarePoints } = useMemo(() => {
    const halfAngleRad = (angle / 2) * Math.PI / 180;
    const gd = height * Math.tan(halfAngleRad);
    const dd = gd / Math.sqrt(2);

    // Coverage angle ground intercepts (perpDir = (-1,0,1).normalize())
    const perpDirX = -1 / Math.sqrt(2);
    const perpDirZ = 1 / Math.sqrt(2);
    const leftGround = [x + perpDirX * (-gd), 0, z + perpDirZ * (-gd)];
    const rightGround = [x + perpDirX * gd, 0, z + perpDirZ * gd];

    // Circle points
    const cp = [];
    for (let i = 0; i <= 128; i++) {
      const theta = (i / 128) * Math.PI * 2;
      cp.push([x + gd * Math.cos(theta), 0, z + gd * Math.sin(theta)]);
    }

    // Square points (coverage square rotated 45°)
    const sp = [
      [x + dd, 0, z - dd],
      [x + dd, 0, z + dd],
      [x - dd, 0, z + dd],
      [x - dd, 0, z - dd],
      [x + dd, 0, z - dd],
    ];

    return { groundDistance: gd, d: dd, leftGround, rightGround, circlePoints: cp, squarePoints: sp };
  }, [x, z, height, angle]);

  const spherePos = [x, height, z];
  const groundPos = [x, 0, z];

  // Derived display values
  const coverageDiameter = (groundDistance * 2).toFixed(0);
  const squareSide = (d * 2).toFixed(0);

  return (
    <group>
      {/* Green sphere - AP point */}
      <mesh position={spherePos} onClick={(e) => { e.stopPropagation(); selectModule(id); }}>
        <sphereGeometry args={[6, 16, 16]} />
        <meshBasicMaterial color="#00aa00" />
      </mesh>

      {/* Height indicator line */}
      <Line points={[groundPos, spherePos]} color="#888888" lineWidth={1} />

      {/* Coverage angle lines */}
      <Line points={[spherePos, leftGround]} color="#00aa00" lineWidth={1} />
      <Line points={[spherePos, rightGround]} color="#00aa00" lineWidth={1} />

      {/* Red dashed diagonal */}
      <Line
        points={[[x + d, 0, z - d], [x - d, 0, z + d]]}
        color="#ff0000"
        lineWidth={1}
        dashed
        dashSize={8}
        gapSize={4}
      />

      {/* Coverage circle (dashed, colored) */}
      {showCoverage && (
        <Line
          points={circlePoints}
          color={color}
          lineWidth={1}
          dashed
          dashSize={8}
          gapSize={4}
        />
      )}

      {/* Coverage square (dashed, colored) */}
      {showCoverage && (
        <Line
          points={squarePoints}
          color={color}
          lineWidth={1}
          dashed
          dashSize={10}
          gapSize={5}
        />
      )}

      {/* Number label */}
      <Text
        position={[x, height + 20, z]}
        fontSize={30}
        color={color}
        anchorX="center"
        anchorY="middle"
      >
        {id}
      </Text>

      {/* Height label - on height line */}
      <Text
        position={[x + 15, height / 2, z]}
        fontSize={16}
        color="#888888"
        anchorX="left"
        anchorY="middle"
      >
        {`H:${height}`}
      </Text>

      {/* Angle label - near coverage angle lines */}
      <Text
        position={[x, height - 15, z + 15]}
        fontSize={16}
        color="#00aa00"
        anchorX="center"
        anchorY="middle"
      >
        {`${angle}°`}
      </Text>

      {/* Diameter label - on coverage circle edge */}
      <Text
        position={[x + groundDistance, 1, z]}
        fontSize={16}
        color={color}
        anchorX="left"
        anchorY="middle"
      >
        {`⌀${coverageDiameter}`}
      </Text>

      {/* Square side label - on square edge */}
      <Text
        position={[x, 1, z + d]}
        fontSize={16}
        color={color}
        anchorX="center"
        anchorY="middle"
      >
        {`□${squareSide}`}
      </Text>

      {/* Selection ring */}
      {isSelected && (
        <mesh position={[x, 5, z]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[8, 12, 32]} />
          <meshBasicMaterial color="#0088ff" transparent opacity={0.6} side={2} />
        </mesh>
      )}
    </group>
  );
}
