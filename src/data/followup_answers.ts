/**
 * Answer bank for follow-up questions.
 * Keyed by the exact follow-up `text` so answers can be merged into the
 * FollowUp objects at runtime without touching questions.ts.
 *
 * Style (per answer_rules.md):
 *  - Length follows the question — no sentence quota, no padding
 *  - Bold the terms that actually matter
 *  - No GPT fluff, no "In conclusion", active voice, contractions
 *  - BAD/GOOD code only where it proves understanding
 */
import { followupAnswersSpring } from "./followup_answers_spring";
import { followupAnswersJpa } from "./followup_answers_jpa";
import { followupAnswersSpringCore } from "./followup_answers_spring_core";
import { followupAnswersSpringBoot } from "./followup_answers_spring_boot";
import { followupAnswersSecurity } from "./followup_answers_security";
import { followupAnswersMicroservices } from "./followup_answers_microservices";
import { followupAnswersTesting } from "./followup_answers_testing";
import { followupAnswersBuildGit } from "./followup_answers_build_git";
import { followupAnswersSystemDesign } from "./followup_answers_system_design";
import { followupAnswersBehavioral } from "./followup_answers_behavioral";

const baseAnswers: Record<string, string> = {
  // ===================== Q1: == vs equals =====================
  "What happens when you compare two `Integer` objects with `==` that fall within the Integer cache range (-128 to 127)?":
    "Java caches `Integer` instances for values **-128 to 127**, so `Integer a = 127; Integer b = 127;` makes `a == b` **true** — both point at the same cached object. Outside that range autoboxing gives distinct objects, so `Integer x = 200; Integer y = 200;` makes `x == y` **false**. The cache avoids object churn for common small values.\n\n**Never rely on `==` for boxed types** — use `.equals()` or unbox to `int` first.",

  "Why must `equals()` and `hashCode()` always be overridden together?":
    "The contract says: if `a.equals(b)` then `a.hashCode() == b.hashCode()`. Break it and `HashMap`/`HashSet` fall apart — two equal objects can land in different buckets, so `map.get(key2)` returns `null` even though `key1.equals(key2)`.\n\nOverride `equals` without `hashCode` and lookups become **non-deterministic**. Rule: derive `hashCode` from the **same fields** `equals` uses.",

  "What contract does `equals()` have to satisfy?":
    "**Reflexive** — `a.equals(a)` always true. **Symmetric** — `a.equals(b)` implies `b.equals(a)`. **Transitive** — `a.equals(b)` and `b.equals(c)` implies `a.equals(c)`. **Consistent** — repeated calls return the same result while fields don't change, and `a.equals(null)` must be `false`.\n\nMix types in `equals` (the `Point` vs `ColoredPoint` trap) and you break symmetry — collections then behave unpredictably.",

  // ===================== Q2: String / StringBuilder / StringBuffer =====================
  "Why is `String` immutable, and what does that buy you?":
    "Immutability gives four wins: the JVM can **intern** literals in the string pool (memory reuse), strings are **thread-safe** with zero synchronization, the `hashCode` is cached after first compute (fast `HashMap` keys), and a password or path passed to untrusted code can't be mutated afterward. The trade-off is every \"edit\" allocates a new object, which is why hot loops use `StringBuilder`.",

  "When would you choose `StringBuffer` over `StringBuilder` in modern code?":
    "Almost never. `StringBuffer` is `StringBuilder` with every method `synchronized`, which is slow and rarely what you actually need — if multiple threads touch a shared buffer you've usually got a bigger design problem. Prefer `StringBuilder` for single-threaded building, or `ConcurrentHashMap`/immutable strings for shared data. Reach for `StringBuffer` only if a legacy API forces it.",

  "What does the `+` operator compile to for string concatenation in a loop vs a single expression?":
    "A single `\"a\" + \"b\" + c` compiles to **one** `StringBuilder.append` chain — fine.\n\nInside a loop, `result += i` compiles to `result = new StringBuilder(result).append(i).toString()` — a fresh builder **and** a fresh String **every iteration**, creating O(n) garbage. The fix is one `StringBuilder` declared before the loop. Modern Java (9+) uses `invokedynamic` for some cases but the loop trap still bites in hot paths.",

  // ===================== Q3: abstract class vs interface =====================
  "Can an interface have `default` and `static` methods? When would you use each?":
    "**default** methods (Java 8) give interfaces a body so you can add methods without breaking existing implementers — that's how `List.stream()` got added to every List. **static** methods (also Java 8) are for utility/factory helpers on the interface itself, like `Comparator.comparing(...)`.\n\nUse `default` for API evolution and mixins; use `static` for stateless helpers that belong with the type.",

  "Can an abstract class have constructors? Can an interface?":
    "An **abstract class can** declare a constructor — it runs via `super(...)` when a subclass is instantiated, useful for initializing shared final fields. An **interface cannot** — it has no instance state to initialize. Interface `default`/`static` methods are bodies, not constructors.",

  "After Java 8, when do you still prefer an abstract class over an interface?":
    "When you need **instance state** (fields), a real constructor chain, or `protected`/package-private members — interfaces only give you constants (`public static final`) and method signatures. Also when classes share a clear **\"is-a\"** relationship with common behavior. Otherwise prefer interfaces — they're more flexible (a class can implement many, extend only one).",

  // ===================== Q4: ArrayList vs LinkedList =====================
  "What is the time complexity of random access, insert at end, and insert in middle for each?":
    "`ArrayList` — random access `O(1)`, insert at end amortized `O(1)`, insert/remove in middle `O(n)` (array shift). `LinkedList` — random access `O(n)` (walk from head), insert at end `O(1)` if you hold the tail node, insert/remove at a known node `O(1)` but **finding** the node is `O(n)`. So `LinkedList` only wins when you already have a `ListIterator` positioned there.",

  "In real Spring Boot apps, why is `ArrayList` almost always preferred over `LinkedList`?":
    "Cache locality and constant factors. `ArrayList` is one contiguous array — the CPU prefetcher loves it, so even an `O(n)` shift can beat `LinkedList`'s `O(1)` pointer chase on real hardware up to thousands of elements. App code rarely inserts in the middle; it appends and iterates, which is exactly `ArrayList`'s sweet spot. JPA repositories, DTO lists, `Collectors.toList()` — all default to array-backed.",

  "How does `ArrayList` grow when capacity is exceeded?":
    "When the backing array is full, `add()` allocates a **new array ~1.5x** the old size (`oldCapacity + (oldCapacity >> 1)`), copies elements over via `Arrays.copyOf`, then inserts. That copy is `O(n)` but **amortized `O(1)`** per add.\n\nIf you know the size up front, pass it to the constructor (`new ArrayList<>(10_000)`) to skip repeated resizing — a real win for big batches.",

  // ===================== Q5: HashMap internal =====================
  "What changed in Java 8 regarding collision handling?":
    "Before Java 8, collisions stacked entries in a **linked list**, so a malicious or unlucky set of keys degraded `get` to `O(n)` (the classic hash-DoS attack).\n\nJava 8 converts a bucket to a **red-black tree** once it holds **8+ entries** (and back to a list below 6), capping worst case at `O(log n)`. To tree, keys must be `Comparable`; otherwise it falls back to `System.identityHashCode` ordering.",

  "What is the load factor, and when does rehashing occur?":
    "Load factor defaults to **0.75** — the map rehashes (rebuilds a bigger internal array, re-bucketing every entry) when `size > capacity * loadFactor`. Rehashing is `O(n)` and pauses your thread, so size the map up front with `new HashMap<>(expectedSize)` if you know it. Lowering the load factor trades memory for fewer collisions.",

  "What is the difference between `HashMap` and `ConcurrentHashMap` for multi-threaded access?":
    "`HashMap` is **not thread-safe** — concurrent puts can corrupt internal structures (loops in a bucket list, lost data) and even infinite-loop pre-Java-8 under resizing.\n\n`ConcurrentHashMap` locks **per bin/segment** (striped), so reads are lock-free and writes rarely contend. For any cache or shared map in a web app, use `ConcurrentHashMap` — or `Collections.synchronizedMap` only as a last resort.",

  // ===================== Q6: HashMap / LinkedHashMap / TreeMap =====================
  "Which map would you use if you need insertion-order iteration?":
    "`LinkedHashMap` — it chains entries in a doubly-linked list alongside the hash buckets, so iteration returns keys in **insertion order** (or access order if you flip a constructor flag, which powers simple LRU caches). `HashMap` gives no order guarantees; `TreeMap` gives sorted-by-key order, not insertion order.",

  "What is the time complexity of `get`/`put` for each of these maps?":
    "`HashMap` and `LinkedHashMap` — `O(1)` average, `O(log n)` worst case (treeified buckets in Java 8). `TreeMap` — `O(log n)` for `get`/`put` because it's a red-black tree. The linked/tree overhead only affects iteration and ordering, not the core hash lookup cost.",

  "Can `TreeMap` store `null` keys? Can `HashMap`?":
    "`HashMap` allows **one `null` key** (bucket 0) and any number of `null` values. `TreeMap` **cannot** store a `null` key — it uses the key's `compareTo`/`Comparator` to place it, which throws `NullPointerException` on `null`. `ConcurrentHashMap` bans `null` keys **and** values to avoid ambiguity in concurrent reads.",

  // ===================== Q7: HashSet / LinkedHashSet / TreeSet =====================
  "How is `HashSet` implemented internally in relation to `HashMap`?":
    "`HashSet` is literally a `HashMap` under the hood — each element is stored as a **map key**, with a single dummy `PRESENT` object as the value. So `add(e)` is `map.put(e, PRESENT)`, `contains(e)` is `map.containsKey(e)`. That's why HashSet's `O(1)` lookup and hashing behavior are identical to HashMap's.",

  "When would you use `TreeSet` over `HashSet`?"
    : "When you need **ordered iteration** — sorted by natural ordering or a `Comparator` (e.g., a leaderboard, a priority queue's backing set, or range queries via `subSet`/`headSet`). Cost is `O(log n)` per op vs `O(1)`. If you only check membership and never iterate in order, `HashSet` wins.",

  "Does `HashSet` allow `null` elements? Does `TreeSet`?":
    "`HashSet` allows **one `null`** (backing HashMap allows a null key). `TreeSet` **does not** — it compares elements with `compareTo`/`Comparator`, and calling `compareTo(null)` throws `NullPointerException`. Same null story as their Map counterparts.",

  // ===================== Q8: immutability =====================
  "Why does an immutable class also need to be `final`?":
    "Because a subclass can undo every guarantee you just made. Leave the class open and someone writes `class MutableMoney extends Money`, adds a mutable field, and overrides `getAmount()` to return whatever it likes. Your code accepts it — it's still a `Money` — so every caller that trusted immutability is now holding something that changes.\n\nIt also breaks the thread-safety guarantee people rely on: safe publication of an immutable object depends on `final` fields being frozen at construction, and a subclass that adds non-`final` state loses that.\n\nMarking the class `final` is the blunt fix. If you need to allow subclasses, make the **constructor private** and hand out instances through a static factory — you control what actually gets built. Records are `final` for exactly this reason.",

  "How do you handle mutable fields (like `Date` or `List`) inside an immutable class?":
    "**Defensive copies both ways.** In the constructor: `this.date = new Date(input.getTime())` — never store the reference the caller passed, or they can mutate it later. In the getter: return `new Date(this.date.getTime())`, or for collections return an unmodifiable view (`Collections.unmodifiableList`) or a copy. Modern code uses `java.time` (already immutable) and `List.of(...)`.",

  "Why are immutable objects naturally thread-safe?":
    "If state can't change after construction, **no thread can observe it changing** — so there's no race, no need for locks, and reads can run in parallel safely. That's why `String`, `BigDecimal`, and `java.time` types are safe to share across threads without synchronization. Mutable state is what forces locking; remove the mutation and the concurrency problem vanishes.",

  // ===================== Q9: checked vs unchecked =====================
  "Give examples of each from the JDK.":
    "**Checked** — `IOException`, `SQLException`, `ClassNotFoundException`: things the compiler forces you to catch or declare because the environment can cause them. **Unchecked** (extend `RuntimeException`) — `NullPointerException`, `IllegalArgumentException`, `ArrayIndexOutOfBoundsException`, `ArithmeticException`: programmer errors, not environmental. The split is \"caller can recover\" vs \"caller has a bug\".",

  "When should you create a custom checked exception vs an unchecked one in a Spring service?":
    "Make it **unchecked** (extend `RuntimeException`) — Spring's `@Transactional` only rolls back on unchecked exceptions by default, and modern style avoids forcing `throws` clauses up the call stack.\n\nReserve **checked** exceptions for cases where the caller has a meaningful recovery path **and** forgetting to handle it is dangerous (rare in app code). Most teams use `ResponseStatusException` or a custom `RuntimeException` subclass.",

  "What is the difference between `throw` and `throws`?":
    "`throw` **actually raises** an exception object at runtime — `throw new IllegalStateException(...)`. `throws` is a **declaration** in a method signature telling the compiler this method might emit that checked exception — `void read() throws IOException`. `throw` is a statement (one per execution path); `throws` is a comma-separated list on the signature.",

  // ===================== Q10: try-with-resources =====================
  "What interface must a resource implement to work with try-with-resources?":
    "**`AutoCloseable`** (since Java 7). Its single method `close()` is called automatically in reverse declaration order. The older `Closeable` (from `java.io`) extends `AutoCloseable` but declares `close()` to throw `IOException` — both work with the try-with-resources syntax.",

  "What happens to suppressed exceptions when both `try` and `close()` throw?":
    "The exception thrown from the **try body** is the primary one that propagates; the one from `close()` is **attached as a suppressed exception** and retrievable via `primary.getSuppressed()`.\n\nWithout try-with-resources, the `close()` exception would silently clobber the real error — this is exactly why you should never write manual try/finally close logic.",

  "Can you declare multiple resources in a single try-with-resources block?":
    "Yes — separate them with semicolons, and they're **closed in reverse order** of declaration (last declared closes first): `try (var fis = new FileInputStream(in); var bis = new BufferedInputStream(fis))`. Reverse order matters because a wrapper's `close()` may need its underlying stream still open.",

  // ===================== Q11: autoboxing / unboxing =====================
  "What is the difference between `int` and `Integer` in terms of memory and nullability?":
    "`int` is a **primitive** — 4 bytes on the stack, default `0`, **cannot be null**. `Integer` is a heap **object** (~16 bytes with object header), defaults to `null`, and supports `null` which is why JPA entity fields use it. Unbox a `null` `Integer` and you get `NullPointerException` — the classic DB-null-meets-primitive trap.",

  "How can autoboxing cause a `NullPointerException`?":
    "When you assign a `null` `Integer` to an `int` (explicitly or via an operator), the JVM calls `intValue()` on `null` → `NullPointerException`. Example: `Integer x = null; int y = x;` or `map.get(\"missing\") + 1` where the get returns `null`. The trap is the NPE shows up at a **seemingly innocent** arithmetic line, not where the null came from.",

  "Why can comparing boxed integers with `==` be surprising due to caching?":
    "Java caches `Integer` for **-128..127**, so `Integer a = 100, b = 100; a == b` is `true` (same cached object), but `Integer a = 200, b = 200; a == b` is `false` (distinct objects). The code \"works\" in testing with small values then silently breaks in prod with larger ones. **Always `.equals()` or unbox** for boxed comparisons.",

  // ===================== Q12: final / finally / finalize =====================
  "Can a `final` method be overridden? Can a `final` class be extended?":
    "**No to both.** A `final` method can't be overridden in a subclass (used to lock in critical behavior, like `Object.getClass()`). A `final` class can't be extended at all (`String`, `Integer`, `LocalDate`). Marking a class `final` is also what makes it safe to use as an immutable type.",

  "Does `finally` always execute? What about `System.exit()`?":
    "`finally` runs on **normal exit, exception, return, or break** out of the try — that's its whole point. The exceptions: `System.exit()` kills the JVM before `finally` runs, an infinite loop or thread `kill`/`InterruptedException` can prevent it, and a power loss obviously does too. So `finally` is \"always\" modulo JVM termination.",

  "Why is `finalize()` deprecated, and what should you use instead?":
    "`finalize()` has no guarantee of **when or if** it runs, can resurrect objects, slows GC dramatically, and was a frequent source of leaks. It's deprecated since Java 9 and removed/for-removal in newer versions. Use **`try-with-resources`** (for files/sockets/locks) or **`Cleaner`/`PhantomReference`** for native-handle cleanup where the caller might forget.",

  // ===================== Q13: functional interfaces =====================
  "What is the `@FunctionalInterface` annotation for, and is it mandatory?":
    "A functional interface has **exactly one abstract method** (SAM) so a lambda can implement it. The `@FunctionalInterface` annotation is **optional** — the compiler treats any SAM interface as functional regardless. But the annotation makes the compiler **reject** accidental second abstract methods, so it's documentation + a safety net. Always add it.",

  "Explain `Predicate`, `Function`, `Consumer`, and `Supplier` with one-line use cases.":
    "**`Predicate<T>`** — `T -> boolean`, e.g. `filter(u -> u.isActive())`. **`Function<T,R>`** — `T -> R`, e.g. `map(User::getEmail)`. **`Consumer<T>`** — `T -> void`, e.g. `forEach(System.out::println)`. **`Supplier<T>`** — `() -> T`, e.g. lazy `() -> expensiveDefault()` or `Stream.generate`.",

  "Can a functional interface have default methods?":
    "Yes — any number of `default` methods, as long as there's **exactly one abstract method**. `Function` itself has `andThen`, `compose`, `identity` as defaults/statics and is still functional. Only the single abstract method is what the lambda implements; the defaults come for free.",

  // ===================== Q14: lambdas =====================
  "What is the difference between a lambda and an anonymous inner class regarding `this`?":
    "In a lambda, **`this` refers to the enclosing instance** — lambdas don't introduce a new scope. In an anonymous inner class, `this` refers to **the anonymous instance itself**, and you write `OuterClass.this` to reach the outer one. This is why lambdas can't have their own instance fields and serialize more cleanly.",

  "What are method references, and when would you use them instead of lambdas?":
    "A method reference (`Object::method`, `Class::staticMethod`, `Class::new`) is shorthand for a lambda that just forwards its arguments to an existing method. Use it when the lambda body is **already a single method call** — `list.forEach(System.out::println)` beats `list.forEach(x -> System.out.println(x))`. If you need to transform args or call two methods, keep the lambda.",

  "Can a lambda capture and modify a local variable? What is effectively final?":
    "A lambda can **read** a local variable only if it's **`final` or effectively final** (never reassigned). It **cannot modify** the captured variable — that would break concurrency semantics if the lambda runs later or on another thread. To mutate, use a mutable holder: an array, `AtomicInteger`, or a collection. Fields of the enclosing instance are fair game because they aren't captured by value.",

  // ===================== Q15: Stream API =====================
  "Are streams lazy? Give an example of short-circuiting.":
    "Yes — intermediate operations (`map`, `filter`) do **nothing** until a terminal operation (`collect`, `count`, `forEach`) runs. Short-circuiting terminals stop early: `findFirst()`, `findAny()`, `anyMatch(...)`, `limit(n)`. So `stream.filter(expensive).findFirst()` only calls `expensive` until the first match, not for the whole stream — a common performance win.",

  "What is the difference between `findFirst()` and `findAny()`?":
    "`findFirst()` returns the **first element in encounter order** — deterministic, but on a parallel stream it forces ordering and serializes. `findAny()` returns **any matching element**, often faster on parallel streams because any thread's hit wins. Use `findAny()` when you don't care which one (e.g., \"does any exist\") and `findFirst()` when order matters.",

  "When should you use a parallel stream, and what are the pitfalls?":
    "Only for **CPU-heavy, large, ordered-independent** work where the per-element cost dwarfs the parallel overhead — like transforming 100k records.\n\nPitfalls: it uses the common `ForkJoinPool`, so a blocking op (DB call, HTTP) can starve the whole app; ordering and shared mutable state break correctness; and small streams run slower. **Never** parallelize I/O-bound or stateful pipelines.",

  // ===================== Q16: map vs flatMap =====================
  "Give a concrete example where `flatMap` is required (e.g., list of lists).":
    "When each element produces a **sub-stream** you want to flatten. `List<Order> orders; orders.stream().flatMap(o -> o.getItems().stream()).collect(toList())` gives every line item across all orders as one flat list. `map` would give you `Stream<List<Item>>` — a stream of lists — which is almost never what you want.",

  "How does `flatMap` relate to `Optional`?":
    "`Optional.flatMap` takes a function that returns an `Optional` and **avoids double-nesting**. `opt.flatMap(o -> maybeLookup(o.getId()))` yields `Optional<Value>`, not `Optional<Optional<Value>>`. Use `map` when the inner function returns a plain value, `flatMap` when it returns an `Optional` — same pattern as streams.",

  "What does `mapToInt` / `flatMapToInt` buy you over boxed streams?":
    "They produce a specialized `IntStream` of **primitive `int`** values, avoiding boxing overhead and giving numeric terminals like `sum()`, `average()`, `max()` without a reducer. `orderItems.stream().mapToInt(Item::getQuantity).sum()` is cleaner and faster than `reduce(0, Integer::sum)` on a boxed `Stream<Integer>`.",

  // ===================== Q17: Comparable vs Comparator =====================
  "Where is natural ordering defined, and when would you use an external Comparator?":
    "`Comparable` defines the **natural ordering** via `compareTo(T)` on the class itself — one canonical sort, like `String` alphabetical. `Comparator` is a **separate strategy object** (`compare(a,b)`) you pass at the call site for ad-hoc ordering, e.g., `list.sort(Comparator.comparing(User::getCreatedAt).reversed())`. Implement `Comparable` for the obvious default; use `Comparator` for everything else.",

  "What happens if `compareTo` is inconsistent with `equals`?":
    "Sorted collections like `TreeSet`/`TreeMap` use `compareTo` **instead of `equals`** to decide what's a duplicate. If `compareTo` returns 0 for two objects that `equals` says are different, `TreeSet.add` silently drops the second one.\n\nThe contract: `(x.compareTo(y)==0) == x.equals(y)`. `BigDecimal` famously breaks it — `new BigDecimal(\"1.0\")` and `new BigDecimal(\"1.00\")` are **not equal** by `equals` (it compares scale as well as value) but `compareTo` returns **0**. So a `HashSet` keeps both and a `TreeSet` keeps one, from the same pair of objects.",

  "How do you sort a list of objects by multiple fields using Comparator chaining?":
    "Use `Comparator.thenComparing`: `Comparator.comparing(User::getLastName).thenComparing(User::getFirstName).thenComparingInt(User::getAge)`. Each stage is the tiebreaker for the previous one. Tack on `.reversed()` at the end or `.reversed()` on a single extractor to flip just that field.",

  // ===================== Q18: diamond problem =====================
  "What happens if two interfaces provide the same default method — how do you resolve it?":
    "It's a **compile error** unless the class overrides the method. The rule (\"class wins\"): a concrete superclass method beats any interface default, and if two interfaces provide competing defaults you **must** disambiguate with `InterfaceName.super.method()`. This avoids the C++ diamond ambiguity by forcing an explicit choice.",

  "Why doesn't Java allow multiple class inheritance?":
    "Because classes carry **state and constructors**. If `Employee` extended both `Person` and `Auditable` and each declared a `name` field, the JVM couldn't say which `name` the instance holds or what order the constructors run.\n\nInterfaces multiply-inherit safely because they hold **no instance state** — a `default` method is behaviour only, so a collision has exactly one resolution and the compiler makes you write it via `Interface.super.method()`. That's why `implements A, B, C` is fine but `extends A, B` isn't.",

  "How does class method priority work when a class implements an interface with a default method it also inherits from a superclass?":
    "**The class hierarchy always wins, silently.** If `BaseService` declares `void log()` and `Auditable` supplies a `default void log()`, then `class OrderService extends BaseService implements Auditable` runs **`BaseService.log()`** — no compile error, no warning that the default even exists.\n\nDefaults only fill gaps the superclass chain doesn't already cover, which is what lets you add one without breaking implementers. Want the interface version? Override it and call `Auditable.super.log()`.",

  // ===================== Q19: overloading vs overriding =====================
  "Can two methods differ only by their return type?":
    "**Overloading** — return type alone doesn't distinguish overloads; the signature (name + param types) must differ, so `int f()` and `String f()` is illegal. **Overriding** — return type can be a **covariant subtype**: a subclass override may return `Optional<Order>` when the parent declared `Optional<? extends Entity>`, or `MyBuilder` when the parent returned `Builder`. Parameter types must match exactly.",

  "Can you override a static method? What is method hiding?":
    "You **cannot override** a static method — statics are resolved by the **reference type at compile time**, not dynamically dispatched. Re-declaring the same static signature in a subclass is called **method hiding**: `Parent p = new Child(); p.staticMethod()` calls `Parent`'s version, unlike instance methods. This is a classic \"why didn't my override fire\" trap.",

  "What access modifier rules apply when overriding a method?":
    "You can **widen** access but **never narrow** it — override a `protected` method as `public`, but not a `public` method as `protected`. The override must keep the same (or a covariant) return type, can throw fewer/narrower checked exceptions, and cannot be more restrictive. Violate any of these and the compiler rejects the \"override\" — often leaving you with an accidental overload instead.",

  // ===================== Q20: static =====================
  "When are static blocks executed relative to constructors?":
    "**Static initializers run once, when the class is first loaded**, before any instance constructor and before `main`. Instance initializers and constructors run **per object**, at `new` time. Order within a class: static blocks top-to-bottom at class load, then (per instance) instance initializers top-to-bottom then the constructor body.",

  "Why is static mutable state a problem in a Spring application?":
    "Because a `static` field is shared by every thread in the JVM, and a Spring app is serving requests on many threads at once. A `static Map` cache or a `static SimpleDateFormat` in a `@Service` is an unsynchronized shared mutable — you get corrupted data or garbled dates under load, and it won't reproduce on your laptop with one user.\n\nIt also defeats the container. Statics aren't injected, so you can't swap them per profile or mock them in a test, and state written by one test leaks into the next because the class stays loaded across the whole suite.\n\nKeep beans stateless and put shared state where it's managed — a bean field on a singleton is fine if it's immutable, and anything genuinely shared and mutable belongs in a cache or the database. `static final` constants are not the problem; `static` **mutable** state is.",

  "What are static imports, and when are they appropriate?":
    "`import static` lets you use a class's static members by **unqualified name** — `assertEquals(...)` instead of `Assertions.assertEquals(...)`. Appropriate for test classes (AssertJ/JUnit) and heavy math (`import static java.lang.Math.*`). Avoid it for application code where the qualifying class adds clarity — `Color.RED` reads better than a bare `RED`.",

  // ===================== Q21: generics =====================
  "What is type erasure, and how does it limit generics at runtime?":
    "Generic type parameters are **erased** to their bounds (`Object` by default) during compilation — at runtime `List<String>` and `List<Integer>` are both just `List`. Consequences: you can't do `instanceof List<String>`, can't `new T()`, can't create generic arrays, and a single `.class` is shared. Erasure is what lets generics interop with pre-Java-5 code.",

  "What is the difference between `List<?>`, `List<Object>`, and `List<? extends Number>`?":
    "`List<Object>` accepts **any Object** and you can add to it. `List<?>` (unbounded wildcard) accepts any list but you **can't add** (except `null`) — read-only-ish. `List<? extends Number>` accepts `List<Integer>`, `List<Double>` etc. but is also **covariant read-only**. Wildcards exist to express variance; raw `List<Object>` defeats generics.",

  "What are PECS (Producer Extends, Consumer Super) guidelines?":
    "**P**roducer **E**xtends: if a source **feeds you** values, type it `List<? extends T>` (read T out). **C**onsumer **S**uper: if a sink **takes** values from you, type it `List<? super T>` (write T in). `Collections.copy(List<? super T> dest, List<? extends T> src)` is the textbook example. Mixing read+write on a wildcard usually forces a plain `List<T>`.",

  // ===================== Q22: volatile =====================
  "Does `volatile` guarantee atomicity for compound operations like `count++`?":
    "**No.** `volatile` guarantees **visibility** (every thread sees the latest write) but `count++` is read-modify-write — three separate ops — so two threads can both read, both increment, both write, losing an update. For atomic counters use `AtomicInteger.incrementAndGet()` or `synchronized`. `volatile` is enough for a single boolean flag like `boolean stopped`.",

  "What is the happens-before relationship established by volatile?":
    "A write to a `volatile` field **happens-before** every subsequent read of that field — meaning everything the writing thread did **before** the volatile write is visible to the reading thread **after** it reads the new value. It's a memory barrier, not just a cache flush. This is how you safely publish a fully-constructed object via a `volatile` reference.",

  "How does `volatile` differ from `synchronized`?":
    "`volatile` gives **visibility + ordering** for a single field with **no atomicity** and no lock — cheap, good for flags and safe publication. `synchronized` gives **visibility + atomicity** via a mutual-exclusion lock — needed for compound actions and critical sections. `volatile` never blocks; `synchronized` does. Use `volatile` for one field, `synchronized`/`Atomic*` for everything else.",

  // ===================== Q23: Thread vs Runnable =====================
  "What is the difference between `Runnable` and `Callable`?":
    "`Runnable`'s `run()` returns **void** and can't throw checked exceptions — fire-and-forget work. `Callable<V>`'s `call()` **returns a value** and may throw checked exceptions, so it works with `ExecutorService.submit()` returning a `Future<V>`. Use `Runnable` for side-effecting tasks, `Callable` when you need a result or want exceptions surfaced via `Future.get()`.",

  "What is the difference between `start()` and `run()`?":
    "`start()` **spawns a new OS thread** and that thread invokes `run()`. Calling `run()` directly is just a **normal method call on the current thread** — no concurrency. The classic bug: `new Thread(task).run()` looks fine but runs synchronously on the caller. Always `start()`; never `run()`.",

  "What are the states in a thread's lifecycle?":
    "**NEW** (created, not started) → **RUNNABLE** (after `start()`, may be running or ready on the OS scheduler) → **BLOCKED** (waiting on a monitor lock) / **WAITING** (`wait()` with no timeout) / **TIMED_WAITING** (`sleep`, `wait(ms)`) → **TERMINATED** (run returned). `Thread.getState()` returns these; `BLOCKED` vs `WAITING` distinction matters when diagnosing lock contention.",

  // ===================== Q24: synchronized method vs block =====================
  "What object is locked when you synchronize on a static method vs an instance method?":
    "A `synchronized` **instance** method locks **`this`** — the specific instance. A `synchronized` **static** method locks the **`Class` object** (`MyClass.class`) shared by all instances. That's why a static sync and an instance sync on the same class **don't block each other** — different locks. Two threads calling one on the same instance and the other on the class can run in parallel.",

  "Why is synchronizing on a smaller critical section usually preferred?":
    "Holding a lock **blocks every other thread** waiting on it, so the less code under the lock the higher the concurrency. A `synchronized` method holds the lock for the whole body even if only 3 lines touch shared state; `synchronized(lock){ /* just those 3 lines */ }` lets other threads run the rest. Smaller critical sections = less contention = better throughput.",

  "What is a race condition, and how does synchronization prevent it?":
    "A race condition is when correctness depends on the **timing** of thread interleavings — classic `count++` losing updates, or check-then-act (`if (map.get(k)==null) map.put(k,v)`) allowing duplicate puts. `synchronized` makes the read-modify-write or check-then-act **atomic** by serializing it on one lock, so no other thread can observe or mutate the shared state mid-flight.",

  // ===================== Q25: ExecutorService =====================
  "What is the difference between `execute()` and `submit()`?":
    "`execute(Runnable)` runs the task and returns **void** — fire-and-forget. `submit(Callable/Runnable)` returns a **`Future`** you can `get()` to retrieve the result or block until done, and exceptions surface as `ExecutionException` on `get()`. Use `execute` for logging/cleanup tasks, `submit` whenever you care about the outcome.",

  "What is a `Future` and how do you get results from async tasks?":
    "A `Future` is a **handle to a pending result**. `Future<Integer> f = executor.submit(callable); ... Integer r = f.get();` — `get()` blocks until done, or `get(timeout, unit)` throws `TimeoutException`. `isDone()` polls; `cancel(true)` interrupts. For composable async, `CompletableFuture` is far more powerful — chaining, combining, error callbacks.",

  "How do you configure a custom thread pool in a Spring Boot app?":
    "Define an `Executor` bean and reference it via `@Async(\"name\")`. A `ThreadPoolTaskExecutor` lets you set `corePoolSize`, `maxPoolSize`, `queueCapacity`, and a `RejectedExecutionHandler`. **Always name the threads** (`new CustomizableThreadFactory(\"orders-\"))`) for logs/thread dumps. Critically: `@Async` only works on **public methods called from outside the bean** (proxy limitation).",

  // ===================== Q26: deadlock =====================
  "What conditions all have to hold at once for a deadlock to form?":
    "**Mutual exclusion** (resource held exclusively), **hold and wait** (holding one resource while requesting another), **no preemption** (can't force-release), and **circular wait** (a cycle of threads each waiting on the next). Break **any one** — typically circular wait by enforcing a global lock-ordering — and deadlocks can't occur.",

  "How would you diagnose a deadlock in a JVM that's already hung?":
    "`jstack <pid>` prints every thread's stack and state; a deadlock shows threads stuck in `BLOCKED` waiting on locks held by each other — `jstack` even prints a \"Found one Java-level deadlock\" section. Alternatives: `jcmd <pid> Thread.print`, VisualVM, or `kill -3 pid` to dump to stdout. In prod, automate periodic thread dumps so you catch it when it happens.",

  "How do lock ordering and timeouts help prevent deadlocks?":
    "**Lock ordering** — always acquire locks in a fixed global order (e.g., by account id), which structurally breaks circular wait. **`tryLock(timeout)`** — give up after N seconds and release what you hold, so a cycle unwinds instead of hanging forever. Combine both: ordering for the common case, timeouts as a safety net.",

  // ===================== Q27: garbage collection =====================
  "What is the generational hypothesis, and how do young/old gen work?":
    "Most objects **die young** (temp vars, request DTOs); the few that survive tend to live long (caches, singletons). So the heap is split: **young gen** (Eden + two survivor spaces) collected often and fast via copying; objects that survive several young collections get **promoted** to **old/tenured gen**, scanned rarely. This makes GC dramatically cheaper than full-heap sweeps.",

  "Which collector does a modern JVM use by default, and when would you change it?":
    "**G1** (default since Java 9) — predictable pause times, good general purpose. **ZGC/Shenandoah** — sub-millisecond concurrent pauses for latency-critical big heaps (100GB+). **Parallel** — maximize throughput for batch jobs where pauses don't matter. Java 17+: G1 is the safe default; reach for ZGC only if you measure pause-time problems.",

  "What is the difference between `StackOverflowError` and `OutOfMemoryError`?":
    "`StackOverflowError` — a thread's call stack exceeded its size (usually **unbounded recursion**), only that thread dies. `OutOfMemoryError` — the **heap (or metaspace/native)** can't fit another allocation; the whole JVM is in trouble. `OOM: Java heap space` = heap full; `OOM: Metaspace` = class metadata explosion (often a leaky dynamic proxy / classloader).",

  // ===================== Q28: reference types =====================
  "When would you use a `WeakHashMap`?":
    "When keys are objects you **don't want to keep alive** — classloader-scoped caches, listener registries, metadata keyed on instances. Once the key has no strong references elsewhere, GC clears the entry automatically. Classic use: associating extra data with a classloader/instance without preventing its collection.",

  "How do soft references relate to memory-sensitive caches?":
    "A `SoftReference` is cleared by the GC **only when memory is low** — perfect for a cache that should survive if there's room but surrender entries to avoid `OutOfMemoryError`. The JVM keeps soft refs as long as feasible, using a recency-of-access policy. `SoftReference<Value>` wrapping cache values is the simplest \"best-effort\" memory cache.",

  "What are phantom references used for in resource cleanup?":
    "`PhantomReference` notifies you **after** an object is finalized and ready to be reclaimed — you poll a `ReferenceQueue` and release the associated native resource (file handle, direct buffer) at that point. Unlike soft/weak, `get()` always returns `null`, so you can't resurrect it. They back modern `Cleaner`-based resource management as a safety net when callers forget to `close()`.",

  // ===================== Q29: four pillars of OOP =====================
  "Give a Spring-specific example of encapsulation (e.g., service hiding repository details).":
    "A `UserService` exposes `register(dto)` but internally calls `userRepository.save(...)`, `emailClient.send(...)`, and `auditLog.record(...)`. Callers (controllers) never see the repository or email client — those are **private collaborators**. Swap `UserRepository` from JPA to a Mongo impl and the controller doesn't change. That's encapsulation hiding implementation details behind a stable method.",

  "How does polymorphism show up with Spring dependency injection?":
    "You declare a field as the **interface** type — `private PaymentGateway gateway;` — and Spring injects whichever concrete bean is active (Stripe in prod, Fake in tests, `@Profile(\"mock\")`). Every call site uses `gateway.charge(...)` and the **right implementation runs at runtime** based on the injected bean. DI is essentially polymorphism wired up by the container instead of `new`.",

  "What is the difference between abstraction and encapsulation?":
    "**Abstraction** is about *what* a thing does — hiding complexity behind an interface (`interface PaymentGateway { charge(); }`) so callers don't think about Stripe vs PayPal internals.\n\n**Encapsulation** is about *how* it's built — bundling state + behavior and controlling access via `private` fields/getters. Abstraction hides design; encapsulation hides data. A well-designed class uses both: abstract interface, encapsulated implementation.",

  // ===================== Q30: polymorphism =====================
  "Why is overloading resolved before the program even runs?":
    "Overloading is resolved by the compiler based on the **static (declared) argument types** at the call site — that's \"static\" or \"compile-time\" polymorphism. `print(int)` vs `print(String)` is picked at compile time, before any object exists. It's sometimes called *ad-hoc* polymorphism because each overload is effectively a separate method sharing a name.",

  "How does the JVM know which overridden method to call?":
    "Every object carries a pointer to its **class's virtual method table (vtable)**. When you call `animal.speak()` via a `Animal` reference, the JVM looks up the `speak` slot in the **actual runtime class's** vtable (e.g., `Dog`), not the declared type. That indirection is dynamic dispatch — the override always wins. `final`, `private`, and `static` methods skip the vtable because they can't be overridden.",

  "Can constructors be polymorphic?":
    "**No.** Constructors aren't inherited and aren't overridden, so there's no dynamic dispatch on them — you always call a specific constructor via `new ClassName(...)`. What you *can* do is hide construction behind a **factory method** that returns the supertype and picks the concrete class: `static Animal create(...)` returning `new Dog()`. Polymorphism of creation is achieved via factories, not constructors.",

  // ===================== Q31: composition vs inheritance =====================
  "What does `extends` commit you to that holding a field doesn't?":
    "To the parent's **entire public surface, permanently**. `class Order extends PriceCalculator` means every public method on `PriceCalculator` is now part of `Order`'s API whether it makes sense for an order or not, and you can never take one away. You've also spent your one superclass slot, and you're exposed to the parent changing under you.\n\nHolding a field commits you to nothing: `class Order { private PriceCalculator calc; }` exposes only what you choose to delegate, lets you swap the collaborator per environment or per test, and lets you hold several. That's the practical content of Effective Java Item 18.",

  "How does composition help avoid the fragile base class problem?":
    "With inheritance, a parent class change (renaming a protected method, shifting call order) can silently break subclasses it never knew about — the \"fragile base class.\" Composition only depends on the parent's **public API**, so internal refactors don't ripple. You also avoid unintended method inheritance (a subclass accidentally overriding something it didn't mean to expose).",

  "Give an example where inheritance is still the right choice.":
    "When there's a true **\"is-a\"** relationship and the subclass genuinely specializes the parent's contract — `ArrayList extends AbstractList`, `HashSet extends AbstractSet`, or your `BaseEntity` with `id`/`createdAt` fields and lifecycle hooks. The framework controls both sides, the hierarchy is shallow, and the subclass truly substitutes for the parent everywhere. If you can't say \"B is an A\" in plain English, use composition instead.",

  // ===================== Q32: coupling and cohesion =====================
  "How do the controller, service, and repository layers reflect cohesion and coupling?":
    "Layers (controller → service → repository) keep each layer **cohesive** — controllers do HTTP, services do business rules, repositories do persistence — so a change in one concern lives in one place. Low coupling between layers (talking only through interfaces) means swapping the repository impl or mocking it in tests doesn't ripple. The payoff: localized change, easy testing, parallel team work.",

  "How does dependency injection reduce coupling?":
    "Instead of `new StripeGateway()` hardcoded inside `PaymentService`, the service declares `PaymentGateway gateway` and the **container injects** it. `PaymentService` depends on the **interface**, not a concrete class — so prod wires Stripe, tests wire a fake, and neither change touches the service. DI replaces `new` (the source of tight coupling) with a contract.",

  "What is the difference between tight and loose coupling with a code example?":
    "Tight: `class OrderService { private StripeGateway g = new StripeGateway(); }` — knows the concrete class, can't test without Stripe, recompile to change providers. Loose: `class OrderService(OrderGateway g)` (constructor-injected interface) — depends on an abstraction, swap the impl freely, mock in tests. The loose version doesn't care *who* implements the gateway, only *that* it honors the contract.",

  // ===================== Q33: SOLID =====================
  "How does the Open/Closed Principle show up with Strategy pattern?":
    "`PaymentService` holds a `PaymentStrategy` interface with implementations `CardStrategy`, `UpiStrategy`, `WalletStrategy`. Adding `CryptoStrategy` means **a new class** — you don't edit `PaymentService` or any existing strategy. The service is **open for extension** (new strategies) but **closed for modification** (existing code untouched). That's OCP in action.",

  "How does Interface Segregation apply to Spring repository interfaces?":
    "Don't force a repo to extend a fat interface with methods it doesn't need. Spring Data lets you split: `interface ReadRepository<T> { findById(...); }`, `interface WriteRepository<T> { save(...); }`, and have `OrderRepository extends ReadRepository, WriteRepository` while `ReadOnlyCatalogRepository extends ReadRepository`. Clients depend only on what they use — no client forced to call `delete()` it shouldn't.",

  "What does a Single Responsibility violation look like in a controller?":
    "A `UserController` that validates input, calls the DB directly (`userRepo.save`), sends a welcome email, builds a PDF invoice, and formats the JSON response. Six reasons to change.\n\nFix: controller only does HTTP binding + response; validation → `@Valid`; persistence → `UserService`; email → `EmailService`; PDF → `InvoiceService`. Each class has one reason to change — one axis of modification.",

  // ===================== Q34: design patterns =====================
  "Where does Spring itself use Singleton and Factory patterns?":
    "Every `@Component`/`@Service`/`@Repository` bean is a **Singleton** by default — one instance per context, shared across the app, which is why you must keep them stateless. **Factory** shows up in `BeanFactory`/`ApplicationContext` creating and wiring beans, plus `FactoryBean<T>` for custom creation logic (e.g., creating a Hibernate `SessionFactory` or a third-party client).",

  "When would you use Facade vs Adapter in an integration layer?":
    "**Adapter** makes an existing incompatible interface look like one you need — wrapping a legacy SOAP client behind your `PaymentGateway` interface so callers don't know SOAP exists.\n\n**Facade** simplifies a complex subsystem behind one coarse-grained entry point — `OrderFacade.placeOrder()` orchestrating inventory, payment, shipping, and notification so callers see one method. Adapter is about *shape mismatch*; Facade is about *reducing surface area*.",

  "How does the Builder pattern help with complex DTO or entity construction?":
    "A `UserDto` with 12 optional fields is painful via a telescoping constructor (`new UserDto(name, null, null, email, null, ...)`). Builder gives fluent `UserDto.builder().name(...).email(...).role(ADMIN).build()`, makes required fields explicit, produces an **immutable** object, and reads clearly at the call site. Lombok's `@Builder` does this with one annotation; it's the standard for request/response DTOs.",

  // ===================== Q35: Singleton threading =====================
  "Explain double-checked locking and why `volatile` is needed.":
    "The pattern: check `if (instance == null)` un-synchronized first (fast path), then `synchronized` and check again before creating. Without `volatile` on the instance field, another thread can see a **partially constructed** object — the reference is published before the constructor finishes, due to instruction reordering. `volatile` adds the happens-before barrier that guarantees a fully-constructed object is visible. Pre-Java-5 this was actually broken; Java 5+ memory model fixed it.",

  "How does an enum-based Singleton avoid these issues?":
    "An `enum` Singleton (`enum Singleton { INSTANCE; }`) gets thread safety, lazy initialization, and serialization guarantees **for free** from the JVM — the language guarantees one instance per enum constant and handles reflection/serialization attacks that a hand-rolled singleton is vulnerable to. It's the cleanest classic Singleton. Drawback: can't lazily init *parameters* and doesn't fit when you need to extend a class.",

  "How does Spring's default singleton scope differ from a classic Singleton implementation?":
    "Spring's singleton is **per `ApplicationContext`** — one bean instance *per container*, not one per JVM/classloader like the Gang-of-Four Singleton. Run two contexts (e.g., parent + child, or tests) and you get two \"singletons.\" Spring manages lifecycle and injection; you never write double-checked locking. It's a scope, not a language-level guarantee — which is why it's safer and more testable than the classic pattern.",
};

/**
 * Merged bank: the core Java/OOP answers above, plus the Spring-category
 * answers. If a key exists in both, the spring file wins (last spread).
 */
export const followupAnswers: Record<string, string> = {
  ...baseAnswers,
  ...followupAnswersSpring,
  ...followupAnswersJpa,
  ...followupAnswersSpringCore,
  ...followupAnswersSpringBoot,
  ...followupAnswersSecurity,
  ...followupAnswersMicroservices,
  ...followupAnswersTesting,
  ...followupAnswersBuildGit,
  ...followupAnswersSystemDesign,
  ...followupAnswersBehavioral,
};
