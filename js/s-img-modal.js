const s_m_outer = document.createElement('div');
s_m_outer.id = 'simple_modal_outer';
s_m_outer.classList.add('flex');
s_m_outer.classList.add('hide');
let s_m_inner = document.createElement('img');
s_m_inner.id = 'simple_modal_inner';
const loading_mes = document.createElement('span');
loading_mes.textContent = 'Now Loading';
loading_mes.id = 'loading_mes';
loading_mes.classList.add('hide');
s_m_outer.appendChild(loading_mes);
s_m_outer.appendChild(s_m_inner);
document.body.appendChild(s_m_outer);

s_m_outer.addEventListener('click',()=>{
  s_m_outer.classList.add('hide');
});
[...document.getElementsByClassName('s_img_modal')].forEach((v)=>{
  v.addEventListener('click',(ev=>{
    image_view(ev.target);
  }));
});

function image_view(el){
  s_m_inner.src = '';
  s_m_inner.alt = '';
  s_m_outer.classList.remove('hide');
  loading_mes.classList.remove('hide');
  let img = new Image();
  img.addEventListener('load',()=>{
    loading_mes.classList.add('hide');
    s_m_inner.src = img.src;
  });
  img.src = el.dataset.originalLink;

  img.alt = el.alt;
}
