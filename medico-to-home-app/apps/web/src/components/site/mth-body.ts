/* eslint-disable */
// @ts-nocheck
// The prototype's 3D body, browser only.
(function(){
const FOCUS={
 knee:{t:[0,.45,0],dir:[.5,.25,1],dist:2.7,hl:['thighR','shinR','kneeR'],hs:[['Quadriceps',[.12,.64,.1],[0,0,1]],['Knee joint',[.12,.43,.1],[0,0,1]],['Hamstrings',[.12,.62,-.1],[0,0,-1]]]},
 back:{t:[0,1.05,0],dir:[.45,.2,-1],dist:3.4,hl:['torso','pelvis'],hs:[['Neck (cervical)',[0,1.48,-.08],[0,0,-1]],['Upper back',[0,1.28,-.15],[0,0,-1]],['Lower back (lumbar)',[0,.95,-.14],[0,0,-1]]]},
 stroke:{t:[0,1.0,0],dir:[.3,.15,1],dist:4.6,hl:['head','uArmR','fArmR','thighR','shinR'],hs:[['Brain',[0,1.78,.05],[0,.6,1]],['Arm control',[.42,1.0,.06],[1,0,1]],['Balance & gait',[.12,.2,.09],[0,0,1]]]},
 shoulder:{t:[.3,1.3,0],dir:[1,.25,.6],dist:2.4,hl:['uArmR','shR'],hs:[['Rotator cuff',[.37,1.39,.04],[1,.3,.5]],['Shoulder blade',[.22,1.32,-.13],[.3,0,-1]]]},
 speech:{t:[0,1.56,0],dir:[.35,.1,1],dist:1.8,hl:['head','neck'],hs:[['Lips & tongue',[0,1.56,.21],[0,0,1]],['Throat (swallow)',[0,1.42,.08],[0,0,1]]]},
 ot:{t:[.42,.92,0],dir:[.6,.2,1],dist:2.3,hl:['fArmR','handR'],hs:[['Elbow',[.41,1.08,.05],[0,0,1]],['Wrist',[.44,.87,.05],[0,0,1]],['Hand & grip',[.46,.77,.05],[0,0,1]]]},
};
class MthBody extends HTMLElement{
 static get observedAttributes(){return['focus']}
 attributeChangedCallback(){if(this._ready)this.setFocus(this.getAttribute('focus')||'knee')}
 connectedCallback(){if(this._init)return;this._init=1;this.style.display='block';this.style.position='absolute';this.style.inset='0';this.style.borderRadius='inherit';
  this.wrap=document.createElement('div');this.wrap.style.cssText='position:absolute;inset:0;overflow:hidden;border-radius:inherit';this.appendChild(this.wrap);
  this.lab=document.createElement('div');this.lab.style.cssText='position:absolute;inset:0;pointer-events:none;font-family:Inter,system-ui,sans-serif';this.appendChild(this.lab);
  this.load()}
 disconnectedCallback(){this._dead=1;cancelAnimationFrame(this._raf);this.ro&&this.ro.disconnect();this.renderer&&this.renderer.dispose()}
 async load(){
  const T=await import('three');const {OrbitControls}=await import('three/examples/jsm/controls/OrbitControls.js');
  if(this._dead)return;this.T=T;
  const r=this.renderer=new T.WebGLRenderer({antialias:true,alpha:true});r.setPixelRatio(Math.min(2,devicePixelRatio));r.shadowMap.enabled=true;r.shadowMap.type=T.PCFSoftShadowMap;r.outputColorSpace=T.SRGBColorSpace;this.wrap.appendChild(r.domElement);r.domElement.style.cssText='width:100%;height:100%;display:block;cursor:grab';
  const sc=this.scene=new T.Scene();
  const cam=this.cam=new T.PerspectiveCamera(32,1,.05,50);cam.position.set(1,1.3,3.2);
  sc.add(new T.HemisphereLight(0xffffff,0xdfe2ec,1.6));
  const key=new T.DirectionalLight(0xffffff,1.6);key.position.set(2,4,3);key.castShadow=true;key.shadow.mapSize.set(1024,1024);key.shadow.camera.left=-2;key.shadow.camera.right=2;key.shadow.camera.top=2;key.shadow.camera.bottom=-2;key.shadow.radius=6;sc.add(key);
  const fill=new T.DirectionalLight(0xffffff,.6);fill.position.set(-3,2,-2);sc.add(fill);
  const g=new T.Mesh(new T.PlaneGeometry(8,8),new T.ShadowMaterial({opacity:.10}));g.rotation.x=-Math.PI/2;g.receiveShadow=true;sc.add(g);
  const disc=new T.Mesh(new T.CircleGeometry(.75,64),new T.MeshBasicMaterial({color:0xe9ebf2}));disc.rotation.x=-Math.PI/2;disc.position.y=.001;sc.add(disc);
  this.base=new T.MeshStandardMaterial({color:0xcfd2dd,roughness:.55,metalness:0});
  this.hlMat=new T.MeshStandardMaterial({color:0x8a90c4,roughness:.5,metalness:0,emissive:0x1a2070,emissiveIntensity:.15});
  this.parts={};const body=this.body=new T.Group();sc.add(body);
  const V=(a)=>new T.Vector3(...a);
  const limb=(name,a,b,rad)=>{const A=V(a),B=V(b);const len=A.distanceTo(B);const m=new T.Mesh(new T.CapsuleGeometry(rad,len,8,20),this.base);m.position.copy(A).add(B).multiplyScalar(.5);m.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),B.clone().sub(A).normalize());m.castShadow=true;body.add(m);this.parts[name]=m;return m};
  const ball=(name,p,rad,sx=1,sy=1,sz=1)=>{const m=new T.Mesh(new T.SphereGeometry(rad,32,24),this.base);m.position.copy(V(p));m.scale.set(sx,sy,sz);m.castShadow=true;body.add(m);this.parts[name]=m;return m};
  ball('head',[0,1.62,0],.13,.92,1.08,1);limb('neck',[0,1.42,0],[0,1.5,0],.05);
  limb('torso',[0,1.02,0],[0,1.3,0],.2).scale.set(1.18,1,.68);limb('pelvis',[0,.86,0],[0,.92,0],.17).scale.set(1.05,1,.7);
  for(const s of [1,-1]){const k=s>0?'R':'L';ball('sh'+k,[.3*s,1.37,0],.075);limb('uArm'+k,[.33*s,1.34,0],[.4*s,1.08,.01],.055);limb('fArm'+k,[.4*s,1.08,.01],[.44*s,.87,.04],.045);ball('hand'+k,[.455*s,.78,.045],.05,.75,1.25,.55);
   limb('thigh'+k,[.11*s,.8,0],[.12*s,.45,.02],.08);ball('knee'+k,[.12*s,.43,.03],.068);limb('shin'+k,[.12*s,.42,.02],[.12*s,.09,0],.06);const f=new T.Mesh(new T.CapsuleGeometry(.045,.12,6,12),this.base);f.rotation.x=Math.PI/2;f.position.set(.12*s,.045,.05);f.castShadow=true;body.add(f)}
  const ctl=this.ctl=new OrbitControls(cam,r.domElement);ctl.enableDamping=true;ctl.dampingFactor=.08;ctl.minDistance=.7;ctl.maxDistance=7;ctl.maxPolarAngle=Math.PI*.55;ctl.autoRotateSpeed=1.1;ctl.enablePan=false;
  ctl.addEventListener('start',()=>{this.anim=null;ctl.autoRotate=false;clearTimeout(this._ar);r.domElement.style.cursor='grabbing'});
  ctl.addEventListener('end',()=>{r.domElement.style.cursor='grab';this._ar=setTimeout(()=>ctl.autoRotate=true,5000)});
  this.dots=[];
  this.ro=new ResizeObserver(()=>this.resize());this.ro.observe(this);this.resize();
  this._ready=1;this.setFocus(this.getAttribute('focus')||'knee');
  const tick=(t)=>{if(this._dead)return;this._raf=requestAnimationFrame(tick);this.step(t)};this._raf=requestAnimationFrame(tick);
  this.dispatchEvent(new CustomEvent('ready'))}
 resize(){if(!this.renderer)return;const w=this.clientWidth||400,h=this.clientHeight||400;this.renderer.setSize(w,h,false);this.cam.aspect=w/h;this.cam.updateProjectionMatrix()}
 setFocus(id){const T=this.T,F=FOCUS[id]||FOCUS.knee;
  for(const k in this.parts)this.parts[k].material=F.hl.includes(k)?this.hlMat:this.base;
  this.dots.forEach(d=>{this.body.remove(d.m);d.el.remove()});this.dots=[];
  F.hs.forEach(([label,p,n],i)=>{const m=new T.Mesh(new T.SphereGeometry(.018,16,12),new T.MeshBasicMaterial({color:0x02084d}));m.position.set(...p);this.body.add(m);
   const el=document.createElement('div');el.style.cssText='position:absolute;left:0;top:0;display:flex;align-items:center;gap:8px;transition:opacity .3s;opacity:0;will-change:transform';
   el.innerHTML=`<span style="position:relative;width:14px;height:14px;flex:none"><span style="position:absolute;inset:0;border-radius:50%;background:rgba(2,8,77,.15);animation:mthPulse 1.8s ease-out infinite;animation-delay:${i*.3}s"></span><span style="position:absolute;inset:4px;border-radius:50%;background:#02084D;box-shadow:0 0 0 2px #fff"></span></span><span style="background:#fff;border:1px solid #E6E8EF;border-radius:999px;padding:4px 10px;font-size:12px;color:#02084D;white-space:nowrap;font-weight:400">${label}</span>`;
   this.lab.appendChild(el);this.dots.push({m,el,n:new T.Vector3(...n).normalize(),p:new T.Vector3(...p),born:performance.now()+i*150})});
  if(!document.getElementById('mth-pulse-kf')){const s=document.createElement('style');s.id='mth-pulse-kf';s.textContent='@keyframes mthPulse{0%{transform:scale(.6);opacity:1}100%{transform:scale(2.2);opacity:0}}';document.head.appendChild(s)}
  const tgt=new T.Vector3(...F.t),dir=new T.Vector3(...F.dir).normalize();
  this.anim={t0:performance.now(),fromT:this.ctl.target.clone(),fromP:this.cam.position.clone(),toT:tgt,toP:tgt.clone().add(dir.multiplyScalar(F.dist))};
  this.ctl.autoRotate=false;clearTimeout(this._ar);this._ar=setTimeout(()=>{if(this.ctl)this.ctl.autoRotate=true},6000)}
 step(now){const a=this.anim;if(a){let k=Math.min(1,(now-a.t0)/1100);k=1-Math.pow(1-k,3);this.ctl.target.lerpVectors(a.fromT,a.toT,k);this.cam.position.lerpVectors(a.fromP,a.toP,k);if(k>=1)this.anim=null}
  this.ctl.update();this.renderer.render(this.scene,this.cam);
  const w=this.clientWidth,h=this.clientHeight;const T=this.T;
  this.dots.forEach(d=>{const v=d.p.clone().project(this.cam);const toCam=this.cam.position.clone().sub(d.p).normalize();const vis=d.n.dot(toCam)>-.05&&now>d.born;d.el.style.transform=`translate(${(v.x*.5+.5)*w-7}px,${(-v.y*.5+.5)*h-7}px)`;d.el.style.opacity=vis?1:0;d.m.visible=vis})}
}
if(!customElements.get('mth-body'))customElements.define('mth-body',MthBody);
})();
export {};
