/** A complete double-pitched tiled roof shelters the open-fronted tea room. */
export function buildArchitecture(ctx) {
  const { THREE, scene, mat, box, cyl, sphere, beam, line, text, wood, stone, wall } = ctx;
  const group = new THREE.Group();
  group.name = '听雨小筑 · 白墙黛瓦与回廊';
  scene.add(group);
  const dynamic = [], dripSources = [], glassPanes = [], pendants = [];
  const timber = wood || mat('#72503b');
  const oldTimber = mat('#4d3c32');
  const goldenWood = mat('#99734e');
  const paleWood = mat('#b19872');
  const plaster = wall || mat('#d8d9ce');
  const foundation = stone || mat('#788987');
  const edgeStone = mat('#9aa59b');
  const darkStone = mat('#465b5c');
  const tiles = ['#354b51', '#3b5358', '#466064', '#40585d'].map(c => mat(c));
  const roofCut = mat('#6c6656');
  const bronze = mat('#8e815c', { emissive: '#8f7745', emissiveIntensity: .035 });
  const ink = new THREE.LineBasicMaterial({ color: '#213738', transparent: true, opacity: .6 });
  const glass = new THREE.MeshPhysicalMaterial({ color: '#c4e5df', transparent: true, opacity: .12, roughness: .16, metalness: .08, side: THREE.DoubleSide, depthWrite: false });

  function mesh(geometry, material, name, parent = group, outline = false) {
    const result = new THREE.Mesh(geometry, material);
    result.name = name;
    result.castShadow = true;
    result.receiveShadow = true;
    parent.add(result);
    if (outline) result.add(new THREE.LineSegments(new THREE.EdgesGeometry(geometry, 28), ink));
    return result;
  }

  function curvedBeam(points, radius, material, parent = group) {
    return mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points.map(p => new THREE.Vector3(...p))), 16, radius, 6, false), material, '弯曲的木构与瓦脊', parent);
  }

  // Main house: its porch is raised above the open, rain-soaked courtyard.
  box(8.35, .26, 4.26, 0, .32, -2.98, foundation, group);
  box(8.08, .11, 4.04, 0, .465, -3.01, timber, group);
  for (let x = -3.95; x < 4; x += .27) {
    line([[x, .524, -4.98], [x, .524, -1.02]], '#6e5140', group);
  }
  box(7.94, .12, .18, 0, .56, -.95, oldTimber, group);
  box(7.84, 2.84, .16, 0, 1.97, -4.93, plaster, group);
  box(7.88, .23, .21, 0, .72, -4.91, darkStone, group);
  box(7.94, .17, .21, 0, 3.34, -4.92, oldTimber, group);
  for (const x of [-3.86, 3.86]) {
    box(.16, 2.81, .69, x, 1.98, -4.59, plaster, group);
    box(.19, .25, 3.75, x, .73, -3.01, darkStone, group);
    box(.18, .31, 3.74, x, 3.23, -3.0, plaster, group);
    box(.16, 1.65, .36, x, 1.9, -1.23, plaster, group);
  }
  // Two broad side windows make even the far side of the room readable.
  for (const side of [-1, 1]) {
    const x = side * 3.874;
    windowPanel(x, 1.94, -3.04, 2.44, 1.67, side * Math.PI / 2, true);
    box(.21, .09, 2.61, x, 1.075, -3.04, goldenWood, group);
  }
  // The inner posts frame the central tea room without closing it off.
  for (const x of [-3.74, -1.94, 1.94, 3.74]) {
    const post = cyl(.072, .088, 2.77, x, 1.94, -1.07, timber, group, 12);
    post.name = '榫卯廊柱';
    cyl(.14, .17, .17, x, .605, -1.07, edgeStone, group, 12);
    box(.31, .09, .28, x, 3.1, -1.07, goldenWood, group);
    beam([x, 2.84, -1.07], [x + (x < 0 ? .34 : -.34), 3.16, -1.07], .043, timber, group);
  }
  box(7.86, .19, .18, 0, 3.19, -1.07, timber, group);
  box(7.92, .10, .16, 0, 2.99, -1.055, goldenWood, group);
  for (const x of [-2.88, 2.88]) {
    const leaves = new THREE.Group();
    leaves.name = '半开的透光木格门';
    leaves.position.set(x, .58, -1.03);
    leaves.rotation.y = x < 0 ? -.36 : .36;
    group.add(leaves);
    for (const localX of [-.37, .37]) {
      doorLeaf(localX, 1.18, 0, .70, 2.36, leaves);
    }
  }
  // A very narrow transom over the large central opening.
  for (let x = -1.73; x < 1.79; x += .24) {
    box(.027, .22, .042, x, 2.89, -1.04, timber, group, false);
  }
  box(1.57, .36, .09, 0, 3.18, -.94, oldTimber, group);
  box(1.48, .27, .015, 0, 3.18, -.885, mat('#304d48'), group, false);
  text('听 雨 小 筑', 1.34, .23, 0, 3.18, -.867, { color: '#ddc78b', font: '600 72px "STKaiti", "KaiTi", "SimSun", serif' }, group);
  for (const x of [-1.94, 1.94]) {
    text((x < 0 ? '一庭烟雨润春色' : '半盏清茶待故人').split('').join('\n'), .12, 1.57, x, 1.97, -.969, { color: '#d5bd83', font: '72px "KaiTi", serif' }, group);
  }
  // Flared stone stairs, worn and pale along the tread edges.
  box(3.24, .17, .72, 0, .25, -.39, foundation, group);
  box(2.97, .16, .62, 0, .355, -.68, foundation, group);
  box(2.78, .12, .38, 0, .46, -.89, edgeStone, group);
  for (const [w, y, z] of [[3.24, .341, -.045], [2.97, .442, -.375], [2.78, .526, -.705]]) {
    line([[-w / 2 + .05, y, z], [w / 2 - .05, y, z]], '#b0b8a9', group);
  }

  function windowPanel(x, y, z, w, h, rotationY = 0, glazed = false) {
    const panel = new THREE.Group();
    panel.name = glazed ? '透光格栅窗' : '回纹漏窗';
    panel.position.set(x, y, z);
    panel.rotation.y = rotationY;
    group.add(panel);
    for (const sx of [-1, 1]) box(.075, h + .13, .08, sx * (w / 2 + .018), 0, 0, timber, panel);
    for (const sy of [-1, 1]) box(w + .17, .075, .08, 0, sy * (h / 2 + .02), 0, timber, panel);
    for (let xx = -w / 2 + .19; xx < w / 2; xx += .235) box(.026, h, .034, xx, 0, .02, goldenWood, panel, false);
    for (const yy of [-h * .28, 0, h * .28]) box(w, .027, .034, 0, yy, .026, goldenWood, panel, false);
    for (let xx = -w / 2 + .235; xx < w / 2 - .05; xx += .47) {
      line([[xx - .15, 0, .048], [xx, .19, .048], [xx + .15, 0, .048], [xx, -.19, .048], [xx - .15, 0, .048]], '#a28c65', panel);
    }
    if (glazed) {
      const pane = mesh(new THREE.PlaneGeometry(w, h), glass, '玻璃窗片', panel);
      pane.position.z = -.018;
      glassPanes.push({ x, y, z, w, h, rotationY });
    }
    return panel;
  }

  function doorLeaf(x, y, z, w, h, parent) {
    // The lattice is constructed around a transparent opening, not painted on a solid door.
    for (const sx of [-1, 1]) box(.052, h, .062, x + sx * (w / 2 - .026), y, z, timber, parent);
    for (const yy of [y - h / 2 + .04, y - .45, y + h / 2 - .04]) box(w, .075, .066, x, yy, z, timber, parent);
    box(w - .10, .63, .042, x, y - .83, z, mat('#806143'), parent);
    box(w - .22, .44, .047, x, y - .83, z + .01, goldenWood, parent);
    for (let xx = x - w / 2 + .15; xx < x + w / 2 - .07; xx += .17) box(.022, 1.53, .033, xx, y + .34, z + .014, timber, parent, false);
    for (const yy of [y - .16, y + .32, y + .80]) box(w - .07, .024, .032, x, yy, z + .025, timber, parent, false);
    const pane = mesh(new THREE.PlaneGeometry(w - .10, 1.50), glass, '门扇玻璃', parent);
    pane.position.set(x, y + .33, z - .012);
    const handle = mesh(new THREE.TorusGeometry(.055, .008, 6, 16), bronze, '黄铜门环', parent);
    handle.position.set(x + .13, y - .38, z + .047);
  }

  // Both roof slopes are completely covered with overlapping curved tiles.
  function roof(cx, cz, halfW, halfD, ridgeY, drop, axis = 'x') {
    const toWorld = (a, b, offset = 0) => {
      const f = Math.abs(b) / halfD;
      const yy = ridgeY - drop * Math.pow(f, .86) + .27 * Math.pow(f, 8) + .16 * Math.pow(Math.abs(a) / halfW, 8) + offset;
      return axis === 'x' ? [cx + a, yy, cz + b] : [cx + b, yy, cz + a];
    };
    const surfaces = [
      [-halfW, halfW, -halfD, 0],
      [-halfW, halfW, 0, halfD]
    ];
    function quad(a0, a1, b0, b1, material, offset, barrel = false) {
      const verts = [], indices = [];
      const nx = barrel ? 4 : Math.max(2, Math.ceil((a1 - a0) / .30)), nz = barrel ? 2 : 12;
      for (let j = 0; j <= nz; j++) {
        for (let i = 0; i <= nx; i++) {
          const u = i / nx, v = j / nz;
          const p = toWorld(a0 + (a1 - a0) * u, b0 + (b1 - b0) * v, offset + (barrel ? Math.sin(u * Math.PI) * .035 : 0));
          verts.push(...p);
        }
      }
      for (let j = 0; j < nz; j++) for (let i = 0; i < nx; i++) {
        const k = j * (nx + 1) + i;
        if (b1 > b0) indices.push(k, k + nx + 1, k + 1, k + 1, k + nx + 1, k + nx + 2);
        else indices.push(k, k + 1, k + nx + 1, k + 1, k + nx + 2, k + nx + 1);
      }
      // Surface orientation differs when ridge direction is rotated by 90 degrees.
      if (axis === 'z') for (let i = 0; i < indices.length; i += 3) [indices[i + 1], indices[i + 2]] = [indices[i + 2], indices[i + 1]];
      const geometry = new THREE.BufferGeometry();
      geometry.setAttribute('position', new THREE.Float32BufferAttribute(verts, 3));
      geometry.setIndex(indices);
      geometry.computeVertexNormals();
      return mesh(geometry, material, barrel ? '层叠青瓦' : '完整屋顶望板', group);
    }
    for (const [a0, a1, b0, b1] of surfaces) {
      quad(a0, a1, b0, b1, roofCut, -.10);
      quad(a0, a1, b0, b1, tiles[0], -.018);
      const cols = Math.max(1, Math.round((a1 - a0) / .20));
      const rows = Math.max(1, Math.round(Math.abs(b1 - b0) / .34));
      for (let i = 0; i < cols; i++) for (let j = 0; j < rows; j++) {
        const aa = a0 + i / cols * (a1 - a0), ab = a0 + (i + 1) / cols * (a1 - a0);
        const ba = b0 + j / rows * (b1 - b0), bb = b0 + (j + 1.10) / rows * (b1 - b0);
        quad(aa, ab, ba, Math.min(b1, bb), tiles[(i * 3 + j) % tiles.length], .022, true);
      }
      // Timber rafter ends and verge trim sit beneath the uninterrupted tiled surface.
      for (let a = a0 + .12; a < a1; a += .40) {
        const pts = [0, .42, .76, 1].map(f => toWorld(a, b0 + (b1 - b0) * f, -.17));
        for (let j = 0; j < pts.length - 1; j++) beam(pts[j], pts[j + 1], .038, timber, group, 6);
      }
      for (const a of [a0, a1]) {
        const pts = Array.from({ length: 13 }, (_, j) => toWorld(a, b0 + (b1 - b0) * j / 12, -.055));
        for (let j = 0; j < pts.length - 1; j++) beam(pts[j], pts[j + 1], .045, roofCut, group, 6);
      }
      const eaveB = Math.abs(b0) > Math.abs(b1) ? b0 : b1;
      const eavePts = Array.from({ length: 18 }, (_, j) => toWorld(a0 + (a1 - a0) * j / 17, eaveB, -.015));
      curvedBeam(eavePts, .052, tiles[1]);
    }
    const ridgePts = Array.from({ length: 25 }, (_, j) => toWorld(-halfW + 2 * halfW * j / 24, 0, .06));
    curvedBeam(ridgePts, .092, tiles[2]);
    for (const sign of [-1, 1]) {
      const a = halfW * sign;
      const p0 = toWorld(a * .94, 0, .08), p1 = toWorld(a * 1.015, 0, .23), p2 = toWorld(a * 1.015, 0, .46);
      curvedBeam([p0, p1, p2], .07, tiles[2]);
      sphere(.075, p2[0], p2[1], p2[2], tiles[2], group, 8, 5);
    }
  }
  roof(0, -3.15, 4.44, 2.30, 4.55, 1.43, 'x');
  // Structural purlins and rafters remain beneath the complete roof.
  for (const z of [-4.55, -3.15, -1.55]) box(7.98, .11, .11, 0, z === -3.15 ? 3.97 : 3.31, z, oldTimber, group);
  for (const x of [-3.75, -1.94, 1.94, 3.75]) {
    beam([x, 3.22, -4.84], [x, 4.22, -3.15], .055, timber, group);
    beam([x, 4.22, -3.15], [x, 3.22, -1.05], .055, timber, group);
    box(.20, .14, .26, x, 3.35, -1.04, paleWood, group);
  }
  // A fine gutter collects the streams before discharging at the stone drain.
  beam([-4.25, 3.25, -.84], [4.25, 3.25, -.84], .035, darkStone, group, 8);
  curvedBeam([[-4.22, 3.25, -.84], [-4.28, 3.15, -.71], [-4.27, 2.83, -.68], [-4.27, .33, -.68]], .035, darkStone);
  for (const x of [-4.18, -3.6, -3.0, -2.25, -1.5, -.75, 0, .75, 1.5, 2.26, 2.98, 3.62, 4.18]) dripSources.push({ x, y: 3.32 + .12 * Math.pow(Math.abs(x) / 4.4, 6), z: -.81 });

  // The west wing turns into a corridor with a traditional reclining bench.
  box(2.02, .24, 4.73, -4.55, .33, .23, foundation, group);
  box(1.83, .10, 4.56, -4.55, .47, .23, mat('#8a8978'), group);
  box(.17, 2.37, 4.48, -5.4, 1.79, .23, plaster, group);
  box(.20, .23, 4.55, -5.39, .70, .23, darkStone, group);
  for (const z of [-1.9, .26, 2.35]) {
    cyl(.073, .085, 2.36, -3.72, 1.78, z, timber, group, 10);
    cyl(.14, .15, .14, -3.72, .59, z, edgeStone, group, 10);
    beam([-3.72, 2.64, z], [-4.03, 2.93, z], .041, timber, group);
  }
  box(.13, .18, 4.78, -3.72, 2.98, .23, timber, group);
  for (const z of [-1.3, -.7, -.1, .5, 1.1, 1.7]) box(1.73, .085, .072, -4.56, 2.94, z, oldTimber, group);
  roof(-4.55, .24, 2.50, 1.14, 3.55, .82, 'z');
  box(.41, .10, 3.18, -5.08, 1.02, .24, timber, group);
  for (const z of [-1.15, -.18, .79, 1.65]) {
    box(.09, .47, .09, -5.08, .76, z, oldTimber, group);
    beam([-5.09, 1.03, z], [-5.33, 1.61, z], .033, timber, group);
  }
  box(.065, .07, 3.29, -5.32, 1.59, .24, timber, group);
  box(.06, .045, 3.25, -5.24, 1.39, .24, goldenWood, group);
  for (let z = -1.30; z < 1.8; z += .18) beam([-5.10, 1.10, z], [-5.30, 1.57, z], .018, goldenWood, group, 6);
  for (let z = -1.90; z <= 2.4; z += .50) dripSources.push({ x: -3.40, y: 3.04, z });
  // A simple small wing door and its copper ring, with a warm recessed reveal.
  box(.025, 1.85, .77, -5.296, 1.50, -1.19, oldTimber, group);
  box(.028, 1.70, .63, -5.27, 1.5, -1.19, timber, group);
  for (let z = -1.44; z < -.9; z += .125) box(.035, 1.67, .015, -5.25, 1.50, z, goldenWood, group, false);
  const wingRing = mesh(new THREE.TorusGeometry(.065, .009, 6, 16), bronze, '厢房门环');
  wingRing.rotation.y = Math.PI / 2;
  wingRing.position.set(-5.21, 1.43, -.98);

  // East enclosing wall: real empty lattice apertures and staggered wall piers.
  box(.17, .67, 5.40, 5.43, .50, -2.11, plaster, group);
  box(.17, .40, 5.40, 5.43, 2.12, -2.11, plaster, group);
  for (const [z, depth] of [[-4.125, 1.35], [-.77, 2.76]]) box(.17, 1.12, depth, 5.43, 1.395, z, plaster, group);
  windowPanel(5.327, 1.40, -2.80, 1.18, 1.10, Math.PI / 2, false);
  for (const z of [-4.82, -.04]) box(.30, 2.2, .30, 5.43, 1.23, z, plaster, group);
  box(.34, .13, 5.47, 5.43, 2.39, -2.11, tiles[0], group);
  for (let z = -4.84; z < .65; z += .21) {
    const cap = cyl(.075, .075, .38, 5.43, 2.465, z, tiles[2], group, 8);
    cap.rotation.z = Math.PI / 2;
  }
  // Circular moon gate, with a pale stone ring and a truly open silhouette.
  const wallShape = new THREE.Shape();
  wallShape.moveTo(1.75, .16);
  wallShape.lineTo(5.48, .16);
  wallShape.lineTo(5.48, 2.59);
  wallShape.lineTo(1.75, 2.59);
  wallShape.closePath();
  const moonHole = new THREE.Path();
  moonHole.absarc(3.62, 1.35, 1.03, 0, Math.PI * 2, true);
  wallShape.holes.push(moonHole);
  const moonWall = mesh(new THREE.ExtrudeGeometry(wallShape, { depth: .19, bevelEnabled: false, curveSegments: 56 }), plaster, '真正通透的月洞门', group, true);
  moonWall.position.z = .67;
  for (const z of [.65, .875]) {
    const ring = mesh(new THREE.TorusGeometry(1.075, .055, 6, 64), edgeStone, '月洞门青石包边');
    ring.position.set(3.62, 1.35, z);
  }
  for (let i = 0; i < 16; i++) {
    const angle = i / 16 * Math.PI * 2;
    line([[3.62 + Math.cos(angle) * 1.025, 1.35 + Math.sin(angle) * 1.025, .935], [3.62 + Math.cos(angle) * 1.125, 1.35 + Math.sin(angle) * 1.125, .935]], '#778c88', group);
  }
  box(1.08, .13, .65, 3.62, .25, .77, foundation, group);
  box(3.84, .10, .44, 3.61, 2.62, .765, darkStone, group);
  roof(3.61, .765, 1.94, .31, 2.79, .20, 'x');
  // A pierced flower-shaped opening on the left side of the moon gate.
  const floral = new THREE.Group();
  floral.name = '月门旁的回纹饰件';
  floral.position.set(2.04, 1.82, .886);
  group.add(floral);
  const flourish = mesh(new THREE.TorusGeometry(.16, .018, 5, 16), darkStone, '回纹花格', floral);
  flourish.scale.set(.82, 1, 1);
  line([[-.12, 0, .006], [0, .13, .006], [.12, 0, .006], [0, -.13, .006], [-.12, 0, .006]], '#5b7270', floral);
  // Plaster is slightly weathered near the damp ground, with restrained old marks.
  for (const [x, z, w] of [[-2.2, -4.825, .35], [1.2, -4.825, .21], [2.10, .872, .20], [5.11, .872, .22]]) {
    box(w, .09, .006, x, .24, z, mat('#a6b3a2'), group, false);
    line([[x - w * .3, .25, z + .009], [x, .29, z + .009], [x + w * .2, .27, z + .009]], '#82988a', group);
  }

  const lanternMaterial = mat('#d4995b', { emissive: '#ffb864', emissiveIntensity: .85 });
  function lantern(x, y, z, index, small = false) {
    const pivot = new THREE.Group();
    pivot.name = '微风中的檐灯';
    pivot.position.set(x, y, z);
    group.add(pivot);
    dynamic.push(pivot);
    const scale = small ? .80 : 1;
    const body = new THREE.Group();
    body.scale.setScalar(scale);
    pivot.add(body);
    beam([0, 0, 0], [0, -.14, 0], .014, oldTimber, body, 6);
    const points = [new THREE.Vector2(.13, -.16), new THREE.Vector2(.22, -.22), new THREE.Vector2(.27, -.36), new THREE.Vector2(.25, -.53), new THREE.Vector2(.15, -.64)];
    mesh(new THREE.LatheGeometry(points, 20), lanternMaterial, '暖色绢灯笼', body);
    for (const yy of [-.17, -.64]) cyl(.155, .155, .05, 0, yy, 0, oldTimber, body, 16);
    for (let j = 0; j < 12; j++) {
      const a = j / 12 * Math.PI * 2;
      const vertices = [[.14, -.19], [.23, -.28], [.266, -.40], [.22, -.56], [.14, -.62]].map(([r, yy]) => [Math.cos(a) * r, yy, Math.sin(a) * r]);
      curvedBeam(vertices, .0085, paleWood, body);
    }
    for (const yy of [-.28, -.49]) {
      const hoop = mesh(new THREE.TorusGeometry(yy === -.28 ? .238 : .257, .007, 4, 24), paleWood, '灯笼竹箍', body);
      hoop.rotation.x = Math.PI / 2;
      hoop.position.y = yy;
    }
    beam([0, -.66, 0], [0, -.91, 0], .01, bronze, body, 6);
    for (let j = 0; j < 5; j++) line([[Math.cos(j) * .018, -.76, Math.sin(j) * .018], [Math.cos(j) * .026, -.94, Math.sin(j) * .026]], '#be7c4c', body);
    text(index % 2 ? '安' : '雨', .17, .19, 0, -.40, .271, { color: '#865034', font: '72px "KaiTi", serif' }, body);
    if (index === 1 || index === 5) {
      const light = new THREE.PointLight('#ffc183', index === 5 ? 2.7 : 3.3, 4, 2);
      light.position.set(0, -.38 * scale, 0);
      pivot.add(light);
    }
    pendants.push({ pivot, phase: index * 1.37 });
  }
  lantern(-3.45, 3.13, -.96, 0, true);
  lantern(-1.42, 3.12, -.95, 1);
  lantern(1.43, 3.12, -.95, 2);
  lantern(3.45, 3.13, -.96, 3, true);
  lantern(-3.83, 2.93, 1.79, 4, true);
  lantern(4.73, 2.46, -.20, 5, true);

  // A tiny bronze wind bell and its paper strip hang clear of the corridor beam.
  const bell = new THREE.Group();
  bell.name = '檐角风铃';
  bell.position.set(-3.51, 2.96, 2.22);
  group.add(bell);
  dynamic.push(bell);
  beam([0, 0, 0], [0, -.15, 0], .007, bronze, bell, 6);
  cyl(.065, .125, .18, 0, -.24, 0, bronze, bell, 14);
  sphere(.025, 0, -.36, 0, goldenWood, bell, 8, 4);
  beam([0, -.34, 0], [0, -.50, 0], .006, bronze, bell, 6);
  box(.13, .36, .008, 0, -.68, 0, mat('#c1b995'), bell, false);
  text('雨', .07, .19, 0, -.66, .007, { color: '#5f7973', font: '72px "KaiTi", serif' }, bell);

  return {
    group,
    dynamic,
    dripSources,
    glassPanes,
    shelterAt(x, z) {
      if (x > -4.47 && x < 4.47 && z > -5.46 && z < -.82) {
        const f = Math.abs(z + 3.15) / 2.3;
        return 4.55 - 1.43 * Math.pow(Math.min(f, 1), .86) + .27 * Math.pow(Math.min(f, 1), 8);
      }
      if (x > -5.70 && x < -3.38 && z > -2.30 && z < 2.79) return 3.2;
      if (x > 1.64 && x < 5.58 && Math.abs(z - .765) < .34) return 2.72;
      if (Math.abs(x - 5.43) < .22 && z > -4.9 && z < .66) return 2.45;
      return 0;
    },
    update(t, dt, reducedMotion = false) {
      for (const { pivot, phase } of pendants) {
        pivot.rotation.z = reducedMotion ? 0 : Math.sin(t * .63 + phase) * .025;
        pivot.rotation.x = reducedMotion ? 0 : Math.sin(t * .43 + phase) * .012;
      }
      const gust = Math.pow(Math.max(0, Math.sin(t * .27)), 8);
      bell.rotation.z = reducedMotion ? 0 : Math.sin(t * 2.1) * (.012 + gust * .06);
      lanternMaterial.emissiveIntensity = .85 * (1 - .014 * Math.sin(t * .81) * Math.sin(t * .37));
    }
  };
}
