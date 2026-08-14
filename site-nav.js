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
        <a class="home-tab ${active==='home'?'on':''}" href="index.html">HOME</a>

        <div class="navitem">
          <a class="tablink ${active==='parents'?'on':''}" href="parents.html"><span class="tabtop">Parents</span><span class="tabbottom">Overview</span></a>
          <button class="nav-caret" aria-label="Open Parents menu" aria-expanded="false">⌄</button>
          <div class="dropdown">
            <a class="dropitem" href="parents.html#why"><strong>Why YTC</strong><span>Why the model matters for students</span></a>
            <a class="dropitem" href="parents.html#experience"><strong>Experience</strong><span>What students learn, build and do</span></a>
            <a class="dropitem" href="parents.html#about"><strong>About</strong><span>The story and model behind the club</span></a>
            <a class="dropitem" href="parents.html#connect"><strong>Connect with us</strong><span>Ask about the ETHS club</span></a>
          </div>
        </div>

        <div class="navitem">
          <a class="tablink ${active==='works'?'on':''}" href="works.html"><span class="tabtop">Evanston</span><span class="tabbottom">YTC Works</span></a>
          <button class="nav-caret" aria-label="Open YTC Works menu" aria-expanded="false">⌄</button>
          <div class="dropdown">
            <a class="dropitem" href="works.html#local"><strong>Local Works</strong><span>Teaching and technology in Evanston</span></a>
            <a class="dropitem" href="works.html#travels"><strong>ETHS Travels</strong><span>Experiences that take students beyond the clubroom</span></a>
            <a class="dropitem" href="works.html#world"><strong>Bringing the World to ETHS</strong><span>University and international connections</span></a>
          </div>
        </div>

        <div class="navitem">
          <a class="tablink ${active==='student'?'on':''}" href="students.html"><span class="tabtop">Student</span><span class="tabbottom">Portal</span></a>
          <button class="nav-caret" aria-label="Open Student Portal menu" aria-expanded="false">⌄</button>
          <div class="dropdown">
            <a class="dropitem" href="students.html#hub"><strong>The Hub</strong><span>The student-facing front door</span></a>
            <a class="dropitem" href="students.html#calendar"><strong>Calendar</strong><span>Meetings, sessions and what is next</span></a>
            <a class="dropitem" href="students.html#network"><strong>Network</strong><span>Learning, teaching and leadership opportunities</span></a>
          </div>
        </div>

        <div class="navitem">
          <a class="tablink ${active==='support'?'on':''}" href="support.html"><span class="tabtop">Ways to</span><span class="tabbottom">Support</span></a>
          <button class="nav-caret" aria-label="Open Support menu" aria-expanded="false">⌄</button>
          <div class="dropdown">
            <a class="dropitem" href="support.html#bytcoin"><strong>bYTCoin</strong><span>Club experiences and recognition</span></a>
            <a class="dropitem" href="support.html#donate"><strong>Donate</strong><span>Keep the ETHS pipeline moving</span></a>
            <a class="dropitem" href="support.html#elbow-grease"><strong>Elbow Grease</strong><span>Take ownership of a defined need</span></a>
            <a class="dropitem" href="support.html#connect"><strong>Connect the Club</strong><span>Open a door for an ETHS student</span></a>
          </div>
        </div>
      </div>
    </div>`;
  }

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

  document.addEventListener('click',e=>{
    if(!e.target.closest('.navitem')){
      document.querySelectorAll('.navitem.open').forEach(item=>{
        item.classList.remove('open');
        item.querySelector('.nav-caret')?.setAttribute('aria-expanded','false');
      });
    }
  });

  document.addEventListener('keydown',e=>{
    if(e.key==='Escape'){
      document.querySelectorAll('.navitem.open').forEach(item=>{
        item.classList.remove('open');
        item.querySelector('.nav-caret')?.setAttribute('aria-expanded','false');
      });
    }
  });
})();
