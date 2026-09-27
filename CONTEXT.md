# Awesome Skills

A personal collection of reusable agent skills, with a distinction between keeping source material and using it in an agent.

## Language

**Skill**:
An independently selectable set of task instructions and its supporting resources.
_Avoid_: calling a whole series one skill.

**Series**:
A group retained under a recognizable upstream identity, such as Matt Pocock's collection.

**Domain collection**:
A group organized by an engineering concern, such as frontend, whose members can come from different authors.

**Snapshot**:
A preserved copy of selected upstream content at a fixed revision.
_Avoid_: using “installed” to mean “collected.”

**Installation**:
A copy of a selected skill placed where a target agent can discover it. It is separate from its source snapshot.

**Discovery**:
The target agent recognizing an installed skill as available for use.
_Avoid_: inferring discovery merely from a successful file copy.

**Runtime verification**:
Evidence that a skill or its dependency works for an actual task in a target environment.
_Avoid_: treating repository checks or discovery as proof of runtime behavior.

**Source record**:
The provenance of collected content: its upstream origin, fixed revision, and declared license or unresolved license status.
