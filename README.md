# The Boring Spring Interview

Java and Spring Boot interview questions for a candidate with ~2 years of
experience. The answers are written to be **said out loud in a room**, not read
off a page.

**158 questions, 420 follow-ups, 12 categories.** Static Astro site, no backend.

## The format

Every question has three parts:

- **`answer`** — what the candidate actually says. Two to four short paragraphs:
  what it is, the mechanism or key rule, what breaks if you get it wrong. No
  padding to hit a length.
- **`explanation`** — the depth behind it. An analogy where the concept is
  abstract, `BAD` vs `GOOD` code with the trap labelled inline
  (`// NPE here`, `// race condition`), and where it shows up in a real app.
- **`followUps`** — what an interviewer asks next. At most three, and only where
  they cover ground the answer doesn't already reach.

Code uses real names — `OrderService`, `PaymentGateway`, `UserDto` — never `Foo`.

## Categories

| Category | Qs | Follow-ups |
|---|---:|---:|
| Core Java | 28 | 74 |
| Object-Oriented Programming | 7 | 18 |
| Spring Core | 17 | 42 |
| Spring Boot | 16 | 35 |
| Spring MVC / REST APIs | 15 | 31 |
| Spring Data JPA / Hibernate | 19 | 52 |
| Security | 10 | 30 |
| Microservices | 12 | 36 |
| Testing | 8 | 24 |
| Build Tools, Git & DevOps | 10 | 30 |
| System Design / Scenarios | 10 | 30 |
| Behavioral / Project-Based | 6 | 18 |

## Run it

```bash
npm install
npm run dev      # http://localhost:4321
npm run build    # static output in dist/
```

`⌘K` / `Ctrl+K` opens search.

## Editing content

All content is TypeScript under `src/data/` — `questions.ts` holds every
question, and each category has its own follow-up answer bank.

- **`ANSWERING_GUIDE.md`** — where things go, how follow-up answers attach to
  their questions, and the verification script
- **`answer_rules.md`** — how to write

Read both before editing. The build passes even when an answer is missing or
mis-keyed to its question, so the verification script is the real gate.

## Stack

Astro 7, TypeScript, Shiki for syntax highlighting. No client-side framework.
