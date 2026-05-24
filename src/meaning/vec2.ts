export type Vec2 = Readonly<{
  x: number;
  y: number;
}>;

export function vec2(x: number, y: number): Vec2 {
  return Object.freeze({ x, y });
}

export function midpoint(a: Vec2, b: Vec2): Vec2 {
  return vec2((a.x + b.x) / 2, (a.y + b.y) / 2);
}