import http from 'node:http';
import {assets} from './assets.js';

http.createServer((req,res)=>{
  const path=new URL(req.url,'http://routebook.local').pathname;
  console.log('routebook',req.method,path);
  if(req.method!=='GET'&&req.method!=='HEAD'){
    res.writeHead(405,{'content-type':'application/json; charset=utf-8','allow':'GET, HEAD','cache-control':'no-store'});
    return res.end('{"error":"method_not_allowed"}');
  }
  const asset=assets[path==='/'?'/index.html':path];
  if(!asset){
    res.writeHead(404,{'content-type':'application/json; charset=utf-8','cache-control':'no-store'});
    return res.end(req.method==='HEAD'?'':'{"error":"not_found"}');
  }
  res.writeHead(200,{'content-type':asset.type,'cache-control':'no-store'});
  return res.end(req.method==='HEAD'?'':asset.body);
}).listen(Number(process.env.PORT||3000),'0.0.0.0',()=>console.log('routebook ready'));
