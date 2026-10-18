import {calculate} from './geo.js';
self.onmessage=({data})=>{
 try{
  const {cumulative,...result}=calculate(new Float64Array(data.buffer),data.speed);
  self.postMessage({id:data.id,result,buffer:cumulative.buffer},[cumulative.buffer]);
 }catch(error){self.postMessage({id:data.id,error:error.message});}
};
