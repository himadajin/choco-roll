// World geometry
export const CONE_TIP_Y = 0
export const CONE_HEIGHT = 1.4
export const CONE_TOP_RADIUS = 0.55
export const CONE_BASE_RADIUS = 0.05
export const CREAM_BASE_Y = CONE_HEIGHT
export const CREAM_TUBE_RADIUS = 0.42

// Cream stacking dynamics
export const CREAM_RISE_RATE = 0.6 // world units per second of Y rise
export const POINT_INTERVAL = 1 / 30 // seconds between recorded cream points
export const MAX_CREAM_POINTS = 4000 // hard cap to keep TubeGeometry tractable

// Nozzle controls
export const NOZZLE_MAX_RADIUS = 1.0 // XZ radius the nozzle can reach
export const NOZZLE_DRAG_SENSITIVITY = 0.0045 // world units per pixel of drag
export const NOZZLE_VISUAL_OFFSET_Y = 0.5 // nozzle visual Y above the latest cream tip

// Collapse / balance
export const COLLAPSE_BASE_THRESHOLD = 0.55 // CoM offset at zero height that triggers collapse
export const COLLAPSE_HEIGHT_FACTOR = 0.55 // higher -> threshold shrinks faster with height

// Lean visual feedback
export const LEAN_FACTOR = 0.85 // radians per world unit of offset
export const LEAN_MAX = 0.45 // maximum lean angle (radians)
export const LEAN_LERP = 0.12 // smoothing factor per frame for lean

// Cone sinking gag
export const CONE_SINK_START_HEIGHT = 1.6 // cream height above which cone starts sinking
export const CONE_SINK_FACTOR = 0.18 // sink units per cream height unit
export const CONE_SINK_MAX = CONE_HEIGHT * 0.95 // never fully through the cone
export const CONE_SINK_LERP = 0.08

// Camera
export const CAMERA_FOV = 45
export const CAMERA_DISTANCE_XZ = 4.6 // distance from cream column on XZ
export const CAMERA_HEIGHT_OFFSET = -0.3 // camera Y relative to cream top
export const CAMERA_LOOK_OFFSET = -1.2 // lookAt Y relative to cream top
export const CAMERA_FOLLOW_LERP = 0.08

// Lever
export const LEVER_PULL_THRESHOLD = 80 // px the user must drag down to start

// Layout
export const MOBILE_VIEWPORT_WIDTH = 414 // px - max stage width when on PC
