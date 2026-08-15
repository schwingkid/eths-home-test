(()=>{
  if(!document.querySelector('link[href="site-nav.css"]')){
    const css=document.createElement('link');
    css.rel='stylesheet';
    css.href='site-nav.css';
    document.head.appendChild(css);
  }

  const path=location.pathname.split('/').pop()||'index.html';
  const active=path==='parents.html'?'parents':path==='works.html'?'works':path==='students.html'?'student':path==='support.html'?'support':'home';
  const nav=document.querySelector('.nav');

  if(nav){
    nav.innerHTML=`<div class="wrap navrow">
      <div class="brandstack">
        <a class="brand" href="index.html">YTC <em>Evanston</em></a>
        <a class="corp-link" href="https://www.youthtechnologycorps.org/" target="_blank" rel="noopener">Youth Technology Corps ↗</a>
      </div>

      <button class="burger" aria-label="Open menu" aria-expanded="false">☰</button>

      <div class="navlinks">
        <a class="top-tab ${active==='home'?'on':''}" href="index.html">Home</a>

        <div class="navitem">
          <a class="top-tab ${active==='parents'?'on':''}" href="parents.html">Parents</a>
          <button class="nav-caret" aria-label="Open Parents section links" aria-expanded="false">⌄</button>
          <div class="dropdown">
            <div class="drophead">Jump to</div>
            <a class="dropitem" href="parents.html#why"><strong>Why YTC</strong><span>Why the model matters</span></a>
            <a class="dropitem" href="parents.html#experience"><strong>Student Experience</strong><span>What students learn and do</span></a>
            <a class="dropitem" href="parents.html#about"><strong>About the Club</strong><span>The ETHS model and story</span></a>
            <a class="dropitem" href="parents.html#connect"><strong>Connect</strong><span>Questions from parents</span></a>
          </div>
        </div>

        <div class="navitem">
          <a class="top-tab ${active==='works'?'on':''}" href="works.html">Evanston</a>
          <button class="nav-caret" aria-label="Open Evanston section links" aria-expanded="false">⌄</button>
          <div class="dropdown">
            <div class="drophead">Jump to</div>
            <a class="dropitem" href="works.html#local"><strong>Local Work</strong><span>Teaching and technology in Evanston</span></a>
            <a class="dropitem" href="works.html#travels"><strong>ETHS Travels</strong><span>Students beyond the clubroom</span></a>
            <a class="dropitem" href="works.html#world"><strong>World to ETHS</strong><span>University and global connections</span></a>
          </div>
        </div>

        <div class="navitem">
          <a class="top-tab ${active==='student'?'on':''}" href="students.html">Students</a>
          <button class="nav-caret" aria-label="Open Students section links" aria-expanded="false">⌄</button>
          <div class="dropdown">
            <div class="drophead">Jump to</div>
            <a class="dropitem" href="students.html#hub"><strong>Student Hub</strong><span>Private member tools — under construction</span></a>
            <a class="dropitem" href="students.html#network"><strong>Opportunities</strong><span>Learn, teach locally and connect globally</span></a>
            <a class="dropitem" href="students.html#noemi"><strong>Noemi's Story</strong><span>Teaching robotics changed her own path</span></a>
            <a class="dropitem" href="students.html#namibia"><strong>Namibia 2025</strong><span>Eight ETHS students in an educational exchange</span></a>
            <a class="dropitem" href="students.html#calendar"><strong>Calendar</strong><span>Public schedule vs. member details</span></a>
            <a class="dropitem" href="students.html#leadership"><strong>Leadership</strong><span>Learn → Teach → Mentor → Lead</span></a>
          </div>
        </div>

        <div class="navitem">
          <a class="top-tab ${active==='support'?'on':''}" href="support.html">Support</a>
          <button class="nav-caret" aria-label="Open Support section links" aria-expanded="false">⌄</button>
          <div class="dropdown">
            <div class="drophead">Jump to</div>
            <a class="dropitem coin-link" href="support.html#bytcoin"><strong>bYTCoin</strong><span>Recognition system — not cryptocurrency</span></a>
            <a class="dropitem" href="support.html#donate"><strong>Donate</strong><span>Fund student opportunities</span></a>
            <a class="dropitem" href="support.html#equipment"><strong>Equipment</strong><span>Useful technology and supplies</span></a>
            <a class="dropitem" href="support.html#elbow-grease"><strong>Elbow Grease</strong><span>Take ownership of a need</span></a>
            <a class="dropitem" href="support.html#connect"><strong>Connect the Club</strong><span>Open a door for a student</span></a>
          </div>
        </div>
      </div>
    </div>`;
  }

  /* Keep the rebuilt site inside the consolidated one-page sections rather
     than sending visitors back into the retired Old Lake page system. */
  const oldHost='old-lake-5e12.mark-lennon.workers.dev';
  const legacyRoutes={
    '/parents':'parents.html',
    '/projects':'parents.html#experience',
    '/community':'works.html#local',
    '/national':'parents.html#about',
    '/leadership':'students.html#leadership',
    '/stories':'parents.html#why',
    '/':'index.html'
  };

  document.querySelectorAll('a[href]').forEach(a=>{
    try{
      const u=new URL(a.getAttribute('href'),location.href);
      if(u.hostname===oldHost){
        const key=(u.pathname.replace(/\/+$/,'')||'/');
        a.setAttribute('href',legacyRoutes[key]||'index.html');
        a.removeAttribute('target');
      }
    }catch(_){ }
  });

  const footer=document.querySelector('footer');
  if(footer&&!footer.querySelector('.corp-footer')){
    const target=footer.querySelector('.footergrid > div:last-child')||footer.querySelector('.wrap')||footer;
    const link=document.createElement('a');
    link.className='corp-footer';
    link.href='https://www.youthtechnologycorps.org/';
    link.target='_blank';
    link.rel='noopener';
    link.textContent='Youth Technology Corps organization ↗';
    target.appendChild(document.createElement('br'));
    target.appendChild(link);
  }

  if(path==='support.html'){
    const cards=[...document.querySelectorAll('.supportgrid .card')];
    if(cards.length>=5){
      const donate=cards[0],equip=cards[1],coinCard=cards[2],elbow=cards[3],connect=cards[4];
      donate.id='donate';
      equip.id='equipment';
      elbow.id='elbow-grease';
      connect.id='connect';
      if(coinCard.parentElement){coinCard.parentElement.prepend(coinCard)}
      const nums=[...document.querySelectorAll('.supportgrid .num')];
      nums.forEach((n,i)=>n.textContent=String(i+1).padStart(2,'0'));
    }
    const coin=document.querySelector('.coin');
    if(coin) coin.id='bytcoin';
  }

  /* HOME: make the explanation immediate, then let the three story chapters
     reveal themselves vertically as the visitor moves down the page. */
  if(active==='home'){
    const hero=document.querySelector('.hero');
    const proof=document.querySelector('.proof');
    if(hero&&proof){
      proof.id='how-it-works';
      hero.insertAdjacentElement('afterend',proof);
      const proofHead=proof.querySelector('.head');
      if(proofHead&&!proofHead.querySelector('.model-intro')){
        const p=document.createElement('p');
        p.className='model-intro';
        p.textContent='The model is simple: learn a real skill, teach it forward, take responsibility, then help the next student do the same.';
        proofHead.appendChild(p);
      }
    }

    const originalStory=document.querySelector('.story-slider');
    if(originalStory){
      /* Clone the section to detach the old carousel listeners and timer. */
      const story=originalStory.cloneNode(true);
      originalStory.replaceWith(story);
      story.classList.add('home-story-vertical');
      story.removeAttribute('aria-label');
      story.setAttribute('aria-label','Three examples of how YTC leadership grows');

      const label=story.querySelector('.story-label');
      const hint=story.querySelector('.story-hint');
      if(label) label.textContent='THE MODEL IN MOTION';
      if(hint) hint.textContent='Three chapters — keep scrolling ↓';

      story.querySelector('.story-carousel-nav')?.remove();
      const shell=story.querySelector('.story-shell');
      if(shell){shell.removeAttribute('id');shell.removeAttribute('tabindex')}

      const slides=[...story.querySelectorAll('.story-slide')];
      slides.forEach((slide,i)=>{
        slide.classList.remove('is-active');
        slide.removeAttribute('aria-hidden');
        slide.classList.add('story-reveal',i%2===0?'from-left':'from-right');
      });

      const style=document.createElement('style');
      style.id='ytc-home-motion';
      style.textContent=`
        .home-story-vertical{padding:58px 0 86px;overflow:hidden}
        .home-story-vertical .story-intro{margin:0 auto 28px;width:min(1000px,86%)}
        .home-story-vertical .story-viewport{overflow:visible!important;padding:0!important}
        .home-story-vertical .story-track{display:grid!important;gap:30px!important;padding:0 4%!important;width:100%!important}
        .home-story-vertical .story-slide{flex:none!important;width:min(1000px,94%)!important;min-height:410px!important;opacity:0!important;transition:opacity .78s ease,transform .78s cubic-bezier(.2,.72,.24,1)!important;scroll-snap-align:none!important}
        .home-story-vertical .story-slide.from-left{margin-right:auto!important;transform:translateX(-90px) scale(.985)!important}
        .home-story-vertical .story-slide.from-right{margin-left:auto!important;transform:translateX(90px) scale(.985)!important}
        .home-story-vertical .story-slide.from-right .story-copy{order:2}
        .home-story-vertical .story-slide.from-right .story-visual,
        .home-story-vertical .story-slide.from-right .camel-slot{order:1}
        .home-story-vertical .story-slide.revealed{opacity:1!important;transform:translateX(0) scale(1)!important}
        .proof#how-it-works{padding-top:76px}
        .proof#how-it-works .model-intro{color:var(--muted);font-size:1.03rem;max-width:720px;margin:12px 0 0}
        @media(max-width:760px){
          .home-story-vertical .story-intro{width:calc(100% - 32px);align-items:flex-start;flex-direction:column;gap:5px}
          .home-story-vertical .story-track{padding:0 16px!important;gap:22px!important}
          .home-story-vertical .story-slide{width:100%!important;grid-template-columns:1fr!important;min-height:0!important}
          .home-story-vertical .story-slide.from-left,.home-story-vertical .story-slide.from-right{margin:0!important;transform:translateX(0) translateY(34px) scale(.99)!important}
          .home-story-vertical .story-slide.from-right .story-copy{order:1}
          .home-story-vertical .story-slide.from-right .story-visual,.home-story-vertical .story-slide.from-right .camel-slot{order:2}
          .home-story-vertical .story-slide.revealed{transform:translateY(0) scale(1)!important}
        }
        @media(prefers-reduced-motion:reduce){
          .home-story-vertical .story-slide{opacity:1!important;transform:none!important;transition:none!important}
        }
      `;
      document.head.appendChild(style);

      const reduced=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if(reduced||!('IntersectionObserver' in window)){
        slides.forEach(slide=>slide.classList.add('revealed'));
      }else{
        const observer=new IntersectionObserver(entries=>{
          entries.forEach(entry=>{
            if(entry.isIntersecting){
              entry.target.classList.add('revealed');
              observer.unobserve(entry.target);
            }
          });
        },{threshold:.18,rootMargin:'0px 0px -8% 0px'});
        slides.forEach(slide=>observer.observe(slide));
      }
    }
  }

  const closeMenus=()=>{
    document.querySelectorAll('.navitem.open').forEach(item=>{
      item.classList.remove('open');
      item.querySelector('.nav-caret')?.setAttribute('aria-expanded','false');
    });
    const siteLinks=document.querySelector('.navlinks');
    const siteBurger=document.querySelector('.burger');
    if(siteLinks?.classList.contains('open')){
      siteLinks.classList.remove('open');
      siteBurger?.setAttribute('aria-expanded','false');
    }
  };

  const siteBurger=document.querySelector('.burger');
  const siteLinks=document.querySelector('.navlinks');
  if(siteBurger&&siteLinks){
    siteBurger.addEventListener('click',()=>{
      const open=siteLinks.classList.toggle('open');
      siteBurger.setAttribute('aria-expanded',String(open));
    });
  }

  document.querySelectorAll('.nav-caret').forEach(btn=>{
    btn.addEventListener('click',e=>{
      e.preventDefault();
      e.stopPropagation();
      const item=btn.closest('.navitem');
      const wasOpen=item.classList.contains('open');
      document.querySelectorAll('.navitem.open').forEach(other=>{
        if(other!==item){
          other.classList.remove('open');
          other.querySelector('.nav-caret')?.setAttribute('aria-expanded','false');
        }
      });
      item.classList.toggle('open',!wasOpen);
      btn.setAttribute('aria-expanded',String(!wasOpen));
    });
  });

  /* On the page you are already viewing, dropdown links behave as true
     bookmarks: scroll to the section without reloading the page. */
  document.querySelectorAll('.dropitem').forEach(link=>{
    link.addEventListener('click',e=>{
      const href=link.getAttribute('href')||'';
      const [targetFile,targetHash]=href.split('#');
      const samePage=(targetFile||path)===path;
      if(samePage&&targetHash){
        const target=document.getElementById(targetHash);
        if(target){
          e.preventDefault();
          closeMenus();
          history.replaceState(null,'',`#${targetHash}`);
          target.scrollIntoView({behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth',block:'start'});
        }
      }
    });
  });

  document.addEventListener('click',e=>{
    if(!e.target.closest('.navitem')) closeMenus();
  });

  document.addEventListener('keydown',e=>{
    if(e.key==='Escape') closeMenus();
  });
})();
