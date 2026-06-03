const gallery = document.getElementById('gallery');
  const lightbox = document.getElementById('lightbox');
  const lbImg = document.getElementById('lb-img');
  const lbTitle = document.getElementById('lb-title');
  const lbDesc = document.getElementById('lb-desc');
  const lbCategory = document.getElementById('lb-category');
  const lbCounter = document.getElementById('lb-counter');
  const lbProgress = document.getElementById('lb-progress');
  const lbClose = document.getElementById('lb-close');
  const lbPrev = document.getElementById('lb-prev');
  const lbNext = document.getElementById('lb-next');
  const visibleCount = document.getElementById('visible-count');
  const emptyState = document.getElementById('empty-state');
  const uploadZone = document.getElementById('upload-zone');
  const fileInput = document.getElementById('file-input');
  const uploadCategory = document.getElementById('upload-category');
  const uploadTriggerBtn = document.getElementById('upload-trigger-btn');
  const toast = document.getElementById('upload-toast');
  let currentIndex = 0;
  let visibleItems = [];
  let activeFilter = 'all';
  let toastTimer = null;
  function showToast(msg) {
    toast.textContent = msg;
    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('show'), 2800);
  }
  function getVisibleItems() {
    return Array.from(gallery.querySelectorAll('.gallery-item:not(.hidden)'));
  }
  function updateCounter() {
    const count = getVisibleItems().length;
    visibleCount.textContent = count;
    emptyState.style.display = count === 0 ? 'block' : 'none';
    syncUploadsFilterBtn();
  }
  function syncUploadsFilterBtn() {
    const hasUploads = gallery.querySelector('.gallery-item[data-category="uploads"]');
    let uploadsBtn = document.querySelector('.filter-btn[data-filter="uploads"]');
    if (hasUploads && !uploadsBtn) {
      uploadsBtn = document.createElement('button');
      uploadsBtn.className = 'filter-btn';
      uploadsBtn.dataset.filter = 'uploads';
      uploadsBtn.textContent = 'Uploads';
      const nav = document.querySelector('nav');
      const sortGroup = nav.querySelector('.sort-group');
      nav.insertBefore(uploadsBtn, sortGroup);
      uploadsBtn.addEventListener('click', handleFilterClick);
    }
    if (!hasUploads && uploadsBtn) uploadsBtn.remove();
  }
  function handleFilterClick() {
    const btn = this;
    activeFilter = btn.dataset.filter;
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const all = Array.from(gallery.querySelectorAll('.gallery-item'));
    all.forEach((item, i) => {
      const match = activeFilter === 'all' || item.dataset.category === activeFilter;
      if (!match) {
        item.classList.add('hidden');
      } else {
        item.classList.remove('hidden');
        item.style.animation = 'none';
        item.offsetHeight;
        item.style.animation = '';
      }
    });
    updateCounter();
  }
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', handleFilterClick);
  });
  document.querySelectorAll('.sort-btn[data-layout]').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.sort-btn[data-layout]').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const layout = btn.dataset.layout;
      if (layout === 'wide') {
        gallery.style.gridTemplateColumns = 'repeat(auto-fill, minmax(380px, 1fr))';
        gallery.querySelectorAll('.gallery-item').forEach(item => { item.style.aspectRatio = '16/9'; });
      } else {
        gallery.style.gridTemplateColumns = '';
        gallery.querySelectorAll('.gallery-item').forEach(item => { item.style.aspectRatio = ''; });
      }
    });
  });
  function bindItemEvents(item) {
    item.querySelector('img').addEventListener('click', () => openLightbox(item));
    item.querySelector('.item-overlay').addEventListener('click', () => openLightbox(item));
    const del = item.querySelector('.delete-btn');
    if (del) {
      del.addEventListener('click', e => {
        e.stopPropagation();
        item.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
        item.style.opacity = '0';
        item.style.transform = 'scale(0.9)';
        setTimeout(() => { item.remove(); updateCounter(); showToast('Photo removed'); }, 300);
      });
    }
  }
  gallery.querySelectorAll('.gallery-item').forEach(item => {
    const delBtn = document.createElement('button');
    delBtn.className = 'delete-btn';
    delBtn.title = 'Remove photo';
    delBtn.innerHTML = '<svg viewBox="0 0 24 24"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>';
    item.appendChild(delBtn);
    bindItemEvents(item);
  });
  function createGalleryItem(src, name, category) {
    const item = document.createElement('div');
    item.className = 'gallery-item';
    item.dataset.category = category;
    item.dataset.title = name;
    item.dataset.desc = 'Uploaded · ' + category.charAt(0).toUpperCase() + category.slice(1);
    const catLabel = category.charAt(0).toUpperCase() + category.slice(1);
    item.innerHTML = `
      <img src="${src}" alt="${name}" loading="lazy">
      <div class="category-badge">${catLabel}</div>
      <div class="item-overlay">
        <div class="item-title">${name}</div>
        <div class="item-meta">${catLabel} · Uploaded</div>
      </div>
      <div class="filter-icon"><svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg></div>
      <button class="delete-btn" title="Remove photo"><svg viewBox="0 0 24 24"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg></button>
    `;
    if (activeFilter !== 'all' && activeFilter !== category) {
      item.classList.add('hidden');
    }
    gallery.insertBefore(item, gallery.querySelector('.empty-state'));
    item.style.animation = 'none';
    item.offsetHeight;
    item.style.animation = 'fadeInUp 0.5s cubic-bezier(0.16,1,0.3,1) both';
    bindItemEvents(item);
    return item;
  }
  function handleFiles(files) {
    const category = uploadCategory.value;
    let count = 0;
    Array.from(files).forEach(file => {
      if (!file.type.startsWith('image/')) return;
      const reader = new FileReader();
      reader.onload = e => {
        const name = file.name.replace(/\.[^.]+$/, '').replace(/[-_]/g, ' ');
        createGalleryItem(e.target.result, name, category);
        count++;
        updateCounter();
        if (count === files.length || count === 1) {
          showToast(count === 1 ? `1 photo added to ${category}` : `${count} photos added to ${category}`);
        }
      };
      reader.readAsDataURL(file);
    });
  }
  fileInput.addEventListener('change', e => { if (e.target.files.length) handleFiles(e.target.files); fileInput.value = ''; });
  uploadTriggerBtn.addEventListener('click', e => { e.preventDefault(); e.stopPropagation(); fileInput.click(); });
  uploadZone.addEventListener('dragover', e => { e.preventDefault(); uploadZone.classList.add('drag-over'); });
  uploadZone.addEventListener('dragleave', () => uploadZone.classList.remove('drag-over'));
  uploadZone.addEventListener('drop', e => {
    e.preventDefault();
    uploadZone.classList.remove('drag-over');
    if (e.dataTransfer.files.length) handleFiles(e.dataTransfer.files);
  });
  function openLightbox(item) {
    visibleItems = getVisibleItems();
    currentIndex = visibleItems.indexOf(item);
    renderLightbox();
    lightbox.classList.add('open');
    document.body.style.overflow = 'hidden';
  }
  function closeLightbox() {
    lightbox.classList.remove('open');
    document.body.style.overflow = '';
    lbImg.className = 'applied-filter';
    document.querySelectorAll('.lb-filter-btn').forEach(b => b.classList.remove('active'));
    document.querySelector('.lb-filter-btn[data-imgfilter="none"]').classList.add('active');
  }
  function renderLightbox() {
    const item = visibleItems[currentIndex];
    if (!item) return;
    const img = item.querySelector('img');
    lbImg.src = img.src;
    lbImg.alt = img.alt;
    lbTitle.textContent = item.dataset.title;
    lbDesc.textContent = item.dataset.desc;
    lbCategory.textContent = item.dataset.category.charAt(0).toUpperCase() + item.dataset.category.slice(1);
    lbCounter.textContent = `${currentIndex + 1} / ${visibleItems.length}`;
    lbProgress.style.width = ((currentIndex + 1) / visibleItems.length * 100) + '%';
  }
  lbClose.addEventListener('click', closeLightbox);
  lightbox.addEventListener('click', e => { if (e.target === lightbox) closeLightbox(); });
  lbPrev.addEventListener('click', () => {
    currentIndex = (currentIndex - 1 + visibleItems.length) % visibleItems.length;
    renderLightbox();
  });
  lbNext.addEventListener('click', () => {
    currentIndex = (currentIndex + 1) % visibleItems.length;
    renderLightbox();
  });
  document.querySelectorAll('.lb-filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.lb-filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const filter = btn.dataset.imgfilter;
      lbImg.className = 'applied-filter' + (filter !== 'none' ? ' ' + filter : '');
    });
  });
  document.addEventListener('keydown', e => {
    if (!lightbox.classList.contains('open')) return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowLeft') { currentIndex = (currentIndex - 1 + visibleItems.length) % visibleItems.length; renderLightbox(); }
    if (e.key === 'ArrowRight') { currentIndex = (currentIndex + 1) % visibleItems.length; renderLightbox(); }
  });
  let touchStartX = 0;
  lightbox.addEventListener('touchstart', e => { touchStartX = e.changedTouches[0].screenX; }, { passive: true });
  lightbox.addEventListener('touchend', e => {
    const dx = e.changedTouches[0].screenX - touchStartX;
    if (Math.abs(dx) > 50) {
      if (dx < 0) { currentIndex = (currentIndex + 1) % visibleItems.length; }
      else { currentIndex = (currentIndex - 1 + visibleItems.length) % visibleItems.length; }
      renderLightbox();
    }
  }, { passive: true });
  updateCounter();
