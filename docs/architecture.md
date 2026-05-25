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
curve denotations
classified intersection candidates
```

Curve work is denotational: shapes should be interpretable as mathematical
objects such as point sets, curves, implicit equations, domains, or parameterized
carriers. Intersection is modeled as an operation over those denotations, not as
a top-level explosion of shape-pair concepts.

Specialized numeric algorithms may exist in `meaning/`, but they should be
organized by mathematical structure and capability when possible:

```txt
linear carrier
quadratic / conic carrier
domain filter
intersection classifier
```

rather than by app-level pairs such as:

```txt
segment-circle
circle-circle
circle-parabola
parabola-parabola
```

The public result contract for intersections is shared:

```txt
candidate point
multiplicity: SIMPLE | TANGENT
branchKey
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
constructible curve eligibility
```

The graph is the mathematical construction document. It is not view state.
Derived geometry is not stored as independent coordinates in the graph.

Graph edits are the mutation vocabulary. Durable geometry/view operations should
flow through explicit edits rather than ad hoc object mutation.

Delete policy is conservative:

```txt
delete selected nodes only when no unselected node depends on them
```

Blocked deletes produce a reason. The app layer may show that reason, but
representation owns the dependency rule.

### Constructible points vs editable points

Do not conflate constructibility with direct editability.

```txt
FREE_POINT             constructible + directly draggable
MIDPOINT               constructible, not directly draggable
CENTROID               constructible, not directly draggable
SEGMENT_INTERSECTION   constructible when defined, not directly draggable
CURVE_INTERSECTION     constructible when defined, not directly draggable
```

Construction predicates should use constructible point eligibility. Dragging
logic should continue to require free points or registry-declared free source
points.

### Constructible curves

Curve-valued construction inputs are separate from point-valued construction
inputs.

Current constructible curve nodes:

```txt
SEGMENT
CIRCLE
```

The `I` command uses this vocabulary to accept two selected curve nodes.

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
getGeometry(id)
getPoint(id)
getSegment(id)
getTriangle(id)
```

### Curve intersection facade

App code should not import `geometry/` directly. When app-level behavior needs
curve candidates, it goes through an evaluation-layer facade:

```txt
app/commands
→ evaluation/curveIntersectionCandidates
→ geometry/curveIntersectionCandidates
→ meaning/intersectCurves
```

This keeps the boundary rule intact while still allowing commands to use the
currently evaluated scene.

### Curve intersections

`CURVE_INTERSECTION` is the general persisted curve-intersection construction.
It is point-valued and branch-specific:

```txt
curveA
curveB
branchKey
label
```

Evaluation maps source evaluated geometry into curve denotations, computes
classified intersection candidates, and selects the candidate whose branch key
matches the node. If the source curves no longer have that branch, the node is
omitted and an evaluation issue is recorded.

The `I` command currently preserves the older `SEGMENT_INTERSECTION` path for
segment + segment selections. Segment + circle and circle + circle selections
create `CURVE_INTERSECTION` nodes.

Generated curve-intersection IDs are descriptive and branch-stable, while labels
are human-scale (`X1`, `X2`, ...).

### Partial evaluation and issues

Evaluation is partial. Some construction nodes are valid graph syntax but may be
temporarily undefined for the current numeric configuration.

Examples:

```txt
parallel segment intersection
coincident segment intersection
bounded segment intersection whose supporting lines cross outside the finite segments
curve intersection branch whose source curves no longer intersect
dependent geometry whose input point is currently unavailable
```

Undefined geometry is omitted from `values` and `ordered`, and an
`EvaluationIssue` is recorded. Dependents of omitted geometry are omitted too.
The graph still remembers the construction; if dependencies become valid again,
the geometry can reappear.

This keeps Euclid Forge in the dynamic-construction model rather than the
constraint-solver model. A construction says how to compute an object when
defined; it does not force source geometry to remain in a valid configuration.

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

## Construction semantics

Shape definitions can expose construction factories for single-shape
constructions.

Boundary constructions and metric constructions are intentionally distinct:

```txt
J with two selected constructible points   → segment endpoint construction
J with three selected constructible points → triangle vertex/boundary construction
C with two selected constructible points   → circle center-through construction
I with two selected curve nodes            → curve intersection construction
```

Segment and triangle construction share selected-constructible-point tuple
mechanics. Circle remains separate because its two points are interpreted
asymmetrically as center and through point.

Segment intersections are finite-segment intersections. If the supporting lines
cross outside either segment, the intersection point is undefined. Parallel and
coincident segment pairs are undefined for now.

`CURVE_INTERSECTION` avoids adding one graph kind per curve pair. Segment +
circle and circle + circle use the same graph representation with different
branch keys.

Polygon construction is intentionally deferred. Four or more selected points need
an ordering semantic: click order, explicit construction mode, or a geometric
ordering rule. A plain selected set is not enough.

## Body dragging

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
body drag metadata. Midpoints, centroids, and intersection points should not
accidentally become draggable, because dragging them would require inverse
constraint semantics.

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
draggable area body hit → body drag
empty canvas → add free point
```

Free-point drag has priority over area body drag. Area body drag uses the
topmost draggable area candidate according to `zIndex` within the `AREA` hit
class.

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
are exactly two constructible points selected?
are exactly three constructible points selected?
are exactly two constructible curve nodes selected?
is exactly one triangle selected?
```

The join command uses the shared selected-constructible-point tuple helper:

```txt
2 selected constructible points → segment
3 selected constructible points → triangle
```

Circle construction also consumes two selected constructible points, but it keeps
a separate semantic wrapper because those IDs mean center and through point.

The intersection command uses selected constructible curves:

```txt
2 selected curve nodes → intersection construction
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

User-facing commands:

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
metadata such as `zIndex`, branch keys, and labels, workspace save/open naturally
preserves that metadata when present.

Workspace parsing is intentionally shallow. Graph validity remains delegated to
`createGraph`.

## Boundary rule

Follow the direction of the layer map. Use `geometry/` only for per-kind shape
behavior. It is the respectful blur, not a license for arbitrary imports.
