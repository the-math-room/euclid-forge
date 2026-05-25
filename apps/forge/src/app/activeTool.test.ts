import { describe, expect, test } from "vitest";

import {
  activeToolAcceptsCurveInput,
  activeToolAcceptsPointInput,
  activeToolInputCount,
  activeToolIsReadyToCommit,
  activeToolRequiredInputCount,
  activeToolStatusText,
  appendActiveToolInput,
  constructionTool,
  deleteTool,
  emptyActiveTool,
  pointTool,
  resetActiveToolInputs,
} from "./activeTool";

describe("app/activeTool", () => {
  test("starts in select mode", () => {
    const tool = emptyActiveTool();

    expect(tool).toEqual({ kind: "select" });
    expect(activeToolInputCount(tool)).toBe(0);
    expect(activeToolStatusText(tool)).toBe("Select or drag geometry.");
  });

  test("delete tool has delete status", () => {
    const tool = deleteTool();

    expect(activeToolRequiredInputCount(tool)).toBe(0);
    expect(activeToolIsReadyToCommit(tool)).toBe(false);
    expect(activeToolStatusText(tool)).toBe(
      "Delete tool: click or tap geometry to delete it.",
    );
  });

  test("point tool does not collect inputs", () => {
    const tool = pointTool();

    expect(activeToolRequiredInputCount(tool)).toBe(0);
    expect(activeToolIsReadyToCommit(tool)).toBe(false);
    expect(activeToolStatusText(tool)).toBe(
      "Point tool: click or tap empty canvas to create a point.",
    );
  });

  test("segment tool collects two distinct point inputs", () => {
    let tool = constructionTool("segment");

    expect(activeToolAcceptsPointInput(tool)).toBe(true);
    expect(activeToolAcceptsCurveInput(tool)).toBe(false);
    expect(activeToolStatusText(tool)).toBe(
      "Segment tool: choose point 1 of 2.",
    );

    tool = appendActiveToolInput(tool, "A");

    expect(activeToolInputCount(tool)).toBe(1);
    expect(activeToolIsReadyToCommit(tool)).toBe(false);
    expect(activeToolStatusText(tool)).toBe(
      "Segment tool: choose point 2 of 2.",
    );

    tool = appendActiveToolInput(tool, "A");

    expect(activeToolInputCount(tool)).toBe(1);

    tool = appendActiveToolInput(tool, "B");

    expect(activeToolInputCount(tool)).toBe(2);
    expect(activeToolIsReadyToCommit(tool)).toBe(true);
    expect(activeToolStatusText(tool)).toBe("Segment tool: ready.");
  });

  test("triangle tool requires three point inputs", () => {
    let tool = constructionTool("triangle");

    tool = appendActiveToolInput(tool, "A");
    tool = appendActiveToolInput(tool, "B");

    expect(activeToolIsReadyToCommit(tool)).toBe(false);
    expect(activeToolStatusText(tool)).toBe(
      "Triangle tool: choose point 3 of 3.",
    );

    tool = appendActiveToolInput(tool, "C");

    expect(activeToolIsReadyToCommit(tool)).toBe(true);
  });

  test("circle tool uses center then radius language", () => {
    let tool = constructionTool("circle");

    expect(activeToolStatusText(tool)).toBe(
      "Circle tool: choose the center point.",
    );

    tool = appendActiveToolInput(tool, "O");

    expect(activeToolStatusText(tool)).toBe(
      "Circle tool: choose a radius point.",
    );
  });

  test("intersection tool accepts curve inputs", () => {
    const tool = constructionTool("intersection");

    expect(activeToolAcceptsPointInput(tool)).toBe(false);
    expect(activeToolAcceptsCurveInput(tool)).toBe(true);
    expect(activeToolStatusText(tool)).toBe(
      "Intersection tool: choose curve 1 of 2.",
    );
  });

  test("reset clears construction inputs while keeping the active tool", () => {
    const tool = appendActiveToolInput(
      appendActiveToolInput(constructionTool("line"), "A"),
      "B",
    );

    expect(activeToolIsReadyToCommit(tool)).toBe(true);
    expect(resetActiveToolInputs(tool)).toEqual({
      kind: "line",
      inputs: [],
    });
  });
});
