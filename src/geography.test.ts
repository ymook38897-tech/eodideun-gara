import {describe,it,expect} from 'vitest';
import {administrative,provinces,spots} from './data';
import {bounds,center,clusterPoints,contains,mainlandBounds,scopeCandidates,selectionState,type Regions} from './geography';
import {toggleGroup,customCandidate} from './logic';
import rawDistricts from '../public/maps/districts.json';
import rawProvinces from '../public/maps/provinces.json';
const districts=rawDistricts as Regions,prov=rawProvinces as Regions;
describe('geographic completeness and verified locations',()=>{
 it('covers exactly all 256 terminal administrative districts and all 17 selection groups',()=>{
  expect(new Set(districts.features.map(f=>f.properties.id))).toEqual(new Set(administrative.map(c=>c.districtIds[0])));
  expect(new Set(prov.features.map(f=>f.properties.id))).toEqual(new Set(provinces.map(p=>p.id)));
  for(const f of [...districts.features,...prov.features]){const b=bounds(f);expect(b[0][0]).toBeGreaterThan(32);expect(b[1][0]).toBeLessThan(40);expect(b[0][1]).toBeGreaterThan(124);expect(b[1][1]).toBeLessThan(133);const c=center(f);expect(c[0]).toBeGreaterThanOrEqual(b[0][0]);expect(c[0]).toBeLessThanOrEqual(b[1][0]);}
 });
 it('gives every public place a source, address, category and coordinate inside its associated district',()=>{
  expect(spots.length).toBeGreaterThan(200);for(const c of spots){expect(c.category).toBeTruthy();expect(c.location,c.name).toBeTruthy();const l=c.location!;expect(l.source).toMatch(/^https:\/\/www\.openstreetmap\.org\/(node|way|relation)\/\d+$/);expect(l.address.length).toBeGreaterThan(10);expect(districts.features.some(f=>c.districtIds.includes(f.properties.id)&&contains([l.lng,l.lat],f.geometry)),c.name).toBe(true);}
 });
 it('keeps Inha campus, back gate, front gate and station distinct and locatable',()=>{
  const names=['인하대학교','인하대 후문 상권','인하대 정문 일대','인하대역'];const list=names.map(name=>spots.find(c=>c.name===name)!);expect(list.every(Boolean)).toBe(true);expect(new Set(list.map(c=>c.id)).size).toBe(4);expect(new Set(list.map(c=>c.location!.lat+','+c.location!.lng)).size).toBe(4);expect(list[0].category).toBe('campus');expect(list[1].category).toBe('university');expect(list.every(c=>c.districtIds.includes('2817700000'))).toBe(true);
 });
 it('includes the required university areas across the country without treating every campus as a commercial district',()=>{
  for(const name of ['홍대','건대입구','회기역 일대','안암역 대학가','샤로수길','흑석역 일대','혜화','부산대역 대학가','경성대·부경대 일대','궁동 대학가','경북대 북문 대학가','전남대 후문 대학가','전북대 대학로','강원대 후문 일대'])expect(spots.find(c=>c.name===name)?.category,name).toBe('university');
  expect(spots.filter(c=>c.category==='campus').length).toBeGreaterThan(25);
 });
 it('does not move distant islands next to the mainland when optimizing navigation',()=>{const f=prov.features.find(f=>f.properties.id==='28')!;const full=bounds(f),land=mainlandBounds(f);expect(full[0][1]).toBeLessThan(land[0][1]);expect(full[1][1]).toBeGreaterThanOrEqual(land[1][1]);});
});
describe('map, hierarchy and search share candidate IDs',()=>{
 it('overlapping province, district and place scopes never increase a place probability',()=>{
  const p=scopeCandidates(spots,'28'),d=scopeCandidates(spots,'28',['2817700000']);const back=spots.find(c=>c.name==='인하대 후문 상권')!;
  let ids=toggleGroup([],[back.id]);ids=toggleGroup(ids,d.map(c=>c.id));ids=toggleGroup(ids,p.map(c=>c.id));expect(ids).toHaveLength(p.length);expect(ids.filter(id=>id===back.id)).toHaveLength(1);expect(selectionState(p.map(c=>c.id),new Set(ids))).toBe('all');
 });
 it('correctly distinguishes empty, partial and complete scope selection',()=>{expect(selectionState([],new Set())).toBe('none');expect(selectionState(['a','b'],new Set(['a']))).toBe('partial');expect(selectionState(['a','b'],new Set(['a','b']))).toBe('all');});
 it('cluster zoom preserves every candidate once and higher resolution splits groups',()=>{const list=spots.filter(c=>c.provinceId==='28');const project=(p:[number,number])=>({x:p[1]*100,y:p[0]*100});const low=clusterPoints(list,project,1000),high=clusterPoints(list,project,0.001);for(const groups of [low,high])expect(new Set(groups.flatMap(g=>g.items.map(c=>c.id)))).toEqual(new Set(list.map(c=>c.id)));expect(high.length).toBeGreaterThan(low.length);});
 it('never creates a map marker for a custom place without coordinates',()=>{const c=customCandidate('철수네 집')!;expect(c.location).toBeUndefined();expect(clusterPoints([c],()=>({x:0,y:0}))).toHaveLength(0);});
});
