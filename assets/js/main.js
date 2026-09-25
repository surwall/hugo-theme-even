// Initialized with the DOM API only and before the jQuery block below: a
// missing jQuery (loaded from a public CDN) aborts the rest of this file, and
// the reading progress bar must keep working in that case.
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', function () { Even.readingProgress(); });
} else {
  Even.readingProgress();
}

$(document).ready(function () {
  Even.backToTop();
  Even.mobileNavbar();
  Even.toc();
  Even.fancybox();
  Even.bindClick();
});

Even.responsiveTable();
Even.flowchart();
Even.sequence();

if (window.hljs) {
  hljs.initHighlighting();
  Even.highlight();
} else {
  Even.chroma();
}

