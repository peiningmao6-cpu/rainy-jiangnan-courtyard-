import * as THREE from 'three';

export function buildAtmosphere(ctx, architecture, interior, garden, reducedMotion) {
  const {scene,rand}=ctx;
  const group=new THREE.Group(); group.name='细雨、滴水、水纹与茶烟'; scene.add(group);
  const count=reducedMotion?280:800;
  const rainPositions=new Float32Array(count*6), drops=[];
  const rainGeometry=new THREE.BufferGeometry();
  rainGeometry.setAttribute('position',new THREE.BufferAttribute(rainPositions,3));
  const rain=new THREE.LineSegments(rainGeometry,new THREE.LineBasicMaterial({
    color:'#c3dce1',transparent:true,opacity:.145,depthWrite:false
  }));
  rain.name='只落在屋顶与露天院落的雨'; rain.frustumCulled=false; group.add(rain);
  for(let i=0;i<count;i++)drops.push({
    x:rand()*11.9-5.95,z:rand()*11.9-5.95,y:.25+rand()*8,
    speed:4.5+rand()*2.7,len:.12+rand()*.15
  });
  const roofDrops=[];
  const dripMaterial=new THREE.MeshBasicMaterial({
    color:'#d4e4d9',transparent:true,opacity:.37,depthWrite:false
  });
  const dripGeometry=new THREE.CylinderGeometry(.004,.007,.10,5);
  const sources=[...(architecture.dripSources||[]),...(garden.leafDrips||[])];
  for(const source of sources) {
    if(!Number.isFinite(source.x)||!Number.isFinite(source.y)||!Number.isFinite(source.z))continue;
    const mesh=new THREE.Mesh(dripGeometry,dripMaterial);
    group.add(mesh);
    roofDrops.push({mesh,source,phase:rand()*2.6,speed:.55+rand()*.50});
  }
  const rings=[],ringGeometry=new THREE.RingGeometry(.94,1,32);
  function addRipple(x,z,y,pond=false) {
    const mesh=new THREE.Mesh(ringGeometry,new THREE.MeshBasicMaterial({
      color:pond?'#aac5b5':'#a8c1ca',transparent:true,opacity:0,
      depthWrite:false,side:THREE.DoubleSide
    }));
    mesh.rotation.x=-Math.PI/2; mesh.position.set(x,y,z); group.add(mesh);
    rings.push({mesh,phase:rand()*3,duration:1.9+rand()*1.4,pond});
  }
  const pond={x:3,z:3.5,rx:1.6,rz:1.25,y:.25,...garden.pond};
  for(let i=0;i<18;i++){
    const a=rand()*Math.PI*2,r=Math.sqrt(rand())*.83;
    addRipple(pond.x+Math.cos(a)*pond.rx*r,pond.z+Math.sin(a)*pond.rz*r,pond.y+.012,true);
  }
  for(const p of garden.puddles||[]) {
    addRipple(p.x,p.z,(p.y||.18)+.012);
    addRipple(p.x+(rand()-.5)*(p.rx||.4),p.z+(rand()-.5)*(p.rz||.3),(p.y||.18)+.013);
  }
  for(const [x,z] of [[-.6,4.5],[-1,3.5],[-.2,1.4],[-2.7,3.8],[.6,.1],[-4.8,4.7],[4.9,4.9]]) {
    if(!(architecture.shelterAt?.(x,z)>0))addRipple(x,z,.214);
  }
  const windowDrops=[];
  for(const pane of architecture.glassPanes||[]) {
    const paneGroup=new THREE.Group(); paneGroup.position.set(pane.x,pane.y,pane.z+.012);
    paneGroup.rotation.y=pane.rotationY||0; group.add(paneGroup);
    for(let i=0;i<7;i++){
      const line=new THREE.Line(new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(0,0,0),new THREE.Vector3(.006,-.075-rand()*.08,0)
      ]),new THREE.LineBasicMaterial({color:'#d6e5d4',transparent:true,opacity:.20,depthWrite:false}));
      const h=pane.h||1.2;
      line.position.x=(rand()-.5)*(pane.w||.6)*.88;
      paneGroup.add(line); windowDrops.push({mesh:line,h,phase:rand()*h,speed:.027+rand()*.055});
    }
  }
  const steamCanvas=document.createElement('canvas');steamCanvas.width=steamCanvas.height=96;
  const sc=steamCanvas.getContext('2d');
  const cloud=sc.createRadialGradient(48,48,2,48,48,46);
  cloud.addColorStop(0,'rgba(249,239,212,.40)');
  cloud.addColorStop(.38,'rgba(241,232,211,.16)');
  cloud.addColorStop(1,'rgba(241,232,211,0)');
  sc.fillStyle=cloud;sc.fillRect(0,0,96,96);
  const steamTexture=new THREE.CanvasTexture(steamCanvas);
  const steam=[],origin=interior.steamOrigin||{x:-1.25,y:1.46,z:-2.61};
  for(let i=0;i<12;i++){
    const mesh=new THREE.Sprite(new THREE.SpriteMaterial({
      map:steamTexture,color:'#f5e9cd',transparent:true,opacity:0,depthWrite:false
    }));
    mesh.name='壶口一缕茶烟';group.add(mesh);steam.push({mesh,phase:i/12});
  }
  function update(t,dt) {
    for(let i=0;i<drops.length;i++){
      const d=drops[i];d.y-=d.speed*dt;
      const roof=architecture.shelterAt?.(d.x,d.z)||0;
      if(d.y<Math.max(.18,roof)){
        d.y=7.8+rand()*.8;d.x=rand()*11.9-5.95;d.z=rand()*11.9-5.95;
      }
      const index=i*6;
      rainPositions[index]=d.x;rainPositions[index+1]=d.y;rainPositions[index+2]=d.z;
      rainPositions[index+3]=d.x+.021;rainPositions[index+4]=d.y-d.len;rainPositions[index+5]=d.z+.008;
    }
    rainGeometry.attributes.position.needsUpdate=true;
    for(const d of roofDrops){
      const phase=(t*d.speed+d.phase)%1;
      const x=d.source.x,z=d.source.z;
      const raised=(Math.abs(x)<=4.1&&z>=-5.1&&z<=-.92)||(x>=-5.38&&x<=-3.65&&z>=-1.75&&z<=2.22);
      const floor=raised?.53:.18;
      const range=Math.max(.1,d.source.y-floor);
      d.mesh.position.set(d.source.x+.008*Math.sin(t+d.phase),d.source.y-phase*phase*range,d.source.z);
      d.mesh.scale.y=.35+phase*1.1;
      d.mesh.material.opacity=.37;
    }
    for(const r of rings){
      const progress=((t+r.phase)%r.duration)/r.duration;
      const size=.025+progress*(r.pond?.32:.24);
      r.mesh.scale.setScalar(size);
      r.mesh.material.opacity=Math.sin(progress*Math.PI)*(r.pond?.21:.16);
    }
    for(const d of windowDrops)d.mesh.position.y=d.h/2-((t*d.speed+d.phase)%d.h);
    for(const s of steam){
      const progress=(t*.19+s.phase)%1;
      s.mesh.position.set(origin.x+Math.sin(progress*8+s.phase*3)*.035,origin.y+progress*.66,origin.z+Math.cos(progress*6)*.02);
      s.mesh.scale.setScalar(.07+progress*.23);
      s.mesh.material.opacity=Math.sin(progress*Math.PI)*.19;
      s.mesh.material.rotation=Math.sin(t*.15+s.phase)*.3;
    }
  }
  update(0,0);
  return{group,update,rainCount:count,rippleCount:rings.length};
}