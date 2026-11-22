/* Teacher books v20 — reuse existing A4 composer/editor/account design storage.
   Future service plan only: a printing partner, unit prices, proof responsibility,
   fulfillment and delivery must be agreed before any print-order flow is designed.
   This module creates no order, payment, delivery, database or new question engine. */
(() => {
  'use strict';
  if (window.TeacherBooksV20 || typeof teacher !== 'function' || !window.PrintComposerV14) return;
  const originalTeacher = teacher;
  const originalUpdateSheet = typeof updateSheet === 'function' ? updateSheet : null;
  const api = window.PrintComposerV14;
  const routeIsTeacher = () => ['#teacher','#studio'].includes(location.hash);
  const safe = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  function chooser() {
    const practice = studio.source === 'practice';
    const book = practice && studio.docType === 'book';
    return `<div class="creator-mode tb20-mode" aria-label="만들 자료 선택"><button type="button" data-maker-source="materials" aria-pressed="${!practice}">내신 자료</button><button type="button" data-tb20-format="print" aria-pressed="${practice && !book}">프린트 만들기</button><button type="button" data-tb20-format="book" aria-pressed="${book}">내 교재 만들기</button></div>`;
  }
  function workflow() {
    const c = api.config(), book = c.book, s = api.normalizeSettings(studio.printSettings);
    const identity = [s.academyName,s.teacherName].filter(Boolean).join(' · ');
    return `<section class="tb20-flow" aria-label="${book?'내 교재':'프린트'} 제작 순서"><div class="tb20-flow-lead"><span class="tb20-eyebrow">${book?'MY BOOK':'CLASS PRINT'}</span><h2>${book?'내 이름의 교재를 만듭니다.':'오늘 수업에 맞게, 간결하게.'}</h2><p>${book?'표지부터 문제와 해설까지, 같은 디자인으로.':'필요한 범위와 문항 수를 골라 수업 자료로.'}</p></div><nav aria-label="제작 단계"><button type="button" data-tb20-jump="config"><b>01</b><span>${book?'교재':'프린트'} 구성<small>제목 · 범위 · 문항 수</small></span><i aria-hidden="true">↓</i></button><a href="#print-design"><b>02</b><span>${book?'표지 · 학원명':'학원명 · 지면'}<small>${safe(identity || '내 디자인 선택·편집')}</small></span><i aria-hidden="true">↗</i></a><button type="button" data-tb20-jump="review"><b>03</b><span>구성 확인<small>전체 쪽수 · 인쇄 전 확인</small></span><i aria-hidden="true">↓</i></button></nav></section>`;
  }
  function review() {
    if (studio.source !== 'practice') return '';
    const c = api.config(), pages = api.sequence(c);
    const kinds = [['cover','표지'],['questions','문제'],['solutions','정답과 해설']];
    const rows = kinds.map(([type,label]) => {
      const indices = pages.flatMap((page,i) => page.type === type ? [i] : []);
      if (!indices.length) return '';
      const first = indices[0], last = indices[indices.length-1];
      const range = first === last ? `${first+1}쪽` : `${first+1}–${last+1}쪽`;
      const note = type==='cover' ? '제목과 학원명 표시 확인' : type==='questions' ? `${c.questions.length}문항 · 한 쪽 ${c.layout}문항` : '선택 문항의 정답과 해설';
      return `<button type="button" class="tb20-part" data-tb20-page="${first}" aria-label="${label} ${range} 미리보기"><span class="tb20-page-mark" aria-hidden="true">${first+1}</span><span><strong>${label}</strong><small>${note}</small></span><span class="tb20-range">${range}<i aria-hidden="true">↗</i></span></button>`;
    }).join('');
    const list = c.questions.map((q,i) => `<li><b>${String(i+1).padStart(2,'0')}</b><span>${safe(q.short || c.unit)}</span></li>`).join('');
    return `<section class="tb20-review" id="tb20-review" tabindex="-1" aria-labelledby="tb20-review-title"><div class="tb20-review-heading"><div><span class="tb20-eyebrow">BEFORE PRINT</span><h2 id="tb20-review-title">인쇄 전 구성 확인</h2><p>${safe(c.unit)} · ${c.questions.length}문항 · A4 ${pages.length}쪽</p></div><span class="tb20-total">${String(pages.length).padStart(2,'0')}<small>쪽</small></span></div><div class="tb20-parts">${rows}</div><details class="tb20-question-list"><summary>문항 구성 보기 <span>${c.questions.length}문항</span></summary><p>선택한 범위의 문항 순서입니다.</p><ol>${list}</ol></details><div class="tb20-proof"><div><strong>${c.book?'표지부터 해설까지 한 번 더.':'문제와 해설을 한 번 더.'}</strong><p>쪽을 눌러 미리보고, 인쇄 화면에서 전체 지면을 확인하세요.</p></div><button type="button" class="secondary" data-preview-paper>현재 쪽 확대</button><button type="button" class="primary" data-print>인쇄 화면 열기 <span aria-hidden="true">↗</span></button></div></section>`;
  }
  teacher = function() {
    let html = originalTeacher.apply(this,arguments);
    html = html.replace(/<div class="creator-mode">[\s\S]*?<\/div>/, '');
    html = html.replace('<section class="work-surface creator-surface">','<section class="work-surface creator-surface tb20-surface">');
    if (studio.source !== 'practice') return html.replace('<div class="creator-workspace">',chooser()+'<div class="creator-workspace">');
    html = html.replace('<div class="creator-workspace">',chooser()+workflow()+'<div class="creator-workspace" id="tb20-config" tabindex="-1">');
    html = html.replace('<section class="creator-recent">',review()+'<section class="creator-recent">');
    html = html.replace('<span>인쇄하기</span>','<span>인쇄 화면 열기</span>');
    if (studio.docType === 'book') html = html.replace('<h2>프린트 구성</h2>','<h2>교재 구성</h2>').replace('placeholder="프린트 제목"','placeholder="교재 제목"').replace('aria-label="프린트 범위"','aria-label="교재 범위"');
    return html;
  };
  function syncPanels() {
    if (!routeIsTeacher() || studio.source !== 'practice') return;
    // Only read-only summaries are replaced. The original input nodes and their
    // focus/selection stay intact; no observer or additional persistence cycle.
    const flow = document.querySelector('.tb20-surface .tb20-flow');
    const summary = document.querySelector('.tb20-surface .tb20-review');
    if (flow) flow.outerHTML = workflow();
    if (summary) summary.outerHTML = review();
    document.querySelectorAll('.tb20-surface [data-tb20-format]').forEach(button => {
      const current = studio.docType === 'book' ? 'book' : 'print';
      button.setAttribute('aria-pressed',String(button.dataset.tb20Format === current));
    });
    const formatSelect = document.querySelector('.tb20-surface [data-studio="docType"]');
    if (formatSelect) formatSelect.value = studio.docType === 'book' ? 'book' : 'print';
  }
  if (originalUpdateSheet) updateSheet = function() {
    const result = originalUpdateSheet.apply(this,arguments);
    syncPanels();
    return result;
  };
  function render(focusSelector) {
    const content = document.getElementById('content');
    if (!content || !routeIsTeacher()) return;
    content.innerHTML = teacher();
    if (focusSelector) content.querySelector(focusSelector)?.focus({preventScroll:true});
  }
  function selectFormat(format) {
    if (!routeIsTeacher() || !['print','book'].includes(format)) return false;
    const next = {...studio,source:'practice',docType:format};
    const persisted = window.DSAccountDesignApplied ? {...next,printSettings:api.normalizeSettings()} : next;
    if (!put('studio-v2',persisted)) { if(typeof toast==='function')toast('구성을 저장하지 못했습니다. 다시 시도해 주세요.');return false; }
    studio=next;creatorPage=0;
    render(`[data-tb20-format="${format}"]`);
    return true;
  }
  document.addEventListener('click', event => {
    if (!routeIsTeacher()) return;
    const button = event.target.closest('[data-tb20-format],[data-tb20-jump],[data-tb20-page]');
    if (!button) return;
    if (button.hasAttribute('data-tb20-format')) { selectFormat(button.dataset.tb20Format);return; }
    if (button.hasAttribute('data-tb20-jump')) {
      const id = button.dataset.tb20Jump === 'review' ? 'tb20-review' : 'tb20-config';
      const target = document.getElementById(id);
      target?.focus({preventScroll:true});target?.scrollIntoView({block:'start',behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});
      return;
    }
    const page=Number(button.dataset.tb20Page), pages=api.sequence(api.config());
    if(studio.source!=='practice'||!Number.isInteger(page)||page<0||page>=pages.length)return;
    creatorPage=page;render();
    const preview=document.querySelector('.tb20-surface .creator-canvas');
    preview?.setAttribute('tabindex','-1');preview?.focus({preventScroll:true});preview?.scrollIntoView({block:'start',behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});
  });
  window.TeacherBooksV20 = {selectFormat,review};
  if(routeIsTeacher())render();
})();
