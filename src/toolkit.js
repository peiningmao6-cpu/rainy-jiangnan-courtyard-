import * as THREE from 'three';

export function createToolkit(scene, renderer) {
  let seed = 271828;
  function rand() {
    seed = (seed * 16807) % 2147483647;
    return (seed - 1) / 2147483646;
  }
  const palette = {
    ink: '#23373e', plaster: '#d1d4c6', timber: '#815b43', roof: '#455d63',
    roofLight: '#607476', jade: '#719789', amber: '#efbd7c', stone: '#71858a'
  };
  const rampCanvas = document.createElement('canvas');
  rampCanvas.width = 4; rampCanvas.height = 1;
  const rampCtx = rampCanvas.getContext('2d');
  ['#718591', '#a8b6b6', '#d7dfcf', '#fff7df'].forEach((color, i) => {
    rampCtx.fillStyle = color; rampCtx.fillRect(i, 0, 1, 1);
  });
  const ramp = new THREE.CanvasTexture(rampCanvas);
  ramp.minFilter = ramp.magFilter = THREE.NearestFilter;
  const materialCache = new Map();
  function mat(color, opts = {}) {
    const key = color + JSON.stringify(opts, (name, value) => value?.isTexture ? value.uuid : value);
    if (!materialCache.has(key)) {
      materialCache.set(key, new THREE.MeshToonMaterial({ color, gradientMap: ramp, ...opts }));
    }
    return materialCache.get(key);
  }
  function texture(draw, w = 512, h = 256) {
    const canvas = document.createElement('canvas');
    canvas.width = w; canvas.height = h;
    draw(canvas.getContext('2d'), w, h);
    const map = new THREE.CanvasTexture(canvas);
    map.colorSpace = THREE.SRGBColorSpace;
    map.anisotropy = Math.min(renderer.capabilities.getMaxAnisotropy(), 4);
    return map;
  }
  const woodMap = texture((c, w, h) => {
    c.fillStyle = '#a88c6c'; c.fillRect(0, 0, w, h);
    for (let i = 0; i < 120; i++) {
      const y = rand() * h;
      c.strokeStyle = i % 3 ? 'rgba(62,40,28,.10)' : 'rgba(244,214,160,.12)';
      c.lineWidth = .3 + rand() * 1.1; c.beginPath();
      for (let x = 0; x <= w; x += 12) {
        const yy = y + Math.sin(x / 65 + i) * (1 + Math.sin(i) * .7);
        if (!x) c.moveTo(x, yy); else c.lineTo(x, yy);
      }
      c.stroke();
    }
  });
  const wallMap = texture((c, w, h) => {
    c.fillStyle = '#eef0df'; c.fillRect(0, 0, w, h);
    for (let i = 0; i < 1200; i++) {
      const alpha = .01 + rand() * .025;
      c.fillStyle = 'rgba(75,97,88,' + alpha + ')';
      c.fillRect(rand() * w, rand() * h, 1 + rand() * 5, 1 + rand() * 4);
    }
    const stain = c.createLinearGradient(0, h * .58, 0, h);
    stain.addColorStop(0, 'rgba(87,111,99,0)');
    stain.addColorStop(1, 'rgba(87,111,99,.15)');
    c.fillStyle = stain; c.fillRect(0, 0, w, h);
  });
  const stoneMap = texture((c, w, h) => {
    c.fillStyle = '#a8b5b3'; c.fillRect(0, 0, w, h);
    for (let i = 0; i < 9500; i++) {
      c.fillStyle = i % 2 ? 'rgba(20,48,58,.07)' : 'rgba(231,236,211,.10)';
      c.fillRect(rand() * w, rand() * h, 1 + rand() * 2, 1 + rand() * 1.3);
    }
  });
  const wood = mat('#a28160', { map: woodMap });
  const wall = mat('#d9dacc', { map: wallMap });
  const stone = new THREE.MeshStandardMaterial({
    color: '#899a9b', map: stoneMap, roughness: .39, metalness: .09
  });
  const ink = new THREE.LineBasicMaterial({ color: palette.ink, transparent: true, opacity: .40 });
  const geometryCache = new Map();
  function attachMesh(geometry, material, x, y, z, parent, edge) {
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(x, y, z);
    mesh.castShadow = true; mesh.receiveShadow = true;
    parent.add(mesh);
    if (edge) {
      const edgeKey = 'edge:' + geometry.uuid;
      if (!geometryCache.has(edgeKey)) geometryCache.set(edgeKey, new THREE.EdgesGeometry(geometry, 28));
      mesh.add(new THREE.LineSegments(geometryCache.get(edgeKey), ink));
    }
    return mesh;
  }
  function box(w, h, d, x, y, z, material, parent = scene, edge = true) {
    const key = 'b:' + [w, h, d].join(',');
    if (!geometryCache.has(key)) geometryCache.set(key, new THREE.BoxGeometry(w, h, d));
    return attachMesh(geometryCache.get(key), material, x, y, z, parent, edge);
  }
  function cyl(rt, rb, h, x, y, z, material, parent = scene, segments = 12) {
    const key = 'c:' + [rt, rb, h, segments].join(',');
    if (!geometryCache.has(key)) geometryCache.set(key, new THREE.CylinderGeometry(rt, rb, h, segments));
    return attachMesh(geometryCache.get(key), material, x, y, z, parent, false);
  }
  function sphere(r, x, y, z, material, parent = scene, wSeg = 12, hSeg = 8) {
    const key = 's:' + [r, wSeg, hSeg].join(',');
    if (!geometryCache.has(key)) geometryCache.set(key, new THREE.SphereGeometry(r, wSeg, hSeg));
    return attachMesh(geometryCache.get(key), material, x, y, z, parent, false);
  }
  function beam(a, b, radius, material, parent = scene, segments = 8) {
    const va = new THREE.Vector3(...a), vb = new THREE.Vector3(...b);
    const mesh = cyl(radius, radius, va.distanceTo(vb), 0, 0, 0, material, parent, segments);
    mesh.position.copy(va).add(vb).multiplyScalar(.5);
    mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), vb.sub(va).normalize());
    return mesh;
  }
  const lineMaterials = new Map();
  function line(points, colorOrMaterial, parent = scene) {
    let material = colorOrMaterial;
    if (!colorOrMaterial?.isMaterial) {
      if (!lineMaterials.has(colorOrMaterial)) {
        lineMaterials.set(colorOrMaterial, new THREE.LineBasicMaterial({ color: colorOrMaterial }));
      }
      material = lineMaterials.get(colorOrMaterial);
    }
    const mesh = new THREE.Line(
      new THREE.BufferGeometry().setFromPoints(points.map(p => p.isVector3 ? p : new THREE.Vector3(...p))),
      material
    );
    parent.add(mesh); return mesh;
  }
  function text(content, w, h, x, y, z, opts = {}, parent = scene) {
    const canvas = document.createElement('canvas');
    canvas.height = w / h < .5 ? 1024 : 256; canvas.width = Math.max(32, Math.round(w / h * canvas.height));
    const c = canvas.getContext('2d');
    if (opts.bg) { c.fillStyle = opts.bg; c.fillRect(0, 0, canvas.width, canvas.height); }
    c.textAlign = 'center'; c.textBaseline = 'middle';
    c.fillStyle = opts.color || '#e8d5a6';
    const rows = String(content).replaceAll('\\n', '\n').split('\n');
    let size = opts.size || Math.floor(canvas.height * .80 / rows.length);
    const suppliedFamily = opts.font || '"KaiTi", "STKaiti", "Microsoft YaHei", serif';
    const family = suppliedFamily.replace(/^.*?\d+(?:\.\d+)?px\s*/, '');
    do { c.font = '600 ' + size + 'px ' + family; size--; }
    while (Math.max(...rows.map(row => c.measureText(row).width)) > canvas.width * .91 && size > 10);
    rows.forEach((row, i) => c.fillText(row, canvas.width / 2,
      canvas.height / 2 + (i - (rows.length - 1) / 2) * canvas.height * .83 / rows.length));
    const map = new THREE.CanvasTexture(canvas); map.colorSpace = THREE.SRGBColorSpace;
    const material = new THREE.MeshBasicMaterial({
      map, transparent: true, depthWrite: false, side: THREE.DoubleSide, toneMapped: false
    });
    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(w, h), material);
    mesh.position.set(x, y, z);
    mesh.rotation.y = opts.rotationY || 0; mesh.rotation.x = opts.rotationX || 0;
    parent.add(mesh); return mesh;
  }
  return { THREE, scene, renderer, palette, rand, mat, box, cyl, sphere, beam, line, text, wood, wall, stone, texture };
}
