import {describe,it,expect} from 'vitest';
import {administrative,candidates,provinces,spots,byId} from './data';
import {customCandidate,defaultState,matches,parseResult,parseSaved,pick,randomIndex,resultURL,toggleGroup} from './logic';
import official from '../data/official-admin.json';
describe('official nationwide data',()=>{
 it('retains 17 familiar selection groups and all official codes',()=>{expect(provinces).toHaveLength(17);expect(new Set(provinces.flatMap(p=>p.districts.map(d=>d.id)))).toEqual(new Set(official.map(d=>d.id)));});
 it('uses original official names including 2026 reorganization',()=>{for(const d of official){const p=provinces.find(p=>p.districts.some(v=>v.id===d.id))!;const current=p.districts.find(v=>v.id===d.id)!;expect(current.name===p.name?p.name:`${p.officialName||p.name} ${current.name}`).toBe(d.name.trim());}});
 it('removes parent cities from the drawable pool when wards exist',()=>{for(const p of provinces)for(const d of p.districts){const hasChild=p.districts.some(v=>v.name.startsWith(d.name+' '));expect(byId.has('a:'+d.id)).toBe(!hasChild);}});
 it('handles Sejong, Jeju, Incheon, Hwaseong',()=>{expect(administrative.filter(c=>c.provinceId==='36')).toHaveLength(1);expect(administrative.filter(c=>c.provinceId==='50')).toHaveLength(2);expect(administrative.filter(c=>c.provinceId==='28')).toHaveLength(11);expect(administrative.filter(c=>c.name.startsWith('화성시 '))).toHaveLength(4);});
 it('has unique IDs, and every spot refers to existing districts',()=>{expect(new Set(candidates.map(c=>c.id)).size).toBe(candidates.length);for(const c of spots){const p=provinces.find(p=>p.id===c.provinceId)!;expect(c.districtIds.every(id=>p.districts.some(d=>d.id===id))).toBe(true);}expect(spots.filter(c=>c.provinceId==='11').length).toBeGreaterThan(60);});
});
describe('search and candidate selection',()=>{
 it('supports aliases, substring, initials and parent names',()=>{const konkuk=spots.find(c=>c.name==='건대입구')!;expect(matches(konkuk,'건대')).toBe(true);expect(matches(konkuk,'ㄱㄷ')).toBe(true);expect(matches(konkuk,'서울')).toBe(true);expect(matches(konkuk,'부산')).toBe(false);});
 it('toggles groups without duplicates and preserves unrelated groups',()=>{expect(toggleGroup(['x','a'],['a','b'])).toEqual(['x','a','b']);expect(toggleGroup(['x','a','b'],['a','b'])).toEqual(['x']);});
 it('normalizes custom duplicates and rejects empty or overlong names',()=>{expect(customCandidate(' 우리  집 앞 ')?.id).toBe(customCandidate('우리 집앞')?.id);expect(customCandidate(' ')).toBeNull();expect(customCandidate('a'.repeat(81))).toBeNull();});
});
describe('drawing correctness',()=>{
 it('rejects modulo biased samples before selecting',()=>{const values=[0xffffffff,5];expect(randomIndex(3,()=>values.shift()!)).toBe(2);expect(values).toHaveLength(0);});
 it('handles zero, one and hundreds of candidates',()=>{expect(()=>pick([],'equal')).toThrow();expect(pick([spots[0]],'equal',()=>0)).toBe(spots[0]);expect(pick(administrative,'equal',n=>n-1)).toBe(administrative.at(-1));});
 it('equal mode indexes every candidate directly',()=>{for(let i=0;i<spots.length;i++)expect(pick(spots,'equal',()=>i)).toBe(spots[i]);});
 it('balanced mode chooses a province then a candidate in it',()=>{const pool=[spots[0],spots[1],spots.find(c=>c.provinceId==='26')!];const sizes:number[]=[];const values=[1,0];expect(pick(pool,'balanced',n=>{sizes.push(n);return values.shift()!;})).toBe(pool[2]);expect(sizes).toEqual([2,1]);});
});
describe('storage and sharing',()=>{
 it('recovers corrupted storage',()=>{expect(parseSaved('{oops')).toEqual(defaultState);expect(parseSaved('{"version":999}')).toEqual(defaultState);});
 it('rejects unknown ids, duplicates, malformed custom and history',()=>{const state=parseSaved(JSON.stringify({version:1,ids:['fake',spots[0].id,spots[0].id],custom:[{},null],history:[null,{candidate:{id:'fake'}}]}));expect(state.ids).toEqual([spots[0].id]);expect(state.custom).toHaveLength(0);expect(state.history).toHaveLength(0);});
 it('reconstructs safe custom records without trusting injected fields',()=>{const state=parseSaved(JSON.stringify({version:1,custom:[{name:'철수네 집',path:'wrong',id:'evil',kind:'admin'}],ids:['c:철수네집']}));expect(state.custom[0].kind).toBe('custom');expect(state.custom[0].path).toBe('철수네 집');expect(state.ids).toEqual(['c:철수네집']);});
 it('roundtrips official and custom shared results',()=>{for(const c of [spots[0],customCandidate('<감자>&# 집')!])expect(parseResult(resultURL(c,'https://example.com/eodideun-gara/?wrong=1#no'))).toEqual(c);});
 it('rejects malformed URLs and unknown results',()=>{expect(parseResult('https://example.com/?result=missing')).toBeNull();expect(parseResult('not a url')).toBeNull();expect(parseResult('https://example.com/?result=custom:')).toBeNull();});
 it('caps stored history and customs',()=>{const custom=customCandidate('철수네집')!;const state=parseSaved(JSON.stringify({version:1,custom:Array.from({length:150},(_,i)=>({name:'집'+i})),history:Array.from({length:45},()=>({candidate:custom,at:new Date().toISOString(),quip:'test'}))}));expect(state.custom).toHaveLength(100);expect(state.history).toHaveLength(30);});
});
