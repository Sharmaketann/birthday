const REDUCE = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
const D = REDUCE ? 0.001 : 1;
gsap.defaults({ ease: 'power2.out', overwrite: 'auto' });

// ═══════════════════════════════════════════════════════════════
// DATA
// ═══════════════════════════════════════════════════════════════
const MEMORIES = [
  { hl:'THE ORIGIN PATCH',          txt:'Small human. Huge opinions. Zero fear.',                                era:'The Origin',         img:'https://i.imgflip.com/23ls.jpg',    alt:'Disaster Girl meme',             sfx:'softPop'     },
  { hl:'THE CLASSROOM ARC',         txt:'Answered questions you weren\'t asked. Still somehow iconic.',         era:'The School Days',     img:'https://i.imgflip.com/1h7in3.jpg',  alt:'Roll Safe Think About It meme',  sfx:'bellTap'     },
  { hl:'THE CONFIDENCE UPDATE',     txt:'Confidence unlocked. Decision-making optional.',                       era:'The Glow-Up',         img:'https://i.imgflip.com/39t1o.jpg',   alt:'Leonardo DiCaprio Cheers meme',  sfx:'recordScratch'},
  { hl:'THE CHAOS DEGREE',          txt:'Survived exams and vibes. Mostly vibes.',                             era:'The Degree Years',    img:'https://i.imgflip.com/wxica.jpg',   alt:'This Is Fine meme',              sfx:'crowdCheer'  },
  { hl:'THE FIRST BIG WIN',         txt:'That one win you still mention. Valid.',                              era:'The Victory Lap',     img:'https://i.imgflip.com/1bhk.jpg',    alt:'Success Kid meme',               sfx:'trophyDing'  },
  { hl:'THE GROUP CHAT LORE',       txt:'Started debates. Won screenshots. Disappeared when accountability loaded.', era:'The Social Era', img:'https://i.imgflip.com/2gnnjh.jpg',  alt:'Monkey Puppet meme',             sfx:'notifPing'   },
  { hl:"THE 'TOUCHED GRASS' DLC",   txt:'Went outside. Documented it like a celebrity.',                       era:'The Great Outdoors',  img:'https://i.imgflip.com/1o00in.jpg',  alt:'Is This A Pigeon meme',          sfx:'cameraClick' },
  { hl:'THE MEME PRIME',            txt:'Delivered memes on time. Unlike everything else.',                    era:'The Content Era',     img:'https://i.imgflip.com/1jwhww.jpg',  alt:'Expanding Brain meme',           sfx:'bassBoom'    },
  { hl:'THE GLOW-UP PATCH',         txt:'Upgrades installed. Personality remains undefeated.',                 era:'The Upgrade',         img:'https://i.imgflip.com/43a45p.png',  alt:'Buff Doge vs Cheems meme',       sfx:'risingChime' },
  { hl:'TODAY: LEVEL UP',           txt:'Another year added. Same Samik. More legendary.',                     era:'Right Now',           img:'https://i.imgflip.com/gtj5t.jpg',   alt:'Oprah You Get A meme',           sfx:'confettiPop' },
];

const MEMES = [
  { src:'https://i.imgflip.com/30b1gx.jpg',  alt:'Drake Hotline Bling'        },
  { src:'https://i.imgflip.com/1ur9b0.jpg',  alt:'Distracted Boyfriend'       },
  { src:'https://i.imgflip.com/345v97.jpg',  alt:'Woman Yelling At Cat'       },
  { src:'https://i.imgflip.com/3qqcim.png',  alt:'Panik Kalm Panik'           },
  { src:'https://i.imgflip.com/26jxvz.jpg',  alt:"Gru's Plan"                 },
  { src:'https://i.imgflip.com/wxica.jpg',   alt:'This Is Fine'               },
  { src:'https://i.imgflip.com/2kbn1e.jpg',  alt:'Surprised Pikachu'          },
  { src:'https://i.imgflip.com/3eqjd8.jpg',  alt:'Spider Man Triple'          },
  { src:'https://i.imgflip.com/2ybua0.png',  alt:'Tuxedo Winnie The Pooh'     },
  { src:'https://i.imgflip.com/1h7in3.jpg',  alt:'Roll Safe Think About It'   },
  { src:'https://i.imgflip.com/39t1o.jpg',   alt:'Leonardo DiCaprio Cheers'   },
  { src:'https://i.imgflip.com/gk5el.jpg',   alt:'Hide the Pain Harold'       },
];

// ═══════════════════════════════════════════════════════════════
// AUDIO ENGINE
// ═══════════════════════════════════════════════════════════════
let ctx = null, muted = false, ambient = null;

function getCtx() {
  if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
  if (ctx.state === 'suspended') ctx.resume();
  return ctx;
}

function play(fn) {
  if (muted) return;
  try { fn(getCtx()); } catch(e) {}
}

const SFX = {
  bootChime(ac) {
    const now = ac.currentTime;
    [261.63,329.63,392,523.25].forEach((f,i) => {
      const o = ac.createOscillator(), g = ac.createGain();
      o.connect(g); g.connect(ac.destination);
      o.type = 'sine'; o.frequency.value = f;
      g.gain.setValueAtTime(0, now+i*.18);
      g.gain.linearRampToValueAtTime(.22, now+i*.18+.02);
      g.gain.exponentialRampToValueAtTime(.001, now+i*.18+.7);
      o.start(now+i*.18); o.stop(now+i*.18+.75);
    });
  },
  softPop(ac) {
    const now = ac.currentTime;
    const o = ac.createOscillator(), g = ac.createGain();
    o.connect(g); g.connect(ac.destination);
    o.type='sine'; o.frequency.setValueAtTime(600,now); o.frequency.exponentialRampToValueAtTime(200,now+.08);
    g.gain.setValueAtTime(.28,now); g.gain.exponentialRampToValueAtTime(.001,now+.15);
    o.start(now); o.stop(now+.2);
  },
  bellTap(ac) {
    const now = ac.currentTime;
    [[880,.3,1.4],[1760,.12,.9],[2640,.06,.6]].forEach(([f,gv,d]) => {
      const o = ac.createOscillator(), g = ac.createGain();
      o.connect(g); g.connect(ac.destination);
      o.type='sine'; o.frequency.value=f;
      g.gain.setValueAtTime(gv,now); g.gain.exponentialRampToValueAtTime(.001,now+d);
      o.start(now); o.stop(now+d+.05);
    });
  },
  recordScratch(ac) {
    const now = ac.currentTime, len = Math.floor(ac.sampleRate*.25);
    const buf = ac.createBuffer(1,len,ac.sampleRate), d = buf.getChannelData(0);
    for(let i=0;i<len;i++) d[i]=(Math.random()*2-1)*Math.sin(Math.PI*i/len);
    const src=ac.createBufferSource(), bpf=ac.createBiquadFilter(), g=ac.createGain();
    src.buffer=buf; bpf.type='bandpass'; bpf.frequency.value=1200; bpf.Q.value=.8;
    g.gain.setValueAtTime(.45,now); g.gain.exponentialRampToValueAtTime(.001,now+.25);
    src.connect(bpf); bpf.connect(g); g.connect(ac.destination); src.start(now);
  },
  crowdCheer(ac) {
    const now=ac.currentTime, dur=1.8, len=ac.sampleRate*dur;
    const buf=ac.createBuffer(2,len,ac.sampleRate);
    for(let ch=0;ch<2;ch++){const d=buf.getChannelData(ch);let lo=0;for(let i=0;i<len;i++){const w=Math.random()*2-1;lo=(lo+.05*w)/1.05;d[i]=lo*10;}}
    const src=ac.createBufferSource(); src.buffer=buf;
    const lpf=ac.createBiquadFilter(); lpf.type='lowpass'; lpf.frequency.value=3500;
    const g=ac.createGain();
    g.gain.setValueAtTime(0,now); g.gain.linearRampToValueAtTime(.3,now+.2); g.gain.exponentialRampToValueAtTime(.001,now+dur);
    src.connect(lpf); lpf.connect(g); g.connect(ac.destination); src.start(now);
  },
  trophyDing(ac) {
    const now=ac.currentTime;
    [[440,.4,2],[880,.2,1.3],[1318,.1,.8],[2093,.05,.5]].forEach(([f,gv,d]) => {
      const o=ac.createOscillator(), g=ac.createGain();
      o.connect(g); g.connect(ac.destination);
      o.type='sine'; o.frequency.value=f;
      g.gain.setValueAtTime(gv,now); g.gain.exponentialRampToValueAtTime(.001,now+d);
      o.start(now); o.stop(now+d+.05);
    });
  },
  notifPing(ac) {
    const now=ac.currentTime;
    const o=ac.createOscillator(), g=ac.createGain();
    o.connect(g); g.connect(ac.destination);
    o.type='sine'; o.frequency.setValueAtTime(880,now); o.frequency.exponentialRampToValueAtTime(1200,now+.06);
    g.gain.setValueAtTime(.28,now); g.gain.exponentialRampToValueAtTime(.001,now+.5);
    o.start(now); o.stop(now+.55);
  },
  cameraClick(ac) {
    const now=ac.currentTime, len=Math.floor(ac.sampleRate*.04);
    const buf=ac.createBuffer(1,len,ac.sampleRate), d=buf.getChannelData(0);
    for(let i=0;i<len;i++) d[i]=(Math.random()*2-1)*Math.pow(1-i/len,4);
    const src=ac.createBufferSource(), hpf=ac.createBiquadFilter(), g=ac.createGain();
    src.buffer=buf; hpf.type='highpass'; hpf.frequency.value=800; g.gain.value=.65;
    src.connect(hpf); hpf.connect(g); g.connect(ac.destination); src.start(now);
    const o=ac.createOscillator(), g2=ac.createGain();
    o.connect(g2); g2.connect(ac.destination);
    o.type='sine'; o.frequency.setValueAtTime(200,now); o.frequency.exponentialRampToValueAtTime(60,now+.04);
    g2.gain.setValueAtTime(.35,now); g2.gain.exponentialRampToValueAtTime(.001,now+.05);
    o.start(now); o.stop(now+.06);
  },
  bassBoom(ac) {
    const now=ac.currentTime;
    const o=ac.createOscillator(), g=ac.createGain();
    o.connect(g); g.connect(ac.destination);
    o.type='sine'; o.frequency.setValueAtTime(120,now); o.frequency.exponentialRampToValueAtTime(30,now+.4);
    g.gain.setValueAtTime(.55,now); g.gain.exponentialRampToValueAtTime(.001,now+.6);
    o.start(now); o.stop(now+.65);
  },
  risingChime(ac) {
    const now=ac.currentTime;
    [261.63,293.66,329.63,392,440,523.25].forEach((f,i) => {
      const o=ac.createOscillator(), g=ac.createGain();
      o.connect(g); g.connect(ac.destination);
      o.type='sine'; o.frequency.value=f;
      const t=now+i*.13;
      g.gain.setValueAtTime(.22,t); g.gain.exponentialRampToValueAtTime(.001,t+.85);
      o.start(t); o.stop(t+.9);
    });
  },
  confettiPop(ac) {
    const now=ac.currentTime, len=Math.floor(ac.sampleRate*.03);
    const buf=ac.createBuffer(1,len,ac.sampleRate), d=buf.getChannelData(0);
    for(let i=0;i<len;i++) d[i]=(Math.random()*2-1)*Math.pow(1-i/len,2);
    const src=ac.createBufferSource(), pg=ac.createGain();
    src.buffer=buf; pg.gain.value=.55; src.connect(pg); pg.connect(ac.destination); src.start(now);
    [2093,2637,3136,3520,4186].forEach((f,i) => {
      const t=now+i*.04+Math.random()*.015;
      const o=ac.createOscillator(), g=ac.createGain();
      o.connect(g); g.connect(ac.destination);
      o.type='sine'; o.frequency.value=f;
      g.gain.setValueAtTime(.11,t); g.gain.exponentialRampToValueAtTime(.001,t+.3);
      o.start(t); o.stop(t+.35);
    });
  },
};

const SFX_MAP = { softPop:SFX.softPop, bellTap:SFX.bellTap, recordScratch:SFX.recordScratch, crowdCheer:SFX.crowdCheer, trophyDing:SFX.trophyDing, notifPing:SFX.notifPing, cameraClick:SFX.cameraClick, bassBoom:SFX.bassBoom, risingChime:SFX.risingChime, confettiPop:SFX.confettiPop };

class AmbientLoop {
  constructor() { this.nodes=[]; this.master=null; this.on=false; }
  start() {
    if (this.on) return;
    const ac=getCtx();
    this.master=ac.createGain(); this.master.gain.value=0; this.master.connect(ac.destination);
    // IR reverb
    const rLen=ac.sampleRate*2.5, rBuf=ac.createBuffer(2,rLen,ac.sampleRate);
    for(let ch=0;ch<2;ch++){const d=rBuf.getChannelData(ch);for(let i=0;i<rLen;i++)d[i]=(Math.random()*2-1)*Math.pow(1-i/rLen,2);}
    const conv=ac.createConvolver(); conv.buffer=rBuf;
    const revG=ac.createGain(); revG.gain.value=.28; conv.connect(revG); revG.connect(this.master);
    // Drone
    [65.41,98,130.81,164.81].forEach(f=>{
      [-5,0,5].forEach(det=>{
        const o=ac.createOscillator(), g=ac.createGain();
        o.type='sine'; o.frequency.value=f; o.detune.value=det; g.gain.value=.055;
        o.connect(g); g.connect(this.master); g.connect(conv);
        o.start(); this.nodes.push(o);
      });
    });
    // LFO
    const lfo=ac.createOscillator(), lg=ac.createGain();
    lfo.frequency.value=.1; lg.gain.value=.025;
    lfo.connect(lg); lg.connect(this.master.gain); lfo.start(); this.nodes.push(lfo);
    // Fade in
    this.master.gain.setValueAtTime(0,ac.currentTime);
    this.master.gain.linearRampToValueAtTime(muted?0:.5, ac.currentTime+3);
    this.on=true;
  }
  vol(v) {
    if(!this.master) return;
    const ac=getCtx();
    this.master.gain.cancelScheduledValues(ac.currentTime);
    this.master.gain.linearRampToValueAtTime(v,ac.currentTime+.3);
  }
  stop() {
    this.nodes.forEach(n=>{ try{n.stop();}catch(e){} try{n.disconnect();}catch(e){} });
    this.nodes=[];
    try{ if(this.master){ this.master.disconnect(); this.master=null; } }catch(e){}
    this.on=false;
  }
}

// ═══════════════════════════════════════════════════════════════
// SLIDE NAVIGATION
// ═══════════════════════════════════════════════════════════════
const SLIDES = ['s0','s1','s2','s3','s4','s5','s6','s7','s8','s9'];
let cur = 0;

// Module-level timer handles so stale timers can always be cancelled
let s2Timer = null;
let installIv = null;
let finalTimers = [];
let confStopTimer = null;

function cancelSlideTimers(slideId) {
  if (slideId==='s2') { if(s2Timer){ clearTimeout(s2Timer); s2Timer=null; } }
  if (slideId==='s3') { if(installIv){ clearInterval(installIv); installIv=null; } }
  if (slideId==='s7') { finalTimers.forEach(t=>clearTimeout(t)); finalTimers=[]; }
}

function goTo(idx) {
  if (idx === cur || idx < 0 || idx >= SLIDES.length) return;
  cancelSlideTimers(SLIDES[cur]);
  const oldEl = document.getElementById(SLIDES[cur]);
  const newEl = document.getElementById(SLIDES[idx]);
  gsap.killTweensOf(oldEl);
  gsap.killTweensOf(newEl);
  gsap.to(oldEl, { opacity: 0, y: -24, duration: 0.36 * D, ease: 'power2.in', onComplete() { gsap.set(oldEl, { y: 0, pointerEvents: 'none' }); } });
  gsap.fromTo(newEl, { opacity: 0, y: 28 }, { opacity: 1, y: 0, duration: 0.46 * D, delay: 0.18 * D, ease: 'power2.out', onStart() { newEl.style.pointerEvents = 'auto'; } });
  cur = idx;
  onEnter(idx);
}

function onEnter(idx) {
  const id = SLIDES[idx];
  if (id==='s1') runTypewriter();
  if (id==='s2') { if(s2Timer) clearTimeout(s2Timer); s2Timer=setTimeout(()=>goTo(3), 3200); }
  if (id==='s3') startInstall();
  if (id==='s4') initStats();
  if (id==='s5') initMems();
  if (id==='s6') initMemes();
  if (id==='s7') animateFinal();
  if (id==='s8') celebrate();
  if (id==='s9') initShark();
  // Pause shark video when leaving s9
  if (id!=='s9') { const v=document.getElementById('shark-video'); if(v){ v.pause(); v.currentTime=0; } }
}

// ═══════════════════════════════════════════════════════════════
// PRELOADER
// ═══════════════════════════════════════════════════════════════
(function initPreloader() {
  let n=0;
  const el=document.getElementById('pre-ellipsis');
  const iv=setInterval(()=>{ n=(n+1)%4; el.textContent='.'.repeat(n); }, 420);
  setTimeout(()=>{ try{ play(SFX.bootChime); }catch(e){} }, 200);
  setTimeout(()=>{ clearInterval(iv); goTo(1); }, 2900);
  // Animate preloader dots entrance
  gsap.from('.pre-dot', { opacity:0, y:10, stagger:0.1, duration:0.4, ease:'power2.out' });
})();

// ═══════════════════════════════════════════════════════════════
// TYPEWRITER
// ═══════════════════════════════════════════════════════════════
function runTypewriter() {
  [0,1,2].forEach(i => {
    const el = document.getElementById('tw'+i);
    gsap.set(el, { opacity: 0, y: 12 });
    gsap.to(el, { opacity: 1, y: 0, duration: 0.55 * D, delay: (0.35 + i * 0.62) * D, ease: 'power2.out' });
  });
}

// ═══════════════════════════════════════════════════════════════
// INSTALL BAR
// ═══════════════════════════════════════════════════════════════
function startInstall() {
  if(installIv){ clearInterval(installIv); installIv=null; }
  const fill=document.getElementById('install-fill');
  const pct=document.getElementById('install-pct');
  const stat=document.getElementById('install-status');
  const msgs=['Installing\u2026','Patching personality\u2026','Calibrating chaos\u2026','Optimizing vibes\u2026','Done.'];
  let p=0, mi=0;
  fill.style.transition='none'; fill.style.width='0%';
  installIv=setInterval(()=>{
    p+=Math.random()*3+.8; if(p>=100){p=100; clearInterval(installIv); installIv=null;}
    fill.style.transition='width .08s linear'; fill.style.width=p+'%';
    pct.textContent=Math.floor(p)+'%';
    const ni=Math.min(Math.floor(p/25),msgs.length-1);
    if(ni!==mi){mi=ni; stat.textContent=msgs[mi];}
    if(p===100) setTimeout(()=>goTo(4), 700);
  }, 70);
}

// ═══════════════════════════════════════════════════════════════
// STAT CARDS
// ═══════════════════════════════════════════════════════════════
let sIdx=0, sTimer=null, sPaused=false;
const SDUR=2600, SLEN=5;

function initStats() {
  sIdx=0; sPaused=false;
  document.getElementById('stat-pause').textContent='⏸ Pause';
  document.getElementById('stat-pause').classList.remove('paused');
  const bar=document.getElementById('stat-bar');
  bar.innerHTML='';
  for(let i=0;i<SLEN;i++){
    const seg=document.createElement('div'); seg.className='story-seg';
    seg.innerHTML='<div class="story-seg-fill" id="ssf'+i+'"></div>';
    bar.appendChild(seg);
  }
  showStat(0);
}

function showStat(idx) {
  document.querySelectorAll('.stat-card').forEach((c,i)=>{
    gsap.killTweensOf(c);
    if(i===idx){
      gsap.fromTo(c, { opacity:0, x: i > sIdx ? 40 : -40 }, { opacity:1, x:0, duration:0.42*D, ease:'power2.out', onStart(){ c.style.pointerEvents='auto'; } });
      // Punch the stat number
      const num = c.querySelector('.stat-num');
      if(num) gsap.fromTo(num, { scale:0.8 }, { scale:1, duration:0.5*D, ease:'back.out(1.8)', delay:0.2*D });
    } else {
      gsap.to(c, { opacity:0, x: i<idx ? -32 : 32, duration:0.32*D, ease:'power2.in', onComplete(){ c.style.pointerEvents='none'; } });
    }
  });
  for(let i=0;i<SLEN;i++){
    const f=document.getElementById('ssf'+i);
    if(!f) continue;
    gsap.killTweensOf(f);
    if(i<idx){ gsap.set(f, { width:'100%' }); }
    else if(i===idx){ gsap.set(f, { width:'0%' }); gsap.to(f, { width:'100%', duration: SDUR/1000, ease:'none' }); }
    else { gsap.set(f, { width:'0%' }); }
  }
  sIdx=idx; clearTimeout(sTimer);
  if(!sPaused) sTimer=setTimeout(()=>{ if(sIdx<SLEN-1) showStat(sIdx+1); else goTo(5); }, SDUR);
}

document.getElementById('stat-pause').addEventListener('click',()=>{
  sPaused=!sPaused;
  const b=document.getElementById('stat-pause');
  if(sPaused){ clearTimeout(sTimer); b.textContent='▶ Resume'; b.classList.add('paused'); document.querySelectorAll('.story-seg-fill').forEach(f=>f.style.transition='none'); }
  else{ b.textContent='⏸ Pause'; b.classList.remove('paused'); showStat(sIdx); }
});
document.getElementById('stat-next').addEventListener('click',()=>{ clearTimeout(sTimer); if(sIdx<SLEN-1) showStat(sIdx+1); else goTo(5); });

// ═══════════════════════════════════════════════════════════════
// MEMORIES
// ═══════════════════════════════════════════════════════════════
let mIdx=0, mTimer=null, mPaused=false;
const MDUR=7200;

function initMems() {
  mIdx=0; mPaused=false;
  document.getElementById('mem-pause').textContent='⏸ Pause';
  document.getElementById('mem-pause').classList.remove('paused');
  const dc=document.getElementById('tdots'); dc.innerHTML='';
  MEMORIES.forEach((_,i)=>{
    const d=document.createElement('div'); d.className='tdot'+(i===0?' on':'');
    d.setAttribute('role','tab'); d.setAttribute('aria-label','Memory '+(i+1));
    d.addEventListener('click',()=>showMem(i)); dc.appendChild(d);
  });
  showMem(0);
}

function showMem(idx) {
  const m=MEMORIES[idx];
  document.getElementById('mem-ctr').textContent=String(idx+1).padStart(2,'0')+' / 10';
  document.getElementById('mem-era').textContent=m.era;
  const hl=document.getElementById('mem-hl'), txt=document.getElementById('mem-txt');
  gsap.to([hl,txt], { opacity:0, y:-8, duration:0.22*D, ease:'power2.in', onComplete(){
    hl.textContent=m.hl; txt.textContent=m.txt;
    gsap.fromTo([hl,txt], { opacity:0, y:12 }, { opacity:1, y:0, duration:0.38*D, ease:'power2.out', stagger:0.08*D });
  }});
  const img=document.getElementById('mem-img');
  gsap.to(img, { opacity:0, duration:0.3*D, ease:'power2.in', onComplete(){
    img.src=m.img; img.alt=m.alt;
    img.onload=()=>gsap.to(img, { opacity:1, duration:0.5*D });
    img.onerror=()=>gsap.set(img, { opacity:0 });
  }});
  document.querySelectorAll('.tdot').forEach((d,i)=>{ d.classList.remove('on','done'); if(i<idx)d.classList.add('done'); else if(i===idx)d.classList.add('on'); });
  // Show/hide nav arrows based on position
  const prevBtn=document.getElementById('mem-prev');
  const nextBtn=document.getElementById('mem-next');
  prevBtn.classList.toggle('hidden', idx===0);
  nextBtn.classList.toggle('hidden', false);
  if(SFX_MAP[m.sfx]) play(SFX_MAP[m.sfx]);
  mIdx=idx; clearTimeout(mTimer);
  if(!mPaused) mTimer=setTimeout(()=>{ if(mIdx<MEMORIES.length-1) showMem(mIdx+1); else goTo(6); }, MDUR);
}

document.getElementById('mem-pause').addEventListener('click',()=>{
  mPaused=!mPaused;
  const b=document.getElementById('mem-pause');
  if(mPaused){ clearTimeout(mTimer); b.textContent='▶ Resume'; b.classList.add('paused'); }
  else{ b.textContent='⏸ Pause'; b.classList.remove('paused'); showMem(mIdx); }
});
document.getElementById('mem-prev').addEventListener('click',()=>{ clearTimeout(mTimer); if(mIdx>0) showMem(mIdx-1); });
document.getElementById('mem-next').addEventListener('click',()=>{ clearTimeout(mTimer); if(mIdx<MEMORIES.length-1) showMem(mIdx+1); else goTo(6); });

// ═══════════════════════════════════════════════════════════════
// MEME MONTAGE
// ═══════════════════════════════════════════════════════════════
let mmIdx=0, mmTimer=null, mmPaused=false;

function initMemes() {
  const grid=document.getElementById('meme-grid');
  grid.querySelectorAll('img').forEach(e=>e.remove());
  MEMES.forEach((m,i)=>{
    const img=document.createElement('img');
    img.src=m.src; img.alt=m.alt; img.loading='lazy';
    gsap.set(img, { opacity: i===0 ? 1 : 0 });
    grid.insertBefore(img,grid.querySelector('.meme-pause-badge'));
  });
  mmIdx=0; mmPaused=false;
  grid.classList.remove('paused');
  clearInterval(mmTimer);
  mmTimer=setInterval(()=>{
    if(mmPaused) return;
    const imgs=grid.querySelectorAll('img');
    gsap.to(imgs[mmIdx], { opacity:0, duration:0.3 });
    mmIdx=(mmIdx+1)%MEMES.length;
    gsap.to(imgs[mmIdx], { opacity:1, duration:0.3 });
  }, 430);
}

document.getElementById('meme-grid').addEventListener('click',()=>{
  mmPaused=!mmPaused;
  document.getElementById('meme-grid').classList.toggle('paused',mmPaused);
});
document.getElementById('meme-skip').addEventListener('click',()=>{ clearInterval(mmTimer); goTo(7); });

// ═══════════════════════════════════════════════════════════════
// FINAL MESSAGE
// ═══════════════════════════════════════════════════════════════
function animateFinal() {
  finalTimers.forEach(t=>clearTimeout(t)); finalTimers=[];
  [0,1,2].forEach(i=>{
    const el=document.getElementById('fl'+i);
    gsap.set(el, { opacity:0, y:16 });
    gsap.to(el, { opacity:1, y:0, duration:0.55*D, delay:(0.5+i*0.75)*D, ease:'power2.out' });
  });
  const cta=document.getElementById('final-cta');
  gsap.set(cta, { opacity:0 });
  gsap.to(cta, { opacity:1, duration:0.5*D, delay:2.8*D, ease:'power2.out', onStart(){ cta.style.pointerEvents='auto'; } });
  finalTimers.push(setTimeout(()=>{ if(ambient) ambient.vol(muted?0:.68); }, 2800));
}
document.getElementById('final-cta').addEventListener('click',()=>goTo(8));

// ═══════════════════════════════════════════════════════════════
// SHARE CARD + CONFETTI
// ═══════════════════════════════════════════════════════════════
function celebrate() {
  play(SFX.confettiPop);
  setTimeout(()=>play(SFX.risingChime),150);
  startConfetti();
  if(confStopTimer) clearTimeout(confStopTimer);
  confStopTimer=setTimeout(()=>stopConfetti(),5500);
  if(ambient) ambient.vol(muted?0:.4);
  // Bounce share card in
  const card = document.getElementById('share-card-el');
  gsap.fromTo(card, { scale:0.88, opacity:0 }, { scale:1, opacity:1, duration:0.6*D, ease:'back.out(1.5)' });
  // Stagger action buttons
  const btns = document.querySelectorAll('.share-actions button');
  gsap.fromTo(btns, { opacity:0, y:18 }, { opacity:1, y:0, duration:0.4*D, stagger:0.08*D, delay:0.3*D, ease:'power2.out' });
}

// Confetti
const confCvs=document.getElementById('confetti-canvas');
const confCtx=confCvs.getContext('2d');
let confParts=[], confRAF=null;

function startConfetti() {
  confCvs.width=window.innerWidth; confCvs.height=window.innerHeight;
  confCvs.classList.add('on');
  const colors=['#43BFB2','#2E8F86','#F3EEE5','#D9D2C7','#56D4C7','#7FE8E0'];
  confParts=Array.from({length:90},()=>({
    x:Math.random()*confCvs.width, y:Math.random()*confCvs.height-confCvs.height,
    w:Math.random()*8+4, h:Math.random()*4+2,
    color:colors[Math.floor(Math.random()*colors.length)],
    rot:Math.random()*360, vx:(Math.random()-.5)*2.2, vy:Math.random()*3+1.6, vr:(Math.random()-.5)*4
  }));
  confRAF=requestAnimationFrame(animateConf);
}

function animateConf() {
  confCtx.clearRect(0,0,confCvs.width,confCvs.height);
  confParts.forEach(p=>{
    p.x+=p.vx; p.y+=p.vy; p.rot+=p.vr;
    confCtx.save(); confCtx.translate(p.x+p.w/2,p.y+p.h/2); confCtx.rotate(p.rot*Math.PI/180);
    confCtx.fillStyle=p.color; confCtx.fillRect(-p.w/2,-p.h/2,p.w,p.h); confCtx.restore();
  });
  confParts=confParts.filter(p=>p.y<confCvs.height+20);
  if(confParts.length>0) confRAF=requestAnimationFrame(animateConf);
  else stopConfetti();
}

function stopConfetti() {
  confCvs.classList.remove('on');
  if(confRAF) cancelAnimationFrame(confRAF);
  confCtx.clearRect(0,0,confCvs.width,confCvs.height);
}

// Download card
document.getElementById('dl-btn').addEventListener('click',()=>{
  const c=document.createElement('canvas'); c.width=720; c.height=920;
  const x=c.getContext('2d');
  // BG
  const g=x.createLinearGradient(0,0,720,920); g.addColorStop(0,'#0E2A2B'); g.addColorStop(1,'#071B1C');
  x.fillStyle=g; x.fillRect(0,0,720,920);
  // Glow
  const rg=x.createRadialGradient(620,110,0,620,110,280); rg.addColorStop(0,'rgba(67,191,178,0.13)'); rg.addColorStop(1,'transparent');
  x.fillStyle=rg; x.fillRect(0,0,720,920);
  // Badge
  x.fillStyle='#43BFB2'; x.beginPath(); x.roundRect?x.roundRect(240,76,240,38,19):x.rect(240,76,240,38); x.fill();
  x.fillStyle='#071B1C'; x.font='bold 13px sans-serif'; x.textAlign='center'; x.fillText('✦  CERTIFIED LEGEND',360,101);
  // Name
  x.fillStyle='#F3EEE5'; x.font='900 92px sans-serif'; x.fillText('SAMIK',360,230);
  // Sub
  x.fillStyle='#43BFB2'; x.font='600 19px sans-serif'; x.fillText('Class of Legendary · 2026 Edition',360,266);
  // Line
  x.strokeStyle='rgba(243,238,229,0.1)'; x.lineWidth=1; x.beginPath(); x.moveTo(60,298); x.lineTo(660,298); x.stroke();
  // Stats
  const stats=[['10','ERAS UNLOCKED'],['∞','BRO TRUST ME\'S'],['99%','MAIN CHARACTER'],['0','ON-TIME ARRIVALS']];
  stats.forEach(([v,k],i)=>{
    const col=i%2, row=Math.floor(i/2), bx=58+col*348, by=328+row*178;
    x.fillStyle='rgba(243,238,229,0.04)'; x.strokeStyle='rgba(243,238,229,0.1)'; x.lineWidth=1;
    x.beginPath(); if(x.roundRect)x.roundRect(bx,by,308,148,12);else x.rect(bx,by,308,148);
    x.fill(); x.stroke();
    x.fillStyle='#43BFB2'; x.font='900 52px sans-serif'; x.textAlign='left'; x.fillText(v,bx+22,by+74);
    x.fillStyle='#D9D2C7'; x.font='500 13px sans-serif'; x.fillText(k,bx+22,by+104);
  });
  // Footer
  x.fillStyle='rgba(243,238,229,0.22)'; x.font='500 14px sans-serif'; x.textAlign='center'; x.fillText('samik: the wrap · 2026',360,870);
  const a=document.createElement('a'); a.download='samik-legend-card.png'; a.href=c.toDataURL('image/png'); a.click();
});

// Replay
document.getElementById('replay-btn').addEventListener('click',()=>{
  stopConfetti();
  // Reset typewriter + final lines for GSAP
  [0,1,2].forEach(i=>gsap.set(document.getElementById('tw'+i), { opacity:0, y:12 }));
  [0,1,2].forEach(i=>gsap.set(document.getElementById('fl'+i), { opacity:0, y:16 }));
  gsap.set(document.getElementById('final-cta'), { opacity:0, pointerEvents:'none' });
  goTo(1);
});

// ═══════════════════════════════════════════════════════════════
// SECRET ENDING — passcode gate (10032001)
// ═══════════════════════════════════════════════════════════════
const SECRET_CODE='10032001';
let pinVal='';

function updatePinDots(){
  document.querySelectorAll('.pin-dot').forEach((d,i)=>{
    d.classList.toggle('filled',i<pinVal.length);
    if(i>=pinVal.length) d.classList.remove('error');
  });
}

function submitPin(){
  if(pinVal===SECRET_CODE){
    const gate=document.getElementById('secret-gate'), content=document.getElementById('secret-content');
    gsap.to(gate, { opacity:0, duration:0.4*D, onComplete(){ gate.style.pointerEvents='none'; } });
    gsap.fromTo(content, { opacity:0, scale:0.96 }, { opacity:1, scale:1, duration:0.5*D, delay:0.3*D, ease:'power2.out', onStart(){ content.style.pointerEvents='auto'; } });
    play(SFX.risingChime);
  } else {
    pinVal=''; document.getElementById('pin-input').value='';
    document.querySelectorAll('.pin-dot').forEach(d=>{ d.classList.remove('filled'); d.classList.add('error'); });
    const dots=document.getElementById('pin-dots');
    dots.classList.remove('shaking');
    void dots.offsetWidth; // reflow to restart animation
    dots.classList.add('shaking');
    document.getElementById('gate-error').classList.add('show');
    if(SFX.recordScratch) play(SFX.recordScratch);
    setTimeout(()=>{
      dots.classList.remove('shaking');
      document.querySelectorAll('.pin-dot').forEach(d=>d.classList.remove('error'));
      document.getElementById('gate-error').classList.remove('show');
      document.getElementById('pin-input').focus();
    }, 840);
  }
}

function openSecretGate(){
  pinVal=''; document.getElementById('pin-input').value=''; updatePinDots();
  document.getElementById('gate-error').classList.remove('show');
  const gate=document.getElementById('secret-gate'), content=document.getElementById('secret-content'), overlay=document.getElementById('secret');
  gsap.set(gate, { opacity:1, pointerEvents:'auto' });
  gsap.set(content, { opacity:0, scale:1, pointerEvents:'none' });
  gsap.to(overlay, { opacity:1, duration:0.45*D, ease:'power2.out', onStart(){ overlay.style.pointerEvents='auto'; } });
  setTimeout(()=>document.getElementById('pin-input').focus(), 150);
}

const pinInput=document.getElementById('pin-input');
pinInput.addEventListener('input',function(){
  const raw=this.value.replace(/\D/g,'');
  pinVal=raw.slice(0,8); this.value=pinVal;
  updatePinDots();
  if(pinVal.length===8) setTimeout(submitPin,160);
});
pinInput.addEventListener('keydown',function(e){
  if(e.key==='Enter'&&pinVal.length>0) submitPin();
});
document.getElementById('pin-dots').addEventListener('click',()=>document.getElementById('pin-input').focus());

document.getElementById('secret-btn').addEventListener('click', openSecretGate);
function closeSecret(){
  const overlay=document.getElementById('secret');
  gsap.to(overlay, { opacity:0, duration:0.38*D, ease:'power2.in', onComplete(){ overlay.style.pointerEvents='none'; } });
}
document.getElementById('secret-close').addEventListener('click', closeSecret);
document.getElementById('secret').addEventListener('click',function(e){ if(e.target===this) closeSecret(); });

// ═══════════════════════════════════════════════════════════════
// START BUTTON
// ═══════════════════════════════════════════════════════════════
document.getElementById('start-btn').addEventListener('click',()=>{
  getCtx(); // unlock audio
  if(ambient){ try{ ambient.stop(); }catch(e){} }
  ambient=new AmbientLoop(); ambient.start();
  document.getElementById('vol-btn').classList.add('show');
  goTo(2);
});

// ═══════════════════════════════════════════════════════════════
// SHARK FINALE
// ═══════════════════════════════════════════════════════════════
function initShark() {
  const ids = ['shk-hb','shk-name','shk-line','shk-year'];
  ids.forEach(id => gsap.set(document.getElementById(id), { opacity:0, y:20 }));
  gsap.set(document.getElementById('shk-replay'), { opacity:0, pointerEvents:'none' });
  gsap.set(document.getElementById('mag-btn'),    { opacity:0, pointerEvents:'none' });

  if (ambient) ambient.vol(0);

  const v = document.getElementById('shark-video');
  v.currentTime = 0; v.muted = true; v.playbackRate = 1.5;
  v.play().catch(()=>{});

  const tl = gsap.timeline({ delay: 0.9 * D });
  tl.to('#shk-hb',   { opacity:1, y:0, duration:0.7*D, ease:'power2.out' })
    .to('#shk-name',  { opacity:1, y:0, duration:0.8*D, ease:'back.out(1.4)' }, '+=0.1')
    .to('#shk-line',  { opacity:1, y:0, duration:0.5*D }, '+=0.2')
    .to('#shk-year',  { opacity:1, y:0, duration:0.5*D }, '-=0.3')
    .to('#shk-replay',{ opacity:1, duration:0.4*D, onStart(){ document.getElementById('shk-replay').style.pointerEvents='auto'; } }, '+=0.5')
    .to('#mag-btn',   { opacity:1, duration:0.4*D, onStart(){ document.getElementById('mag-btn').style.pointerEvents='auto'; } }, '-=0.2');

  const unmuteBtn = document.getElementById('shk-unmute');
  unmuteBtn.textContent = '🔇 Unmute';
  unmuteBtn.onclick = () => { v.muted = !v.muted; unmuteBtn.textContent = v.muted ? '🔇 Unmute' : '🔊 Mute'; };
}

// Finale button on share card
document.getElementById('finale-btn').addEventListener('click', ()=>goTo(9));

// Shark replay
document.getElementById('shk-replay').addEventListener('click', ()=>{
  const v = document.getElementById('shark-video');
  if (v) { v.pause(); v.currentTime = 0; }
  // Restore ambient
  if (ambient) ambient.vol(muted ? 0 : 0.5);
  [0,1,2].forEach(i=>{ const el=document.getElementById('tw'+i); if(el)gsap.set(el, { opacity:0, y:12 }); });
  [0,1,2].forEach(i=>{ const el=document.getElementById('fl'+i); if(el)gsap.set(el, { opacity:0, y:16 }); });
  const cta=document.getElementById('final-cta'); if(cta){ gsap.set(cta, { opacity:0, pointerEvents:'none' }); }
  goTo(1);
});

// ═══════════════════════════════════════════════════════════════
// VOLUME
// ═══════════════════════════════════════════════════════════════
document.getElementById('vol-btn').addEventListener('click',()=>{
  muted=!muted;
  document.getElementById('vol-btn').textContent=muted?'🔇':'🔊';
  if(ambient) ambient.vol(muted?0:.5);
});

// ═══════════════════════════════════════════════════════════════
// RESIZE
// ═══════════════════════════════════════════════════════════════
window.addEventListener('resize',()=>{
  if(confCvs.classList.contains('on')){ confCvs.width=window.innerWidth; confCvs.height=window.innerHeight; }
});

// ═══════════════════════════════════════════════════════════════
// KEYBOARD SHORTCUTS
// ═══════════════════════════════════════════════════════════════
document.addEventListener('keydown',e=>{
  if(e.key==='ArrowRight'||e.key===' '){
    e.preventDefault();
    if(cur===4){ clearTimeout(sTimer); if(sIdx<SLEN-1)showStat(sIdx+1); else goTo(5); }
    else if(cur===5){ clearTimeout(mTimer); if(mIdx<MEMORIES.length-1)showMem(mIdx+1); else goTo(6); }
  }
  if(e.key==='Escape') closeSecret();
  if(e.key==='m'||e.key==='M'){
    muted=!muted;
    document.getElementById('vol-btn').textContent=muted?'🔇':'🔊';
    if(ambient) ambient.vol(muted?0:.5);
  }
});
