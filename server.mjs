import http from 'node:http';
import {readFile} from 'node:fs/promises';
const files={'/':'index.html','/game.js':'game.js','/physics.js':'physics.js','/style.css':'style.css'};
http.createServer(async(req,res)=>{
 if(req.url==='/health'){res.writeHead(200,{'Content-Type':'application/json'});return res.end('{"status":"ok","mode":"teacher-test"}');}
 const file=files[req.url?.split('?')[0]];
 if(!file){res.writeHead(404);return res.end('Not found');}
 try{const data=await readFile(new URL('./public/'+file,import.meta.url));res.writeHead(200,{'Content-Type':file.endsWith('.js')?'text/javascript':file.endsWith('.css')?'text/css':'text/html'});res.end(data);}catch{res.writeHead(500);res.end('Unable to load application');}
}).listen(Number(process.env.PORT)||3000,'0.0.0.0',()=>console.log('Teacher test listening on port '+(process.env.PORT||3000)));
