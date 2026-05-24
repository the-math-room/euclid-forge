import { expect, test } from "@playwright/test";

test("renders a segment with two free endpoints and a constrained midpoint", async ({
  page,
}) => {
  await page.goto("/");

  const canvas = page.locator("#geometry-canvas");

  await expect(canvas).toBeVisible();

  const result = await canvas.evaluate((node) => {
    const canvas = node as HTMLCanvasElement;
    const maybeCtx = canvas.getContext("2d");

    if (!maybeCtx) {
      throw new Error("Could not get 2D context");
    }

    const ctx: CanvasRenderingContext2D = maybeCtx;

    function countPixelsNear(
      x: number,
      y: number,
      predicate: (
        red: number,
        green: number,
        blue: number,
        alpha: number,
      ) => boolean,
    ): number {
      const radius = 14;
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

        if (predicate(red, green, blue, alpha)) {
          count += 1;
        }
      }

      return count;
    }

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const zoom = 80 * window.devicePixelRatio;

    const isYellowish = (
      red: number,
      green: number,
      blue: number,
      alpha: number,
    ) => alpha > 0 && red > 180 && green > 120 && blue < 120;

    const isGreenish = (
      red: number,
      green: number,
      blue: number,
      alpha: number,
    ) => alpha > 0 && red < 120 && green > 150 && blue > 100;

    const isLightSegment = (
      red: number,
      green: number,
      blue: number,
      alpha: number,
    ) => alpha > 0 && red > 180 && green > 180 && blue > 180;

    return {
      width: canvas.width,
      height: canvas.height,
      leftYellowishPixels: countPixelsNear(
        centerX - 2 * zoom,
        centerY,
        isYellowish,
      ),
      middleGreenishPixels: countPixelsNear(centerX, centerY, isGreenish),
      rightYellowishPixels: countPixelsNear(
        centerX + 2 * zoom,
        centerY,
        isYellowish,
      ),
      segmentPixelsNearQuarter: countPixelsNear(
        centerX - zoom,
        centerY,
        isLightSegment,
      ),
    };
  });

  expect(result.width).toBeGreaterThan(0);
  expect(result.height).toBeGreaterThan(0);
  expect(result.leftYellowishPixels).toBeGreaterThan(0);
  expect(result.middleGreenishPixels).toBeGreaterThan(0);
  expect(result.rightYellowishPixels).toBeGreaterThan(0);
  expect(result.segmentPixelsNearQuarter).toBeGreaterThan(0);
});