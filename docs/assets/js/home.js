 document.getElementById('footer-year').textContent = new Date().getFullYear();

  const ARTICLES = [
    {
      slug:  'save_your_self',
      title: 'كيف تجعل اختراق حساباتك مستحيلاً؟', date: '2026-04-23', tag: 'امن سبراني'
    }
  ];

  function formatDate(str) {
    const d = new Date(str);
    return d.toLocaleDateString('ar-DZ', { year: 'numeric', month: 'short', day: 'numeric' });
  }

  function render() {
    const list = document.getElementById('articles-list');
    const count = document.getElementById('article-count');

    if (!ARTICLES.length) {
      count.textContent = 'لا توجد مقالات بعد.';
      return;
    }

    const sorted = [...ARTICLES].sort((a, b) => new Date(b.date) - new Date(a.date));

    count.textContent = `${sorted.length} ${sorted.length === 1 ? 'مقالة' : 'مقالات'}`;

    list.innerHTML = sorted.map(a => `
      <a class="article-item" href="./article/?a=${a.slug}">
        <span class="article-title">${a.title}</span>
        <span class="article-meta">
          ${a.tag ? `<span class="article-tag">${a.tag}</span>` : ''}
          <span class="article-date">${formatDate(a.date)}</span>
        </span>
      </a>
    `).join('');
  }

  render();