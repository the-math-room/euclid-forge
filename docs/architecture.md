# Architecture

Euclid Forge is a layered geometry editor with one intentional cross-sectional
seam.

```txt
meaning
→ representation
→ evaluation
→ rendering
→ interaction
→ app
```

The boundary checker enforces import direction. The `geometry/` directory is the
exception-by-design: it gathers per-geometry behavior while keeping the rest of
the pipeline layered.

## Layer map

```txt
meaning/          pure math
representation/   construction syntax and graph validity
evaluation/       graph → evaluated geometry
rendering/        evaluated geometry → canvas pixels
interaction/      pure hit testing
geometry/         per-kind geometry definitions and registry dispatch
app/              browser shell, user intent, state/history/effects
styles/           CSS
```

## `meaning/`

Pure math. No graph, rendering, DOM, state, or app policy.

Examples:

```txt
Vec2
midpoint
centroid
deltaBetween
```

## `representation/`

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
```

The graph is the mathematical construction document. It is not view state.
Derived geometry is not stored as independent coordinates in the graph.

Graph edits are the mutation vocabulary. Durable geometry/view operations should
flow through explicit edits rather than ad hoc object mutation. Current edit
families include adding nodes, moving free points, setting batches of free-point
positions, deleting nodes, and updating node z-index values.

Delete policy is conservative:

```txt
delete selected nodes only when no unselected node depends on them
```

Blocked deletes produce a reason. The app layer may show that reason, but
representation owns the dependency rule.

## `evaluation/`

Gives meaning to a validated graph.

```txt
Graph → EvaluatedScene
```

Evaluation derives geometry and does not mutate the graph. Evaluation is
dispatched through the geometry registry:

```txt
evaluateGraph
→ evaluateGeometryNode
→ geometry definition evaluation section
```

Evaluated geometry carries two identities:

```txt
kind        evaluated shape class: POINT / SEGMENT / CIRCLE / TRIANGLE
sourceKind  source graph node kind: FREE_POINT / MIDPOINT / CENTROID / ...
```

`sourceKind` lets the registry dispatch rendering and interaction behavior
without reverse-inferring graph kind from evaluated shape and point role.

The evaluation context exposes safe dependency accessors:

```txt
getPoint(id)
getSegment(id)
getTriangle(id)
```

## `rendering/`

Draws evaluated geometry.

```txt
EvaluatedScene + Viewport + render options → canvas pixels
```

Rendering is registry-dispatched through `renderGeometryValue`.

Render layer order is centralized and deliberate:

```txt
AREA → LINEAR → POINT
```

`zIndex` breaks ties within a render layer. It does not move points below areas
or areas above points; it only orders geometry that shares the same layer.

## `interaction/`

Pure hit testing. It does not mutate app state and does not know browser event
effects.

Hit priority is deliberately different from render order:

```txt
POINT → LINEAR → AREA
```

That means a point remains easy to grab even when it sits inside a high-z area.

Within a hit class, `zIndex` decides which candidate wins. Distance remains a
tie-breaker for distance-bearing hits such as points and segments.

Generic selection hit testing uses the registry. A geometry definition that
declares an interaction hit test participates automatically in selection.

## `geometry/`

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

This is the place for per-shape behavior. Avoid reintroducing scattered switches
for shape logic when the behavior belongs in a definition.

The core unions remain closed for now:

```txt
GeometryNode
EvaluatedGeometry
```

The registry is not a plugin system. It is a central dispatch table with strong
TypeScript coverage.

### Body dragging

Body dragging is opt-in registry metadata, not a generic boolean.

A definition may declare:

```txt
interaction.bodyDrag.sourcePointIds(node, context)
```

The returned IDs are the free source points that can be translated to preserve
the represented shape under body dragging.

Examples:

```txt
triangle → [a, b, c] when all vertices are free points
circle   → [center, through] when both defining points are free
```

If a shape cannot provide a principled free-source translation, it should omit
body drag metadata. Midpoints and centroids should not accidentally become
draggable, because dragging them would require inverse constraint semantics.

## `app/`

Owns browser/user concerns:

```txt
state
view state
history
commands
pointer intent
DOM bindings
workspace save/open
status effects
pointer capture effects
```

The app layer turns input into explicit transitions:

```txt
input + AppState → AppTransition
```

App transitions describe:

```txt
next state
render request
preventDefault
history policy
effects
```

Effects stay explicit so controller logic remains testable.

## Pointer intent model

Pointer interpretation is intentionally small:

```txt
shift-click → generic selection hit testing
free point hit → direct free-point drag
draggable area body hit → BODY drag
empty canvas → add free point
```

Free-point drag has priority over area body drag. Area body drag uses the
topmost draggable area candidate according to `zIndex` within the `AREA` hit
class.

The app controller does not need to know whether a body drag is a triangle or a
circle. It receives source point IDs and applies the generic free-point position
translation path.

## Selection and command predicates

Command eligibility helpers live outside the command table. The command table
should stay easy to scan:

```txt
key(s)
disabled reason
run behavior
```

Selection predicates answer questions such as:

```txt
are exactly two free points selected?
are exactly three free points selected?
is exactly one triangle selected?
```

## Visibility

View state stores explicit hidden node IDs.

Effective visibility includes transitive dependents:

```txt
hidden source → dependent constructions are effectively hidden
```

Rendering and interaction should use effective hidden IDs so invisible dependent
geometry is not accidentally interactive.

## Z-order

Nodes may carry `zIndex`.

`zIndex` is user-editable through commands:

```txt
PageUp              bring selected forward
PageDown            send selected backward
Shift+PageUp        bring selected to front
Shift+PageDown      send selected to back
```

Z-order is scoped by existing layer/class priority:

```txt
render: AREA → LINEAR → POINT, then zIndex within each layer
hit:    POINT → LINEAR → AREA, then zIndex within each class
```

This keeps direct point interaction reliable while making overlapping areas and
same-class geometry deterministic and user-controllable.

## History

History stores graph and view snapshots. Hover and drag state are transient and
should not be persisted in snapshots.

Durable user changes commit history. Viewport motion and hover usually ignore
history. Completed drags commit history.

## Workspace files

Workspace serialization stores graph nodes and view state. Since nodes carry
metadata such as `zIndex`, workspace save/open naturally preserves that metadata
when present.

Workspace parsing is intentionally shallow. Graph validity remains delegated to
`createGraph`.

## Boundary rule

Follow the direction of the layer map. Use `geometry/` only for per-kind shape
behavior. It is the respectful blur, not a license for arbitrary imports.
