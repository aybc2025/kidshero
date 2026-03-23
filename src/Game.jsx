import { useState, useReducer, useEffect, useRef } from "react";

// ============================================================
// PWA Install Hook
// ============================================================
function useInstallPrompt() {
  const [prompt, setPrompt] = useState(null);
  const [installed, setInstalled] = useState(false);
  useEffect(() => {
    const handler = (e) => { e.preventDefault(); setPrompt(e); };
    window.addEventListener('beforeinstallprompt', handler);
    window.addEventListener('appinstalled', () => setInstalled(true));
    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) setInstalled(true);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);
  const install = async () => {
    if (!prompt) return;
    prompt.prompt();
    const result = await prompt.userChoice;
    if (result.outcome === 'accepted') setInstalled(true);
    setPrompt(null);
  };
  return { canInstall: !!prompt && !installed, installed, install };
}

// ============================================================
// DATA: Heroes
// ============================================================
const HEROES = [
  { id:"warrior1", class:"לוחם", subName:"חרב מבריקה", emoji:"⚔️", color:"#c0392b",
    melee:2, ranged:0, magic:0, armor:2, hp:3,
    attack:{name:"חיתוך מבריק",type:"melee",dice:2,desc:"קרב קרוב על יריב סמוך"},
    special:{name:"מתקפת מערבולת",desc:"פצלו קוביות לתקוף מספר יריבים סמוכים",type:"whirlwind"},
    bonus:{name:"עבודת צוות",desc:"כשיריב מותקף, +1 קובייה"} },
  { id:"warrior2", class:"לוחם", subName:"מכה מוחצת", emoji:"🗡️", color:"#e67e22",
    melee:2, ranged:0, magic:0, armor:2, hp:3,
    attack:{name:"מכה מוחצת",type:"melee",dice:2,desc:"קרב קרוב על יריב סמוך"},
    special:{name:"מתקפת מערבולת",desc:"פצלו קוביות לתקוף מספר יריבים סמוכים",type:"whirlwind"},
    bonus:{name:"עבודת צוות",desc:"כשיריב מותקף, +1 קובייה"} },
  { id:"hunter1", class:"צייד", subName:"מכת שיער", emoji:"🎯", color:"#8e44ad",
    melee:0, ranged:2, magic:0, armor:1, hp:3,
    attack:{name:"מכת שיער",type:"ranged",dice:2,range:6,desc:"טווח עד 6 משבצות"},
    special:{name:"לאסו שיער",desc:"טווח שמושך יריב קרוב יותר",type:"lasso"},
    bonus:{name:"סבוך",desc:"הגנה מקרב קרוב +1 קובייה"} },
  { id:"hunter2", class:"צייד", subName:"יורה חיצים", emoji:"🏹", color:"#27ae60",
    melee:0, ranged:2, magic:0, armor:1, hp:3,
    attack:{name:"יריית חץ",type:"ranged",dice:2,range:6,desc:"טווח עד 6 משבצות"},
    special:{name:"חץ מפוצל",desc:"פצלו קוביות טווח למספר יריבים",type:"split"},
    bonus:{name:"תמרון חמקני",desc:"כשנפגעים, זזים משבצת מיד"} },
  { id:"warlock1", class:"מכשף", subName:"כדור אש", emoji:"🔥", color:"#d35400",
    melee:0, ranged:0, magic:2, armor:1, hp:3,
    attack:{name:"כדור אש",type:"magic",dice:2,range:4,desc:"קסם עד 4 משבצות"},
    special:{name:"פיצוץ להבה",desc:"קובייה על כל הסמוכים — גם בני ברית!",type:"burst"},
    bonus:{name:"גל כוח",desc:"לא בבריאות מלאה → +1 קובייה קסם"} },
  { id:"warlock2", class:"מכשף", subName:"שוט מים", emoji:"🌊", color:"#2980b9",
    melee:0, ranged:0, magic:2, armor:1, hp:3,
    attack:{name:"שוט מים",type:"magic",dice:2,range:4,desc:"קסם עד 4 משבצות"},
    special:{name:"מכות שוט",desc:"פצלו קוביות קסם למספר יריבים",type:"split"},
    bonus:{name:"מכת קיפאון",desc:"גלגול 6 → היריב קפוא"} },
  { id:"brute", class:"גברתן", subName:"מכת פטיש", emoji:"🔨", color:"#7f8c8d",
    melee:3, ranged:0, magic:0, armor:1, hp:3,
    attack:{name:"מכת פטיש",type:"melee",dice:3,desc:"קרב קרוב חזק"},
    special:{name:"מתקפת הדיפה",desc:"קובייה פחות, דוחף 4 משבצות",type:"knockback"},
    bonus:{name:"נקמה",desc:"פוגעים ביריב שפגע בכם → 2 נזק"} },
  { id:"rogue", class:"נוכל", subName:"פגיונות מהירים", emoji:"🗡️", color:"#16a085",
    melee:0, ranged:2, magic:0, armor:1, hp:3, moveSpeed:5,
    attack:{name:"פגיונות מהירים",type:"ranged",dice:2,range:6,desc:"טווח עד 6 משבצות"},
    special:{name:"התקפה חמקנית",desc:"יריב לא-סמוך מותקף → +1 קובייה",type:"sneaky"},
    bonus:{name:"זריז",desc:"זזים 5 משבצות, מתעלמים ממכשולים"} },
  { id:"healer", class:"מרפא", subName:"אור מרפא", emoji:"✨", color:"#f39c12",
    melee:0, ranged:0, magic:1, armor:1, hp:3,
    attack:{name:"אור צורב",type:"magic",dice:1,range:4,desc:"קסם עד 4 משבצות"},
    special:{name:"מגע מרפא",desc:"ריפוי 1 נזק — עצמכם או סמוך",type:"heal"},
    bonus:{name:"מבשל שיקויים",desc:"אחרי מפגש — חידוש שיקוי"} },
  { id:"knight", class:"אביר", subName:"מכת מגן", emoji:"🛡️", color:"#34495e",
    melee:1, ranged:0, magic:0, armor:3, hp:3,
    attack:{name:"מכת מגן",type:"melee",dice:1,desc:"קרב קרוב"},
    special:{name:"מתקפת תגובה",desc:"יריב סמוך תקף → תקפו +1 קובייה",type:"strikeback"},
    bonus:{name:"מגן",desc:"בן ברית סמוך נפגע → קבלו נזק במקומו"} },
];

const createRat=(id)=>({id:`rat_${id}`,name:`חולדה ענקית ${id}`,shortName:`חולדה ${id}`,emoji:"🐀",
  melee:1,armor:0,hp:1,maxHp:1,currentHp:1,attack:{name:"נשיכה",type:"melee",dice:1},isKO:false});
const createKing=()=>({id:"king_rat",name:"מלך החולדות",shortName:"המלך 👑",emoji:"👑",
  melee:2,armor:0,hp:3,maxHp:3,currentHp:3,attack:{name:"נשיכה מלכותית",type:"melee",dice:2},isKO:false});

// ============================================================
// MAPS — 0=floor 1=wall 2=barrel 3=entry 4=exit 6=fungi 7=ledge 8=water 9=stalagmite
// ============================================================
const MAPS=[
  {cols:12,rows:8,tiles:[[1,1,1,1,1,1,1,1,1,1,1,1],[2,2,2,0,0,0,0,2,2,2,0,2],[2,0,2,2,0,0,2,0,2,2,0,2],[0,0,2,2,0,0,2,0,2,2,0,0],[2,0,2,2,0,0,2,0,2,2,0,2],[2,0,0,0,0,0,0,0,0,0,0,2],[4,0,0,0,0,0,0,0,0,0,0,3],[1,1,1,1,1,1,1,1,1,1,1,1]],
    hs:[{r:6,c:10},{r:6,c:9},{r:5,c:10},{r:5,c:9}],mp:[{r:3,c:5},{r:2,c:3},{r:4,c:7},{r:5,c:4},{r:3,c:8},{r:5,c:7}]},
  {cols:10,rows:8,tiles:[[1,1,1,1,1,0,0,0,1,1],[1,1,1,0,0,0,0,0,0,1],[1,1,0,0,0,0,0,0,0,7],[1,0,0,0,0,0,0,0,7,7],[1,0,0,0,6,0,0,0,1,1],[0,0,0,6,0,0,1,1,1,1],[3,0,0,0,0,1,1,1,1,1],[1,1,1,1,1,1,1,1,1,1]],
    hs:[{r:6,c:0},{r:5,c:0},{r:6,c:1},{r:5,c:1}],mp:[{r:2,c:5},{r:1,c:6},{r:3,c:4},{r:2,c:7},{r:1,c:4},{r:3,c:6}]},
  {cols:10,rows:10,tiles:[[1,1,1,1,0,0,0,0,1,1],[1,1,1,0,0,0,0,0,0,1],[1,1,0,0,0,0,0,0,0,1],[4,0,0,0,0,0,0,0,1,1],[1,0,0,0,0,0,0,1,1,1],[1,1,0,0,0,0,1,1,1,1],[1,1,1,0,0,0,1,1,1,1],[1,1,1,0,0,1,1,1,1,1],[1,1,1,0,0,1,1,1,1,1],[1,1,1,3,4,1,1,1,1,1]],
    hs:[{r:9,c:3},{r:9,c:4},{r:8,c:3},{r:8,c:4}],mp:[{r:3,c:3},{r:2,c:4},{r:1,c:5},{r:2,c:6},{r:0,c:5},{r:1,c:7}]},
  {cols:10,rows:8,tiles:[[1,1,1,1,0,0,0,1,1,1],[1,1,0,0,0,0,0,0,1,1],[1,0,8,8,0,0,0,0,0,1],[1,0,8,8,0,9,0,0,0,1],[1,0,0,0,9,0,9,0,0,1],[1,0,0,0,0,0,0,0,1,1],[1,1,0,0,0,0,0,1,1,1],[1,1,1,3,0,0,1,1,1,1]],
    hs:[{r:7,c:3},{r:7,c:4},{r:6,c:3},{r:6,c:4}],mp:[]},
  {cols:10,rows:10,tiles:[[1,1,0,0,0,0,0,0,1,1],[1,0,0,0,0,0,0,0,0,1],[0,0,0,0,0,0,0,0,0,0],[0,0,0,0,7,7,0,0,0,0],[1,0,0,7,0,0,7,0,0,1],[1,0,0,7,0,0,7,0,0,1],[1,0,0,0,7,7,0,0,0,1],[1,1,0,0,0,0,0,0,1,1],[1,1,1,0,0,0,0,1,1,1],[1,1,1,1,3,3,1,1,1,1]],
    hs:[{r:9,c:4},{r:9,c:5},{r:8,c:4},{r:8,c:5}],mp:[{r:4,c:4},{r:4,c:5},{r:3,c:3},{r:3,c:6},{r:2,c:4}],kp:{r:1,c:4}},
];

const ENC=[
  {id:1,title:"מרתף מלא חולדות",intro:["אתם מניחים את הסכו״ם ועוקבים אחרי מאב למרתף.","המדרגות יורדות לחושך. סרחון חולדות וכפות רגליים ענקיות.","חולדות ענקיות רצות בין חביות ושקי תבואה!"],
    outro:["החולדה האחרונה נופלת. שקט.","קריאה רחוקה לעזרה — מהלוחות השבורים בפינה!","דרך הלוחות — מנהרת עפר. היא מובילה למאורה!"],
    tip:"💡 החולדות זוללות — לא יתקפו עד שיותקפו!",aggro:false,
    rats:(n)=>{const c={1:2,2:3,3:5,4:6};return Array.from({length:c[Math.min(n,4)]||3},(_,i)=>createRat(i+1));},
    test:{name:"תפיסה",diff:4,ok:"🔊 שומעים צעקות רוג׳ר — הוא חי!",fail:"🤔 לא שומעים שום דבר מיוחד."}},
  {id:2,title:"לאן מובילה המערה?",intro:["מטפסים בזהירות למנהרה. הקרקע קשה, המקום מסריח.","פטריות כחולות מאירות מנהרה צרה למזרח.","מוכנים להתקדם?"],
    outro:["החולדות נשתקות.","מדרגה גבוהה בצד המזרחי.","צריך לטפס כדי להמשיך!"],
    tip:"⚔️ החולדות תוקפות מיד!",aggro:true,climb:true,
    rats:(n)=>{const c={1:2,2:3,3:4,4:6};return Array.from({length:c[Math.min(n,4)]||3},(_,i)=>createRat(i+1));},
    test:{name:"מעקב",diff:4,ok:"🐾 עקבות חולדות למזרח!",fail:"🤔 הרצפה מלוכלכת מדי."}},
  {id:3,title:"בחירות תת-קרקעיות!",intro:["המנהרה נפתחת לחדר גדול. יציאות צפון ודרום.","חור קטן בקיר הצפוני.","חולדה מגיחה מהחור ומשתערת עליכם!"],
    outro:["מסיימים את האחרונה. בוחנים את המערות.","ריח חולדות מהצפון. צליל מים מהדרום.","לאן הולכים?"],
    tip:"⚔️ חולדות מגיחות מהחור!",aggro:true,choice:true,
    rats:(n)=>{const c={1:2,2:3,3:4,4:6};return Array.from({length:c[Math.min(n,4)]||3},(_,i)=>createRat(i+1));},
    test:{name:"מעקב",diff:4,ok:"🐾 עקבות לצפון — שם המאורה!",fail:"🤔 לא ברור לאן."}},
  {id:4,title:"עקיפה רגעית",intro:["מנהרה סלעית נפתחת למערה יפה.","אור כחול משתקף על בריכת מים.","שקט... אולי יש כאן משהו?"],
    outro:["חוזרים צפונה.","הגיע הזמן למלך החולדות!"],
    tip:"✨ חפשו אוצר בבריכה!",aggro:false,pool:true,
    rats:()=>[],
    test:{name:"זריזות",diff:4,ok:"💎 שיקוי ריפוי בתחתית הבריכה!",fail:"🌊 המים עמוקים מדי."}},
  {id:5,title:"מאורת מלך החולדות!",intro:["סרחון מכריע. מנהרה עם מדרגות נמוכות.","חולדות מנוונות רצות על המדרגות.","פתאום נסוגות — מאחוריהן חולדה ענקית עם כתר ושרביט!","היא מכוונת אליכם ושורקת!"],
    outro:["אחרי קרב אפי — מלך החולדות נופל!","קריאות עמומות מחור בקיר.","מצאתם את רוג׳ר! מלוכלך ומפוחד אבל שלם!","\"תודה! חשבתי שנגמר לי!\"","הוא מחבק אתכם. מלוכלך אבל אוהב.","\"מגיע לכם גלידה לשבוע שלם!\""],
    tip:"⚔️ מלך החולדות! חולדות נכנסות ויוצאות מחורים!",aggro:true,boss:true,
    rats:(n)=>{const r=Array.from({length:Math.min(n,4)},(_,i)=>createRat(i+1));return[createKing(),...r];},
    test:{name:"מעקב",diff:4,ok:"🕳️ החורים מחוברים — חולדות יכולות לצוץ מכל מקום!",fail:"🤔 סתם חורים."}},
];

// ============================================================
// UTILITIES
// ============================================================
const roll=(n)=>Array.from({length:Math.max(n,0)},()=>Math.floor(Math.random()*6)+1);
const best=(d)=>d.length===0?0:Math.max(...d);
const dist=(a,b)=>Math.abs(a.r-b.r)+Math.abs(a.c-b.c);
const canWalk=(map,r,c)=>{
  if(r<0||r>=map.rows||c<0||c>=map.cols) return false;
  const t=map.tiles[r][c]; return t===0||t===3||t===4||t===6||t===7;
};
function getMovable(map,pos,speed,occ){
  const s=new Set(occ.map(p=>`${p.r},${p.c}`));
  const res=[];
  for(let r=0;r<map.rows;r++) for(let c=0;c<map.cols;c++){
    if(r===pos.r&&c===pos.c) continue;
    if(!canWalk(map,r,c)||s.has(`${r},${c}`)) continue;
    if(dist(pos,{r,c})<=speed) res.push({r,c});
  } return res;
}
function getTargets(h,hp,mons,mps){
  const rng=h.attack.range||1;
  return mons.filter(m=>!m.isKO).filter(m=>{const p=mps[m.id];if(!p)return false;const d=dist(hp,p);return h.attack.type==="melee"?d===1:d<=rng;}).map(m=>m.id);
}
function stepTo(map,from,to,occ){
  const s=new Set(occ.map(p=>`${p.r},${p.c}`)); s.delete(`${from.r},${from.c}`);
  let bp=from,bd=dist(from,to);
  for(const d of [{r:-1,c:0},{r:1,c:0},{r:0,c:-1},{r:0,c:1}]){
    const nr=from.r+d.r,nc=from.c+d.c;
    if(!canWalk(map,nr,nc)||s.has(`${nr},${nc}`)) continue;
    const nd=dist({r:nr,c:nc},to);
    if(nd<bd){bd=nd;bp={r:nr,c:nc};}
  } return bp;
}

// ============================================================
// COMPONENTS
// ============================================================
const Dice=({v,c="#e8d5b0"})=>{
  const d={1:[[50,50]],2:[[25,25],[75,75]],3:[[25,25],[50,50],[75,75]],4:[[25,25],[75,25],[25,75],[75,75]],5:[[25,25],[75,25],[50,50],[25,75],[75,75]],6:[[25,25],[75,25],[25,50],[75,50],[25,75],[75,75]]};
  return <svg viewBox="0 0 100 100" style={{width:34,height:34,filter:"drop-shadow(1px 1px 2px rgba(0,0,0,0.3))"}}>
    <rect x="5" y="5" width="90" height="90" rx="15" fill={c} stroke="#5d4e37" strokeWidth="3"/>
    {(d[v]||[]).map(([x,y],i)=><circle key={i} cx={x} cy={y} r="9" fill="#2c1810"/>)}
  </svg>;
};
const DiceShow=({ad,dd,res,an,dn})=>{
  if(!ad)return null;const ab=best(ad),db=best(dd);
  return <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:4,padding:8,borderRadius:8,background:"rgba(44,24,16,0.12)"}}>
    <div style={{display:"flex",gap:12,alignItems:"center",flexWrap:"wrap",justifyContent:"center"}}>
      <div style={{textAlign:"center"}}><div style={{fontSize:10,fontWeight:700,color:"#8b0000"}}>{an} ⚔️</div>
        <div style={{display:"flex",gap:2}}>{ad.map((v,i)=><Dice key={i} v={v} c={v===ab?"#ffcc66":"#e8d5b0"}/>)}</div></div>
      <div style={{fontSize:18,fontWeight:900,color:"#5d4e37"}}>VS</div>
      <div style={{textAlign:"center"}}><div style={{fontSize:10,fontWeight:700,color:"#2c5530"}}>{dn} 🛡️</div>
        <div style={{display:"flex",gap:2}}>{dd.length>0?dd.map((v,i)=><Dice key={i} v={v} c={v===db?"#99ccff":"#e8d5b0"}/>):<span style={{fontSize:11,color:"#888"}}>—</span>}</div></div>
    </div>
    <div style={{fontSize:12,fontWeight:700,padding:"3px 12px",borderRadius:16,background:res==="hit"?"#c0392b":"#27ae60",color:"white"}}>
      {res==="hit"?"💥 פגיעה!":"🛡️ הגנה!"}</div>
  </div>;
};
const Tile=({type,ent,sel,mov,atk,onClick,sz})=>{
  const bg={0:"#c4a97d",1:"#3d2b1f",2:"#8b6914",3:"#6b8e6b",4:"#4a3520",6:"#2d5a3d",7:"#8a7a5a",8:"#4a7a9b",9:"#6d6050"};
  const ic={2:"🛢️",3:"🪜",4:"🕳️",6:"🍄",7:"⬆️",8:"🌊",9:"🪨"};
  let b=bg[type]||"#c4a97d",br="1px solid rgba(0,0,0,0.12)",cu="default",sh="none";
  if(sel){br="3px solid #ffd700";sh="0 0 6px #ffd700";}
  if(mov){b="#7dcea0";cu="pointer";br="2px solid #27ae60";}
  if(atk){b="#f1948a";cu="pointer";br="2px solid #c0392b";}
  return <div onClick={onClick} style={{width:sz,height:sz,background:b,border:br,cursor:cu,boxShadow:sh,
    display:"flex",alignItems:"center",justifyContent:"center",fontSize:sz*0.42,position:"relative",borderRadius:2}}>
    {type>1&&!ent&&<span style={{opacity:0.6}}>{ic[type]}</span>}
    {ent&&<div style={{fontSize:sz*0.48,filter:ent.isKO?"grayscale(1) opacity(0.3)":"none"}}>{ent.emoji}
      {ent.isHero&&ent.currentHp<ent.maxHp&&<div style={{position:"absolute",bottom:0,left:"50%",transform:"translateX(-50%)",
        fontSize:6,background:"rgba(0,0,0,0.8)",color:"#ff6b6b",borderRadius:2,padding:"0 2px",whiteSpace:"nowrap"}}>
        {"❤️".repeat(Math.max(0,ent.currentHp))}</div>}
    </div>}
  </div>;
};

// ============================================================
// GAME PHASES & REDUCER
// ============================================================
const P={TITLE:"t",SEL:"s",INTRO:"i",FIGHT:"f",ENC_END:"ee",CLIMB:"cl",CHOICE:"ch",POOL:"po",WIN:"w",LOSE:"l"};
const S0={phase:P.TITLE,selIds:[],heroes:[],mons:[],enc:0,selH:null,movSq:[],atkTgt:[],
  log:[],dice:null,iStep:0,iTxt:[],cStep:0,aggro:false,hPos:{},mPos:{},testDone:false,climbOk:false};

function R(st,a){switch(a.t){
  case "tog":{const ids=st.selIds.includes(a.id)?st.selIds.filter(x=>x!==a.id):st.selIds.length<4?[...st.selIds,a.id]:st.selIds;return{...st,selIds:ids};}
  case "start":{
    const heroes=st.selIds.map(id=>{const h=HEROES.find(x=>x.id===id);return{...h,currentHp:h.hp,maxHp:h.hp,potions:2,isKO:false,isHero:true,hasActed:false,hasMoved:false};});
    const txt=["אתם נהנים מארוחה בפונדק \"הגוש והמכלול\".","\"עזרה! עזרה!\"","מאב הפונדקאית פורצת מהמרתף.","\"חולדות ענקיות! והן לקחו את רוג׳ר!\"",
      "רוג׳ר — הבן של מאב שעוזר בפונדק.","\"בבקשה, רדו והחזירו אותו!\"","כולם מביטים בכם. ההורים מעודדים.","\"מוכנים להרפתקה הראשונה?\"",
      ...ENC[0].intro];
    return{...st,phase:P.INTRO,heroes,iStep:0,enc:0,iTxt:txt};}
  case "nxtI":{
    if(st.iStep<st.iTxt.length-1)return{...st,iStep:st.iStep+1};
    return startFight(st);}
  case "selH":{
    const h=st.heroes.find(x=>x.id===a.id);if(!h||h.isKO||h.hasActed)return st;
    const map=MAPS[st.enc];
    const occ=[...Object.values(st.hPos),...st.mons.filter(m=>!m.isKO).map(m=>st.mPos[m.id]).filter(Boolean)];
    const mv=h.hasMoved?[]:getMovable(map,st.hPos[h.id],h.moveSpeed||4,occ);
    const tg=getTargets(h,st.hPos[h.id],st.mons,st.mPos);
    return{...st,selH:h.id,movSq:mv,atkTgt:tg};}
  case "move":{
    if(!st.selH)return st;
    const np={...st.hPos,[st.selH]:{r:a.r,c:a.c}};
    const h=st.heroes.find(x=>x.id===st.selH);
    const nh=st.heroes.map(x=>x.id===st.selH?{...x,hasMoved:true}:x);
    const tg=getTargets(h,np[st.selH],st.mons,st.mPos);
    return{...st,hPos:np,heroes:nh,movSq:[],atkTgt:tg,log:[...st.log,`🚶 ${h.class} זז/ה`]};}
  case "atk":{
    if(!st.selH)return st;
    const h=st.heroes.find(x=>x.id===st.selH),m=st.mons.find(x=>x.id===a.id);
    if(!h||!m)return st;
    const ad=roll(h.attack.dice),dd=roll(m.armor),hit=best(ad)>best(dd);
    let nm=st.mons.map(x=>{if(x.id!==a.id)return x;const hp=hit?x.currentHp-1:x.currentHp;return{...x,currentHp:hp,isKO:hp<=0};});
    const nh=st.heroes.map(x=>x.id===st.selH?{...x,hasActed:true}:x);
    const lg=[...st.log,hit?`⚔️ ${h.class}→${m.shortName} 💥`:`⚔️ ${h.class}→${m.shortName} 🛡️`];
    if(hit&&nm.find(x=>x.id===a.id)?.isKO)lg.push(`💀 ${m.shortName} הודח/ה!`);
    const allKO=nm.every(x=>x.isKO);
    return{...st,heroes:nh,mons:nm,selH:null,movSq:[],atkTgt:[],log:lg,aggro:true,
      dice:{ad,dd,res:hit?"hit":"miss",an:h.subName,dn:m.shortName},
      phase:allKO?P.ENC_END:P.FIGHT,cStep:allKO?0:st.cStep};}
  case "pot":{
    if(!st.selH)return st;const h=st.heroes.find(x=>x.id===st.selH);
    if(!h||h.potions<=0||h.currentHp>=h.maxHp)return st;
    const nh=st.heroes.map(x=>x.id!==st.selH?x:{...x,potions:x.potions-1,currentHp:Math.min(x.currentHp+1,x.maxHp),hasActed:true});
    return{...st,heroes:nh,selH:null,movSq:[],atkTgt:[],log:[...st.log,`🧪 ${h.class} שותה שיקוי!`]};}
  case "endT":{
    let nh=[...st.heroes],lg=[...st.log,"🐀 תור החולדות!"],ld=null,nmp={...st.mPos};
    const map=MAPS[st.enc];
    if(st.aggro){
      st.mons.filter(m=>!m.isKO).forEach(m=>{
        let mp=nmp[m.id];if(!mp)return;
        let cl=null,cd=999;
        nh.filter(h=>!h.isKO).forEach(h=>{const d=dist(mp,st.hPos[h.id]);if(d<cd){cd=d;cl=h;}});
        if(!cl)return;
        const occ=[...Object.values(st.hPos),...st.mons.filter(x=>!x.isKO&&x.id!==m.id).map(x=>nmp[x.id]).filter(Boolean)];
        for(let s=0;s<3;s++){if(dist(mp,st.hPos[cl.id])<=1)break;
          const nx=stepTo(map,mp,st.hPos[cl.id],occ);if(nx.r===mp.r&&nx.c===mp.c)break;mp=nx;}
        nmp[m.id]=mp;
        if(dist(mp,st.hPos[cl.id])===1){
          const ad=roll(m.attack.dice),dd=roll(cl.armor),hit=best(ad)>best(dd);
          if(hit)nh=nh.map(h=>{if(h.id!==cl.id)return h;const hp=h.currentHp-1;return{...h,currentHp:hp,isKO:hp<=0};});
          lg.push(hit?`🐀 ${m.shortName}→${cl.class} 💥`:`🐀 ${m.shortName}→${cl.class} 🛡️`);
          if(hit&&nh.find(h=>h.id===cl.id)?.isKO)lg.push(`💔 ${cl.class} מחוסר/ת הכרה!`);
          ld={ad,dd,res:hit?"hit":"miss",an:m.shortName,dn:cl.class};
        }
      });
    }else lg.push("🐀 החולדות ממשיכות לזלול...");
    const dead=nh.every(h=>h.isKO);
    return{...st,heroes:nh.map(h=>({...h,hasActed:false,hasMoved:false})),mPos:nmp,log:lg,dice:ld,
      selH:null,movSq:[],atkTgt:[],phase:dead?P.LOSE:P.FIGHT};}
  case "nxtC":{
    const e=ENC[st.enc];
    if(st.cStep<e.outro.length-1)return{...st,cStep:st.cStep+1};
    if(e.climb&&!st.climbOk)return{...st,phase:P.CLIMB};
    if(e.choice)return{...st,phase:P.CHOICE};
    return advance(st);}
  case "test":{
    const e=ENC[st.enc],d=roll(1),ok=d[0]>=e.test.diff;
    let extra={testDone:true};
    if(e.pool&&ok)extra.heroes=st.heroes.map(h=>({...h,potions:h.potions+1}));
    return{...st,...extra,log:[...st.log,`🎲 ${e.test.name}: ${d[0]} (${e.test.diff}+) ${ok?"✅":"❌"}`],
      dice:{ad:d,dd:[],res:ok?"hit":"miss",an:"מבחן",dn:`קושי ${e.test.diff}`}};}
  case "climb":{const d=roll(1),ok=d[0]>=4;
    if(ok)return{...st,climbOk:true,log:[...st.log,`🧗 טיפוס: ${d[0]} ✅`],phase:P.ENC_END,
      dice:{ad:d,dd:[],res:"hit",an:"טיפוס",dn:"קושי 4"}};
    return{...st,log:[...st.log,`🧗 טיפוס: ${d[0]} ❌ נסו שוב!`],
      dice:{ad:d,dd:[],res:"miss",an:"טיפוס",dn:"קושי 4"}};}
  case "path":{
    if(a.dir==="south"){const e=ENC[3];return{...st,phase:P.INTRO,enc:3,iStep:0,iTxt:e.intro,testDone:false,climbOk:false,cStep:0};}
    const e=ENC[4];return{...st,phase:P.INTRO,enc:4,iStep:0,iTxt:e.intro,testDone:false,climbOk:false,cStep:0};}
  case "fromPool":{const e=ENC[4];return{...st,phase:P.INTRO,enc:4,iStep:0,iTxt:e.intro,testDone:false,climbOk:false,cStep:0};}
  case "rst":return{...S0};
  case "goSel":return{...S0,phase:P.SEL};
  default:return st;
}}

function startFight(st){
  const e=ENC[st.enc],map=MAPS[st.enc],mons=e.rats(st.heroes.length);
  const hp={};st.heroes.forEach((h,i)=>{const s=map.hs[i]||map.hs[0];hp[h.id]={...s};});
  const mp={};mons.forEach((m,i)=>{
    if(m.id==="king_rat"&&map.kp)mp[m.id]={...map.kp};
    else{const p=map.mp[i]||map.mp[i%Math.max(map.mp.length,1)]||{r:2,c:4};mp[m.id]={...p};}
  });
  const heroes=st.heroes.map(h=>({...h,hasActed:false,hasMoved:false,currentHp:h.maxHp,isKO:false}));
  if(mons.length===0)return{...st,phase:P.POOL,mons:[],hPos:hp,mPos:{},heroes,log:[`✨ ${e.title}`],dice:null,aggro:false};
  return{...st,phase:P.FIGHT,mons,hPos:hp,mPos:mp,heroes,log:[`⚔️ מפגש ${e.id}: ${e.title}`],dice:null,selH:null,aggro:e.aggro||false,testDone:false};
}

function advance(st){
  const c=st.enc;
  if(c<4){const e=ENC[c+1];return{...st,phase:P.INTRO,enc:c+1,iStep:0,iTxt:e.intro,testDone:false,climbOk:false,cStep:0};}
  return{...st,phase:P.WIN};
}

// ============================================================
// MAIN
// ============================================================
export default function Game(){
  const[st,d]=useReducer(R,S0);
  const logRef=useRef(null);
  const pwa=useInstallPrompt();
  useEffect(()=>{if(logRef.current)logRef.current.scrollTop=logRef.current.scrollHeight;},[st.log]);
  const G={gold:"#ffd700",red:"#c0392b",grn:"#27ae60",fg:"#e8d5b0",font:"'Segoe UI',Tahoma,sans-serif"};
  const btn=(bg,ex={})=>({fontSize:15,fontWeight:700,padding:"9px 24px",background:bg,color:"white",border:`2px solid ${G.gold}`,borderRadius:8,cursor:"pointer",...ex});

  // TITLE
  if(st.phase===P.TITLE)return(
    <div dir="rtl" style={{minHeight:"100vh",background:"linear-gradient(135deg,#1a0a00,#2c1810 40%,#3d2b1f 70%,#1a0a00)",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",fontFamily:G.font,color:G.fg,padding:20,textAlign:"center"}}>
      <div style={{fontSize:"clamp(34px,7vw,58px)",fontWeight:900,textShadow:"0 0 25px rgba(255,170,50,0.5)",marginBottom:8}}>🏰 ילדים גיבורים 🐉</div>
      <div style={{fontSize:"clamp(18px,4vw,28px)",fontWeight:700,color:G.red,marginBottom:20}}>מרתף החולדות 🐀</div>
      <div style={{fontSize:12,color:"#a89060",marginBottom:20,lineHeight:1.8}}>5 מפגשים • קושי: קל • 30-45 דקות</div>
      <button onClick={()=>d({t:"goSel"})} style={btn(`linear-gradient(135deg,${G.red},#e74c3c)`,{fontSize:18,padding:"12px 40px"})}>🗡️ התחילו הרפתקה!</button>
      {pwa.canInstall&&<button onClick={pwa.install} style={{marginTop:12,fontSize:13,padding:"8px 20px",background:"rgba(255,255,255,0.08)",color:"#ffd700",border:"1px solid rgba(255,215,0,0.3)",borderRadius:8,cursor:"pointer"}}>📲 התקינו כאפליקציה</button>}
      {pwa.installed&&<div style={{marginTop:10,fontSize:12,color:"#27ae60"}}>✅ מותקן כאפליקציה</div>}
    </div>);

  // SELECT
  if(st.phase===P.SEL)return(
    <div dir="rtl" style={{minHeight:"100vh",background:"linear-gradient(180deg,#2c1810,#1a0a00)",fontFamily:G.font,color:G.fg,padding:14}}>
      <h1 style={{textAlign:"center",fontSize:22,marginBottom:4,color:G.gold}}>⚔️ בחרו גיבורים ⚔️</h1>
      <p style={{textAlign:"center",fontSize:12,color:"#a89060",marginBottom:14}}>1-4 גיבורים. מומלץ: לוחם + מרפא.</p>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(240px,1fr))",gap:8,maxWidth:1050,margin:"0 auto"}}>
        {HEROES.map(h=>{const s=st.selIds.includes(h.id);return(
          <div key={h.id} onClick={()=>d({t:"tog",id:h.id})} style={{background:s?`linear-gradient(135deg,${h.color}33,${h.color}11)`:"rgba(255,255,255,0.03)",
            border:s?`3px solid ${h.color}`:"2px solid rgba(255,255,255,0.1)",borderRadius:10,padding:10,cursor:"pointer",boxShadow:s?`0 0 10px ${h.color}44`:"none"}}>
            <div style={{display:"flex",alignItems:"center",gap:7,marginBottom:5}}>
              <span style={{fontSize:26}}>{h.emoji}</span>
              <div><div style={{fontWeight:700,fontSize:14,color:h.color}}>{h.class}</div><div style={{fontSize:10,color:"#a89060"}}>{h.subName}</div></div>
              {s&&<span style={{marginRight:"auto",fontSize:16}}>✅</span>}
            </div>
            <div style={{fontSize:9,lineHeight:1.5,color:"#c4a97d"}}>
              ⚔️{h.attack.name} ✨{h.special.name} 🎁{h.bonus.name}
              <div style={{marginTop:2}}>❤️{h.hp} 🗡️{h.attack.dice}d6 🛡️{h.armor}d6</div>
            </div>
          </div>);})}
      </div>
      {st.selIds.length>0&&<div style={{textAlign:"center",marginTop:14}}>
        <button onClick={()=>d({t:"start"})} style={btn(`linear-gradient(135deg,${G.grn},#2ecc71)`,{fontSize:16})}>🏰 צאו עם {st.selIds.length} גיבורים!</button></div>}
    </div>);

  // INTRO
  if(st.phase===P.INTRO){
    const e=ENC[st.enc],txt=st.iTxt||[],isPro=st.enc===0&&st.iStep<8,isDlg=isPro&&st.iStep>=1&&st.iStep<=7;
    return(<div dir="rtl" style={{minHeight:"100vh",background:"linear-gradient(180deg,#1a0a00,#2c1810 50%,#3d2b1f)",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",fontFamily:G.font,color:G.fg,padding:20,textAlign:"center"}}>
      <div style={{maxWidth:520,background:"rgba(255,255,255,0.05)",border:"2px solid rgba(255,215,0,0.3)",borderRadius:12,padding:24}}>
        <div style={{fontSize:11,color:"#a89060",marginBottom:10}}>{isPro?"🏰 פרולוג":`⚔️ מפגש ${e.id}: ${e.title}`}</div>
        <div style={{fontSize:16,lineHeight:2,marginBottom:16,fontStyle:isDlg?"italic":"normal",color:isDlg?G.gold:G.fg}}>{txt[st.iStep]}</div>
        <div style={{fontSize:10,color:"#666",marginBottom:6}}>{st.iStep+1}/{txt.length}</div>
        <button onClick={()=>d({t:"nxtI"})} style={btn(`linear-gradient(135deg,${G.red},#e74c3c)`)}>
          {st.iStep<txt.length-1?"המשיכו ←":"🗡️ התחילו!"}</button>
      </div>
    </div>);}

  // ENC END
  if(st.phase===P.ENC_END){const e=ENC[st.enc];return(
    <div dir="rtl" style={{minHeight:"100vh",background:"linear-gradient(180deg,#0a2a0a,#1a3a1a 50%,#2c1810)",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",fontFamily:G.font,color:G.fg,padding:20,textAlign:"center"}}>
      <div style={{maxWidth:520,background:"rgba(255,255,255,0.05)",border:`2px solid rgba(39,174,96,0.4)`,borderRadius:12,padding:24}}>
        <div style={{fontSize:28,marginBottom:10}}>🎉</div>
        <div style={{fontSize:18,fontWeight:700,color:G.grn,marginBottom:10}}>ניצחון במפגש {e.id}!</div>
        <div style={{fontSize:14,lineHeight:1.9,marginBottom:14,fontStyle:"italic"}}>{e.outro[st.cStep]}</div>
        {!st.testDone&&e.test&&st.cStep===0&&<button onClick={()=>d({t:"test"})} style={btn("linear-gradient(135deg,#8e44ad,#9b59b6)",{marginBottom:8,display:"block",width:"100%",fontSize:13})}>🎲 מבחן {e.test.name} (קושי {e.test.diff})</button>}
        {st.dice&&<div style={{marginBottom:8}}><DiceShow {...st.dice}/></div>}
        <button onClick={()=>d({t:"nxtC"})} style={btn(`linear-gradient(135deg,${G.grn},#2ecc71)`)}>{st.cStep<e.outro.length-1?"המשיכו ←":"➡️ הלאה!"}</button>
      </div>
    </div>);}

  // CLIMB
  if(st.phase===P.CLIMB)return(
    <div dir="rtl" style={{minHeight:"100vh",background:"linear-gradient(180deg,#2c1810,#1a0a00)",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",fontFamily:G.font,color:G.fg,padding:20,textAlign:"center"}}>
      <div style={{maxWidth:440,background:"rgba(255,255,255,0.05)",border:"2px solid rgba(255,215,0,0.3)",borderRadius:12,padding:24}}>
        <div style={{fontSize:26,marginBottom:10}}>🧗</div>
        <div style={{fontSize:16,fontWeight:700,color:G.gold,marginBottom:10}}>מבחן טיפוס!</div>
        <div style={{fontSize:14,lineHeight:1.8,marginBottom:14}}>המדרגה גבוהה ~3 מטרים. מצאו דרך לטפס!</div>
        <button onClick={()=>d({t:"climb"})} style={btn("linear-gradient(135deg,#e67e22,#f39c12)")}>🎲 נסו לטפס! (קושי 4)</button>
        {st.dice&&<div style={{marginTop:10}}><DiceShow {...st.dice}/></div>}
      </div>
    </div>);

  // CHOICE
  if(st.phase===P.CHOICE)return(
    <div dir="rtl" style={{minHeight:"100vh",background:"linear-gradient(180deg,#1a0a00,#2c1810)",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",fontFamily:G.font,color:G.fg,padding:20,textAlign:"center"}}>
      <div style={{maxWidth:460,background:"rgba(255,255,255,0.05)",border:"2px solid rgba(255,215,0,0.3)",borderRadius:12,padding:24}}>
        <div style={{fontSize:26,marginBottom:10}}>🗺️</div>
        <div style={{fontSize:18,fontWeight:700,color:G.gold,marginBottom:10}}>לאן הולכים?</div>
        <div style={{fontSize:13,lineHeight:1.8,marginBottom:16,color:"#c4a97d"}}>ריח חולדות מהצפון. צליל מים מהדרום.</div>
        <div style={{display:"flex",gap:10,justifyContent:"center",flexWrap:"wrap"}}>
          <button onClick={()=>d({t:"path",dir:"north"})} style={btn(`linear-gradient(135deg,${G.red},#e74c3c)`,{flex:1,minWidth:130})}>⬆️ צפון<br/><span style={{fontSize:10}}>מאורת המלך</span></button>
          <button onClick={()=>d({t:"path",dir:"south"})} style={btn("linear-gradient(135deg,#2980b9,#3498db)",{flex:1,minWidth:130})}>⬇️ דרום<br/><span style={{fontSize:10}}>בריכה מסתורית</span></button>
        </div>
      </div>
    </div>);

  // POOL
  if(st.phase===P.POOL){const e=ENC[st.enc];return(
    <div dir="rtl" style={{minHeight:"100vh",background:"linear-gradient(180deg,#0a1a2a,#1a2a3a 50%,#2c1810)",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",fontFamily:G.font,color:G.fg,padding:20,textAlign:"center"}}>
      <div style={{maxWidth:460,background:"rgba(255,255,255,0.05)",border:"2px solid rgba(41,128,185,0.4)",borderRadius:12,padding:24}}>
        <div style={{fontSize:32,marginBottom:10}}>🌊✨</div>
        <div style={{fontSize:18,fontWeight:700,color:"#3498db",marginBottom:10}}>{e.title}</div>
        <div style={{fontSize:14,lineHeight:1.8,marginBottom:14,fontStyle:"italic"}}>{e.intro.join(" ")}</div>
        {!st.testDone&&<button onClick={()=>d({t:"test"})} style={btn("linear-gradient(135deg,#2980b9,#3498db)",{marginBottom:8,width:"100%"})}>🎲 חפשו בבריכה! (קושי {e.test.diff})</button>}
        {st.dice&&<div style={{marginBottom:8}}><DiceShow {...st.dice}/></div>}
        <div style={{fontSize:13,color:"#a89060",marginBottom:10}}>❤️ הגיבורים נחים — בריאות מלאה!</div>
        <button onClick={()=>d({t:"fromPool"})} style={btn(`linear-gradient(135deg,${G.grn},#2ecc71)`)}>⬆️ חזרו צפונה — למלך!</button>
      </div>
    </div>);}

  // WIN
  if(st.phase===P.WIN)return(
    <div dir="rtl" style={{minHeight:"100vh",background:"linear-gradient(135deg,#0a2a0a,#1a3a1a 40%,#2c4a0a)",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",fontFamily:G.font,color:G.gold,padding:20,textAlign:"center"}}>
      <div style={{fontSize:50,marginBottom:10}}>🏆🎉🐀👑</div>
      <div style={{fontSize:24,fontWeight:900,marginBottom:6}}>השלמתם את ההרפתקה!</div>
      <div style={{fontSize:14,color:G.fg,maxWidth:450,lineHeight:1.8,marginBottom:14}}>הצלתם את רוג׳ר! אתם גיבורי כפר ריבנשור! 🍦 גלידה לשבוע!</div>
      <div style={{fontSize:12,color:"#a89060",marginBottom:16}}>הרפתקאות נוספות: קבר המלך האבוד • שריפה בריבנשור</div>
      <button onClick={()=>d({t:"rst"})} style={btn(`linear-gradient(135deg,${G.red},#e74c3c)`)}>🔄 שחקו שוב!</button>
    </div>);

  // LOSE
  if(st.phase===P.LOSE)return(
    <div dir="rtl" style={{minHeight:"100vh",background:"linear-gradient(135deg,#1a0a00,#300a0a 50%,#1a0a00)",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",fontFamily:G.font,color:G.fg,padding:20,textAlign:"center"}}>
      <div style={{fontSize:44,marginBottom:10}}>💔🐀😵</div>
      <div style={{fontSize:22,fontWeight:900,color:G.red,marginBottom:6}}>הגיבורים הובסו...</div>
      <div style={{fontSize:13,maxWidth:400,lineHeight:1.8,marginBottom:14}}>גיבורים אמיתיים לא מוותרים!</div>
      <button onClick={()=>d({t:"rst"})} style={btn(`linear-gradient(135deg,${G.red},#e74c3c)`)}>🔄 נסו שוב!</button>
    </div>);

  // ============================================================
  // COMBAT
  // ============================================================
  const enc=ENC[st.enc],map=MAPS[st.enc];
  const ts=Math.min(38,Math.floor((typeof window!=='undefined'?Math.min(window.innerWidth-250,560):380)/map.cols));
  const em={};
  st.heroes.forEach(h=>{const p=st.hPos[h.id];if(p)em[`${p.r},${p.c}`]={...h,isHero:true};});
  st.mons.forEach(m=>{const p=st.mPos[m.id];if(p)em[`${p.r},${p.c}`]=m;});
  const ms=new Set(st.movSq.map(s=>`${s.r},${s.c}`));
  const as=new Set(st.atkTgt.map(id=>{const p=st.mPos[id];return p?`${p.r},${p.c}`:null}).filter(Boolean));
  const allDone=st.heroes.filter(h=>!h.isKO).every(h=>h.hasActed);
  const sh=st.heroes.find(h=>h.id===st.selH);

  const click=(r,c)=>{const k=`${r},${c}`,e=em[k];
    if(e&&e.isHero&&!e.isKO&&!e.hasActed)return d({t:"selH",id:e.id});
    if(ms.has(k))return d({t:"move",r,c});
    if(as.has(k)){const m=st.mons.find(m=>{const p=st.mPos[m.id];return p&&p.r===r&&p.c===c;});if(m)d({t:"atk",id:m.id});}};

  return(
    <div dir="rtl" style={{minHeight:"100vh",background:"linear-gradient(180deg,#2c1810,#1a0a00)",fontFamily:G.font,color:G.fg,display:"flex",flexDirection:"column"}}>
      <div style={{background:"rgba(0,0,0,0.4)",padding:"5px 12px",display:"flex",justifyContent:"space-between",alignItems:"center",borderBottom:`2px solid rgba(255,215,0,0.3)`}}>
        <div style={{fontWeight:700,fontSize:14,color:G.gold}}>⚔️ מפגש {enc.id}: {enc.title}</div>
        <div style={{fontSize:11,color:"#a89060"}}>🎯 תורכם!</div>
      </div>
      {enc.tip&&<div style={{background:"rgba(255,170,50,0.1)",padding:"4px 12px",fontSize:11,color:"#ffa832",textAlign:"center"}}>{enc.tip}</div>}
      <div style={{display:"flex",flex:1,overflow:"hidden"}}>
        <div style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",padding:6,overflow:"auto"}}>
          <div style={{display:"grid",gridTemplateColumns:`repeat(${map.cols},${ts}px)`,gap:1,background:"rgba(0,0,0,0.3)",borderRadius:5,padding:3,marginBottom:6}}>
            {map.tiles.flatMap((row,r)=>row.map((t,c)=>{const k=`${r},${c}`,e=em[k];
              return<Tile key={k} type={t} ent={e} sel={e&&e.isHero&&e.id===st.selH} mov={ms.has(k)} atk={as.has(k)} onClick={()=>click(r,c)} sz={ts}/>;}))}
          </div>
          {!st.testDone&&enc.test&&<button onClick={()=>d({t:"test"})} style={btn("linear-gradient(135deg,#8e44ad,#9b59b6)",{fontSize:12,padding:"5px 16px",marginBottom:4})}>🎲 מבחן {enc.test.name}</button>}
          {st.dice&&<DiceShow {...st.dice}/>}
        </div>
        <div style={{width:220,minWidth:220,background:"rgba(0,0,0,0.3)",borderRight:`2px solid rgba(255,215,0,0.12)`,display:"flex",flexDirection:"column",overflow:"hidden"}}>
          <div style={{padding:6,borderBottom:"1px solid rgba(255,215,0,0.08)"}}>
            <div style={{fontWeight:700,fontSize:12,color:G.gold,marginBottom:4}}>🦸 גיבורים</div>
            {st.heroes.map(h=>{const iS=h.id===st.selH,can=!h.isKO&&!h.hasActed;return(
              <div key={h.id} onClick={()=>can&&d({t:"selH",id:h.id})} style={{background:iS?"rgba(255,215,0,0.1)":"rgba(255,255,255,0.02)",
                border:iS?`2px solid ${G.gold}`:"1px solid rgba(255,255,255,0.06)",borderRadius:5,padding:5,marginBottom:3,
                cursor:can?"pointer":"default",opacity:h.isKO?0.3:h.hasActed?0.5:1}}>
                <div style={{display:"flex",justifyContent:"space-between",fontSize:11}}><span style={{fontWeight:700}}>{h.emoji}{h.class}</span><span style={{color:"#a89060"}}>🧪{h.potions}</span></div>
                <div style={{display:"flex",gap:1,marginTop:2}}>{Array.from({length:h.maxHp},(_,i)=><span key={i} style={{fontSize:10}}>{i<h.currentHp?"❤️":"🖤"}</span>)}</div>
                {h.isKO&&<div style={{fontSize:9,color:G.red}}>💔 מחוסר/ת הכרה</div>}
                {h.hasActed&&!h.isKO&&<div style={{fontSize:9,color:"#a89060"}}>✓</div>}
              </div>);})}
          </div>
          {sh&&!sh.hasActed&&<div style={{padding:6,borderBottom:"1px solid rgba(255,215,0,0.08)"}}>
            <div style={{fontWeight:700,fontSize:11,color:G.gold,marginBottom:3}}>⚡ {sh.class}</div>
            <div style={{fontSize:9,color:"#c4a97d",marginBottom:3}}>{!sh.hasMoved?"🟢 ירוק=תנועה":st.atkTgt.length>0?"🔴 אדום=תקיפה":"⚠️ אין יריבים בטווח"}</div>
            {sh.potions>0&&sh.currentHp<sh.maxHp&&<button onClick={()=>d({t:"pot"})} style={{width:"100%",padding:4,fontSize:10,fontWeight:700,background:`linear-gradient(135deg,${G.grn},#2ecc71)`,color:"white",border:"none",borderRadius:4,cursor:"pointer"}}>🧪 שיקוי</button>}
          </div>}
          <div style={{padding:6,borderBottom:"1px solid rgba(255,215,0,0.08)"}}>
            <div style={{fontWeight:700,fontSize:12,color:G.red,marginBottom:4}}>🐀 מפלצות</div>
            {st.mons.map(m=><div key={m.id} style={{display:"flex",justifyContent:"space-between",padding:"2px 4px",marginBottom:1,opacity:m.isKO?0.25:1,borderRadius:2,background:"rgba(192,57,43,0.06)",fontSize:10}}>
              <span>{m.emoji}{m.shortName}</span><span>{m.isKO?"💀":"❤️".repeat(Math.max(0,m.currentHp))}</span></div>)}
          </div>
          <div style={{padding:6}}><button onClick={()=>d({t:"endT"})} style={{width:"100%",padding:7,fontSize:12,fontWeight:700,
            background:allDone?`linear-gradient(135deg,#e74c3c,${G.red})`:"rgba(255,255,255,0.06)",
            color:"white",border:`2px solid rgba(255,215,0,0.3)`,borderRadius:5,cursor:"pointer"}}>
            {allDone?"🐀 סיימו תור":"🐀 סיימו (נותרו)"}</button></div>
          <div ref={logRef} style={{flex:1,padding:6,overflowY:"auto",fontSize:9,lineHeight:1.5,color:"#a89060"}}>
            <div style={{fontWeight:700,fontSize:10,color:G.gold,marginBottom:3}}>📜 יומן</div>
            {st.log.slice(-25).map((m,i)=><div key={i}>{m}</div>)}
          </div>
        </div>
      </div>
    </div>);
}
