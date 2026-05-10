# 일본어 학습 v2.0 Implementation Plan

> Builds on v1.0 (already complete in `japanese.html` at tag `v1.0`).

**Goal:** Add mastery tracking, prioritized re-quiz, topic progress visualization, audio-direction quiz, word refinement, and correct-answer sound — based on planner ↔ critical reviewer dialogue.

**Architecture:** All changes inside the existing single `japanese.html`. Extends `STORAGE` module for mastery state, modifies `MODE_QUIZ` for re-quiz + audio direction, replaces topic dropdown in `ROUTER` with topic grid, adds Web Audio sound to `UTILS`.

---

## Task v2.1: Mastery foundation in STORAGE

Add per-word mastery state. A word is "mastered" if it has correct answers on ≥ 2 distinct dates. Composite key: `topicId:kana`.

**Modify:** `STORAGE` block in `japanese.html` + tests in `test.html`

**Steps:**

- [ ] **Step 1: Update DEFAULTS in `STORAGE` block**

Find the `DEFAULTS` object inside the STORAGE script block and add `wordStats: {}`:

```javascript
const DEFAULTS = {
  flashcardsViewed: 0,
  quizHighScore: 0,
  lastStudied: null,
  selectedTopic: 'school',
  wordStats: {}
};
```

- [ ] **Step 2: Add `recordWordResult` and `getMasteryStatus` to STORAGE**

Inside the STORAGE IIFE, after `bumpStat` and before `_setKey`, add:

```javascript
function recordWordResult(topicId, kana, correct) {
  const today = new Date().toISOString().slice(0, 10);
  const current = loadProgress();
  const key = topicId + ':' + kana;
  const stats = current.wordStats || {};
  const stat = stats[key] || { correctDays: [], wrongCount: 0 };
  if (correct) {
    if (!stat.correctDays.includes(today)) stat.correctDays.push(today);
  } else {
    stat.wrongCount = (stat.wrongCount || 0) + 1;
  }
  stats[key] = stat;
  return saveProgress({ wordStats: stats });
}

function getMasteryStatus(topicId, kana) {
  const current = loadProgress();
  const stat = (current.wordStats || {})[topicId + ':' + kana];
  if (!stat) return 'new';
  if ((stat.correctDays || []).length >= 2) return 'mastered';
  return 'learning';
}

function getTopicProgress(topicId, words) {
  const current = loadProgress();
  const stats = current.wordStats || {};
  let mastered = 0;
  for (const w of words) {
    const stat = stats[topicId + ':' + w.kana];
    if (stat && (stat.correctDays || []).length >= 2) mastered++;
  }
  return { mastered, total: words.length };
}
```

Add these to the return: `return { loadProgress, saveProgress, bumpStat, recordWordResult, getMasteryStatus, getTopicProgress, _setKey };`

- [ ] **Step 3: Add tests in `test.html`**

In the test block, append:

```javascript
// ========== MASTERY tests ==========
test('mastery: new word returns "new"', () => {
  localStorage.removeItem('jp.test_mastery1');
  window.JL.storage._setKey('jp.test_mastery1');
  assertEq(window.JL.storage.getMasteryStatus('school', 'がっこう'), 'new');
  localStorage.removeItem('jp.test_mastery1');
  window.JL.storage._setKey('jp.progress');
});

test('mastery: 1 correct = learning, 2 distinct days = mastered', () => {
  localStorage.removeItem('jp.test_mastery2');
  window.JL.storage._setKey('jp.test_mastery2');
  // simulate first day
  window.JL.storage.recordWordResult('school', 'がっこう', true);
  assertEq(window.JL.storage.getMasteryStatus('school', 'がっこう'), 'learning');
  // tamper to add second day
  const p = window.JL.storage.loadProgress();
  p.wordStats['school:がっこう'].correctDays.push('2099-01-01');
  localStorage.setItem('jp.test_mastery2', JSON.stringify(p));
  assertEq(window.JL.storage.getMasteryStatus('school', 'がっこう'), 'mastered');
  localStorage.removeItem('jp.test_mastery2');
  window.JL.storage._setKey('jp.progress');
});

test('mastery: same-day correct does not double-count', () => {
  localStorage.removeItem('jp.test_mastery3');
  window.JL.storage._setKey('jp.test_mastery3');
  window.JL.storage.recordWordResult('school', 'ほん', true);
  window.JL.storage.recordWordResult('school', 'ほん', true);
  const p = window.JL.storage.loadProgress();
  assertEq(p.wordStats['school:ほん'].correctDays.length, 1);
  localStorage.removeItem('jp.test_mastery3');
  window.JL.storage._setKey('jp.progress');
});

test('mastery: wrong increments wrongCount', () => {
  localStorage.removeItem('jp.test_mastery4');
  window.JL.storage._setKey('jp.test_mastery4');
  window.JL.storage.recordWordResult('school', 'ほん', false);
  window.JL.storage.recordWordResult('school', 'ほん', false);
  const p = window.JL.storage.loadProgress();
  assertEq(p.wordStats['school:ほん'].wrongCount, 2);
  localStorage.removeItem('jp.test_mastery4');
  window.JL.storage._setKey('jp.progress');
});

test('mastery: getTopicProgress counts mastered', () => {
  localStorage.removeItem('jp.test_mastery5');
  window.JL.storage._setKey('jp.test_mastery5');
  const p = window.JL.storage.loadProgress();
  p.wordStats = {
    'food:ごはん': { correctDays: ['2026-01-01', '2026-01-02'], wrongCount: 0 },
    'food:パン': { correctDays: ['2026-01-01'], wrongCount: 0 }
  };
  localStorage.setItem('jp.test_mastery5', JSON.stringify(p));
  const result = window.JL.storage.getTopicProgress('food', [
    { kana: 'ごはん' }, { kana: 'パン' }, { kana: 'みず' }
  ]);
  assertEq(result.mastered, 1);
  assertEq(result.total, 3);
  localStorage.removeItem('jp.test_mastery5');
  window.JL.storage._setKey('jp.progress');
});
```

- [ ] **Step 4: Mirror updated STORAGE in test.html**

Update the STORAGE script mirror block in `test.html` to match the new STORAGE implementation (with `recordWordResult`, `getMasteryStatus`, `getTopicProgress` added to return).

- [ ] **Step 5: Commit**

```bash
cd "C:/Users/pc/Desktop/japanese-learning"
git add japanese.html test.html
git -c user.email=fridayam123@gmail.com -c user.name="Claude" commit -m "feat(v2): mastery tracking foundation in STORAGE"
```

---

## Task v2.2: Quiz records results + prioritizes weak words

Modify quiz to (a) call `recordWordResult` on each answer and (b) bias question selection toward words that need work.

**Modify:** `MODE_QUIZ` block in `japanese.html` + quiz mirror in `test.html` + new tests

**Steps:**

- [ ] **Step 1: Update `buildQuestions` to use priority**

Replace the existing `buildQuestions` function in `MODE_QUIZ` with:

```javascript
function buildQuestions(topic) {
  const words = topic.words;
  if (words.length === 0) return [];
  const u = window.JL.utils;
  const storage = window.JL.storage;

  // Priority pools
  const wrongs = [];
  const news = [];
  const learnings = [];
  const masters = [];
  for (const w of words) {
    const status = storage ? storage.getMasteryStatus(topic.id, w.kana) : 'new';
    const stat = storage ? (storage.loadProgress().wordStats || {})[topic.id + ':' + w.kana] : null;
    if (stat && stat.wrongCount > 0) wrongs.push(w);
    else if (status === 'new') news.push(w);
    else if (status === 'learning') learnings.push(w);
    else masters.push(w);
  }

  // Build target list: wrongs first, then news, then learnings, then masters as filler
  const ordered = [...u.shuffle(wrongs), ...u.shuffle(news), ...u.shuffle(learnings), ...u.shuffle(masters)];
  const targets = ordered.slice(0, Math.min(QUESTION_COUNT, words.length));

  return targets.map(answer => {
    const wrongPool = words.filter(w => w.meaning !== answer.meaning);
    const distractorCount = Math.min(3, wrongPool.length);
    const distractors = u.pickRandom(wrongPool, distractorCount);
    const choices = u.shuffle([answer, ...distractors]);
    const direction = pickDirection();
    return { answer, choices, direction };
  });
}

function pickDirection() {
  const r = Math.random();
  if (r < 0.34) return 'jp_to_ko';
  if (r < 0.67) return 'ko_to_jp';
  return 'audio_to_meaning';
}
```

- [ ] **Step 2: Update `handleChoice` to record result**

Inside `handleChoice`, after computing `correct`, add:

```javascript
if (window.JL.storage) {
  window.JL.storage.recordWordResult(state.topic.id, q.answer.kana, correct);
}
```

Place it right after `if (correct) state.score += 10;`.

- [ ] **Step 3: Update existing quiz tests (still must pass)**

The existing tests pass synthetic topics without `id`. Update test fixtures to add `id: 'test_topic'`:

In `test.html`, find the 4 existing quiz tests. Each has:
```javascript
const topic = { words: Array.from({length: 18}, ...) };
```
Change to:
```javascript
const topic = { id: 'test_topic', words: Array.from({length: 18}, ...) };
```

(Same for the test with length 5.)

Also: clear localStorage before each quiz test to prevent priority pool from interfering. Wrap each test body's start with:
```javascript
localStorage.removeItem('jp.progress');
```

- [ ] **Step 4: Add a new test for re-quiz priority**

Append to the test block:

```javascript
test('quiz: prioritizes wrong-answered words', () => {
  localStorage.removeItem('jp.progress');
  // record one word as wrong
  window.JL.storage.recordWordResult('test_priority', 'k0', false);
  const topic = {
    id: 'test_priority',
    words: Array.from({length: 18}, (_, i) => ({
      kana: 'k'+i, kanji: '', meaning: 'm'+i, example: { jp: '', ko: '' }
    }))
  };
  const qs = window.JL.modes.quiz._buildQuestions(topic);
  // The wrong word k0 must appear in the first 10 questions
  assert(qs.some(q => q.answer.kana === 'k0'), 'wrong word missing from priority pool');
  localStorage.removeItem('jp.progress');
});
```

- [ ] **Step 5: Mirror updated quiz module**

Update the quiz mirror in `test.html` to match the new MODE_QUIZ implementation.

- [ ] **Step 6: Commit**

```bash
cd "C:/Users/pc/Desktop/japanese-learning"
git add japanese.html test.html
git -c user.email=fridayam123@gmail.com -c user.name="Claude" commit -m "feat(v2): quiz records word results, prioritizes weak words"
```

---

## Task v2.3: Audio direction in quiz

Adds `audio_to_meaning` direction: TTS plays the kana, user picks the Korean meaning.

**Modify:** `MODE_QUIZ` block (render, handleChoice already records via Task v2.2)

**Steps:**

- [ ] **Step 1: Update `render` to handle audio direction**

In the existing `render(root)` function in `MODE_QUIZ`, replace the section that builds `promptText`, `targetText`, `targetClass` with:

```javascript
const promptText =
  q.direction === 'jp_to_ko' ? '뜻은?' :
  q.direction === 'ko_to_jp' ? '일본어로?' :
  '들은 단어의 뜻은?';

let targetHtml;
if (q.direction === 'audio_to_meaning') {
  targetHtml = `<button class="quiz-audio-btn" id="quizAudio" aria-label="발음 듣기">🔊</button>`;
} else {
  const targetText = q.direction === 'jp_to_ko' ? q.answer.kana : q.answer.meaning;
  const targetClass = q.direction === 'jp_to_ko' ? 'target jp jp-text' : 'target';
  const u = window.JL.utils;
  targetHtml = `<div class="${targetClass}">${u.escapeHtml(targetText)}</div>`;
}

const choicesHtml = q.choices.map((c, i) => {
  const text =
    q.direction === 'jp_to_ko' ? c.meaning :
    q.direction === 'ko_to_jp' ? c.kana :
    c.meaning; // audio_to_meaning shows meanings
  const cls = q.direction === 'ko_to_jp' ? 'quiz-choice jp-text' : 'quiz-choice';
  return `<button class="${cls}" data-i="${i}">${u.escapeHtml(text)}</button>`;
}).join('');
```

(Note: `u` defined earlier in `render`, reuse.)

Then change the inner content of `.quiz-question` to use `targetHtml` instead of the previous `<div class="${targetClass}">${u.escapeHtml(targetText)}</div>`:

```javascript
<div class="quiz-question">
  <div class="prompt">${promptText}</div>
  ${targetHtml}
</div>
```

- [ ] **Step 2: Auto-play TTS on audio direction + bind speaker button**

After the `root.innerHTML = ...` in `render`, add:

```javascript
if (q.direction === 'audio_to_meaning') {
  const speakAudio = () => window.JL.tts.speak(q.answer.kana);
  setTimeout(speakAudio, 200); // auto-play once
  const audioBtn = document.getElementById('quizAudio');
  if (audioBtn) audioBtn.addEventListener('click', speakAudio);
}
```

Place it before the existing back-link binding so the auto-play fires on every render.

- [ ] **Step 3: Add CSS for `.quiz-audio-btn`**

Append to the `<style>` block (before `</style>`):

```css
.quiz-audio-btn {
  appearance: none; border: 1.5px solid var(--accent); background: #fff;
  width: 96px; height: 96px; border-radius: 50%; font-size: 36px;
  cursor: pointer; transition: all .12s;
}
.quiz-audio-btn:hover { background: var(--soft); }
.quiz-audio-btn:active { transform: scale(0.97); }
```

- [ ] **Step 4: Commit**

```bash
cd "C:/Users/pc/Desktop/japanese-learning"
git add japanese.html
git -c user.email=fridayam123@gmail.com -c user.name="Claude" commit -m "feat(v2): audio direction quiz (TTS + meaning)"
```

---

## Task v2.4: Topic grid with progress bars (replaces dropdown)

Replace the topic `<select>` in the main screen with a grid of topic cards. Each card shows topic name + mastered/total + a progress bar.

**Modify:** `ROUTER` block (renderMain), CSS additions

**Steps:**

- [ ] **Step 1: Add CSS for topic grid + progress bar**

Append to `<style>`:

```css
.topic-grid {
  display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin: 20px 0 28px;
}
.topic-card {
  background: var(--soft); border: 1.5px solid var(--border); border-radius: 14px;
  padding: 16px 14px; cursor: pointer; transition: all .12s; text-align: left;
}
.topic-card:hover { border-color: var(--accent); }
.topic-card.active { border-color: var(--accent); background: #fff; box-shadow: var(--shadow); }
.topic-card .name { font-size: 16px; font-weight: 600; margin-bottom: 6px; }
.topic-card .progress-text { font-size: 12px; color: var(--muted); margin-bottom: 6px; }
.topic-card .progress-bar {
  width: 100%; height: 6px; background: #e5e5e5; border-radius: 3px; overflow: hidden;
}
.topic-card .progress-fill {
  height: 100%; background: var(--accent); transition: width .3s;
}

@media (max-width: 700px) {
  .topic-grid { grid-template-columns: repeat(2, 1fr); }
}
```

- [ ] **Step 2: Update `renderMain` to use topic grid**

In the ROUTER block, replace `renderMain` with:

```javascript
function renderMain() {
  currentMode = 'main';
  const root = document.getElementById('app');
  const progress = window.JL.storage.loadProgress();
  const u = window.JL.utils;

  const topicCards = DATA.topics.map(t => {
    const p = window.JL.storage.getTopicProgress(t.id, t.words);
    const pct = p.total > 0 ? Math.round((p.mastered / p.total) * 100) : 0;
    const activeClass = t.id === currentTopic ? ' active' : '';
    return `
      <div class="topic-card${activeClass}" data-topic="${u.escapeHtml(t.id)}">
        <div class="name">${u.escapeHtml(t.name)}</div>
        <div class="progress-text">${p.mastered} / ${p.total} 마스터</div>
        <div class="progress-bar"><div class="progress-fill" style="width:${pct}%"></div></div>
      </div>
    `;
  }).join('');

  root.innerHTML = `
    <header class="app-header">
      <h1>일본어 학습</h1>
    </header>

    <div class="topic-grid">${topicCards}</div>

    <div class="mode-grid">
      <div class="mode-card" data-mode="flashcard">
        <div class="label">플래시카드</div>
        <div class="desc">단어와 예문을 카드로 익히기</div>
      </div>
      <div class="mode-card" data-mode="quiz">
        <div class="label">퀴즈</div>
        <div class="desc">4지선다 10문제로 점검</div>
      </div>
      <div class="mode-card" data-mode="conversation">
        <div class="label">회화</div>
        <div class="desc">상황별 대화 따라하기</div>
      </div>
    </div>

    <div class="stats">
      <div class="stat">학습한 카드 <strong>${progress.flashcardsViewed}</strong></div>
      <div class="stat">퀴즈 최고점 <strong>${progress.quizHighScore}</strong></div>
      <div class="stat">마지막 학습 <strong>${progress.lastStudied || '-'}</strong></div>
    </div>
  `;

  root.querySelectorAll('.topic-card').forEach(el => {
    el.addEventListener('click', () => setTopic(el.dataset.topic));
  });
  root.querySelectorAll('.mode-card').forEach(el => {
    el.addEventListener('click', () => show(el.dataset.mode));
  });
}
```

- [ ] **Step 3: Commit**

```bash
cd "C:/Users/pc/Desktop/japanese-learning"
git add japanese.html
git -c user.email=fridayam123@gmail.com -c user.name="Claude" commit -m "feat(v2): topic grid with progress bars (replaces dropdown)"
```

---

## Task v2.5: Word refinement + expansion (data quality first)

Polish low-quality entries, then expand topics under 20 words to reach 20+.

**Modify:** `DATA` block — but only the topics that need work

Word counts in v1: school 18, food 18, animal 17, family 15, daily 16, numbers_time 18, travel 16, cooking 17. All under 20 except none. Need to add:
- school: +2 (→20)
- food: +2 (→20)
- animal: +3 (→20)
- family: +5 (→20)
- daily: +4 (→20)
- numbers_time: +2 (→20)
- travel: +4 (→20)
- cooking: +3 (→20)

**Steps:**

- [ ] **Step 1: Add words to bring each topic to 20+**

In the `DATA.topics` array, append the following words to each topic's `words` array (insert before the closing `]`):

**school** (add 2):
```javascript
{ kana: 'こうてい', kanji: '校庭', meaning: '운동장', example: { jp: 'こうていで あそびます。', ko: '운동장에서 놉니다.' } },
{ kana: 'たいいく', kanji: '体育', meaning: '체육', example: { jp: 'たいいくが すきです。', ko: '체육을 좋아합니다.' } }
```

Add commas before these new entries so the array stays valid.

**food** (add 2):
```javascript
{ kana: 'みそしる', kanji: '味噌汁', meaning: '된장국', example: { jp: 'みそしるを のみます。', ko: '된장국을 마십니다.' } },
{ kana: 'おにぎり', kanji: 'お握り', meaning: '주먹밥', example: { jp: 'おにぎりを たべます。', ko: '주먹밥을 먹습니다.' } }
```

**animal** (add 3):
```javascript
{ kana: 'こいぬ', kanji: '子犬', meaning: '강아지', example: { jp: 'こいぬが かわいいです。', ko: '강아지가 귀엽습니다.' } },
{ kana: 'こねこ', kanji: '子猫', meaning: '새끼고양이', example: { jp: 'こねこが ねています。', ko: '새끼고양이가 자고 있습니다.' } },
{ kana: 'カエル', kanji: '', meaning: '개구리', example: { jp: 'カエルが ぴょんと とびます。', ko: '개구리가 폴짝 뜁니다.' } }
```

**family** (add 5):
```javascript
{ kana: 'まご', kanji: '孫', meaning: '손주', example: { jp: 'まごが あそびに きます。', ko: '손주가 놀러 옵니다.' } },
{ kana: 'おっと', kanji: '夫', meaning: '남편', example: { jp: 'おっとは かいしゃいんです。', ko: '남편은 회사원입니다.' } },
{ kana: 'つま', kanji: '妻', meaning: '아내', example: { jp: 'つまは せんせいです。', ko: '아내는 선생님입니다.' } },
{ kana: 'ペット', kanji: '', meaning: '반려동물', example: { jp: 'ペットを かっています。', ko: '반려동물을 키웁니다.' } },
{ kana: 'なまえ', kanji: '名前', meaning: '이름', example: { jp: 'なまえを おしえてください。', ko: '이름을 알려 주세요.' } }
```

**daily** (add 4):
```javascript
{ kana: 'ごめんなさい', kanji: '', meaning: '미안해요', example: { jp: 'ごめんなさい、おそくなりました。', ko: '미안해요, 늦었습니다.' } },
{ kana: 'がんばって', kanji: '', meaning: '힘내', example: { jp: 'しけん、がんばってね。', ko: '시험 힘내.' } },
{ kana: 'すき', kanji: '好き', meaning: '좋아하다', example: { jp: 'いぬが すきです。', ko: '개를 좋아합니다.' } },
{ kana: 'きらい', kanji: '嫌い', meaning: '싫어하다', example: { jp: 'にんじんが きらいです。', ko: '당근을 싫어합니다.' } }
```

**numbers_time** (add 2):
```javascript
{ kana: 'ふん', kanji: '分', meaning: '분', example: { jp: 'ごふん まってください。', ko: '5분 기다려 주세요.' } },
{ kana: 'びょう', kanji: '秒', meaning: '초', example: { jp: 'じゅうびょう かぞえます。', ko: '10초 셉니다.' } }
```

**travel** (add 4):
```javascript
{ kana: 'こうえん', kanji: '公園', meaning: '공원', example: { jp: 'こうえんで あそびます。', ko: '공원에서 놉니다.' } },
{ kana: 'みやげもの', kanji: '土産物', meaning: '기념품 가게', example: { jp: 'みやげものやに いきます。', ko: '기념품 가게에 갑니다.' } },
{ kana: 'たびする', kanji: '旅する', meaning: '여행하다', example: { jp: 'いっしょに たびしましょう。', ko: '같이 여행합시다.' } },
{ kana: 'おもいで', kanji: '思い出', meaning: '추억', example: { jp: 'たのしい おもいでです。', ko: '즐거운 추억입니다.' } }
```

**cooking** (add 3):
```javascript
{ kana: 'おちゃわん', kanji: 'お茶碗', meaning: '밥그릇', example: { jp: 'おちゃわんに ごはんを いれます。', ko: '밥그릇에 밥을 담습니다.' } },
{ kana: 'こおり', kanji: '氷', meaning: '얼음', example: { jp: 'こおりを いれます。', ko: '얼음을 넣습니다.' } },
{ kana: 'あつい', kanji: '熱い', meaning: '뜨겁다', example: { jp: 'スープが あついです。', ko: '국이 뜨겁습니다.' } }
```

- [ ] **Step 2: Verify word counts ≥ 20**

```bash
cd "C:/Users/pc/Desktop/japanese-learning"
node -e "
const fs = require('fs');
const html = fs.readFileSync('japanese.html', 'utf8');
const dataMatch = html.match(/<script id=\"DATA\">([\\s\\S]*?)<\\/script>/);
const dataCode = dataMatch[1];
global.window = {};
eval(dataCode);
const DATA = global.window.DATA || (function(){ /* eval direct */ return null; })();
" 2>&1
```

Or simpler - use node to parse and count:

```bash
cd "C:/Users/pc/Desktop/japanese-learning"
node -e "
const fs = require('fs');
const html = fs.readFileSync('japanese.html', 'utf8');
function extract(id) { const o='<script id=\"'+id+'\">'; const i=html.indexOf(o); if(i<0)return null; const j=html.indexOf('</script>',i); return html.substring(i+o.length,j); }
const dataCode = extract('DATA');
eval(dataCode);
DATA.topics.forEach(t => console.log(t.id, t.words.length));
"
```

All counts should be ≥ 20.

- [ ] **Step 3: Commit**

```bash
cd "C:/Users/pc/Desktop/japanese-learning"
git add japanese.html
git -c user.email=fridayam123@gmail.com -c user.name="Claude" commit -m "feat(v2): expand all topics to 20+ words"
```

---

## Task v2.6: Correct-answer sound effect

Add a short two-tone sound for correct answers using Web Audio API. No external files. No sound on wrong answers (per critic recommendation).

**Modify:** `UTILS` block, `MODE_QUIZ` handleChoice

**Steps:**

- [ ] **Step 1: Add `playCorrectSound` to UTILS**

Inside the UTILS IIFE, before the `return { ... }`, add:

```javascript
let audioCtx = null;
function playCorrectSound() {
  try {
    if (!audioCtx) {
      const Ctx = window.AudioContext || window.webkitAudioContext;
      if (!Ctx) return;
      audioCtx = new Ctx();
    }
    const now = audioCtx.currentTime;
    function tone(freq, start, dur) {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.frequency.value = freq;
      osc.type = 'sine';
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      gain.gain.setValueAtTime(0, now + start);
      gain.gain.linearRampToValueAtTime(0.18, now + start + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.001, now + start + dur);
      osc.start(now + start);
      osc.stop(now + start + dur);
    }
    tone(523.25, 0, 0.12);   // C5
    tone(659.25, 0.10, 0.16); // E5
  } catch (e) { /* ignore */ }
}
```

Update return: `return { shuffle, pickRandom, escapeHtml, playCorrectSound };`

- [ ] **Step 2: Call from quiz on correct answer**

In `MODE_QUIZ` `handleChoice`, immediately after `if (correct) state.score += 10;`, add:

```javascript
if (correct) window.JL.utils.playCorrectSound();
```

- [ ] **Step 3: Commit**

```bash
cd "C:/Users/pc/Desktop/japanese-learning"
git add japanese.html
git -c user.email=fridayam123@gmail.com -c user.name="Claude" commit -m "feat(v2): correct-answer sound effect (Web Audio API)"
```

---

## Final: tag v2.0

```bash
cd "C:/Users/pc/Desktop/japanese-learning"
git tag v2.0
```
