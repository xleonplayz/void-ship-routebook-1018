import {readFileSync,writeFileSync} from 'node:fs';
const names=["index.html", "styles.css", "version.js", "app.js", "icon.svg", "route-worker.js", "geo.js", "sample.geojson"];
const types=["text/html; charset=utf-8", "text/css; charset=utf-8", "text/javascript; charset=utf-8", "text/javascript; charset=utf-8", "image/svg+xml", "text/javascript; charset=utf-8", "text/javascript; charset=utf-8", "application/geo+json; charset=utf-8"];
const assets={};
for(let i=0;i<names.length;i++)assets['/'+names[i]]={type:types[i],body:readFileSync(new URL('../'+names[i],import.meta.url),'utf8')};
writeFileSync(new URL('../assets.js',import.meta.url),'// Generated from the original browser assets.\nexport const assets='+JSON.stringify(assets)+';\n');
