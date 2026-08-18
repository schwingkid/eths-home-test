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
        <a class="brand" href="index.html">YTC <em>@ ETHS</em></a>
        <a class="corp-link" href="https://www.youthtechnologycorps.org/" target="_blank" rel="noopener">Youth Technology Corps ↗</a>
      </div>

      <button class="burger" aria-label="Open menu" aria-expanded="false">☰</button>

      <div class="navlinks">
        <a class="home-tab ${active==='home'?'on':''}" href="index.html">HOME</a>

        <div class="navitem">
          <a class="tablink ${active==='works'?'on':''}" href="works.html"><span class="tabtop">YTC</span><span class="tabbottom">Works</span></a>
          <button class="nav-caret" aria-label="Open YTC Works section links" aria-expanded="false">⌄</button>
          <div class="dropdown">
            <a class="dropitem" href="works.html#local"><strong>Evanston</strong><span>Where the work begins</span></a>
            <a class="dropitem" href="works.html#evanston-map"><strong>Community Map</strong><span>Places served across the city</span></a>
            <a class="dropitem" href="works.html#kuumba-story"><strong>Camp Kuumba</strong><span>The computer handoff</span></a>
            <a class="dropitem" href="works.html#new-orleans"><strong>New Orleans</strong><span>Students carry the model farther</span></a>
            <a class="dropitem" href="works.html#beyond"><strong>Across Borders</strong><span>Computers and relationships travel</span></a>
            <a class="dropitem" href="works.html#namibia"><strong>Namibia</strong><span>Students follow the work</span></a>
          </div>
        </div>

        <div class="navitem">
          <a class="tablink ${active==='parents'?'on':''}" href="parents.html"><span class="tabtop">Parents</span><span class="tabbottom">Overview</span></a>
          <button class="nav-caret" aria-label="Open Parents section links" aria-expanded="false">⌄</button>
          <div class="dropdown">
            <a class="dropitem" href="parents.html#why"><strong>Why YTC</strong><span>Why the model matters for students</span></a>
            <a class="dropitem" href="parents.html#experience"><strong>Student Experience</strong><span>What students learn, build and do</span></a>
            <a class="dropitem" href="parents.html#practical"><strong>Practical Details</strong><span>Time, cost and club expectations</span></a>
            <a class="dropitem" href="parents.html#connect"><strong>Connect</strong><span>Questions from parents</span></a>
          </div>
        </div>

        <a class="tablink ${active==='student'?'on':''}" href="students.html"><span class="tabtop">Students</span><span class="tabbottom">Experience</span></a>

        <div class="navitem">
          <a class="tablink ${active==='support'?'on':''}" href="support.html"><span class="tabtop">Ways to</span><span class="tabbottom">Support</span></a>
          <button class="nav-caret" aria-label="Open Support section links" aria-expanded="false">⌄</button>
          <div class="dropdown">
            <a class="dropitem" href="support.html#donate"><strong>Donate</strong><span>Fund student opportunities</span></a>
            <a class="dropitem" href="support.html#equipment"><strong>Equipment</strong><span>Useful technology and supplies</span></a>
            <a class="dropitem" href="support.html#infrastructure"><strong>YTC Backbone</strong><span>Keep the organization behind the club working</span></a>
            <a class="dropitem coin-link" href="support.html#bytcoin"><strong>Portal + bYTCoin</strong><span>Fund the ETHS-designed model before launch</span></a>
            <a class="dropitem" href="support.html#community-team"><strong>Community Team</strong><span>Bring marketing, design, fundraising or another useful skill</span></a>
            <a class="dropitem" href="support.html#connect"><strong>Partnerships</strong><span>Open a door for a student or the Learning Center</span></a>
          </div>
        </div>
      </div>
    </div>`

  }

  const oldHost='old-lake-5e12.mark-lennon.workers.dev';
  const legacyRoutes={
    '/parents':'parents.html',
    '/projects':'parents.html#experience',
    '/community':'works.html#local',
    '/national':'index.html',
    '/leadership':'students.html',
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
    if(cards.length>=6){
      const donate=cards[0],equip=cards[1],infrastructure=cards[2],portal=cards[3],skills=cards[4],connect=cards[5];
      donate.id='donate';
      equip.id='equipment';
      infrastructure.id='infrastructure';
      portal.id='portal';
      skills.id='skills';
      connect.id='connect';
      const nums=[...document.querySelectorAll('.supportgrid .num')];
      nums.forEach((n,i)=>n.textContent=String(i+1).padStart(2,'0'));
    }
    const coin=document.querySelector('.coin');
    if(coin) coin.id='bytcoin';
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