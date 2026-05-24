import { expect } from "@playwright/test";
import type { Locator, Page } from "@playwright/test";

export type WorldPoint = Readonly<{
  x: number;
  y: number;
}>;

export type CanvasFrame = Readonly<{
  canvas: Locator;
  centerX: number;
  centerY: number;
  zoomCssPx: number;
}>;

export type PixelColor = "yellow" | "green" | "blue" | "light";

const ZOOM_CSS_PX = 80;

export async function getCanvasFrame(page: Page): Promise<CanvasFrame> {
  const canvas = page.locator("#geometry-canvas");

  await expect(canvas).toBeVisible();

  const box = await canvas.boundingBox();

  if (!box) {
    throw new Error("Could not find canvas bounding box");
  }

  return {
    canvas,
    centerX: box.x + box.width / 2,
    centerY: box.y + box.height / 2,
    zoomCssPx: ZOOM_CSS_PX,
  };
}

export function worldToPage(
  frame: CanvasFrame,
  point: WorldPoint,
): Readonly<{ x: number; y: number }> {
  return {
    x: frame.centerX + point.x * frame.zoomCssPx,
    y: frame.centerY - point.y * frame.zoomCssPx,
  };
}

export async function clickWorld(
  page: Page,
  frame: CanvasFrame,
  point: WorldPoint,
): Promise<void> {
  const screen = worldToPage(frame, point);

  await page.mouse.click(screen.x, screen.y);
}

export async function shiftClickWorld(
  page: Page,
  frame: CanvasFrame,
  point: WorldPoint,
): Promise<void> {
  const screen = worldToPage(frame, point);

  await page.keyboard.down("Shift");
  await page.mouse.click(screen.x, screen.y);
  await page.keyboard.up("Shift");
}

export async function dragWorld(
  page: Page,
  frame: CanvasFrame,
  from: WorldPoint,
  to: WorldPoint,
): Promise<void> {
  const start = worldToPage(frame, from);
  const end = worldToPage(frame, to);

  await page.mouse.move(start.x, start.y);
  await page.mouse.down();
  await page.mouse.move(end.x, end.y);
  await page.mouse.up();
}

export function waitForAnimationFrame(page: Page): Promise<void> {
  return page.evaluate(
    () =>
      new Promise<void>((resolve) => {
        requestAnimationFrame(() => {
          resolve();
        });
      }),
  );
}

export async function expectYellowPointNear(
  canvas: Locator,
  point: WorldPoint,
): Promise<void> {
  await expectPixelsNear(canvas, point, "yellow");
}

export async function expectGreenPointNear(
  canvas: Locator,
  point: WorldPoint,
): Promise<void> {
  await expectPixelsNear(canvas, point, "green");
}

export async function expectBluePointNear(
  canvas: Locator,
  point: WorldPoint,
): Promise<void> {
  await expectPixelsNear(canvas, point, "blue");
}

export async function expectLightEdgeNear(
  canvas: Locator,
  point: WorldPoint,
): Promise<void> {
  await expectPixelsNear(canvas, point, "light");
}

async function expectPixelsNear(
  canvas: Locator,
  point: WorldPoint,
  color: PixelColor,
): Promise<void> {
  const pixels = await countPixelsNearWorld(canvas, point, color);

  expect(pixels).toBeGreaterThan(0);
}

async function countPixelsNearWorld(
  locator: Locator,
  point: WorldPoint,
  color: PixelColor,
): Promise<number> {
  return locator.evaluate(
    (node, args) => {
      const canvas = node as HTMLCanvasElement;
      const maybeCtx = canvas.getContext("2d");

      if (!maybeCtx) {
        throw new Error("Could not get 2D context");
      }

      const ctx: CanvasRenderingContext2D = maybeCtx;
      const radius = 18;
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      const zoom = args.zoomCssPx * window.devicePixelRatio;
      const x = centerX + args.point.x * zoom;
      const y = centerY - args.point.y * zoom;

      const image = ctx.getImageData(
        Math.floor(x - radius),
        Math.floor(y - radius),
        radius * 2 + 1,
        radius * 2 + 1,
      );

      let count = 0;

      for (let index = 0; index < image.data.length; index += 4) {
        const red = image.data[index] ?? 0;
        const green = image.data[index + 1] ?? 0;
        const blue = image.data[index + 2] ?? 0;
        const alpha = image.data[index + 3] ?? 0;

        if (matchesColor(args.color, red, green, blue, alpha)) {
          count += 1;
        }
      }

      return count;

      function matchesColor(
        target: PixelColor,
        red: number,
        green: number,
        blue: number,
        alpha: number,
      ): boolean {
        switch (target) {
          case "yellow":
            return alpha > 0 && red > 180 && green > 120 && blue < 120;

          case "green":
            return alpha > 0 && red < 120 && green > 150 && blue > 100;

          case "blue":
            return alpha > 0 && red < 140 && green > 120 && blue > 180;

          case "light":
            return alpha > 0 && red > 180 && green > 180 && blue > 180;
        }
      }
    },
    {
      point,
      color,
      zoomCssPx: ZOOM_CSS_PX,
    },
  );
}
