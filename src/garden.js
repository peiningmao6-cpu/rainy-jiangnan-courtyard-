import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';

/** Courtyard planting and the small, weather-worn objects around the house. */
export function buildGarden(ctx) {
  const { THREE, scene, mat, box, cyl, sphere, beam, line, wood, stone, rand } = ctx;
  const group = new THREE.Group();
  group.name = '庭 · 石径与荷池';
  scene.add(group);
  const dynamic = [];
  const swaying = [];
  const floating = [];
  const leafDrips = [];
  const paleStone = mat('#86928c');
  const darkStone = mat('#465b59');
  const edgeStone = mat('#72847d');
  const mossColors = ['#466759', '#557564', '#627c63', '#3c6055'].map(c => mat(c));
  const bambooGreen = mat('#667f58');
  const bambooRing = mat('#a0a876');
  const leafMaterials = ['#547966', '#638575', '#7a956b', '#3f675a'].map(c => mat(c, { side: THREE.DoubleSide }));
  const clay = mat('#9b7060');
  const ceramic = mat('#638581');
  const blackInk = new THREE.LineBasicMaterial({ color: '#203c3a', transparent: true, opacity: .45 });

  function horizontalShape(points) {
    const shape = new THREE.Shape();
    points.forEach(([x, z], i) => i ? shape.lineTo(x, -z) : shape.moveTo(x, -z));
    shape.closePath();
    return shape;
  }

  function ellipsePoints(x, z, rx, rz, n = 40, irregularity = 0) {
    return Array.from({ length: n }, (_, i) => {
      const a = i / n * Math.PI * 2;
      const s = 1 + Math.sin(a * 3 + .4) * irregularity + Math.sin(a * 5) * irregularity * .5;
      return [x + Math.cos(a) * rx * s, z + Math.sin(a) * rz * s];
    });
  }

  function flatShape(points, y, material, parent = group) {
    const geo = new THREE.ShapeGeometry(horizontalShape(points), 10);
    geo.rotateX(-Math.PI / 2);
    const mesh = new THREE.Mesh(geo, material);
    mesh.position.y = y;
    mesh.receiveShadow = true;
    parent.add(mesh);
    return mesh;
  }

  function torus(major, tube, x, y, z, material, parent = group, arc = Math.PI * 2) {
    const mesh = new THREE.Mesh(new THREE.TorusGeometry(major, tube, 5, 28, arc), material);
    mesh.rotation.x = Math.PI / 2;
    mesh.position.set(x, y, z);
    parent.add(mesh);
    return mesh;
  }

  function pebbleTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = 1024;
    const c = canvas.getContext('2d');
    c.fillStyle = '#5f716e'; c.fillRect(0, 0, 1024, 1024);
    const colors = ['#798985', '#85928a', '#6f817c', '#6b807b', '#7b8d83', '#90998a'];
    for (let row = 0; row < 44; row++) {
      for (let col = 0; col < 42; col++) {
        const x = col * 25 + (row % 2) * 12.5 + (rand() - .5) * 13;
        const y = row * 24 + (rand() - .5) * 13;
        c.beginPath();
        c.ellipse(x, y, 8 + rand() * 4, 6 + rand() * 3, rand() * 2, 0, Math.PI * 2);
        c.fillStyle = colors[Math.floor(rand() * colors.length)]; c.fill();
        c.beginPath(); c.ellipse(x - 1.5, y - 1.5, 4, 1.4, -.4, 0, Math.PI * 2);
        c.fillStyle = 'rgba(188,203,190,.075)'; c.fill();
      }
    }
    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(1.6, 1);
    return texture;
  }

  // The small river pebbles read as paving, rather than noisy floating stones.
  const paving = new THREE.MeshStandardMaterial({ map: pebbleTexture(), color: '#a2b1a5', roughness: .58, metalness: .03 });
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(11.65, 6.1), paving);
  ground.rotation.x = -Math.PI / 2;
  ground.position.set(0, .165, 2.65);
  ground.receiveShadow = true;
  group.add(ground);

  // A winding stone walk joins the front edge, veranda and circular doorway.
  const slabs = [];
  for (let row = 0; row < 10; row++) {
    const z = 5.18 - row * .59;
    const x = -.48 + Math.sin(row * .55) * .29;
    for (let side = 0; side < 2; side++) {
      const xx = x + (side - .5) * .59;
      const slab = box(.56, .045, .55, xx, .190 + (row % 3) * .001, z, (row + side) % 4 ? paleStone : edgeStone, group);
      slab.rotation.y = (rand() - .5) * .035;
      slabs.push({ x: xx, z });
      if ((row + side) % 3 === 0) line([[xx - .18, .215, z + .15], [xx + .08, .215, z + .15]], '#b1beb0', group);
      if (row % 3 === 1) {
        const crack = [[xx - .19, .215, z - .17], [xx - .08, .216, z - .06], [xx - .12, .216, z + .08]];
        line(crack, '#536b62', group);
      }
    }
  }
  for (let i = 0; i < 6; i++) {
    const x = .57 + i * .53, z = 1.15 - Math.sin(i / 5 * Math.PI) * .24;
    box(.49, .045, .66, x, .190, z, i % 2 ? paleStone : edgeStone, group);
    if (i < 5) box(.022, .012, .38, x + .255, .208, z, mossColors[i % 4], group, false);
  }

  // Narrow runnels collect water at the eaves and carry it to the lotus pool.
  box(7.5, .025, .17, -.02, .177, -.48, darkStone, group, false);
  for (let i = 0; i < 45; i++) box(.027, .012, .19, -3.65 + i * .165, .198, -.48, paleStone, group, false);
  box(.14, .018, 1.65, 3.88, .177, .21, darkStone, group, false);
  for (let i = 0; i < 11; i++) box(.18, .012, .026, 3.88, .197, -.52 + i * .145, paleStone, group, false);
  for (let i = 0; i < 5; i++) {
    const x = -3.2 + i * 1.29;
    box(.15, .016, .05, x, .207, -.48, mat('#b5c1ad'), group, false);
  }

  // Low moss occupies the joints, leaving the middle of the walk clear.
  const mossGeo = new THREE.IcosahedronGeometry(1, 0);
  function moss(x, z, r = .12, y = .182, parent = group) {
    const m = new THREE.Mesh(mossGeo, mossColors[Math.floor(rand() * mossColors.length)]);
    m.position.set(x, y, z); m.scale.set(r, .018 + r * .09, r * .7); parent.add(m);
    return m;
  }
  for (let i = 0; i < 78; i++) {
    const x = rand() * 10.6 - 5.3, z = rand() * 5.6 + .1;
    if (Math.abs(x + .4) < .95 || (x > 1.0 && x < 4.9 && z > 2.1 && z < 5.0)) continue;
    moss(x, z, .045 + rand() * .10);
  }
  for (let i = 0; i < 14; i++) moss(-1.12 + Math.sin(i * .45) * .2, 4.97 - i * .36, .055, .206);

  const pond = { x: 3.05, z: 3.52, rx: 1.74, rz: 1.20, y: .228 };
  const pondPoints = ellipsePoints(pond.x, pond.z, pond.rx, pond.rz, 48, .065);
  flatShape(ellipsePoints(pond.x, pond.z, pond.rx * 1.075, pond.rz * 1.09, 48, .065), .182, mat('#3c5550'));
  const waterMat = new THREE.MeshPhysicalMaterial({ color: '#3b6966', roughness: .25, metalness: .35, clearcoat: .8, transparent: true, opacity: .91, depthWrite: false });
  const water = flatShape(pondPoints, pond.y, waterMat);
  water.name = '微雨荷池';
  line([...pondPoints, pondPoints[0]].map(([x, z]) => [x, pond.y + .004, z]), '#88a39a', group);
  // Irregular, half-buried edge stones rather than a perfect manufactured ring.
  const rimGeo = new THREE.DodecahedronGeometry(1, 0);
  for (let i = 0; i < 34; i++) {
    const a = i / 34 * Math.PI * 2;
    const s = 1 + Math.sin(a * 3 + .4) * .065 + Math.sin(a * 5) * .0325;
    const rock = new THREE.Mesh(rimGeo, [paleStone, edgeStone, darkStone][i % 3]);
    rock.position.set(pond.x + Math.cos(a) * pond.rx * s, .244, pond.z + Math.sin(a) * pond.rz * s);
    rock.scale.set(.15 + rand() * .045, .095 + rand() * .035, .12 + rand() * .025);
    rock.rotation.set(rand() * .8, -a, rand() * .3);
    rock.castShadow = rock.receiveShadow = true; group.add(rock);
    if (i % 3 === 0) moss(rock.position.x - .04, rock.position.z, .10, .305);
  }

  function glowTexture() {
    const canvas = document.createElement('canvas'); canvas.width = canvas.height = 64;
    const c = canvas.getContext('2d'), g = c.createRadialGradient(32, 32, 1, 32, 32, 31);
    g.addColorStop(0, 'rgba(255,255,255,.85)'); g.addColorStop(.4, 'rgba(255,255,255,.35)'); g.addColorStop(1, 'rgba(255,255,255,0)');
    c.fillStyle = g; c.fillRect(0, 0, 64, 64);
    return new THREE.CanvasTexture(canvas);
  }
  const reflectionMap = glowTexture();
  for (let i = 0; i < 21; i++) {
    const z = 2.52 + i * .085, x = 2.30 + Math.sin(i * 1.65) * .16;
    const m = new THREE.MeshBasicMaterial({ color: i % 3 ? '#eac08a' : '#c5ceac', map: reflectionMap, transparent: true, opacity: .14 * (1 - i / 27), depthWrite: false, blending: THREE.AdditiveBlending });
    const reflection = new THREE.Mesh(new THREE.PlaneGeometry(.17 + rand() * .50, .033 + rand() * .035), m);
    reflection.rotation.x = -Math.PI / 2; reflection.position.set(x, pond.y + .007, z); group.add(reflection);
  }

  function lotusLeaf(x, z, r, rotation) {
    const leaf = new THREE.Shape();
    leaf.moveTo(0, 0);
    for (let i = 0; i <= 36; i++) {
      const a = .20 + i / 36 * (Math.PI * 2 - .43);
      const rr = r * (1 + Math.sin(a * 6) * .025);
      leaf.lineTo(Math.cos(a) * rr, Math.sin(a) * rr);
    }
    leaf.lineTo(0, 0);
    const padGroup = new THREE.Group(); padGroup.position.set(x, pond.y + .022, z); padGroup.rotation.y = rotation;
    const geo = new THREE.ShapeGeometry(leaf, 16); geo.rotateX(-Math.PI / 2);
    const mesh = new THREE.Mesh(geo, leafMaterials[1]); padGroup.add(mesh);
    for (let i = 0; i < 8; i++) {
      const a = .35 + i / 8 * Math.PI * 2;
      line([[0, .003, 0], [Math.cos(a) * r * .84, .004, -Math.sin(a) * r * .84]], '#7c9b78', padGroup);
    }
    group.add(padGroup); dynamic.push(padGroup); floating.push({ group: padGroup, y: padGroup.position.y, phase: rand() * 6.28 });
  }
  lotusLeaf(3.72, 3.73, .39, .6);
  lotusLeaf(3.87, 2.91, .31, -1.5);
  lotusLeaf(2.77, 4.17, .33, 2.2);
  lotusLeaf(3.15, 3.25, .25, 1.5);
  lotusLeaf(4.18, 3.47, .22, -2.4);
  function lotusFlower(x, z, size = 1) {
    const flower = new THREE.Group(); flower.position.set(x, pond.y + .17, z); group.add(flower);
    beam([x, pond.y, z], [x, pond.y + .19, z], .014, mat('#789477'), group);
    const petalGeo = new THREE.SphereGeometry(1, 9, 6);
    const colors = [mat('#d8b6b2'), mat('#e8cfbf'), mat('#b9989e')];
    for (let layer = 0; layer < 2; layer++) for (let i = 0; i < 7; i++) {
      const a = i / 7 * Math.PI * 2 + layer * .44;
      const p = new THREE.Mesh(petalGeo, colors[(i + layer) % colors.length]);
      p.scale.set(.06 * size, .14 * size, .047 * size);
      p.position.set(Math.cos(a) * .085 * size, layer * .035, Math.sin(a) * .085 * size);
      p.rotation.z = -.7 * Math.cos(a); p.rotation.x = .7 * Math.sin(a); flower.add(p);
    }
    sphere(.044 * size, 0, .09, 0, mat('#c8b979'), flower, 10, 6);
  }
  lotusFlower(3.35, 3.73, 1);
  lotusFlower(4.07, 3.05, .7);

  // A pierced taihu stone: all three openings go through the actual mesh.
  const rockShape = new THREE.Shape();
  rockShape.moveTo(-.68, .02);
  rockShape.bezierCurveTo(-.88, .26, -.54, .55, -.62, .82);
  rockShape.bezierCurveTo(-.88, 1.15, -.35, 1.13, -.40, 1.43);
  rockShape.bezierCurveTo(-.22, 1.68, .13, 1.57, .24, 1.35);
  rockShape.bezierCurveTo(.69, 1.43, .80, 1.12, .54, .88);
  rockShape.bezierCurveTo(.90, .55, .52, .43, .62, .20);
  rockShape.bezierCurveTo(.75, -.02, .14, -.06, -.06, .02);
  rockShape.bezierCurveTo(-.27, -.08, -.48, -.04, -.68, .02);
  for (const [x, y, rx, ry] of [[-.13, .39, .21, .18], [.16, .91, .18, .24], [-.20, 1.27, .12, .13]]) {
    const hole = new THREE.Path(); hole.absellipse(x, y, rx, ry, .18, Math.PI * 2 + .18, true, .22); rockShape.holes.push(hole);
  }
  const taihuGeo = new THREE.ExtrudeGeometry(rockShape, { depth: .38, bevelEnabled: true, bevelThickness: .085, bevelSize: .075, bevelSegments: 2, curveSegments: 7, steps: 1 });
  taihuGeo.translate(0, 0, -.19);
  const taihu = new THREE.Mesh(taihuGeo, mat('#8b9990'));
  taihu.position.set(-2.48, .24, 2.15); taihu.rotation.y = -.24; taihu.castShadow = taihu.receiveShadow = true; group.add(taihu);
  const taihuOutline = new THREE.LineSegments(new THREE.EdgesGeometry(taihuGeo, 32), blackInk); taihu.add(taihuOutline);
  for (let i = 0; i < 15; i++) {
    const a = i / 15 * Math.PI * 2, radius = .57 + rand() * .22;
    moss(-2.48 + Math.cos(a) * radius, 2.15 + Math.sin(a) * radius * .63, .14 + rand() * .09, .215);
  }
  const bottomRocks = [[-2.98, 1.97, .19], [-2.09, 2.42, .23], [-2.84, 2.43, .13], [-2.13, 1.84, .17]];
  for (const [x, z, r] of bottomRocks) {
    const rock = new THREE.Mesh(rimGeo, edgeStone); rock.position.set(x, .21, z); rock.scale.set(r * 1.2, r * .55, r); group.add(rock);
  }

  // Leaf geometry has a bowed midrib and a tapered outline, not billboard discs.
  const bladeCache = new Map();
  function bladeGeometry(length, width, sag = .08, steps = 8) {
    const key = `${length}/${width}/${sag}/${steps}`;
    if (bladeCache.has(key)) return bladeCache.get(key);
    const positions = [], uvs = [], indices = [];
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      const w = Math.pow(Math.sin(Math.PI * t), .7) * width;
      const y = Math.sin(t * Math.PI) * length * .12 - t * t * sag;
      positions.push(t * length, y - w * .08, -w, t * length, y + w * .09, 0, t * length, y - w * .08, w);
      uvs.push(t, 0, t, .5, t, 1);
      if (i < steps) for (let side = 0; side < 2; side++) {
        const a = i * 3 + side, b = a + 3; indices.push(a, b, a + 1, b, b + 1, a + 1);
      }
    }
    const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3)); geo.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2)); geo.setIndex(indices); geo.computeVertexNormals(); bladeCache.set(key, geo); return geo;
  }
  const bambooLayout = [[-4.90, 3.90, 3.25], [-4.45, 4.15, 3.70], [-4.02, 3.71, 2.95], [-4.78, 3.15, 2.65], [-4.33, 3.35, 3.15], [-5.13, 4.38, 2.5]];
  for (let i = 0; i < bambooLayout.length; i++) {
    const [x, z, h] = bambooLayout[i], stalk = new THREE.Group();
    stalk.position.set(x, .18, z); group.add(stalk); dynamic.push(stalk);
    swaying.push({ group: stalk, phase: i * 1.7, amount: .012, axis: 'z' });
    const segments = Math.ceil(h / .45), lean = (i % 2 ? .10 : -.08);
    for (let j = 0; j < segments; j++) {
      const y0 = j * h / segments, y1 = (j + 1) * h / segments;
      beam([lean * y0, y0, 0], [lean * y1, y1, 0], .037 - j * .0014, bambooGreen, stalk, 8);
      cyl(.043 - j * .001, .043 - j * .001, .022, lean * y1, y1, 0, bambooRing, stalk, 8);
      if (j < 2 || j % 2 !== i % 2) continue;
      for (let branch = 0; branch < 2; branch++) {
        const a = i * 1.31 + j * .85 + branch * 2.7;
        const end = [lean * y1 + Math.cos(a) * .48, y1 + .12, Math.sin(a) * .48];
        beam([lean * y1, y1, 0], end, .009, bambooGreen, stalk, 5);
        for (let k = 0; k < 5; k++) {
          const t = .28 + k * .17;
          const leaf = new THREE.Mesh(bladeGeometry(.32 + (k % 2) * .08, .040, .055, 5), leafMaterials[(i + j + k) % leafMaterials.length]);
          leaf.position.set(lean * y1 + Math.cos(a) * .48 * t, y1 + .12 * t, Math.sin(a) * .48 * t);
          leaf.rotation.y = -a + (k % 2 ? .68 : -.65); leaf.rotation.z = k % 2 ? -.21 : .12; leaf.castShadow = true; stalk.add(leaf);
        }
      }
    }
    for (let j = 0; j < 7; j++) moss(x + (rand() - .5) * .4, z + (rand() - .5) * .4, .13);
    leafDrips.push({ x: x + lean * h + .30, y: .18 + h - .22, z: z + .18 });
  }

  const banana = new THREE.Group(); banana.position.set(5.06, .17, -.55); group.add(banana); dynamic.push(banana);
  swaying.push({ group: banana, phase: 2.6, amount: .009, axis: 'z' });
  cyl(.09, .16, 1.45, 0, .72, 0, mat('#819371'), banana, 10);
  for (let k = 0; k < 5; k++) {
    const a = [2.45, 3.16, 4.05, 1.73, 4.73][k], length = k === 1 ? 1.45 : 1.20;
    const petioleEnd = [Math.cos(a) * .32, 1.44 + (k % 2) * .16, -Math.sin(a) * .32];
    beam([0, 1.05, 0], petioleEnd, .025, mat('#789472'), banana, 7);
    const leaf = new THREE.Mesh(bladeGeometry(length, .235, .45, 14), leafMaterials[k % leafMaterials.length]);
    leaf.position.set(...petioleEnd); leaf.rotation.y = a; leaf.rotation.z = .21 + k * .025; leaf.castShadow = true; banana.add(leaf);
    const vein = [];
    for (let j = 0; j <= 10; j++) { const t = j / 10; vein.push([t * length, Math.sin(t * Math.PI) * length * .12 - t * t * .45 + .006, 0]); }
    line(vein, '#9eb287', leaf);
    for (let j = 2; j < 12; j++) {
      const t = j / 14, w = Math.pow(Math.sin(Math.PI * t), .7) * .235;
      const yy = Math.sin(t * Math.PI) * length * .12 - t * t * .45;
      line([[t * length - .035, yy + .007, 0], [t * length + .055, yy - .025, w * .9]], '#789875', leaf);
      line([[t * length - .035, yy + .007, 0], [t * length + .055, yy - .025, -w * .9]], '#789875', leaf);
    }
    const tip = new THREE.Vector3(length, -.45, 0); leaf.localToWorld(tip); leafDrips.push({ x: tip.x, y: tip.y, z: tip.z });
  }
  // Returning world-space leaf tips requires the full group transform.
  group.updateMatrixWorld(true);
  for (let i = leafDrips.length - 5; i < leafDrips.length; i++) {
    const leaf = banana.children.filter(c => c.isMesh && c.geometry?.getAttribute('uv')?.count === 45)[i - (leafDrips.length - 5)];
    if (!leaf) continue;
    const length = i - (leafDrips.length - 5) === 1 ? 1.45 : 1.20;
    const tip = leaf.localToWorld(new THREE.Vector3(length, -.45, 0));
    leafDrips[i] = { x: tip.x, y: tip.y, z: tip.z };
  }

  function ceramicPot(x, z, radius, height, material = clay) {
    const profile = [[0, 0], [radius * .64, 0], [radius * .83, .06 * height], [radius, height * .43], [radius * .93, height * .83], [radius * .78, height * .94], [radius * .83, height], [radius * .70, height], [radius * .68, height * .84]];
    const geo = new THREE.LatheGeometry(profile.map(([r, y]) => new THREE.Vector2(r, y)), 24);
    const pot = new THREE.Mesh(geo, material); pot.position.set(x, .19, z); pot.castShadow = pot.receiveShadow = true; group.add(pot);
    torus(radius * .79, .023, x, .19 + height, z, material);
    return pot;
  }
  ceramicPot(5.18, 1.45, .31, .63, mat('#718b80'));
  const jarWater = new THREE.Mesh(new THREE.CircleGeometry(.218, 24), waterMat); jarWater.rotation.x = -Math.PI / 2; jarWater.position.set(5.18, .777, 1.45); group.add(jarWater);
  line([[5.01, .784, 1.40], [5.17, .784, 1.33], [5.29, .784, 1.38]], '#adb6a1', group);
  for (let i = 0; i < 5; i++) moss(5.18 + Math.cos(i * 1.3) * .31, 1.45 + Math.sin(i * 1.3) * .29, .10);

  // A miniature trained pine in a shallow ceramic tray near the front left.
  const bonsai = new THREE.Group(); bonsai.position.set(-2.92, .18, 4.77); group.add(bonsai);
  box(.91, .16, .58, 0, .09, 0, ceramic, bonsai);
  box(.80, .018, .47, 0, .181, 0, mat('#3d5145'), bonsai, false);
  for (const x of [-.33, .33]) box(.12, .06, .36, x, -.015, 0, ceramic, bonsai, false);
  const trunkColor = mat('#7e7960');
  beam([-.10, .18, .02], [-.19, .43, 0], .065, trunkColor, bonsai);
  beam([-.19, .43, 0], [.01, .68, -.02], .052, trunkColor, bonsai);
  beam([.01, .68, -.02], [-.02, .94, -.03], .032, trunkColor, bonsai);
  const pads = [[-.25, .49, .04, .25], [.25, .67, .03, .29], [-.18, .79, -.02, .26], [-.02, 1.02, -.03, .22]];
  for (let i = 0; i < pads.length; i++) {
    const [x, y, z, r] = pads[i]; beam([0, y - .13, 0], [x, y - .03, z], .022, trunkColor, bonsai);
    for (let j = 0; j < 5; j++) {
      const a = j / 5 * Math.PI * 2;
      const foliage = sphere(r * .68, x + Math.cos(a) * r * .48, y + Math.sin(j) * .025, z + Math.sin(a) * r * .42, mossColors[(i + j) % 4], bonsai, 9, 5);
      foliage.scale.y = .42;
    }
  }
  ceramicPot(-3.18, -.15, .20, .28, clay);
  for (let i = 0; i < 7; i++) {
    const a = i / 7 * Math.PI * 2, leaf = new THREE.Mesh(bladeGeometry(.48, .08, .09, 6), leafMaterials[i % 4]);
    leaf.position.set(-3.18, .49, -.15); leaf.rotation.y = a; leaf.rotation.z = .45; group.add(leaf);
  }

  // The stone lantern casts a small, warm reflection across the near pool.
  const lamp = new THREE.Group(); lamp.position.set(1.10, .18, 2.70); group.add(lamp);
  box(.57, .09, .57, 0, .045, 0, edgeStone, lamp);
  box(.43, .07, .43, 0, .12, 0, paleStone, lamp);
  cyl(.12, .17, .52, 0, .41, 0, paleStone, lamp, 8);
  box(.40, .07, .40, 0, .71, 0, edgeStone, lamp);
  const lanternGlow = new THREE.MeshBasicMaterial({ color: '#eac894', toneMapped: false });
  box(.245, .31, .245, 0, .91, 0, lanternGlow, lamp, false);
  for (const x of [-.17, .17]) for (const z of [-.17, .17]) box(.045, .39, .045, x, .92, z, paleStone, lamp, false);
  box(.43, .07, .43, 0, 1.14, 0, edgeStone, lamp);
  const cap = new THREE.Mesh(new THREE.ConeGeometry(.47, .24, 4), paleStone); cap.position.y = 1.29; cap.rotation.y = Math.PI / 4; lamp.add(cap);
  cyl(.06, .09, .10, 0, 1.46, 0, edgeStone, lamp, 10); sphere(.06, 0, 1.55, 0, paleStone, lamp, 10, 6);
  const stoneLight = new THREE.PointLight('#ffcf8c', 1.4, 3.6, 2); stoneLight.position.set(1.10, 1.10, 2.70); group.add(stoneLight);
  for (let i = 0; i < 5; i++) moss(1.1 + Math.cos(i * 1.2) * .28, 2.70 + Math.sin(i * 1.2) * .28, .12, .20);

  // Folded umbrellas, a drying cloth and a bamboo broom live beside the corridor.
  const umbrellaRack = new THREE.Group(); umbrellaRack.position.set(-3.46, .20, 1.24); group.add(umbrellaRack);
  box(.47, .08, .44, 0, .04, 0, wood, umbrellaRack);
  for (const x of [-.20, .20]) for (const z of [-.18, .18]) box(.04, .51, .04, x, .29, z, wood, umbrellaRack, false);
  for (const y of [.20, .45]) { box(.46, .035, .035, 0, y, -.18, wood, umbrellaRack, false); box(.46, .035, .035, 0, y, .18, wood, umbrellaRack, false); }
  for (let i = 0; i < 3; i++) {
    const u = new THREE.Group(); u.position.set((i - 1) * .14, .08, (i % 2) * .14 - .07); u.rotation.z = (i - 1) * .09; umbrellaRack.add(u);
    cyl(.012, .012, 1.27, 0, .65, 0, mat('#9d9c83'), u, 8);
    const cloth = new THREE.Mesh(new THREE.ConeGeometry(.09, .83, 9), [mat('#9b6e63'), mat('#5e7c78'), mat('#647590')][i]); cloth.position.y = .70; cloth.rotation.z = Math.PI; u.add(cloth);
    const hook = new THREE.Mesh(new THREE.TorusGeometry(.055, .012, 5, 14, Math.PI * 1.30), wood); hook.position.set(.04, 1.33, 0); hook.rotation.z = .35; u.add(hook);
  }
  const broomBottom = [-3.77, .24, .40], broomTop = [-3.40, 1.55, .42];
  beam(broomBottom, broomTop, .018, mat('#a5a17c'), group, 8);
  for (let i = 0; i < 17; i++) beam([-3.77 + (i - 8) * .021, .21, .40 + Math.sin(i * 2) * .027], [-3.68, .55, .40], .007, mat(i % 2 ? '#a59a70' : '#c0ad7f'), group, 4);
  torus(.044, .008, -3.68, .54, .40, mat('#6e7962'));

  // A handful of scattered wet leaves, kept out of the room and the pool.
  const fallenColors = [mat('#9e916b', { side: THREE.DoubleSide }), mat('#a17e59', { side: THREE.DoubleSide }), mat('#768267', { side: THREE.DoubleSide })];
  for (let i = 0; i < 24; i++) {
    let x = rand() * 8.8 - 4.4, z = .5 + rand() * 4.85;
    if (x > .95 && x < 4.95 && z > 2 && z < 5) { x = -.9 + rand() * 1.4; }
    const leaf = new THREE.Mesh(bladeGeometry(.12 + rand() * .06, .030, .006, 4), fallenColors[i % 3]);
    leaf.position.set(x, Math.abs(x + .45) < .8 ? .218 : .186, z); leaf.rotation.y = rand() * Math.PI * 2; leaf.rotation.z = -.03; group.add(leaf);
  }

  const puddles = [
    { x: -.38, z: 4.55, rx: .50, rz: .22, y: .220 },
    { x: -.12, z: 2.75, rx: .34, rz: .18, y: .220 },
    { x: 1.42, z: 1.10, rx: .48, rz: .18, y: .220 },
    { x: -1.85, z: .20, rx: .51, rz: .19, y: .176 },
    { x: 4.98, z: 4.86, rx: .40, rz: .17, y: .176 },
    { x: -3.45, z: 4.00, rx: .32, rz: .15, y: .176 }
  ];
  const puddleMaterial = new THREE.MeshPhysicalMaterial({ color: '#71948f', metalness: .42, roughness: .12, clearcoat: 1, transparent: true, opacity: .35, depthWrite: false });
  for (const p of puddles) {
    flatShape(ellipsePoints(p.x, p.z, p.rx, p.rz, 26, .10), p.y, puddleMaterial);
    const edge = ellipsePoints(p.x, p.z, p.rx, p.rz, 26, .10).slice(3, 12);
    line(edge.map(([x, z]) => [x, p.y + .003, z]), '#a7b5a5', group);
  }

  // Leaves and stems remain rigid relative to their animated parent. Baking
  // each of these small subtrees keeps their sway cheap even on a phone.
  function batchRigidSubtree(parent) {
    parent.updateWorldMatrix(true, true);
    const inverse = parent.matrixWorld.clone().invert(), batches = new Map();
    const original = [];
    parent.traverse(object => {
      if ((!object.isMesh && !object.isLine) || Array.isArray(object.material)) return;
      const matrix = new THREE.Matrix4().multiplyMatrices(inverse, object.matrixWorld);
      let geometry, primitive;
      if (object.isLine) {
        primitive = 'lines';
        const source = object.geometry.getAttribute('position'), positions = [];
        const index = object.geometry.index;
        const count = index ? index.count : source.count;
        const step = object.isLineSegments ? 2 : 1;
        for (let i = 0; i < count - 1; i += step) {
          for (let j = 0; j < 2; j++) {
            const at = index ? index.getX(i + j) : i + j;
            const p = new THREE.Vector3().fromBufferAttribute(source, at).applyMatrix4(matrix);
            positions.push(p.x, p.y, p.z);
          }
        }
        geometry = new THREE.BufferGeometry();
        geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
      } else {
        primitive = 'mesh';
        geometry = object.geometry.index ? object.geometry.toNonIndexed() : object.geometry.clone();
        geometry.applyMatrix4(matrix);
      }
      const signature = Object.keys(geometry.attributes).sort().join(',');
      const key = primitive + object.material.uuid + signature;
      if (!batches.has(key)) batches.set(key, { primitive, material: object.material, geometries: [], castShadow: false });
      const batch = batches.get(key); batch.geometries.push(geometry); batch.castShadow ||= object.castShadow;
      original.push(object);
    });
    const results = [];
    for (const batch of batches.values()) {
      const geometry = mergeGeometries(batch.geometries, false);
      if (!geometry) {
        batch.geometries.forEach(g => g.dispose());
        return;
      }
      const object = batch.primitive === 'mesh' ? new THREE.Mesh(geometry, batch.material) : new THREE.LineSegments(geometry, batch.material);
      object.castShadow = batch.castShadow; object.receiveShadow = batch.primitive === 'mesh';
      object.name = 'rigid planting batch'; results.push(object);
      batch.geometries.forEach(g => g.dispose());
    }
    for (const object of original) object.removeFromParent();
    parent.add(...results);
  }
  for (const subtree of dynamic) batchRigidSubtree(subtree);

  function update(t, dt, reducedMotion) {
    const scale = reducedMotion ? .20 : 1;
    for (const item of swaying) {
      item.group.rotation[item.axis] = Math.sin(t * .52 + item.phase) * item.amount * scale + Math.sin(t * .91 + item.phase * .7) * item.amount * .3 * scale;
    }
    for (const item of floating) {
      item.group.position.y = item.y + Math.sin(t * .73 + item.phase) * .003 * scale;
      item.group.rotation.z = Math.sin(t * .66 + item.phase) * .012 * scale;
    }
    waterMat.roughness = .25 + Math.sin(t * .23) * .012;
    stoneLight.intensity = 1.4 * (1 + Math.sin(t * .61) * .008);
  }

  return { group, dynamic, update, pond, leafDrips, puddles };
}
