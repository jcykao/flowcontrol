/* Flow Control — hero flow-field + small interactions */

/* ---------- BibTeX copy ---------- */
function copyBib(btn){
  const pre = document.getElementById('bibtex');
  navigator.clipboard.writeText(pre.innerText.trim()).then(()=>{
    const t = btn.textContent; btn.textContent = 'Copied';
    setTimeout(()=>btn.textContent = t, 1400);
  });
}

/* ---------- Hero flow field ----------
   Particles advect through a smooth vector field; a few near the
   centre bend toward a moving "goal" — a visual nod to steering a
   policy with low-dimensional inputs. Teal on warm paper. */
(function(){
  const c = document.getElementById('flowfield');
  if(!c || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const ctx = c.getContext('2d');
  let W, H, DPR, particles = [], t = 0;

  function resize(){
    DPR = Math.min(window.devicePixelRatio || 1, 2);
    W = c.clientWidth; H = c.clientHeight;
    c.width = W * DPR; c.height = H * DPR;
    ctx.setTransform(DPR,0,0,DPR,0,0);
  }

  // base flow: gentle left-to-right field with vertical undulation
  function field(x, y, time){
    const a = Math.sin(y*0.006 + time*0.0007) * 0.6
            + Math.cos(x*0.004 - time*0.0005) * 0.4;
    return a * 0.9; // angle offset around 0 (rightward)
  }

  function spawn(){
    return {
      x: Math.random()*W,
      y: Math.random()*H,
      life: 0,
      maxLife: 120 + Math.random()*180,
      speed: 0.5 + Math.random()*0.9,
      steer: Math.random() < 0.18, // a fraction get "steered"
    };
  }

  function init(){
    resize();
    const n = Math.round(Math.min(150, (W*H)/9000));
    particles = Array.from({length:n}, spawn);
  }

  function step(){
    t += 1;
    ctx.clearRect(0,0,W,H);
    // moving goal near the right third
    const goalX = W*0.62 + Math.sin(t*0.004)*W*0.05;
    const goalY = H*0.5 + Math.cos(t*0.003)*H*0.12;

    for(const p of particles){
      let ang = field(p.x, p.y, t);
      let col = 'rgba(60,60,58,0.35)';
      if(p.steer){
        // bend velocity toward goal
        const tg = Math.atan2(goalY - p.y, goalX - p.x);
        ang = ang*0.4 + (tg)*0.6 - 0; // blend field with goal heading
        col = 'oklch(0.58 0.17 252 / 0.45)';
      }
      const vx = Math.cos(ang) * p.speed;
      const vy = Math.sin(ang) * p.speed * 0.8;
      const nx = p.x + vx, ny = p.y + vy;

      ctx.strokeStyle = col;
      ctx.lineWidth = p.steer ? 1.3 : 0.8;
      ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(nx, ny); ctx.stroke();

      p.x = nx; p.y = ny; p.life++;
      if(p.life > p.maxLife || p.x > W+10 || p.x < -10 || p.y < -10 || p.y > H+10){
        Object.assign(p, spawn(), {x: Math.random()*W*0.3, y: Math.random()*H});
      }
    }
    requestAnimationFrame(step);
  }

  window.addEventListener('resize', ()=>{ resize(); });
  init(); step();
})();
