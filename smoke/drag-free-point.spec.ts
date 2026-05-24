import { expect, test } from "@playwright/test";

test("drags a triangle vertex and updates triangle constructions", async ({
  page,
}) => {
  await page.goto("/");

  const canvas = page.locator("#geometry-canvas");

  await expect(canvas).toBeVisible();

  const box = await canvas.boundingBox();

  if (!box) {
    throw new Error("Could not find canvas bounding box");
  }

  const centerX = box.x + box.width / 2;
  const centerY = box.y + box.height / 2;
  const zoomCssPx = 80;

  // Drag A from (-2, -1) to (-3, 1).
  await page.mouse.move(centerX - 2 * zoomCssPx, centerY + 1 * zoomCssPx);
  await page.mouse.down();
  await page.mouse.move(centerX - 3 * zoomCssPx, centerY - 1 * zoomCssPx);
  await page.mouse.up();

  await page.evaluate(
    () =>
      new Promise<void>((resolve) => {
        requestAnimationFrame(() => {
          resolve();
        });
      }),
  );

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
      const radius = 18;
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
      movedA: countPixelsNear(centerX - 3 * zoom, centerY - 1 * zoom, isYellowish),
      shiftedMidpoint: countPixelsNear(
        centerX - 0.5 * zoom,
        centerY,
        isGreenish,
      ),
      shiftedCentroid: countPixelsNear(
        centerX - (1 / 3) * zoom,
        centerY - (2 / 3) * zoom,
        isGreenish,
      ),
    };
  });

  expect(result.movedA).toBeGreaterThan(0);
  expect(result.shiftedMidpoint).toBeGreaterThan(0);
  expect(result.shiftedCentroid).toBeGreaterThan(0);
});
