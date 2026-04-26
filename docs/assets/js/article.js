  (function(){
    const rootHtml = document.documentElement;
    const STORAGE_FONT_KEY = 'blog-font-size';
    const MIN_FONT = 12;
    const MAX_FONT = 24;
    const DEFAULT_FONT = 16;
    
    function getCurrentFontSize() {
      const computed = getComputedStyle(rootHtml).getPropertyValue('--font-size-root').trim();
      if (computed && computed.endsWith('px')) {
        return parseInt(computed, 10);
      }
      return DEFAULT_FONT;
    }
    
    function setFontSize(pxValue) {
      let newSize = Math.min(MAX_FONT, Math.max(MIN_FONT, pxValue));
      rootHtml.style.setProperty('--font-size-root', newSize + 'px');
      localStorage.setItem(STORAGE_FONT_KEY, newSize);
    }
    
    function increaseFont() {
      let current = getCurrentFontSize();
      setFontSize(current + 1);
    }
    
    function decreaseFont() {
      let current = getCurrentFontSize();
      setFontSize(current - 1);
    }
    
    function resetFont() {
      setFontSize(DEFAULT_FONT);
    }
    
    function restoreFontSize() {
      const saved = localStorage.getItem(STORAGE_FONT_KEY);
      if (saved !== null) {
        let size = parseInt(saved, 10);
        if (!isNaN(size) && size >= MIN_FONT && size <= MAX_FONT) {
          rootHtml.style.setProperty('--font-size-root', size + 'px');
          return;
        }
      }
      rootHtml.style.setProperty('--font-size-root', DEFAULT_FONT + 'px');
    }
    
    restoreFontSize();
    
    const increaseBtn = document.getElementById('fontIncrease');
    const decreaseBtn = document.getElementById('fontDecrease');
    const resetBtn = document.getElementById('fontReset');
    if(increaseBtn) increaseBtn.addEventListener('click', increaseFont);
    if(decreaseBtn) decreaseBtn.addEventListener('click', decreaseFont);
    if(resetBtn) resetBtn.addEventListener('click', resetFont);
    
    const panel = document.getElementById('fontControlPanel');
    const toggleBtn = document.getElementById('fontPanelToggleBtn');
    if(toggleBtn && panel) {
      toggleBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        if(panel.style.display === 'none' || getComputedStyle(panel).display === 'none') {
          panel.style.display = 'flex';
        } else {
          panel.style.display = 'none';
        }
      });
    }
    if(panel) panel.style.display = 'none';
    
    const rootAttr = document.documentElement;
    const toggleThemeBtn = document.getElementById('theme-toggle');
    const iconSun = document.getElementById('icon-sun');
    const iconMoon = document.getElementById('icon-moon');
    
    function applyTheme(theme) {
      rootAttr.setAttribute('data-theme', theme);
      localStorage.setItem('blog-theme', theme);
      if (theme === 'light') {
        if(iconSun) iconSun.style.display = 'none';
        if(iconMoon) iconMoon.style.display = 'block';
      } else {
        if(iconSun) iconSun.style.display = 'block';
        if(iconMoon) iconMoon.style.display = 'none';
      }
    }
    
    const savedTheme = localStorage.getItem('blog-theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    applyTheme(savedTheme || (prefersDark ? 'dark' : 'light'));
    
    if(toggleThemeBtn) {
      toggleThemeBtn.addEventListener('click', () => {
        const current = rootAttr.getAttribute('data-theme');
        applyTheme(current === 'dark' ? 'light' : 'dark');
      });
    }
    
    const markExtension = {
      name: 'mark',
      level: 'inline',
      start(src) { return src.indexOf('=='); },
      tokenizer(src) {
        const match = src.match(/^==([^=]+)==/);
        if (match) return { type: 'mark', raw: match[0], text: match[1] };
      },
      renderer(token) {
        return `<mark>${token.text}</mark>`;
      }
    };
    marked.use({ extensions: [markExtension] });
    
    const ARTICLES_META = {
      save_your_self: { title: 'كيف تجعل اختراق حساباتك مستحيلاً؟', date: '2026-04-23', tag: 'تقني' },
    };
    
    function formatDate(str) {
      return new Date(str).toLocaleDateString('ar-DZ', {
        year: 'numeric', month: 'long', day: 'numeric'
      });
    }
    
    async function loadArticle() {
      const params = new URLSearchParams(window.location.search);
      const slug = params.get('a');
      const contentEl = document.getElementById('content');
      const footerSlug = document.getElementById('footer-slug');
      
      if (!slug) {
        contentEl.innerHTML = `<p class="state error">لم يُحدَّد مقال. استخدم ?a=اسم-المقال</p>`;
        return;
      }
      if (footerSlug) footerSlug.textContent = slug + '.md';
      
      try {
        const res = await fetch(`../md/${slug}.md`);
        if (!res.ok) throw new Error(`${res.status}`);
        const md = await res.text();
        const meta = ARTICLES_META[slug] || {};
        document.title = (meta.title || slug) + ' — المدوّنة';
        
        const firstHeading = md.match(/^#\s+(.+)/m)?.[1];
        const title = meta.title || firstHeading || slug;
        const cleanMd = meta.title ? md : md.replace(/^#\s+.+\n?/, '');
        
        contentEl.innerHTML = `
          <div class="article-header">
            <div class="breadcrumb">
              <a href="../../">الرئيسية</a>
              <span>/</span>
              <a href="../">المدوّنة</a>
              <span>/</span>
              <span>${title}</span>
            </div>
            <h1 id="article-title">${title}</h1>
            <div class="article-info">
              ${meta.tag ? `<span class="tag">${meta.tag}</span>` : ''}
              ${meta.date ? `<span class="date">${formatDate(meta.date)}</span>` : ''}
            </div>
          </div>
          <div id="article-body">${marked.parse(cleanMd)}</div>
          <div class="footer">
            صُنع وكُتب من طرف 
            <a href="https://0xdya.vercel.app/">ضياء الدين ملوك</a>
          </div>
        `;
      } catch (err) {
        contentEl.innerHTML = `<p class="state error">تعذّر تحميل المقالة "${slug}".</p>`;
      }
    }
    
    loadArticle();
    const yearSpan = document.getElementById('footer-year');
    if (yearSpan) yearSpan.textContent = new Date().getFullYear();
  })();