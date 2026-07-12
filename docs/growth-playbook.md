# Search Navigator — Growth Playbook

The single home for go-to-market strategy that has **no other place to live**.
Copy that belongs in a system of record lives there, not here (see the table below).

## Source-of-truth map (avoid double management)

| Asset | Canonical home (edit only here) | Not duplicated in |
| --- | --- | --- |
| Extension title + summary | `manifest.json` (`name`, `description`) | this doc |
| Full description, screenshots, promo video, JP listing | Chrome Web Store dashboard → Store listing | this repo |
| Positioning, launch posts, keyword rationale, screenshot plan | **this file** | — (its only home) |

The store description drafts are kept once, in the clearly-marked seed appendix at the
bottom; delete that appendix once it's pasted into the dashboard.

---

## 1. Diagnosis

~967 users at 4.5★ (15 ratings) despite a polished product → the bottleneck is
**discovery, not features**. A well-built tool with few users has a distribution problem.

First-party evidence:
- **Issue #89 "Hard to find this extension":** *"exactly what I've been looking for — a
  google search navigator with up and down or j/k keys — but it was too hard to find."*
  Confirms the bottleneck AND reveals the exact phrase users type.
- **Issues #74 & #11:** users arrive here as **refugees from "Web Search Navigator"**,
  which they report is "not useable anymore."

Biggest unlock — **Web Search Navigator refugees.** That incumbent
(`cohamjploocgoejdfanacfgkhjkhdkek`) has ~4,000 users, 4.9★/260 ratings, but was last
updated **May 2023**. A large, warm, orphaned audience actively seeking a maintained
replacement.

Priority order (highest ROI first): **1) store ASO → 2) in-app review prompt →
3) positioning → 4) launch.** Features rarely drive acquisition (non-users can't see
them); only **broader site support** widens the funnel.

---

## 2. Positioning (the through-line for everything)

> **Keyboard navigation for Google & YouTube search — the actively-maintained,
> open-source successor to Web Search Navigator. j/k or arrows, zero setup, no tracking.**

Short taglines (pick per surface):
- "Search results at keyboard speed — j/k for Google & YouTube."
- "The maintained keyboard navigator for Google Search & YouTube."
- "Vim-style search navigation, without the Vimium learning curve."

Three concentric audiences (target warmest first):
1. **Web Search Navigator refugees** — warmest. *"the maintained successor."*
2. **People searching the exact phrase** (#89) — *"google search navigator j/k keys",
   "web search navigator alternative".* Captured via store keywords + a ranking blog post.
3. **Vim / keyboard power users** who find Vimium too heavy — *"search-focused, nothing
   to memorize; it doesn't remap your whole browser."*

Differentiators to lead with:
- **Maintained** (vs the abandoned incumbents) — updated for today's Google/YouTube DOM.
- **Zero setup** — useful the second it's installed.
- **Search-focused** — no full-browser remap (vs Vimium/Surfingkeys).
- **Google + YouTube + tab switching + Maps/YouTube jump** — broader than pure arrow tools.
- **Private & open source (MIT)** — no data collection, tracking, or external requests.

Quick wins that would convert the refugee pool (requested, **not yet built**):
- Space to open the selected result (#11).
- Multiple key bindings for "Open link" (#74).
Shipping these later would let the launch say *"everything you had, still maintained."*
They are functional changes, so keep them out of discovery-focused work and ship them
on their own.

---

## 3. Store ASO (keyword rationale + assets)

Title/summary already live in `manifest.json`. Keyword sources — weave naturally, do not
stuff:
> **google search navigator, keyboard shortcuts for google, arrow keys / j k navigation,
> navigate search results without a mouse, web search navigator alternative,
> vim google search.**
(These come from issue #89's real user language and the orphaned incumbent's name.)

### Screenshots / promo video (biggest single conversion lever)

Store allows 5 screenshots (1280×800 or 640×400) + an optional YouTube promo video.
**Tile 1 must sell the core motion** (ideally an animated hero / short recording).

1. **Hero** — Google results, one highlighted, key-cap overlay `j` `k`.
   *"Move through results with j / k — never touch the mouse"*
2. **Tab switching** — the a/i/v/n/s row highlighted.
   *"Jump between All · Images · Videos · News · Shopping"*
3. **Open anywhere** — `Enter` / `Cmd+Enter` opening a new tab.
   *"Open results in place or in a new tab — from the keyboard"*
4. **YouTube** — results navigation on youtube.com.
   *"Same shortcuts on YouTube"*
5. **Customize** — popup with the remap UI + dark theme.
   *"Remap any key · light & dark"*

Promo video: 15–25s recording of a real session (type query → j/k → Enter → switch to
Images → open). Small promo tile (440×280) unlocks featured placement — worth making.

---

## 4. Launch (spike + ratings + durable backlinks)

Lead angle everywhere: **the actively-maintained, open-source successor to the abandoned
Web Search Navigator** + the honest hook that a real user called it *"exactly what I've
been looking for… but too hard to find."*

Sequence (space them so each feeds the next):
1. **Blog / dev.to** (do first — durable backlink) →
2. **Reddit** (r/chrome, r/productivity, r/vim — one at a time, days apart) →
3. **Show HN** →
4. **Product Hunt** (needs the screenshots/video above).

### Show HN

**Title:** `Show HN: Search Navigator – keyboard navigation for Google & YouTube (j/k, no setup)`

**Body:**
```
I use the keyboard for everything, and the extension I relied on to move through Google
results with j/k — Web Search Navigator — stopped being maintained (last update 2023) and
started breaking as Google changed its markup. So I built and now actively maintain a
replacement.

Search Navigator lets you:
- move through results with j/k or arrow keys, open with Enter (Cmd/Ctrl = new tab)
- switch tabs from the keyboard: a All, i Images, v Videos, n News, s Shopping
- jump to Google Maps (m) or YouTube (y) with your current query
- do the same on YouTube search

Design choices:
- Zero config — it works the moment it's installed.
- Search-result focused on purpose. It doesn't remap your whole browser like Vimium, so
  there's essentially nothing to learn.
- No data collection, no tracking, no external requests. MIT, source is on GitHub.

It handles the annoying real-world cases: infinite scroll, "People also ask", SPA
navigation on YouTube, image preview panels. Tested with unit + Playwright E2E against
saved page snapshots.

Store: <link>   Source: https://github.com/nwatab/search-navigator

Happy to talk about the pain of scraping Google's ever-changing DOM — that's most of the
maintenance work, and why the unmaintained alternatives break.
```
Be present in the comments for the first few hours; the "why the old ones break" thread is
the strongest asset.

### Reddit

Lead with the story/problem, link once, engage. One sub at a time.

**Title (r/chrome, r/productivity):**
`I rebuilt the abandoned "Web Search Navigator" so you can drive Google & YouTube with j/k again`
**Title (r/vim):**
`Vim-style j/k navigation for Google & YouTube search, without remapping your whole browser`
**Body:**
```
If you ever used Web Search Navigator to move through Google results with j/k and noticed
it breaking (it hasn't been updated since 2023), I made a maintained, open-source
replacement: Search Navigator.

j/k or arrows to move, Enter to open (Cmd/Ctrl for a new tab), a/i/v/n/s to
switch tabs, m/y to jump to Maps/YouTube. Works on YouTube search too. Zero setup,
remappable keys, light/dark, and — because I know this sub cares — no tracking and no
external requests. MIT-licensed, code's on GitHub.

Not trying to be Vimium; it stays focused on search results so there's nothing to learn.
Feedback and bug reports welcome — Google changes its DOM constantly and I'd rather hear
it here than have it silently break.

Store: <link>   Source: <github>
```

### Product Hunt

**Tagline:** `Drive Google & YouTube search with your keyboard`
**Description:**
```
Search Navigator adds fast, Vim-style keyboard shortcuts to Google Search and YouTube:
move through results with j/k or arrows, open with Enter, switch between All/Images/
Videos/News/Shopping, and jump to Maps or YouTube — all without touching the mouse.

Zero setup, remappable keys, light/dark, and genuinely private: no data collection, no
tracking, no external requests. Open source (MIT). It's the actively-maintained successor
to the beloved-but-abandoned Web Search Navigator.
```
**Maker's first comment:**
```
Hi PH 👋 I built this because the keyboard-navigation extension I depended on stopped
being maintained and started breaking on new Google layouts. Search Navigator is my
maintained, open-source take — focused only on search results, so there's nothing to
learn. Would love your feedback, especially edge cases where Google's markup trips it up.
```

### Blog / dev.to (do first — durable backlink)

**Title:** `Keeping a Chrome extension alive against Google's ever-changing DOM`
The engineering story — how result-scraping breaks when Google ships new markup, detecting
tab types across `tbm`/`udm`, testing with Playwright against saved snapshots. Ends with
"I maintain Search Navigator, the successor to Web Search Navigator." Earns interest on
merit and leaves a permanent, keyword-rich backlink.

---

## 5. After launch

Only one feature area widens the acquisition funnel: **broader site support**
(Bing, DuckDuckGo, Brave Search, Startpage, etc.) — each adds new store keywords and a new
user segment, while keeping the "search-focused, zero-config" wedge. Prioritize by the
request data the launch surfaces; don't build ahead of demand.

---

## Appendix — store description SEED (delete after pasting into the CWS dashboard)

> One-time copy to paste into the Chrome Web Store dashboard. Once applied, the dashboard
> is the source of truth — delete this appendix so it isn't maintained in two places.

**EN full description**
```
Browse Google Search and YouTube entirely from your keyboard.

Search Navigator adds fast, Vim-style shortcuts so you can move through results, open
links, flip pages, and jump between Images / Videos / News / Shopping — without ever
reaching for the mouse. It works the moment you install it. No configuration.

▸ NAVIGATION
  • j / k  or  ↓ / ↑   — move through results
  • h / l  or  ← / →   — previous / next page
  • Enter — open result  (Ctrl/Cmd = new tab, Shift = new window)

▸ SWITCH TABS
  • a All · i Images · v Videos · n News · s Shopping

▸ QUICK ACCESS
  • m — Google Maps · y — YouTube  (carries your current query)

▸ YOUTUBE
  • Navigate and open search results with the same keys

▸ COMING FROM WEB SEARCH NAVIGATOR?
  • Search Navigator is an actively-maintained, open-source alternative with the same
    j/k navigation — kept working on today's Google and YouTube.

▸ WHY SEARCH NAVIGATOR
  • Zero setup, remappable shortcuts, automatic light / dark theme
  • Search-result focused, so there's nothing to memorize
  • Open source (MIT) — read every line yourself

▸ PRIVACY
  • No data collection. No tracking. No external requests. Ever.
```

**JP full description**
```
Google 検索と YouTube を、キーボードだけで操作。

Search Navigator は Vim 風のショートカットを追加します。検索結果の移動、リンクを開く、
ページ送り、画像／動画／ニュース／ショッピングの切り替えまで、マウスに手を伸ばさず完結。
インストールした瞬間から使えます。設定不要。

▸ 移動
  • j / k または ↓ / ↑ — 結果を移動
  • h / l または ← / → — 前 / 次のページ
  • Enter — 結果を開く（Ctrl/Cmd で新規タブ、Shift で新規ウィンドウ）

▸ タブ切り替え
  • a すべて · i 画像 · v 動画 · n ニュース · s ショッピング

▸ クイックアクセス
  • m — Google マップ · y — YouTube（今の検索語をそのまま渡す）

▸ Web Search Navigator を使っていた方へ
  • 同じ j/k ナビゲーションを、現在も保守されているオープンソースで。今の Google /
    YouTube に合わせて更新し続けています。

▸ プライバシー
  • データ収集なし。トラッキングなし。外部通信なし。
```
