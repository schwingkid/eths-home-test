(()=>{
  if(!document.querySelector('link[href="site-nav.css"]')){
    const css=document.createElement('link'); css.rel='stylesheet'; css.href='site-nav.css'; document.head.appendChild(css);
  }

  const path=location.pathname.split('/').pop()||'index.html';
  const active=path==='parents.html'?'parents':path==='works.html'?'works':path==='students.html'?'student':path==='support.html'?'support':'home';
  const nav=document.querySelector('.nav');

  if(nav){
    nav.innerHTML=`<div class="wrap navrow">
      <div class="brandstack"><a class="brand" href="index.html">YTC <em>Evanston</em></a><a class="corp-link" href="https://www.youthtechnologycorps.org/" target="_blank" rel="noopener">Youth Technology Corps ↗</a></div>
      <button class="burger" aria-label="Open menu" aria-expanded="false">☰</button>
      <div class="navlinks">
        <a class="top-tab ${active==='home'?'on':''}" href="index.html">Home</a>
        <div class="navitem"><a class="top-tab ${active==='parents'?'on':''}" href="parents.html">Parents</a><button class="nav-caret" aria-label="Open Parents section links" aria-expanded="false">⌄</button><div class="dropdown"><div class="drophead">Jump to</div><a class="dropitem" href="parents.html#why"><strong>Why YTC</strong><span>Why the model matters</span></a><a class="dropitem" href="parents.html#experience"><strong>Student Experience</strong><span>What students learn and do</span></a><a class="dropitem" href="parents.html#about"><strong>About the Club</strong><span>The ETHS model and story</span></a><a class="dropitem" href="parents.html#connect"><strong>Connect</strong><span>Questions from parents</span></a></div></div>
        <div class="navitem"><a class="top-tab ${active==='works'?'on':''}" href="works.html">Evanston</a><button class="nav-caret" aria-label="Open Evanston section links" aria-expanded="false">⌄</button><div class="dropdown"><div class="drophead">Jump to</div><a class="dropitem" href="works.html#local"><strong>Local Work</strong><span>Teaching and technology in Evanston</span></a><a class="dropitem" href="works.html#map"><strong>Evanston Map</strong><span>Where student work has reached</span></a><a class="dropitem" href="works.html#travels"><strong>ETHS Travels</strong><span>Students beyond the clubroom</span></a><a class="dropitem" href="works.html#world"><strong>World to ETHS</strong><span>University and global connections</span></a></div></div>
        <div class="navitem"><a class="top-tab ${active==='student'?'on':''}" href="students.html">Students</a><button class="nav-caret" aria-label="Open Students section links" aria-expanded="false">⌄</button><div class="dropdown"><div class="drophead">Jump to</div><a class="dropitem" href="students.html#hub"><strong>Student Hub</strong><span>Private member tools — under construction</span></a><a class="dropitem" href="students.html#how-it-works"><strong>How YTC Works</strong><span>Learn → Teach → Lead → Repeat</span></a><a class="dropitem" href="students.html#network"><strong>Opportunities</strong><span>Learn, teach locally and connect globally</span></a><a class="dropitem" href="students.html#noemi"><strong>Noemi's Story</strong><span>Teaching robotics changed her own path</span></a><a class="dropitem" href="students.html#namibia"><strong>Namibia 2025</strong><span>Eight ETHS students in an educational exchange</span></a><a class="dropitem" href="students.html#calendar"><strong>Calendar</strong><span>Public schedule vs. member details</span></a><a class="dropitem" href="students.html#leadership"><strong>Leadership</strong><span>Learn → Teach → Mentor → Lead</span></a></div></div>
        <div class="navitem"><a class="top-tab ${active==='support'?'on':''}" href="support.html">Support</a><button class="nav-caret" aria-label="Open Support section links" aria-expanded="false">⌄</button><div class="dropdown"><div class="drophead">Jump to</div><a class="dropitem coin-link" href="support.html#bytcoin"><strong>bYTCoin</strong><span>Recognition system — not cryptocurrency</span></a><a class="dropitem" href="support.html#donate"><strong>Donate</strong><span>Fund student opportunities</span></a><a class="dropitem" href="support.html#equipment"><strong>Equipment</strong><span>Useful technology and supplies</span></a><a class="dropitem" href="support.html#elbow-grease"><strong>Elbow Grease</strong><span>Take ownership of a need</span></a><a class="dropitem" href="support.html#connect"><strong>Connect the Club</strong><span>Open a door for a student</span></a></div></div>
      </div>
    </div>`;
  }

  const oldHost='old-lake-5e12.mark-lennon.workers.dev';
  const legacyRoutes={'/parents':'parents.html','/projects':'parents.html#experience','/community':'works.html#local','/national':'parents.html#about','/leadership':'students.html#leadership','/stories':'parents.html#why','/':'index.html'};
  document.querySelectorAll('a[href]').forEach(a=>{try{const u=new URL(a.getAttribute('href'),location.href);if(u.hostname===oldHost){const key=(u.pathname.replace(/\/+$/,'')||'/');a.setAttribute('href',legacyRoutes[key]||'index.html');a.removeAttribute('target')}}catch(_){}});

  const footer=document.querySelector('footer');
  if(footer&&!footer.querySelector('.corp-footer')){const target=footer.querySelector('.footergrid > div:last-child')||footer.querySelector('.wrap')||footer;const link=document.createElement('a');link.className='corp-footer';link.href='https://www.youthtechnologycorps.org/';link.target='_blank';link.rel='noopener';link.textContent='Youth Technology Corps organization ↗';target.appendChild(document.createElement('br'));target.appendChild(link)}

  if(path==='support.html'){
    const cards=[...document.querySelectorAll('.supportgrid .card')];
    if(cards.length>=5){const donate=cards[0],equip=cards[1],coinCard=cards[2],elbow=cards[3],connect=cards[4];donate.id='donate';equip.id='equipment';elbow.id='elbow-grease';connect.id='connect';if(coinCard.parentElement)coinCard.parentElement.prepend(coinCard);[...document.querySelectorAll('.supportgrid .num')].forEach((n,i)=>n.textContent=String(i+1).padStart(2,'0'))}
    const coin=document.querySelector('.coin'); if(coin) coin.id='bytcoin';
  }

  function howItWorksMarkup(){return `<section class="ytc-how" id="how-it-works"><div class="wrap"><div class="ytc-how-head"><p class="ytc-how-kicker">HOW YTC WORKS</p><h2>Knowledge changes hands.</h2><p>The model is simple: learn a real skill, teach it forward, take responsibility, then help the next student do the same.</p></div><div class="ytc-how-grid"><article><span>01</span><h3>Learn something real.</h3><p>Computers, fabrication, robotics, coding and troubleshooting give students something useful to master.</p></article><article><span>02</span><h3>Teach it forward.</h3><p>Learning becomes more serious when another person is depending on you to explain what you know.</p></article><article><span>03</span><h3>Become useful to someone else.</h3><p>Technical confidence becomes leadership when students use what they know in service to another person.</p></article></div><div class="ytc-how-rail"><div><b>Learn</b><small>pick up the skill</small></div><i></i><div><b>Teach</b><small>help the next person</small></div><i></i><div><b>Lead</b><small>own the responsibility</small></div><i></i><div><b>Repeat</b><small>train your replacement</small></div></div></div></section>`}

  const commonStyle=document.createElement('style');
  commonStyle.textContent=`
    .ytc-how{padding:78px 0;background:#EDF1F5;border-top:1px solid #dce5ea;border-bottom:1px solid #dce5ea}
    .ytc-how-head{max-width:800px;margin-bottom:30px}.ytc-how-kicker{margin:0 0 10px;color:#C95415;font-size:.7rem;font-weight:800;letter-spacing:.16em;text-transform:uppercase}.ytc-how h2{font-family:Fraunces,Georgia,serif;color:#1B3A5C;font-size:clamp(2.2rem,4.5vw,3.5rem);line-height:1.05;margin:0 0 12px}.ytc-how-head>p:last-child{color:#65727F;max-width:720px}.ytc-how-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:18px}.ytc-how-grid article{background:#fffdfa;border:1px solid #E7E0D3;border-radius:18px;padding:28px}.ytc-how-grid article>span{font-family:Fraunces,Georgia,serif;color:#E9B44C;font-size:1.55rem;font-weight:700}.ytc-how-grid h3{font-family:Fraunces,Georgia,serif;color:#1B3A5C;font-size:1.45rem;line-height:1.12;margin:8px 0}.ytc-how-grid p{color:#65727F;font-size:.9rem;margin:0}.ytc-how-rail{display:grid;grid-template-columns:auto 1fr auto 1fr auto 1fr auto;gap:12px;align-items:center;margin-top:36px;padding:22px 8px;border-top:1px solid #E7E0D3;border-bottom:1px solid #E7E0D3}.ytc-how-rail div{text-align:center;min-width:110px}.ytc-how-rail b{display:block;font-family:Fraunces,Georgia,serif;color:#1B3A5C;font-size:1.08rem}.ytc-how-rail small{display:block;color:#65727F;font-size:.7rem}.ytc-how-rail i{height:2px;background:linear-gradient(90deg,#E9B44C,#E86A2B)}
    @media(max-width:760px){.ytc-how-grid{grid-template-columns:1fr}.ytc-how-rail{grid-template-columns:1fr}.ytc-how-rail i{width:2px;height:18px;margin:auto}}
  `;
  document.head.appendChild(commonStyle);

  if(active==='home'){
    const hero=document.querySelector('.hero');
    const proof=document.querySelector('.proof');
    if(proof){proof.id='how-it-works';if(hero)hero.insertAdjacentElement('afterend',proof)}

    const original=document.querySelector('.story-slider');
    if(original){
      const story=original.cloneNode(true);
      original.replaceWith(story);
      story.classList.add('ytc-story-sequence');
      story.setAttribute('aria-label','Three examples of the YTC model in motion');

      story.querySelector('.story-carousel-nav')?.remove();
      const hint=story.querySelector('.story-hint');
      const label=story.querySelector('.story-label');
      if(label) label.textContent='THE MODEL IN MOTION';
      if(hint) hint.textContent='Scroll to reveal each chapter';

      const shell=story.querySelector('.story-shell');
      const viewport=story.querySelector('.story-viewport');
      if(shell){shell.removeAttribute('id');shell.removeAttribute('tabindex')}
      if(viewport) viewport.removeAttribute('tabindex');

      const slides=[...story.querySelectorAll('.story-slide')];
      slides.forEach((slide,i)=>{
        slide.classList.remove('is-active');
        slide.removeAttribute('aria-hidden');
        slide.classList.add('ytc-sequence-card',i%2===0?'enter-right':'enter-left');
      });

      const motionStyle=document.createElement('style');
      motionStyle.id='ytc-story-sequence-style';
      motionStyle.textContent=`
        .ytc-story-sequence{background:#fff;padding:76px 0 96px;overflow:hidden;border-top:1px solid #eee8df}
        .ytc-story-sequence .story-intro{width:min(1100px,calc(100% - 48px));margin:0 auto 34px;display:flex;justify-content:space-between;align-items:end;gap:24px}
        .ytc-story-sequence .story-label{color:#C95415}
        .ytc-story-sequence .story-hint{color:#65727F}
        .ytc-story-sequence .story-viewport{overflow:visible!important;padding:0!important;pointer-events:none!important}
        .ytc-story-sequence .story-track{display:flex!important;flex-direction:column!important;gap:42px!important;width:min(1240px,100%)!important;margin:0 auto!important;padding:0 24px!important}
        .ytc-story-sequence .ytc-sequence-card{flex:none!important;width:75%!important;min-height:410px!important;scroll-snap-align:none!important;opacity:0!important;box-shadow:0 18px 48px rgba(18,42,68,.13)!important;transition:transform .95s cubic-bezier(.18,.76,.24,1),opacity .65s ease!important;will-change:transform,opacity}
        .ytc-story-sequence .ytc-sequence-card.enter-right{align-self:flex-start!important;transform:translateX(118vw) scale(.985)!important}
        .ytc-story-sequence .ytc-sequence-card.enter-left{align-self:flex-end!important;transform:translateX(-118vw) scale(.985)!important}
        .ytc-story-sequence .ytc-sequence-card.sequence-visible{opacity:1!important;transform:translateX(0) scale(1)!important}
        .ytc-story-sequence .story-copy{padding:42px 46px}
        .ytc-story-sequence .story-copy h2{font-size:clamp(2rem,3.6vw,3.25rem)}
        .ytc-story-sequence .story-visual,.ytc-story-sequence .camel-slot{min-height:410px}
        @media(max-width:900px){.ytc-story-sequence .ytc-sequence-card{width:86%!important}}
        @media(max-width:760px){
          .ytc-story-sequence{padding:58px 0 72px}
          .ytc-story-sequence .story-intro{width:calc(100% - 32px);align-items:flex-start;flex-direction:column;gap:6px;margin-bottom:24px}
          .ytc-story-sequence .story-track{gap:28px!important;padding:0 16px!important}
          .ytc-story-sequence .ytc-sequence-card{width:94%!important;grid-template-columns:1fr!important;min-height:0!important}
          .ytc-story-sequence .ytc-sequence-card.enter-right{transform:translateX(105vw) scale(.99)!important}
          .ytc-story-sequence .ytc-sequence-card.enter-left{transform:translateX(-105vw) scale(.99)!important}
          .ytc-story-sequence .ytc-sequence-card.sequence-visible{transform:translateX(0) scale(1)!important}
          .ytc-story-sequence .story-copy{padding:36px 30px}
          .ytc-story-sequence .story-visual,.ytc-story-sequence .camel-slot{min-height:330px}
        }
        @media(prefers-reduced-motion:reduce){.ytc-story-sequence .ytc-sequence-card{opacity:1!important;transform:none!important;transition:none!important}}
      `;
      document.head.appendChild(motionStyle);

      const reduced=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if(reduced||!('IntersectionObserver' in window)){
        slides.forEach(s=>s.classList.add('sequence-visible'));
      }else{
        const cardObserver=new IntersectionObserver(entries=>{
          entries.forEach(entry=>{
            if(entry.isIntersecting){
              entry.target.classList.add('sequence-visible');
              cardObserver.unobserve(entry.target);
            }
          });
        },{threshold:.28,rootMargin:'0px 0px -10% 0px'});
        slides.forEach(slide=>cardObserver.observe(slide));
      }
    }
  }

  if(active==='student'){
    const hub=document.getElementById('hub')||document.querySelector('header.hero')?.nextElementSibling;
    if(hub&&!document.getElementById('how-it-works'))hub.insertAdjacentHTML('afterend',howItWorksMarkup());
  }

  if(active==='works'){
    const local=document.getElementById('local');
    if(local&&!document.getElementById('map')){
      const grid=local.querySelector('.workgrid');
      if(grid){const map=document.createElement('div');map.id='map';map.style.cssText='margin:38px 0 8px;padding:34px;border-radius:22px;background:#122A44;color:white';map.innerHTML='<p style="margin:0 0 8px;color:#E9B44C;font-size:.7rem;font-weight:800;letter-spacing:.15em;text-transform:uppercase">YTC IN EVANSTON</p><h3 style="font-family:Fraunces,Georgia,serif;font-size:2rem;margin:0 0 8px">Built at ETHS. Shared across Evanston.</h3><p style="margin:0;color:#d4e0e8">The interactive map is being connected here so visitors can explore where students have taught, repaired, donated, mentored and built relationships.</p>';grid.insertAdjacentElement('afterend',map)}}
  }

  const closeMenus=()=>{document.querySelectorAll('.navitem.open').forEach(item=>{item.classList.remove('open');item.querySelector('.nav-caret')?.setAttribute('aria-expanded','false')});const siteLinks=document.querySelector('.navlinks');const siteBurger=document.querySelector('.burger');if(siteLinks?.classList.contains('open')){siteLinks.classList.remove('open');siteBurger?.setAttribute('aria-expanded','false')}};
  const siteBurger=document.querySelector('.burger'),siteLinks=document.querySelector('.navlinks');if(siteBurger&&siteLinks){siteBurger.addEventListener('click',()=>{const open=siteLinks.classList.toggle('open');siteBurger.setAttribute('aria-expanded',String(open))})}
  document.querySelectorAll('.nav-caret').forEach(btn=>btn.addEventListener('click',e=>{e.preventDefault();e.stopPropagation();const item=btn.closest('.navitem'),wasOpen=item.classList.contains('open');document.querySelectorAll('.navitem.open').forEach(other=>{if(other!==item){other.classList.remove('open');other.querySelector('.nav-caret')?.setAttribute('aria-expanded','false')}});item.classList.toggle('open',!wasOpen);btn.setAttribute('aria-expanded',String(!wasOpen))}));
  document.querySelectorAll('.dropitem').forEach(link=>link.addEventListener('click',e=>{const href=link.getAttribute('href')||'',parts=href.split('#'),targetFile=parts[0],targetHash=parts[1],samePage=(targetFile||path)===path;if(samePage&&targetHash){const target=document.getElementById(targetHash);if(target){e.preventDefault();closeMenus();history.replaceState(null,'',`#${targetHash}`);target.scrollIntoView({behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth',block:'start'})}}}));
  document.addEventListener('click',e=>{if(!e.target.closest('.navitem'))closeMenus()});document.addEventListener('keydown',e=>{if(e.key==='Escape')closeMenus()});
})();