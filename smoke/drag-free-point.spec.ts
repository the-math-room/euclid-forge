import { expect, test } from "@playwright/test";
import {
  clickWorld,
  dragWorld,
  expectBluePointNear,
  expectGreenPointNear,
  expectLightEdgeNear,
  expectNoYellowPointNear,
  expectYellowPointNear,
  getCanvasFrame,
  shiftClickWorld,
  waitForAnimationFrame,
} from "./helpers/canvas";

test("drags a triangle vertex and updates triangle constructions", async ({
  page,
}) => {
  await page.goto("/");

  const frame = await getCanvasFrame(page);

  await dragWorld(page, frame, { x: -2, y: -1 }, { x: -3, y: 1 });
  await waitForAnimationFrame(page);

  await expectYellowPointNear(frame.canvas, { x: -3, y: 1 });
  await expectGreenPointNear(frame.canvas, { x: -0.5, y: 0 });
  await expectBluePointNear(frame.canvas, { x: -1 / 3, y: 2 / 3 });
});

test("drags the triangle body and translates its derived constructions", async ({
  page,
}) => {
  await page.goto("/");

  const frame = await getCanvasFrame(page);

  await dragWorld(page, frame, { x: 0, y: 0 }, { x: 1, y: 0.5 });
  await waitForAnimationFrame(page);

  await expectYellowPointNear(frame.canvas, { x: -1, y: -0.5 });
  await expectYellowPointNear(frame.canvas, { x: 3, y: -0.5 });
  await expectYellowPointNear(frame.canvas, { x: 1, y: 2.5 });
  await expectGreenPointNear(frame.canvas, { x: 1, y: -0.5 });
  await expectBluePointNear(frame.canvas, { x: 1, y: 0.5 });
});

test("clicks empty canvas to add a new draggable free point", async ({
  page,
}) => {
  await page.goto("/");

  const frame = await getCanvasFrame(page);

  await clickWorld(page, frame, { x: 3, y: 2 });
  await waitForAnimationFrame(page);

  await expectYellowPointNear(frame.canvas, { x: 3, y: 2 });

  await dragWorld(page, frame, { x: 3, y: 2 }, { x: 2, y: 2 });
  await waitForAnimationFrame(page);

  await expectYellowPointNear(frame.canvas, { x: 2, y: 2 });
});

test("shift-selects three free points and creates a triangle with T", async ({
  page,
}) => {
  await page.goto("/");

  const frame = await getCanvasFrame(page);

  const p1 = { x: 3, y: 2 };
  const p2 = { x: 4, y: 2 };
  const p3 = { x: 3, y: 3 };

  await clickWorld(page, frame, p1);
  await waitForAnimationFrame(page);

  await clickWorld(page, frame, p2);
  await waitForAnimationFrame(page);

  await clickWorld(page, frame, p3);
  await waitForAnimationFrame(page);

  await shiftClickWorld(page, frame, p1);
  await waitForAnimationFrame(page);

  await shiftClickWorld(page, frame, p2);
  await waitForAnimationFrame(page);

  await shiftClickWorld(page, frame, p3);
  await waitForAnimationFrame(page);

  await page.keyboard.press("T");
  await waitForAnimationFrame(page);

  await expectLightEdgeNear(frame.canvas, { x: 3.5, y: 2 });
  await expectLightEdgeNear(frame.canvas, { x: 3.5, y: 2.5 });
  await expectLightEdgeNear(frame.canvas, { x: 3, y: 2.5 });
});

test("blocked delete shows a status message and keeps geometry", async ({
  page,
}) => {
  await page.goto("/");

  const frame = await getCanvasFrame(page);

  await shiftClickWorld(page, frame, { x: -2, y: -1 });
  await waitForAnimationFrame(page);

  await page.keyboard.press("Delete");
  await waitForAnimationFrame(page);

  const status = page.locator("#status-message");

  await expect(status).toBeVisible();
  await expect(status).toContainText("Cannot delete A");
  await expect(status).toContainText("depends on it");

  await expectYellowPointNear(frame.canvas, { x: -2, y: -1 });
});

test("deletes an isolated point and undo restores it", async ({ page }) => {
  await page.goto("/");

  let frame = await getCanvasFrame(page);

  await clickWorld(page, frame, { x: 4, y: 3 });
  await waitForAnimationFrame(page);

  frame = await getCanvasFrame(page);

  await expectYellowPointNear(frame.canvas, { x: 4, y: 3 });

  await shiftClickWorld(page, frame, { x: 4, y: 3 });
  await waitForAnimationFrame(page);

  await page.keyboard.press("Delete");
  await waitForAnimationFrame(page);

  await expectNoYellowPointNear(frame.canvas, { x: 4, y: 3 });

  await page.keyboard.press(process.platform === "darwin" ? "Meta+Z" : "Control+Z");
  await waitForAnimationFrame(page);

  await expectYellowPointNear(frame.canvas, { x: 4, y: 3 });
});

