(() => {
  'use strict';

  let queued=false;

  const label=()=>document.documentElement.lang==='en'
    ? (document.body.classList.contains('comparison-expanded')?'Hide detailed analysis':'Show detailed analysis')
    : (document.body.classList.contains('comparison-expanded')?'收起详细分析':'查看详细分析');

  function apply(){
    queued=false;
    const content=document.getElementById('content');
    if(!content)return;

    const direct=Array.from(content.children);
    direct.forEach(el=>{
      const isSecondary=el.matches('.grid-2') || (el.matches('.card.full') && !['teacherModeCard','pepProgressionCard'].includes(el.id));
      const isEvidence=el.classList.contains('evidence-quiet') || Boolean(el.querySelector?.('.evidence-list'));
      el.classList.toggle('compare-secondary',isSecondary&&!isEvidence);
    });

    let row=document.getElementById('compareDetailToggle');
    const teacher=document.getElementById('teacherModeCard');
    const secondary=content.querySelector(':scope > .compare-secondary');
    if(!secondary){row?.remove();return;}
    if(!row){
      row=document.createElement('div');
      row.id='compareDetailToggle';
      row.className='compare-detail-toggle';
      row.innerHTML='<button type="button"></button>';
    }
    row.querySelector('button').textContent=label();
    if(teacher)teacher.insertAdjacentElement('afterend',row);
    else secondary.insertAdjacentElement('beforebegin',row);
  }

  function queue(){if(queued)return;queued=true;requestAnimationFrame(apply)}

  document.addEventListener('click',event=>{
    if(event.target.closest('#compareDetailToggle button')){
      document.body.classList.toggle('comparison-expanded');
      apply();
      return;
    }
    if(event.target.closest('[data-grade], [data-semester], [data-system], [data-scope], [data-concept], #langBtn'))queue();
  });

  const content=document.getElementById('content');
  if(content)new MutationObserver(queue).observe(content,{childList:true,subtree:true});
  queue();
})();