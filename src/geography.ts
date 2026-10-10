import type {Feature,FeatureCollection,Geometry,Position} from 'geojson';
import type {Candidate} from './data';
export type RegionProperties={id:string;provinceId:string;name:string};
export type Regions=FeatureCollection<Geometry,RegionProperties>;
export function vertices(geometry:Geometry):Position[]{
 if(geometry.type==='Polygon')return geometry.coordinates.flat();
 if(geometry.type==='MultiPolygon')return geometry.coordinates.flat(2);
 return [];
}
export function bounds(feature:Feature<Geometry,RegionProperties>):[[number,number],[number,number]]{
 const xy=vertices(feature.geometry);return [[Math.min(...xy.map(p=>p[1])),Math.min(...xy.map(p=>p[0]))],[Math.max(...xy.map(p=>p[1])),Math.max(...xy.map(p=>p[0]))]];
}
export function center(feature:Feature<Geometry,RegionProperties>):[number,number]{
 // Label the largest mainland part; overseas islands remain at their real positions.
 const polygons=feature.geometry.type==='MultiPolygon'?feature.geometry.coordinates:feature.geometry.type==='Polygon'?[feature.geometry.coordinates]:[];
 const ring=[...polygons].sort((a,b)=>area(b[0])-area(a[0]))[0]?.[0];if(!ring)return [36,128];
 const minX=Math.min(...ring.map(p=>p[0])),maxX=Math.max(...ring.map(p=>p[0])),minY=Math.min(...ring.map(p=>p[1])),maxY=Math.max(...ring.map(p=>p[1]));return [(minY+maxY)/2,(minX+maxX)/2];
}
function area(ring:Position[]){return Math.abs(ring.reduce((sum,p,i)=>{const next=ring[(i+1)%ring.length];return sum+p[0]*next[1]-next[0]*p[1];},0));}
export function mainlandBounds(feature:Feature<Geometry,RegionProperties>){
 if(feature.geometry.type!=='MultiPolygon')return bounds(feature);
 const polygon=[...feature.geometry.coordinates].sort((a,b)=>area(b[0])-area(a[0]))[0];return bounds({...feature,geometry:{type:'Polygon',coordinates:polygon}});
}
export function scopeCandidates(list:Candidate[],provinceId:string,districtIds?:string[]){return list.filter(c=>c.provinceId===provinceId&&(!districtIds||c.districtIds.some(id=>districtIds.includes(id))));}
export function selectionState(ids:string[],selected:Set<string>){const count=ids.filter(id=>selected.has(id)).length;return !count?'none':count===ids.length?'all':'partial';}
export function contains(point:[number,number],geometry:Geometry){
 const inRing=(points:Position[])=>{let inside=false;for(let i=0,j=points.length-1;i<points.length;j=i++){const a=points[i],b=points[j];if((a[1]>point[1])!==(b[1]>point[1])&&point[0]<(b[0]-a[0])*(point[1]-a[1])/(b[1]-a[1])+a[0])inside=!inside;}return inside;};
 const polygons=geometry.type==='Polygon'?[geometry.coordinates]:geometry.type==='MultiPolygon'?geometry.coordinates:[];return polygons.some(p=>inRing(p[0])&&!p.slice(1).some(inRing));
}
export type MapCluster={x:number;y:number;items:Candidate[]};
export function clusterPoints(list:Candidate[],project:(point:[number,number])=>{x:number;y:number},cell=64):MapCluster[]{
 const cells=new Map<string,MapCluster>();for(const c of list){if(!c.location)continue;const p=project([c.location.lat,c.location.lng]);const key=Math.floor(p.x/cell)+':'+Math.floor(p.y/cell);const group=cells.get(key)||{x:0,y:0,items:[]};group.x+=p.x;group.y+=p.y;group.items.push(c);cells.set(key,group);}return [...cells.values()].map(g=>({...g,x:g.x/g.items.length,y:g.y/g.items.length}));
}
