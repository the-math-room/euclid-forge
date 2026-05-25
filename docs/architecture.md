# Architecture

Euclid Forge is a layered geometry editor with one intentional cross-sectional seam.

```txt
meaning
→ representation
→ evaluation
→ rendering
→ interaction
→ app
```

The boundary checker enforces import direction. The `geometry/` directory is the exception-by-design: it gathers per-geometry behavior while keeping the rest of the pipeline layered.

## Layer map

```txt
meaning/          pure math and denotational geometry helpers
representation/   construction syntax and graph validity
evaluation/       graph → evaluated geometry
rendering/        evaluated geometry → canvas pixels
interaction/      pure hit testing
geometry/         per-kind geometry definitions and registry dispatch
app/              browser shell, user intent, state/history/effects
```

## `meaning/`

Pure math. No graph, rendering, DOM, state, or app policy.

Examples:

```txt
Vec2
midpoint
centroid
lineIntersection
segmentIntersection
classified intersection candidates
```

The intended direction for future curve work is denotational: shapes should be interpretable as mathematical objects such as point sets, curves, implicit equations, domains, or parameterized carriers. Intersection should be modeled as an operation over those denotations, not as a top-level explosion of shape-pair concepts.

Specialized numeric algorithms may exist in `meaning/`, but they should be organized by mathematical structure and capability when possible:

```txt
linear carrier
quadratic / conic carrier
domain filter
intersection classifier
```

The public result contract for intersections should remain shared:

```txt
0 candidates
1 SIMPLE candidate
1 TANGENT candidate
2+ candidates with branch identity
issue for undefined / degenerate cases
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
constructible point eligibility
```

The graph is the mathematical construction document. It is not view state. Derived geometry is not stored as independent coordinates in the graph.

Graph edits are the mutation vocabulary. Durable geometry/view operations should flow through explicit edits rather than ad hoc object mutation.

Delete policy is conservative:

```txt
delete selected nodes only when no unselected node depends on them
```

### Constructible points vs editable points

Do not conflate constructibility with direct editability.

```txt
FREE_POINT             constructible + directly draggable
MIDPOINT               constructible, not directly draggable
CENTROID               constructible, not directly draggable
SEGMENT_INTERSECTION   constructible when defined, not directly draggable
```

Construction predicates should use constructible point eligibility. Dragging logic should continue to require free source points.

## `evaluation/`

Gives meaning to a validated graph.

```txt
Graph → EvaluatedScene
```

Evaluation derives geometry and does not mutate the graph. Evaluation is dispatched through the geometry registry:

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

### Partial evaluation and issues

Evaluation is partial. Some construction nodes are valid graph syntax but may be temporarily undefined for the current numeric configuration.

Examples:

```txt
parallel segment intersection
coincident segment intersection
bounded segment intersection whose supporting lines cross outside the finite segments
dependent geometry whose input point is currently unavailable
```

Undefined geometry is omitted from `values` and `ordered`, and an `EvaluationIssue` is recorded. Dependents of omitted geometry are omitted too. The graph still remembers the construction; if dependencies become valid again, the geometry can reappear.

This keeps Euclid Forge in the dynamic-construction model rather than the constraint-solver model. A construction says how to compute an object when defined; it does not force source geometry to remain in a valid configuration.

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

Segments have hover and selected affordances. Selected segment visibility is important because segment-intersection construction requires exactly two selected segment nodes.

## `interaction/`

Pure hit testing. It does not mutate app state and does not know browser event effects.

Hit priority is deliberately different from render order:

```txt
POINT → LINEAR → AREA
```

Within a hit class, `zIndex` decides which candidate wins. Distance remains a tie-breaker for distance-bearing hits such as points and segments.

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

This is the place for per-shape behavior. Avoid reintroducing scattered switches for shape logic when the behavior belongs in a definition.

### Construction semantics

Boundary constructions and metric constructions are intentionally distinct:

```txt
J with two selected constructible points   → segment endpoint construction
J with three selected constructible points → triangle vertex/boundary construction
C with two selected constructible points   → circle center-through construction
I with two selected segment nodes          → bounded finite-segment intersection
```

Segment intersections are finite-segment intersections. If the supporting lines cross outside either segment, the intersection point is undefined. Parallel and coincident segment pairs are undefined for now.

Polygon construction is intentionally deferred. Four or more selected points need an ordering semantic: click order, explicit construction mode, or a geometric ordering rule.

### Body dragging

Body dragging is opt-in registry metadata, not a generic boolean.

```txt
interaction.bodyDrag.sourcePointIds(node, context)
```

Good examples:

```txt
triangle → [a, b, c] when all vertices are free points
circle   → [center, through] when both defining points are free
```

Midpoints, centroids, and segment intersections should not accidentally become draggable, because dragging them would require inverse constraint semantics.

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

## Pointer intent model

Pointer interpretation is intentionally small:

```txt
shift-click → generic selection hit testing
free point hit → direct free-point drag
draggable area body hit → BODY drag
empty canvas → add free point
```

Free-point drag has priority over area body drag.

## Selection and command predicates

Command eligibility helpers live outside the command table. The command table should stay easy to scan:

```txt
key(s)
disabled reason
run behavior
```

Selection predicates answer questions such as:

```txt
are exactly two constructible points selected?
are exactly three constructible points selected?
are exactly two segment nodes selected?
is exactly one triangle selected?
```

## Visibility

View state stores explicit hidden node IDs. Effective visibility includes transitive dependents:

```txt
hidden source → dependent constructions are effectively hidden
```

## Z-order

Nodes may carry `zIndex`.

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

## History

History stores graph and view snapshots. Hover and drag state are transient and should not be persisted in snapshots.

Durable user changes commit history. Viewport motion and hover usually ignore history. Completed drags commit history.

## Workspace files

Workspace serialization stores graph nodes and view state. Workspace parsing is intentionally shallow. Graph validity remains delegated to `createGraph`.

## Boundary rule

Follow the direction of the layer map. Use `geometry/` only for per-kind shape behavior. It is the respectful blur, not a license for arbitrary imports.
