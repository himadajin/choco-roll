export function Lighting() {
  return (
    <>
      <ambientLight intensity={0.55} />
      <hemisphereLight args={['#fff7e0', '#b39775', 0.4]} />
      <directionalLight position={[4, 8, 6]} intensity={1.1} castShadow />
      <directionalLight position={[-3, 4, -2]} intensity={0.25} />
    </>
  )
}
