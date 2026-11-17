export type ViewId = "exterior" | "ground" | "upper" | "living" | "kitchen" | "dining" | "bedroom" | "stairs" | "garage" | "pool";
export type Point3 = [number, number, number];
export type VillaView = {
  id: ViewId;
  label: string;
  eyebrow: string;
  description: string;
  position: Point3;
  target: Point3;
  floor: "ground" | "upper" | "outside";
  clip?: number;
};

// Coordinates match the actual model's glTF Y-up coordinate system, in metres.
export const VIEWS: Record<ViewId, VillaView> = {
  exterior: { id: "exterior", label: "The complete picture", eyebrow: "Exterior overview", description: "White mineral plaster, grey limestone and generous glazing. A contemporary villa designed around light and the outdoors.", position: [-19, 11, 28], target: [1, 2.1, .5], floor: "outside" },
  ground: { id: "ground", label: "Ground floor", eyebrow: "Architectural cutaway", description: "Look down into the open living space, kitchen and dining area. The upper level is cut away so you can explore the plan.", position: [-9, 18, 15], target: [0, 1, -2.5], floor: "ground", clip: 3.35 },
  upper: { id: "upper", label: "First floor", eyebrow: "Architectural cutaway", description: "Two furnished bedrooms sit behind recessed glazing, opening onto a shared glass balcony. The roof is cut away for this view.", position: [-10, 19, 14], target: [-1, 4.1, -3.0], floor: "upper", clip: 6.7 },
  living: { id: "living", label: "Living room", eyebrow: "Ground floor · 01", description: "Soft linen seating, a stone coffee table and floor-to-ceiling glass create a relaxed connection with the pool terrace.", position: [-4.9, 1.75, -.0], target: [-3.0, 1.15, -2.8], floor: "ground" },
  kitchen: { id: "kitchen", label: "Kitchen", eyebrow: "Ground floor · 02", description: "An oak island with a stone worktop anchors the kitchen. Pull up a stool and take a closer look at the natural finishes.", position: [-.6, 1.8, -1.75], target: [1.25, 1.25, -4.6], floor: "ground" },
  dining: { id: "dining", label: "Dining room", eyebrow: "Ground floor · 03", description: "A timber dining table and upholstered chairs bring warmth to the quiet material palette, beside the open living area.", position: [-5.7, 1.7, -3.8], target: [-3.4, 1.0, -5.35], floor: "ground" },
  bedroom: { id: "bedroom", label: "Bedrooms", eyebrow: "First floor · 04", description: "Linen upholstery, oak furniture and a private outlook through the recessed windows. Explore the furnished upper floor.", position: [-5.6, 5.25, -.9], target: [-4.5, 4.45, -3.2], floor: "upper" },
  stairs: { id: "stairs", label: "Staircase", eyebrow: "Connecting the levels · 05", description: "Floating oak treads and a slender metal handrail form a light connection between the living spaces and bedrooms.", position: [1.3, 1.8, -1.1], target: [3.65, 2.4, -3.6], floor: "ground" },
  garage: { id: "garage", label: "Two-car garage", eyebrow: "Ground floor · 06", description: "An attached garage with two separate sectional doors, clerestory glazing and a generous forecourt for arrival.", position: [9.4, 1.7, -.65], target: [8.7, 1.25, -4.5], floor: "ground" },
  pool: { id: "pool", label: "Pool & terrace", eyebrow: "Outdoor living · 07", description: "A limestone-edged pool, pale stone terrace and linen loungers extend the living space into the garden.", position: [-10.5, 3.5, 12.5], target: [-2.3, .5, 5.5], floor: "outside" },
};
export const ROOM_IDS: ViewId[] = ["living", "kitchen", "dining", "bedroom", "stairs", "garage", "pool"];

export const ROOM_PLAN = [
  { id: "living" as const, x: 26, y: 68 },
  { id: "kitchen" as const, x: 50, y: 27 },
  { id: "dining" as const, x: 24, y: 26 },
  { id: "stairs" as const, x: 63, y: 46 },
  { id: "garage" as const, x: 85, y: 53 },
];
