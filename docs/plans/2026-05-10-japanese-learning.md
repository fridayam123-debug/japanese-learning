# 일본어 학습 프로그램 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a single-file offline Japanese learning HTML app for an elementary student, with flashcard / quiz / conversation modes across 8 topics, including TTS pronunciation and localStorage progress.

**Architecture:** One self-contained `japanese.html` file (HTML + CSS + inline JS + JSON data). A second `test.html` runs unit tests for pure-logic modules (TTS guard, storage, shuffle, quiz generation). No build step, no external dependencies.

**Tech Stack:** Plain HTML5, CSS3, vanilla JavaScript (ES2020+). `window.speechSynthesis` for TTS. `localStorage` for persistence.

**Project location:** `C:\Users\pc\Desktop\japanese-learning\`

---

## File Structure

```
C:\Users\pc\Desktop\japanese-learning\
├── japanese.html          # Main app (HTML + CSS + JS + data)
├── test.html              # Browser-runnable unit tests for pure logic
├── README.md              # How to use
├── .gitignore
└── docs\
    ├── specs\2026-05-10-japanese-learning-design.md   # (already exists)
    └── plans\2026-05-10-japanese-learning.md          # this file
```

`japanese.html` is structured into clearly labeled `<script>` blocks acting as logical modules:
- **DATA** — topic/word/dialogue JSON
- **UTILS** — `shuffle`, `pickRandom`, `escapeHtml`
- **TTS** — `initTTS`, `speak`
- **STORAGE** — `loadProgress`, `saveProgress`, `bumpStat`
- **ROUTER** — screen show/hide, topic state
- **MODES** — `Flashcard`, `Quiz`, `Conversation` (each has `mount(container)` and own state)
- **MAIN** — wiring, initial render

---

## Task 1: Project setup, git init, skeleton HTML

**Files:**
- Create: `C:\Users\pc\Desktop\japanese-learning\japanese.html`
- Create: `C:\Users\pc\Desktop\japanese-learning\test.html`
- Create: `C:\Users\pc\Desktop\japanese-learning\README.md`
- Create: `C:\Users\pc\Desktop\japanese-learning\.gitignore`

- [ ] **Step 1: Initialize git repo**

```bash
cd "C:/Users/pc/Desktop/japanese-learning"
git init
```

Expected: `Initialized empty Git repository in C:/Users/pc/Desktop/japanese-learning/.git/`

- [ ] **Step 2: Create `.gitignore`**

Content:
```
.DS_Store
Thumbs.db
*.log
.vscode/
.idea/
```

- [ ] **Step 3: Create `README.md`**

Content:
```markdown
# 일본어 학습 (Japanese Learning)

초등학생용 단일 파일 일본어 학습 웹앱.

## 사용법
`japanese.html` 파일을 더블클릭하면 브라우저에서 열린다. 인터넷 연결 불필요.

## 기능
- **플래시카드** — 단어/예문 카드 넘기기, 발음 듣기
- **퀴즈** — 4지선다 10문제, 점수 기록
- **회화** — 상황별 대화 따라하기

## 주제
학교 / 음식 / 동물 / 가족 / 일상 / 숫자·시간 / 여행 / 요리

## 테스트
`test.html`을 브라우저에서 열면 자동으로 단위 테스트 실행, 결과를 화면에 출력.
```

- [ ] **Step 4: Create skeleton `japanese.html`**

Content:
```html
<!doctype html>
<html lang="ko">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1,user-scalable=no">
  <title>일본어 학습</title>
  <style>
    /* CSS will be added in later tasks */
    *, *::before, *::after { box-sizing: border-box; }
    body { margin: 0; font-family: -apple-system, "Segoe UI", "Noto Sans KR", sans-serif; background: #fff; color: #1a1a1a; }
  </style>
</head>
<body>
  <div id="app">로딩 중...</div>

  <!-- ===== DATA ===== -->
  <script id="DATA">
    const DATA = { topics: [] }; // filled in Task 2
  </script>

  <!-- ===== UTILS ===== -->
  <script id="UTILS">
    // filled in Task 3
  </script>

  <!-- ===== TTS ===== -->
  <script id="TTS">
    // filled in Task 3
  </script>

  <!-- ===== STORAGE ===== -->
  <script id="STORAGE">
    // filled in Task 3
  </script>

  <!-- ===== ROUTER ===== -->
  <script id="ROUTER">
    // filled in Task 4
  </script>

  <!-- ===== MODE: FLASHCARD ===== -->
  <script id="MODE_FLASHCARD">
    // filled in Task 5
  </script>

  <!-- ===== MODE: QUIZ ===== -->
  <script id="MODE_QUIZ">
    // filled in Task 6
  </script>

  <!-- ===== MODE: CONVERSATION ===== -->
  <script id="MODE_CONVERSATION">
    // filled in Task 7
  </script>

  <!-- ===== MAIN ===== -->
  <script id="MAIN">
    document.getElementById('app').textContent = '초기화 대기 중';
  </script>
</body>
</html>
```

- [ ] **Step 5: Create skeleton `test.html`**

Content:
```html
<!doctype html>
<html lang="ko">
<head>
  <meta charset="utf-8">
  <title>일본어 학습 - 테스트</title>
  <style>
    body { font-family: monospace; padding: 20px; }
    .pass { color: #2a8a2a; }
    .fail { color: #c33; font-weight: bold; }
    .summary { padding: 12px; margin-top: 16px; background: #f5f5f5; border-radius: 8px; }
  </style>
</head>
<body>
  <h1>테스트 결과</h1>
  <div id="results"></div>
  <div id="summary" class="summary"></div>

  <script>
    const tests = [];
    function test(name, fn) { tests.push({ name, fn }); }
    function assert(cond, msg) { if (!cond) throw new Error(msg || 'assertion failed'); }
    function assertEq(a, b, msg) {
      const sa = JSON.stringify(a), sb = JSON.stringify(b);
      if (sa !== sb) throw new Error(`${msg || 'assertEq'}: ${sa} !== ${sb}`);
    }
    window.test = test;
    window.assert = assert;
    window.assertEq = assertEq;
  </script>

  <!-- Tests will be added in later tasks via additional <script> blocks -->

  <script>
    window.addEventListener('load', () => {
      const results = document.getElementById('results');
      let passed = 0, failed = 0;
      for (const t of tests) {
        const div = document.createElement('div');
        try { t.fn(); div.className = 'pass'; div.textContent = `✓ ${t.name}`; passed++; }
        catch (e) { div.className = 'fail'; div.textContent = `✗ ${t.name} — ${e.message}`; failed++; }
        results.appendChild(div);
      }
      document.getElementById('summary').textContent = `통과 ${passed} / 실패 ${failed} / 총 ${tests.length}`;
    });
  </script>
</body>
</html>
```

- [ ] **Step 6: Verify both files open in browser**

Open `japanese.html` in a browser — should show "초기화 대기 중".
Open `test.html` — should show "통과 0 / 실패 0 / 총 0".

- [ ] **Step 7: Commit**

```bash
git add .
git commit -m "chore: scaffold project (japanese.html, test.html, README, .gitignore)"
```

---

## Task 2: Data — 8 topics with words, examples, dialogues

**Files:**
- Modify: `japanese.html` — replace the `DATA` script block contents

This is content-heavy but mechanical. Replace the DATA block with the full dataset below.

- [ ] **Step 1: Replace `DATA` script block in `japanese.html`**

Replace `const DATA = { topics: [] };` with the following:

```javascript
const DATA = {
  topics: [
    {
      id: 'school',
      name: '학교',
      words: [
        { kana: 'がっこう', kanji: '学校', meaning: '학교', example: { jp: 'がっこうへ いきます。', ko: '학교에 갑니다.' } },
        { kana: 'せんせい', kanji: '先生', meaning: '선생님', example: { jp: 'せんせいは やさしいです。', ko: '선생님은 친절합니다.' } },
        { kana: 'がくせい', kanji: '学生', meaning: '학생', example: { jp: 'わたしは がくせいです。', ko: '저는 학생입니다.' } },
        { kana: 'ともだち', kanji: '友達', meaning: '친구', example: { jp: 'ともだちと あそびます。', ko: '친구와 놉니다.' } },
        { kana: 'きょうしつ', kanji: '教室', meaning: '교실', example: { jp: 'きょうしつは ひろいです。', ko: '교실은 넓습니다.' } },
        { kana: 'ほん', kanji: '本', meaning: '책', example: { jp: 'ほんを よみます。', ko: '책을 읽습니다.' } },
        { kana: 'えんぴつ', kanji: '鉛筆', meaning: '연필', example: { jp: 'えんぴつで かきます。', ko: '연필로 씁니다.' } },
        { kana: 'けしごむ', kanji: '消しゴム', meaning: '지우개', example: { jp: 'けしごむを かしてください。', ko: '지우개를 빌려주세요.' } },
        { kana: 'つくえ', kanji: '机', meaning: '책상', example: { jp: 'つくえの うえに ほんが あります。', ko: '책상 위에 책이 있습니다.' } },
        { kana: 'いす', kanji: '椅子', meaning: '의자', example: { jp: 'いすに すわります。', ko: '의자에 앉습니다.' } },
        { kana: 'こくばん', kanji: '黒板', meaning: '칠판', example: { jp: 'こくばんを みます。', ko: '칠판을 봅니다.' } },
        { kana: 'しゅくだい', kanji: '宿題', meaning: '숙제', example: { jp: 'しゅくだいを します。', ko: '숙제를 합니다.' } },
        { kana: 'べんきょう', kanji: '勉強', meaning: '공부', example: { jp: 'にほんごを べんきょうします。', ko: '일본어를 공부합니다.' } },
        { kana: 'テスト', kanji: '', meaning: '시험', example: { jp: 'あした テストが あります。', ko: '내일 시험이 있습니다.' } },
        { kana: 'ノート', kanji: '', meaning: '노트', example: { jp: 'ノートに かきます。', ko: '노트에 씁니다.' } },
        { kana: 'かばん', kanji: '鞄', meaning: '가방', example: { jp: 'かばんが おもいです。', ko: '가방이 무겁습니다.' } },
        { kana: 'じゅぎょう', kanji: '授業', meaning: '수업', example: { jp: 'じゅぎょうが はじまります。', ko: '수업이 시작됩니다.' } },
        { kana: 'やすみ', kanji: '休み', meaning: '쉬는 시간', example: { jp: 'やすみじかんに あそびます。', ko: '쉬는 시간에 놉니다.' } }
      ],
      dialogues: [
        {
          scene: '학교에서',
          lines: [
            { jp: 'おはようございます。', ko: '안녕하세요(아침).' },
            { jp: 'おはよう。きょうも がんばろうね。', ko: '안녕. 오늘도 힘내자.' },
            { jp: 'しゅくだい、やってきた?', ko: '숙제 해 왔어?' },
            { jp: 'うん、やってきたよ。', ko: '응, 해 왔어.' },
            { jp: 'じゃあ、いっしょに みせて。', ko: '그럼 같이 보여줘.' }
          ]
        }
      ]
    },
    {
      id: 'food',
      name: '음식',
      words: [
        { kana: 'たべもの', kanji: '食べ物', meaning: '음식', example: { jp: 'たべものが おいしいです。', ko: '음식이 맛있습니다.' } },
        { kana: 'ごはん', kanji: 'ご飯', meaning: '밥', example: { jp: 'ごはんを たべます。', ko: '밥을 먹습니다.' } },
        { kana: 'パン', kanji: '', meaning: '빵', example: { jp: 'パンを かいます。', ko: '빵을 삽니다.' } },
        { kana: 'みず', kanji: '水', meaning: '물', example: { jp: 'みずを のみます。', ko: '물을 마십니다.' } },
        { kana: 'おちゃ', kanji: 'お茶', meaning: '차', example: { jp: 'おちゃが すきです。', ko: '차를 좋아합니다.' } },
        { kana: 'ぎゅうにゅう', kanji: '牛乳', meaning: '우유', example: { jp: 'ぎゅうにゅうを のみます。', ko: '우유를 마십니다.' } },
        { kana: 'りんご', kanji: '林檎', meaning: '사과', example: { jp: 'りんごは あかいです。', ko: '사과는 빨갛습니다.' } },
        { kana: 'みかん', kanji: '蜜柑', meaning: '귤', example: { jp: 'みかんは あまいです。', ko: '귤은 답니다.' } },
        { kana: 'にく', kanji: '肉', meaning: '고기', example: { jp: 'にくを やきます。', ko: '고기를 굽습니다.' } },
        { kana: 'さかな', kanji: '魚', meaning: '생선', example: { jp: 'さかなを たべます。', ko: '생선을 먹습니다.' } },
        { kana: 'たまご', kanji: '卵', meaning: '계란', example: { jp: 'たまごを やきます。', ko: '계란을 굽습니다.' } },
        { kana: 'やさい', kanji: '野菜', meaning: '채소', example: { jp: 'やさいは からだに いいです。', ko: '채소는 몸에 좋습니다.' } },
        { kana: 'くだもの', kanji: '果物', meaning: '과일', example: { jp: 'くだものが すきです。', ko: '과일을 좋아합니다.' } },
        { kana: 'おかし', kanji: 'お菓子', meaning: '과자', example: { jp: 'おかしを たべます。', ko: '과자를 먹습니다.' } },
        { kana: 'ラーメン', kanji: '', meaning: '라멘', example: { jp: 'ラーメンを たべたいです。', ko: '라멘을 먹고 싶습니다.' } },
        { kana: 'すし', kanji: '寿司', meaning: '초밥', example: { jp: 'すしは おいしいです。', ko: '초밥은 맛있습니다.' } },
        { kana: 'カレー', kanji: '', meaning: '카레', example: { jp: 'カレーが だいすきです。', ko: '카레를 정말 좋아합니다.' } },
        { kana: 'おいしい', kanji: '', meaning: '맛있다', example: { jp: 'これは おいしいです。', ko: '이것은 맛있습니다.' } }
      ],
      dialogues: [
        {
          scene: '식당에서',
          lines: [
            { jp: 'いらっしゃいませ。', ko: '어서 오세요.' },
            { jp: 'すみません、メニューを ください。', ko: '저기요, 메뉴 주세요.' },
            { jp: 'はい、どうぞ。', ko: '네, 여기요.' },
            { jp: 'ラーメンを ひとつ おねがいします。', ko: '라멘 하나 부탁합니다.' },
            { jp: 'かしこまりました。', ko: '알겠습니다.' }
          ]
        }
      ]
    },
    {
      id: 'animal',
      name: '동물',
      words: [
        { kana: 'いぬ', kanji: '犬', meaning: '개', example: { jp: 'いぬが はしります。', ko: '개가 달립니다.' } },
        { kana: 'ねこ', kanji: '猫', meaning: '고양이', example: { jp: 'ねこは かわいいです。', ko: '고양이는 귀엽습니다.' } },
        { kana: 'うさぎ', kanji: '兎', meaning: '토끼', example: { jp: 'うさぎが ぴょんぴょん とびます。', ko: '토끼가 깡충깡충 뜁니다.' } },
        { kana: 'とり', kanji: '鳥', meaning: '새', example: { jp: 'とりが そらを とびます。', ko: '새가 하늘을 납니다.' } },
        { kana: 'さかな', kanji: '魚', meaning: '물고기', example: { jp: 'さかなが およぎます。', ko: '물고기가 헤엄칩니다.' } },
        { kana: 'うま', kanji: '馬', meaning: '말', example: { jp: 'うまは はやいです。', ko: '말은 빠릅니다.' } },
        { kana: 'うし', kanji: '牛', meaning: '소', example: { jp: 'うしは おおきいです。', ko: '소는 큽니다.' } },
        { kana: 'ぶた', kanji: '豚', meaning: '돼지', example: { jp: 'ぶたは ピンクです。', ko: '돼지는 핑크색입니다.' } },
        { kana: 'ひつじ', kanji: '羊', meaning: '양', example: { jp: 'ひつじが くさを たべます。', ko: '양이 풀을 먹습니다.' } },
        { kana: 'ぞう', kanji: '象', meaning: '코끼리', example: { jp: 'ぞうの はなは ながいです。', ko: '코끼리 코는 깁니다.' } },
        { kana: 'きりん', kanji: '麒麟', meaning: '기린', example: { jp: 'きりんは くびが ながいです。', ko: '기린은 목이 깁니다.' } },
        { kana: 'ライオン', kanji: '', meaning: '사자', example: { jp: 'ライオンは つよいです。', ko: '사자는 강합니다.' } },
        { kana: 'パンダ', kanji: '', meaning: '판다', example: { jp: 'パンダは しろと くろです。', ko: '판다는 흰색과 검은색입니다.' } },
        { kana: 'さる', kanji: '猿', meaning: '원숭이', example: { jp: 'さるが きに のぼります。', ko: '원숭이가 나무에 오릅니다.' } },
        { kana: 'くま', kanji: '熊', meaning: '곰', example: { jp: 'くまは おおきいです。', ko: '곰은 큽니다.' } },
        { kana: 'ねずみ', kanji: '鼠', meaning: '쥐', example: { jp: 'ねずみは ちいさいです。', ko: '쥐는 작습니다.' } },
        { kana: 'ペンギン', kanji: '', meaning: '펭귄', example: { jp: 'ペンギンは およぎが じょうずです。', ko: '펭귄은 수영을 잘 합니다.' } }
      ],
      dialogues: [
        {
          scene: '동물원에서',
          lines: [
            { jp: 'みて、ぞうが いるよ!', ko: '봐, 코끼리가 있어!' },
            { jp: 'ほんとうだ、おおきいね。', ko: '정말이네, 크다.' },
            { jp: 'つぎは ライオンを みに いこう。', ko: '다음은 사자 보러 가자.' },
            { jp: 'うん、いこう!', ko: '응, 가자!' }
          ]
        }
      ]
    },
    {
      id: 'family',
      name: '가족',
      words: [
        { kana: 'かぞく', kanji: '家族', meaning: '가족', example: { jp: 'かぞくは よにんです。', ko: '가족은 네 명입니다.' } },
        { kana: 'おとうさん', kanji: 'お父さん', meaning: '아빠', example: { jp: 'おとうさんは やさしいです。', ko: '아빠는 다정합니다.' } },
        { kana: 'おかあさん', kanji: 'お母さん', meaning: '엄마', example: { jp: 'おかあさんは りょうりが じょうずです。', ko: '엄마는 요리를 잘 합니다.' } },
        { kana: 'おにいさん', kanji: 'お兄さん', meaning: '형/오빠', example: { jp: 'おにいさんは こうこうせいです。', ko: '형은 고등학생입니다.' } },
        { kana: 'おねえさん', kanji: 'お姉さん', meaning: '누나/언니', example: { jp: 'おねえさんは だいがくせいです。', ko: '누나는 대학생입니다.' } },
        { kana: 'おとうと', kanji: '弟', meaning: '남동생', example: { jp: 'おとうとは げんきです。', ko: '남동생은 활발합니다.' } },
        { kana: 'いもうと', kanji: '妹', meaning: '여동생', example: { jp: 'いもうとは かわいいです。', ko: '여동생은 귀엽습니다.' } },
        { kana: 'おじいさん', kanji: 'お祖父さん', meaning: '할아버지', example: { jp: 'おじいさんは げんきです。', ko: '할아버지는 건강하십니다.' } },
        { kana: 'おばあさん', kanji: 'お祖母さん', meaning: '할머니', example: { jp: 'おばあさんは やさしいです。', ko: '할머니는 다정하십니다.' } },
        { kana: 'おじさん', kanji: '', meaning: '삼촌', example: { jp: 'おじさんは おもしろいです。', ko: '삼촌은 재밌습니다.' } },
        { kana: 'おばさん', kanji: '', meaning: '이모/고모', example: { jp: 'おばさんは とおくに すんでいます。', ko: '이모는 멀리 살고 있습니다.' } },
        { kana: 'いとこ', kanji: '従兄弟', meaning: '사촌', example: { jp: 'いとこと あそびます。', ko: '사촌과 놉니다.' } },
        { kana: 'こども', kanji: '子供', meaning: '아이', example: { jp: 'こどもが ふたり います。', ko: '아이가 두 명 있습니다.' } },
        { kana: 'あかちゃん', kanji: '赤ちゃん', meaning: '아기', example: { jp: 'あかちゃんが ねています。', ko: '아기가 자고 있습니다.' } },
        { kana: 'りょうしん', kanji: '両親', meaning: '부모님', example: { jp: 'りょうしんを あいしています。', ko: '부모님을 사랑합니다.' } }
      ],
      dialogues: [
        {
          scene: '가족 소개',
          lines: [
            { jp: 'これは わたしの かぞくです。', ko: '이쪽은 우리 가족입니다.' },
            { jp: 'おとうさんと おかあさんと いもうとです。', ko: '아빠와 엄마와 여동생입니다.' },
            { jp: 'なんにん かぞくですか。', ko: '몇 명 가족이에요?' },
            { jp: 'よにん かぞくです。', ko: '네 명 가족입니다.' }
          ]
        }
      ]
    },
    {
      id: 'daily',
      name: '일상',
      words: [
        { kana: 'おはよう', kanji: '', meaning: '안녕(아침)', example: { jp: 'おはようございます。', ko: '좋은 아침입니다.' } },
        { kana: 'こんにちは', kanji: '', meaning: '안녕(낮)', example: { jp: 'こんにちは、げんきですか。', ko: '안녕하세요, 잘 지내세요?' } },
        { kana: 'こんばんは', kanji: '', meaning: '안녕(저녁)', example: { jp: 'こんばんは。', ko: '좋은 저녁입니다.' } },
        { kana: 'おやすみ', kanji: '', meaning: '잘 자', example: { jp: 'おやすみなさい。', ko: '안녕히 주무세요.' } },
        { kana: 'ありがとう', kanji: '', meaning: '고마워', example: { jp: 'ありがとうございます。', ko: '감사합니다.' } },
        { kana: 'すみません', kanji: '', meaning: '죄송/저기요', example: { jp: 'すみません、ちょっと。', ko: '저기요, 잠시만요.' } },
        { kana: 'はい', kanji: '', meaning: '네', example: { jp: 'はい、わかりました。', ko: '네, 알겠습니다.' } },
        { kana: 'いいえ', kanji: '', meaning: '아니요', example: { jp: 'いいえ、ちがいます。', ko: '아니요, 아닙니다.' } },
        { kana: 'いえ', kanji: '家', meaning: '집', example: { jp: 'いえに かえります。', ko: '집에 돌아갑니다.' } },
        { kana: 'みち', kanji: '道', meaning: '길', example: { jp: 'みちが ながいです。', ko: '길이 깁니다.' } },
        { kana: 'くるま', kanji: '車', meaning: '자동차', example: { jp: 'くるまで いきます。', ko: '차로 갑니다.' } },
        { kana: 'でんしゃ', kanji: '電車', meaning: '전철', example: { jp: 'でんしゃに のります。', ko: '전철을 탑니다.' } },
        { kana: 'バス', kanji: '', meaning: '버스', example: { jp: 'バスを まちます。', ko: '버스를 기다립니다.' } },
        { kana: 'てんき', kanji: '天気', meaning: '날씨', example: { jp: 'きょうの てんきは いいです。', ko: '오늘 날씨가 좋습니다.' } },
        { kana: 'あめ', kanji: '雨', meaning: '비', example: { jp: 'あめが ふります。', ko: '비가 옵니다.' } },
        { kana: 'はれ', kanji: '晴れ', meaning: '맑음', example: { jp: 'きょうは はれです。', ko: '오늘은 맑습니다.' } }
      ],
      dialogues: [
        {
          scene: '인사하기',
          lines: [
            { jp: 'こんにちは!', ko: '안녕하세요!' },
            { jp: 'こんにちは、おげんきですか。', ko: '안녕하세요, 잘 지내세요?' },
            { jp: 'はい、げんきです。', ko: '네, 잘 지냅니다.' },
            { jp: 'それは よかったです。', ko: '그거 다행입니다.' }
          ]
        }
      ]
    },
    {
      id: 'numbers_time',
      name: '숫자·시간',
      words: [
        { kana: 'いち', kanji: '一', meaning: '하나', example: { jp: 'いちまい ください。', ko: '한 장 주세요.' } },
        { kana: 'に', kanji: '二', meaning: '둘', example: { jp: 'にひき います。', ko: '두 마리 있습니다.' } },
        { kana: 'さん', kanji: '三', meaning: '셋', example: { jp: 'さんねんせいです。', ko: '3학년입니다.' } },
        { kana: 'よん', kanji: '四', meaning: '넷', example: { jp: 'よにん かぞくです。', ko: '네 명 가족입니다.' } },
        { kana: 'ご', kanji: '五', meaning: '다섯', example: { jp: 'ごじに あいましょう。', ko: '5시에 만납시다.' } },
        { kana: 'ろく', kanji: '六', meaning: '여섯', example: { jp: 'ろくじに おきます。', ko: '6시에 일어납니다.' } },
        { kana: 'なな', kanji: '七', meaning: '일곱', example: { jp: 'ななじに ねます。', ko: '7시에 잡니다.' } },
        { kana: 'はち', kanji: '八', meaning: '여덟', example: { jp: 'はちじから べんきょうします。', ko: '8시부터 공부합니다.' } },
        { kana: 'きゅう', kanji: '九', meaning: '아홉', example: { jp: 'きゅうじに ねます。', ko: '9시에 잡니다.' } },
        { kana: 'じゅう', kanji: '十', meaning: '열', example: { jp: 'じゅっぷん まってください。', ko: '10분 기다려 주세요.' } },
        { kana: 'いま', kanji: '今', meaning: '지금', example: { jp: 'いま なんじですか。', ko: '지금 몇 시예요?' } },
        { kana: 'じかん', kanji: '時間', meaning: '시간', example: { jp: 'じかんが ありません。', ko: '시간이 없습니다.' } },
        { kana: 'あさ', kanji: '朝', meaning: '아침', example: { jp: 'あさ ごはんを たべます。', ko: '아침밥을 먹습니다.' } },
        { kana: 'ひる', kanji: '昼', meaning: '낮/점심', example: { jp: 'ひるごはんは パンです。', ko: '점심은 빵입니다.' } },
        { kana: 'よる', kanji: '夜', meaning: '밤', example: { jp: 'よるは しずかです。', ko: '밤은 조용합니다.' } },
        { kana: 'きょう', kanji: '今日', meaning: '오늘', example: { jp: 'きょうは げつようびです。', ko: '오늘은 월요일입니다.' } },
        { kana: 'あした', kanji: '明日', meaning: '내일', example: { jp: 'あした あいましょう。', ko: '내일 만납시다.' } },
        { kana: 'きのう', kanji: '昨日', meaning: '어제', example: { jp: 'きのうは あめでした。', ko: '어제는 비가 왔습니다.' } }
      ],
      dialogues: [
        {
          scene: '시간 묻기',
          lines: [
            { jp: 'すみません、いま なんじですか。', ko: '저기요, 지금 몇 시예요?' },
            { jp: 'さんじはんです。', ko: '3시 반입니다.' },
            { jp: 'ありがとうございます。', ko: '감사합니다.' },
            { jp: 'どういたしまして。', ko: '천만에요.' }
          ]
        }
      ]
    },
    {
      id: 'travel',
      name: '여행',
      words: [
        { kana: 'りょこう', kanji: '旅行', meaning: '여행', example: { jp: 'にほんへ りょこうに いきます。', ko: '일본으로 여행을 갑니다.' } },
        { kana: 'ひこうき', kanji: '飛行機', meaning: '비행기', example: { jp: 'ひこうきに のります。', ko: '비행기를 탑니다.' } },
        { kana: 'くうこう', kanji: '空港', meaning: '공항', example: { jp: 'くうこうに つきました。', ko: '공항에 도착했습니다.' } },
        { kana: 'えき', kanji: '駅', meaning: '역', example: { jp: 'えきで まちます。', ko: '역에서 기다립니다.' } },
        { kana: 'ホテル', kanji: '', meaning: '호텔', example: { jp: 'ホテルに とまります。', ko: '호텔에 묵습니다.' } },
        { kana: 'きっぷ', kanji: '切符', meaning: '표', example: { jp: 'きっぷを かいます。', ko: '표를 삽니다.' } },
        { kana: 'パスポート', kanji: '', meaning: '여권', example: { jp: 'パスポートを みせてください。', ko: '여권을 보여주세요.' } },
        { kana: 'にもつ', kanji: '荷物', meaning: '짐', example: { jp: 'にもつが おおいです。', ko: '짐이 많습니다.' } },
        { kana: 'カメラ', kanji: '', meaning: '카메라', example: { jp: 'カメラで しゃしんを とります。', ko: '카메라로 사진을 찍습니다.' } },
        { kana: 'しゃしん', kanji: '写真', meaning: '사진', example: { jp: 'しゃしんを とりましょう。', ko: '사진을 찍읍시다.' } },
        { kana: 'ちず', kanji: '地図', meaning: '지도', example: { jp: 'ちずを みます。', ko: '지도를 봅니다.' } },
        { kana: 'おみやげ', kanji: 'お土産', meaning: '기념품/선물', example: { jp: 'おみやげを かいます。', ko: '기념품을 삽니다.' } },
        { kana: 'うみ', kanji: '海', meaning: '바다', example: { jp: 'うみが きれいです。', ko: '바다가 예쁩니다.' } },
        { kana: 'やま', kanji: '山', meaning: '산', example: { jp: 'やまに のぼります。', ko: '산에 오릅니다.' } },
        { kana: 'まち', kanji: '町', meaning: '동네/도시', example: { jp: 'まちを あるきます。', ko: '동네를 걷습니다.' } },
        { kana: 'おんせん', kanji: '温泉', meaning: '온천', example: { jp: 'おんせんに はいります。', ko: '온천에 들어갑니다.' } }
      ],
      dialogues: [
        {
          scene: '길 묻기',
          lines: [
            { jp: 'すみません、えきは どこですか。', ko: '저기요, 역은 어디예요?' },
            { jp: 'まっすぐ いって、みぎに まがってください。', ko: '곧장 가서 오른쪽으로 도세요.' },
            { jp: 'どのくらい かかりますか。', ko: '얼마나 걸려요?' },
            { jp: 'ごふんぐらいです。', ko: '5분 정도예요.' },
            { jp: 'ありがとうございます。', ko: '감사합니다.' }
          ]
        }
      ]
    },
    {
      id: 'cooking',
      name: '요리',
      words: [
        { kana: 'りょうり', kanji: '料理', meaning: '요리', example: { jp: 'りょうりを つくります。', ko: '요리를 만듭니다.' } },
        { kana: 'なべ', kanji: '鍋', meaning: '냄비', example: { jp: 'なべに みずを いれます。', ko: '냄비에 물을 넣습니다.' } },
        { kana: 'フライパン', kanji: '', meaning: '프라이팬', example: { jp: 'フライパンで やきます。', ko: '프라이팬으로 굽습니다.' } },
        { kana: 'ほうちょう', kanji: '包丁', meaning: '식칼', example: { jp: 'ほうちょうで きります。', ko: '칼로 자릅니다.' } },
        { kana: 'まないた', kanji: 'まな板', meaning: '도마', example: { jp: 'まないたの うえで きります。', ko: '도마 위에서 자릅니다.' } },
        { kana: 'おさら', kanji: 'お皿', meaning: '접시', example: { jp: 'おさらに もります。', ko: '접시에 담습니다.' } },
        { kana: 'コップ', kanji: '', meaning: '컵', example: { jp: 'コップに みずを いれます。', ko: '컵에 물을 넣습니다.' } },
        { kana: 'はし', kanji: '箸', meaning: '젓가락', example: { jp: 'はしで たべます。', ko: '젓가락으로 먹습니다.' } },
        { kana: 'スプーン', kanji: '', meaning: '숟가락', example: { jp: 'スプーンで すくいます。', ko: '숟가락으로 뜹니다.' } },
        { kana: 'しお', kanji: '塩', meaning: '소금', example: { jp: 'しおを いれます。', ko: '소금을 넣습니다.' } },
        { kana: 'さとう', kanji: '砂糖', meaning: '설탕', example: { jp: 'さとうを すこし いれます。', ko: '설탕을 조금 넣습니다.' } },
        { kana: 'しょうゆ', kanji: '醤油', meaning: '간장', example: { jp: 'しょうゆを かけます。', ko: '간장을 뿌립니다.' } },
        { kana: 'やく', kanji: '焼く', meaning: '굽다', example: { jp: 'にくを やきます。', ko: '고기를 굽습니다.' } },
        { kana: 'にる', kanji: '煮る', meaning: '삶다', example: { jp: 'やさいを にます。', ko: '채소를 삶습니다.' } },
        { kana: 'きる', kanji: '切る', meaning: '자르다', example: { jp: 'パンを きります。', ko: '빵을 자릅니다.' } },
        { kana: 'まぜる', kanji: '混ぜる', meaning: '섞다', example: { jp: 'たまごを まぜます。', ko: '계란을 섞습니다.' } },
        { kana: 'あらう', kanji: '洗う', meaning: '씻다', example: { jp: 'やさいを あらいます。', ko: '채소를 씻습니다.' } }
      ],
      dialogues: [
        {
          scene: '요리하기',
          lines: [
            { jp: 'なにを つくる?', ko: '뭐 만들 거야?' },
            { jp: 'カレーを つくろう!', ko: '카레 만들자!' },
            { jp: 'やさいを きってね。', ko: '채소를 잘라줘.' },
            { jp: 'うん、わかった。', ko: '응, 알겠어.' },
            { jp: 'おいしく できますように。', ko: '맛있게 됐으면 좋겠다.' }
          ]
        }
      ]
    }
  ]
};

DATA.findTopic = function (id) { return DATA.topics.find(t => t.id === id); };
```

- [ ] **Step 2: Verify in browser**

Open `japanese.html`. Open DevTools Console. Type `DATA.topics.length` — should show `8`. Type `DATA.findTopic('food').words.length` — should show `18`.

- [ ] **Step 3: Commit**

```bash
git add japanese.html
git commit -m "feat(data): 8 topics with words/examples/dialogues"
```

---

## Task 3: Utils, TTS, Storage modules + their tests

**Files:**
- Modify: `japanese.html` — fill `UTILS`, `TTS`, `STORAGE` script blocks
- Modify: `test.html` — add unit tests for these modules

- [ ] **Step 1: Write failing tests in `test.html`**

Add this `<script>` block right before the final `<script>` block (the one with `window.addEventListener('load', ...)`):

```html
<script>
  // ========== UTILS tests ==========
  test('shuffle: returns array of same length', () => {
    const a = [1, 2, 3, 4, 5];
    const b = window.JL.utils.shuffle(a);
    assertEq(b.length, a.length);
  });

  test('shuffle: contains same elements', () => {
    const a = [1, 2, 3, 4, 5];
    const b = window.JL.utils.shuffle(a).slice().sort();
    assertEq(b, [1, 2, 3, 4, 5]);
  });

  test('shuffle: does not mutate input', () => {
    const a = [1, 2, 3, 4, 5];
    window.JL.utils.shuffle(a);
    assertEq(a, [1, 2, 3, 4, 5]);
  });

  test('pickRandom: count <= length returns count items', () => {
    const r = window.JL.utils.pickRandom([1, 2, 3, 4, 5], 3);
    assertEq(r.length, 3);
  });

  test('pickRandom: count > length returns all items', () => {
    const r = window.JL.utils.pickRandom([1, 2], 5);
    assertEq(r.length, 2);
  });

  test('escapeHtml: escapes special chars', () => {
    assertEq(window.JL.utils.escapeHtml('<a&b>'), '&lt;a&amp;b&gt;');
  });

  // ========== STORAGE tests ==========
  test('storage: round-trip save/load', () => {
    localStorage.removeItem('jp.test_progress');
    window.JL.storage._setKey('jp.test_progress');
    window.JL.storage.saveProgress({ flashcardsViewed: 5, quizHighScore: 80 });
    const p = window.JL.storage.loadProgress();
    assertEq(p.flashcardsViewed, 5);
    assertEq(p.quizHighScore, 80);
    localStorage.removeItem('jp.test_progress');
    window.JL.storage._setKey('jp.progress'); // reset
  });

  test('storage: load returns defaults when empty', () => {
    localStorage.removeItem('jp.test_progress2');
    window.JL.storage._setKey('jp.test_progress2');
    const p = window.JL.storage.loadProgress();
    assertEq(p.flashcardsViewed, 0);
    assertEq(p.quizHighScore, 0);
    localStorage.removeItem('jp.test_progress2');
    window.JL.storage._setKey('jp.progress');
  });

  test('storage: bumpStat increments counter', () => {
    localStorage.removeItem('jp.test_bump');
    window.JL.storage._setKey('jp.test_bump');
    window.JL.storage.bumpStat('flashcardsViewed');
    window.JL.storage.bumpStat('flashcardsViewed');
    const p = window.JL.storage.loadProgress();
    assertEq(p.flashcardsViewed, 2);
    localStorage.removeItem('jp.test_bump');
    window.JL.storage._setKey('jp.progress');
  });

  // ========== TTS tests ==========
  test('TTS: speak does not throw with empty string', () => {
    window.JL.tts.speak('');
  });

  test('TTS: isAvailable returns boolean', () => {
    const v = window.JL.tts.isAvailable();
    assert(typeof v === 'boolean');
  });
</script>
```

For `test.html` to access these modules, we need to load `japanese.html`'s relevant scripts. Simplest: copy the modules directly into `test.html`. Since these scripts only define `window.JL.*`, copy the same code into `test.html`. We'll add the utility/TTS/storage script blocks to test.html in Step 4.

- [ ] **Step 2: Run tests to verify they fail**

Open `test.html` in browser. Expected: all 11 tests fail (because `window.JL` is undefined).

- [ ] **Step 3: Implement UTILS in `japanese.html`**

Replace the `UTILS` script block content with:

```javascript
window.JL = window.JL || {};
window.JL.utils = (function () {
  function shuffle(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  function pickRandom(arr, count) {
    return shuffle(arr).slice(0, Math.min(count, arr.length));
  }

  function escapeHtml(s) {
    return String(s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  return { shuffle, pickRandom, escapeHtml };
})();
```

- [ ] **Step 4: Implement TTS in `japanese.html`**

Replace the `TTS` script block content with:

```javascript
window.JL = window.JL || {};
window.JL.tts = (function () {
  let jaVoice = null;
  let voicesLoaded = false;

  function loadVoices() {
    if (!('speechSynthesis' in window)) return;
    const voices = speechSynthesis.getVoices();
    jaVoice = voices.find(v => v.lang && v.lang.toLowerCase().startsWith('ja')) || null;
    if (voices.length > 0) voicesLoaded = true;
  }

  if ('speechSynthesis' in window) {
    loadVoices();
    speechSynthesis.onvoiceschanged = loadVoices;
  }

  function isAvailable() {
    return 'speechSynthesis' in window && (jaVoice !== null || !voicesLoaded);
  }

  function speak(text) {
    if (!text || !('speechSynthesis' in window)) return;
    try {
      speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.lang = 'ja-JP';
      if (jaVoice) u.voice = jaVoice;
      u.rate = 0.9;
      u.pitch = 1.0;
      speechSynthesis.speak(u);
    } catch (e) {
      console.warn('TTS error:', e);
    }
  }

  return { speak, isAvailable };
})();
```

- [ ] **Step 5: Implement STORAGE in `japanese.html`**

Replace the `STORAGE` script block content with:

```javascript
window.JL = window.JL || {};
window.JL.storage = (function () {
  let KEY = 'jp.progress';
  const DEFAULTS = {
    flashcardsViewed: 0,
    quizHighScore: 0,
    lastStudied: null,
    selectedTopic: 'school'
  };

  function loadProgress() {
    try {
      const raw = localStorage.getItem(KEY);
      if (!raw) return { ...DEFAULTS };
      return { ...DEFAULTS, ...JSON.parse(raw) };
    } catch (e) {
      return { ...DEFAULTS };
    }
  }

  function saveProgress(partial) {
    try {
      const current = loadProgress();
      const next = { ...current, ...partial, lastStudied: new Date().toISOString().slice(0, 10) };
      localStorage.setItem(KEY, JSON.stringify(next));
      return next;
    } catch (e) {
      console.warn('Storage save error:', e);
      return loadProgress();
    }
  }

  function bumpStat(field, delta) {
    const d = typeof delta === 'number' ? delta : 1;
    const current = loadProgress();
    const updated = { [field]: (current[field] || 0) + d };
    return saveProgress(updated);
  }

  function _setKey(k) { KEY = k; } // for tests

  return { loadProgress, saveProgress, bumpStat, _setKey };
})();
```

- [ ] **Step 6: Mirror UTILS/TTS/STORAGE blocks into `test.html`**

In `test.html`, before the test definition `<script>` block, add three `<script>` blocks containing exact copies of the three module implementations from Steps 3-5 above. (Engineer copies the exact code from those steps.)

- [ ] **Step 7: Reload `test.html` in browser**

Expected: all 11 tests pass. Summary: `통과 11 / 실패 0 / 총 11`.

If any fail, fix the implementation and rerun until all pass.

- [ ] **Step 8: Commit**

```bash
git add japanese.html test.html
git commit -m "feat: utils/tts/storage modules with unit tests"
```

---

## Task 4: Router + Main screen (mode select, topic dropdown, stats)

**Files:**
- Modify: `japanese.html` — fill `ROUTER`, `MAIN` blocks, add CSS

- [ ] **Step 1: Add CSS to `japanese.html` `<style>` block**

Replace the existing `<style>` block content with:

```css
*, *::before, *::after { box-sizing: border-box; }

:root {
  --bg: #ffffff;
  --fg: #1a1a1a;
  --muted: #6b6b6b;
  --accent: #7BAFD4;
  --accent-dark: #5b8eb1;
  --border: #e5e5e5;
  --soft: #f7f9fb;
  --success: #2a8a2a;
  --error: #c4453d;
  --radius: 16px;
  --shadow: 0 2px 12px rgba(0,0,0,0.06);
}

body {
  margin: 0;
  font-family: -apple-system, "Segoe UI", "Noto Sans KR", sans-serif;
  background: var(--bg);
  color: var(--fg);
  -webkit-font-smoothing: antialiased;
}

#app { min-height: 100vh; max-width: 960px; margin: 0 auto; padding: 24px; }

.jp-text { font-family: "Hiragino Mincho ProN", "Yu Mincho", "Meiryo", "MS Gothic", serif; }

header.app-header {
  display: flex; align-items: center; justify-content: space-between;
  padding-bottom: 16px; border-bottom: 1px solid var(--border); margin-bottom: 24px;
}
header.app-header h1 { font-size: 22px; margin: 0; letter-spacing: -0.01em; }

.topic-select {
  font-size: 18px; padding: 12px 16px; border: 1.5px solid var(--border);
  border-radius: 12px; background: #fff; min-height: 48px;
}

.mode-grid {
  display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin: 24px 0;
}
.mode-card {
  background: var(--soft); border: 1.5px solid var(--border); border-radius: var(--radius);
  padding: 32px 16px; text-align: center; cursor: pointer; transition: transform .12s, border-color .12s, background .12s;
  min-height: 140px; display: flex; flex-direction: column; justify-content: center; gap: 8px;
}
.mode-card:hover, .mode-card:active {
  border-color: var(--accent); background: #fff; transform: translateY(-2px);
}
.mode-card .label { font-size: 22px; font-weight: 600; }
.mode-card .desc { font-size: 14px; color: var(--muted); }

.stats { display: flex; gap: 24px; padding: 16px; background: var(--soft); border-radius: var(--radius); }
.stats .stat { font-size: 15px; color: var(--muted); }
.stats .stat strong { color: var(--fg); font-size: 18px; margin-left: 8px; }

.btn {
  appearance: none; border: 1.5px solid var(--border); background: #fff; color: var(--fg);
  padding: 12px 20px; font-size: 16px; border-radius: 12px; cursor: pointer;
  min-height: 48px; min-width: 64px; transition: all .12s;
}
.btn:hover, .btn:active { border-color: var(--accent); }
.btn-primary { background: var(--accent); color: #fff; border-color: var(--accent); }
.btn-primary:hover { background: var(--accent-dark); border-color: var(--accent-dark); }

.back-link { display: inline-block; margin-bottom: 16px; color: var(--muted); cursor: pointer; font-size: 15px; }
.back-link:hover { color: var(--fg); }

@media (max-width: 600px) {
  .mode-grid { grid-template-columns: 1fr; }
  header.app-header { flex-direction: column; align-items: stretch; gap: 12px; }
}
```

- [ ] **Step 2: Implement ROUTER**

Replace the `ROUTER` script block content with:

```javascript
window.JL = window.JL || {};
window.JL.router = (function () {
  let currentTopic = null;
  let currentMode = null;

  function getTopic() { return currentTopic; }
  function setTopic(id) {
    currentTopic = id;
    window.JL.storage.saveProgress({ selectedTopic: id });
    if (currentMode === 'main') renderMain();
  }

  function show(modeName) {
    currentMode = modeName;
    const root = document.getElementById('app');
    if (modeName === 'main') return renderMain();
    if (modeName === 'flashcard') return window.JL.modes.flashcard.mount(root, getTopicData());
    if (modeName === 'quiz') return window.JL.modes.quiz.mount(root, getTopicData());
    if (modeName === 'conversation') return window.JL.modes.conversation.mount(root, getTopicData());
  }

  function getTopicData() {
    return DATA.findTopic(currentTopic);
  }

  function renderMain() {
    currentMode = 'main';
    const root = document.getElementById('app');
    const progress = window.JL.storage.loadProgress();
    const u = window.JL.utils;

    const topicOptions = DATA.topics.map(t =>
      `<option value="${u.escapeHtml(t.id)}"${t.id === currentTopic ? ' selected' : ''}>${u.escapeHtml(t.name)}</option>`
    ).join('');

    root.innerHTML = `
      <header class="app-header">
        <h1>일본어 학습</h1>
        <select class="topic-select" id="topicSelect">${topicOptions}</select>
      </header>

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

    document.getElementById('topicSelect').addEventListener('change', e => setTopic(e.target.value));
    root.querySelectorAll('.mode-card').forEach(el => {
      el.addEventListener('click', () => show(el.dataset.mode));
    });
  }

  return { show, getTopic, setTopic, renderMain };
})();
```

- [ ] **Step 3: Implement MAIN bootstrap**

Replace the `MAIN` script block content with:

```javascript
(function init() {
  window.JL = window.JL || {};
  window.JL.modes = window.JL.modes || {};
  // Stub modes so renderMain doesn't crash before Tasks 5-7
  ['flashcard', 'quiz', 'conversation'].forEach(name => {
    if (!window.JL.modes[name]) {
      window.JL.modes[name] = {
        mount(root) {
          root.innerHTML = `
            <span class="back-link" id="back">← 메인으로</span>
            <h2>${name} 모드 준비 중...</h2>
          `;
          document.getElementById('back').addEventListener('click', () => window.JL.router.renderMain());
        }
      };
    }
  });

  const progress = window.JL.storage.loadProgress();
  window.JL.router.setTopic(progress.selectedTopic || 'school');
  window.JL.router.show('main');
})();
```

- [ ] **Step 4: Verify in browser**

Open `japanese.html`. Expected:
- "일본어 학습" header
- Topic dropdown with 8 options (학교 first)
- Three mode cards visible
- Stats row at bottom showing 0 / 0 / -

Click a mode card → see "X 모드 준비 중..." with back link. Click back → returns to main.

Change topic dropdown → reloads main with new selection persisted (refresh page → still selected).

- [ ] **Step 5: Commit**

```bash
git add japanese.html
git commit -m "feat: router + main screen (mode select, topic, stats)"
```

---

## Task 5: Flashcard mode

**Files:**
- Modify: `japanese.html` — fill `MODE_FLASHCARD` block, add CSS

- [ ] **Step 1: Append CSS to existing `<style>` block**

Add at the end of the `<style>` block (before `</style>`):

```css
.flashcard-screen { display: flex; flex-direction: column; align-items: center; gap: 16px; }
.flashcard-screen .topic-name { font-size: 16px; color: var(--muted); }

.flashcard {
  width: 100%; max-width: 600px; min-height: 360px;
  background: #fff; border: 1.5px solid var(--border); border-radius: var(--radius);
  box-shadow: var(--shadow); padding: 40px 32px; cursor: pointer;
  display: flex; flex-direction: column; justify-content: center; align-items: center; gap: 16px;
  user-select: none; transition: transform .15s, border-color .15s;
}
.flashcard:active { transform: scale(0.99); border-color: var(--accent); }
.flashcard .kanji { font-size: 24px; color: var(--muted); }
.flashcard .kana { font-size: 56px; font-weight: 500; letter-spacing: 0.02em; }
.flashcard .meaning { font-size: 32px; color: var(--accent-dark); font-weight: 600; }
.flashcard .example-jp { font-size: 22px; text-align: center; }
.flashcard .example-ko { font-size: 16px; color: var(--muted); }
.flashcard .speak-btn {
  appearance: none; border: 1.5px solid var(--border); background: #fff;
  width: 56px; height: 56px; border-radius: 50%; cursor: pointer; font-size: 22px;
}
.flashcard .speak-btn:active { background: var(--soft); }
.flashcard-hint { font-size: 13px; color: var(--muted); }

.flashcard-nav { display: flex; gap: 12px; align-items: center; margin-top: 8px; }
.flashcard-progress { font-size: 16px; color: var(--muted); min-width: 80px; text-align: center; }

@media (max-width: 600px) {
  .flashcard .kana { font-size: 44px; }
  .flashcard .meaning { font-size: 26px; }
  .flashcard .example-jp { font-size: 18px; }
}
```

- [ ] **Step 2: Implement FLASHCARD mode**

Replace the `MODE_FLASHCARD` script block content with:

```javascript
window.JL = window.JL || {};
window.JL.modes = window.JL.modes || {};
window.JL.modes.flashcard = (function () {
  let state = { topic: null, idx: 0, flipped: false };

  function mount(root, topic) {
    state = { topic, idx: 0, flipped: false };
    render(root);
  }

  function render(root) {
    const t = state.topic;
    const w = t.words[state.idx];
    const u = window.JL.utils;
    const total = t.words.length;

    root.innerHTML = `
      <span class="back-link" id="back">← 메인으로</span>
      <div class="flashcard-screen">
        <div class="topic-name">${u.escapeHtml(t.name)} · ${state.idx + 1} / ${total}</div>
        <div class="flashcard" id="card">
          ${state.flipped ? renderBack(w, u) : renderFront(w, u)}
        </div>
        <div class="flashcard-hint">${state.flipped ? '카드를 다시 누르면 앞면' : '카드를 누르면 뜻이 보여요'}</div>
        <div class="flashcard-nav">
          <button class="btn" id="prev">← 이전</button>
          <div class="flashcard-progress">${state.idx + 1} / ${total}</div>
          <button class="btn btn-primary" id="next">다음 →</button>
        </div>
      </div>
    `;

    document.getElementById('back').addEventListener('click', () => window.JL.router.renderMain());

    document.getElementById('card').addEventListener('click', e => {
      // ignore clicks on speaker buttons
      if (e.target.closest('.speak-btn')) return;
      state.flipped = !state.flipped;
      if (!state.flipped) {
        // viewed once when flipping back to front (i.e., done with card)
      }
      render(root);
    });

    root.querySelectorAll('.speak-btn').forEach(b => {
      b.addEventListener('click', e => {
        e.stopPropagation();
        window.JL.tts.speak(b.dataset.text);
      });
    });

    document.getElementById('prev').addEventListener('click', e => {
      e.stopPropagation();
      state.idx = (state.idx - 1 + total) % total;
      state.flipped = false;
      render(root);
    });

    document.getElementById('next').addEventListener('click', e => {
      e.stopPropagation();
      window.JL.storage.bumpStat('flashcardsViewed');
      state.idx = (state.idx + 1) % total;
      state.flipped = false;
      render(root);
    });
  }

  function renderFront(w, u) {
    const kanjiLine = w.kanji ? `<div class="kanji">${u.escapeHtml(w.kanji)}</div>` : '';
    return `
      ${kanjiLine}
      <div class="kana jp-text">${u.escapeHtml(w.kana)}</div>
      <button class="speak-btn" data-text="${u.escapeHtml(w.kana)}" aria-label="발음 듣기">🔊</button>
    `;
  }

  function renderBack(w, u) {
    return `
      <div class="meaning">${u.escapeHtml(w.meaning)}</div>
      <div class="example-jp jp-text">${u.escapeHtml(w.example.jp)}</div>
      <div class="example-ko">${u.escapeHtml(w.example.ko)}</div>
      <button class="speak-btn" data-text="${u.escapeHtml(w.example.jp)}" aria-label="예문 발음">🔊</button>
    `;
  }

  return { mount };
})();
```

- [ ] **Step 3: Verify in browser**

Open `japanese.html`. Click `플래시카드` card. Expected:
- Header showing "학교 · 1 / 18"
- Card with kanji "学校" small, hiragana "がっこう" big, speaker button
- Click card → flip to "학교" + example sentence + speaker
- Click `다음 →` → next word, counter updates, flashcardsViewed in localStorage increments
- Click `← 이전` → wraps backward
- Click 🔊 → hear Japanese pronunciation (if Japanese voice available)
- Click `← 메인으로` → back to main, "학습한 카드" stat updated

- [ ] **Step 4: Commit**

```bash
git add japanese.html
git commit -m "feat: flashcard mode with flip + TTS"
```

---

## Task 6: Quiz mode

**Files:**
- Modify: `japanese.html` — fill `MODE_QUIZ` block, add CSS
- Modify: `test.html` — add tests for quiz question generation

- [ ] **Step 1: Add quiz question generation tests to `test.html`**

Add inside the existing test `<script>` block (the one with `// ========== UTILS tests ==========`):

```javascript
// ========== QUIZ tests ==========
test('quiz: buildQuestions returns 10 questions when topic has >= 10 words', () => {
  const topic = { words: Array.from({length: 18}, (_, i) => ({
    kana: 'k'+i, kanji: '', meaning: 'm'+i, example: { jp: '', ko: '' }
  })) };
  const qs = window.JL.modes.quiz._buildQuestions(topic);
  assertEq(qs.length, 10);
});

test('quiz: each question has 4 unique choices', () => {
  const topic = { words: Array.from({length: 18}, (_, i) => ({
    kana: 'k'+i, kanji: '', meaning: 'm'+i, example: { jp: '', ko: '' }
  })) };
  const qs = window.JL.modes.quiz._buildQuestions(topic);
  for (const q of qs) {
    assertEq(q.choices.length, 4);
    const unique = new Set(q.choices.map(c => c.meaning));
    assertEq(unique.size, 4);
  }
});

test('quiz: each question has correct answer in choices', () => {
  const topic = { words: Array.from({length: 18}, (_, i) => ({
    kana: 'k'+i, kanji: '', meaning: 'm'+i, example: { jp: '', ko: '' }
  })) };
  const qs = window.JL.modes.quiz._buildQuestions(topic);
  for (const q of qs) {
    assert(q.choices.some(c => c.meaning === q.answer.meaning), 'correct answer missing');
  }
});

test('quiz: limits to topic word count when fewer than 10 words', () => {
  const topic = { words: Array.from({length: 5}, (_, i) => ({
    kana: 'k'+i, kanji: '', meaning: 'm'+i, example: { jp: '', ko: '' }
  })) };
  const qs = window.JL.modes.quiz._buildQuestions(topic);
  assertEq(qs.length, 5);
  for (const q of qs) {
    assertEq(q.choices.length, Math.min(4, 5));
  }
});
```

- [ ] **Step 2: Append quiz CSS**

Add at end of `<style>` block:

```css
.quiz-screen { max-width: 600px; margin: 0 auto; }
.quiz-progress {
  display: flex; justify-content: space-between; font-size: 16px; color: var(--muted); margin-bottom: 16px;
}
.quiz-question {
  background: var(--soft); border-radius: var(--radius); padding: 32px 24px;
  text-align: center; margin-bottom: 24px;
}
.quiz-question .prompt { font-size: 18px; color: var(--muted); margin-bottom: 12px; }
.quiz-question .target { font-size: 48px; font-weight: 500; }
.quiz-question .target.jp { font-family: "Hiragino Mincho ProN", "Yu Mincho", "Meiryo", serif; }

.quiz-choices { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
.quiz-choice {
  appearance: none; border: 1.5px solid var(--border); background: #fff; color: var(--fg);
  padding: 18px 16px; font-size: 18px; border-radius: 12px; cursor: pointer; min-height: 64px;
  transition: all .12s;
}
.quiz-choice:hover { border-color: var(--accent); }
.quiz-choice.correct { background: #e6f4e6; border-color: var(--success); color: var(--success); }
.quiz-choice.wrong { background: #fbebea; border-color: var(--error); color: var(--error); }
.quiz-choice.disabled { opacity: 0.6; cursor: default; }

.quiz-feedback { text-align: center; margin: 16px 0; font-size: 18px; min-height: 28px; }
.quiz-feedback.correct { color: var(--success); }
.quiz-feedback.wrong { color: var(--error); }

.quiz-result { text-align: center; padding: 40px 16px; }
.quiz-result .score { font-size: 56px; font-weight: 600; color: var(--accent-dark); margin: 16px 0; }
.quiz-result .label { font-size: 18px; color: var(--muted); }
.quiz-result .actions { display: flex; gap: 12px; justify-content: center; margin-top: 24px; }

@media (max-width: 600px) {
  .quiz-choices { grid-template-columns: 1fr; }
  .quiz-question .target { font-size: 36px; }
}
```

- [ ] **Step 3: Implement QUIZ mode**

Replace the `MODE_QUIZ` script block content with:

```javascript
window.JL = window.JL || {};
window.JL.modes = window.JL.modes || {};
window.JL.modes.quiz = (function () {
  const QUESTION_COUNT = 10;
  let state = null;

  function buildQuestions(topic) {
    const words = topic.words;
    if (words.length === 0) return [];
    const u = window.JL.utils;
    const targets = u.pickRandom(words, Math.min(QUESTION_COUNT, words.length));
    return targets.map(answer => {
      const wrongPool = words.filter(w => w.meaning !== answer.meaning);
      const distractorCount = Math.min(3, wrongPool.length);
      const wrongs = u.pickRandom(wrongPool, distractorCount);
      const choices = u.shuffle([answer, ...wrongs]);
      // randomize prompt direction: 50% jp→ko, 50% ko→jp
      const direction = Math.random() < 0.5 ? 'jp_to_ko' : 'ko_to_jp';
      return { answer, choices, direction };
    });
  }

  function mount(root, topic) {
    state = {
      topic,
      questions: buildQuestions(topic),
      idx: 0,
      score: 0,
      finished: false,
      lastResult: null,
      locked: false
    };
    render(root);
  }

  function render(root) {
    if (state.finished) return renderResult(root);
    const u = window.JL.utils;
    const q = state.questions[state.idx];
    const total = state.questions.length;

    const promptText = q.direction === 'jp_to_ko' ? '뜻은?' : '일본어로?';
    const targetText = q.direction === 'jp_to_ko' ? q.answer.kana : q.answer.meaning;
    const targetClass = q.direction === 'jp_to_ko' ? 'target jp jp-text' : 'target';

    const choicesHtml = q.choices.map((c, i) => {
      const text = q.direction === 'jp_to_ko' ? c.meaning : c.kana;
      const cls = q.direction === 'ko_to_jp' ? 'quiz-choice jp-text' : 'quiz-choice';
      return `<button class="${cls}" data-i="${i}">${u.escapeHtml(text)}</button>`;
    }).join('');

    root.innerHTML = `
      <span class="back-link" id="back">← 메인으로</span>
      <div class="quiz-screen">
        <div class="quiz-progress">
          <div>${state.idx + 1} / ${total}</div>
          <div>점수: ${state.score}</div>
        </div>
        <div class="quiz-question">
          <div class="prompt">${promptText}</div>
          <div class="${targetClass}">${u.escapeHtml(targetText)}</div>
        </div>
        <div class="quiz-choices" id="choices">${choicesHtml}</div>
        <div class="quiz-feedback" id="feedback"></div>
      </div>
    `;

    document.getElementById('back').addEventListener('click', () => window.JL.router.renderMain());

    root.querySelectorAll('.quiz-choice').forEach(btn => {
      btn.addEventListener('click', () => handleChoice(root, parseInt(btn.dataset.i, 10)));
    });
  }

  function handleChoice(root, choiceIdx) {
    if (state.locked) return;
    state.locked = true;
    const q = state.questions[state.idx];
    const chosen = q.choices[choiceIdx];
    const correct = chosen.meaning === q.answer.meaning;

    if (correct) state.score += 10;

    // visual feedback
    const choiceBtns = root.querySelectorAll('.quiz-choice');
    choiceBtns.forEach((b, i) => {
      b.classList.add('disabled');
      if (q.choices[i].meaning === q.answer.meaning) b.classList.add('correct');
      else if (i === choiceIdx) b.classList.add('wrong');
    });

    const fb = document.getElementById('feedback');
    fb.textContent = correct ? '✓ 정답!' : `✗ 정답: ${q.answer.meaning} (${q.answer.kana})`;
    fb.className = 'quiz-feedback ' + (correct ? 'correct' : 'wrong');

    setTimeout(() => {
      state.locked = false;
      state.idx++;
      if (state.idx >= state.questions.length) {
        state.finished = true;
        finalizeScore();
      }
      render(root);
    }, 1200);
  }

  function finalizeScore() {
    const progress = window.JL.storage.loadProgress();
    if (state.score > progress.quizHighScore) {
      window.JL.storage.saveProgress({ quizHighScore: state.score });
    }
  }

  function renderResult(root) {
    const total = state.questions.length;
    const max = total * 10;
    const progress = window.JL.storage.loadProgress();
    const newRecord = state.score >= progress.quizHighScore && state.score > 0;

    root.innerHTML = `
      <span class="back-link" id="back">← 메인으로</span>
      <div class="quiz-result">
        <div class="label">${state.topic.name} 퀴즈 결과</div>
        <div class="score">${state.score} / ${max}</div>
        <div class="label">${newRecord ? '🎉 최고점 갱신!' : '잘 했어요!'}</div>
        <div class="actions">
          <button class="btn" id="again">다시 풀기</button>
          <button class="btn btn-primary" id="home">메인으로</button>
        </div>
      </div>
    `;

    document.getElementById('back').addEventListener('click', () => window.JL.router.renderMain());
    document.getElementById('again').addEventListener('click', () => mount(root, state.topic));
    document.getElementById('home').addEventListener('click', () => window.JL.router.renderMain());
  }

  return { mount, _buildQuestions: buildQuestions };
})();
```

- [ ] **Step 4: Mirror quiz module into `test.html`**

In `test.html`, add a new `<script>` block (right after the storage block from Task 3) containing the exact `window.JL.modes.quiz` implementation from Step 3 above. This makes `_buildQuestions` available to tests.

- [ ] **Step 5: Run tests**

Open `test.html` in browser. Expected: previous 11 tests still pass + 4 new quiz tests pass = `통과 15 / 실패 0 / 총 15`.

- [ ] **Step 6: Verify in browser**

Open `japanese.html`. Pick a topic, click `퀴즈`. Expected:
- "1 / 10" progress, "점수: 0"
- Question shows either Japanese kana (asking for meaning) or Korean meaning (asking for kana)
- 4 choice buttons
- Click correct → button turns green, "✓ 정답!", score +10
- Click wrong → wrong turns red, correct turns green, "✗ 정답: ..." text
- After 10 questions → result screen with score / 100, "다시 풀기" + "메인으로"
- Take a quiz with score > 0 → return to main → 퀴즈 최고점 stat updated

- [ ] **Step 7: Commit**

```bash
git add japanese.html test.html
git commit -m "feat: quiz mode (4-choice, scoring, high score persistence)"
```

---

## Task 7: Conversation mode

**Files:**
- Modify: `japanese.html` — fill `MODE_CONVERSATION` block, add CSS

- [ ] **Step 1: Append conversation CSS**

Add at end of `<style>` block:

```css
.conv-screen { max-width: 700px; margin: 0 auto; }
.conv-scenes { display: grid; grid-template-columns: 1fr; gap: 12px; }
.conv-scene-card {
  background: var(--soft); border: 1.5px solid var(--border); border-radius: 12px;
  padding: 20px 24px; cursor: pointer; font-size: 18px; transition: all .12s;
}
.conv-scene-card:hover { border-color: var(--accent); background: #fff; }

.conv-scene-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
.conv-scene-header h3 { margin: 0; font-size: 20px; }

.conv-line {
  background: #fff; border: 1.5px solid var(--border); border-radius: 12px;
  padding: 20px 24px; margin-bottom: 12px; display: flex; gap: 16px; align-items: flex-start;
}
.conv-line .body { flex: 1; }
.conv-line .jp { font-size: 22px; line-height: 1.5; }
.conv-line .ko { font-size: 16px; color: var(--muted); margin-top: 8px; }
.conv-line.hidden-ko .ko { display: none; }
.conv-line .speak-btn {
  appearance: none; border: 1.5px solid var(--border); background: #fff;
  width: 48px; height: 48px; border-radius: 50%; cursor: pointer; font-size: 20px; flex-shrink: 0;
}

.conv-controls { display: flex; gap: 12px; align-items: center; justify-content: space-between; margin-top: 16px; }
.conv-toggle {
  appearance: none; border: 1.5px solid var(--border); background: #fff; padding: 10px 16px;
  border-radius: 12px; cursor: pointer; font-size: 14px; min-height: 44px;
}
.conv-toggle.active { background: var(--accent); color: #fff; border-color: var(--accent); }

@media (max-width: 600px) {
  .conv-line .jp { font-size: 18px; }
}
```

- [ ] **Step 2: Implement CONVERSATION mode**

Replace the `MODE_CONVERSATION` script block content with:

```javascript
window.JL = window.JL || {};
window.JL.modes = window.JL.modes || {};
window.JL.modes.conversation = (function () {
  let state = null;

  function mount(root, topic) {
    state = { topic, sceneIdx: null, showKo: false };
    render(root);
  }

  function render(root) {
    const u = window.JL.utils;
    if (state.sceneIdx === null) return renderSceneList(root, u);
    return renderScene(root, u);
  }

  function renderSceneList(root, u) {
    const t = state.topic;
    const scenes = t.dialogues || [];
    const cards = scenes.map((d, i) =>
      `<div class="conv-scene-card" data-i="${i}">${u.escapeHtml(d.scene)}</div>`
    ).join('');

    root.innerHTML = `
      <span class="back-link" id="back">← 메인으로</span>
      <div class="conv-screen">
        <div class="conv-scene-header"><h3>${u.escapeHtml(t.name)} 회화 — 상황 선택</h3></div>
        <div class="conv-scenes">${cards || '<div class="conv-scene-card">이 주제에는 회화가 없어요.</div>'}</div>
      </div>
    `;

    document.getElementById('back').addEventListener('click', () => window.JL.router.renderMain());
    root.querySelectorAll('.conv-scene-card[data-i]').forEach(el => {
      el.addEventListener('click', () => {
        state.sceneIdx = parseInt(el.dataset.i, 10);
        render(root);
      });
    });
  }

  function renderScene(root, u) {
    const t = state.topic;
    const scene = t.dialogues[state.sceneIdx];

    const lines = scene.lines.map(line => `
      <div class="conv-line ${state.showKo ? '' : 'hidden-ko'}">
        <button class="speak-btn" data-text="${u.escapeHtml(line.jp)}" aria-label="발음">🔊</button>
        <div class="body">
          <div class="jp jp-text">${u.escapeHtml(line.jp)}</div>
          <div class="ko">${u.escapeHtml(line.ko)}</div>
        </div>
      </div>
    `).join('');

    root.innerHTML = `
      <span class="back-link" id="back">← 메인으로</span>
      <div class="conv-screen">
        <div class="conv-scene-header">
          <h3>${u.escapeHtml(scene.scene)}</h3>
          <button class="btn" id="scenes">상황 다시 고르기</button>
        </div>
        ${lines}
        <div class="conv-controls">
          <button class="conv-toggle ${state.showKo ? 'active' : ''}" id="toggleKo">${state.showKo ? '한국어 끄기' : '한국어 보기'}</button>
          <button class="btn btn-primary" id="speakAll">전체 듣기</button>
        </div>
      </div>
    `;

    document.getElementById('back').addEventListener('click', () => window.JL.router.renderMain());
    document.getElementById('scenes').addEventListener('click', () => { state.sceneIdx = null; render(root); });
    document.getElementById('toggleKo').addEventListener('click', () => { state.showKo = !state.showKo; render(root); });

    root.querySelectorAll('.speak-btn').forEach(b => {
      b.addEventListener('click', () => window.JL.tts.speak(b.dataset.text));
    });

    document.getElementById('speakAll').addEventListener('click', () => speakAll(scene.lines));
  }

  function speakAll(lines) {
    if (!('speechSynthesis' in window)) return;
    speechSynthesis.cancel();
    lines.forEach((line, i) => {
      setTimeout(() => window.JL.tts.speak(line.jp), i * 2400);
    });
  }

  return { mount };
})();
```

- [ ] **Step 3: Verify in browser**

Open `japanese.html`. Pick a topic, click `회화`. Expected:
- Scene list (e.g., "학교에서" for 학교 topic)
- Click scene → all 4-5 dialogue lines visible, Korean hidden by default
- 🔊 button on each line plays Japanese
- "한국어 보기" button → toggles Korean translations on/off
- "전체 듣기" → reads all lines sequentially with delay
- "상황 다시 고르기" → returns to scene list
- "← 메인으로" → returns to main

Test all 8 topics — each should have at least one dialogue scene.

- [ ] **Step 4: Commit**

```bash
git add japanese.html
git commit -m "feat: conversation mode (scene select, line-by-line, ko toggle)"
```

---

## Task 8: Polish & final verification

**Files:**
- Modify: `japanese.html` — minor CSS/UX fixes
- Modify: `README.md` — final usage notes

- [ ] **Step 1: Add a global focus style and prevent double-tap zoom**

Append to `<style>` block:

```css
button:focus-visible, .mode-card:focus-visible, .topic-select:focus-visible {
  outline: 2px solid var(--accent); outline-offset: 2px;
}

.mode-card:focus { outline: none; }

button { touch-action: manipulation; }
.mode-card { touch-action: manipulation; }

/* Prevent body scroll bounce on tablet */
html, body { overscroll-behavior: contain; }
```

- [ ] **Step 2: Add a one-time TTS-not-available notice in MAIN**

Modify the `MAIN` script block: replace the `init()` function body with:

```javascript
(function init() {
  window.JL = window.JL || {};
  window.JL.modes = window.JL.modes || {};

  const progress = window.JL.storage.loadProgress();
  window.JL.router.setTopic(progress.selectedTopic || 'school');
  window.JL.router.show('main');

  // Show TTS unavailability notice once after voices have a chance to load
  setTimeout(() => {
    if ('speechSynthesis' in window) {
      const voices = speechSynthesis.getVoices();
      const hasJa = voices.some(v => v.lang && v.lang.toLowerCase().startsWith('ja'));
      if (!hasJa && !sessionStorage.getItem('jl.notts_notified')) {
        sessionStorage.setItem('jl.notts_notified', '1');
        const notice = document.createElement('div');
        notice.style.cssText = 'position:fixed;bottom:16px;left:50%;transform:translateX(-50%);background:#fff;border:1.5px solid #e5e5e5;border-radius:12px;padding:12px 20px;font-size:14px;color:#666;box-shadow:0 4px 16px rgba(0,0,0,0.08);z-index:9999;max-width:90%;';
        notice.textContent = '⚠ 일본어 음성이 설치되어 있지 않아 발음이 제한될 수 있어요.';
        document.body.appendChild(notice);
        setTimeout(() => notice.remove(), 5000);
      }
    }
  }, 800);
})();
```

Remove the stub modes block from MAIN (it's no longer needed since real modes are now defined).

- [ ] **Step 3: Update README.md with final notes**

Replace `README.md` content with:

```markdown
# 일본어 학습 (Japanese Learning)

초등학생용 단일 파일 일본어 학습 웹앱.

## 사용법
`japanese.html` 파일을 더블클릭하면 브라우저에서 열린다. 인터넷 연결 불필요.
태블릿에서 사용하려면 파일을 태블릿으로 옮긴 후 브라우저에서 열어두기.

## 기능
- **플래시카드** — 단어/예문 카드 넘기기, 발음 듣기
- **퀴즈** — 4지선다 10문제, 점수 기록
- **회화** — 상황별 대화 따라하기

## 주제 (8가지)
학교 / 음식 / 동물 / 가족 / 일상 / 숫자·시간 / 여행 / 요리

## 진도 저장
브라우저(또는 태블릿)에 자동 저장됨. 다음에 열어도 학습 카드 수, 퀴즈 최고점이 유지됨.

## 음성
브라우저 내장 TTS를 사용. 일본어 음성팩이 설치되어 있어야 발음 재생됨.
- Windows: 설정 → 시간 및 언어 → 언어 → 일본어 추가
- iPad: 설정 → 일반 → 손쉬운 사용 → 음성 콘텐츠 → 음성 → 일본어 다운로드

## 콘텐츠 추가
`japanese.html` 안의 `DATA` 스크립트 블록에서 단어/예문/대화를 직접 수정 가능.

## 테스트
`test.html`을 브라우저에서 열면 자동으로 단위 테스트 실행, 결과 표시.
```

- [ ] **Step 4: Final manual verification checklist**

Open `japanese.html` in browser:
- [ ] Main screen renders with header, topic dropdown, 3 mode cards, stats
- [ ] Topic dropdown shows all 8 topics; selection persists across refresh
- [ ] Flashcard mode works for all 8 topics
- [ ] Quiz mode works for all 8 topics, score persists as high score
- [ ] Conversation mode works for all 8 topics (each has at least one scene)
- [ ] TTS plays Japanese audio (or shows the warning notice if no Japanese voice)
- [ ] All "← 메인으로" links return to main
- [ ] Resize browser to ~768px width — UI remains usable (mode grid stacks)

Open `test.html` in browser:
- [ ] All 15 tests pass

- [ ] **Step 5: Commit**

```bash
git add japanese.html README.md
git commit -m "feat: polish (focus styles, no-TTS notice, README)"
```

- [ ] **Step 6: Final tag**

```bash
git tag v1.0
```

---

## Summary

After all tasks complete:
- `japanese.html` — fully functional offline learning app, 8 topics × 3 modes
- `test.html` — 15 passing unit tests for pure-logic modules
- `README.md` — usage instructions
- Git history with 8 logical commits + v1.0 tag
