export function Cone() {
  return (
    <mesh position={[0, 0, 0]}>
      <coneGeometry args={[0.4, 1.2, 16]} />
      <meshStandardMaterial color="#d4a96a" />
    </mesh>
  )
}
