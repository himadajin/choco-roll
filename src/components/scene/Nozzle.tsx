export function Nozzle() {
  return (
    <mesh position={[0, 3, 0]}>
      <cylinderGeometry args={[0.1, 0.15, 0.4, 12]} />
      <meshStandardMaterial color="#888888" />
    </mesh>
  )
}
