# Living room in 3D

A 3D model and plan of the front living/dining room, built from four phone photos with the
[room-from-photos](https://github.com/SkylarKitchen/skills/tree/main/skills/design/room-from-photos) skill.

- `config.js`: the room itself (walls, openings, furniture, the three layouts, photo cameras). Edit this.
- `index.html` / `artifact.html`: the engine with `config.js` spliced in. Regenerate with
  `python3 <skill>/build.py rooms/living-room --artifact`.
- `photos/` is git-ignored. Put `p1-dining.jpg`, `p2-toward-family.jpg`, `p3-from-foyer.jpg` and `p4-corner.jpg` there to use the photo views.

Serve the folder over HTTP to view it (`python3 -m http.server`); opened from `file://` it falls back to drawn finishes.
