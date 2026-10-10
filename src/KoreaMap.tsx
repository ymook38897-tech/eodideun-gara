import {useEffect,useMemo,useState} from 'react';
import {MapContainer,GeoJSON,Marker,TileLayer,useMap,useMapEvents} from 'react-leaflet';
import L from 'leaflet';
import type {Feature,Geometry} from 'geojson';
import type {Candidate} from './data';
import {provinces,shortNames} from './data';
import {bounds,mainlandBounds,center,clusterPoints,scopeCandidates,selectionState,type Regions,type RegionProperties} from './geography';
import 'leaflet/dist/leaflet.css';
export type Scope={provinceId:string;districtId?:string;fullExtent?:boolean};
export type Focus={candidate:Candidate;serial:number};
type Props={list:Candidate[];selected:Set<string>;scope:Scope|null;focus:Focus|null;onlySelected:boolean;category:string;rolling:boolean;winner:Candidate|null;onToggle:(ids:string[])=>void;onNavigate:(scope:Scope|null)=>void;onInspect:(candidate:Candidate)=>void};
const escape=(s:string)=>s.replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]!));
function icon(html:string,className:string,size:[number,number],anchor?:[number,number]){return L.divIcon({html,className,iconSize:size,iconAnchor:anchor||[size[0]/2,size[1]/2]});}
const offsets:Record<string,[number,number]>={'11':[2,-34],'28':[-44,4],'41':[44,22],'36':[-30,-24],'30':[4,16],'29':[-26,-12]};
function Layers(props:Props&{prov:Regions;districts:Regions}){
 const {list,selected,scope,focus,onlySelected,category,rolling,winner,prov,districts,onToggle,onNavigate,onInspect}=props;
 const map=useMap();const [view,setView]=useState({zoom:map.getZoom(),tick:0});
 useMapEvents({moveend:()=>setView(v=>({zoom:map.getZoom(),tick:v.tick+1})),zoomend:()=>setView(v=>({zoom:map.getZoom(),tick:v.tick+1}))});
 const reduced=()=>matchMedia('(prefers-reduced-motion: reduce)').matches;
 useEffect(()=>{map.invalidateSize();},[map]);
 useEffect(()=>{const f=scope?scope.districtId?districts.features.find(f=>f.properties.id===scope.districtId):prov.features.find(f=>f.properties.id===scope.provinceId):null;
 if(f)map.flyToBounds(!scope?.districtId&&!scope?.fullExtent?mainlandBounds(f):bounds(f),{animate:!reduced(),padding:[40,45],maxZoom:scope?.districtId?13:11,duration:reduced()?0:0.8});else if(scope?.districtId){const p=provinces.find(p=>p.id===scope.provinceId);const name=p?.districts.find(d=>d.id===scope.districtId)?.name;const ids=p?.districts.filter(d=>name&&d.name.startsWith(name+' ')).map(d=>d.id)||[];const children=districts.features.filter(f=>ids.includes(f.properties.id));if(children.length){const box=L.latLngBounds(children.flatMap(f=>bounds(f)));map.flyToBounds(box,{animate:!reduced(),padding:[40,45],maxZoom:12,duration:reduced()?0:0.8});}}else map.flyToBounds([[33.15,124.55],[38.65,131.95]],{animate:!reduced(),padding:[15,15],duration:reduced()?0:0.8});
 },[scope,prov,districts,map]);
 useEffect(()=>{if(!focus)return;const c=focus.candidate;if(c.location){const point=L.latLng(c.location.lat,c.location.lng);const size=map.getSize();const projected=map.project(point,15);const target=map.unproject([projected.x-size.x*0.34,projected.y+size.y*0.2],15);map.flyTo(target,15,{animate:!reduced(),duration:reduced()?0:1.1});}else if(c.kind==='admin'){const f=districts.features.find(f=>c.districtIds.includes(f.properties.id));if(f)map.flyToBounds(bounds(f),{animate:!reduced(),padding:[50,50],maxZoom:13,duration:reduced()?0:1});}},[focus,map,districts]);
 useEffect(()=>{if(!rolling)return;map.flyToBounds([[33.15,124.55],[38.65,131.95]],{animate:!reduced(),duration:reduced()?0:0.6});},[rolling,map]);
 const showDistricts=!!scope||view.zoom>=9;
 const regions=showDistricts?districts:prov;
 const style=(f?:Feature<Geometry,RegionProperties>)=>{const ids=f?scopeCandidates(list,f.properties.provinceId,showDistricts?[f.properties.id]:undefined).map(c=>c.id):[];const state=selectionState(ids,selected);const won=f&&winner&&(winner.kind==='admin'?winner.districtIds.includes(f.properties.id):false);return {color:won?'#ef4327':state==='all'?'#375442':state==='partial'?'#98662b':'#383a3a',weight:won?4:state==='all'?2:1,fillColor:won?'#ff7554':state==='all'?'#b7de89':state==='partial'?'#f4d183':'#f9f5e8',fillOpacity:view.zoom>=12?0.2:0.93};};
 const onEach=(f:Feature<Geometry,RegionProperties>,layer:L.Layer)=>{
 const ids=()=>scopeCandidates(list,f.properties.provinceId,showDistricts?[f.properties.id]:undefined).map(c=>c.id);
 layer.on({click:()=>{if(!rolling)onToggle(ids());},mouseover:()=>{if(layer instanceof L.Path)layer.setStyle({weight:3,color:'#ef4327'});},mouseout:()=>{if(layer instanceof L.Path)layer.setStyle(style(f));}});layer.bindTooltip(f.properties.name+' · 클릭하여 후보 선택',{sticky:true,className:'region-tooltip'});
 };
 const labelFeatures=showDistricts?districts.features.filter(f=>!scope||f.properties.provinceId===scope.provinceId):prov.features;
 const occupied:{x:number;y:number}[]=[{x:18,y:35},...[175,140,110,65].map(y=>({x:map.getSize().x-52,y:map.getSize().y-y}))];
 const spread=[-150,-120,-90,-60,0,60,90,120,150].flatMap(x=>[-120,-90,-60,-30,0,30,60,90,120].map(y=>[x,y])).sort((a,b)=>Math.hypot(...a)-Math.hypot(...b));
 let visibleLabels=labelFeatures.filter(f=>map.getBounds().contains(center(f))).flatMap(f=>{const p=map.latLngToContainerPoint(center(f));const tries=showDistricts?[[0,0],...spread]:[offsets[f.properties.id]||[0,0],...spread];const off=tries.find(([x,y])=>p.x+x>42&&p.x+x<map.getSize().x-42&&p.y+y>15&&p.y+y<map.getSize().y-42&&!occupied.some(q=>Math.abs(p.x+x-q.x)<(showDistricts?85:76)&&Math.abs(p.y+y-q.y)<28));if(!off)return [];occupied.push({x:p.x+off[0],y:p.y+off[1]});return [{f,off}];});
 if(!showDistricts&&map.getSize().x<310){const size=map.getSize();const all=labelFeatures.filter(f=>map.getBounds().contains(center(f))).sort((a,b)=>map.latLngToContainerPoint(center(a)).y-map.latLngToContainerPoint(center(b)).y);let slot=0;visibleLabels=all.map(f=>{let row=Math.floor(slot/3),col=slot%3;if(row>=4&&col===2){slot++;row=Math.floor(slot/3);col=slot%3;}slot++;const p=map.latLngToContainerPoint(center(f));return {f,off:[43+col*(size.x-86)/2-p.x,95+row*32-p.y]};});}
 const points=useMemo(()=>list.filter(c=>c.kind==='spot'&&c.location&&(category==='all'||c.category===category)&&(!scope||c.provinceId===scope.provinceId)&&(!onlySelected||selected.has(c.id))),[list,onlySelected,selected,scope,category]);
 const groups=view.zoom>=9?clusterPoints(points.filter(c=>map.getBounds().pad(0.1).contains([c.location!.lat,c.location!.lng])),p=>map.latLngToContainerPoint(p),view.zoom>=16?24:view.zoom>=14?38:70):[];
 return <>{view.zoom>=11&&<TileLayer url="https://tile.openstreetmap.org/{z}/{x}/{y}.png" attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>' maxZoom={18}/>}
 <GeoJSON key={(showDistricts?'district':'province')+':'+list[0]?.kind+':'+[...selected].join('|')+':'+winner?.id+':'+(view.zoom>=12)} data={regions} style={style} onEachFeature={onEach}/>
 {visibleLabels.map(({f,off})=>{const p=f.properties;const ids=scopeCandidates(list,p.provinceId,showDistricts?[p.id]:undefined).map(c=>c.id);const state=selectionState(ids,selected);const label=showDistricts?p.name:shortNames[p.name]||p.name;
 const leader=off[0]||off[1]?`<span class="label-leader" style="width:${Math.hypot(...off)}px;transform:rotate(${Math.atan2(off[1],off[0])}rad)"></span>`:'';
 return <Marker keyboard={false} key={'label:'+p.id} position={center(f)} icon={icon(leader+`<div style="transform:translate(${off[0]}px,${off[1]}px)" class="region-label ${state}"><button aria-label="${escape(p.name)} 지도 선택" data-region="${p.id}">${escape(label)}${state!=='none'?' 😵':''}</button><button aria-label="${escape(p.name)} 지도 확대" data-zoom="${p.id}" title="확대">↗</button></div>`,'label-anchor',[110,24])} eventHandlers={{click:e=>{if(rolling)return;const target=(e.originalEvent.target as HTMLElement).closest('button');if(target?.hasAttribute('data-zoom'))onNavigate({provinceId:p.provinceId,...(showDistricts?{districtId:p.id}:{})});else onToggle(ids);}}}/>;})}
 {groups.map(g=>{const position=map.containerPointToLatLng([g.x,g.y]);if(g.items.length>1)return <Marker keyboard={false} key={'cluster:'+g.items.map(c=>c.id).join('|')} position={position} icon={icon(`<button aria-label="장소 ${g.items.length}개 묶음 확대" class="cluster ${g.items.some(c=>selected.has(c.id))?'selected':''}">${g.items.length}<small>곳</small></button>`,'cluster-anchor',[42,42])} eventHandlers={{click:()=>map.flyToBounds(L.latLngBounds(g.items.map(c=>[c.location!.lat,c.location!.lng])),{animate:!reduced(),padding:[80,80],maxZoom:Math.min(18,view.zoom+3),duration:reduced()?0:0.7})}}/>;
 const c=g.items[0];const active=selected.has(c.id),win=winner?.id===c.id;return <Marker keyboard={false} key={c.id} position={[c.location!.lat,c.location!.lng]} zIndexOffset={win?1000:active?500:0} icon={icon(`<button aria-label="${escape(c.name)} 지도 후보 ${active?'삭제':'추가'}" class="place-marker ${active?'selected':''} ${win?'winner':''}">${win?'★':c.category==='campus'?'🎓':c.category==='university'?'✳':'●'}</button>`,'place-anchor',[30,36],[15,36])} eventHandlers={{click:()=>{if(rolling)return;onToggle([c.id]);onInspect(c);}}}><LTooltip name={c.name}/></Marker>;
 })}</>;
}
import {Tooltip} from 'react-leaflet';
function LTooltip({name}:{name:string}){return <Tooltip direction="top" offset={[0,-32]}>{name}</Tooltip>;}
export function KoreaMap(props:Props){
 const [data,setData]=useState<{prov:Regions;districts:Regions}|null>(null);const [error,setError]=useState(false);const [attempt,setAttempt]=useState(0);
 useEffect(()=>{const controller=new AbortController();Promise.all(['provinces','districts'].map(async name=>{const r=await fetch(import.meta.env.BASE_URL+'maps/'+name+'.json',{signal:controller.signal});if(!r.ok)throw Error('map');const json=await r.json() as Regions;if(json.type!=='FeatureCollection'||!json.features.length)throw Error('map');return json;})).then(([prov,districts])=>{setData({prov,districts});setError(false);}).catch(e=>{if(e.name!=='AbortError')setError(true);});return()=>controller.abort();},[attempt]);
 if(!data)return <div className="map-loading" role="status">{error?<><p>지도를 불러오지 못했습니다. 후보 목록은 계속 사용할 수 있어요.</p><button onClick={()=>setAttempt(n=>n+1)}>지도 다시 불러오기</button></>:<>대한민국 펼치는 중…<small>감자가 종이를 너무 크게 접었습니다.</small></>}</div>;
 return <MapContainer center={[36.1,128]} zoom={7} zoomSnap={0.1} zoomDelta={0.5} minZoom={5} maxZoom={18} className="korea-map" zoomControl={true} scrollWheelZoom={true} doubleClickZoom={false} attributionControl={true}><Layers {...props} {...data}/></MapContainer>;
}






