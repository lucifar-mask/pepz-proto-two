/* ================= PEPZ floating quiz bubble =================
   Injected on EVERY page (index + subpages): a glass bubble pinned to the
   bottom-left corner that opens a compact popover running the full
   Peptide_Goals_Quiz.docx flow (name -> goals -> follow-ups -> universal
   questions -> recommendation key + adjustment rules).
   Also wires the mobile nav drawer on subpages that ship one (index wires
   its own drawer and marks <body data-drawer-wired>). Asset/product paths
   are resolved from this script's own src, so the same file works from /
   and from /products/ or /goals/. */
(function () {
  'use strict';

  /* ---- base path (".../pepz-proto/") derived from this script's src ---- */
  var BASE = (function () {
    var src = (document.currentScript && document.currentScript.src) || '';
    return src.replace(/assets\/quiz\.js.*$/, '');
  })();

  /* ================= data (verbatim from the docx) ================= */
  var GOAL_NAMES = {
    'muscle-recovery': 'Muscle Recovery',
    'longevity': 'Longevity',
    'beauty': 'Beauty',
    'fitness': 'Fitness'
  };
  var GOAL_PHOTOS = {
    'muscle-recovery': ['mission-muscle-recovery-male.jpg', 'mission-muscle-recovery-female.jpg'],
    'longevity': ['mission-longevity-male.jpg', 'mission-longevity-female.jpg'],
    'beauty': ['mission-beauty-male.jpg', 'mission-beauty-female.jpg'],
    'fitness': ['mission-fitness-male.jpg', 'mission-fitness-female.jpg']
  };
  var PRODUCTS = {
    'bpc-157':             { name: 'BPC-157',               img: 'bpc-157-1-DvsU9HZn.png.png',             why: 'Core soft-tissue repair peptide.' },
    'tb-500':              { name: 'TB-500',                img: 'tb-500-1-tvvZj_AE.png.png',              why: 'Speeds recovery, calms inflammation.' },
    'nad-plus':            { name: 'NAD+',                  img: 'nad-plus-1-BKLocQST.png.png',            why: 'Restores mitochondrial energy.' },
    'sermorelin':          { name: 'Sermorelin',            img: 'sermorelin-1-C2d9qNKH.png.png',          why: 'Stimulates natural GH release.' },
    'ghk-cu':              { name: 'GHK-Cu',                img: 'ghk-cu-1-vI4S7jS2.png.png',              why: 'Rebuilds collagen and elastin.' },
    'ghk-cu-cream':        { name: 'GHK-Cu Cream',          img: 'ghkcucreamwomen.png',                    why: 'Topical skin + hair renewal.' },
    'cjc-1295-ipamorelin': { name: 'CJC-1295 / Ipamorelin', img: 'cjc-1295-ipamorelin-1-JuJ36UDM.png.png', why: 'Amplifies natural GH pulses overnight.' },
    'tesamorelin':         { name: 'Tesamorelin',           img: 'tesamorelin-1-CRfOSXuX.png.png',         why: 'Clinically shown to cut visceral fat.' },
    'mots-c':              { name: 'MOTS-C',                img: 'mots-c-1-BcuMa1MT.png.png',              why: 'Boosts exercise capacity.' }
  };
  var INJECTABLES = ['bpc-157', 'tb-500', 'cjc-1295-ipamorelin', 'tesamorelin', 'sermorelin', 'mots-c', 'nad-plus'];

  var FOLLOWUPS = {
    'muscle-recovery': [
      { id: 'mr-issue', q: 'What is going on with recovery?', opts: [
        ['injury', 'A specific injury or nagging joint/tendon pain'],
        ['soreness', 'General post-workout soreness'],
        ['wounds', 'Slow-healing skin or wounds'],
        ['inflammation', 'Chronic inflammation']] },
      { id: 'mr-intensity', q: 'How intense is your training?', opts: [
        ['light', 'Light / recreational'],
        ['moderate', 'Moderate (3–5x per week)'],
        ['high', 'High-intensity / competitive athlete']] },
      { id: 'mr-duration', q: 'How long has this been going on?', opts: [
        ['acute', 'Less than 2 weeks (acute)'],
        ['mid', '2–6 weeks'],
        ['chronic', 'More than 6 weeks (chronic)']] }
    ],
    'longevity': [
      { id: 'lg-focus', q: 'Which longevity goal matters most?', opts: [
        ['sleep-energy', 'Better sleep & energy'],
        ['cellular', 'Cellular repair / anti-aging'],
        ['immune', 'Immune resilience'],
        ['cognitive', 'Cognitive sharpness']] },
      { id: 'lg-sleep', q: 'How would you rate your current sleep quality?', opts: [
        ['great', 'Great'],
        ['ok', 'OK, could be better'],
        ['poor', 'Poor']] },
      { id: 'lg-direction', q: 'Prevention, or reversing existing signs of aging?', opts: [
        ['prevention', 'Prevention'],
        ['reversing', 'Reversing existing issues'],
        ['both', 'Both']] }
    ],
    'beauty': [
      { id: 'bt-focus', q: 'What is your main beauty focus?', opts: [
        ['firmness', 'Skin firmness & wrinkles'],
        ['hair', 'Hair growth / thickness'],
        ['collagen', 'Overall collagen support'],
        ['scarring', 'Scarring / texture']] },
      { id: 'bt-delivery', q: 'Do you prefer topical or systemic (injectable) approaches?', opts: [
        ['topical', 'Topical only'],
        ['injectable-ok', 'Open to injectable'],
        ['no-pref', 'No preference']] },
      { id: 'bt-skin', q: 'What is your primary skin concern?', opts: [
        ['fine-lines', 'Fine lines'],
        ['elasticity', 'Elasticity / sagging'],
        ['texture', 'Texture / scarring'],
        ['dullness', 'Dullness']] }
    ],
    'fitness': [
      { id: 'ft-priority', q: 'What is your fitness priority?', opts: [
        ['lean-muscle', 'Building lean muscle'],
        ['fat-loss', 'Losing fat'],
        ['endurance', 'Endurance / performance'],
        ['gh-support', 'Natural growth hormone support']] },
      { id: 'ft-split', q: 'What is your training split?', opts: [
        ['strength', 'Mostly strength training'],
        ['cardio', 'Mostly cardio / endurance'],
        ['hybrid', 'Hybrid / mixed']] },
      { id: 'ft-recomp', q: 'Also focused on fat loss alongside muscle gain (recomposition)?', opts: [
        ['yes', 'Yes'],
        ['no', 'No'],
        ['not-sure', 'Not sure']] }
    ]
  };
  var UNIVERSAL = [
    { id: 'uv-experience', q: 'Have you used peptides before?', opts: [
      ['new', 'No, I am new to this'],
      ['experienced', 'Yes, I have experience']] },
    { id: 'uv-delivery', q: 'What is your delivery preference?', opts: [
      ['injectable-ok', 'Injectable is fine'],
      ['topical-oral', 'Prefer topical or oral only'],
      ['no-pref', 'No preference']] },
    { id: 'uv-medical', q: 'Do you currently take medications or have any health conditions?', opts: [
      ['yes', 'Yes'],
      ['no', 'No']] },
    { id: 'uv-commitment', q: 'What is your commitment level?', opts: [
      ['short', 'Short trial (4–8 weeks)'],
      ['long', 'Long-term, ongoing protocol'],
      ['unsure', 'Not sure yet']] }
  ];

  /* ================= markup injection ================= */
  function isHer() { return document.documentElement.classList.contains('theme-her'); }

  function tileHTML(goal) {
    return '<button type="button" class="pq-tile" data-goal="' + goal + '">' +
      '<span class="pq-tile-photo" data-goal="' + goal + '"></span>' +
      '<span class="pq-tile-check"><svg viewBox="0 0 24 24" fill="none" width="12" height="12"><path d="M4 12l5 5L20 6" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg></span>' +
      '<span class="pq-tile-label">' + GOAL_NAMES[goal] + '</span>' +
    '</button>';
  }

  var root = document.createElement('div');
  root.id = 'pepzQuizRoot';
  root.innerHTML =
    '<button type="button" class="pq-fab" id="pqFab" aria-haspopup="dialog" aria-expanded="false" aria-label="Build My Routine quiz">' +
      '<span class="pq-fab-icon"><svg viewBox="0 0 24 24" fill="none" width="20" height="20"><path d="M9 3.5h6M9 3.5v3.2L4.8 14a1.6 1.6 0 0 0 1.4 2.4h11.6a1.6 1.6 0 0 0 1.4-2.4L15 6.7V3.5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/><path d="M9.5 12l2 2 3-3" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg></span>' +
      '<span class="pq-fab-label">Build My Routine</span>' +
    '</button>' +
    '<div class="pq-pop" id="pqPop" role="dialog" aria-label="Build My Routine quiz">' +
      '<div class="pq-head">' +
        '<span class="pq-head-title">Build My <span>Routine</span></span>' +
        '<button type="button" class="pq-close" id="pqClose" aria-label="Close quiz"><svg viewBox="0 0 24 24" width="14" height="14" fill="none"><path d="M6 6l12 12M18 6L6 18" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg></button>' +
      '</div>' +
      '<div class="pq-rail" aria-hidden="true">' +
        '<span class="pq-dot is-current" data-rail="0">01</span>' +
        '<span class="pq-dot" data-rail="1">02</span>' +
        '<span class="pq-dot" data-rail="2">03</span>' +
        '<span class="pq-dot" data-rail="3">04</span>' +
        '<span class="pq-dot" data-rail="4">05</span>' +
      '</div>' +
      '<div class="pq-body">' +

        '<div class="pq-step is-active" data-step="0">' +
          '<h4>First things first</h4>' +
          '<p class="pq-hint">What should we call you?</p>' +
          '<input type="text" class="pq-input" id="pqName" placeholder="Your name" autocomplete="given-name">' +
          '<div class="pq-nav"><span></span><button type="button" class="pq-btn" data-next>Next</button></div>' +
        '</div>' +

        '<div class="pq-step" data-step="1">' +
          '<h4 id="pqGoalsTitle">What matters most to you right now?</h4>' +
          '<p class="pq-hint">Pick one or more goals.</p>' +
          '<div class="pq-tiles">' + tileHTML('muscle-recovery') + tileHTML('longevity') + tileHTML('beauty') + tileHTML('fitness') + '</div>' +
          '<div class="pq-nav"><button type="button" class="pq-backbtn" data-back>&larr; Back</button><button type="button" class="pq-btn" data-next disabled>Next</button></div>' +
        '</div>' +

        '<div class="pq-step" data-step="2">' +
          '<div class="pq-meta"><span class="pq-tag" id="pqFollowTag"></span><span class="pq-count" id="pqFollowCount"></span></div>' +
          '<h4 id="pqFollowTitle"></h4>' +
          '<div class="pq-opts" id="pqFollowOptions"></div>' +
          '<div class="pq-nav"><button type="button" class="pq-backbtn" id="pqFollowBack">&larr; Back</button><button type="button" class="pq-btn" id="pqFollowNext" disabled>Next</button></div>' +
        '</div>' +

        '<div class="pq-step" data-step="3">' +
          '<div class="pq-meta"><span class="pq-tag">About You</span><span class="pq-count" id="pqUniCount"></span></div>' +
          '<h4 id="pqUniTitle"></h4>' +
          '<div class="pq-opts" id="pqUniOptions"></div>' +
          '<div class="pq-nav"><button type="button" class="pq-backbtn" id="pqUniBack">&larr; Back</button><button type="button" class="pq-btn" id="pqUniNext" disabled>Next</button></div>' +
        '</div>' +

        '<div class="pq-step" data-step="4">' +
          '<h4 id="pqResultTitle">Your starting routine</h4>' +
          '<p class="pq-hint">Built from your answers &mdash; tap a product to learn more.</p>' +
          '<div id="pqWarnSlot"></div>' +
          '<div class="pq-results" id="pqResults"></div>' +
          '<ul class="pq-notes" id="pqNotes"></ul>' +
          '<p class="pq-also" id="pqAlso"></p>' +
          '<p class="pq-disclaimer">Every protocol is reviewed and prescribed by a licensed physician.</p>' +
          '<div class="pq-nav"><button type="button" class="pq-backbtn" id="pqRetake">&#8634; Retake</button><button type="button" class="pq-btn" id="pqBook">Book Consultation</button></div>' +
        '</div>' +

      '</div>' +
    '</div>';
  document.body.appendChild(root);

  /* goal tile photos, theme-aware (re-applied when the gender switch flips) */
  function applyTilePhotos() {
    var her = isHer();
    Array.prototype.slice.call(root.querySelectorAll('.pq-tile-photo')).forEach(function (el) {
      var pair = GOAL_PHOTOS[el.getAttribute('data-goal')];
      el.style.backgroundImage = 'url("' + BASE + 'assets/' + (her ? pair[1] : pair[0]) + '")';
    });
  }
  applyTilePhotos();
  new MutationObserver(applyTilePhotos).observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });

  /* ================= open / close ================= */
  var fab = document.getElementById('pqFab');
  var pop = document.getElementById('pqPop');
  var closeBtn = document.getElementById('pqClose');

  function setOpen(open) {
    pop.classList.toggle('open', open);
    fab.setAttribute('aria-expanded', String(open));
    fab.classList.toggle('is-open', open);
  }
  fab.addEventListener('click', function () { setOpen(!pop.classList.contains('open')); });
  closeBtn.addEventListener('click', function () { setOpen(false); });
  /* anything marked data-open-quiz (e.g. the "Take the Quiz" step in How
     It Works) opens the popover */
  Array.prototype.slice.call(document.querySelectorAll('[data-open-quiz]')).forEach(function (el) {
    el.addEventListener('click', function (e) {
      e.preventDefault();
      setOpen(true);
    });
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && pop.classList.contains('open')) setOpen(false);
  });

  /* ================= quiz logic ================= */
  var state = { name: '', goals: [], answers: {} };
  var steps = Array.prototype.slice.call(root.querySelectorAll('.pq-step'));
  var dots = Array.prototype.slice.call(root.querySelectorAll('.pq-dot'));

  function goToStep(i) {
    steps.forEach(function (st) {
      st.classList.toggle('is-active', parseInt(st.dataset.step, 10) === i);
    });
    dots.forEach(function (d) {
      var ri = parseInt(d.dataset.rail, 10);
      d.classList.toggle('is-current', ri === i);
      d.classList.toggle('is-done', ri < i);
    });
    if (i === 1) personalizeGoals();
    if (i === 2) followRunner.start();
    if (i === 3) uniRunner.start();
    if (i === 4) renderRoutine();
    var body = root.querySelector('.pq-body');
    if (body) body.scrollTop = 0;
  }

  function makeRunner(cfg) {
    var queue = [], idx = 0;
    function render() {
      var q = queue[idx];
      if (cfg.tagEl) cfg.tagEl.textContent = q.tag || '';
      cfg.countEl.textContent = (idx + 1) + ' / ' + queue.length;
      cfg.titleEl.textContent = q.q;
      cfg.optsEl.innerHTML = '';
      q.opts.forEach(function (pair) {
        var b = document.createElement('button');
        b.type = 'button';
        b.className = 'pq-chip' + (state.answers[q.id] === pair[0] ? ' selected' : '');
        b.textContent = pair[1];
        b.addEventListener('click', function () {
          state.answers[q.id] = pair[0];
          Array.prototype.slice.call(cfg.optsEl.children).forEach(function (c) {
            c.classList.toggle('selected', c === b);
          });
          cfg.nextBtn.disabled = false;
        });
        cfg.optsEl.appendChild(b);
      });
      cfg.nextBtn.disabled = !state.answers[q.id];
    }
    cfg.nextBtn.addEventListener('click', function () {
      if (idx < queue.length - 1) { idx++; render(); } else { cfg.onDone(); }
    });
    cfg.backBtn.addEventListener('click', function () {
      if (idx > 0) { idx--; render(); } else { cfg.onBackOut(); }
    });
    return { start: function () { queue = cfg.getQueue(); idx = 0; render(); } };
  }

  var followRunner = makeRunner({
    tagEl: document.getElementById('pqFollowTag'),
    countEl: document.getElementById('pqFollowCount'),
    titleEl: document.getElementById('pqFollowTitle'),
    optsEl: document.getElementById('pqFollowOptions'),
    nextBtn: document.getElementById('pqFollowNext'),
    backBtn: document.getElementById('pqFollowBack'),
    getQueue: function () {
      var q = [];
      state.goals.forEach(function (g) {
        (FOLLOWUPS[g] || []).forEach(function (item) {
          q.push({ id: item.id, q: item.q, opts: item.opts, tag: GOAL_NAMES[g] });
        });
      });
      return q;
    },
    onDone: function () { goToStep(3); },
    onBackOut: function () { goToStep(1); }
  });

  var uniRunner = makeRunner({
    tagEl: null,
    countEl: document.getElementById('pqUniCount'),
    titleEl: document.getElementById('pqUniTitle'),
    optsEl: document.getElementById('pqUniOptions'),
    nextBtn: document.getElementById('pqUniNext'),
    backBtn: document.getElementById('pqUniBack'),
    getQueue: function () { return UNIVERSAL.slice(); },
    onDone: function () { goToStep(4); },
    onBackOut: function () { goToStep(2); }
  });

  var nameInput = document.getElementById('pqName');
  nameInput.addEventListener('keydown', function (e) {
    if (e.key === 'Enter') goToStep(1);
  });

  var goalsTitle = document.getElementById('pqGoalsTitle');
  function personalizeGoals() {
    state.name = (nameInput.value || '').trim();
    goalsTitle.textContent = state.name
      ? 'What matters most to you right now, ' + state.name + '?'
      : 'What matters most to you right now?';
  }

  var tiles = Array.prototype.slice.call(root.querySelectorAll('.pq-tile'));
  var goalsNext = steps[1].querySelector('[data-next]');
  tiles.forEach(function (t) {
    t.addEventListener('click', function () {
      var g = t.dataset.goal;
      var idx = state.goals.indexOf(g);
      if (idx === -1) state.goals.push(g); else state.goals.splice(idx, 1);
      t.classList.toggle('selected', idx === -1);
      goalsNext.disabled = state.goals.length === 0;
    });
  });

  steps.slice(0, 2).forEach(function (st, i) {
    var next = st.querySelector('[data-next]');
    if (next) next.addEventListener('click', function () { goToStep(i + 1); });
    var back = st.querySelector('[data-back]');
    if (back) back.addEventListener('click', function () { goToStep(i - 1); });
  });

  /* ---- docx recommendation key + adjustments ---- */
  function buildRoutine() {
    var a = state.answers;
    var picks = [], also = [], notes = [];
    function add(slug, why) {
      if (!PRODUCTS[slug]) return;
      for (var i = 0; i < picks.length; i++) if (picks[i].slug === slug) return;
      picks.push({ slug: slug, why: why || PRODUCTS[slug].why });
    }
    function discuss(n) { if (also.indexOf(n) === -1) also.push(n); }

    state.goals.forEach(function (g) {
      if (g === 'muscle-recovery') {
        if (a['mr-issue'] === 'injury') { add('bpc-157', 'Paired for localized injury-site repair.'); add('tb-500', 'Paired for localized injury-site repair.'); }
        if (a['mr-issue'] === 'soreness') add('bpc-157', 'Milder protocol for everyday recovery.');
        if (a['mr-issue'] === 'wounds') { add('ghk-cu', 'Well studied for tissue and wound repair.'); add('bpc-157'); }
        if (a['mr-issue'] === 'inflammation') add('tb-500', 'Used for longer-standing, systemic inflammation.');
        if (a['mr-duration'] === 'chronic') add('tb-500', 'Used for chronic, systemic inflammation.');
      }
      if (g === 'longevity') {
        if (a['lg-focus'] === 'sleep-energy') { add('cjc-1295-ipamorelin', 'GH-releasing combo for sleep and energy.'); discuss('DSIP'); }
        if (a['lg-focus'] === 'cellular') { add('ghk-cu', 'Cellular turnover and repair signaling.'); discuss('Epitalon'); }
        if (a['lg-focus'] === 'immune') { add('nad-plus', 'Cellular energy and immune resilience support.'); discuss('Thymosin Alpha-1'); }
        if (a['lg-focus'] === 'cognitive') { add('nad-plus', 'Supports cellular energy and cognition.'); discuss('Semax + Selank'); }
        if (a['lg-sleep'] === 'poor') add('cjc-1295-ipamorelin', 'Deeper sleep via natural GH pulse.');
      }
      if (g === 'beauty') {
        if (a['bt-focus'] === 'firmness') add('ghk-cu-cream', 'Copper peptide for firmness and wrinkles.');
        if (a['bt-focus'] === 'hair') add('ghk-cu-cream', 'Supports follicle health topically.');
        if (a['bt-focus'] === 'collagen') { add('ghk-cu', 'Systemic collagen support.'); discuss('Oral bioactive collagen peptides'); }
        if (a['bt-focus'] === 'scarring') add('ghk-cu-cream', 'Used for remodeling and texture support.');
      }
      if (g === 'fitness') {
        if (a['ft-priority'] === 'lean-muscle') add('cjc-1295-ipamorelin', 'GH-releasing combo favored for lean mass.');
        if (a['ft-priority'] === 'fat-loss') { add('tesamorelin', 'Studied specifically for fat metabolism.'); discuss('AOD-9604'); }
        if (a['ft-priority'] === 'endurance') add('mots-c', 'Mitochondrial peptide linked to performance.');
        if (a['ft-priority'] === 'gh-support') add('sermorelin', 'Stimulates the body’s own GH release.');
        if (a['ft-recomp'] === 'yes') add('tesamorelin', 'Supports fat loss during recomposition.');
      }
    });

    var topicalOnly = a['uv-delivery'] === 'topical-oral' || a['bt-delivery'] === 'topical';
    if (topicalOnly) {
      picks = picks.filter(function (p) { return INJECTABLES.indexOf(p.slug) === -1; });
      if (!picks.length) add('ghk-cu-cream', 'Topical copper peptide to start with.');
      discuss('Oral bioactive collagen peptides');
      notes.push('Kept to topical / oral options per your preference — injectable options were left out.');
    }
    if (a['uv-experience'] === 'new' && picks.length > 2) {
      picks = picks.slice(0, 2);
      notes.push('Since you are new to peptides, we start with a conservative one-or-two peptide protocol instead of a full stack.');
    }
    if (a['uv-commitment'] === 'short' && picks.length > 1) {
      picks = picks.slice(0, 1);
      notes.push('Short trial: we lead with the single highest-priority peptide for your top goal.');
    }
    picks = picks.slice(0, 4);
    return { picks: picks, also: also, notes: notes, medFlag: a['uv-medical'] === 'yes' };
  }

  var resultsEl = document.getElementById('pqResults');
  var notesEl = document.getElementById('pqNotes');
  var alsoEl = document.getElementById('pqAlso');
  var warnSlot = document.getElementById('pqWarnSlot');
  var resultTitle = document.getElementById('pqResultTitle');

  function renderRoutine() {
    var r = buildRoutine();
    resultTitle.textContent = state.name ? 'Your starting routine, ' + state.name : 'Your starting routine';
    warnSlot.innerHTML = r.medFlag
      ? '<div class="pq-warn"><svg viewBox="0 0 24 24" fill="none" width="15" height="15"><path d="M12 8v5M12 16h.01" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="1.6"/></svg><span>Because you take medications or have a health condition, a physician consultation is required before starting anything below.</span></div>'
      : '';
    resultsEl.innerHTML = r.picks.map(function (p) {
      var prod = PRODUCTS[p.slug];
      return '<a class="pq-result" href="' + BASE + 'products/' + p.slug + '.html">' +
        '<span class="pq-result-photo" style="background-image:url(\'' + BASE + 'assets/' + prod.img + '\')"></span>' +
        '<span class="pq-result-body"><span class="pq-result-name">' + prod.name + '</span><span class="pq-result-why">' + p.why + '</span></span>' +
      '</a>';
    }).join('');
    notesEl.innerHTML = r.notes.map(function (n) { return '<li>' + n + '</li>'; }).join('');
    alsoEl.innerHTML = r.also.length
      ? '<b>Also worth discussing with your provider:</b> ' + r.also.join(', ') + '.'
      : '';
  }

  document.getElementById('pqRetake').addEventListener('click', function () {
    state.goals = [];
    state.answers = {};
    tiles.forEach(function (t) { t.classList.remove('selected'); });
    goalsNext.disabled = true;
    goToStep(1);
  });

  document.getElementById('pqBook').addEventListener('click', function () {
    var trigger = document.getElementById('bookConsultBtn');
    if (document.getElementById('bookModal') && trigger) {
      setOpen(false);
      trigger.click();
    } else {
      window.location.href = BASE + 'index.html#contact';
    }
  });

  /* ================= mobile drawer wiring for subpages =================
     Index wires its own drawer and marks <body data-drawer-wired="1">. */
  var menuBtn = document.getElementById('mobileMenuBtn');
  var drawer = document.getElementById('mobileNavDrawer');
  if (menuBtn && drawer && document.body.getAttribute('data-drawer-wired') !== '1') {
    var closeDrawerBtn = document.getElementById('mobileNavCloseBtn');
    function setDrawer(open) {
      drawer.classList.toggle('open', open);
      drawer.setAttribute('aria-hidden', String(!open));
      menuBtn.setAttribute('aria-expanded', String(open));
    }
    menuBtn.addEventListener('click', function () { setDrawer(true); });
    if (closeDrawerBtn) closeDrawerBtn.addEventListener('click', function () { setDrawer(false); });
    drawer.addEventListener('click', function (e) {
      if (e.target === drawer || e.target.closest('.nav-link')) setDrawer(false);
    });
  }
})();
