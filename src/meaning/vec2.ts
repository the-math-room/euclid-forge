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

export function centroid(a: Vec2, b: Vec2, c: Vec2): Vec2 {
  return vec2((a.x + b.x + c.x) / 3, (a.y + b.y + c.y) / 3);
}

export function deltaBetween(a: Vec2, b: Vec2): Vec2 {
  return vec2(b.x - a.x, b.y - a.y);
}
