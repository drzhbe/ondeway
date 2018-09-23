document.querySelector('.actions__play').addEventListener('click', e => {
  document.querySelector('.intro').style = 'display: none;';
  // $('body').removeClass('_intro');
  // amplitude.getInstance().logEvent('PLAY_CLICKED');
});

// Intro animation finish
const stroke = document.getElementById('path0_stroke');
document.addEventListener('animationend', e => {
  document.getElementById('play-svg-blur').style = 'display: block;';
  stroke.setAttribute('fill', '#000');
});
