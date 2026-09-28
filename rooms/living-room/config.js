var CONFIG = {
  title: 'Living room',
  subtitle: 'Front living and dining room, rebuilt from four photos',
  storageKey: 'mustangs-living-room-v1',
  accent: 0x1f4fd8, fill: 0xa6c0f6,
  view: 'se', look: 'colour',
  TEXTURES: 'textures/',
  PALETTE: {
    paint: [['Greige', 0xcdc8bb], ['Trim white', 0xf1efe9], ['Soft white', 0xe9e6de], ['Foyer grey', 0x8f8f86], ['Pale sage', 0xbcc2b1], ['Charcoal', 0x3e3f3d]],
    wood: [['Greige tile', 0xb8ab98], ['Espresso', 0x3b2a22], ['Walnut', 0x7a5a40], ['Light oak', 0xcfae86], ['Black', 0x2a2a2a]],
    fabric: [['Linen', 0xe2dbcd], ['Oatmeal', 0xcfc5b3], ['Charcoal', 0x55585a], ['Navy', 0x2f4468], ['Slate blue', 0x6f86a3], ['Blush', 0xd8a7a8], ['Plum', 0x7a5a78]],
    clay: [['Terracotta', 0xb8704a], ['White', 0xeeeeea]]
  },
  LOOKS: [
    {name: 'As painted', colors: {}},
    {name: 'Soft white', colors: {walls: 0xe9e6de}},
    {name: 'Pale sage', colors: {walls: 0xbcc2b1}}
  ],
  ROOM: {
    /* Plan top = the north wall with the bedroom door. The foyer with the front doors drops out of the bottom-right;
       the open north-west corner (from the end of the console wall to the bedroom-door column) leads to the family room and kitchen. */
    outline: [[20, 0], [210, 0], [210, 333], [102, 333], [102, 258], [0, 258], [0, 83]],
    height: 120, wall: 5,
    walls: 0xcdc8bb, floor: 0xb8ab98, trim: 0xf1efe9,
    boards: 6, boardsDir: 'x',
    openings: [
      {type: 'door', c: [42, 0], width: 32, hinge: 'left', swing: 'out'},
      {type: 'opening', c: [10, 41.5], width: 80, head: 100, clear: 36, label: 'Family room'},
      {type: 'opening', c: [0, 204], width: 32, head: 90, clear: 30, label: 'Hall'},
      {type: 'door', c: [102, 279], width: 30, hinge: 'right', swing: 'in'},
      {type: 'window', c: [140, 333], width: 64, sill: 2, head: 80, panes: 2}
    ],
    fixed: [],
    verify: [
      'Room about 17′-6″ × 21′-6″ (210 × 258 in) plus a 9′ × 6′-3″ foyer, from a four-photo camera solve scaled on the 80″ doors',
      'Opening to the family room / kitchen about 6′-4″ wide at the north end of the console wall',
      'Hall arch about 32″ wide, its south side about 38″ from the south-west corner',
      'Ceiling drawn flat at 10′; the real one is vaulted, with a plant ledge high on the east wall',
      'Front doors: a pair of glazed French doors (drawn as glass, 64″ wide); the arched transom above them is not drawn',
      'The dining pendant and the ceiling fan are not drawn'
    ]
  },
  ITEMS: {
    console:  {name: 'Console', type: 'media', w: 72, d: 20, h: 36, color: 0x3b2a22},
    purifier: {name: 'Air purifier', type: 'box', w: 12, d: 12, h: 25, color: 0xeeeeea, contact: 1},
    dogbed:   {name: 'Dog bed', type: 'petbed', w: 18, d: 18, h: 9, color: 0xd9b7ae, color2: 0xc98f63},
    rolls:    {name: 'Rolled rugs', type: 'box', w: 96, d: 14, h: 9, color: 0x7d8aa0},
    navyrug:  {name: 'Navy rug', type: 'rug', w: 120, d: 96, new: true, color: 0x42567a, color2: 0xd8d2c4,
               variants: [{label: '8 × 10'}, {label: '9 × 12', w: 144, d: 108}]},
    blushrug: {name: 'Blush rug', type: 'rug', w: 120, d: 96, new: true, color: 0xd9c9c3, color2: 0xa9707e,
               variants: [{label: '8 × 10'}, {label: '5 × 8', w: 96, d: 60}]},
    sofa:     {name: 'Sofa', type: 'sofa', w: 84, d: 38, h: 33, new: true, color: 0xcfc5b3, color2: 0xe2dbcd,
               variants: [{label: '84″'}, {label: '96″', w: 96}, {label: 'Loveseat', w: 64}]},
    chair1:   {name: 'Armchair', type: 'armchair', w: 32, d: 34, h: 32, new: true, color: 0x2f4468, color2: 0x2f4468},
    chair2:   {name: 'Armchair', type: 'armchair', w: 32, d: 34, h: 32, new: true, color: 0x2f4468, color2: 0x2f4468},
    coffee:   {name: 'Coffee table', type: 'table', w: 48, d: 26, h: 17, new: true, color: 0x7a5a40, color2: 0x2a2a2a},
    lamp:     {name: 'Floor lamp', type: 'floorlamp', w: 16, d: 16, h: 62, shade: 8, new: true, color: 0x2a2a2a, color2: 0xf1efe9},
    tv:       {name: 'TV console', type: 'media', w: 70, d: 16, h: 24, tv: 65, new: true, color: 0x7a5a40},
    plant:    {name: 'Plant', type: 'floorplant', w: 26, h: 64, heads: 3, new: true, color: 0xeeeeea},
    dining:   {name: 'Dining table', type: 'table', w: 64, d: 38, h: 30, new: true, color: 0x7a5a40, color2: 0x2a2a2a,
               variants: [{label: 'Seats 4'}, {label: 'Seats 6', w: 76}]},
    dc1:      {name: 'Dining chair', type: 'chair', w: 18, d: 20, h: 34, new: true, color: 0xe2dbcd},
    dc2:      {name: 'Dining chair', type: 'chair', w: 18, d: 20, h: 34, new: true, color: 0xe2dbcd},
    dc3:      {name: 'Dining chair', type: 'chair', w: 18, d: 20, h: 34, new: true, color: 0xe2dbcd},
    dc4:      {name: 'Dining chair', type: 'chair', w: 18, d: 20, h: 34, new: true, color: 0xe2dbcd}
  },
  LAYOUTS: [
    {name: 'As it is', note: 'The room today: the console on the west wall, the dog bed at its north end, the purifier by the bedroom door and the two rugs still rolled against the east wall. The dog bed sits right at the family-room opening, the one pinch point.',
     place: {console: [10, 137, 270], dogbed: [10, 92, 270], purifier: [70, 9, 0], rolls: [202, 60, 90]}},
    {name: 'Sofa on the east wall, dining under the pendant', note: 'The sofa backs onto the long blank east wall and faces two navy armchairs across the navy rug; the dining table sits under the pendant by the vent wall. A proper sitting room and dining room, but the walk from the front door to the family room runs between them, past the dog bed at the opening.',
     place: {console: [10, 137, 270], dogbed: [10, 92, 270], purifier: [70, 9, 0],
       navyrug: [138, 95, 90], sofa: [190, 95, 90], chair1: [90, 68, 270], chair2: [90, 122, 270], coffee: [140, 95, 90], lamp: [196, 40, 0],
       dining: [66, 212, 0], dc1: [48, 182, 0], dc2: [84, 182, 0], dc3: [48, 242, 180], dc4: [84, 242, 180]}},
    {name: 'Floating sofa facing a TV wall', note: 'A TV on the east wall with the sofa floating opposite on the blush rug, and the dining table kept under the pendant. It turns the room into a second den; the sofa’s back faces the console, so the walk to the family room goes behind it, past the dog bed.',
     place: {console: [10, 137, 270], dogbed: [10, 92, 270], purifier: [70, 9, 0],
       blushrug: [148, 110, 90], tv: [202, 110, 90], sofa: [106, 110, 270], coffee: [154, 110, 90], chair1: [154, 40, 180], plant: [192, 22, 0], lamp: [100, 56, 0],
       dining: [66, 212, 0], dc1: [48, 182, 0], dc2: [84, 182, 0], dc3: [48, 242, 180], dc4: [84, 242, 180]}}
  ],
  PHOTOS: [
    {src: 'photos/p1-dining.jpg', label: 'Toward the front door', at: [175, 46], h: 58, yaw: 218, pitch: -16.4, roll: -1.7, fov: 53},
    {src: 'photos/p2-toward-family.jpg', label: 'Toward the family room', at: [199, 216], h: 59, yaw: 315, pitch: -15.1, roll: 1.5, fov: 53},
    {src: 'photos/p3-from-foyer.jpg', label: 'From the foyer', at: [199, 322], h: 65, yaw: 327, pitch: -13.7, roll: 2.1, fov: 53},
    {src: 'photos/p4-corner.jpg', label: 'The north-east corner', at: [15, 251], h: 67, yaw: 30, pitch: -12.6, roll: -1.4, fov: 53}
  ]
};
