import { expect, test } from "@playwright/test";

test("drags a free endpoint and updates the constrained midpoint", async ({
  page,
}) => {
  await page.goto("/");

  const canvas = page.locator("#geometry-canvas");

  await expect(canvas).toBeVisible();

  const before = await canvas.evaluate((node) => {
    const canvas = node as HTMLCanvasElement;

    return {
      width: canvas.width,
      height: canvas.height,
      dpr: window.devicePixelRatio,
    };
  });

  expect(before.width).toBeGreaterThan(0);
  expect(before.height).toBeGreaterThan(0);

  const box = await canvas.boundingBox();

  if (!box) {
    throw new Error("Could not find canvas bounding box");
  }

  const centerX = box.x + box.width / 2;
  const centerY = box.y + box.height / 2;
  const zoomCssPx = 80;

  await page.mouse.move(centerX - 2 * zoomCssPx, centerY);
  await page.mouse.down();
  await page.mouse.move(centerX - 1 * zoomCssPx, centerY - 1 * zoomCssPx);
  await page.mouse.up();

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
      const radius = 16;
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

    return {
      movedEndpointYellowishPixels: countPixelsNear(
        centerX - zoom,
        centerY - zoom,
        isYellowish,
      ),
      shiftedMidpointGreenishPixels: countPixelsNear(
        centerX + zoom / 2,
        centerY - zoom / 2,
        isGreenish,
      ),
    };
  });

  expect(result.movedEndpointYellowishPixels).toBeGreaterThan(0);
  expect(result.shiftedMidpointGreenishPixels).toBeGreaterThan(0);
});
