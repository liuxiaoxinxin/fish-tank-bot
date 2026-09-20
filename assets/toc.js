/* ============================================================
   toc.js — 左侧目录导航：滚动高亮 + 移动端开合
   依赖：.side / .side-list a[href^="#"] / .side-btn
   规范见 AGENTS.md
   ============================================================ */
(function () {
  'use strict';

  var side = document.getElementById('side');
  if (!side) return;

  var links = [].slice.call(side.querySelectorAll('.side-list a[href^="#"]'));
  if (!links.length) return;

  var items = links.map(function (a) {
    return { a: a, el: document.getElementById(a.getAttribute('href').slice(1)) };
  }).filter(function (it) { return it.el; });

  var ticking = false;
  var current = null;

  function sync() {
    ticking = false;
    var probe = window.scrollY + 96;      // 视口上方 96px 处作为判定线
    var active = items[0];

    for (var i = 0; i < items.length; i++) {
      if (items[i].el.getBoundingClientRect().top + window.scrollY <= probe) {
        active = items[i];
      } else {
        break;
      }
    }
    // 滚到底部时，强制点亮最后一项
    if (window.innerHeight + window.scrollY >= document.body.scrollHeight - 4) {
      active = items[items.length - 1];
    }
    if (active === current) return;
    current = active;

    items.forEach(function (it) { it.a.classList.remove('on'); });
    active.a.classList.add('on');

    // 让高亮项保持在侧栏可视区内（只滚动侧栏，不动页面）
    var box = side.getBoundingClientRect();
    var r = active.a.getBoundingClientRect();
    if (r.top < box.top + 48) side.scrollTop -= (box.top + 48 - r.top);
    else if (r.bottom > box.bottom - 12) side.scrollTop += (r.bottom - box.bottom + 12);
  }

  function onScroll() {
    if (!ticking) { ticking = true; window.requestAnimationFrame(sync); }
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);

  // 移动端开合
  var btn = document.querySelector('.side-btn');
  if (btn) {
    btn.addEventListener('click', function (e) {
      e.stopPropagation();
      side.classList.toggle('open');
    });
    side.addEventListener('click', function (e) {
      if (e.target.closest('a')) side.classList.remove('open');
    });
    document.addEventListener('click', function (e) {
      if (!side.contains(e.target) && e.target !== btn) side.classList.remove('open');
    });
  }

  sync();
})();
