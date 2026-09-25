'use strict';

const Even = {};
let achorClicked = false;

Even.backToTop = function() {
  const $backToTop = $('#back-to-top');

  $(window).scroll(function() {
    if ($(window).scrollTop() > 100) {
      $backToTop.fadeIn(1000);
    } else {
      $backToTop.fadeOut(1000);
    }
  });

  $backToTop.click(function() {
    $('body,html').animate({scrollTop: 0});
  });
};

Even.mobileNavbar = function() {
  const $mobileNav = $('#mobile-navbar');
  const $mobileNavIcon = $('.mobile-navbar-icon');
  const slideout = new Slideout({
    'panel': document.getElementById('mobile-panel'),
    'menu': document.getElementById('mobile-menu'),
    'padding': 180,
    'tolerance': 70,
  });
  slideout.disableTouch();

  $mobileNavIcon.click(function() {
    slideout.toggle();
  });

  slideout.on('beforeopen', function() {
    $mobileNav.addClass('fixed-open');
    $mobileNavIcon.addClass('icon-click').removeClass('icon-out');
  });

  slideout.on('beforeclose', function() {
    $mobileNav.removeClass('fixed-open');
    $mobileNavIcon.addClass('icon-out').removeClass('icon-click');
  });

  $('#mobile-panel').on('touchend', function() {
    slideout.isOpen() && $mobileNavIcon.click();
  });
};

// The toc is pinned by the browser with `position: sticky`
// (see `assets/sass/_partial/_post/_toc.scss`), so only the
// "currently reading" highlight is computed here.
Even._initToc = function() {
  const HEADERFIX = 30;
  const $toclink = $('.toc-link');
  const $headerlink = $('.headerlink');
  const $tocLinkLis = $('.post-toc-content li');

  const headerlinkTop = $.map($headerlink, function(link) {
    return $(link).offset().top;
  });

  const headerLinksOffsetForSearch = $.map(headerlinkTop, function(offset) {
    return offset - HEADERFIX;
  });

  const searchActiveTocIndex = function(array, target) {
    for (let i = 0; i < array.length - 1; i++) {
      if (target > array[i] && target <= array[i + 1]) return i;
    }
    if (target > array[array.length - 1]) return array.length - 1;
    return -1;
  };

  // trigger when scrolling
  $(window).scroll(function() {
    if (achorClicked) {
      achorClicked = false;
      return;
    }

    const scrollTop = $(window).scrollTop();
    const activeTocIndex = searchActiveTocIndex(headerLinksOffsetForSearch, scrollTop);

    $($toclink).removeClass('active');
    $($tocLinkLis).removeClass('has-active');
    // console.log(scrollTop, $(window).height(), $(document).height())
    if(scrollTop + $(window).height() + 5 >= $(document).height()) {
      $toclink.last().addClass('active');
      $tocLinkLis.last().addClass('has-active');
      return
    }

    if (activeTocIndex !== -1 && $toclink[activeTocIndex] != null) {
      $($toclink[activeTocIndex]).addClass('active');
      let ancestor = $toclink[activeTocIndex].parentNode;
      while (ancestor.tagName !== 'NAV') {
        $(ancestor).addClass('has-active');
        ancestor = ancestor.parentNode.parentNode;
      }
    }
  });
};

// Scroll the article being read into view inside the article list, which is
// shorter than the list itself on long archives. When the post was entered from
// a tag page, the list is narrowed down to that tag.
Even.articleList = function() {
  const list = document.querySelector('.post-list');
  if (!list) return;

  const items = list.querySelectorAll('.post-list-content li');
  const active = list.querySelector('li.active');
  const tag = active ? Even._articleListTag() : null;

  // Only narrow the list down when the post being read belongs to that tag.
  if (tag && Even._tagsOf(active).indexOf(tag) !== -1) {
    items.forEach(function(item) {
      item.hidden = Even._tagsOf(item).indexOf(tag) === -1;
    });

    const title = list.querySelector('.post-list-title');
    if (title) title.textContent = title.textContent + ' · ' + Even._tagName(tag);

    // Keep the tag while browsing the list (`?tag=`), including on reload.
    const param = 'tag=' + encodeURIComponent(tag);
    list.querySelectorAll('.post-list-content a').forEach(function(link) {
      link.search = link.search ? link.search + '&' + param : '?' + param;
    });
  }

  if (!active || active.hidden) return;

  const top = active.offsetTop;
  const bottom = top + active.offsetHeight;
  if (top < list.scrollTop || bottom > list.scrollTop + list.clientHeight) {
    list.scrollTop = top - (list.clientHeight - active.offsetHeight) / 2;
  }
};

// Tag slug the reader came from, if any: either the `?tag=` carried over by the
// article list links, or the `/tags/<tag>/` page that linked to this post.
Even._articleListTag = function() {
  const param = new URLSearchParams(window.location.search).get('tag');
  if (param) return param.toLowerCase();

  if (!document.referrer) return null;

  try {
    const match = new URL(document.referrer).pathname.match(/\/tags\/([^\/]+)\/?$/);
    return match ? Even._decode(match[1]).toLowerCase() : null;
  } catch (e) {
    return null;
  }
};

// Tag slugs of an article list item.
Even._tagsOf = function(item) {
  return (item.getAttribute('data-tags') || '').trim().split(/\s+/).filter(Boolean)
    .map(function(tag) { return Even._decode(tag).toLowerCase(); });
};

// Name of a tag slug, taken from the tags of the post being read.
Even._tagName = function(tag) {
  const links = document.querySelectorAll('.post-tags a');
  for (let i = 0; i < links.length; i++) {
    const segments = (links[i].getAttribute('href') || '')
      .replace(/\.html$/, '').replace(/\/+$/, '').split('/');
    const slug = segments[segments.length - 1];
    if (slug && Even._decode(slug).toLowerCase() === tag) {
      return links[i].textContent.trim();
    }
  }
  return tag;
};

Even._decode = function(value) {
  try {
    return decodeURIComponent(value);
  } catch (e) {
    return value;
  }
};

Even.fancybox = function() {
  Fancybox.bind("[data-fancybox]", {
    Carousel: {
      Thumbs: {
        showOnStart: true,
        // type: "classic"
      },
      Toolbar: {
        display: {
          left : ["counter"],
          right: ["zoomIn", "zoomOut","reset","thumbs",'close']
        }
      },
      Arrows: false,
      // https://fancyapps.com/carousel/guides/responsive-design/#breakpoints
      breakpoints: {
        "(min-width: 768px)": {
          Arrows: true,
          Thumbs: {
            showOnStart: false
          }
        },
      },
    },
    // placeFocusBack: false
  });
};

Even.highlight = function() {
  const blocks = document.querySelectorAll('pre code');
  for (let i = 0; i < blocks.length; i++) {
    const block = blocks[i];
    const rootElement = block.parentElement;
    const lineCodes = block.innerHTML.split(/\n/);
    if (lineCodes[lineCodes.length - 1] === '') lineCodes.pop();
    const lineLength = lineCodes.length;

    let codeLineHtml = '';
    for (let i = 0; i < lineLength; i++) {
      codeLineHtml += `<div class="line">${i + 1}</div>`;
    }

    let codeHtml = '';
    for (let i = 0; i < lineLength; i++) {
      codeHtml += `<div class="line">${lineCodes[i]}</div>`;
    }

    block.className += ' highlight';
    const figure = document.createElement('figure');
    figure.className = block.className;
    figure.innerHTML = `<table><tbody><tr><td class="gutter"><pre>${codeLineHtml}</pre></td><td class="code"><pre>${codeHtml}</pre></td></tr></tbody></table>`;

    rootElement.parentElement.replaceChild(figure, rootElement);
  }
};

Even.chroma = function() {
  const blocks = document.querySelectorAll('.highlight > .chroma');
  for (let i = 0; i < blocks.length; i++) {
    const block = blocks[i];
    const afterHighLight = block.querySelector('pre.chroma > code[data-lang]');
    const lang = afterHighLight ? afterHighLight.className : '';
    block.className += ' ' + lang;
  }
};

Even.toc = function() {
  const tocContainer = document.getElementById('post-toc');
  if (tocContainer !== null) {
    const toc = document.getElementById('TableOfContents');
    if (toc === null) {
      // toc = true, but there are no headings
      const tocWrapper = tocContainer.closest('.post-toc-wrap') || tocContainer;
      tocWrapper.parentNode.removeChild(tocWrapper);
    } else {
      this._refactorToc(toc);
      this._linkToc();
      this._initToc();
    }
  }
};

Even._refactorToc = function(toc) {
  // when headings do not start with `h1`
  const oldTocList = toc.children[0];
  let newTocList = oldTocList;
  let temp;
  while (newTocList.children.length === 1
      && (temp = newTocList.children[0].children[0]).tagName === 'UL') {
    newTocList = temp;
  }

  if (newTocList !== oldTocList) toc.replaceChild(newTocList, oldTocList);
};

Even._linkToc = function() {
  const links = document.querySelectorAll('#TableOfContents a:first-child');
  for (let i = 0; i < links.length; i++) links[i].className += ' toc-link';

  for (let num = 1; num <= 6; num++) {
    const headers = document.querySelectorAll('.post-content>h' + num);
    for (let i = 0; i < headers.length; i++) {
      const header = headers[i];
      header.innerHTML = `<a href="#${header.id}" class="headerlink anchor"><i class="iconfont icon-link"></i></a>${header.innerHTML}`;
    }
  }
};

Even.flowchart = function() {
  if (!window.flowchart) return;

  const blocks = document.querySelectorAll('pre code.language-flowchart, pre code.language-flow');
  for (let i = 0; i < blocks.length; i++) {
    if (!window.hljs && i % 2 === 0) continue;

    const block = blocks[i];
    const rootElement = window.hljs
        ? block.parentElement
        : block.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement;

    const container = document.createElement('div');
    const id = `js-flowchart-diagrams-${i}`;
    container.id = id;
    container.className = 'align-center';
    rootElement.parentElement.replaceChild(container, rootElement);

    const diagram = flowchart.parse(block.childNodes[0].nodeValue);
    diagram.drawSVG(id, window.flowchartDiagramsOptions ? window.flowchartDiagramsOptions : {});
  }
};

Even.sequence = function() {
  if (!window.Diagram) return;

  const blocks = document.querySelectorAll('pre code.language-sequence');
  for (let i = 0; i < blocks.length; i++) {
    if (!window.hljs && i % 2 === 0) continue;

    const block = blocks[i];
    const rootElement = window.hljs
        ? block.parentElement
        : block.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement;

    const container = document.createElement('div');
    const id = `js-sequence-diagrams-${i}`;
    container.id = id;
    container.className = 'align-center';
    rootElement.parentElement.replaceChild(container, rootElement);

    const diagram = Diagram.parse(block.childNodes[0].nodeValue);
    diagram.drawSVG(id, window.sequenceDiagramsOptions
        ? window.sequenceDiagramsOptions
        : {theme: 'simple'});
  }
};

Even.responsiveTable = function() {
  const tables = document.querySelectorAll('.post-content table:not(.lntable)');
  for (let i = 0; i < tables.length; i++) {
    const table = tables[i];
    const wrapper = document.createElement('div');
    wrapper.className = 'table-wrapper';
    table.parentElement.replaceChild(wrapper, table);
    wrapper.appendChild(table);
  }
};

Even.bindClick = function() {
  // use delegate to detect anchor click
  document.addEventListener('click', function(event) {
    if (event.target.classList.contains('toc-link')) {
      achorClicked = true;
      const $toclink = $('.toc-link');
      const $headerlink = $('.headerlink');
      const $tocLinkLis = $('.post-toc-content li');
      $toclink.removeClass('active');
      $tocLinkLis.removeClass('has-active');
      // add active
      // console.log(event.target)
      // the target parent add class "has-active"
      event.target.parentElement.classList.add('has-active');
      // the target add class "active"
      event.target.classList.add('active');
    }



  })
}