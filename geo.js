export function readRoute(value){
 if(value?.type!=='Feature'||value.geometry?.type!=='LineString')throw Error('Choose a GeoJSON Feature with a LineString.');
 const points=value.geometry.coordinates;
 if(!Array.isArray(points)||points.length<2||points.length>2000)throw Error('A route needs 2 to 2,000 points.');
 const coordinates=points.map(point=>{
  if(!Array.isArray(point)||point.length<2||point.length>3||point.some(n=>typeof n!=='number'||!Number.isFinite(n))||Math.abs(point[0])>180||Math.abs(point[1])>90)throw Error('Each point needs valid longitude, latitude and optional elevation.');
  return [point[0],point[1],point[2]??0];
 });
 const name=typeof value.properties?.name==='string'?value.properties.name.trim().slice(0,100):'Imported route';
 return {name:name||'Imported route',coordinates};
}
export function calculate(points,speed){
 if(![3,4,5].includes(speed)||points.length<6||points.length%3!==0)throw Error('The route calculation could not be started.');
 const cumulative=new Float64Array(points.length/3),rad=Math.PI/180;
 let distance=0,ascent=0,descent=0;
 for(let i=1;i<cumulative.length;i++){
  const a=(i-1)*3,b=i*3,lat1=points[a+1]*rad,lat2=points[b+1]*rad;
  const h=Math.sin((lat2-lat1)/2)**2+Math.cos(lat1)*Math.cos(lat2)*Math.sin((points[b]-points[a])*rad/2)**2;
  distance+=6371000*2*Math.atan2(Math.sqrt(Math.min(1,h)),Math.sqrt(Math.max(0,1-h)));
  const climb=points[b+2]-points[a+2];ascent+=Math.max(0,climb);descent+=Math.max(0,-climb);cumulative[i]=distance;
 }
 return {distance,ascent,descent,minutes:distance/1000/speed*60+ascent/600*60,cumulative};
}
