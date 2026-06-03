/* ============================================================
   PULSE — DJ Event Site  |  script.js
   ============================================================ */

/* ──────────────────────────────────────
   1. NAVIGATION — スクロールでスタイル変更
────────────────────────────────────── */
const nav = document.getElementById('nav');

function updateNav() {
  if (window.scrollY > 40) {
    nav.classList.add('scrolled');
  } else {
    nav.classList.remove('scrolled');
  }
}

window.addEventListener('scroll', updateNav, { passive: true });
updateNav();


/* ──────────────────────────────────────
   2. HAMBURGER MENU
────────────────────────────────────── */
const navToggle = document.getElementById('navToggle');
const navMobile = document.getElementById('navMobile');

navToggle.addEventListener('click', () => {
  const isOpen = navMobile.classList.toggle('open');
  navToggle.classList.toggle('open', isOpen);
  navToggle.setAttribute('aria-expanded', isOpen);
});

// モバイルメニューのリンクをクリックしたら閉じる
navMobile.querySelectorAll('.nav-mobile-link').forEach(link => {
  link.addEventListener('click', () => {
    navMobile.classList.remove('open');
    navToggle.classList.remove('open');
    navToggle.setAttribute('aria-expanded', 'false');
  });
});


/* ──────────────────────────────────────
   3. FADE-IN ANIMATION (Intersection Observer)
────────────────────────────────────── */
const fadeTargets = document.querySelectorAll(
  '.event-card, .dj-card, .ticket-card, .venue-panel, .notice-card, .gallery-item, .section-label, .section-title, .section-desc'
);

// クラス付与
fadeTargets.forEach(el => el.classList.add('fade-in'));

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        // 少しずつ遅延させてカード群がパラパラ表示される
        const delay = (i % 6) * 80;
        setTimeout(() => {
          entry.target.classList.add('visible');
        }, delay);
        observer.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
);

fadeTargets.forEach(el => observer.observe(el));


/* ──────────────────────────────────────
   4. CONTACT FORM — フィードバック表示
────────────────────────────────────── */
const contactForm = document.getElementById('contactForm');
const formNotice  = document.getElementById('formNotice');

if (contactForm) {
  contactForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const name    = contactForm.querySelector('#name').value.trim();
    const email   = contactForm.querySelector('#email').value.trim();
    const message = contactForm.querySelector('#message').value.trim();

    if (!name || !email || !message) {
      formNotice.textContent = '必須項目を全てご入力ください。';
      formNotice.style.color = '#ff4444';
      return;
    }

    // 実際のフォーム送信はここに追加（例: fetch to API）
    formNotice.textContent = '';
    formNotice.style.color = 'var(--clr-accent)';

    const btn = contactForm.querySelector('button[type="submit"]');
    btn.textContent = 'Sending...';
    btn.disabled = true;

    setTimeout(() => {
      formNotice.textContent = '✓ メッセージを送信しました！近日中にご連絡いたします。';
      btn.textContent = 'Send Message';
      btn.disabled = false;
      contactForm.reset();
    }, 1200);
  });
}


/* ──────────────────────────────────────
   5. SMOOTH ACTIVE NAV LINK
   スクロール位置に合わせてナビのリンクをハイライト
────────────────────────────────────── */
const sections = document.querySelectorAll('section[id]');
const navLinks  = document.querySelectorAll('.nav-links a');

function setActiveLink() {
  let current = '';
  sections.forEach(sec => {
    const top = sec.offsetTop - 100;
    if (window.scrollY >= top) current = sec.id;
  });
  navLinks.forEach(link => {
    link.style.color = link.getAttribute('href') === `#${current}`
      ? 'var(--clr-text)'
      : '';
  });
}

window.addEventListener('scroll', setActiveLink, { passive: true });


/* ──────────────────────────────────────
   6. GALLERY MODAL
────────────────────────────────────── */
const galleryModal  = document.getElementById('galleryModal');
const modalOverlay  = document.getElementById('modalOverlay');
const modalCloseBtn = document.getElementById('modalClose');
const modalCrop     = document.getElementById('modalCrop');
const modalContainer = galleryModal?.querySelector('.modal-container');

const MODAL_VARIANTS = ['cinematic', 'immersive', 'closeup', 'laser', 'energy'];

function resetAnimation(el) {
  el.style.animation = 'none';
  void el.offsetHeight; // reflow で animation をフラッシュ
  el.style.animation = '';
}

function openGalleryModal(src, bgSize, bgPos, aspect, alt, variant) {
  // 既存バリアントクラスを全除去 → 新バリアントを追加
  galleryModal.classList.remove(...MODAL_VARIANTS.map(v => `modal--${v}`), 'open');
  if (variant) galleryModal.classList.add(`modal--${variant}`);

  // アニメーションをリセットして再生させる
  resetAnimation(modalCrop);
  resetAnimation(modalContainer);

  // コラージュの該当セルを background でクロップ表示
  modalCrop.style.backgroundImage  = `url('${src}')`;
  modalCrop.style.backgroundSize   = bgSize;
  modalCrop.style.backgroundPosition = bgPos;
  modalCrop.style.aspectRatio      = aspect;
  modalCrop.setAttribute('aria-label', alt);

  galleryModal.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeGalleryModal() {
  galleryModal.classList.remove('open', ...MODAL_VARIANTS.map(v => `modal--${v}`));
  document.body.style.overflow = '';
  // 閉じた後にリセット（メモリ解放）
  setTimeout(() => {
    modalCrop.style.backgroundImage = '';
    modalCrop.style.aspectRatio     = '';
  }, 300);
}

// data-modal-* 属性を持つカードをすべて自動登録（将来の追加にも対応）
if (galleryModal && modalOverlay && modalCloseBtn && modalCrop && modalContainer) {
  document.querySelectorAll('.gallery-has-modal').forEach(card => {
    const handler = () => openGalleryModal(
      card.dataset.modalSrc      || '',
      card.dataset.modalBgSize   || 'cover',
      card.dataset.modalBgPos    || 'center',
      card.dataset.modalAspect   || '16/9',
      card.dataset.modalAlt      || '',
      card.dataset.modalVariant  || ''
    );
    card.addEventListener('click', handler);
    card.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handler(); }
    });
  });

  modalOverlay.addEventListener('click',  closeGalleryModal);
  modalCloseBtn.addEventListener('click', closeGalleryModal);
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && galleryModal.classList.contains('open')) closeGalleryModal();
  });
}
