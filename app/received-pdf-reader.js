/* Reopen the verified files of one member's receipt. Store only the page marker. */
(() => {
  'use strict';
  if (window.DSReceivedPdf) return;
  const keyPrefix = 'ds-received-pdf-page-v1:';
  const validId = value => typeof value === 'string' && value.length > 0 && value.length <= 600 && !/[\u0000-\u001f]/.test(value);
  const session = () => window.DSAuth?.get?.() || '';
  let active, library;

  function bookmark(receiptId) {
    if (!session() || !validId(receiptId)) return null;
    try {
      const saved = JSON.parse(localStorage.getItem(keyPrefix + receiptId));
      return validId(saved?.fileId) && Number.isSafeInteger(saved.page) && saved.page > 0 ? saved : null;
    } catch { return null; }
  }

  function close() {
    const reader = active;
    if (!reader) return;
    active = null;
    reader.abort?.abort();
    reader.paint?.cancel();
    reader.task?.destroy().catch(() => {});
    reader.dialog.close();
    reader.dialog.remove();
  }

  function current(reader) {
    return active === reader && reader.token === session();
  }

  function pdfLibrary() {
    if (!library) library = import('/assets/pdfjs/pdf.min.mjs').then(pdf => {
      pdf.GlobalWorkerOptions.workerSrc = '/assets/pdfjs/pdf.worker.min.mjs';
      return pdf;
    }).catch(error => { library = null; throw error; });
    return library;
  }

  async function renderPage(reader, requested) {
    const generation = ++reader.generation;
    reader.paint?.cancel();
    const {doc, canvas, section, status, pageInput, previous, next, total} = reader;
    const pageNumber = Math.min(doc.numPages, Math.max(1, requested));
    const stillHere = () => current(reader) && generation === reader.generation;
    reader.page = pageNumber;
    pageInput.disabled = false;
    pageInput.max = String(doc.numPages);
    pageInput.value = String(pageNumber);
    previous.disabled = pageNumber === 1;
    next.disabled = pageNumber === doc.numPages;
    total.textContent = '/ ' + doc.numPages + '쪽';
    status.textContent = '지면을 여는 중…';
    canvas.hidden = true;
    try {
      const page = await doc.getPage(pageNumber);
      if (!stillHere()) return;
      const base = page.getViewport({scale:1});
      const width = Math.min(section.clientWidth || 820, 1200);
      const pixelScale = Math.min(2, window.devicePixelRatio || 1);
      const viewport = page.getViewport({scale:width * pixelScale / base.width});
      canvas.width = Math.ceil(viewport.width);
      canvas.height = Math.ceil(viewport.height);
      canvas.setAttribute('aria-label', reader.file.title + ' ' + pageNumber + '쪽');
      reader.paint = page.render({canvasContext:canvas.getContext('2d'), viewport});
      await reader.paint.promise;
      if (!stillHere()) return;
      canvas.hidden = false;
      section.scrollTop = 0;
      status.textContent = '';
      try {
        const first = !bookmark(reader.receiptId);
        localStorage.setItem(keyPrefix + reader.receiptId, JSON.stringify({fileId:reader.file.fileId, page:pageNumber}));
        if (first) window.dispatchEvent(new Event('ds-received-pdf-progress'));
      } catch { status.textContent = '이 브라우저에서는 마지막 쪽을 저장할 수 없어요.'; }
    } catch {
      if (stillHere()) status.textContent = '이 쪽을 표시할 수 없어요. 원본 PDF를 열어 주세요.';
    }
  }

  async function loadFile(reader, file, pageNumber) {
    const generation = ++reader.generation;
    reader.abort?.abort();
    reader.paint?.cancel();
    reader.task?.destroy().catch(() => {});
    reader.task = null;
    reader.doc = null;
    reader.file = file;
    reader.canvas.hidden = true;
    reader.total.textContent = '';
    reader.pageInput.value = '';
    reader.pageInput.disabled = reader.previous.disabled = reader.next.disabled = true;
    reader.original.href = file.url;
    reader.status.textContent = 'PDF를 불러오는 중…';
    reader.abort = new AbortController();
    const stillHere = () => current(reader) && reader.generation === generation;
    try {
      const [pdf, bytes] = await Promise.all([
        pdfLibrary(),
        fetch(file.url, {credentials:'omit',cache:'no-store',referrerPolicy:'no-referrer',signal:reader.abort.signal}).then(response => {
          if (!response.ok) throw Error('file_unavailable');
          return response.arrayBuffer();
        })
      ]);
      if (!stillHere()) return;
      reader.task = pdf.getDocument({data:new Uint8Array(bytes), isEvalSupported:false, enableXfa:false});
      const doc = await reader.task.promise;
      if (!stillHere()) return;
      reader.doc = doc;
      await renderPage(reader, pageNumber);
    } catch {
      if (stillHere()) reader.status.textContent = '지면을 불러오지 못했어요. 원본 PDF를 열거나 보관함에서 다시 시도해 주세요.';
    }
  }

  function open({receiptId, title, files, resume = false} = {}) {
    const token = session();
    if (!token || !validId(receiptId) || !Array.isArray(files) || !files.length ||
        !files.every(file => validId(file?.fileId) && window.DSPointPdf?.safeUrl(file.url))) return false;
    close();
    const dialog = document.createElement('dialog');
    dialog.className = 'received-pdf-reader';
    dialog.setAttribute('aria-labelledby','received-pdf-title');
    dialog.innerHTML = '<header><h2 id="received-pdf-title"></h2><button type="button" data-close>닫기</button></header>' +
      '<div class="rpr-files"><label>파일 선택 <select></select></label><a target="_blank" rel="noopener noreferrer">원본 PDF 열기 ↗</a></div>' +
      '<div class="rpr-sheet"><p role="status"></p><canvas role="img" hidden></canvas></div>' +
      '<nav aria-label="PDF 쪽 이동"><button type="button" data-previous aria-label="이전 쪽">‹</button><label><input type="number" min="1" step="1" inputmode="numeric" aria-label="이동할 쪽"><span></span></label><button type="button" data-next aria-label="다음 쪽">›</button></nav>';
    const el = selector => dialog.querySelector(selector);
    const reader = {dialog,receiptId,token,generation:0,canvas:el('canvas'),section:el('.rpr-sheet'),status:el('[role=status]'),
      total:el('nav span'),pageInput:el('input'),previous:el('[data-previous]'),next:el('[data-next]'),original:el('a')};
    const select = el('select');
    el('h2').textContent = title || '받은 자료 풀기';
    for (const file of files) select.add(new Option(file.title || 'PDF 파일', file.fileId));
    select.parentElement.hidden = files.length === 1;
    const saved = resume && bookmark(receiptId);
    const file = files.find(item => item.fileId === saved?.fileId) || files[0];
    select.value = file.fileId;
    active = reader;
    document.body.append(dialog);
    dialog.addEventListener('close', () => { if (active === reader) close(); });
    el('[data-close]').onclick = close;
    select.onchange = () => loadFile(reader,files[select.selectedIndex],1);
    reader.previous.onclick = () => renderPage(reader,reader.page - 1);
    reader.next.onclick = () => renderPage(reader,reader.page + 1);
    reader.pageInput.onchange = () => {
      const n = reader.pageInput.valueAsNumber;
      if (Number.isInteger(n)) renderPage(reader,n);
      else reader.pageInput.value = reader.page;
    };
    dialog.showModal();
    loadFile(reader,file,saved?.fileId === file.fileId ? saved.page : 1);
    return true;
  }

  for (const event of ['ds-auth-change','ds-session-change','hashchange','popstate','pagehide']) window.addEventListener(event,close);
  window.DSAuth?.onChange?.(close);
  window.DSReceivedPdf = Object.freeze({open, hasProgress:receiptId => Boolean(bookmark(receiptId))});
})();
