import type { SerializedWorkspace } from "../app/workspace";
import { parseSerializedWorkspace } from "../app/workspace";
import { workspaceFromJsonText } from "../app/workspaceFiles";

export type GeometryWorkspace = SerializedWorkspace;

export function parseGeometryWorkspace(value: unknown): GeometryWorkspace {
  return parseSerializedWorkspace(value);
}

export function geometryWorkspaceFromJsonText(text: string): GeometryWorkspace {
  return workspaceFromJsonText(text);
}
