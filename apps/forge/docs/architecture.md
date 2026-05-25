# Architecture

Euclid Forge is a monorepo with a headless geometry core and a browser/editor application.

The physical layout may live in one repository, but the architectural dependency still points in one direction:

```txt
packages/core  →  headless geometry engine
apps/forge     →  browser/editor application that consumes core
```

`core` must never depend on `forge`. The monorepo exists to make coordinated work easier, not to make the engine aware of the app.

## Dependency rule

```txt
apps/forge may import packages/core
packages/core may not import apps/forge
```

The boundary checker should make this rule mechanical. A failing boundary check is an architectural failure, not a style warning.

## Intended monorepo map

```txt
packages/core/src/
  meaning/          pure math and denotational geometry helpers
  representation/   construction syntax, graph validity, graph edits
  evaluation/       graph → evaluated geometry and diagnostics
  geometry/         per-kind geometry definitions and registry dispatch
  core/             headless engine/workspace/view-state facade
  view/             viewport/view-state math that remains browser-independent

apps/forge/src/
  app/              browser shell, user intent, state/history/effects/tools
  interaction/      hit testing and pointer-facing geometry adapters
  rendering/        evaluated geometry → canvas pixels
  styles/           CSS and app presentation
```

## Boundary rules

### Core may own

```txt
math primitives
geometry denotations
graph representation
graph edits
construction helpers
dependency inspection
free-point planning
delete policy
evaluation
diagnostics
workspace parsing and serialization
headless view-state and viewport math
test fixtures for headless behavior
```

### Core must not own

```txt
DOM events
HTMLCanvasElement or CanvasRenderingContext2D
document or window access
keyboard shortcuts
pointer capture
file picker/download plumbing
status messages
render scheduling
CSS
browser-only app history policy
toolbar state
```

### Forge may own

```txt
keyboard shortcuts
pointer gestures
modal tools
DOM events
file picker/download plumbing
status messages
history grouping
render scheduling
canvas rendering
CSS
browser smoke tests
```

### Forge should consume Core through package boundaries

Prefer imports that make the dependency direction obvious:

```ts
import { evaluateGraph, applyGraphEdit } from "@euclid-forge/core";
```

Avoid reaching across the filesystem with relative paths from `apps/forge` into `packages/core`.

## Layer model inside Core

The headless package still has a layered architecture:

```txt
meaning
→ representation
→ evaluation
→ core facade
```

The `geometry/` directory remains an intentional cross-sectional seam. It gathers per-geometry behavior while keeping the rest of the pipeline layered.

## Forge app flow

The browser app remains an adapter around the headless core.

```txt
DOM event
→ app intent / command / modal tool
→ graph edit or view-state update
→ transition result
→ runtime effects/history/render request
→ evaluate graph
→ render evaluated scene
```

Current app-side seams:

```txt
appController.ts       pure-ish transition reducer
activeTool.ts          modal tool state and status text
activeToolPointer.ts   modal pointer behavior
commands.ts            keyboard command table and construction adapters
pointerIntent.ts       pointer input → semantic app intent
appRuntime.ts          mutable runtime shell
appTransition.ts       transition/effect types and constructors
transitionEffects.ts   DOM side effects for transitions
interaction/           hit testing
rendering/             canvas drawing
```

## Rendering and interaction rules

Rendering consumes evaluated geometry. It should not perform graph construction or decide mathematical validity.

Interaction may use evaluated geometry and graph metadata to answer app questions such as:

```txt
what did the pointer hit?
which selectable thing wins?
which free source points can move during body drag?
```

Interaction should not mutate the graph. Mutations should go through app commands/controller transitions and core graph edits.

## Modal tools

Modal tools are app-level ergonomics. They should be implemented as browser intent and app state, not as Core concepts.

The clean split is:

```txt
Core:  graph/id/construction/delete invariants
Forge: click/tap behavior, active tool state, status text, toolbar UI
```

For example, Core owns `planFreePoint(graph, point)`. Forge decides that an empty click in Segment mode should call it and append the planned id as the next segment input.

## Adding features across the monorepo

Use this rule of thumb:

```txt
If the behavior is mathematical or workspace-relevant, start in packages/core.
If the behavior is a browser gesture, visual treatment, or app effect, start in apps/forge.
```

A geometry-kind feature commonly touches both, but each side should keep its responsibility narrow.

## Hard-check expectations

The boundary checker should fail when:

```txt
packages/core imports apps/forge
packages/core imports app/, rendering/, interaction/, or styles/
packages/core references DOM/browser globals directly
apps/forge imports packages/core by fragile relative path
a local app layer imports against the intended app-side direction
```

## Design principle

The monorepo should reduce coordination cost. It should not reduce architectural pressure.

A correct change should feel easier because all code is nearby. An incorrect dependency should feel harder because the checks reject it immediately.
