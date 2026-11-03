/* eslint-disable */
// @ts-nocheck
// Dummy slots and booking maths from the prototype.
import { MTH } from "./catalogue";
const MON=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const MONL=['January','February','March','April','May','June','July','August','September','October','November','December'];
const DOW=['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
// Today in India, worked out on every call: a long-running server must not keep yesterday's date.
function today(){const [ty,tm,td]=new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Kolkata'}).format(new Date()).split('-').map(Number);return new Date(ty,tm-1,td)}
const SL=[['Morning',['8:00 AM','9:00 AM','10:00 AM','11:00 AM']],['Afternoon',['12:30 PM','2:00 PM','3:30 PM']],['Evening',['4:30 PM','5:00 PM','6:00 PM','7:30 PM']]];
const ALL=SL.flatMap(s=>s[1]);
const HF={4:.45,8:.75,12:1,24:1.8};
const K=d=>d.getFullYear()+'-'+(d.getMonth()+1)+'-'+d.getDate();
const P=k=>{const [y,m,d]=k.split('-').map(Number);return new Date(y,m-1,d)};
const add=(d,n)=>{const x=new Date(d);x.setDate(x.getDate()+n);return x};
const fd=d=>d.getDate()+' '+MON[d.getMonth()];
const fdl=d=>DOW[d.getDay()]+', '+d.getDate()+' '+MON[d.getMonth()];
const inr=n=>'₹'+Math.round(n).toLocaleString('en-IN');
const h=s=>{let x=0;for(const c of s)x=(x*31+c.charCodeAt(0))>>>0;return x};
function km(p,loc){const L=MTH.LOCS;const a=L[p.locality],b=L[loc]||L['Nadakkavu'];const R=6371,toR=Math.PI/180;const dl=(b[0]-a[0])*toR,dn=(b[1]-a[1])*toR;const x=Math.sin(dl/2)**2+Math.cos(a[0]*toR)*Math.cos(b[0]*toR)*Math.sin(dn/2)**2;const d=2*R*Math.asin(Math.sqrt(x))*1.35;return Math.max(.6+(h(p.id)%9)/10,d)}
function offDay(p,d){if(d<today()&&K(d)!==K(today()))return true;if(K(d)===K(today()))return !p.today;if(p.today==='24×7')return false;return h(p.id+K(d))%5===0}
const REAL={};
function setBooked(id,ranges){REAL[id]=ranges}
function slotMs(d,t){const m=/^(\d+):(\d+) (AM|PM)$/.exec(t);return Date.UTC(d.getFullYear(),d.getMonth(),d.getDate(),(+m[1]%12)+(m[3]==='PM'?12:0),+m[2])-19800000}
function booked(p,d,t){const at=slotMs(d,t);if(at<Date.now())return true;if((REAL[p.id]||[]).some(([a,b])=>at>=a&&at<b))return true;if(p.today==='24×7')return false;if(K(d)===K(today())){return ALL.indexOf(t)<ALL.indexOf(p.today)}return h(p.id+K(d)+t)%4===0}
function firstOpen(p){for(let i=0;i<30;i++){const d=add(today(),i);if(!offDay(p,d)){const t=ALL.find(t=>!booked(p,d,t)&&ALL.indexOf(t)>=7)||ALL.find(t=>!booked(p,d,t));if(t)return {d,t}}}return {d:add(today(),1),t:'5:00 PM'}}
function matches(b,d,i){const dw=d.getDay();if(b.freq==='daily')return true;if(b.freq==='alt')return i%2===0;if(b.freq==='week')return dw>=1&&dw<=5;return b.days.includes((dw+6)%7)}
function sessions(b,mode){if(!b.plan)return [P(b.date)];const n=mode==='care'?b.ndays:(b.sessions==='custom'?Math.max(1,Math.min(60,+b.customN||1)):b.sessions);const out=[];const st=P(b.start);const skip=new Set(b.skip);for(let i=0;i<240&&out.length<n;i++){const d=add(st,i);if(mode==='care'||matches(b,d,i)){if(!skip.has(K(d)))out.push(d)}}return out}
function price(p,b,mode){const svc=p.svcs[b.svc]||p.svcs[0];const S=sessions(b,mode);let unit=svc.p,n=1,unitLabel='visit';const c=MTH.CATS[p.cat];
 if(b.plan){n=S.length;if(mode==='care'){unit=Math.round(svc.p*HF[b.hours]/10)*10;unitLabel='day ('+b.hours+' hrs)'}else unitLabel=c.unit}else unitLabel=mode==='care'?'12-hr shift':c.unit;
 const sub=unit*n;const rate=b.plan?(n>=20?.15:n>=10?.10:0):0;const disc=Math.round(sub*rate);const fee=49;const gst=Math.round(fee*.18);
 return {unit,n,sub,rate,disc,fee,gst,total:sub-disc+fee+gst,unitLabel,svc}}
function month(base){const y=base.getFullYear(),m=base.getMonth();const first=new Date(y,m,1);const lead=(first.getDay()+6)%7;const days=new Date(y,m+1,0).getDate();const cells=[];for(let i=0;i<lead;i++)cells.push(null);for(let i=1;i<=days;i++)cells.push(new Date(y,m,i));return {cells,label:MONL[m]+' '+y}}
const FREQ={daily:'Daily',alt:'Alternate days',week:'Weekdays only',custom:'Custom days'};
export const MTHL={MON,DOW,get T0(){return today()},SL,ALL,HF,K,P,add,fd,fdl,inr,h,km,offDay,booked,firstOpen,sessions,price,month,FREQ,setBooked};
