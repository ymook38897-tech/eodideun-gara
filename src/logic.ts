import {byId,candidates,type Candidate} from './data';
export type Mode='admin'|'spot';
export type Rule='equal'|'balanced';
export type Entry={candidate:Candidate;at:string;quip:string};
export type Saved={version:1;ids:string[];custom:Candidate[];mode:Mode;rule:Rule;exclude:boolean;history:Entry[]};
export const defaultState:Saved={version:1,ids:candidates.filter(c=>c.kind==='spot'&&c.provinceId==='11').slice(0,8).map(c=>c.id),custom:[],mode:'spot',rule:'equal',exclude:false,history:[]};
export function normalize(s:string){return s.normalize('NFKC').toLocaleLowerCase().replace(/\s/g,'');}
const initials='ㄱㄲㄴㄷㄸㄹㅁㅂㅃㅅㅆㅇㅈㅉㅊㅋㅌㅍㅎ';
export function chosung(s:string){return [...s].map(c=>{const n=c.charCodeAt(0)-0xac00;return n>=0&&n<=11171?initials[Math.floor(n/588)]:c;}).join('');}
export function matches(c:Candidate,q:string){const needle=normalize(q);return [c.name,c.path,...c.aliases].some(s=>normalize(s).includes(needle)||normalize(chosung(s)).includes(needle));}
export function randomIndex(n:number,source:()=>number=()=>crypto.getRandomValues(new Uint32Array(1))[0]):number{
 if(!Number.isInteger(n)||n<=0||n>0x100000000)throw new Error('Invalid candidate count');
 const limit=0x100000000-0x100000000%n;let value:number;do{value=source();}while(value>=limit);return value%n;
}
export function pick(pool:Candidate[],rule:Rule,index=randomIndex):Candidate{
 if(!pool.length)throw new Error('Empty pool');
 if(rule==='equal')return pool[index(pool.length)];
 const groups=[...new Set(pool.map(c=>c.provinceId))];const group=groups[index(groups.length)];const inner=pool.filter(c=>c.provinceId===group);return inner[index(inner.length)];
}
export function toggleGroup(ids:string[],group:string[]){const next=new Set(ids);const remove=group.every(id=>next.has(id));for(const id of group){if(remove)next.delete(id);else next.add(id);}return [...next];}
export function customCandidate(value:string):Candidate|null{
 const name=value.trim().normalize('NFKC').replace(/\s+/g,' ');if(!name||name.length>80)return null;
 return {id:'c:'+normalize(name),name,path:name,provinceId:'custom',kind:'custom',districtIds:[],aliases:[]};
}
function validCustom(value:unknown):Candidate|null{if(!value||typeof value!=='object'||!('name'in value)||typeof value.name!=='string')return null;return customCandidate(value.name);}
function validEntry(value:unknown):Entry|null{
 if(!value||typeof value!=='object')return null;const v=value as Partial<Entry>;const c=v.candidate;if(!c||typeof c.id!=='string')return null;
 const candidate=byId.get(c.id)||(c.kind==='custom'?validCustom(c):null);if(!candidate||typeof v.at!=='string'||Number.isNaN(Date.parse(v.at)))return null;
 return {candidate,at:v.at,quip:typeof v.quip==='string'?v.quip.slice(0,200):'목적지가 생겼습니다. 교통비는 알아서.'};
}
export function parseSaved(raw:string|null):Saved{
 try{const v=JSON.parse(raw||'null');if(!v||v.version!==1)return defaultState;
 const custom:Candidate[]=Array.isArray(v.custom)?[...new Map<string,Candidate>(v.custom.slice(0,100).map(validCustom).filter((c:Candidate|null):c is Candidate=>!!c).map((c:Candidate)=>[c.id,c])).values()]:[];
 const allowed=new Set([...byId.keys(),...custom.map(c=>c.id)]);
 return {version:1,ids:Array.isArray(v.ids)?[...new Set<string>(v.ids.filter((id:unknown):id is string=>typeof id==='string'&&allowed.has(id)))]:[],custom,mode:v.mode==='admin'?'admin':'spot',rule:v.rule==='balanced'?'balanced':'equal',exclude:v.exclude===true,history:Array.isArray(v.history)?v.history.slice(0,30).map(validEntry).filter((e:Entry|null):e is Entry=>!!e):[]};
 }catch{return defaultState;}
}
export function resultURL(c:Candidate,base:string){const url=new URL(base);url.search='';url.hash='';url.searchParams.set('result',c.kind==='custom'?'custom:'+c.name:c.id);return url.toString();}
export function parseResult(url:string):Candidate|null{try{const value=new URL(url).searchParams.get('result');if(!value)return null;if(byId.has(value))return byId.get(value)!;if(value.startsWith('custom:'))return customCandidate(value.slice(7));return null;}catch{return null;}}
export const quips=['운명이 결재했습니다. 이의 신청은 감자에게.','목적지가 생겼습니다. 교통비는 알아서.','회의 3시간 했는데 결국 랜덤입니다.','거기 가서 뭐 할지는 다른 부서 소관입니다.','우주가 보냈습니다. 우주는 교통비를 안 줍니다.','당신의 침대가 이 결과를 싫어합니다.','맛집은 모르지만 목적지는 압니다.','돌아올 수 있습니다. 휴가가 끝나면.'];
