import * as THREE from 'three';
import {mergeGeometries} from 'three/addons/utils/BufferGeometryUtils.js';

/** Merge static surfaces and ink strokes, preserving movable subtrees. */
export function batchStatic(scene,{exclude=[]}={}) {
  const excluded=new Set(exclude),groups=new Map();
  const isExcluded=o=>{
    for(let node=o;node;node=node.parent)if(excluded.has(node)||!node.visible)return true;
    return false;
  };
  const countDrawables=()=>{
    let count=0;scene.traverse(o=>{if(o.isMesh||o.isLine||o.isPoints)count++;});return count;
  };
  const before=countDrawables();
  scene.updateMatrixWorld(true);
  scene.traverse(object=>{
    if(isExcluded(object)||!object.geometry||!object.material||Array.isArray(object.material))return;
    let primitive;
    if(object.isMesh){
      if(object.isSkinnedMesh||object.isInstancedMesh||object.isReflector||object.type==='Reflector'||
         object.material.transparent||object.morphTargetInfluences||Object.keys(object.geometry.morphAttributes).length)return;
      primitive='mesh';
    }else if(object.isLine){
      if(!object.isLineSegments&&Object.keys(object.geometry.attributes).some(k=>k!=='position'))return;
      primitive='lines';
    }else return;
    const signature=Object.keys(object.geometry.attributes).sort().map(name=>{
      const a=object.geometry.attributes[name];
      return [name,a.itemSize,a.normalized,a.array?.constructor.name||a.data?.array?.constructor.name].join(':');
    }).join('|');
    const key=[primitive,object.material.uuid,signature,object.layers.mask,object.renderOrder].join(':');
    if(!groups.has(key))groups.set(key,{primitive,objects:[]});
    groups.get(key).objects.push(object);
  });
  function cloneGeometry(object){
    if(object.isLine&&!object.isLineSegments){
      const source=object.geometry,index=source.index,p=source.attributes.position;
      const count=index?index.count:p.count;
      const segments=object.isLineLoop?count:count-1;
      const positions=new Float32Array(Math.max(0,segments)*6);
      for(let i=0;i<segments;i++){
        const a=index?index.getX(i):i;
        const b=index?index.getX((i+1)%count):(i+1)%count;
        positions.set([p.getX(a),p.getY(a),p.getZ(a),p.getX(b),p.getY(b),p.getZ(b)],i*6);
      }
      const result=new THREE.BufferGeometry();
      result.setAttribute('position',new THREE.BufferAttribute(positions,3));return result;
    }
    return object.geometry.index?object.geometry.toNonIndexed():object.geometry.clone();
  }
  const consumed=new Set(),results=[];
  for(const {primitive,objects} of groups.values()){
    if(objects.length<2)continue;
    const temporary=[];
    try{
      for(const object of objects){
        const geometry=cloneGeometry(object);geometry.applyMatrix4(object.matrixWorld);temporary.push(geometry);
      }
      const geometry=mergeGeometries(temporary,false);
      if(!geometry)continue;
      geometry.computeBoundingBox();geometry.computeBoundingSphere();
      const batch=primitive==='lines'?new THREE.LineSegments(geometry,objects[0].material):new THREE.Mesh(geometry,objects[0].material);
      batch.name='static-'+primitive+'-batch-'+objects.length;
      batch.castShadow=objects.some(o=>o.castShadow);batch.receiveShadow=objects.some(o=>o.receiveShadow);
      batch.frustumCulled=objects.every(o=>o.frustumCulled);
      batch.layers.mask=objects[0].layers.mask;batch.renderOrder=objects[0].renderOrder;
      results.push(batch);objects.forEach(o=>consumed.add(o));
    }finally{temporary.forEach(g=>g.dispose());}
  }
  for(const object of consumed)for(const child of [...object.children]){
    if(!consumed.has(child))scene.attach(child);
  }
  for(const object of consumed)object.removeFromParent();
  scene.add(...results);
  return{before,after:countDrawables(),batched:consumed.size};
}