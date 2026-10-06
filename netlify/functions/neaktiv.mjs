import { getStore } from "@netlify/blobs";
const store=getStore("amazing-rp-neaktiv");
const json=(body,status=200)=>({status,headers:{"content-type":"application/json; charset=utf-8","access-control-allow-origin":"*"},body:JSON.stringify(body)});
async function read(){return JSON.parse((await store.get("items",{type:"text"}))||"[]")}
export default async req=>{
 try{
  let items=await read();
  if(req.method==="GET") return json({items});
  if(req.method==="POST"){
   const b=await req.json();
   if(b.action==="login") return json({ok:(b.password||"")===(process.env.ADMIN_PASSWORD||"12345")});
   if(!b.nick) return json({error:"Введите Nick_Name"},400);
   if(!b.t1530&&!b.t1930) return json({error:"Выберите время"},400);
   const obj={id:crypto.randomUUID(),nick:String(b.nick).slice(0,32),t1530:!!b.t1530,t1930:!!b.t1930,reason:String(b.reason||"").slice(0,180),date:new Date().toLocaleString("ru-RU")};
   const i=items.findIndex(x=>x.nick.toLowerCase()===obj.nick.toLowerCase());
   if(i>=0){obj.id=items[i].id;items[i]=obj}else items.unshift(obj);
   await store.set("items",JSON.stringify(items));return json({ok:true,item:obj});
  }
  if(req.method==="DELETE"){
   const id=new URL(req.url).searchParams.get("id");items=items.filter(x=>x.id!==id);await store.set("items",JSON.stringify(items));return json({ok:true});
  }
  return json({error:"Method not allowed"},405);
 }catch(e){return json({error:e?.message||"Server error"},500)}
};