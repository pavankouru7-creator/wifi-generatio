const G=[
{n:"Wi-Fi 1",s:"802.11b",y:1999,b:"2.4 GHz",max:11,real:5,lat:40,k:.10,t:"DSSS modulation"},
{n:"Wi-Fi 2",s:"802.11a",y:1999,b:"5 GHz",max:54,real:25,lat:30,k:.08,t:"OFDM"},
{n:"Wi-Fi 3",s:"802.11g",y:2003,b:"2.4 GHz",max:54,real:25,lat:30,k:.08,t:"OFDM on 2.4 GHz"},
{n:"Wi-Fi 4",s:"802.11n",y:2009,b:"2.4 / 5 GHz",max:600,real:150,lat:20,k:.05,t:"MIMO, 40 MHz channels"},
{n:"Wi-Fi 5",s:"802.11ac",y:2014,b:"5 GHz",max:6933,real:700,lat:12,k:.03,t:"MU-MIMO, 160 MHz, 256-QAM"},
{n:"Wi-Fi 6",s:"802.11ax",y:2019,b:"2.4 / 5 GHz",max:9608,real:1200,lat:8,k:.012,t:"OFDMA, 1024-QAM, TWT"},
{n:"Wi-Fi 6E",s:"802.11ax",y:2020,b:"2.4 / 5 / 6 GHz",max:9608,real:1500,lat:6,k:.010,t:"Wi-Fi 6 plus the 6 GHz band"},
{n:"Wi-Fi 7",s:"802.11be",y:2024,b:"2.4 / 5 / 6 GHz",max:46120,real:3000,lat:4,k:.008,t:"320 MHz, 4096-QAM, MLO"}
];
const ACT=[
{l:"Gaming",re:/gam(e|ing|er)|esports|ps5|xbox|fps|pubg|valorant/,mbps:25,lat:15},
{l:"VR",re:/\bvr\b|virtual reality|metaverse/,mbps:100,lat:10},
{l:"4K streaming",re:/4k|uhd|ultra hd/,mbps:25,lat:80},
{l:"HD streaming",re:/stream|netflix|youtube|movie|video|ott|prime|hotstar/,mbps:10,lat:80},
{l:"Video calls",re:/call|zoom|meet|teams|conference|webinar/,mbps:4,lat:50},
{l:"Online classes / work",re:/class|study|student|office|work|wfh|remote|lecture/,mbps:8,lat:60},
{l:"Large downloads",re:/download|upload|backup|torrent|cloud|large file/,mbps:100,lat:100},
{l:"CCTV / cameras",re:/cctv|camera|surveillance/,mbps:4,lat:100},
{l:"Smart home / IoT",re:/iot|smart home|sensor|alexa|smart (bulb|light|tv)/,mbps:1,lat:100},
{l:"Browsing",re:/brows|web|social|surf|email|internet/,mbps:5,lat:100}
];
const W={one:1,two:2,three:3,four:4,five:5,six:6,seven:7,eight:8,nine:9,ten:10,twelve:12,fifteen:15,twenty:20,thirty:30,forty:40,fifty:50,hundred:100};
const EX=["I need a wifi for gaming and that is for 20 devices","Home with 6 people streaming 4K and video calls","Office of 50 users doing video calls and downloads","Smart home with 30 IoT devices","VR arcade with 10 headsets"];

function parse(text){
  let t=text.toLowerCase().replace(/\b(one|two|three|four|five|six|seven|eight|nine|ten|twelve|fifteen|twenty|thirty|forty|fifty|hundred)\b/g,m=>W[m]);
  let devices=1,m=t.match(/(\d+)\s*(?:\w+\s+)?(devices?|users?|people|persons?|phones?|laptops?|computers?|pcs?|gadgets?|clients?|students?|players?|members?|cameras?|headsets?|sensors?)/);
  if(m)devices=parseInt(m[1]);
  else{const n=t.match(/\b(\d+)\b/);if(n)devices=parseInt(n[1])}
  devices=Math.max(1,Math.min(devices,500));
  let acts=ACT.filter(a=>a.re.test(t));
  if(acts.some(a=>a.l==="4K streaming"))acts=acts.filter(a=>a.l!=="HD streaming");
  const guessed=acts.length===0;
  if(guessed)acts=[ACT[ACT.length-1]];
  const sorted=[...acts].sort((a,b)=>b.mbps-a.mbps);
  const per=sorted[0].mbps+0.3*sorted.slice(1).reduce((s,a)=>s+a.mbps,0);
  const lat=Math.min(...acts.map(a=>a.lat));
  return{devices,acts,guessed,per,lat};
}
function usable(g,n){return g.real/(1+g.k*(n-1))}
function judge(g,r){
  const perDev=usable(g,r.devices)/r.devices, need=r.per*1.25, ratio=perDev/need;
  let cls,label;
  if(g.lat>r.lat){cls="bad";label="Latency too high"}
  else if(ratio>=1.5){cls="good";label="Excellent"}
  else if(ratio>=1){cls="good";label="Good"}
  else if(ratio>=.6){cls="ok";label="Struggles"}
  else{cls="bad";label="Not enough"}
  return{perDev,ratio,cls,label};
}
const fmt=x=>x>=100?Math.round(x).toLocaleString():x>=10?x.toFixed(0):x.toFixed(1);
const css=v=>getComputedStyle(document.documentElement).getPropertyValue(v).trim();
let chart;

function run(){
  const text=document.getElementById("need").value.trim();
  if(!text){document.getElementById("result").innerHTML='<div class="panel">Type what you need, for example: <b>gaming for 20 devices</b>.</div>';return}
  const r=parse(text), total=r.devices*r.per*1.25;
  const rows=G.map(g=>({g,...judge(g,r),cap:usable(g,r.devices)}));
  const passing=rows.filter(x=>x.cls==="good");
  const min=passing[0], best=rows.find(x=>x.ratio>=1.5&&x.cls==="good")||min;
  let pick;
  if(!min)pick='<b>No single router in these generations meets this load.</b> Consider several access points or a wired backbone.';
  else pick=`<b>Minimum that works: ${min.g.n}</b> (${min.g.s}). <b>Recommended: ${best.g.n}</b> for comfortable headroom${r.lat<=15?" and low latency":""}.`;
  document.getElementById("result").innerHTML=`
  <div class="panel">
    <div class="parsed"><span>Understood:</span>${r.acts.map(a=>`<span class="tag">${a.l}</span>`).join("")}<span class="tag">${r.devices} device${r.devices>1?"s":""}</span>${r.guessed?'<span class="note" style="margin:0">No activity found, assuming everyday browsing.</span>':""}</div>
    <div class="stats">
      <div class="stat"><b>${fmt(r.per)} Mbps</b><span>needed per device</span></div>
      <div class="stat"><b>${fmt(r.per*r.devices)} Mbps</b><span>total demand (${r.devices} devices)</span></div>
      <div class="stat"><b>${fmt(total)} Mbps</b><span>required with 25% headroom</span></div>
      <div class="stat"><b>${r.lat<=100?"≤ "+r.lat+" ms":"any"}</b><span>latency target</span></div>
    </div>
    <div class="pick">${pick}</div>
  </div>
  <div class="panel"><h3>Usable capacity vs. requirement</h3>
    <div class="chartbox"><canvas id="cv" role="img" aria-label="Bar chart of usable Mbps per Wi-Fi generation against the required Mbps"></canvas></div>
    <p class="note">Log scale. Bars are usable Mbps shared by ${r.devices} devices; the dashed line is the requirement.</p></div>
  <div class="panel scroll"><table>
    <tr><th>Generation</th><th>Standard</th><th>Max speed</th><th>Usable (all devices)</th><th>Per device</th><th>Latency</th><th>Fit</th><th>Verdict</th></tr>
    ${rows.map(x=>`<tr><td><b>${x.g.n}</b></td><td>${x.g.s}</td><td>${fmt(x.g.max)} Mbps</td><td>${fmt(x.cap)} Mbps</td><td>${fmt(x.perDev)} Mbps</td><td>~${x.g.lat} ms</td>
    <td><div class="meter"><i style="width:${Math.min(100,x.ratio*66)}%;background:var(--${x.cls})"></i></div></td><td class="v ${x.cls}">${x.label}</td></tr>`).join("")}
  </table></div>`;
  draw(rows,total);
}
function draw(rows,total){
  if(typeof Chart==="undefined")return;
  if(chart)chart.destroy();
  const col={good:css("--good"),ok:css("--ok"),bad:css("--bad")}, ink=css("--ink"), line=css("--line");
  chart=new Chart(document.getElementById("cv"),{
    data:{labels:rows.map(x=>x.g.n),datasets:[
      {type:"bar",label:"Usable Mbps",data:rows.map(x=>+x.cap.toFixed(1)),backgroundColor:rows.map(x=>col[x.cls]),borderRadius:4},
      {type:"line",label:"Required Mbps",data:rows.map(()=>+total.toFixed(1)),borderColor:ink,borderDash:[6,5],pointRadius:0,borderWidth:2}]},
    options:{responsive:true,maintainAspectRatio:false,
      scales:{y:{type:"logarithmic",min:1,title:{display:true,text:"Mbps",color:ink},ticks:{color:ink},grid:{color:line}},x:{ticks:{color:ink},grid:{display:false}}},
      plugins:{legend:{labels:{color:ink}}}}});
}
function gtable(){
  document.getElementById("gtable").innerHTML=`<tr><th>Generation</th><th>Standard</th><th>Year</th><th>Bands</th><th>Max speed</th><th>Real-world</th><th>Key technology</th></tr>`+
  G.map(g=>`<tr><td><b>${g.n}</b></td><td>${g.s}</td><td>${g.y}</td><td>${g.b}</td><td>${fmt(g.max)} Mbps</td><td>~${fmt(g.real)} Mbps</td><td>${g.t}</td></tr>`).join("");
}
document.getElementById("chips").innerHTML=EX.map(e=>`<button type="button">${e}</button>`).join("");
document.getElementById("chips").addEventListener("click",e=>{if(e.target.tagName==="BUTTON"){document.getElementById("need").value=e.target.textContent;run()}});
document.getElementById("go").addEventListener("click",run);
document.getElementById("need").addEventListener("keydown",e=>{if(e.key==="Enter")run()});
document.querySelectorAll("nav button").forEach(b=>b.addEventListener("click",()=>{
  document.querySelectorAll("nav button").forEach(x=>x.setAttribute("aria-selected",x===b));
  ["analyze","gens","about"].forEach(id=>document.getElementById(id).classList.toggle("hide",id!==b.dataset.tab));
}));
window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change",run);
gtable();run();
