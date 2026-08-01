# Answering Guide — Working on This Repo

Operational guide for adding/editing interview questions and answers. Read this
plus `answer_rules.md` (writing style) and you can start editing immediately.

**`answer_rules.md` = how to write. This file = where to put it and how to verify.**

---

## 1. What this project is

A static **Astro 7** site of Java/Spring Boot interview questions for a **2 YoE**
candidate. No database, no CMS — all content is TypeScript data. There is **one
content file** and **a set of answer-bank files**; everything else is layout.

- Build: `npx astro build` → `dist/` (static HTML, gitignored)
- Dev: `astro dev --background`, then `astro dev stop` / `status` / `logs`
- No test suite, no linter. **The build is the only automated gate** — plus the
  verification script in §7, which you should run because the build does *not*
  catch missing or mis-keyed answers.

---

## 2. Files that matter

| File | Role |
|---|---|
| `src/data/questions.ts` | **All 158 questions.** Category metadata, question text, `answer`, `explanation`, and the follow-up *text*. ~5,000 lines. |
| `src/data/followup_answers.ts` | Merge point. Holds `baseAnswers` (core-java + oop) and spreads every other bank into one exported map. |
| `src/data/followup_answers_spring_core.ts` | Bank — `spring-core` (Q36–Q52) |
| `src/data/followup_answers_spring_boot.ts` | Bank — `spring-boot` (Q53–Q68) |
| `src/data/followup_answers_spring.ts` | Bank — `spring-mvc-rest` (Q69–Q83). Note the misleading name. |
| `src/data/followup_answers_jpa.ts` | Bank — `spring-data-jpa` (Q84–Q102) |
| `src/data/types.ts` | `Category`, `Question`, `FollowUp` interfaces |
| `src/components/QuestionCard.astro` | Renders a question. Contains the markdown renderer — see §5. |

Don't edit `dist/` (build output) or the root `.md` files (`ClaudeQuestions.md`,
`Design.md`, `QuestionsAsked.md`, `java-spring-boot-interview-questions-2yoe.md`)
— those are notes/source material, not site content.

---

## 3. The one non-obvious thing: how follow-up answers attach

Follow-ups in `questions.ts` carry **only text**:

```ts
followUps: [
  { text: "What is the property source precedence order?" },
],
```

Answers live in a separate bank, **keyed by that exact text string**:

```ts
export const followupAnswersSpringBoot: Record<string, string> = {
  "What is the property source precedence order?":
    "Highest to lowest: **command-line args**, then ...",
};
```

At the bottom of `questions.ts` a loop marries them:

```ts
categories.forEach((cat) =>
  cat.questions.forEach((q) =>
    q.followUps.forEach((fu) => {
      if (!fu.answer && followupAnswers[fu.text]) {
        fu.answer = followupAnswers[fu.text];
      }
    })
  )
);
```

### Consequences — read these before editing

1. **The key must match the follow-up text byte-for-byte.** One different
   character (a hyphen vs an en-dash, a stray space, a changed backtick) and the
   answer silently never appears. **No error, no warning, and the build still
   passes.** This is the single most likely way to break something here.
2. **If you reword a follow-up in `questions.ts`, you must update its bank key
   in the same edit.** Always do these two together.
3. **The merged map is global, not per-category.** Two categories with an
   identical follow-up string would share one answer. Keep keys specific.
4. **An inline `answer` on a follow-up wins** (`if (!fu.answer)`). Both forms
   work; keep new work in the bank files for consistency.

---

## 4. Where to add things

### Adding a follow-up answer to a category that already has a bank
Add the key/value to that bank file. Nothing else to wire.

### Adding answers for a category with no bank yet
1. Create `src/data/followup_answers_<category>.ts`, copying the header comment
   from an existing bank.
2. Export `export const followupAnswers<Category>: Record<string, string> = { ... }`.
3. In `followup_answers.ts`, add the import **and** add the spread to the merged
   object at the bottom. **Both.** Adding only the import is a no-op and, again,
   the build still passes.

### Adding a main `answer` / `explanation`
Inline in `questions.ts` on the question object. `answer` is a plain string;
`explanation` is a **backtick template literal** because it contains code fences.

### Adding a whole new question
Append to the right category's `questions` array. Keep `id` globally unique and
sequential — ids are currently 1–158 with no gaps, and `[category].astro` uses
them for the table of contents and anchors (`#q-53`).

---

## 5. Formatting rules the renderer actually enforces

`QuestionCard.astro` has a **hand-rolled markdown subset**, not a real markdown
library. Only these work:

| Syntax | Works | Notes |
|---|---|---|
| `**bold**` | yes | |
| `` `inline code` `` | yes | not inside `<pre>` |
| ` ```lang ... ``` ` fenced blocks | yes | Shiki, `dark-plus` theme |
| Blank-line paragraphs | yes | `\n\n` → `<p>`, single `\n` → `<br>` |
| `#` headers, `-` bullets, tables, links | **NO** | render as literal text |

**Bullets and headers do not render.** Follow-up answers are prose only — which
matches `answer_rules.md` anyway.

Supported code-block languages (anything else silently falls back to plain text):
`java`, `xml`, `yaml`, `properties`, `bash`, `sh`, `json`, `sql`, `groovy`, `kotlin`

### Escaping — this is where it goes wrong

Bank files are `.ts`, and the strings are double-quoted, so:

- `"` inside an answer must be `\"`
- A literal `\n` in output needs `\\n` in a normal string
- Prefer a **template literal** (backticks) for anything with code fences — but
  then every `` ` `` inside must be escaped as `` \` ``, which is why `questions.ts`
  is full of `` \`\`\`java ``. For short prose answers, stick with double quotes.
- The renderer HTML-escapes `&`, `<`, `>` outside code blocks, so write them
  plainly — don't pre-escape to `&amp;`.

---

## 6. Current coverage

158 questions, 474 follow-ups, **306 answered / 168 missing** (as of last edit).

| Category | Range | Qs | main answer | explanation | follow-up answers |
|---|---|---|---|---|---|
| `core-java` | Q1–Q28 | 28 | 28/28 | 28/28 | 84/84 |
| `oop` | Q29–Q35 | 7 | 7/7 | 7/7 | 21/21 |
| `spring-core` | Q36–Q52 | 17 | 17/17 | 17/17 | 51/51 |
| `spring-boot` | Q53–Q68 | 16 | 16/16 | 16/16 | 48/48 |
| `spring-mvc-rest` | Q69–Q83 | 15 | 15/15 | 15/15 | 45/45 |
| `spring-data-jpa` | Q84–Q102 | 19 | 19/19 | 19/19 | 57/57 |
| `security` | Q103–Q112 | 10 | **0/10** | **0/10** | **0/30** |
| `microservices` | Q113–Q124 | 12 | **0/12** | **0/12** | **0/36** |
| `testing` | Q125–Q132 | 8 | **0/8** | **0/8** | **0/24** |
| `build-git` | Q133–Q142 | 10 | **0/10** | **0/10** | **0/30** |
| `system-design` | Q143–Q152 | 10 | **0/10** | **0/10** | **0/30** |
| `behavioral` | Q153–Q158 | 6 | **0/6** | **0/6** | **0/18** |

**Worked example of the §3.1 key-drift bug (now fixed).** Six `core-java`
follow-ups on Q17/Q18 rendered blank even though their answers existed in
`baseAnswers` — the follow-up text had been reworded in `questions.ts` without
updating the bank keys, stranding all six as orphans:

```
bank key   "Why must `compareTo` be consistent with `equals`?"
actual     "What happens if `compareTo` is inconsistent with `equals`?"
```

Five were pure re-keys. The sixth was **not** drift: "Can a class implement two
interfaces with the same method signature?" had been *replaced* by "Why doesn't
Java allow multiple class inheritance?", so the stranded answer no longer fit and
needed rewriting. **Check that a stranded answer still answers the current
question before re-keying it** — an orphan can mean either drift or replacement,
and only the verification script tells you it exists at all.

Six categories have **nothing at all** — each needs a new bank file per §4.

---

## 7. Verification — run this, the build won't catch content bugs

`astro build` passes even when every answer is missing or mis-keyed. Use this to
check the thing that actually matters. There's no TS runner installed and **no
network access**, so bundle with the local esbuild:

```bash
cd /Users/sanchitingale/Development/springbootinterview

cat > /tmp/check.ts <<'EOF'
import { categories } from '/Users/sanchitingale/Development/springbootinterview/src/data/questions';
const TARGET = 'spring-boot';           // <-- category you edited
const cat = categories.find(c => c.id === TARGET)!;
let missing = 0;
for (const q of cat.questions) {
  if (!q.answer) console.log(`Q${q.id} MAIN ANSWER MISSING`);
  for (const f of q.followUps)
    if (!f.answer) { missing++; console.log(`Q${q.id} FOLLOWUP UNANSWERED: ${f.text}`); }
}
console.log(missing ? `\n${missing} unanswered` : '\nall follow-ups answered');

// orphan keys = bank entries matching no follow-up (usually a typo/reworded text)
const all = new Set(categories.flatMap(c => c.questions.flatMap(q => q.followUps.map(f => f.text))));
const bank = await import('/Users/sanchitingale/Development/springbootinterview/src/data/followup_answers');
const orphans = Object.keys(bank.followupAnswers).filter(k => !all.has(k));
console.log(orphans.length ? `ORPHAN KEYS (answer will never show):\n  ${orphans.join('\n  ')}` : 'no orphan keys');
EOF

cat > /tmp/bundle.mjs <<'EOF'
import { build } from '/Users/sanchitingale/Development/springbootinterview/node_modules/esbuild/lib/main.js';
import fs from 'node:fs';
const r = await build({ entryPoints: ['/tmp/check.ts'], bundle: true, format: 'esm', write: false, platform: 'node' });
fs.writeFileSync('/tmp/check.mjs', r.outputFiles[0].text);
EOF

node /tmp/bundle.mjs && node /tmp/check.mjs
```

**Orphan keys are the important output.** An orphan means you wrote an answer
whose key doesn't match any follow-up — the work is invisible on the site.

Then confirm it renders:

```bash
npx astro build
grep -o 'class="followup-answer' dist/<category>/index.html | wc -l   # should equal the follow-up count
```

Clean up `/tmp` scratch files when done.

---

## 8. Editing follow-up *questions* (not just answers)

Reword a follow-up when it **contains its own answer** or **restates the parent
question**. Both patterns were common and are worth fixing on sight:

```
BAD   What interface do you implement (`HealthIndicator`)?
GOOD  How do you stop a slow dependency check from hanging `/health`?

BAD   Where are auto-config classes registered (`AutoConfiguration.imports`)?
GOOD  Where does Boot get the list of auto-configuration classes to evaluate?
```

A parenthetical that names the answer leaves nothing to ask. Replace it with the
**failure mode** — what breaks, what you'd see, how you'd diagnose it.

For bulk rewords, prefer a Python script that asserts **exactly one match** per
replacement and is scoped to the category's line range, rather than a blind
`sed -i` across a 5,000-line file:

```python
needle = '{ text: "%s" }' % old
if section.count(needle) != 1:
    raise SystemExit("expected 1 match, got %d: %s" % (section.count(needle), old))
```

And remember rule §3.2: **update the bank key at the same time.**

---

## 9. Content conventions

Beyond `answer_rules.md`:

- **Target 2 YoE.** Assume Spring Boot 3.x / Jakarta namespace. Flag version
  changes where the internet is stale — e.g. auto-config registration moved from
  `spring.factories` to `AutoConfiguration.imports` (deprecated 2.7, removed 3.0).
- **Lead with the failure mode.** What breaks in production beats a definition.
- **Use real names** — `OrderService`, `UserDto`, `PaymentGateway`. Never `Foo`.
- Group bank entries by question with a comment header, matching existing files:
  ```ts
  // ===================== Q61: Actuator =====================
  ```
- Keep bank entries in the same order as the questions in `questions.ts`.
- Length: 3–5 sentences. Long enough to show depth, short enough to say out loud
  in an interview.

---

## 10. Quick checklist

- [ ] Answer added to the correct bank file (or `baseAnswers` for core-java/oop)
- [ ] Key matches the follow-up text **exactly** — copy-paste it, don't retype
- [ ] New bank file: **both** the import and the spread added in `followup_answers.ts`
- [ ] Quotes escaped (`\"`); backticks escaped if using a template literal
- [ ] No bullets/headers in prose (they don't render)
- [ ] Verification script: **0 unanswered, 0 orphan keys**
- [ ] `npx astro build` passes and the rendered count matches
