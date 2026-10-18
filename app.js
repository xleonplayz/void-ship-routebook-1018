import {readRoute} from './geo.js';
import {RELEASE,TIP} from './version.js';
const $=id=>document.getElementById(id),KEY='routebook.v1';
let route,worker,workerFailed=false,sequence=0,currentPoints=[],currentResult=null;
document.body.dataset.release=String(RELEASE);$('release').textContent='Edition '+RELEASE;$('tip').textContent=TIP;
function message(text,state){$('message').textContent=text;document.body.dataset.state=state;}
function startWorker(){
 worker?.terminate();workerFailed=false;worker=new Worker(new URL('./route-worker.js',import.meta.url),{type:'module'});
 worker.onerror=event=>{event.preventDefault();workerFailed=true;currentResult=null;message('The route calculator could not load. Please retry.','error');$('retry').hidden=false;$('export').disabled=true;};
 worker.onmessage=({data})=>{
  if(data.id!==sequence)return;
  if(data.error){message(data.error,'error');return;}
  currentResult={...data.result,cumulative:new Float64Array(data.buffer)};
  $('distance').textContent=(data.result.distance/1000).toFixed(2)+' km';
  $('elevation').textContent=Math.round(data.result.ascent)+' / '+Math.round(data.result.descent)+' m';
  $('duration').textContent=Math.round(data.result.minutes)+' min';
  $('points').replaceChildren(...currentPoints.map((p,i)=>{const tr=document.createElement('tr');for(const v of [i+1,p[0],p[1],p[2],currentResult.cumulative[i].toFixed(3)]){const td=document.createElement('td');td.textContent=String(v);tr.append(td);}return tr;}));
  draw();$('export').disabled=false;$('retry').hidden=true;document.body.dataset.completed=String(data.id);message('Route ready. Your changes are saved in this browser.','ready');
 };
}
function draw(){
 const canvas=$('profile'),ctx=canvas.getContext('2d'),w=canvas.width,h=canvas.height;
 ctx.clearRect(0,0,w,h);const elevations=currentPoints.map(p=>p[2]),min=Math.min(...elevations),span=Math.max(1,Math.max(...elevations)-min),distance=Math.max(1,currentResult.distance);
 const point=(p,i)=>[24+currentResult.cumulative[i]/distance*(w-48),h-30-(p[2]-min)/span*(h-60)];
 ctx.beginPath();currentPoints.forEach((p,i)=>{const [x,y]=point(p,i);if(i)ctx.lineTo(x,y);else ctx.moveTo(x,y);});ctx.strokeStyle='#315c4c';ctx.lineWidth=4;ctx.stroke();
 ctx.lineTo(point(currentPoints.at(-1),currentPoints.length-1)[0],h-20);ctx.lineTo(24,h-20);ctx.closePath();ctx.fillStyle='#315c4c22';ctx.fill();
}
function recalculate(){
 if(!route)return;currentResult=null;currentPoints=$('reverse').checked?[...route.coordinates].reverse():route.coordinates;
 $('name').textContent=route.name;$('point-count').textContent=currentPoints.length+' points';$('export').disabled=true;message('Calculating route…','calculating');
 try{localStorage.setItem(KEY,JSON.stringify({route,speed:Number($('speed').value),reverse:$('reverse').checked}));}catch{}
 if(workerFailed){message('The route calculator could not load. Please retry.','error');$('retry').hidden=false;return;}
 const data=new Float64Array(currentPoints.flat()),id=++sequence;document.body.dataset.requested=String(id);
 worker.postMessage({id,speed:Number($('speed').value),buffer:data.buffer},[data.buffer]);document.body.dataset.inputTransferred=String(data.byteLength===0);
}
async function sample(){const response=await fetch('./sample.geojson');if(!response.ok)throw Error('The sample route could not load.');route=readRoute(await response.json());$('reverse').checked=false;recalculate();}
$('file').addEventListener('change',async()=>{
 const file=$('file').files[0];if(!file)return;
 try{if(file.size>262144)throw Error('Choose a GeoJSON file no larger than 256 KiB.');const next=readRoute(JSON.parse(await file.text()));route=next;$('reverse').checked=false;recalculate();}
 catch(error){message(error instanceof SyntaxError?'This file is not valid JSON.':error.message,'error');}
 finally{$('file').value='';}
});
$('speed').addEventListener('change',recalculate);$('reverse').addEventListener('change',recalculate);
$('sample').addEventListener('click',()=>sample().catch(error=>message(error.message,'error')));
$('retry').addEventListener('click',()=>{startWorker();recalculate();});
$('export').addEventListener('click',()=>{
 if(!currentResult)return;const csv='point,longitude,latitude,elevation_m,distance_m\r\n'+currentPoints.map((p,i)=>[i+1,...p,currentResult.cumulative[i].toFixed(3)].join(',')).join('\r\n')+'\r\n';
 const url=URL.createObjectURL(new Blob([csv],{type:'text/csv;charset=utf-8'})),a=document.createElement('a');a.href=url;a.download='routebook-points.csv';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
});
startWorker();
try{const saved=JSON.parse(localStorage.getItem(KEY));if(saved){route=readRoute({type:'Feature',properties:{name:saved.route.name},geometry:{type:'LineString',coordinates:saved.route.coordinates}});$('speed').value=[3,4,5].includes(saved.speed)?String(saved.speed):'4';$('reverse').checked=saved.reverse===true;}}catch{}
if(route)recalculate();else sample().catch(error=>message(error.message,'error'));
