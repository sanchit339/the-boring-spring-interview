/**
 * Answer bank for followup questions.
 * Keyed by the exact followup `text` so answers can be merged into the
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
  "`Integer a = 127, b = 127;` — is `a == b` true? What about `128`?":
    "Autoboxing goes through `Integer.valueOf()`, and that method keeps a cache of instances for **-128 to 127**. So `Integer a = 127; Integer b = 127;` gives you the same cached object twice and `a == b` is **true**. Go one higher and each box is a fresh object — `Integer x = 200; Integer y = 200;` makes `x == y` **false**.\n\nThat gap is what makes this dangerous rather than merely surprising. It's a **latent** bug: `==` on boxed types passes every test you write with small values, then fails the first time a real ID goes past 127. The behaviour changes with the data, not with the code, so nothing in the diff looks wrong.\n\n**Never use `==` on boxed types.** Call `.equals()`, or unbox to `int` and compare that.",

  "Why must `equals()` and `hashCode()` always be overridden together?":
    "The contract is that if `a.equals(b)` then `a.hashCode()` must equal `b.hashCode()`. Hash collections rely on it completely: they use the hash to pick a bucket and only then compare with `equals`. Override `equals` alone and two equal objects keep their inherited identity hashcodes, land in different buckets, and never get compared — so `map.get(key2)` returns `null` for a key that is equal to one you definitely put in.\n\nThe same contract has a second edge that catches people. Because the bucket is chosen at insert time, a **mutable key** breaks the map after the fact. Put an object in a `HashSet`, then change a field that `hashCode` uses, and `contains()` now returns `false` for it — while iterating the set still shows the object sitting right there. It's in the collection, just filed under an address nobody looks up any more.\n\nSo derive `hashCode` from the **same fields** as `equals`, and make those fields immutable.",

  "What contract does `equals()` have to satisfy?":
    "Five clauses. **Reflexive** — `a.equals(a)` is always true. **Symmetric** — if `a.equals(b)` then `b.equals(a)`. **Transitive** — if `a.equals(b)` and `b.equals(c)` then `a.equals(c)`. **Consistent** — repeated calls give the same answer as long as the fields don't change. And **non-null** — `a.equals(null)` is always `false`, never an exception.\n\nSymmetry is the one that actually breaks in real code, usually when a subclass adds a field. Say `Point` compares x and y, and `ColoredPoint` extends it comparing x, y and colour. Now `point.equals(colored)` is **true**, because `Point` only looks at coordinates, while `colored.equals(point)` is **false**, because the colour doesn't match. Same pair, two different answers depending on which one you asked.\n\nCollections then behave differently depending on ordering — `list.contains(x)` can return true or false for the same list depending on which object it happens to compare first. The usual fixes are to compare with `getClass() != o.getClass()` rather than `instanceof`, or to favour composition over extending a value class at all.",

  // ===================== Q2: String / StringBuilder / StringBuffer =====================
  "Why is `String` immutable, and what does that buy you?":
    "Four things fall out of it. The JVM can **intern** literals in the string pool, so every `\"OK\"` in your codebase is one object instead of thousands. Strings are **thread-safe for free** — nothing can change underneath a reader, so no synchronization is needed anywhere. The **`hashCode` is computed once and cached**, which is the quiet reason `String` is the default `HashMap` key everywhere; a mutable key would have to recompute it and could never be trusted to stay put.\n\nThe fourth is security, and it's more specific than \"can't be tampered with\". Because a `String` can't change, a filename or URL that passed a security check is still the same value when it's used a moment later. If strings were mutable, another thread could swap the contents in between — check one path, open another. The JDK leans on that guarantee throughout.\n\nThe cost is that every edit allocates. That's exactly the trade `StringBuilder` exists to undo when you're building in a loop.",

  "When would you choose `StringBuffer` over `StringBuilder` in modern code?":
    "Almost never. `StringBuffer` is just `StringBuilder` with `synchronized` on every method, and the interesting objection isn't performance — an uncontended lock is cheap these days. It's that **per-method locking isn't the thread safety you need**. Each `append` being atomic doesn't help when two threads are building into the same buffer: their appends interleave and you get both strings shuffled together. The individual calls are safe, the sequence isn't, so the guarantee it offers solves a problem nobody actually has.\n\nIf two threads are writing to one buffer, that's a design problem to fix rather than a lock to add. Use `StringBuilder` locally, and pass finished immutable `String` values between threads. Reach for `StringBuffer` only when a legacy API hands you one.",

  "What does the `+` operator compile to for string concatenation in a loop vs a single expression?":
    "A single expression like `\"a\" + \"b\" + c` compiles to **one** `StringBuilder` and a chain of appends. That's fine, and it's why nobody needs to hand-optimise ordinary concatenation.\n\nA loop is a different story. `result += i` desugars to `result = new StringBuilder(result).append(i).toString()` — a **new builder and a new String on every iteration**. The part that hurts isn't the object count, it's the copying: each iteration copies the entire string built so far, so the total work is **O(n²)**. That's why it looks perfectly healthy at 100 iterations and hangs the thread at 100,000 — the cost curve bends rather than rises.\n\nThe fix is one `StringBuilder` declared before the loop, appending inside it. Java 9 changed the desugaring to use `invokedynamic` and `StringConcatFactory`, which made single expressions faster still, but it didn't rescue the loop — each iteration is a separate concatenation and the quadratic copying is unchanged.",

  // ===================== Q3: abstract class vs interface =====================
  "Can an interface have `default` and `static` methods? When would you use each?":
    "Both, since Java 8. A **`default`** method carries a body, which exists so you can add a method to an interface without breaking every class that already implements it. That's not a hypothetical — it's how `stream()` was added to `List` in Java 8 without invalidating every `List` implementation ever written. Use it for evolving an API you don't control all the implementers of.\n\nA **`static`** method belongs to the interface itself and can't be overridden, so it's the home for factories and helpers tied to the type — `Comparator.comparing(...)` is the one you'll use most.\n\nJava 9 added **`private`** interface methods to finish the picture. Once you have two `default` methods sharing logic, you need somewhere to put the common part that isn't itself part of the contract, and a private method is it.",

  "Can an abstract class have constructors? Can an interface?":
    "An **abstract class can**, an **interface can't**.\n\nThe abstract class case confuses people because you can't instantiate one, so a constructor looks pointless. But a constructor isn't about instantiation, it's about **initialization** — and a subclass constructor has to call one, explicitly with `super(...)` or implicitly via the no-arg version, before its own body runs. So the abstract constructor is where shared `final` fields get set, exactly once, for every subclass. It runs as part of building the subclass instance.\n\nAn interface has no constructor because it has no **instance state** to initialize. Its fields are implicitly `public static final` constants that belong to the interface rather than any object. `default` and `static` methods gave interfaces bodies, but never state — that's still the line between the two.",

  "After Java 8, when do you still prefer an abstract class over an interface?":
    "`default` methods took away most of the old reasons, so the honest answer is now quite narrow: **when you need state**. An abstract class can hold instance fields and a constructor chain to initialize them; an interface can't hold anything but `public static final` constants. If subclasses need to share a field, that's an abstract class and there's no argument to have.\n\nThe other one worth knowing is **visibility**. Everything in an interface is public, so there's no way to share a helper with your subclasses but not with the entire world. `protected` and package-private members only exist on classes.\n\n\"Is-a relationship\" is the usual advice here, but it's vaguer than it sounds. The test that actually decides it is: could one class ever need **two** of this thing? A class can implement many interfaces and extend exactly one, so anything a class might plausibly want two of has to be an interface, regardless of how neatly it reads as \"is-a\".",

  // ===================== Q4: ArrayList vs LinkedList =====================
  "What is the time complexity of random access, insert at end, and insert in middle for each?":
    "`ArrayList` — random access `O(1)` by index arithmetic, insert at end amortized `O(1)`, insert or remove in the middle `O(n)` because everything after it shifts.\n\n`LinkedList` — random access `O(n)`, since you walk the chain to get there. Insert at either end is `O(1)` outright: `java.util.LinkedList` is doubly-linked and keeps both `first` and `last`, so appending never has to traverse. Insert or remove **at a node you already hold** is also `O(1)` — just repointing two references.\n\nThat last one is the whole case for `LinkedList`, and it comes with a catch that usually cancels it: **finding** the node is `O(n)`. So `list.add(5000, x)` is O(n) despite the O(1) splice, because the walk dominates. It only genuinely wins when you already have a `ListIterator` sitting at the position — iterating and removing as you go — which is rare enough that most code never sees the benefit.",

  "In real Spring Boot apps, why is `ArrayList` almost always preferred over `LinkedList`?":
    "Mostly because you never actually choose. Almost every list that arrives in your hands is already array-backed — `Collectors.toList()`, `List.of()`, a JPA repository return, whatever Jackson deserialises a JSON array into. Writing `new LinkedList<>()` is a deliberate act you'd have to justify in review, and the justification rarely survives contact with what the code does next.\n\nThe memory cost is the part worth being able to quote. An `ArrayList` element is a single reference slot in one array — 4 or 8 bytes. A `LinkedList` element is a separate `Node` object holding the value plus `prev` and `next` pointers, around **24 bytes of overhead each**, every one of them a distinct allocation the GC has to track. Ten thousand elements is a rounding error in one case and a quarter-megabyte of pure bookkeeping in the other.\n\nAnd the access pattern app code actually has — append, then iterate, occasionally index — is precisely `ArrayList`'s best case and `LinkedList`'s worst.",

  "How does `ArrayList` grow when capacity is exceeded?":
    "When the backing array fills up, `add()` allocates a new one at **1.5×** the old size — literally `oldCapacity + (oldCapacity >> 1)` — copies everything across with `Arrays.copyOf`, and then inserts. Each individual resize is `O(n)`, but because they get rarer as the list grows, the cost per `add` averages out to **amortized `O(1)`**.\n\nA detail worth knowing: `new ArrayList<>()` doesn't allocate anything up front. It starts pointing at a shared empty array and only allocates the default **10** slots on the first `add()`. From there the sequence runs 10 → 15 → 22 → 33 → 49, which is what 1.5× looks like in practice.\n\nSo if you know roughly how many elements are coming, say so — `new ArrayList<>(10_000)` skips every intermediate array and every copy. Building a list of 10,000 from the default costs you around twenty reallocations and copies of steadily increasing size, all of it avoidable with one constructor argument.",

  // ===================== Q5: HashMap internal =====================
  "What stops one overloaded bucket from degrading lookups to O(n)?":
    "Before Java 8 a collision just appended to a **linked list**, so keys that all hash to one bucket turned `get` into a linear scan. That was a real attack: feed a web form thousands of colliding parameter names and every lookup degrades to `O(n)` — the classic hash-DoS.\n\nJava 8 converts an over-full bucket into a **red-black tree**, capping the worst case at `O(log n)`. It converts back to a list when the bucket shrinks below **6**, and the gap between 8 and 6 is deliberate hysteresis so a bucket hovering at the boundary doesn't thrash between the two forms.\n\nTwo conditions have to hold, not one. The bucket needs **8 or more entries** *and* the table needs at least **64 buckets** overall. Below 64 the map resizes instead, on the reasoning that a small crowded table is colliding because it's short of room, not because the hashes are bad — and doubling the table is the cheaper fix. Treeing also needs an ordering for the keys: `Comparable` if they have it, otherwise it falls back to `System.identityHashCode` to break ties.",

  "What is the load factor, and when does rehashing occur?":
    "The load factor is how full the table gets before it grows, and it defaults to **0.75**. Once `size` passes `capacity × loadFactor` the map **rehashes**: allocates a table twice the size and redistributes every entry into it. That's `O(n)` and it happens on whichever unlucky `put` crosses the line.\n\n0.75 is a deliberate middle. Higher packs more entries per bucket and collides more; lower wastes memory on empty slots to collide less.\n\nIf you know the size in advance you can skip the resizing, but there's a catch in how you do it. `new HashMap<>(1000)` sets the **capacity**, not the threshold — so it still grows once you hit 750 entries. To actually fit 1000 without a rehash you need `expectedSize / 0.75 + 1`, which is what Guava's `Maps.newHashMapWithExpectedSize` does for you. Passing the raw expected size is the common version of this advice and it's slightly wrong.",

  "What is the difference between `HashMap` and `ConcurrentHashMap` for multi-threaded access?":
    "`HashMap` is **not thread-safe**, and the failure isn't just a lost write. Two threads resizing at once could corrupt the bucket chains outright — pre-Java-8 that could produce a **cycle in a bucket list**, so a later `get` on that bucket spun forever at 100% CPU. A data structure bug surfacing as a hung thread, nowhere near the code that caused it.\n\n`ConcurrentHashMap` is safe and cheap. Since Java 8 it dropped the old `Segment` striping for something finer: a **CAS** to install the first node in an empty bin, and `synchronized` on that head node when a bin already has entries. So writes only contend when they hit the same bin, and reads take no lock at all.\n\nThe part people get wrong is what that guarantee covers. Each **operation** is atomic; a **sequence** of them isn't. `if (!map.containsKey(k)) map.put(k, v)` is still a race — two threads can both pass the check. That's precisely why `putIfAbsent`, `computeIfAbsent` and `merge` exist: they push the whole read-modify-write into a single atomic call. Reach for those rather than composing your own from two safe operations.",

  // ===================== Q6: HashMap / LinkedHashMap / TreeMap =====================
  "Which map would you use if you need insertion-order iteration?":
    "`LinkedHashMap`. It keeps the ordinary hash buckets for lookup and threads a **doubly-linked list** through the entries on top, so iteration follows that list rather than the bucket layout — giving you **insertion order** at no cost to `get`. `HashMap` promises no order at all, and `TreeMap` gives you sorted-by-key, which is a different thing entirely.\n\nIt has a second mode worth knowing. Pass `true` as the third constructor argument — `new LinkedHashMap<>(16, 0.75f, true)` — and it switches to **access order**, moving each entry to the end of the list whenever you `get` it. On its own that just reorders; it doesn't evict anything. You turn it into a real **LRU cache** by also overriding `removeEldestEntry`:\n\n`protected boolean removeEldestEntry(Map.Entry<K,V> eldest) { return size() > MAX; }`\n\nReturn true and the least recently used entry is dropped on the next insert. That's a working fixed-size LRU in a constructor argument and one method — worth remembering, because interviewers ask people to build one and rarely expect the JDK answer.",

  "What is the time complexity of `get`/`put` for each of these maps?":
    "`HashMap` and `LinkedHashMap` — `O(1)` average, `O(log n)` worst case (treeified buckets in Java 8). `TreeMap` — `O(log n)` for `get`/`put` because it's a red-black tree. The linked/tree overhead only affects iteration and ordering, not the core hash lookup cost.",

  "Can `TreeMap` store `null` keys? Can `HashMap`?":
    "`HashMap` allows **one `null` key** and any number of `null` values. The null key is **special-cased** rather than hashed — it goes to index 0 without `hashCode()` ever being called on it, which is the only reason it can work at all.\n\n`TreeMap` **can't**. It places every key by calling `compareTo` or a `Comparator`, and there's nothing sensible to compare `null` against, so it throws `NullPointerException` on insert. Same reasoning applies to `TreeSet`.\n\n`ConcurrentHashMap` refuses `null` keys **and** `null` values, and the reason is worth understanding because it's a design decision rather than a limitation. With no nulls allowed, `map.get(k) == null` means exactly one thing: the key is absent. In a `HashMap` that same result is ambiguous — the key might be missing, or present with a null value — and you resolve it with a second `containsKey` call. In a concurrent map that two-call check is itself a race, since the map can change in between. Banning null removes the ambiguity rather than asking you to race on it.",

  // ===================== Q7: HashSet / LinkedHashSet / TreeSet =====================
  "How is `HashSet` implemented internally in relation to `HashMap`?":
    "`HashSet` is a `HashMap` wearing a different interface. Every element goes in as a **map key**, paired with one shared dummy object the JDK calls `PRESENT`. So `add(e)` is `map.put(e, PRESENT)` and `contains(e)` is `map.containsKey(e)` — the set holds no storage of its own.\n\nThat explains a couple of things that otherwise look arbitrary. `add()` **returns a boolean** because `put` returns the previous value, so `== null` tells you whether the element was new — you get \"was this already here?\" for free on every insert. And there's no `get()` on a `Set`, because there's nothing to retrieve that you didn't already have.\n\nIt also sets the cost. Every element carries a full `HashMap.Node` — hash, key, value, next pointer — so a `HashSet` is substantially heavier per element than the plain array slot a `List` would use. You're paying for `O(1)` membership, and it isn't free.",

  "When would you use `TreeSet` over `HashSet`?"
    : "The obvious reason is **ordered iteration** — natural ordering or a `Comparator`, so a leaderboard comes out ranked without a sort step.\n\nThe better reason is everything `NavigableSet` gives you that a hash set structurally cannot. `ceiling(x)` and `floor(x)` find the nearest element at or above and at or below a value; `higher` and `lower` do it strictly; `first()` and `last()` give you the extremes; `subSet`, `headSet` and `tailSet` slice ranges. \"Find me the next appointment after 3pm\" is one `ceiling` call on a `TreeSet` and a full linear scan on a `HashSet` — there's no hash you can compute for *nearby*.\n\nWhat it costs is `O(log n)` per operation instead of `O(1)`, plus the elements need to be comparable. So if all you ever do is `add` and `contains`, `HashSet` is the right pick and `TreeSet` is just slower.",

  // ===================== Q8: immutability =====================
  "Why does an immutable class also need to be `final`?":
    "Because a subclass can undo every guarantee you just made. Leave the class open and someone writes `class MutableMoney extends Money`, adds a mutable field, and overrides `getAmount()` to return whatever it likes. Your code accepts it — it's still a `Money` — so every caller that trusted immutability is now holding something that changes.\n\nIt also breaks the thread-safety guarantee people rely on: safe publication of an immutable object depends on `final` fields being frozen at construction, and a subclass that adds non-`final` state loses that.\n\nMarking the class `final` is the blunt fix. If you need to allow subclasses, make the **constructor private** and hand out instances through a static factory — you control what actually gets built. Records are `final` for exactly this reason.",

  "How do you handle mutable fields (like `Date` or `List`) inside an immutable class?":
    "**Defensive copies in both directions.** On the way in: `this.date = new Date(input.getTime())`, because if you store the caller's reference they can still mutate it after handing it over, and your \"immutable\" object changes underneath you. On the way out: return `new Date(this.date.getTime())`, or the caller mutates your internal state through the getter.\n\nOne distinction matters for collections. `Collections.unmodifiableList(list)` returns a **view**, not a copy — it blocks writes through that reference, but if you kept the original list alive, changes to it are still visible through the view. So it only helps when it's wrapping a list you already copied. `List.copyOf(input)` does both jobs at once: copies and returns something genuinely unmodifiable. That's the one-liner you want.\n\nModern code sidesteps most of this. `java.time` types are immutable already, so no copy is needed, and `List.of(...)` / `List.copyOf(...)` gives you immutable collections directly. Defensive copying is mainly for legacy `Date`, `Calendar` and arrays — and arrays always need `.clone()`, since there's no immutable array in Java.",

  "Why are immutable objects naturally thread-safe?":
    "Because a race needs something to change, and there isn't anything. Every thread sees the same state for the object's whole life, so there's nothing to guard, nothing to lock, and any number of readers can run at once. Mutation is what forces synchronization in the first place — remove it and the problem doesn't get solved so much as it stops existing. `String`, `BigDecimal` and the `java.time` types are shareable across threads for exactly this reason.\n\nThere's a condition on it that's easy to miss, though. Immutability buys you thread safety **only if the object is safely published**, and that's what `final` fields are actually for. The memory model guarantees that a `final` field assigned in the constructor is visible to any thread that sees the object — the \"final field freeze\". Drop the `final` and that guarantee goes with it: another thread can obtain a reference to your object and read **default values** for fields the constructor definitely assigned, because the write and the reference publication can be reordered.\n\nSo `private final` isn't documentation of intent. It's the thing making the guarantee hold, and it's the line between genuinely immutable and merely never-modified.",

  // ===================== Q9: checked vs unchecked =====================
  "Why does Spring wrap `SQLException` into `DataAccessException`?":
    "`SQLException` is **checked**, so without the wrapping every method between your repository and wherever the error is handled would need a `throws SQLException` clause — including service and controller methods that can't do anything about it. `DataAccessException` is unchecked, so it travels to your `@ControllerAdvice` without touching anything in between.\n\nThe second reason is portability. A unique-constraint violation is error code 23505 on Postgres and 1062 on MySQL, so handling it directly means writing vendor-specific code. Spring translates both into `DuplicateKeyException`, and your code catches that instead of a number.\n\nSo you get a consistent exception hierarchy — `DataIntegrityViolationException`, `OptimisticLockingFailureException`, `EmptyResultDataAccessException` — that means the same thing regardless of the database underneath.",

  "When should you create a custom checked exception vs an unchecked one in a Spring service?":
    "Default to **unchecked**, and the reason is what a checked exception does to the code between the throw and the handler. A repository throws, a service calls it, another service calls that, a controller calls that — with a checked exception every one of those signatures grows a `throws` clause for something none of them can act on. They're not handling it, they're just carrying it, and the moment you want to add a new failure mode you're editing five files. Unchecked exceptions travel to the `@ControllerAdvice` that actually knows what to do without touching anything in between.\n\nRollback behaviour gets cited here too — `@Transactional` only rolls back on unchecked by default — but that's a weak argument on its own, since `rollbackFor` settles it in one attribute. Design the exception for the call chain, then configure rollback to match.\n\nUse **checked** when the caller genuinely has a recovery path and silently forgetting it would be dangerous. That's rare in application code and common in libraries.\n\nOne caution on `ResponseStatusException`: it's convenient, but it puts HTTP status codes in your service layer. Fine in a controller; in a service it means your domain logic now knows it's behind a web API. The cleaner shape is a domain exception like `OrderNotFoundException` and a `@ControllerAdvice` that maps it to 404.",

  "What is the difference between `throw` and `throws`?":
    "`throw` **raises** an exception — it's a statement you execute, and it takes one exception object: `throw new IllegalStateException(...)`. `throws` **declares** that a method might emit one, and it lives on the signature as a comma-separated list: `void read() throws IOException`.\n\nSo one does something at runtime and the other tells the compiler something at compile time.\n\nThe detail that clears up the remaining confusion: `throws` only *means* anything for **checked** exceptions. Writing `void save() throws RuntimeException` compiles fine and changes nothing at all — no caller is forced to handle it, and the compiler doesn't check it. That's why you sometimes see it in older code doing precisely no work. For unchecked exceptions, `throws` is documentation, and Javadoc's `@throws` is the better place for it.",

  // ===================== Q10: try-with-resources =====================
  "What interface must a resource implement to work with try-with-resources?":
    "**`AutoCloseable`**, added in Java 7 for exactly this. It has one method, `close()`, and the compiler generates the call for you in reverse declaration order. `Closeable` from `java.io` predates it and now extends it, narrowing `close()` to throw only `IOException` — either works in the try header.\n\nTwo details about the header itself. The resource variable must be **final or effectively final**, since letting you reassign it would mean closing something other than what you opened. And since **Java 9** you don't have to declare it inline: if you already hold an effectively-final reference, you can name it directly — `try (existingConnection) { ... }` — which is handy when the resource was handed to you rather than created there.",

  "What happens to suppressed exceptions when both `try` and `close()` throw?":
    "The exception thrown from the **try body** is the primary one that propagates; the one from `close()` is **attached as a suppressed exception** and retrievable via `primary.getSuppressed()`.\n\nWithout try-with-resources, the `close()` exception would silently clobber the real error — this is exactly why you should never write manual try/finally close logic.",

  // ===================== Q11: autoboxing / unboxing =====================
  "What is the difference between `int` and `Integer` in terms of memory and nullability?":
    "`int` is a **primitive**: 4 bytes holding the value itself, default `0`, and it **cannot be null**. Where those 4 bytes live depends on the variable — a local sits on the stack, a field sits in the heap inside its object. The type doesn't decide that; the declaration does.\n\n`Integer` is a full **object**: around 16 bytes once you count the header, reached through a reference, and it can be `null`. So an array of a million `int` is 4 MB while a million `Integer` is that plus a million object headers plus the reference array — several times the footprint, and every element a separate thing for the GC to trace.\n\nNullability is why it matters in practice. A JPA entity field has to be `Integer` if the column is nullable, because `int` has no way to represent \"no value\" — it would silently read as `0`. And that's the trap on the other side: the moment a null from the database meets an `int`, unboxing throws `NullPointerException`.",

  "How can autoboxing cause a `NullPointerException`?":
    "When you assign a `null` `Integer` to an `int` (explicitly or via an operator), the JVM calls `intValue()` on `null` → `NullPointerException`. Example: `Integer x = null; int y = x;` or `map.get(\"missing\") + 1` where the get returns `null`. The trap is the NPE shows up at a **seemingly innocent** arithmetic line, not where the null came from.",

  // ===================== Q12: final / finally / finalize =====================
  "Does `finally` always execute?":
    "Effectively yes. `finally` runs whether the try block exits normally, throws, returns, or breaks out — including when a `return` value has already been computed. That's the entire point of it.\n\nThe genuine escapes are all cases where the JVM stops running your code rather than your code taking a different path. **`System.exit()`** and `Runtime.halt()` terminate the JVM outright — nothing in a `finally` gets a chance. A hard JVM crash or a kill signal does the same. So does an infinite loop inside the try, since the block never exits at all, and the deprecated `Thread.stop()`. An **`InterruptedException` doesn't belong on that list** — it's an ordinary exception, and `finally` runs exactly as it would for any other.\n\nThe more useful thing to know is the trap inside `finally` itself: a **`return` in a `finally` block discards a pending exception**. If the try throws and the finally returns, the exception is silently dropped and the caller gets a normal return value for an operation that failed. Same for a `break` or `continue` that escapes the block. Never return from `finally` — use it only for cleanup.",

  "Why is `finalize()` deprecated, and what should you use instead?":
    "Because it promises cleanup and doesn't deliver it. There's no guarantee about **when** `finalize()` runs, or **whether** it runs at all — if the JVM exits first, it simply never happens, so anything you relied on it for silently didn't occur. It can also **resurrect** an object by handing out `this`, which means the GC has to check reachability a second time. That's the real cost: a finalizable object needs **two GC cycles** to die, so it survives a collection it should have been reclaimed in and pushes pressure into the old generation.\n\nIt was **deprecated in Java 9**, then **deprecated for removal in Java 18** under JEP 421, which also added `--finalization=disabled` so you can turn it off entirely and find out what breaks.\n\nUse **try-with-resources** for anything with a scope — files, sockets, locks, connections — since deterministic closing is what you actually wanted. For a native handle where the caller might forget to close, use **`Cleaner`**, which registers cleanup against phantom reachability without any of the resurrection problem. `Cleaner` is a backstop, though, not a substitute for closing properly.",

  // ===================== Q13: functional interfaces =====================
  "What is the `@FunctionalInterface` annotation for, and is it mandatory?":
    "A functional interface has **exactly one abstract method** (SAM) so a lambda can implement it. The `@FunctionalInterface` annotation is **optional** — the compiler treats any SAM interface as functional regardless. But the annotation makes the compiler **reject** accidental second abstract methods, so it's documentation + a safety net. Always add it.",

  "Explain `Predicate`, `Function`, `Consumer`, and `Supplier` with one-line use cases.":
    "**`Predicate<T>`** — `T -> boolean`, e.g. `filter(u -> u.isActive())`. **`Function<T,R>`** — `T -> R`, e.g. `map(User::getEmail)`. **`Consumer<T>`** — `T -> void`, e.g. `forEach(System.out::println)`. **`Supplier<T>`** — `() -> T`, e.g. a lazy `() -> expensiveDefault()` or `Stream.generate`.\n\nEach has **primitive variants** — `IntPredicate`, `ToIntFunction<T>`, `IntFunction<R>`, `IntSupplier` and so on — and they exist for one reason: the generic versions can only hold objects, so a `Function<Integer, Integer>` boxes on the way in and out of every single call. In a stream over a million elements that's two million short-lived objects doing nothing. Use `mapToInt` and the primitive interfaces when the values are numeric and the stream is large.",

  // ===================== Q14: lambdas =====================
  "What is the difference between a lambda and an anonymous inner class regarding `this`?":
    "In a lambda, **`this` is the enclosing instance** — a lambda doesn't introduce a new scope, so `this` means what it meant on the line above. In an anonymous inner class, `this` is **the anonymous object itself**, and reaching the enclosing one takes `OuterClass.this`.\n\nThat difference bites when you convert one to the other. An anonymous `Runnable` calling `this.getName()` is asking the `Runnable`; rewrite it as a lambda and the same expression now asks your outer class — it may still compile and mean something completely different.\n\nThe scoping also explains why a lambda has no instance fields of its own. There's no object being defined, just a body plus whatever it captures, which is why an anonymous class is still the right tool when you need per-instance state.",

  "What are method references, and when would you use them instead of lambdas?":
    "A method reference is shorthand for a lambda whose entire body is one call it forwards its arguments to. Use it exactly when that's true — `list.forEach(System.out::println)` says the same thing as `list.forEach(x -> System.out.println(x))` with less to read. The moment you need to transform an argument or call two methods, go back to a lambda.\n\nThere are four forms, and the one people trip on is the third. `System.out::println` binds a **specific object**. `Integer::parseInt` is a **static** method. `ArrayList::new` is a **constructor**. And `String::toLowerCase` is an **unbound receiver** — it looks like it's missing an argument, but it works as a `Function<String, String>` because the object you call it on *becomes* the parameter. So `map(String::toLowerCase)` is `map(s -> s.toLowerCase())`, with the stream element supplying the receiver rather than an argument.",

  "Can a lambda capture and modify a local variable? What is effectively final?":
    "A lambda can **read** a local only if it's **`final` or effectively final** — meaning you never reassign it, whether or not you wrote the keyword. It can't modify one at all.\n\nThe reason is that locals are captured **by value**, copied into the lambda when it's created. The lambda may run much later, on another thread, long after that stack frame is gone — so there's no variable left to write back to. Java forbids the write rather than letting you update a copy and wonder why nothing changed.\n\nInstance and static **fields** are different: they're reached through a reference rather than copied, so a lambda can read and write them freely. That's the loophole, and it's also the workaround people use — a one-element array, an `AtomicInteger`, or a field on the enclosing object.\n\nWorth knowing what that workaround costs, though. You've reintroduced shared mutable state, which is fine in a sequential `forEach` and **wrong in a parallel stream**: an `AtomicInteger` will at least stay consistent, while `int[] counter` will quietly lose increments. If you're accumulating a result, `reduce` or a `Collector` is the answer rather than a captured holder.",

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
  "What breaks if `compareTo` returns inconsistent results for the same pair?":
    "Sorting breaks, and it breaks loudly. `Collections.sort` and `List.sort` use TimSort, which assumes the comparator is **transitive and consistent** — if `a < b` and `b < c` then `a < c`, and the same pair always gives the same answer. Violate that and the merge logic can walk off the end of a run, so you get **`IllegalArgumentException: Comparison method violates its general contract!`** thrown from inside the JDK, on data that looks perfectly ordinary.\n\nThe usual causes are a comparator that subtracts ints and overflows — `a.getId() - b.getId()` wraps around for large values — or one that reads a **mutable field** that changes while the sort is running. Use `Integer.compare(a, b)` rather than subtraction, and don't sort on something another thread is writing.\n\nThe nastier part is that it's data-dependent. Small lists take a simpler path and never notice, so the same broken comparator passes every test and throws in production once the list is big enough.",

  "What happens if `compareTo` is inconsistent with `equals`?":
    "Sorted collections like `TreeSet`/`TreeMap` use `compareTo` **instead of `equals`** to decide what's a duplicate. If `compareTo` returns 0 for two objects that `equals` says are different, `TreeSet.add` silently drops the second one.\n\nThe contract: `(x.compareTo(y)==0) == x.equals(y)`. `BigDecimal` famously breaks it — `new BigDecimal(\"1.0\")` and `new BigDecimal(\"1.00\")` are **not equal** by `equals` (it compares scale as well as value) but `compareTo` returns **0**. So a `HashSet` keeps both and a `TreeSet` keeps one, from the same pair of objects.",

  "How do you sort a list of objects by multiple fields using Comparator chaining?":
    "Chain with `thenComparing`, where each stage breaks ties left by the one before it: `Comparator.comparing(User::getLastName).thenComparing(User::getFirstName).thenComparingInt(User::getAge)`.\n\nReversing is the part worth getting right. `.reversed()` flips **everything built so far**, not the last field — so `comparing(A).thenComparing(B).reversed()` reverses both A and B. To flip a single field, pass a comparator for that field instead:\n\n`Comparator.comparing(User::getLastName).thenComparing(User::getCreatedAt, Comparator.reverseOrder())`\n\nThat sorts by surname ascending and newest-first within each surname. Getting this wrong gives you a sort that looks fine at a glance and is wrong from the second page on.",

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

  // ===================== Q20: static =====================
  "When are static blocks executed relative to constructors?":
    "**Static initializers run once, when the class is first loaded**, before any instance constructor and before `main`. Instance initializers and constructors run **per object**, at `new` time. Order within a class: static blocks top-to-bottom at class load, then (per instance) instance initializers top-to-bottom then the constructor body.",

  "Why is static mutable state a problem in a Spring application?":
    "Because a `static` field is shared by every thread in the JVM, and a Spring app is serving requests on many threads at once. A `static Map` cache or a `static SimpleDateFormat` in a `@Service` is an unsynchronized shared mutable — you get corrupted data or garbled dates under load, and it won't reproduce on your laptop with one user.\n\nIt also defeats the container. Statics aren't injected, so you can't swap them per profile or mock them in a test, and state written by one test leaks into the next because the class stays loaded across the whole suite.\n\nKeep beans stateless and put shared state where it's managed — a bean field on a singleton is fine if it's immutable, and anything genuinely shared and mutable belongs in a cache or the database. `static final` constants are not the problem; `static` **mutable** state is.",

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
  "How would you diagnose a deadlock in a JVM that's already hung?":
    "`jstack <pid>` prints every thread's stack and state; a deadlock shows threads stuck in `BLOCKED` waiting on locks held by each other — `jstack` even prints a \"Found one Java-level deadlock\" section. Alternatives: `jcmd <pid> Thread.print`, VisualVM, or `kill -3 pid` to dump to stdout. In prod, automate periodic thread dumps so you catch it when it happens.",

  "How do lock ordering and timeouts help prevent deadlocks?":
    "**Lock ordering** — always acquire locks in a fixed global order (e.g., by account id), which structurally breaks circular wait. **`tryLock(timeout)`** — give up after N seconds and release what you hold, so a cycle unwinds instead of hanging forever. Combine both: ordering for the common case, timeouts as a safety net.",

  // ===================== Q27: garbage collection =====================
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

  "What happens if a constructor calls an overridable method?":
    "The **subclass override runs before the subclass constructor does**, so it executes against fields that haven't been assigned yet.\n\nThe order is fixed: the parent constructor runs first, then the child's field initializers, then the child's constructor body. So if the parent constructor calls an overridable method, dynamic dispatch sends it to the child's override — at a point where every field the child declares is still `null` or `0`.\n\n```java\nclass Report {\n    Report() { render(); }              // calls the override, too early\n    void render() { }\n}\n\nclass PdfReport extends Report {\n    private final String title = \"Q4\";   // not assigned yet when render() runs\n    @Override void render() {\n        System.out.println(title.length()); // NPE — title is still null\n    }\n}\n```\n\n`new PdfReport()` throws `NullPointerException` on a `final` field with an initializer sitting right there, which is why it reads as impossible the first time you see it.\n\nThe rule is to **call only `private`, `static` or `final` methods from a constructor** — none of those dispatch to a subclass. If subclasses need to contribute behaviour, do it after construction with an init method or a factory.",

  // ===================== Q31: composition vs inheritance =====================
  "What does `extends` commit you to that holding a field doesn't?":
    "To the parent's **entire public surface, permanently**. `class Order extends PriceCalculator` means every public method on `PriceCalculator` is now part of `Order`'s API whether it makes sense for an order or not, and you can never take one away. You've also spent your one superclass slot, and you're exposed to the parent changing under you.\n\nHolding a field commits you to nothing: `class Order { private PriceCalculator calc; }` exposes only what you choose to delegate, lets you swap the collaborator per environment or per test, and lets you hold several. That's the practical content of Effective Java Item 18.",

  "Give an example where inheritance is still the right choice.":
    "When there's a true **\"is-a\"** relationship and the subclass genuinely specializes the parent's contract — `ArrayList extends AbstractList`, `HashSet extends AbstractSet`, or your `BaseEntity` with `id`/`createdAt` fields and lifecycle hooks. The framework controls both sides, the hierarchy is shallow, and the subclass truly substitutes for the parent everywhere. If you can't say \"B is an A\" in plain English, use composition instead.",

  // ===================== Q32: coupling and cohesion =====================
  "How do the controller, service, and repository layers reflect cohesion and coupling?":
    "Layers (controller → service → repository) keep each layer **cohesive** — controllers do HTTP, services do business rules, repositories do persistence — so a change in one concern lives in one place. Low coupling between layers (talking only through interfaces) means swapping the repository impl or mocking it in tests doesn't ripple. The payoff: localized change, easy testing, parallel team work.",

  "How does dependency injection reduce coupling?":
    "Instead of `new StripeGateway()` hardcoded inside `PaymentService`, the service declares `PaymentGateway gateway` and the **container injects** it. `PaymentService` depends on the **interface**, not a concrete class — so prod wires Stripe, tests wire a fake, and neither change touches the service. DI replaces `new` (the source of tight coupling) with a contract.",

  // ===================== Q33: SOLID =====================
  "How does the Open/Closed Principle show up with Strategy pattern?":
    "`PaymentService` holds a `PaymentStrategy` interface with implementations `CardStrategy`, `UpiStrategy`, `WalletStrategy`. Adding `CryptoStrategy` means **a new class** — you don't edit `PaymentService` or any existing strategy. The service is **open for extension** (new strategies) but **closed for modification** (existing code untouched). That's OCP in action.",

  "How does Interface Segregation apply to Spring repository interfaces?":
    "Don't force a repo to extend a fat interface with methods it doesn't need. Spring Data lets you split: `interface ReadRepository<T> { findById(...); }`, `interface WriteRepository<T> { save(...); }`, and have `OrderRepository extends ReadRepository, WriteRepository` while `ReadOnlyCatalogRepository extends ReadRepository`. Clients depend only on what they use — no client forced to call `delete()` it shouldn't.",

  "What does a Single Responsibility violation look like in a controller?":
    "A `UserController` that validates input, calls the DB directly (`userRepo.save`), sends a welcome email, builds a PDF invoice, and formats the JSON response. Six reasons to change.\n\nFix: controller only does HTTP binding + response; validation → `@Valid`; persistence → `UserService`; email → `EmailService`; PDF → `InvoiceService`. Each class has one reason to change — one axis of modification.",

  // ===================== Q34: design patterns =====================
  "When would you use Facade vs Adapter in an integration layer?":
    "**Adapter** makes an existing incompatible interface look like one you need — wrapping a legacy SOAP client behind your `PaymentGateway` interface so callers don't know SOAP exists.\n\n**Facade** simplifies a complex subsystem behind one coarse-grained entry point — `OrderFacade.placeOrder()` orchestrating inventory, payment, shipping, and notification so callers see one method. Adapter is about *shape mismatch*; Facade is about *reducing surface area*.",

  "How does the Builder pattern help with complex DTO or entity construction?":
    "A `UserDto` with 12 optional fields is painful via a telescoping constructor (`new UserDto(name, null, null, email, null, ...)`). Builder gives fluent `UserDto.builder().name(...).email(...).role(ADMIN).build()`, makes required fields explicit, produces an **immutable** object, and reads clearly at the call site. Lombok's `@Builder` does this with one annotation; it's the standard for request/response DTOs.",

  // ===================== Q35: Singleton threading =====================
  "Why isn't checking for `null` twice enough to make lazy initialization safe?":
    "Because the second check fixes the wrong problem. Double-checked locking — test `instance == null`, take the lock, test again — stops two threads *creating* two instances. It doesn't stop a thread seeing a **half-built** one.\n\nThe reference can be published before the constructor has finished, so another thread finds a non-null `instance` and starts using an object whose fields aren't set yet. Marking the field **`volatile`** is what closes it, guaranteeing the construction is complete before any thread can see the reference.\n\nIn practice you don't write this. Use an **enum singleton**, or let Spring's singleton scope hold the instance — both are safe without you reasoning about any of it.",

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
