# Architecture

Euclid Forge is a layered geometry editor with a growing headless core and one intentional cross-sectional geometry seam.

```txt
meaning
→ representation
→ evaluation
→ core
→ app
```

The boundary checker enforces import direction. The `geometry/` directory is the exception-by-design: it gathers per-geometry behavior while keeping the rest of the pipeline layered.

## Layer map

```txt
meaning/          pure math and denotational geometry helpers
representation/   construction syntax and graph validity
evaluation/       graph → evaluated geometry and diagnostics
core/             headless engine/workspace/view-state facade
rendering/        evaluated geometry → canvas pixels
interaction/      pure hit testing
geometry/         per-kind geometry definitions and registry dispatch
app/              browser shell, user intent, state/history/effects
```

## Boundary rules

The project-wide boundary checker includes `core/` as an explicit layer.

```txt
core may import:
  meaning
  representation
  evaluation

app may import:
  core
  meaning
  representation
  evaluation
  rendering
  interaction
  styles
```

Core must not import app, rendering, interaction, or styles. The browser app is a consumer of the headless core, not a dependency of it.

## meaning

Pure math. No graph, rendering, DOM, state, or app policy.

Examples:

```txt
Vec2
midpoint
centroid
lineIntersection
segmentIntersection
curve denotations
classified intersection candidates
```

Curve work is denotational: shapes should be interpretable as mathematical objects such as point sets, curves, implicit equations, domains, or parameterized carriers.

## representation

Construction syntax and graph validity.

Owns:

```txt
GeometryNode
Graph
GraphEdit
createGraph
applyGraphEdit
dependenciesOf / dependentsOf / transitiveDependentsOf
delete policy
thin construction wrappers
constructible point eligibility
constructible curve eligibility
```

The graph is the mathematical construction document. It is not view state. Derived geometry is not stored as independent coordinates in the graph.

### Constructible points vs editable points

```txt
FREE_POINT             constructible + directly draggable
MIDPOINT               constructible, not directly draggable
CENTROID               constructible, not directly draggable
SEGMENT_INTERSECTION   constructible when defined, not directly draggable
CURVE_INTERSECTION     constructible when defined, not directly draggable
```

### Constructible curves

Current constructible curve nodes:

```txt
SEGMENT
CIRCLE
```

The `I` command uses this vocabulary to accept two selected curve nodes.

## evaluation

Gives meaning to a validated graph.

```txt
Graph → EvaluatedScene
```

Evaluation derives geometry and does not mutate the graph. Evaluation is dispatched through the geometry registry.

Evaluated geometry carries two identities:

```txt
kind        evaluated shape class: POINT / SEGMENT / CIRCLE / TRIANGLE
sourceKind  source graph node kind: FREE_POINT / MIDPOINT / CENTROID / ...
```

## Diagnostics

Evaluation is partial. Some construction nodes are valid graph syntax but may be temporarily undefined for the current numeric configuration.

Diagnostics have this shape:

```ts
type EvaluationIssue = Readonly<{
  nodeId: NodeId;
  severity: "warning";
  code: EvaluationIssueCode;
  message: string;
}>;
```

Current diagnostic codes include:

```txt
MISSING_DEPENDENCY
NO_REAL_INTERSECTION
NO_UNIQUE_INTERSECTION
STALE_INTERSECTION_BRANCH
UNDEFINED_GEOMETRY
```

Dependents of omitted geometry are omitted too. The graph still remembers the construction; if dependencies become valid again, the geometry can reappear.

## Curve intersections

`CURVE_INTERSECTION` is the general persisted curve-intersection construction. It is point-valued and branch-specific:

```txt
curveA
curveB
branchKey
label
```

Evaluation maps source evaluated geometry into curve denotations, computes classified intersection candidates, and selects the candidate whose branch key matches the node. If the source curves no longer have that branch, the node is omitted and an evaluation diagnostic is recorded.

The `I` command currently preserves the older `SEGMENT_INTERSECTION` path for segment + segment selections. Segment + circle and circle + circle selections create `CURVE_INTERSECTION` nodes.

## core

The internal headless-core surface.

Core owns the engine-facing API:

```txt
src/core/index.ts
src/core/engine.ts
src/core/workspace.ts
src/core/viewState.ts
src/core/diagnostics.ts
src/core/fixtures/*
```

Core currently exposes:

```txt
createGeometryEngine
parseGeometryWorkspace
geometryWorkspaceFromJsonText
deserializeWorkspace
serializeWorkspace
diagnostic query helpers
graph/edit/evaluation/workspace types
```

The preferred consumer import is:

```ts
import {
  createGeometryEngine,
  geometryWorkspaceFromJsonText,
  diagnosticsWithCode,
} from "../core";
```

### Workspace ownership

Core owns workspace data semantics:

```txt
unknown object → validated workspace
JSON text → validated workspace
workspace state → serialized workspace
```

The app owns browser file I/O and adapts core workspace state into app editor state.

```txt
core/workspace.ts
  WorkspaceState = graph + viewState
  parse/serialize/JSON text parsing

app/workspace.ts
  deserializeWorkspace(...) → AppState compatibility adapter

app/workspaceFiles.ts
  browser file I/O and download helpers
```

### View-state ownership

Core owns `ViewState` and its pure helpers:

```txt
selection
hover
hidden nodes
viewport center / zoom / rotation
```

`app/viewState.ts` remains a compatibility re-export during the migration:

```ts
export * from "../core/viewState";
```

### Golden fixtures

Golden fixtures live in:

```txt
src/core/fixtures/
```

The core fixture runner validates workspace parsing, evaluation, diagnostics, expected evaluated IDs, and serialization round trips through the headless core facade.

## rendering

Draws evaluated geometry.

```txt
EvaluatedScene + Viewport + render options → canvas pixels
```

Render layer order:

```txt
AREA → LINEAR → POINT
```

## interaction

Pure hit testing. It does not mutate app state and does not know browser event effects.

Hit priority:

```txt
POINT → LINEAR → AREA
```

## geometry

The controlled cross-layer seam for shape-specific behavior.

A geometry definition may provide:

```txt
representation.dependencies
evaluation.evaluate
rendering.layer
rendering.render
interaction.hitClass
interaction.hitTest
interaction.bodyDrag.sourcePointIds
construction.factories
```

The core split does not yet physically split `geometry/`. If a future package extraction requires stricter separation, the likely direction is to divide this seam into core/evaluation, rendering, and interaction capabilities.

## app

Owns browser/user concerns:

```txt
AppState
drag state
history
commands
pointer intent
DOM bindings
workspace file picker/download effects
status effects
render scheduling
```

The app layer turns input into explicit transitions:

```txt
input + AppState → AppTransition
```

## Workspace files

Workspace serialization stores graph nodes and view state. Workspace parsing and serialization semantics live in `core/workspace.ts`. Browser file I/O lives in `app/workspaceFiles.ts`.

## Boundary rule

Follow the direction of the layer map. Use `geometry/` only for per-kind shape behavior. It is the respectful blur, not a license for arbitrary imports.
