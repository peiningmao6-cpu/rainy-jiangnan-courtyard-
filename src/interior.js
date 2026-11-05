/** Furnishings for an inhabited, roof-cutaway Jiangnan tea room. */
export function buildInterior(ctx) {
  const { THREE, scene, mat, box, cyl, sphere, beam, line, text, wood } = ctx;
  const group = new THREE.Group();
  group.name = '温暖的听雨茶室';
  scene.add(group);
  const timber = wood || mat('#76513b');
  const darkWood = mat('#4e3930');
  const lightWood = mat('#a77e50');
  const bamboo = mat('#bd9c66');
  const reed = mat('#b6a078');
  const paper = mat('#e9d9b4');
  const jade = mat('#9caf95');
  const darkJade = mat('#607b72');
  const celadon = mat('#b4d0bc');
  const creamCeramic = mat('#e0d9bc');
  const glazeBlue = mat('#456b7d');
  const iron = mat('#3a403c');
  const brass = mat('#b99657');
  const tea = mat('#674b2c');
  const warmPaper = mat('#efd7a4', { emissive: '#d5923b', emissiveIntensity: .38 });
  const quietInk = new THREE.LineBasicMaterial({ color: '#69513b', transparent: true, opacity: .45 });
  const floorY = .52;

  function mesh(geometry, material, x, y, z, parent = group) {
    const item = new THREE.Mesh(geometry, material);
    item.position.set(x, y, z);
    item.castShadow = true;
    item.receiveShadow = true;
    parent.add(item);
    return item;
  }
  function tube(points, radius, material, parent = group, closed = false) {
    const curve = new THREE.CatmullRomCurve3(points.map(p => new THREE.Vector3(...p)), closed, 'centripetal');
    return mesh(new THREE.TubeGeometry(curve, Math.max(10, points.length * 5), radius, 6, closed), material, 0, 0, 0, parent);
  }
  function ring(radius, thickness, x, y, z, material, parent = group) {
    const item = mesh(new THREE.TorusGeometry(radius, thickness, 5, 28), material, x, y, z, parent);
    item.rotation.x = Math.PI / 2;
    return item;
  }
  function pottery(profile, x, y, z, material, parent = group, segments = 24) {
    return mesh(new THREE.LatheGeometry(profile.map(p => new THREE.Vector2(...p)), segments), material, x, y, z, parent);
  }
  function cup(x, y, z, scale = 1, parent = group) {
    pottery([[.025, 0], [.047, .01], [.057, .068], [.062, .073]], x, y, z, celadon, parent);
    cyl(.051, .051, .006, x, y + .064, z, tea, parent, 20);
    ring(.061, .004, x, y + .074, z, creamCeramic, parent);
    pottery([[0, 0], [.071, 0], [.081, .007], [.084, .013]], x, y - .004, z, celadon, parent, 20);
    if (scale !== 1) {
      // Cups are kept at physical table scale; scale is an explicit call-site label.
    }
  }
  function blueVase(x, y, z, height = .42, parent = group) {
    const vessel = new THREE.Group();
    vessel.position.set(x, y, z);
    vessel.scale.setScalar(height / .42);
    parent.add(vessel);
    pottery([[.07, 0], [.1, .025], [.145, .14], [.125, .25], [.064, .34], [.068, .405], [.079, .42]], 0, 0, 0, creamCeramic, vessel);
    cyl(.063, .063, .006, 0, .406, 0, darkJade, vessel, 20);
    for (const [r, yy] of [[.1, .03], [.141, .13], [.135, .20], [.067, .365], [.079, .418]]) ring(r, .006, 0, yy, 0, glazeBlue, vessel);
    for (let i = 0; i < 6; i++) {
      const a = i * Math.PI / 3;
      const points = [];
      for (let j = 0; j < 7; j++) {
        const yy = .15 + j * .011;
        const b = a + Math.sin(j / 6 * Math.PI * 2) * .16;
        points.push([Math.cos(b) * .141, yy, Math.sin(b) * .141]);
      }
      line(points, '#456b7d', vessel);
    }
    return vessel;
  }
  function jar(x, y, z, radius, label = '茶') {
    pottery([[radius * .75, 0], [radius, .025], [radius, .17], [radius * .81, .215]], x, y, z, celadon);
    cyl(radius * .88, radius * .9, .027, x, y + .229, z, darkWood, group, 20);
    cyl(.026, .036, .025, x, y + .255, z, lightWood, group, 12);
    text(label, radius * .95, .105, x, y + .11, z + radius + .002, { bg: '#d9c8a0', color: '#5d6651', size: 96 }, group);
  }

  // A restrained woven mat gives the tea setting one coherent place on the floor.
  box(3.36, .009, 1.71, -1.02, floorY + .012, -2.48, mat('#8b8c71'), group, false);
  for (const z of [-3.28, -1.68]) box(3.24, .003, .027, -1.02, floorY + .019, z, reed, group, false);
  for (const x of [-2.63, .59]) box(.023, .003, 1.58, x, floorY + .019, -2.48, reed, group, false);
  for (let i = 0; i < 23; i++) box(.008, .002, 1.54, -2.54 + i * .135, floorY + .018, -2.48, mat('#98977c'), group, false);

  // The table has an apron, stretchers and slightly splayed Ming-style legs.
  const tx = -1.01, tz = -2.56, tableY = 1.105;
  box(1.90, .105, .91, tx, tableY, tz, timber, group);
  box(1.72, .10, .055, tx, 1.005, tz + .37, darkWood, group);
  box(1.72, .10, .055, tx, 1.005, tz - .37, darkWood, group);
  for (const x of [tx - .79, tx + .79]) {
    for (const z of [tz - .31, tz + .31]) {
      beam([x, floorY + .025, z], [tx + (x - tx) * .92, 1.065, tz + (z - tz) * .92], .036, timber, group, 8);
    }
    box(.048, .045, .63, x, .68, tz, darkWood, group);
  }
  box(1.55, .045, .045, tx, .71, tz, timber, group);
  for (let i = 0; i < 5; i++) box(1.75, .002, .003, tx, tableY + .054, tz - .35 + i * .16, mat('#9b7550'), group, false);

  // A shallow bamboo tray carries a complete, small-scale tea service.
  box(1.14, .022, .57, tx - .10, 1.175, tz - .015, bamboo, group, false);
  for (const z of [tz - .302, tz + .272]) box(1.16, .036, .024, tx - .10, 1.19, z, lightWood, group, false);
  for (const x of [tx - .68, tx + .48]) box(.023, .036, .57, x, 1.19, tz - .015, lightWood, group, false);
  for (let i = 0; i < 17; i++) box(.008, .004, .51, tx - .62 + i * .065, 1.19, tz - .015, reed, group, false);
  for (let i = 0; i < 8; i++) box(1.08, .003, .004, tx - .10, 1.192, tz - .25 + i * .065, mat('#ceb587'), group, false);

  const teaPot = new THREE.Group();
  teaPot.position.set(-1.25, 1.198, -2.61);
  group.add(teaPot);
  const clay = mat('#8c6048');
  pottery([[.055, 0], [.108, .025], [.132, .095], [.116, .17], [.075, .205]], 0, 0, 0, clay, teaPot);
  cyl(.085, .094, .022, 0, .216, 0, clay, teaPot, 24);
  sphere(.026, 0, .247, 0, darkWood, teaPot, 12, 8);
  tube([[.09, .07, 0], [.16, .10, 0], [.22, .16, 0], [.26, .20, 0]], .024, clay, teaPot);
  tube([[-.08, .18, 0], [-.20, .21, 0], [-.24, .11, 0], [-.18, .025, 0], [-.09, .04, 0]], .017, darkWood, teaPot);
  ring(.083, .004, 0, .222, 0, lightWood, teaPot);
  for (const [x, z] of [[-.86, -2.76], [-.74, -2.46], [-1.16, -2.35], [-1.52, -2.42]]) cup(x, 1.202, z);
  jar(-1.74, 1.16, -2.77, .085, '茗');
  // Folded tea towel and a plate of three pale steamed pastries.
  box(.26, .018, .21, -.23, 1.165, -2.78, mat('#b7ae91'), group, false);
  box(.23, .006, .085, -.23, 1.177, -2.73, mat('#d0c5a3'), group, false);
  pottery([[0, 0], [.15, 0], [.17, .015], [.18, .028]], -.24, 1.16, -2.32, celadon, group);
  for (let i = 0; i < 3; i++) {
    const a = i * Math.PI * 2 / 3;
    const pastry = sphere(.061, -.24 + Math.cos(a) * .075, 1.209, -2.32 + Math.sin(a) * .075, mat('#e5d6ad'), group, 10, 6);
    pastry.scale.y = .62;
    for (let k = 0; k < 3; k++) line([[-.275 + Math.cos(a) * .075 + k * .025, 1.245, -2.35 + Math.sin(a) * .075], [-.265 + Math.cos(a) * .075 + k * .025, 1.247, -2.30 + Math.sin(a) * .075]], quietInk, group);
  }

  function horseshoeChair(x, z, rotation) {
    const chair = new THREE.Group();
    chair.name = '明式圈椅';
    chair.position.set(x, 0, z);
    chair.rotation.y = rotation;
    group.add(chair);
    box(.60, .065, .55, 0, .925, 0, timber, chair);
    box(.51, .012, .45, 0, .965, 0, reed, chair, false);
    for (const xx of [-.24, .24]) for (const zz of [-.21, .21]) beam([xx * 1.12, floorY + .025, zz * 1.12], [xx, .91, zz], .027, darkWood, chair);
    for (const xx of [-.26, .26]) box(.032, .034, .44, xx, .69, 0, timber, chair);
    box(.51, .034, .035, 0, .72, .22, timber, chair);
    const bow = [];
    for (let i = 0; i <= 18; i++) {
      const a = i / 18 * Math.PI;
      bow.push([Math.cos(a) * .35, 1.24 + Math.sin(a) * .13, -Math.sin(a) * .31 + .055]);
    }
    tube(bow, .027, timber, chair);
    for (const side of [-1, 1]) {
      tube([[side * .35, 1.24, .055], [side * .32, 1.15, .20], [side * .29, 1.01, .21]], .023, timber, chair);
      beam([side * .27, .95, -.23], [side * .30, 1.30, -.17], .022, darkWood, chair);
    }
    // The characteristic curved central splat remains open on either side.
    tube([[0, .96, -.23], [0, 1.11, -.255], [0, 1.27, -.27], [0, 1.37, -.25]], .052, timber, chair);
    for (let i = 0; i < 8; i++) box(.004, .002, .41, -.21 + i * .06, .973, 0, mat('#c6b58c'), chair, false);
    return chair;
  }
  horseshoeChair(-2.37, -2.54, Math.PI / 2);
  horseshoeChair(.34, -2.54, -Math.PI / 2);
  cyl(.22, .23, .065, -1.03, .84, -1.66, timber, group, 16);
  cyl(.19, .19, .012, -1.03, .88, -1.66, reed, group, 20);
  for (let i = 0; i < 3; i++) {
    const a = i * Math.PI * 2 / 3;
    beam([-1.03 + Math.cos(a) * .17, floorY + .02, -1.66 + Math.sin(a) * .17], [-1.03 + Math.cos(a) * .14, .82, -1.66 + Math.sin(a) * .14], .025, timber, group);
  }

  // A wall-height display shelf: books at hand level, vessels on open shelves.
  const sx = -2.65, sz = -4.46;
  for (const x of [sx - .85, sx + .85]) box(.075, 2.30, .37, x, 1.72, sz, timber, group);
  for (const y of [.62, 1.11, 1.71, 2.30, 2.83]) box(1.78, .066, .39, sx, y, sz, timber, group);
  box(1.70, 2.17, .035, sx, 1.72, sz - .19, darkWood, group);
  box(.057, .54, .37, sx - .15, 1.42, sz, timber, group);
  box(.057, .54, .37, sx + .33, 2.01, sz, timber, group);
  for (const dx of [-.43, .43]) {
    box(.79, .36, .033, sx + dx, .87, sz + .205, timber, group);
    for (const xx of [-.25, .25]) box(.02, .29, .016, sx + dx + xx, .87, sz + .229, lightWood, group, false);
    cyl(.021, .021, .028, sx + dx + (dx > 0 ? -.23 : .23), .89, sz + .245, brass, group, 12).rotation.x = Math.PI / 2;
  }
  const bookColors = ['#657b70', '#9f8965', '#6e8090', '#a49075', '#857264', '#b9b08c', '#62746d'];
  function book(x, bottom, z, width, height, color, tilt = 0) {
    const volume = new THREE.Group(); volume.position.set(x, bottom, z); volume.rotation.z = tilt; group.add(volume);
    const cover = mat(color);
    box(width, height, .25, 0, height / 2, 0, cover, volume, false);
    box(Math.max(.012, width - .016), height - .026, .015, 0, height / 2, -.131, paper, volume, false);
    box(width + .004, .015, .255, 0, .008, 0, cover, volume, false);
    box(width + .004, .015, .255, 0, height - .008, 0, cover, volume, false);
    for (const y of [.085, height - .085]) box(width * .65, .009, .003, 0, y, .127, mat('#d1c39c'), volume, false);
    box(width * .42, Math.min(.13, height * .35), .003, 0, height * .53, .129, mat('#c8be98'), volume, false);
  }
  for (let i = 0; i < 8; i++) book(sx - .72 + i * .079, 1.145, sz + .025, .061 + i % 3 * .007, .34 + i % 4 * .032, bookColors[i % bookColors.length]);
  for (let i = 0; i < 5; i++) book(sx - .70 + i * .11, 2.335, sz + .025, .088, .31 + i % 3 * .04, bookColors[(i + 2) % bookColors.length]);
  for (let i = 0; i < 4; i++) {
    box(.41, .057, .26, sx + .52, 1.18 + i * .061, sz + .02, mat(bookColors[i]), group, false);
    box(.35, .034, .009, sx + .52, 1.18 + i * .061, sz + .155, paper, group, false);
  }
  blueVase(sx - .47, 1.748, sz + .01, .44);
  blueVase(sx + .57, 2.335, sz + .01, .36);
  jar(sx + .23, 1.75, sz + .01, .105, '雨');
  jar(sx + .55, 1.75, sz + .01, .09, '茗');
  pottery([[.03, 0], [.10, .015], [.145, .11], [.16, .13]], sx - .02, 2.335, sz + .015, celadon);
  box(.40, .06, .24, sx + .51, 2.88, sz, mat('#a48c68'), group);
  box(.32, .045, .22, sx + .48, 2.935, sz, paper, group, false);

  // The rear wall carries an original, procedurally painted ink landscape.
  const paintingCanvas = document.createElement('canvas');
  paintingCanvas.width = 512; paintingCanvas.height = 768;
  const pc = paintingCanvas.getContext('2d');
  pc.fillStyle = '#e1d5b5'; pc.fillRect(0, 0, 512, 768);
  let paintSeed = 8261;
  const pr = () => { paintSeed = (paintSeed * 16807) % 2147483647; return (paintSeed - 1) / 2147483646; };
  for (let i = 0; i < 3500; i++) { pc.fillStyle = `rgba(104,96,68,${.015 + pr() * .026})`; pc.fillRect(pr() * 512, pr() * 768, 1 + pr() * 3, 1); }
  function inkMountain(baseY, alpha, shift) {
    pc.fillStyle = `rgba(66,83,78,${alpha})`; pc.beginPath(); pc.moveTo(-10, baseY + 100);
    for (let i = 0; i <= 36; i++) { const x = i / 36 * 532 - 10; const y = baseY - Math.sin(i * .19 + shift) ** 2 * 165 - Math.sin(i * .51 + shift) * 27; pc.lineTo(x, y); }
    pc.lineTo(522, baseY + 100); pc.closePath(); pc.fill();
  }
  inkMountain(338, .13, 2.1); inkMountain(400, .17, .5); inkMountain(506, .23, 1.6);
  pc.strokeStyle = 'rgba(69,87,81,.24)'; pc.lineWidth = 1.4;
  for (let i = 0; i < 16; i++) { const y = 510 + i * 8; pc.beginPath(); pc.moveTo(90 + pr() * 140, y); pc.quadraticCurveTo(280, y - 7, 410 + pr() * 80, y + 3); pc.stroke(); }
  pc.strokeStyle = '#586459'; pc.lineWidth = 6; pc.beginPath(); pc.moveTo(72, 666); pc.quadraticCurveTo(104, 599, 89, 546); pc.stroke();
  for (let i = 0; i < 10; i++) { const y = 560 + i * 8; pc.lineWidth = 2; pc.beginPath(); pc.moveTo(91, y); pc.lineTo(43 + pr() * 92, y - 20 - pr() * 15); pc.stroke(); for (let j = 0; j < 4; j++) { pc.fillStyle = 'rgba(68,85,71,.5)'; pc.beginPath(); pc.ellipse(49 + pr() * 85, y - 24, 14, 4, -.2, 0, Math.PI * 2); pc.fill(); } }
  pc.fillStyle = '#59645a'; pc.beginPath(); pc.moveTo(278, 493); pc.lineTo(325, 469); pc.lineTo(371, 493); pc.closePath(); pc.fill(); pc.fillRect(288, 491, 71, 6); pc.fillRect(294, 494, 4, 28); pc.fillRect(348, 494, 4, 28);
  pc.fillStyle = '#566456'; pc.font = '36px "KaiTi", "STKaiti", "Microsoft YaHei", serif'; pc.textAlign = 'center'; pc.fillText('听', 423, 133); pc.fillText('雨', 423, 180); pc.fillText('闲', 423, 227); pc.fillText('居', 423, 274);
  pc.fillStyle = '#9f6250'; pc.fillRect(406, 304, 32, 35); pc.strokeStyle = '#d9bd9c'; pc.lineWidth = 2; pc.strokeRect(411, 309, 22, 25); pc.beginPath(); pc.moveTo(422, 310); pc.lineTo(422, 332); pc.moveTo(412, 320); pc.lineTo(432, 320); pc.stroke();
  const paintingTexture = new THREE.CanvasTexture(paintingCanvas); paintingTexture.colorSpace = THREE.SRGBColorSpace;
  const paintingMaterial = new THREE.MeshToonMaterial({ color: '#fff5de', map: paintingTexture, gradientMap: timber.gradientMap || null });
  box(1.73, 1.65, .025, -.30, 2.20, -4.75, mat('#a79778'), group);
  const image = mesh(new THREE.PlaneGeometry(1.51, 1.48), paintingMaterial, -.30, 2.20, -4.731);
  image.castShadow = false;
  for (const y of [1.36, 3.04]) {
    const roller = cyl(.037, .037, 1.89, -.30, y, -4.72, darkWood, group, 12); roller.rotation.z = Math.PI / 2;
    for (const x of [-1.26, .66]) { const end = cyl(.05, .05, .055, x, y, -4.72, brass, group, 12); end.rotation.z = Math.PI / 2; }
  }
  line([[-.91, 3.05, -4.73], [-.3, 3.24, -4.76], [.31, 3.05, -4.73]], '#77664e', group);

  // A writing desk faces the open room, with the tools arranged for a right hand.
  const dx = 1.65, dz = -4.14;
  box(1.79, .09, .69, dx, 1.22, dz, timber, group);
  box(1.62, .18, .56, dx, 1.09, dz - .025, darkWood, group);
  for (const xx of [dx - .74, dx + .74]) for (const zz of [dz - .24, dz + .24]) box(.055, .64, .055, xx, .85, zz, timber, group);
  for (const xx of [dx - .4, dx + .4]) {
    box(.72, .135, .025, xx, 1.09, dz + .27, timber, group);
    const pull = ring(.027, .006, xx, 1.09, dz + .296, brass, group); pull.rotation.x = 0;
  }
  const writingCanvas = document.createElement('canvas'); writingCanvas.width = 512; writingCanvas.height = 256;
  const wc = writingCanvas.getContext('2d'); wc.fillStyle = '#e7dcc0'; wc.fillRect(0, 0, 512, 256); wc.fillStyle = '#4b5147'; wc.font = '42px "KaiTi", "STKaiti", "Microsoft YaHei", serif';
  ['一庭烟雨', '半盏清欢'].forEach((s, i) => wc.fillText(s, 50 + i * 205, 82 + i * 66)); wc.fillStyle = '#9c6551'; wc.fillRect(420, 177, 20, 20);
  const writingTexture = new THREE.CanvasTexture(writingCanvas); writingTexture.colorSpace = THREE.SRGBColorSpace;
  const writingPaper = mesh(new THREE.PlaneGeometry(.78, .35), new THREE.MeshToonMaterial({ map: writingTexture, gradientMap: timber.gradientMap || null }), 1.50, 1.272, -4.10); writingPaper.rotation.x = -Math.PI / 2;
  for (const xx of [1.09, 1.91]) { const roll = cyl(.025, .025, .36, xx, 1.287, -4.10, paper, group, 16); roll.rotation.x = Math.PI / 2; }
  box(.27, .032, .16, 2.10, 1.282, -4.04, iron, group);
  box(.18, .008, .105, 2.11, 1.302, -4.04, mat('#242c29'), group, false);
  box(.27, .021, .043, 1.50, 1.290, -3.94, brass, group, false);
  beam([1.38, 1.302, -4.05], [1.76, 1.316, -4.18], .009, darkWood, group, 8);
  beam([1.76, 1.316, -4.18], [1.81, 1.318, -4.195], .013, iron, group, 8);
  pottery([[.065, 0], [.075, .014], [.075, .20], [.078, .214]], 1.05, 1.265, -4.34, bamboo);
  cyl(.06, .06, .006, 1.05, 1.474, -4.34, darkWood, group, 16);
  for (let i = 0; i < 4; i++) {
    const xx = 1.015 + i * .022;
    beam([xx, 1.28, -4.34], [xx + (i - 1.5) * .023, 1.67 + i % 2 * .07, -4.33], .008, lightWood, group);
    const brush = cyl(.011, .004, .065, xx + (i - 1.5) * .023, 1.70 + i % 2 * .07, -4.33, iron, group, 8); brush.rotation.z = -(i - 1.5) * .04;
  }
  // Compact warm paper lamp on the far corner; its pool of light is gentle.
  cyl(.12, .15, .045, 2.28, 1.295, -4.36, darkWood, group, 16);
  cyl(.021, .03, .28, 2.28, 1.445, -4.36, brass, group, 12);
  cyl(.14, .20, .27, 2.28, 1.70, -4.36, warmPaper, group, 12);
  for (const y of [1.565, 1.835]) ring(y < 1.7 ? .202 : .142, .009, 2.28, y, -4.36, darkWood, group);
  for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4; beam([2.28 + Math.cos(a) * .20, 1.565, -4.36 + Math.sin(a) * .20], [2.28 + Math.cos(a) * .14, 1.835, -4.36 + Math.sin(a) * .14], .004, bamboo, group, 5); }
  const deskLight = new THREE.PointLight('#ffc78a', .60, 2.4, 2); deskLight.position.set(2.28, 1.69, -4.20); group.add(deskLight);
  box(.59, .07, .42, 1.52, .93, -3.27, timber, group);
  box(.51, .018, .34, 1.52, .976, -3.27, jade, group, false);
  for (const xx of [1.31, 1.73]) for (const zz of [-3.42, -3.12]) box(.038, .37, .038, xx, .72, zz, timber, group);

  // A daybed below the window, with soft cloth cushions and carved railings.
  const bx = 2.62, bz = -2.30;
  box(1.64, .12, 1.00, bx, .91, bz, timber, group);
  for (const xx of [bx - .70, bx + .70]) for (const zz of [bz - .38, bz + .38]) box(.074, .32, .074, xx, .72, zz, darkWood, group);
  box(1.48, .13, .84, bx, 1.03, bz, jade, group);
  for (const xx of [bx - .78, bx + .78]) {
    box(.045, .46, .045, xx, 1.20, bz - .44, timber, group);
    box(.045, .30, .045, xx, 1.13, bz + .43, timber, group);
    tube([[xx, 1.42, bz - .44], [xx, 1.39, bz], [xx, 1.30, bz + .44]], .023, timber, group);
  }
  box(1.61, .045, .045, bx, 1.41, bz - .45, timber, group);
  box(1.61, .032, .035, bx, 1.15, bz - .45, timber, group);
  for (let i = 0; i < 9; i++) box(.022, .23, .022, bx - .66 + i * .165, 1.28, bz - .45, lightWood, group);
  for (const [xx, color, angle] of [[bx - .43, '#bdad8c', -.08], [bx + .27, '#6d8b7e', .11]]) {
    const pillow = box(.47, .24, .30, xx, 1.19, bz - .22, mat(color), group); pillow.rotation.x = -.16; pillow.rotation.y = angle;
    for (const yy of [1.17, 1.23]) box(.35, .005, .008, xx, yy, bz - .051, mat('#a39d7d'), group, false);
  }
  box(.36, .016, .58, bx + .42, 1.104, bz + .07, mat('#c5bea0'), group, false);
  for (let i = 0; i < 6; i++) line([[bx + .27 + i * .055, 1.114, bz + .36], [bx + .28 + i * .055, 1.106, bz + .42]], '#b4aa89', group);

  // A small closed back-room door and a translucent three-leaf folding screen.
  box(.77, 1.98, .035, 3.12, 1.54, -4.76, darkWood, group);
  box(.65, 1.86, .024, 3.12, 1.54, -4.731, timber, group);
  for (const y of [.78, 1.48, 2.28]) box(.57, .026, .012, 3.12, y, -4.710, lightWood, group, false);
  for (const x of [2.86, 3.38]) box(.022, 1.74, .012, x, 1.54, -4.710, lightWood, group, false);
  const handle = ring(.045, .009, 2.94, 1.48, -4.68, brass, group); handle.rotation.x = 0;
  text('静', .19, .24, 3.13, 2.10, -4.700, { color: '#ddd1aa', size: 104 }, group);
  for (let i = 0; i < 3; i++) {
    const panel = new THREE.Group(); panel.position.set(3.49 - (i % 2) * .055, .58, -3.93 + i * .39); panel.rotation.y = -Math.PI / 2 + (i % 2 ? -.15 : .15); group.add(panel);
    box(.40, 1.48, .025, 0, .76, 0, bamboo, panel);
    box(.34, 1.32, .014, 0, .78, .022, paper, panel, false);
    for (const y of [.22, 1.30]) box(.35, .018, .018, 0, y, .037, timber, panel, false);
    for (let j = 0; j < 3; j++) {
      const xx = -.10 + j * .10;
      line([[xx, .28, .038], [xx - .02, .73, .038], [xx + .015, 1.18, .038]], '#7d8a6d', panel);
      for (let k = 0; k < 3; k++) line([[xx, .48 + k * .22, .039], [xx + (k % 2 ? -.07 : .07), .53 + k * .22, .039]], '#7d8a6d', panel);
    }
    for (const xx of [-.15, .15]) box(.035, .12, .075, xx, .015, 0, timber, panel, false);
  }

  // Sideboard: folded linen, a lidded box, and a single flowering branch.
  box(.85, .61, .42, -3.03, .84, -3.44, timber, group);
  box(.93, .055, .48, -3.03, 1.175, -3.44, darkWood, group);
  for (const x of [-3.23, -2.83]) {
    box(.36, .48, .026, x, .85, -3.211, timber, group);
    box(.014, .40, .012, x - .14, .85, -3.19, lightWood, group, false);
    const pull = ring(.023, .006, x + (x < -3 ? .10 : -.10), .87, -3.177, brass, group); pull.rotation.x = 0;
  }
  for (let i = 0; i < 3; i++) box(.27, .029, .22, -2.79, 1.221 + i * .032, -3.44, mat(i % 2 ? '#c7bda1' : '#a7ac91'), group, false);
  const vase = blueVase(-3.26, 1.21, -3.43, .28);
  tube([[0, .40, 0], [.05, .72, .02], [-.04, 1.03, 0]], .012, darkWood, vase);
  tube([[.035, .67, .01], [.22, .84, .05], [.28, .93, .04]], .008, darkWood, vase);
  for (const [x, y, z] of [[-.04, 1.01, 0], [.02, .90, .02], [.20, .84, .05], [.28, .93, .04]]) {
    for (let k = 0; k < 5; k++) { const a = k * Math.PI * 2 / 5; const petal = sphere(.026, x + Math.cos(a) * .026, y + Math.sin(a) * .026, z, mat('#d4c5b4'), vase, 7, 5); petal.scale.z = .45; }
  }
  // Window-side dwarf foliage in its own small stand.
  box(.37, .035, .32, 3.34, 1.005, -1.65, timber, group);
  for (const x of [3.20, 3.48]) for (const z of [-1.76, -1.54]) box(.027, .46, .027, x, .76, z, darkWood, group);
  pottery([[.08, 0], [.11, .02], [.14, .16], [.145, .18]], 3.34, 1.025, -1.65, mat('#a78a6d'));
  cyl(.126, .126, .012, 3.34, 1.197, -1.65, mat('#5b6450'), group, 16);
  for (let i = 0; i < 9; i++) {
    const a = i * 2.39996, height = .17 + (i % 3) * .06;
    beam([3.34, 1.19, -1.65], [3.34 + Math.cos(a) * .14, 1.22 + height, -1.65 + Math.sin(a) * .12], .005, darkJade, group, 6);
    const leaf = sphere(.065, 3.34 + Math.cos(a) * .14, 1.23 + height, -1.65 + Math.sin(a) * .12, mat(i % 2 ? '#748d6c' : '#8a9c75'), group, 7, 5); leaf.scale.set(.64, 1.3, .30); leaf.rotation.z = Math.cos(a) * .65; leaf.rotation.y = a;
  }

  // One small octagonal palace lamp emphasizes the room's warm vertical space.
  const lx = .94, lz = -3.34;
  beam([lx, 3.27, lz], [lx, 2.94, lz], .009, darkWood, group, 6);
  cyl(.16, .22, .34, lx, 2.76, lz, warmPaper, group, 8);
  for (const y of [2.59, 2.93]) {
    cyl(.22, .22, .025, lx, y, lz, timber, group, 8);
    for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4; sphere(.014, lx + Math.cos(a) * .22, y - .015, lz + Math.sin(a) * .22, brass, group, 6, 4); }
  }
  for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4; beam([lx + Math.cos(a) * .22, 2.59, lz + Math.sin(a) * .22], [lx + Math.cos(a) * .16, 2.93, lz + Math.sin(a) * .16], .008, timber, group, 5); }
  beam([lx, 2.58, lz], [lx, 2.43, lz], .009, brass, group, 6);
  for (let i = 0; i < 5; i++) line([[lx - .014 + i * .007, 2.43, lz], [lx - .015 + i * .007, 2.34, lz]], '#a47f49', group);

  return {
    group,
    steamOrigin: { x: -1.25, y: 1.46, z: -2.61 },
    dynamic: [],
    update() {},
  };
}
