import * as THREE from 'three';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';
import {EffectComposer} from 'three/addons/postprocessing/EffectComposer.js';
import {RenderPass} from 'three/addons/postprocessing/RenderPass.js';
import {UnrealBloomPass} from 'three/addons/postprocessing/UnrealBloomPass.js';
import {OutputPass} from 'three/addons/postprocessing/OutputPass.js';
import {Reflector} from 'three/addons/objects/Reflector.js';
import {mergeGeometries} from 'three/addons/utils/BufferGeometryUtils.js';
import {createToolkit} from './toolkit.js';
import {buildArchitecture} from './architecture.js';
import {buildInterior} from './interior.js';
import {buildGarden} from './garden.js';
import {buildAtmosphere} from './atmosphere.js';
import {batchStatic} from './batch.js';
import './style.css';

const scene=new THREE.Scene();
scene.name='听雨小筑 · 雨夜中式庭院';
const canvas=document.createElement('canvas');canvas.width=canvas.height=512;
const bg=canvas.getContext('2d');
const vignette=bg.createRadialGradient(255,208,22,256,256,365);
vignette.addColorStop(0,'#314752');vignette.addColorStop(.52,'#233947');vignette.addColorStop(1,'#10202e');
bg.fillStyle=vignette;bg.fillRect(0,0,512,512);
const backdrop=new THREE.CanvasTexture(canvas);backdrop.colorSpace=THREE.SRGBColorSpace;scene.background=backdrop;
scene.fog=new THREE.FogExp2('#233947',.009);

const renderer=new THREE.WebGLRenderer({antialias:true,alpha:false,powerPreference:'high-performance'});
renderer.setPixelRatio(Math.min(devicePixelRatio,1.6));renderer.setSize(innerWidth,innerHeight);
renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;
renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.05;
renderer.outputColorSpace=THREE.SRGBColorSpace;
renderer.domElement.setAttribute('aria-label','听雨小筑；鼠标拖拽旋转、滚轮缩放、右键平移，双击恢复视角');
renderer.domElement.setAttribute('role','img');
document.getElementById('world').appendChild(renderer.domElement);

const camera=new THREE.PerspectiveCamera(36,innerWidth/innerHeight,.1,120);
const target=new THREE.Vector3(0,1.1,0);
const direction=new THREE.Vector3(14,11.7,17).normalize();
camera.position.copy(target).addScaledVector(direction,25);
const controls=new OrbitControls(camera,renderer.domElement);
controls.target.copy(target);controls.enableDamping=true;controls.dampingFactor=.065;
controls.minDistance=8;controls.maxDistance=48;controls.minPolarAngle=.18;
controls.maxPolarAngle=Math.PI/2.12;controls.rotateSpeed=.6;controls.panSpeed=.55;controls.zoomSpeed=.8;
controls.update();
const composer=new EffectComposer(renderer);
composer.addPass(new RenderPass(scene,camera));
composer.addPass(new UnrealBloomPass(new THREE.Vector2(innerWidth,innerHeight),.23,.34,1.04));
composer.addPass(new OutputPass());
const ctx=createToolkit(scene,renderer);
const {mat,box}=ctx;
const baseShape=new THREE.Shape();
const side=12.2,half=side/2,r=.16;
baseShape.moveTo(-half+r,-half);baseShape.lineTo(half-r,-half);
baseShape.quadraticCurveTo(half,-half,half,-half+r);baseShape.lineTo(half,half-r);
baseShape.quadraticCurveTo(half,half,half-r,half);baseShape.lineTo(-half+r,half);
baseShape.quadraticCurveTo(-half,half,-half,half-r);baseShape.lineTo(-half,-half+r);
baseShape.quadraticCurveTo(-half,-half,-half+r,-half);
const baseGeometry=new THREE.ExtrudeGeometry(baseShape,{
  depth:.65,bevelEnabled:true,bevelSize:.035,bevelThickness:.035,bevelSegments:2,curveSegments:6,steps:1
});
baseGeometry.rotateX(-Math.PI/2);
const base=new THREE.Mesh(baseGeometry,mat('#354b54'));
base.position.y=-.73;base.castShadow=true;base.receiveShadow=true;base.name='完整方形微缩底座';scene.add(base);
box(12.12,.13,12.12,0,.055,0,mat('#586f70'));
box(12.22,.035,12.22,0,-.12,0,mat('#8b9c91'),scene,false);
box(12.12,.012,.012,0,-.42,6.115,mat('#4e656b'),scene,false);

const architecture=buildArchitecture(ctx);
const interior=buildInterior(ctx);
const garden=buildGarden(ctx);
scene.add(new THREE.HemisphereLight('#c6d8dd','#677c75',1.65));
const moon=new THREE.DirectionalLight('#c3dce6',2.45);
moon.position.set(-5,12,7);moon.castShadow=true;
moon.shadow.mapSize.set(2048,2048);
Object.assign(moon.shadow.camera,{left:-9,right:9,top:9,bottom:-9,near:.5,far:32});
moon.shadow.bias=-.0003;moon.shadow.normalBias=.025;moon.shadow.radius=4;scene.add(moon);
const roomLight=new THREE.PointLight('#ffd095',16,8,2);roomLight.position.set(-1.4,2.55,-2.9);scene.add(roomLight);
const studyLight=new THREE.PointLight('#ffd69c',8,6,2);studyLight.position.set(2.2,2.2,-3.4);scene.add(studyLight);
const doorLight=new THREE.PointLight('#ffc88f',3.5,4.8,2);doorLight.position.set(.05,1.8,-.9);scene.add(doorLight);

const reflectionLevel=.23;
const reflectionPatches=[{...garden.pond,rx:garden.pond.rx*.94,rz:garden.pond.rz*.94},...(garden.puddles||[])];
const patchGeometries=reflectionPatches.map(p=>{
  const shape=new THREE.Shape();
  for(let i=0;i<40;i++){
    const a=i/40*Math.PI*2,variation=1+Math.sin(a*3+.4)*.045;
    const x=p.x+Math.cos(a)*p.rx*variation,z=p.z+Math.sin(a)*p.rz*variation;
    if(i===0)shape.moveTo(x,-z);else shape.lineTo(x,-z);
  }
  shape.closePath();
  const geometry=new THREE.ShapeGeometry(shape,8);
  geometry.translate(0,0,p.y+.004-reflectionLevel);
  return geometry;
});
const reflectionGeometry=mergeGeometries(patchGeometries,false);
patchGeometries.forEach(g=>g.dispose());
const reflection=new Reflector(reflectionGeometry,{
  color:0x617b80,textureWidth:768,textureHeight:768,clipBias:.004,multisample:0
});
reflection.rotation.x=-Math.PI/2;reflection.position.y=reflectionLevel;reflection.name='荷池与积水中的柔和实时倒影';
reflection.material.transparent=true;reflection.material.depthWrite=false;
reflection.material.fragmentShader=reflection.material.fragmentShader.replace(
  'vec4 base = texture2DProj( tDiffuse, vUv );',
  'vec2 uv = vUv.xy / vUv.w; uv.x += sin(uv.y * 1350.0) * .0013; vec4 base = texture2D(tDiffuse,uv) * .50; base += texture2D(tDiffuse,uv+vec2(.002,.0015)) * .25; base += texture2D(tDiffuse,uv-vec2(.002,.0015)) * .25;'
).replace('vec4( blendOverlay( base.rgb, color ), 1.0 )','vec4( blendOverlay( base.rgb, color ), .20 )');
scene.add(reflection);
const shadowMap=ctx.texture((c,w,h)=>{
  const g=c.createRadialGradient(w/2,h/2,w*.16,w/2,h/2,w*.49);
  g.addColorStop(0,'rgba(0,0,0,.85)');g.addColorStop(.6,'rgba(0,0,0,.45)');g.addColorStop(1,'rgba(0,0,0,0)');
  c.fillStyle=g;c.fillRect(0,0,w,h);
},256,256);
const displayShadow=new THREE.Mesh(new THREE.PlaneGeometry(17.8,17.8),new THREE.MeshBasicMaterial({
  map:shadowMap,color:'#08121b',transparent:true,opacity:.6,depthWrite:false
}));
displayShadow.rotation.x=-Math.PI/2;displayShadow.position.y=-.805;scene.add(displayShadow);
const dynamic=[...(architecture.dynamic||[]),...(interior.dynamic||[]),...(garden.dynamic||[])];
const batching=batchStatic(scene,{exclude:dynamic});
const reducedMotion=matchMedia('(prefers-reduced-motion: reduce)').matches;
const atmosphere=buildAtmosphere(ctx,architecture,interior,garden,reducedMotion);
const pointLights=[];
scene.traverse(o=>{if(o.isPointLight)pointLights.push({light:o,intensity:o.intensity,phase:pointLights.length*.71});});

let fittedDistance=0;
function fit(reset=false){
  renderer.setSize(innerWidth,innerHeight);composer.setSize(innerWidth,innerHeight);
  camera.aspect=innerWidth/innerHeight;camera.fov=innerWidth/innerHeight<.85?45:36;camera.updateProjectionMatrix();
  const v=direction;
  const right=new THREE.Vector3().crossVectors(camera.up,v).normalize();
  const up=new THREE.Vector3().crossVectors(v,right).normalize();
  const tanV=Math.tan(THREE.MathUtils.degToRad(camera.fov)/2),tanH=tanV*camera.aspect;
  let next=0;
  for(const x of [-6.35,6.35])for(const y of [-.85,5.1])for(const z of [-6.35,6.35]){
    const p=new THREE.Vector3(x,y,z).sub(target);
    next=Math.max(next,p.dot(v)+Math.abs(p.dot(right))/tanH,p.dot(v)+Math.abs(p.dot(up))/tanV);
  }
  next*=1.04;
  const damping=controls.enableDamping;
  if(reset){controls.enableDamping=false;controls.update();}
  if(reset||!fittedDistance){
    controls.target.copy(target);camera.position.copy(target).addScaledVector(direction,next);
  }else camera.position.sub(controls.target).multiplyScalar(next/fittedDistance).add(controls.target);
  fittedDistance=next;controls.maxDistance=Math.max(48,next*1.7);controls.update();controls.enableDamping=damping;
}
addEventListener('resize',()=>fit());
renderer.domElement.addEventListener('contextmenu',e=>e.preventDefault());
renderer.domElement.addEventListener('dblclick',()=>fit(true));
fit(true);

renderer.info.autoReset=false;
let elapsed=0,renderedFrames=0,lastFrame=0;
const clock=new THREE.Clock();
function animate(now){
  requestAnimationFrame(animate);
  if(now-lastFrame<1000/40)return;
  lastFrame=now;
  const dt=Math.min(clock.getDelta(),.06);elapsed+=dt;
  controls.update();
  architecture.update?.(elapsed,dt,reducedMotion);
  interior.update?.(elapsed,dt,reducedMotion);
  garden.update?.(elapsed,dt,reducedMotion);
  atmosphere.update(elapsed,dt);
  for(const item of pointLights)item.light.intensity=item.intensity*(.995+.005*Math.sin(elapsed*.63+item.phase)*Math.sin(elapsed*.23+item.phase));
  renderer.info.reset();composer.render();
  if(++renderedFrames===3){
    document.documentElement.dataset.ready='true';dispatchEvent(new Event('scene-ready'));
  }
}
requestAnimationFrame(animate);
window.__courtyard={
  scene,camera,controls,renderer,architecture,interior,garden,atmosphere,batching,
  ready:()=>document.documentElement.dataset.ready==='true',
  reset:()=>fit(true),
  get stats(){return{
    elapsed,renderedFrames,drawCalls:renderer.info.render.calls,triangles:renderer.info.render.triangles,
    geometries:renderer.info.memory.geometries,textures:renderer.info.memory.textures,
    rainCount:atmosphere.rainCount,rippleCount:atmosphere.rippleCount,
    reducedMotion
  };}
};