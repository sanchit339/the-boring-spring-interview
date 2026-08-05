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
| `src/data/questions.ts` | **All 158 questions.** Category metadata, question text, `answer`, `explanation`, and the followup *text*. ~5,000 lines. |
| `src/data/followup_answers.ts` | Merge point. Holds `baseAnswers` (core-java + oop) and spreads every other bank into one exported map. |
| `src/data/followup_answers_spring_core.ts` | Bank — `spring-core` (Q36–Q52) |
| `src/data/followup_answers_spring_boot.ts` | Bank — `spring-boot` (Q53–Q68) |
| `src/data/followup_answers_spring.ts` | Bank — `spring-mvc-rest` (Q69–Q83). Note the misleading name. |
| `src/data/followup_answers_jpa.ts` | Bank — `spring-data-jpa` (Q84–Q102) |
| `src/data/followup_answers_security.ts` | Bank — `security` (Q103–Q112) |
| `src/data/followup_answers_microservices.ts` | Bank — `microservices` (Q113–Q124) |
| `src/data/followup_answers_testing.ts` | Bank — `testing` (Q125–Q132) |
| `src/data/followup_answers_build_git.ts` | Bank — `build-git` (Q133–Q142) |
| `src/data/followup_answers_system_design.ts` | Bank — `system-design` (Q143–Q152) |
| `src/data/followup_answers_behavioral.ts` | Bank — `behavioral` (Q153–Q158). Structure/criteria, not scripted stories — see the file header. |
| `src/data/types.ts` | `Category`, `Question`, `FollowUp` interfaces |
| `src/components/QuestionCard.astro` | Renders a question. Contains the markdown renderer — see §5. |

Don't edit `dist/` (build output) or the root `.md` files (`ClaudeQuestions.md`,
`Design.md`, `QuestionsAsked.md`, `java-spring-boot-interview-questions-2yoe.md`)
— those are notes/source material, not site content.

---

## 3. The one non-obvious thing: how followup answers attach

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

1. **The key must match the followup text byte-for-byte.** One different
   character (a hyphen vs an en-dash, a stray space, a changed backtick) and the
   answer silently never appears. **No error, no warning, and the build still
   passes.** This is the single most likely way to break something here.
2. **If you reword a followup in `questions.ts`, you must update its bank key
   in the same edit.** Always do these two together.
3. **The merged map is global, not per-category.** Two categories with an
   identical followup string would share one answer. Keep keys specific.
4. **An inline `answer` on a followup wins** (`if (!fu.answer)`). Both forms
   work; keep new work in the bank files for consistency.

---

## 4. Where to add things

### Adding a followup answer to a category that already has a bank
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
| `- ` bullets | yes | consecutive `- ` lines become one `<ul>` |
| `1. ` numbered lists | yes | consecutive `1. ` lines become one `<ol>` |
| `#` headers, tables, links | **NO** | render as literal text |

**Headers do not render. Lists do** — `QuestionCard.astro` groups consecutive
`- ` lines into a `<ul>` and consecutive `1. ` lines into an `<ol>`, in `answer`
and `explanation` alike. A list must start on its own line; put a blank line
before it so it isn't absorbed into the preceding paragraph.

Use one **only for genuinely enumerable content** — the steps to make a class
immutable, the four Coffman conditions. `answer_rules.md` still says prose by
default, and that stands: a list of three loosely-related sentences reads worse
than the paragraph it replaced. What a list *does* fix is the "colon plus
inline `(1)… (2)… (3)…`" run-on, which is the single most common way answers
blow the 30-word sentence cap.

Supported code-block languages (anything else silently falls back to plain text):
`java`, `xml`, `yaml`, `properties`, `bash`, `sh`, `json`, `sql`, `groovy`, `kotlin`

### Escaping — this is where it goes wrong

Bank files are `.ts`, and the strings are double-quoted, so:

- `"` inside an answer must be `\"`
- A literal `\n` in output needs `\\n` in a normal string
- Prefer a **template literal** (backticks) for anything with code fences — but
  then every `` ` `` inside must be escaped as `` \` ``, which is why `questions.ts`
  is full of `` \`\`\`java ``. For short prose answers, stick with double quotes.
- Inside a template literal, a Spring placeholder must be escaped: write
  `` \${server.port} ``, not `` ${server.port} ``. Unescaped, TS reads it as an
  interpolation and either fails to compile or silently substitutes a value.
  Property examples are full of these, so it comes up constantly.
- The renderer HTML-escapes `&`, `<`, `>` outside code blocks, so write them
  plainly — don't pre-escape to `&amp;`.

#### The one that will actually bite you: the closing backtick

Every backtick *inside* an `explanation` is escaped (`` \` ``), so the hand
reflexively escapes the **closing delimiter** too and writes `` \`, `` instead
of `` `, ``. The literal stays open, swallows the next question whole, and
esbuild reports the failure **hundreds of lines later** as
`Expected "}" but found ":"` — pointing at an innocent line. Adding a whole
category, this happened on 12 of 12 explanations.

Check it directly rather than reading the parse error:

```bash
# should print nothing; anything it prints is an unclosed explanation
grep -n '\\`,$' src/data/questions.ts
```

If it does print, only fix lines whose **next** line is `followUps: [` — a
mid-paragraph inline code span followed by a comma matches the same pattern and
is correct as-is.

---

## 6. Current coverage

158 questions, 410 followups, **410 answered / 0 missing** — all 12 categories complete.

Followup count is **at most 3, not exactly 3**. Prune rather than pad — see
`answer_rules.md` Rule 7. Ten `core-java`, three `oop` and nine `spring-core`
questions carry two, because the third restated the main answer or was trivia.
`spring-core` needed the most pruning precisely because its main answers are the
most complete: the richer the answer, the less room a third followup has.

**A category sitting at exactly 3 everywhere hasn't been swept yet.**
`spring-mvc-rest` was 45/45 — three per question across all fifteen — and 14 of
those restated their parent, some almost word for word. The uniform count is
itself the signal; check it before reading a single answer.

**Restating the parent doesn't always mean delete.** `spring-data-jpa` had the
same 3-per-question shape, but its followup *answers* were strong — it was the
*questions* that echoed the answer, burying good material. Eighteen were
repointed at the ground the answer already held ("what is the default fetch
type" → "why is EAGER the harder default to live with?") and only five deleted.
Read the answer before deciding: delete when nothing is left underneath, reword
when something is.

| Category | Range | Qs | main answer | explanation | followup answers |
|---|---|---|---|---|---|
| `core-java` | Q1–Q28 | 28 | 28/28 | 28/28 | 74/74 |
| `oop` | Q29–Q35 | 7 | 7/7 | 7/7 | 18/18 |
| `spring-core` | Q36–Q52 | 17 | 17/17 | 17/17 | 42/42 |
| `spring-boot` | Q53–Q68 | 16 | 16/16 | 16/16 | 35/35 |
| `spring-mvc-rest` | Q69–Q83 | 15 | 15/15 | 15/15 | 31/31 |
| `spring-data-jpa` | Q84–Q102 | 19 | 19/19 | 19/19 | 52/52 |
| `security` | Q103–Q112 | 10 | 10/10 | 10/10 | 27/27 |
| `microservices` | Q113–Q124 | 12 | 12/12 | 12/12 | 33/33 |
| `testing` | Q125–Q132 | 8 | 8/8 | 8/8 | 23/23 |
| `build-git` | Q133–Q142 | 10 | 10/10 | 10/10 | 27/27 |
| `system-design` | Q143–Q152 | 10 | 10/10 | 10/10 | 30/30 |
| `behavioral` | Q153–Q158 | 6 | 6/6 | 6/6 | 18/18 |

**Worked example of the §3.1 key-drift bug (now fixed).** Six `core-java`
followups on Q17/Q18 rendered blank even though their answers existed in
`baseAnswers` — the followup text had been reworded in `questions.ts` without
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

Every category now has a bank file wired into `followup_answers.ts` (import **and** spread).

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
  if (!q.explanation) console.log(`Q${q.id} EXPLANATION MISSING`);
  for (const f of q.followUps)
    if (!f.answer) { missing++; console.log(`Q${q.id} FOLLOWUP UNANSWERED: ${f.text}`); }
}
console.log(missing ? `\n${missing} unanswered` : '\nall followups answered');

// orphan keys = bank entries matching no followup (usually a typo/reworded text)
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
whose key doesn't match any followup — the work is invisible on the site.

Then confirm it renders:

```bash
npx astro build
grep -o 'class="followup-answer' dist/<category>/index.html | wc -l   # = followup count
grep -o '<pre class="shiki-block' dist/<category>/index.html | wc -l  # rough only — see note

# nothing leaked through as literal source: all three should be 0
grep -c '\\`' dist/<category>/index.html      # stray escaped backticks
grep -c '```'  dist/<category>/index.html      # unrendered fences
```

The `shiki-block` count is a rough signal for `answer_rules.md` Rule 7 — **max 2
code blocks per explanation**. Over the cap usually means merging two blocks (a
BAD and GOOD pair reads fine as one block with a comment between them) or moving
config into prose with inline code.

**It over-counts, so don't treat it as a hard gate.** It sums code blocks in
explanations *and* in follow-up answers, and it ignores Rule 7's own exception
for questions that compare 3+ things. `oop` renders 20 blocks against a nominal
cap of 14 and is entirely compliant: 19 are in explanations, and the two that
exceed 2 are Q33 (five SOLID principles) and Q34 (seven design patterns) — both
covered by the exception. To check properly, count `\`\`\`` pairs per
`explanation` string rather than counting rendered blocks per page.

Note that `${...}` **should** still appear in the rendered HTML — Spring
placeholders in code samples are meant to survive as literal text. It's `\` and
` ``` ` that indicate an escaping bug.

Put scratch files in the session scratchpad directory rather than `/tmp`, and
clean them up when done.

---

## 8. Editing followup *questions* (not just answers)

A followup has to be a question an interviewer would **actually ask a 2 YoE
candidate next**, given what they just said. Not filler, not invented to fill a
slot of three, not trivia. Four patterns fail that bar and are worth fixing on
sight:

- **Gives away its own answer** — a parenthetical that names the answer leaves
  nothing to ask. `(Coffman conditions)`, `(Jackson)`, `(thread dump, jstack)`.
- **Restates the parent** — if the parent is "How do you create an immutable
  class?", then "What steps make a class immutable?" is the same question twice.
- **CV prompt** — "Have you used X?", "Name projects you've used or know."
  You can't answer that from the page, and it isn't a technical question.
- **Trivia nobody asks** — "Name a few `ApplicationContext` implementations."
  Real interviewers ask which one you *get*, and why it matters.

The reliable replacement is the **failure mode**: what breaks, what you'd see,
how you'd diagnose it. `(final class, final fields, defensive copies)` became
"You made every field `private final` — how can the object still change?"

Word overlap with the parent is **not** a defect — "How does `@Version`
implement optimistic locking?" shares most of its nouns with its parent and is
exactly right. Judge whether it asks something *new*, not whether it repeats
vocabulary.

Both older patterns are also worth fixing on sight:

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
- **Length follows the question, not a quota.** "Can an interface have a
  constructor?" is done in two sentences; "How does `HashMap` work internally?"
  earns a paragraph or two. Padding a short answer to hit five sentences adds
  the filler Rule 2 exists to remove, and truncating a genuinely layered one
  loses the part that shows understanding. The test is whether every sentence
  is doing work — not the count.

### The `answer` field is spoken, not read

The rules live in **`answer_rules.md` Rule 2** — shaped (2–4 paragraphs split on
the beats, not one block of prose), sayable (~30-word sentence cap, opening
definition kept whole), learnable (anchor to a number, a failure mode, or a named
thing), and no LARPing or interview meta-commentary. Read it before writing; what
follows is just how to *check* the result.

`spring-boot` and `spring-mvc-rest` are the reference for the paragraph shape.
Categories written before it are still single-block and want the same pass.

The sentence cap is the only part a script can catch. Split on sentence
boundaries and flag anything over 30 words, ignoring the first:

```bash
python3 -c "
import re,sys
t=open('src/data/questions.ts').read()
sec=t[t.index('id: \"microservices\"'):t.index('id: \"testing\"')]   # your range
for m in re.finditer(r'id: (\d+),\n\s*text: \".*?\",\n\s*answer: \"(.*?)\",\n\s*explanation:', sec, re.S):
    for i,s in enumerate(re.split(r'(?<=\.) (?=[A-Z*\`])', m.group(2))):
        if i and len(s.split())>30: print('Q'+m.group(1), len(s.split()), s[:90])
"
```

---

## 10. Quick checklist

- [ ] Answer added to the correct bank file (or `baseAnswers` for core-java/oop)
- [ ] Key matches the followup text **exactly** — copy-paste it, don't retype
- [ ] New bank file: **both** the import and the spread added in `followup_answers.ts`
- [ ] Quotes escaped (`\"`); backticks escaped if using a template literal
- [ ] No `#` headers (they don't render); `- ` / `1. ` lists do render — use them
      only for genuinely enumerable content
- [ ] Verification script: **0 unanswered, 0 orphan keys**
- [ ] `npx astro build` passes and the rendered count matches
