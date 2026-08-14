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
