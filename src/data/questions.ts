import type { Category } from "./types";
import { followupAnswers } from "./followup_answers";

export const categories: Category[] = [
  {
    id: "core-java",
    title: "Core Java",
    description:
      "Language fundamentals, collections, concurrency, and the JVM — the foundation every Spring interview builds on.",
    icon: "☕",
    questions: [
      {
        id: 1,
        text: "What is the difference between `==` and `.equals()` in Java?",
        answer:
            "`==` compares **references** — it checks whether two variables point to the exact same object in memory. `.equals()` compares **content** — what the object actually represents.\n\nFor primitives like `int` or `char`, `==` compares the actual values. A primitive **holds its value directly** instead of pointing at an object, so there's no separate identity to confuse it with. For objects, you almost always want `.equals()`.",
        explanation: `**Analogy:** Think of two people who both own a copy of the same book. They are holding different physical objects (different references), but the content is identical. \`==\` asks "are you holding the exact same physical book?", while \`.equals()\` asks "do your books have the same content?"

\`\`\`java
String a = new String("hello");
String b = new String("hello");

System.out.println(a == b);       // false — different objects on heap
System.out.println(a.equals(b));  // true  — same content
\`\`\`

**The String pool twist:** String literals are interned, so this works differently:

\`\`\`java
String x = "hello";
String y = "hello";
System.out.println(x == y); // true — both point to same pool entry
\`\`\`

But the moment you use \`new String("hello")\`, you bypass the pool and get a fresh object. That's why you should **never use \`==\` to compare Strings** in real code.

**Why this matters in Spring:** If you ever compare HTTP headers, path variables, or enum names using \`==\`, you'll get subtle bugs. Always use \`.equals()\` or \`Objects.equals(a, b)\` (null-safe version) for object comparisons.`,
        followUps: [
          { text: "`Integer a = 127, b = 127;` — is `a == b` true? What about `128`?" },
          { text: "Why must `equals()` and `hashCode()` always be overridden together?" },
          { text: "What contract does `equals()` have to satisfy?" },
        ],
      },
      {
        id: 2,
        text: "Explain the difference between `String`, `StringBuilder`, and `StringBuffer`.",
        answer:
            "`String` is **immutable** — every modification creates a new object rather than changing the existing one. `StringBuilder` is **mutable** and not thread-safe, built for assembling a string in one thread. `StringBuffer` is mutable too, but **thread-safe**, because every method is synchronized.\n\nIn practice the choice is easy. Use `String` for values that don't change, which is most of them. Reach for `StringBuilder` the moment you're building a string in a loop. And you'll almost never want `StringBuffer` — you pay for the synchronization on every single call, and thread access is something you normally control a level up anyway.",
        explanation: `**Analogy:** \`String\` is a printed book — once printed, you can't change it; every "edit" means printing a whole new book. \`StringBuilder\` is a whiteboard — fast to write on, erase, and rewrite, but only one person should use it at a time. \`StringBuffer\` is a whiteboard with a lock on the door — safe for multiple people, but you waste time waiting for the lock.

**The loop trap most junior devs hit:**

\`\`\`java
// BAD — creates a new String object on every iteration
String result = "";
for (int i = 0; i < 1000; i++) {
    result += i;  // compiles to: result = new StringBuilder(result).append(i).toString()
}

// GOOD — one StringBuilder, mutated in place
StringBuilder sb = new StringBuilder();
for (int i = 0; i < 1000; i++) {
    sb.append(i);
}
String result = sb.toString();
\`\`\`

The "bad" version creates thousands of intermediate String objects and hammers the GC. In a Spring service that builds large SQL strings or CSV responses, this actually shows up in profilers.

**String immutability benefits you don't often think about:**
- Strings can be safely shared across threads without synchronization
- The JVM can cache them in the string pool (intern)
- Hashcodes are cached after first computation (HashMap key performance)
- Security — a DB password passed as String can't be modified by a third-party library you called`,
        followUps: [
          { text: "Why is `String` immutable, and what does that buy you?" },
          { text: "When would you choose `StringBuffer` over `StringBuilder` in modern code?" },
          { text: "What does the `+` operator compile to for string concatenation in a loop vs a single expression?" },
        ],
      },
      {
        id: 3,
        text: "What are the differences between abstract classes and interfaces?",
        answer:
            "An **abstract class** can have instance variables, constructors, and a mix of abstract and concrete methods. A class can extend only one abstract class. An **interface** defines a contract, and traditionally held only abstract methods. Java 8 added `default` and `static` methods, and Java 9 added `private` helpers. A class can implement multiple interfaces.\n\nThe key decision: if you need to share **state** (fields) or provide a **base implementation**, use an abstract class. If you need to define a **capability** that unrelated classes can all share, use an interface.",
        explanation: `**Analogy:** An abstract class is like a base employee contract at a company — it says "all employees get a salary field and a \`clockIn()\` method already implemented." An interface is like a certification — "this entity is \`Printable\`, \`Serializable\`, or \`Comparable\`." A freelance designer and a full-time developer can both be \`Billable\` (interface), but they come from completely different class hierarchies.

**When the decision becomes real:**

\`\`\`java
// Use abstract class — shared state + partial implementation
public abstract class BaseRepository {
    protected final DataSource dataSource; // shared state
    
    public BaseRepository(DataSource ds) {
        this.dataSource = ds;
    }
    
    public abstract List<?> findAll(); // must implement
    
    protected Connection getConnection() throws SQLException { // shared impl
        return dataSource.getConnection();
    }
}

// Use interface — defines capability, no state needed
public interface Auditable {
    LocalDateTime getCreatedAt();
    LocalDateTime getUpdatedAt();
    
    default String auditSummary() {
        return "Created: " + getCreatedAt() + ", Updated: " + getUpdatedAt();
    }
}
\`\`\`

**After Java 8, the practical rule of thumb:** Prefer interfaces unless you genuinely need constructors or instance fields. Spring itself uses this — \`ApplicationContext\` is an interface, but \`AbstractApplicationContext\` is an abstract class that provides the heavy lifting most contexts share.`,
        followUps: [
          { text: "Can an interface have `default` and `static` methods? When would you use each?" },
          { text: "Can an abstract class have constructors? Can an interface?" },
          { text: "After Java 8, when do you still prefer an abstract class over an interface?" },
        ],
      },
      {
        id: 4,
        text: "What is the difference between `ArrayList` and `LinkedList`?",
        answer:
            "`ArrayList` is backed by a **dynamic array** — random access is O(1), but inserting or deleting in the middle is O(n) because everything after it has to shift. `LinkedList` is a **doubly-linked list** — adding and removing at the ends is O(1), but random access is O(n) since you walk the chain to get there.\n\nIn a real application `ArrayList` is almost always the right choice, and the reason goes beyond the complexity table. You mostly iterate and index rather than insert in the middle. Its elements sit in contiguous memory, so iteration is CPU-cache friendly and far faster in practice than the O-notation suggests. `LinkedList` also pays two extra pointers per element, which adds up. The cases where it genuinely wins are narrow enough that reaching for it is usually a sign you wanted a `Deque`.",
        explanation: `**Analogy:** ArrayList is like a numbered shelf in a library — you can instantly jump to shelf #47. LinkedList is like a treasure hunt where each clue leads to the next — to get to clue #47, you walk through 46 clues first.

The time complexity picture:

ArrayList  → get(i): O(1), add at end: O(1) amortized, add in middle: O(n)
LinkedList → get(i): O(n), add at ends: O(1), add in middle: O(n)*

*LinkedList still has to walk to the position even though the pointer swap is O(1).

**The hidden ArrayList growth:** When an ArrayList fills up, it allocates a new array at 1.5x the old capacity and copies everything over. Pre-size if you know the count:

\`\`\`java
// If you know you'll have ~10k items, pre-size it
List<User> users = new ArrayList<>(10_000);
\`\`\`

**When LinkedList actually wins:** If you're building a queue or deque (adding/removing from both ends constantly) and don't need random access — but even then, ArrayDeque beats LinkedList for queue operations in modern Java because of better memory locality.`,
        followUps: [
          { text: "What is the time complexity of random access, insert at end, and insert in middle for each?" },
          { text: "In real Spring Boot apps, why is `ArrayList` almost always preferred over `LinkedList`?" },
          { text: "How does `ArrayList` grow when capacity is exceeded?" },
        ],
      },
      {
        id: 5,
        text: "How does `HashMap` work internally? What happens on collision?",
        answer:
            "`HashMap` internally uses an **array of buckets** (`Node[] table`). When you call `put(key, value)`, it calls `key.hashCode()`, mixes the high bits down with `h ^ (h >>> 16)`, then masks with `(capacity - 1)` to get the bucket index. Capacity is always a **power of two**, which is what makes that mask a fast stand-in for `hash % capacity`.\n\nIf two keys land in the same bucket (collision), they form a chain. Before Java 8, that chain was a **linked list** — worst case O(n) per operation. Since Java 8, a chain longer than 8 **converts to a red-black tree**, cutting worst case to O(log n). That only kicks in once the table holds at least 64 buckets. Below that, `HashMap` resizes instead, because a small table is colliding from crowding, not from bad hashes.\n\nWhen the map's fill exceeds `capacity × loadFactor` (default 0.75), it **rehashes** — doubles the array and redistributes all entries.",
        explanation: `**Analogy:** Imagine a building with 16 floors (buckets). When you store something, the receptionist looks at your name tag (hashCode), does some math, and sends you to a floor. If floor 7 already has people (collision), they sit in a row of chairs (linked list) — or if it gets really crowded, they get an organized seating chart (red-black tree). Rehashing is the building expanding to 32 floors and everyone moving to potentially different floors.

**The key thing that breaks HashMap:** If your key's hashCode() always returns the same value — every entry lands in one bucket, turning your map into a linked list. O(n) for every get. This is actually a known denial-of-service vector in web apps where user-controlled input becomes map keys.

\`\`\`java
// This is why equals + hashCode BOTH must be overridden
public class UserId {
    private final String id;

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof UserId u)) return false;
        return this.id.equals(u.id);
    }

    @Override
    public int hashCode() {
        return id.hashCode(); // MUST be consistent with equals
    }
}
\`\`\`

**Why not use HashMap in multithreaded code?** Two threads calling put() simultaneously during rehashing can create a circular reference in the linked list (Java 7) or corrupt the tree structure (Java 8). Use ConcurrentHashMap — it locks at the bucket level, so reads are lock-free and writes only block that one bucket, not the whole map.`,
        followUps: [
          { text: "What stops one overloaded bucket from degrading lookups to O(n)?" },
          { text: "What is the load factor, and when does rehashing occur?" },
          { text: "What is the difference between `HashMap` and `ConcurrentHashMap` for multi-threaded access?" },
        ],
      },
      {
        id: 6,
        text: "What is the difference between `HashMap`, `LinkedHashMap`, and `TreeMap`?",
        answer:
            "All three implement the `Map` interface but differ in **ordering** and **performance**. `HashMap` makes no guarantees about iteration order — O(1) average for get/put. `LinkedHashMap` maintains **insertion order** (or access order if configured) by layering a doubly-linked list on top of the hash table — still O(1) for get/put with slightly more memory. `TreeMap` stores keys in **sorted order** (natural or via Comparator) using a red-black tree — O(log n) for get/put.\n\n`TreeMap` cannot have null keys; `HashMap` and `LinkedHashMap` allow one null key.",
        explanation: `**Analogy:** HashMap is a junk drawer — fast to toss things in and grab them, but no order. LinkedHashMap is a filing cabinet where new folders go at the back — you can walk through them in the order you added them. TreeMap is an alphabetically sorted index — slower to insert, but you can always ask "give me everything between A and F" in sorted order.

**Real-world usage in Spring:**

\`\`\`java
// HashMap — most common, just need key-value lookup
Map<String, UserDto> cache = new HashMap<>();

// LinkedHashMap — preserve insertion order, useful for LRU cache base
// Access-order mode: true = most recently accessed moves to end
Map<String, Response> lruCache = new LinkedHashMap<>(16, 0.75f, true) {
    protected boolean removeEldestEntry(Map.Entry eldest) {
        return size() > 100; // evict oldest when > 100 entries
    }
};

// TreeMap — when you need sorted keys
// Example: grouping errors by error code in sorted order for a report
TreeMap<String, List<String>> errorsByCode = new TreeMap<>();
\`\`\`

**The TreeMap ceiling/floor methods are a hidden gem:** TreeMap gives you methods like \`floorKey()\`, \`ceilingKey()\`, \`subMap()\` that HashMap simply can't do. If you ever need range queries on keys (e.g., "all users whose ID is between 100 and 200"), TreeMap is the right tool.`,
        followUps: [
          { text: "Which map would you use if you need insertion-order iteration?" },
          { text: "What is the time complexity of `get`/`put` for each of these maps?" },
          { text: "Can `TreeMap` store `null` keys? Can `HashMap`?" },
        ],
      },
      {
        id: 7,
        text: "What is the difference between `HashSet`, `LinkedHashSet`, and `TreeSet`?",
        answer:
            "`HashSet` is backed by a `HashMap` (values are stored as keys, a dummy object as value) — O(1) for add/contains/remove, no ordering. `LinkedHashSet` extends `HashSet` with a linked list to maintain **insertion order** — same O(1) operations, slight memory overhead. `TreeSet` implements `SortedSet` — elements are kept in **natural sorted order** or by a `Comparator`, using a red-black tree, so O(log n) operations.\n\n`HashSet` allows one `null`; `TreeSet` throws `NullPointerException` because it can't compare null to other elements.",
        explanation: `**Analogy:** HashSet is a bucket of unique marbles — you can quickly check if a marble is in there but don't know the order. LinkedHashSet is the same bucket but you've tied a string through the marbles in the order you added them — still fast, just ordered. TreeSet is a display rack that keeps marbles sorted by size automatically.

**The key: Sets guarantee uniqueness.** Uniqueness is determined by equals() and hashCode() — so if you add the same value twice, you still get one entry.

\`\`\`java
// HashSet — just uniqueness, order doesn't matter
Set<String> roles = new HashSet<>();
roles.add("ADMIN");
roles.add("USER");
roles.add("ADMIN"); // ignored — duplicate
System.out.println(roles.size()); // 2

// TreeSet — sorted set, useful for ranges and leaderboards
TreeSet<Integer> scores = new TreeSet<>();
scores.add(95);
scores.add(78);
scores.add(100);
System.out.println(scores.first()); // 78
System.out.println(scores.last());  // 100
System.out.println(scores.headSet(90)); // [78] — all scores below 90
\`\`\`

**In Spring Boot — where you actually see this:** In Spring Security, authorities/roles are stored in a collection of GrantedAuthority. Order rarely matters there, so HashSet is fine. But if you're building a leaderboard API or need to return items in a guaranteed sort, TreeSet does the work automatically without a separate sort step.`,
        followUps: [
          { text: "How is `HashSet` implemented internally in relation to `HashMap`?" },
          { text: "When would you use `TreeSet` over `HashSet`?" },
        ],
      },
      {
        id: 8,
        text: "Explain the concept of immutability. How do you create an immutable class in Java?",
        answer:
            "An immutable object's **state can't change after construction**. Building one is four straightforward rules and a fifth that people miss. Make the class `final` so nobody subclasses it and reintroduces mutability. Make every field `private final`. Provide no setters, and set everything in the constructor.\n\nThe fifth is where most attempts fail: if a field is itself mutable, like a `List` or a `Date`, `final` only stops you reassigning the reference, not the caller mutating what it points at. You need a **defensive copy** on the way in and another on the way out, or the object hands its own internals to anyone who asks.\n\n`String`, `Integer` and `LocalDate` are all immutable this way. Since Java 16 a `record` gives you most of it for free, though the defensive-copy problem is still yours to solve.",
        explanation: `**Analogy:** An immutable object is like a signed contract — once signed, neither party can change the terms. If you want different terms, you create a new contract entirely.

**The defensive copy trap that trips people:** Just making fields final isn't enough if the field is a mutable object.

\`\`\`java
// BROKEN — field is final but the List it points to is mutable
public final class BrokenRange {
    private final List<Integer> values;

    public BrokenRange(List<Integer> values) {
        this.values = values; // BAD: caller still holds a reference
    }

    public List<Integer> getValues() {
        return values; // BAD: returns the actual list
    }
}

// Caller can mutate your "immutable" object:
List<Integer> list = new ArrayList<>(Arrays.asList(1, 2, 3));
BrokenRange range = new BrokenRange(list);
list.add(99); // NOW range.getValues() has 4 elements!

// FIXED — defensive copies in and out
public final class SafeRange {
    private final List<Integer> values;

    public SafeRange(List<Integer> values) {
        this.values = List.copyOf(values); // immutable copy on way in
    }

    public List<Integer> getValues() {
        return values; // List.copyOf already unmodifiable
    }
}
\`\`\`

**Why immutability matters in Spring:** DTOs passed between layers are often shared references. If you return a mutable list from a service, the controller could modify it and corrupt cached state. Using immutable value objects (or Java records) removes an entire class of bugs. Records make this trivial:

\`\`\`java
public record UserDto(Long id, String name, String email) {}
// Already: final class, final fields, no setters, compact constructor
\`\`\``,
        followUps: [
          { text: "Why does an immutable class also need to be `final`?" },
          { text: "How do you handle mutable fields (like `Date` or `List`) inside an immutable class?" },
          { text: "Why are immutable objects naturally thread-safe?" },
        ],
      },
      {
        id: 9,
        text: "What is the difference between checked and unchecked exceptions?",
        answer:
            "**Checked exceptions** extend `Exception` (but not `RuntimeException`) — the compiler forces you to either catch them or declare them in the method signature with `throws`. They represent conditions the caller is expected to anticipate and handle (e.g., `IOException`, `SQLException`).\n\n**Unchecked exceptions** extend `RuntimeException` — no compiler enforcement, they propagate up the call stack until caught or the program crashes (e.g., `NullPointerException`, `IllegalArgumentException`). In modern Spring applications, **unchecked exceptions are almost always preferred** for custom exceptions because they don't pollute every method signature, and Spring's `@ControllerAdvice` handles them globally.",
        explanation: `**Analogy:** A checked exception is like your GPS saying "this road is under construction — you MUST acknowledge this and pick an alternate route before driving." An unchecked exception is like hitting a pothole you didn't know was there — it blows out your tire (crashes), and you deal with it afterward.

**The Spring pattern for custom exceptions:**

\`\`\`java
// Checked — forces every caller to handle or re-declare it
// Rarely used in Spring services anymore
public class PaymentProcessingException extends Exception {
    public PaymentProcessingException(String message) {
        super(message);
    }
}

// Unchecked — the Spring way
public class UserNotFoundException extends RuntimeException {
    public UserNotFoundException(Long userId) {
        super("User not found with id: " + userId);
    }
}

// In service — clean, no throws declaration needed
public UserDto getUser(Long id) {
    return userRepository.findById(id)
        .map(UserMapper::toDto)
        .orElseThrow(() -> new UserNotFoundException(id));
}

// Caught globally — one place, not scattered everywhere
@RestControllerAdvice
public class GlobalExceptionHandler {
    @ExceptionHandler(UserNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleNotFound(UserNotFoundException ex) {
        return ResponseEntity.status(404).body(new ErrorResponse(ex.getMessage()));
    }
}
\`\`\`

**The important nuance:** Don't use unchecked exceptions as an excuse to swallow or ignore errors. The difference is where the handling happens — not whether it happens at all.`,
        followUps: [
          { text: "Why does Spring wrap `SQLException` into `DataAccessException`?" },
          { text: "When should you create a custom checked exception vs an unchecked one in a Spring service?" },
          { text: "What is the difference between `throw` and `throws`?" },
        ],
      },
      {
        id: 10,
        text: "What is the try-with-resources statement and why is it useful?",
        answer:
            "Try-with-resources (introduced in Java 7) **automatically closes resources** declared in the try header when the block exits — whether normally, or due to an exception. A resource must implement the `AutoCloseable` interface (one method: `close()`).\n\nBefore it you wrote `finally` blocks by hand to close streams and connections. People got it wrong constantly — forgetting the null check, or ignoring an exception thrown by `close()` itself. Try-with-resources fixes all of that.",
        explanation: `**The old way — fragile and verbose:**

\`\`\`java
FileInputStream fis = null;
try {
    fis = new FileInputStream("file.txt");
    // use fis
} catch (IOException e) {
    // handle
} finally {
    if (fis != null) {
        try {
            fis.close(); // close() itself can throw!
        } catch (IOException e) {
            // now what?
        }
    }
}

// ---- The right way — try-with-resources ----
try (FileInputStream fis = new FileInputStream("file.txt")) {
    // use fis
} catch (IOException e) {
    // handle
}
// fis.close() is called automatically — even if an exception was thrown
\`\`\`

**Multiple resources:** They're closed in reverse order of declaration:

\`\`\`java
try (
    Connection conn = dataSource.getConnection();
    PreparedStatement stmt = conn.prepareStatement("SELECT * FROM users")
) {
    ResultSet rs = stmt.executeQuery();
    // ...
} // stmt closed first, then conn
\`\`\`

**In Spring Boot:** You rarely write this for DB connections because Spring/JPA handles connection lifecycle. But you'll use it for file I/O, HTTP client responses (RestTemplate, OkHttp), and any custom resource. If you write a class that manages external resources, implement \`AutoCloseable\` so callers can use it safely.`,
        followUps: [
          { text: "What interface must a resource implement to work with try-with-resources?" },
          { text: "What happens to suppressed exceptions when both `try` and `close()` throw?" },
        ],
      },
      {
        id: 11,
        text: "Explain the concept of autoboxing and unboxing.",
        answer:
            "**Autoboxing** is Java automatically converting a primitive to its wrapper — `int` to `Integer`. **Unboxing** is the reverse. It's transparent, so you write `Integer x = 5` and the compiler quietly inserts `Integer.valueOf(5)` for you.\n\nThat transparency is exactly what makes it worth knowing, because three things go wrong and none of them look like they involve boxing. Unboxing a `null` wrapper throws `NullPointerException` — an `Integer` that's null assigned to an `int` blows up on a line with no method call on it. Comparing boxed values with `==` compares references, and the `Integer` cache only covers **-128 to 127**, so the same comparison passes for 100 and fails for 1000. And autoboxing inside a tight loop allocates an object per iteration, which turns a counter into GC pressure.",
        explanation: `**The null unboxing trap — a real production bug:**

\`\`\`java
// This looks fine but will throw NullPointerException
Map<String, Integer> counts = new HashMap<>();
int count = counts.get("nonexistent"); // get() returns null, unboxing null → NPE
// Fix:
int safeCount = counts.getOrDefault("nonexistent", 0); // safe

// ---- The Integer cache surprise ----
Integer a = 127;
Integer b = 127;
System.out.println(a == b); // true — same cached object

Integer c = 128;
Integer d = 128;
System.out.println(c == d); // false — different objects!
\`\`\`

The JVM caches Integer objects between -128 and 127 in a pool. Above 127, each autobox creates a new object. This is why == on Integer is a ticking time bomb.

**The performance trap in streams:**

\`\`\`java
// BAD — boxes every int to Integer, creating garbage
List<Integer> nums = List.of(1, 2, 3, 4, 5);
int sum = nums.stream()
              .reduce(0, Integer::sum); // constant boxing/unboxing

// GOOD — use primitive stream
int fastSum = nums.stream()
                  .mapToInt(Integer::intValue) // unbox once
                  .sum(); // no more boxing
\`\`\``,
        followUps: [
          { text: "What is the difference between `int` and `Integer` in terms of memory and nullability?" },
          { text: "How can autoboxing cause a `NullPointerException`?" },
        ],
      },
      {
        id: 12,
        text: "What is the difference between `final`, `finally`, and `finalize()`?",
        answer:
            "These three have nothing to do with each other beyond sharing the word 'final'. **`final`** is a modifier: on a variable = can't reassign, on a method = can't override, on a class = can't extend. **`finally`** is a block in exception handling that always runs after try/catch, regardless of whether an exception was thrown — used for cleanup.\n\n**`finalize()`** was a method on `Object` the GC called before collecting an object. It was **deprecated in Java 9** and **deprecated for removal in Java 18** (JEP 421), which also added `--finalization=disabled` to switch it off entirely. It's unreliable, slow, and delays reclamation — an object with a finalizer needs two GC cycles to die. Use `AutoCloseable` + try-with-resources instead.",
        explanation: `**final — three distinct uses:**

\`\`\`java
// final variable — must be assigned exactly once
final int MAX_RETRIES = 3;
// MAX_RETRIES = 4; // compile error

// final method — cannot be overridden by subclass
public final void audit() { ... }

// final class — cannot be extended
public final class ApiKey { ... }  // String is final this way
\`\`\`

**finally — the cleanup block:**

\`\`\`java
try {
    // risky operation
} catch (Exception e) {
    // handle
} finally {
    // always runs — even if catch re-throws or return is called
    // Exception: System.exit() or JVM crash bypasses it
}
\`\`\`

**The one tricky case:** If both try and finally return a value, the finally return wins — this is almost always a bug. Avoid returning from finally blocks.

**finalize() — why it's dead:**

The problem was that finalize() ran on the GC thread at an indeterminate time. Objects with a finalizer couldn't be collected in the first GC pass — they had to be queued, finalized, then collected in the next pass. This delayed memory reclamation and caused "finalizer storms" in high-load apps. The modern replacement is try-with-resources with AutoCloseable for deterministic cleanup.`,
        followUps: [
          { text: "Does `finally` always execute?" },
          { text: "Why is `finalize()` deprecated, and what should you use instead?" },
        ],
      },
      {
        id: 13,
        text: "What are functional interfaces? Give examples of built-in ones.",
        answer:
            "A functional interface has **exactly one abstract method** — that's what makes it a valid target for a lambda expression or method reference. The `@FunctionalInterface` annotation is optional but recommended — it makes the compiler enforce the single-abstract-method rule.\n\nBuilt-in ones in `java.util.function`: `Predicate<T>` (takes T, returns boolean), `Function<T,R>` (takes T, returns R), `Consumer<T>` (takes T, returns nothing), `Supplier<T>` (takes nothing, returns T), `BiFunction<T,U,R>` (takes two args). A functional interface CAN have multiple default or static methods — only the abstract method count matters.",
        explanation: `**The four workhorses you'll use constantly:**

\`\`\`java
// Predicate — is this true or false?
Predicate<User> isActive = user -> user.getStatus() == Status.ACTIVE;
users.stream().filter(isActive).collect(Collectors.toList());

// Function — transform one thing to another
Function<User, String> getName = User::getName;
users.stream().map(getName).collect(Collectors.toList());

// Consumer — do something with each item, no return
Consumer<User> sendWelcomeEmail = user -> emailService.send(user.getEmail());
users.forEach(sendWelcomeEmail);

// Supplier — give me something on demand (lazy evaluation)
Supplier<User> defaultUser = () -> new User("Guest");
User user = Optional.ofNullable(foundUser).orElseGet(defaultUser);
// orElseGet is lazy — the Supplier only runs if foundUser is null
// vs orElse(new User("Guest")) — always creates the object even if not needed
\`\`\`

**The Spring context:** Spring's \`@Qualifier\` resolution, bean post-processors, and the reactive WebFlux pipeline all use functional interfaces under the hood. Once you internalize Predicate/Function/Consumer/Supplier, reading Spring's own source code becomes much easier.`,
        followUps: [
          { text: "What is the `@FunctionalInterface` annotation for, and is it mandatory?" },
          { text: "Explain `Predicate`, `Function`, `Consumer`, and `Supplier` with one-line use cases." },
        ],
      },
      {
        id: 14,
        text: "What are Lambda expressions and how do they improve code readability?",
        answer:
            "A lambda is an **anonymous function** — it has parameters, a body, and a return type, but no name and no class. Lambdas implement functional interfaces inline, eliminating the need for anonymous inner class boilerplate. The syntax is `(parameters) -> expression` or `(parameters) -> { block; }`.\n\nThey don't just save lines — they keep the *what to do* next to the *where it's used*. Method references (`Class::method`) go further still, dropping the lambda wrapper when you're only delegating to an existing method.",
        explanation: `**Before lambdas — anonymous inner class noise:**

\`\`\`java
// Java 7 style — 5 lines to say "sort by name"
Collections.sort(users, new Comparator<User>() {
    @Override
    public int compare(User a, User b) {
        return a.getName().compareTo(b.getName());
    }
});

// Java 8 lambda — intent is crystal clear
users.sort((a, b) -> a.getName().compareTo(b.getName()));

// Method reference — even cleaner when it's just a single method call
users.sort(Comparator.comparing(User::getName));
\`\`\`

**The "this" difference — a real gotcha:** Inside a lambda, \`this\` refers to the enclosing class (same as regular code). Inside an anonymous inner class, \`this\` refers to the anonymous class itself. This trips people up when trying to reference the outer class from an anonymous listener.

\`\`\`java
public class MyService {
    public void doWork() {
        // Lambda: this = MyService instance
        Runnable r = () -> System.out.println(this.getClass().getName()); // "MyService"

        // Anonymous class: this = the Runnable anonymous class
        Runnable r2 = new Runnable() {
            public void run() {
                System.out.println(this.getClass().getName()); // anonymous class name
            }
        };
    }
}
\`\`\`

**Effectively final:** A lambda can capture local variables from the enclosing scope, but those variables must be effectively final (not reassigned after initialization). This is because lambdas might outlive the stack frame where the variable was declared.`,
        followUps: [
          { text: "What is the difference between a lambda and an anonymous inner class regarding `this`?" },
          { text: "What are method references, and when would you use them instead of lambdas?" },
          { text: "Can a lambda capture and modify a local variable? What is effectively final?" },
        ],
      },
      {
        id: 15,
        text: "Explain the Stream API — what is the difference between intermediate and terminal operations?",
        answer:
            "**Intermediate operations** (like `filter`, `map`, `sorted`, `distinct`) transform the stream and return a new stream — they are **lazy**, meaning they don't execute until a terminal operation is called. **Terminal operations** (like `collect`, `forEach`, `count`, `findFirst`, `reduce`) trigger actual processing and produce a result or side effect.\n\nStreams are single-use — once a terminal operation is called, the stream is consumed and can't be reused. The laziness matters for performance: `filter(...).map(...).findFirst()` stops as soon as the first match is found — it doesn't process the entire collection.",
        explanation: `**Laziness in action — short-circuiting:**

\`\`\`java
List<String> names = List.of("Alice", "Bob", "Charlie", "David");

// This doesn't process "Charlie" or "David" at all
Optional<String> first = names.stream()
    .filter(n -> {
        System.out.println("Filtering: " + n); // only prints Alice, Bob
        return n.startsWith("B");
    })
    .findFirst();
// Output: "Filtering: Alice", "Filtering: Bob"
// findFirst() stops after finding "Bob"
\`\`\`

**The pipeline builds a recipe, terminal operation cooks it:**

\`\`\`java
// Nothing happens here — just building the pipeline
Stream<String> pipeline = names.stream()
    .filter(n -> n.length() > 3)
    .map(String::toUpperCase)
    .sorted();

// Execution happens only when you call a terminal operation
List<String> result = pipeline.collect(Collectors.toList());
\`\`\`

**findFirst() vs findAny():** findFirst() returns the first element in encounter order — predictable. findAny() can return any element and is optimized for parallel streams where encounter order is expensive to maintain. On sequential streams they behave the same.

**Parallel streams — use with care:** parallelStream() splits the work across multiple threads using the common ForkJoinPool. It's only beneficial for CPU-intensive operations on large data sets. For I/O bound work or small collections, it actually hurts performance due to thread coordination overhead. Never use parallel streams with stateful operations or side effects.`,
        followUps: [
          { text: "Are streams lazy? Give an example of short-circuiting." },
          { text: "What is the difference between `findFirst()` and `findAny()`?" },
          { text: "When should you use a parallel stream, and what are the pitfalls?" },
        ],
      },
      {
        id: 16,
        text: "What is the difference between `map()` and `flatMap()` in streams?",
        answer:
            "`map()` applies a function to each element and produces **one output per input** — the stream stays the same size. `flatMap()` applies a function that returns a stream for each element, then **flattens all those streams into one** — use it when each element produces multiple results.\n\nThe mental model: `map` is 1-to-1 transformation; `flatMap` is 1-to-many transformation where you want the results in a single flat stream, not a stream of lists.",
        explanation: `**The concrete problem map() can't solve:**

\`\`\`java
// Each order has a list of items
List<Order> orders = List.of(
    new Order(List.of("Apple", "Bread")),
    new Order(List.of("Milk", "Cheese", "Eggs"))
);

// map() gives you Stream<List<String>> — nested!
Stream<List<String>> nested = orders.stream()
    .map(Order::getItems);

// flatMap() flattens to Stream<String> — what you actually want
List<String> allItems = orders.stream()
    .flatMap(order -> order.getItems().stream())
    .collect(Collectors.toList());
// ["Apple", "Bread", "Milk", "Cheese", "Eggs"]

// ---- flatMap on Optional — the monadic use ----
// User.getAddress() returns Optional<Address> — that return type is what nests
Optional<User> user = userRepository.findById(id);

// map() wraps a value that is ALREADY an Optional
Optional<Optional<Address>> nested = user.map(User::getAddress); // wrong shape

// flatMap() unwraps one layer — stays flat
Optional<String> city = user
    .flatMap(User::getAddress)  // Optional<Address>
    .map(Address::getCity);     // Optional<String> — correct
// Use flatMap when the mapping function itself returns Optional
\`\`\`

**mapToInt / mapToLong / mapToDouble:** These return primitive streams (IntStream, LongStream, DoubleStream) and avoid boxing. Use them when you're doing numeric aggregations:

\`\`\`java
// Avoids boxing Integer objects
int totalAge = users.stream()
    .mapToInt(User::getAge)
    .sum(); // also: average(), min(), max()
\`\`\``,
        followUps: [
          { text: "Give a concrete example where `flatMap` is required (e.g., list of lists)." },
          { text: "How does `flatMap` relate to `Optional`?" },
          { text: "What does `mapToInt` / `flatMapToInt` buy you over boxed streams?" },
        ],
      },
      {
        id: 17,
        text: "What is the difference between `Comparable` and `Comparator`?",
        answer:
            "`Comparable` defines the **natural ordering** of a class — it's implemented on the class itself via `compareTo()`. It bakes ordering into the class: `String`, `Integer`, `LocalDate` all implement Comparable.\n\n`Comparator` is an **external ordering strategy** — a separate object that knows how to compare two instances. Use Comparable for the default sort order that makes the most sense for the type. Use Comparator when you need an alternative sort order, or when sorting a class you don't own (third-party or JDK class).",
        explanation: `**Comparable — the class defines its own order:**

\`\`\`java
public class Product implements Comparable<Product> {
    private String name;
    private double price;

    @Override
    public int compareTo(Product other) {
        return Double.compare(this.price, other.price); // natural order = by price
    }
}

List<Product> products = new ArrayList<>(...);
Collections.sort(products); // uses compareTo() — sorts by price

// ---- Comparator — external, flexible, chainable ----
// Sort by name instead
Comparator<Product> byName = Comparator.comparing(Product::getName);

// Sort by price descending, then by name ascending as tiebreaker
Comparator<Product> complex = Comparator
    .comparingDouble(Product::getPrice).reversed()
    .thenComparing(Product::getName);

products.sort(complex);
\`\`\`

**The null-safe sort gotcha:** Comparator.comparing() throws NPE if any field is null. Use nullsFirst() or nullsLast():

\`\`\`java
Comparator<Product> safeSort = Comparator.comparing(
    Product::getCategory,
    Comparator.nullsLast(Comparator.naturalOrder())
);
\`\`\`

**The inconsistency trap:** If your \`compareTo\` is inconsistent with \`equals\` (they disagree on equality), TreeSet and TreeMap will behave strangely — they use compareTo for membership checks, not equals. The contract says: if compareTo returns 0, equals should return true.`,
        followUps: [
          { text: "What breaks if `compareTo` returns inconsistent results for the same pair?" },
          { text: "How do you sort a list of objects by multiple fields using Comparator chaining?" },
          { text: "What happens if `compareTo` is inconsistent with `equals`?" },
        ],
      },
      {
        id: 18,
        text: "What is the diamond problem in Java, and how does Java handle it with interfaces?",
        answer:
            "The diamond problem occurs when a class inherits from two sources that both define the same method, creating ambiguity about which version to use. Java avoids this for classes by **disallowing multiple class inheritance** — a class can only extend one class.\n\nBut with interfaces, since Java 8 introduced `default` methods, a class can implement two interfaces that both have the same default method. Java resolves this by **forcing the implementing class to override the method** — the code won't compile until you do. The priority rules: class wins over interface, more specific interface wins over more general.",
        explanation: `**The ambiguity the compiler catches:**

\`\`\`java
interface A {
    default void hello() { System.out.println("Hello from A"); }
}

interface B {
    default void hello() { System.out.println("Hello from B"); }
}

// COMPILE ERROR — class C must override hello()
class C implements A, B { }

// FIXED — you decide
class C implements A, B {
    @Override
    public void hello() {
        A.super.hello(); // explicitly call A's version
        // or B.super.hello(), or your own logic entirely
    }
}
\`\`\`

**Why Java banned multiple class inheritance in the first place:** If two parent classes each have a different implementation of the same method and store different state, the JVM doesn't know how to lay out memory for the subclass. It would need two copies of all parent fields, and method resolution becomes ambiguous. Interfaces historically had no state and no implementation, so multiple interface inheritance was safe.

**The priority rules summarized:**
1. Class method wins over interface default method
2. More specific interface wins over more general interface
3. If still ambiguous, you must override explicitly`,
        followUps: [
          { text: "What happens if two interfaces provide the same default method — how do you resolve it?" },
          { text: "Why doesn't Java allow multiple class inheritance?" },
          { text: "How does class method priority work when a class implements an interface with a default method it also inherits from a superclass?" },
        ],
      },
      {
        id: 19,
        text: "Explain method overloading vs method overriding.",
        answer:
            "**Overloading** is having multiple methods with the same name in the same class but **different parameter lists** (different type, count, or order). Resolved at **compile time** based on the argument types — this is static/compile-time polymorphism.\n\n**Overriding** is when a subclass provides a **different implementation for a method inherited from the parent class** — same name, same parameter list, same (or covariant) return type. Resolved at **runtime** based on the actual object type — this is dynamic/runtime polymorphism.",
        explanation: `**Overloading — resolved at compile time:**

\`\`\`java
public class Calculator {
    public int add(int a, int b) { return a + b; }
    public double add(double a, double b) { return a + b; }
    public int add(int a, int b, int c) { return a + b + c; }
}
// The compiler picks the right version based on argument types

// ---- Overriding — resolved at runtime (dynamic dispatch) ----
class Animal {
    public String sound() { return "..."; }
}

class Dog extends Animal {
    @Override
    public String sound() { return "Woof"; }
}

Animal a = new Dog(); // compile-time type = Animal
a.sound(); // runtime type = Dog → "Woof"
// The JVM checks the actual object type, not the variable type
\`\`\`

**Key rules for overriding:**
- Same method signature (name + params)
- Return type must be same OR a subtype (covariant return — Java 5+)
- Access modifier can be same or more permissive (can't narrow it)
- Can't override final or static methods (static methods are hidden, not overridden)

**Static method "hiding" — not the same as overriding:**
\`\`\`java
class Parent {
    public static void greet() { System.out.println("Parent"); }
}

class Child extends Parent {
    public static void greet() { System.out.println("Child"); }
}

Parent p = new Child();
p.greet(); // "Parent" — resolved at compile time, not runtime
// Static methods belong to the class, not the instance
\`\`\``,
        followUps: [
          { text: "Can two methods differ only by their return type?" },
          { text: "Can you override a static method? What is method hiding?" },
        ],
      },
      {
        id: 20,
        text: "What is the significance of the `static` keyword?",
        answer:
            "`static` means the member belongs to the **class itself**, not to any particular instance. A static field is shared across all instances — there's only one copy per class. A static method can be called without creating an object. Static blocks run once when the class is loaded by the JVM. Static nested classes don't hold a reference to the outer class instance.\n\nKey implications: static members can't access instance fields/methods (no `this` reference), and they can't be overridden (only hidden).",
        explanation: `**When static makes sense vs when it's a trap:**

\`\`\`java
public class AppConfig {
    // Good use: constant shared across all instances
    public static final int MAX_CONNECTIONS = 100;
    
    // Good use: utility/factory method — no state needed
    public static AppConfig fromEnvironment() {
        return new AppConfig(System.getenv("DB_URL"));
    }
    
    // Bad use: mutable static state — shared & not thread-safe
    private static int requestCount = 0; // race condition waiting to happen
    public static void incrementCount() { requestCount++; } // not atomic!
}

// ---- Static block — runs once at class load ----
public class DbDriver {
    static {
        // Runs when class is first loaded
        // Order: static block → instance block → constructor
        System.out.println("Loading DB driver...");
        try {
            Class.forName("com.mysql.cj.jdbc.Driver");
        } catch (ClassNotFoundException e) {
            // a static block can't throw checked exceptions — wrap or the class won't load
            throw new ExceptionInInitializerError(e);
        }
    }
}
\`\`\`

**In Spring — why static is awkward:** Spring manages beans as instances. If you put business logic in static methods, Spring can't proxy them (for AOP, @Transactional, etc.) and you can't inject dependencies into them. Static utility methods are fine (StringUtils, Objects), but Spring services should never be static.

**Static import — useful for readability in tests:**
\`\`\`java
import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.when;

// Cleaner test code without class prefix
assertThat(result).isEqualTo("expected");
when(service.get(1L)).thenReturn(user);
\`\`\``,
        followUps: [
          { text: "When are static blocks executed relative to constructors?" },
          { text: "Why is static mutable state a problem in a Spring application?" },
        ],
      },
      {
        id: 21,
        text: "What are Java generics and why are they used?",
        answer:
            "Generics let you write **type-safe, reusable code** by parameterizing classes and methods with type placeholders. Instead of `List list` (where you could accidentally mix types), you write `List<String>` — the compiler enforces that only Strings go in and come out.\n\nAt **runtime, generics are erased** (type erasure) — `List<String>` becomes `List` in bytecode. This is why you can't do `new T[]`, `instanceof T`, or `T.class` at runtime — the JVM doesn't know what `T` is anymore.",
        explanation: `**Analogy:** A generic type is the label on a storage crate. \`List<String>\` is a crate stamped "STRINGS ONLY", and the compiler checks every item going in. **Type erasure** is that label being peeled off before the crate ships to the warehouse — at runtime it's just a crate, which is why no one can read the label back.

**Why generics exist — the pre-generics pain:**

\`\`\`java
// Pre-Java 5 — no type safety
List names = new ArrayList();
names.add("Alice");
names.add(42); // oops — compiles fine!
String name = (String) names.get(1); // ClassCastException at runtime

// With generics — caught at compile time
List<String> names = new ArrayList<>();
names.add("Alice");
names.add(42); // compile error — cannot add int to List<String>

// ---- Type erasure — what actually exists at runtime ----

// These two have IDENTICAL bytecode after compilation
List<String> strings = new ArrayList<>();
List<Integer> ints = new ArrayList<>();

System.out.println(strings.getClass() == ints.getClass()); // true
// At runtime, both are just ArrayList
\`\`\`

**Wildcards — when you don't know the exact type:**
\`\`\`java
// List<?> — read-only, any type (wildcard)
void printAll(List<?> items) {
    items.forEach(System.out::println); // can read
    // items.add("x"); // compile error — can't add (type unknown)
}

// ? extends Number — producer: can read as Number
void sumAll(List<? extends Number> nums) {
    nums.stream().mapToDouble(Number::doubleValue).sum(); // OK
}

// ? super Integer — consumer: can add Integer to it
void addNumbers(List<? super Integer> list) {
    list.add(42); // OK — Integer is-a ? super Integer
}
\`\`\`

**PECS — Producer Extends, Consumer Super:** If you're reading from a generic collection (it produces values), use \`extends\`. If you're writing to it (it consumes values), use \`super\`. If both, use a concrete type.`,
        followUps: [
          { text: "What is type erasure, and how does it limit generics at runtime?" },
          { text: "What is the difference between `List<?>`, `List<Object>`, and `List<? extends Number>`?" },
          { text: "What are PECS (Producer Extends, Consumer Super) guidelines?" },
        ],
      },
      {
        id: 22,
        text: "What is the volatile keyword used for?",
        answer:
            "`volatile` guarantees **visibility** — when one thread writes to a volatile variable, the new value is immediately visible to all other threads. Without it, threads may read stale values from their CPU cache.\n\nWhat `volatile` does NOT guarantee: **atomicity**. `count++` is a read-modify-write, not one operation. Even with `count` marked volatile, two threads can both read 5, both write 6, and you've silently lost an increment. Use `AtomicInteger` for thread-safe incrementing, and `synchronized` when you need to protect a multi-step critical section.",
        explanation: `**Analogy:** Every CPU core keeps a private scratchpad copy of a shared value. \`volatile\` is the rule "always read the noticeboard, never your scratchpad" — so everyone sees the same value. What it does **not** do is stop two people scribbling on the noticeboard at the same moment, which is why \`count++\` still loses updates.

**The visibility problem volatile solves:**

\`\`\`java
// Without volatile — this loop may run forever
// Thread 2's write to running may never be visible to Thread 1's CPU cache
class Task implements Runnable {
    private boolean running = true; // NOT volatile

    public void run() {
        while (running) { // Thread 1 may cache this as true forever
            doWork();
        }
    }

    public void stop() {
        running = false; // Thread 2 writes here
    }
}

// With volatile — Thread 1 always reads from main memory
private volatile boolean running = true; // Fixed

// ---- The atomicity trap — volatile is NOT enough for count++ ----

// BROKEN — volatile doesn't protect this compound operation
private volatile int count = 0;

// Two threads both read count=5, both write count=6, you lose one increment
public void increment() { count++; } // read + increment + write = 3 steps

// FIXED — use AtomicInteger
private final AtomicInteger count = new AtomicInteger(0);
public void increment() { count.incrementAndGet(); } // atomic CAS operation
\`\`\`

**Happens-before guarantee:** A write to a volatile variable happens-before every subsequent read of that variable. This means anything a thread did BEFORE writing to volatile is visible to any thread that reads that volatile AFTER.

**Where you see volatile in the wild:** The classic double-checked locking for lazy singleton initialization requires volatile to prevent the JVM from reordering instructions:
\`\`\`java
class Singleton {
    private static volatile Singleton instance;
    
    public static Singleton getInstance() {
        if (instance == null) {
            synchronized (Singleton.class) {
                if (instance == null) {
                    instance = new Singleton(); // volatile prevents partial initialization visibility
                }
            }
        }
        return instance;
    }
}
\`\`\``,
        followUps: [
          { text: "Does `volatile` guarantee atomicity for compound operations like `count++`?" },
          { text: "What is the happens-before relationship established by volatile?" },
          { text: "How does `volatile` differ from `synchronized`?" },
        ],
      },
      {
        id: 23,
        text: "Explain the basics of multithreading — `Thread` vs `Runnable`.",
        answer:
            "A `Thread` is the **unit of execution** the OS schedules; a `Runnable` is just the **task** you want run. **Prefer `Runnable`.** Extending `Thread` burns your one inheritance slot and welds the task to the threading mechanism. `Runnable` separates *what to do* from *how it runs*, so the same task can go to a thread pool, a scheduler, or a plain `Thread`.\n\n`Callable<T>` is like `Runnable` but **returns a value and can throw checked exceptions**. In modern Java you almost never extend `Thread` directly — you hand a `Runnable` or `Callable` to an `ExecutorService`.",
        explanation: `**The extends Thread approach — don't do this:**

\`\`\`java
// BAD — tied to Thread, can't reuse the logic elsewhere
class MyTask extends Thread {
    @Override
    public void run() {
        System.out.println("Doing work...");
    }
}
new MyTask().start();

// ---- The Runnable approach — prefer this ----

// GOOD — task is decoupled from threading mechanism
Runnable task = () -> System.out.println("Doing work...");

// Can submit to a thread pool (the normal way in Spring)
ExecutorService pool = Executors.newFixedThreadPool(4);
pool.submit(task);

// Or run in a new thread (rarely needed directly)
new Thread(task).start();
\`\`\`

**The critical start() vs run() distinction:**
\`\`\`java
Thread t = new Thread(() -> System.out.println(Thread.currentThread().getName()));

t.run();   // BAD — runs on the CURRENT thread synchronously. Not a new thread at all.
t.start(); // GOOD — creates a new OS thread, run() executes on that thread
\`\`\`

**Thread lifecycle states:** NEW → RUNNABLE → (BLOCKED / WAITING / TIMED_WAITING) → TERMINATED. A thread in BLOCKED state is waiting to acquire a monitor lock. WAITING is waiting indefinitely (on Object.wait() or join()). TIMED_WAITING has a timeout (Thread.sleep(), wait(timeout)).`,
        followUps: [
          { text: "What is the difference between `Runnable` and `Callable`?" },
          { text: "What is the difference between `start()` and `run()`?" },
          { text: "What are the states in a thread's lifecycle?" },
        ],
      },
      {
        id: 24,
        text: "What is the difference between `synchronized` method and `synchronized` block?",
        answer:
            "A **synchronized method** locks the entire method — on `this` for instance methods, on the `Class` object for static methods. A **synchronized block** locks only a specific section of code, and you choose the monitor object explicitly.\n\nPrefer synchronized blocks because they minimize the time you hold the lock — narrower critical sections mean less contention and better throughput. If you synchronize a whole method that does 90% non-shared work, you're blocking other threads unnecessarily for the whole duration.",
        explanation: `**Synchronized method — locks the whole thing:**

\`\`\`java
// Instance method — locks on 'this'
public synchronized void increment() {
    count++; // only this line needs protection, but whole method is locked
    log("incremented"); // slow I/O — but still holding the lock!
}

// Static method — locks on Counter.class
public static synchronized Counter getInstance() { ... }

// ---- Synchronized block — lock only what matters ----
public void increment() {
    // Do non-critical work without holding lock
    String message = "incremented to " + (count + 1);
    
    synchronized (this) {
        count++; // lock only for the shared state modification
    }
    
    log(message); // slow I/O outside the lock
}
\`\`\`

**Race condition — what synchronized prevents:**

**The lock object matters:** Don't synchronize on public objects or literals — someone else could lock on the same object and create unexpected deadlocks. Use a private dedicated lock object:

\`\`\`java
// Without synchronization — race condition
// Thread 1: reads count = 5
// Thread 2: reads count = 5
// Thread 1: writes count = 6
// Thread 2: writes count = 6  ← increment lost!
private int count = 0;
public void increment() { count++; }

// With synchronization — atomic read-modify-write
private int safeCount = 0;
public synchronized void incrementSafely() { safeCount++; }

// Or use AtomicInteger — faster, no lock needed
private final AtomicInteger atomicCount = new AtomicInteger(0);
public void incrementAtomically() { atomicCount.incrementAndGet(); }

private final Object lock = new Object();
synchronized (lock) { ... } // safer than synchronized (this)
\`\`\``,
        followUps: [
          { text: "What object is locked when you synchronize on a static method vs an instance method?" },
          { text: "What is a race condition, and how does synchronization prevent it?" },
        ],
      },
      {
        id: 25,
        text: "What are `ExecutorService` and thread pools?",
        answer:
            "`ExecutorService` is the standard Java API for managing a **pool of reusable threads**. Instead of creating a new `Thread` per task (expensive — roughly **1ms to start and ~1MB of stack** each), you submit tasks to a pool that recycles its threads.\n\n**`execute(Runnable)`** is fire-and-forget — no return value. **`submit(Callable)`** returns a **`Future<T>`** you can use to get the result, check completion, or cancel.\n\nIn Spring Boot, `@Async` methods run on an `ExecutorService` under the hood, configured via a **`ThreadPoolTaskExecutor`** bean.",
        explanation: `**The cost of creating threads manually:**

\`\`\`java
// BAD — creates and destroys a thread for every request
for (Request request : requests) {
    new Thread(() -> process(request)).start(); // ~1ms to start, ~1MB stack
}

// GOOD — reuses a pool of 10 threads for all requests
ExecutorService pool = Executors.newFixedThreadPool(10);
for (Request request : requests) {
    pool.submit(() -> process(request));
}
pool.shutdown(); // stop accepting new tasks, finish pending ones

// ---- execute() vs submit() ----

// execute — fire and forget, no result, unchecked exceptions are unhandled
pool.execute(() -> sendNotification(userId));

// submit — returns Future, can get result or catch exceptions
Future<UserDto> future = pool.submit(() -> fetchUser(userId));
UserDto user = future.get(); // blocks until done (or throws ExecutionException)
\`\`\`

**Spring Boot @Async — the practical integration:**
\`\`\`java
@Configuration
@EnableAsync
public class AsyncConfig {
    @Bean
    public Executor taskExecutor() {
        ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();
        executor.setCorePoolSize(5);     // always keep 5 threads alive
        executor.setMaxPoolSize(20);     // can grow to 20 under load
        executor.setQueueCapacity(100);  // queue up to 100 tasks before rejecting
        executor.setThreadNamePrefix("async-");
        executor.initialize();
        return executor;
    }
}

@Service
public class EmailService {
    @Async  // runs on the thread pool above, returns immediately to caller
    public CompletableFuture<Void> sendEmail(String to) {
        // long-running email sending
        return CompletableFuture.completedFuture(null);
    }
}
\`\`\``,
        followUps: [
          { text: "What is the difference between `execute()` and `submit()`?" },
          { text: "What is a `Future` and how do you get results from async tasks?" },
          { text: "How do you configure a custom thread pool in a Spring Boot app?" },
        ],
      },
      {
        id: 26,
        text: "What is a deadlock, and how can it be avoided?",
        answer:
            "A deadlock is two or more threads each holding a lock the other one needs, so nobody can move and nobody gives up. Thread A holds lock 1 and wants lock 2, thread B holds lock 2 and wants lock 1, and both wait forever.\n\nIt takes four conditions holding **at once** — the Coffman conditions. **Mutual exclusion**, only one thread can hold a lock. **Hold and wait**, a thread keeps what it has while asking for more. **No preemption**, nothing can force a lock back. And **circular wait**, where the chain of waiting closes into a loop.\n\nThat's a useful thing to know because you only have to break **one** of them. Consistent lock ordering is the standard fix and it targets circular wait — if every thread takes lock 1 before lock 2, the cycle can't close. `tryLock()` with a timeout breaks hold-and-wait instead, since a thread gives up rather than waiting forever. Best of all is not holding two locks at the same time.",
        explanation: `**The classic deadlock:**

\`\`\`java
Object lockA = new Object();
Object lockB = new Object();

// sleep() throws InterruptedException, and a Runnable can't declare checked
// exceptions — so the catch is mandatory, not decoration
static void pause() {
    try { Thread.sleep(100); }
    catch (InterruptedException e) { Thread.currentThread().interrupt(); }
}

// Thread 1: acquires A, then tries to get B
Thread t1 = new Thread(() -> {
    synchronized (lockA) {
        pause(); // simulate work — lets T2 grab lockB first
        synchronized (lockB) { // WAITING — Thread 2 holds B
            System.out.println("T1 done");
        }
    }
});

// Thread 2: acquires B, then tries to get A
Thread t2 = new Thread(() -> {
    synchronized (lockB) {
        pause();
        synchronized (lockA) { // WAITING — Thread 1 holds A
            System.out.println("T2 done");
        }
    }
});

t1.start(); t2.start();
// Both threads wait forever — deadlock
\`\`\`

**Fix 1 — consistent lock ordering (simplest):**
\`\`\`java
// Both threads always acquire A before B — no circular wait
Thread t1 = new Thread(() -> {
    synchronized (lockA) {
        synchronized (lockB) { System.out.println("T1 done"); }
    }
});
Thread t2 = new Thread(() -> {
    synchronized (lockA) { // same order as T1
        synchronized (lockB) { System.out.println("T2 done"); }
    }
});

// ---- Fix 2 — tryLock with timeout (ReentrantLock) ----
ReentrantLock lockA = new ReentrantLock();
ReentrantLock lockB = new ReentrantLock();

if (lockA.tryLock(1, TimeUnit.SECONDS)) {
    try {
        if (lockB.tryLock(1, TimeUnit.SECONDS)) {
            try {
                // do work
            } finally { lockB.unlock(); }
        }
    } finally { lockA.unlock(); }
} // if tryLock fails, back off and retry — no deadlock
\`\`\`

**Diagnosing a deadlock in production:** Run \`jstack <pid>\` — it prints a thread dump. Look for threads in "BLOCKED" state with "waiting to lock" messages, and a "Found one Java-level deadlock" section. In Spring Boot, Actuator's \`/actuator/threaddump\` endpoint returns this as JSON without shell access.`,
        followUps: [
          { text: "How would you diagnose a deadlock in a JVM that's already hung?" },
          { text: "How do lock ordering and timeouts help prevent deadlocks?" },
        ],
      },
      {
        id: 27,
        text: "What is garbage collection in Java, and how does it work at a high level?",
        answer:
            "Java's garbage collector automatically reclaims memory for objects that are no longer reachable from any live thread or static variable. It works on the **generational hypothesis**: most objects die young.\n\nThe heap is split into **Young Generation** (new objects) and **Old Generation** (long-lived objects). Minor GC runs frequently to clean up Eden space (where new objects are born) — it's fast because most objects are already dead. Major/Full GC cleans the Old Generation — it's slower and pauses the application.\n\nModern collectors like G1GC and ZGC reduce pause times by doing most work concurrently with the application.",
        explanation: `**Analogy:** A restaurant kitchen during service. Most dishes are plated and cleared within minutes — that's **Eden**, swept constantly and cheaply because almost everything on it is already rubbish. The few things that survive all night (stockpots, sauces) get moved to a back shelf — the **old generation** — and are only touched during a deep clean, because re-checking them every five minutes would be wasted work.

**The generational heap — how objects move:**

Young Gen (Eden → Survivor 1 → Survivor 2) → Old Gen → (never collected = memory leak)

Objects are allocated in Eden. When Eden fills up, Minor GC runs — objects that survive are moved to a Survivor space. After surviving several GCs (default 15 rounds), they're promoted to Old Gen. Old Gen fills up much slower. When it does, Full GC runs, which is much more expensive.

**The GC algorithms you'll get asked about:**

G1GC (default since Java 9): Divides heap into equal-size regions instead of fixed young/old areas. Predictable pause times, good for large heaps (4GB+). Default for most Spring Boot apps.

ZGC (Java 15+ production-ready): Concurrent collection — pauses measured in milliseconds regardless of heap size. Ideal for latency-sensitive apps like real-time APIs.

Parallel GC: Throughput-focused — does GC with multiple threads but stops the world. Good for batch processing where throughput matters more than latency.

**StackOverflowError vs OutOfMemoryError:**
\`\`\`java
// StackOverflowError — infinite recursion, fills the call stack
void infinite() { infinite(); } // eventually: StackOverflowError

// OutOfMemoryError — heap full, GC can't free enough memory
List<byte[]> leak = new ArrayList<>();
while (true) {
    leak.add(new byte[1024 * 1024]); // 1MB per iteration
} // eventually: OutOfMemoryError: Java heap space
\`\`\`

**In Spring Boot — monitoring GC:** Actuator's \`/actuator/metrics/jvm.gc.pause\` shows GC pause times. High pause frequency usually means you're creating too many objects (check for string concatenation in loops, redundant object creation in hot paths).`,
        followUps: [
          { text: "Which collector does a modern JVM use by default, and when would you change it?" },
          { text: "What is the difference between `StackOverflowError` and `OutOfMemoryError`?" },
        ],
      },
      {
        id: 28,
        text: "What are the different types of references in Java (strong, weak, soft, phantom)?",
        answer:
            "Java has four reference strengths that affect whether the GC collects an object. **Strong reference** (normal `=` assignment) — GC never collects reachable objects. **Soft reference** (`SoftReference<T>`) — collected only when memory is low; useful for memory-sensitive caches. **Weak reference** (`WeakReference<T>`) — collected at the next GC cycle whenever no strong references exist; useful for caches where you don't want to prevent collection. **Phantom reference** — object is already finalized, enqueued for post-mortem cleanup; useful for off-heap resource cleanup.\n\n`WeakHashMap` uses weak keys — entries disappear automatically when keys are garbage collected.",
        explanation: `**Analogy:** Strong reference = you're holding onto a book. Soft reference = library's last copy — they'll take it back only if desperately short on shelf space. Weak reference = a sticky note pointing to where the book is — if someone donates it away, your note becomes useless. Phantom reference = you've returned the book but haven't signed the return slip yet.

**WeakHashMap — the practical use case:**

\`\`\`java
// Classic use: cache keyed by objects you don't "own"
// When the key object is GC'd, the entry disappears automatically
WeakHashMap<Widget, WidgetMetadata> metadataCache = new WeakHashMap<>();

Widget widget = new Widget();
metadataCache.put(widget, new WidgetMetadata());

widget = null; // no more strong references to the widget
System.gc();   // hint to GC (not guaranteed)
// metadataCache entry may now be gone
\`\`\`

**SoftReference — memory-sensitive cache:**
\`\`\`java
// Useful for caching expensive-to-compute data
// JVM will clear it before throwing OutOfMemoryError
SoftReference<byte[]> imageCache = new SoftReference<>(loadHeavyImage());

byte[] image = imageCache.get();
if (image == null) {
    // Cache was cleared due to memory pressure — reload
    image = loadHeavyImage();
    imageCache = new SoftReference<>(image);
}
\`\`\`

**In modern Spring Boot:** You rarely use reference types directly — use Caffeine or Redis for caching with proper eviction policies. But understanding weak/soft references helps you understand why \`ThreadLocal\` leaks in thread pools (the thread lives forever, keeping a strong reference chain to your ThreadLocal value), and why you should always call \`threadLocal.remove()\` after use.`,
        followUps: [
          { text: "When would you use a `WeakHashMap`?" },
          { text: "How do soft references relate to memory-sensitive caches?" },
          { text: "What are phantom references used for in resource cleanup?" },
        ],
      },
    ],
  },
  {
    id: "oop",
    title: "Object-Oriented Programming",
    description:
      "Pillars of OOP, SOLID, design patterns, and design trade-offs interviewers expect at 2 YOE.",
    icon: "🧩",
    questions: [
      {
        id: 29,
        text: "Explain the four pillars of OOP with examples.",
        answer:
            "**Encapsulation** — bundle state and behavior together, hide internal details. A `BankAccount` class exposes `deposit()` and `withdraw()` but keeps `balance` private. **Abstraction** — expose only what's necessary, hide complexity. A `PaymentService` interface exposes `processPayment()` — callers don't know if it talks to Stripe or PayPal.\n\n**Inheritance** — a subclass inherits and extends a parent's behavior. `SavingsAccount extends BankAccount` adds interest calculation. **Polymorphism** — the same interface behaves differently based on the actual type. A `List<PaymentProcessor>` can hold Stripe, PayPal, and Apple Pay processors, all called the same way.",
        explanation: `**Analogy:** A car. **Encapsulation** — the engine is sealed under the hood; you get a pedal, not a fuel-injection dial. **Abstraction** — the pedal means "go faster" whether it's petrol, diesel or electric underneath. **Inheritance** — an ambulance is a van with extra kit, not a vehicle redesigned from scratch. **Polymorphism** — any driver can drive any car, because the controls honour the same contract.

**The Spring context for each pillar:**

**Encapsulation:** Your service layer hides repository details from controllers. The controller calls \`userService.createUser(dto)\` — it doesn't know whether that triggers a DB write, a Kafka event, or both.

**Abstraction:** Spring Data's \`JpaRepository\` is the cleanest example in the framework. You declare \`findByEmail(String email)\` — the "how" (SQL generation, connection handling, result mapping) stays hidden.

**Inheritance:**
\`\`\`java
// Good use of inheritance — shared audit behavior
@MappedSuperclass
public abstract class BaseEntity {
    @Id @GeneratedValue
    private Long id;
    
    @CreatedDate
    private LocalDateTime createdAt;
    
    @LastModifiedDate
    private LocalDateTime updatedAt;
}

@Entity
public class User extends BaseEntity {
    private String name;
    private String email;
    // inherits id, createdAt, updatedAt automatically
}
\`\`\`

**Polymorphism — the Spring DI superpower:**
\`\`\`java
public interface NotificationService {
    void send(String message, String recipient);
}

@Service
public class EmailNotificationService implements NotificationService { ... }

@Service
public class SmsNotificationService implements NotificationService { ... }

// The OrderService doesn't care which implementation is injected
@Service
public class OrderService {
    private final NotificationService notificationService;
    // Spring injects the right one based on config or @Primary
    // In tests, you inject a mock — same interface
}
\`\`\``,
        followUps: [
          { text: "Give a Spring-specific example of encapsulation (e.g., service hiding repository details)." },
          { text: "How does polymorphism show up with Spring dependency injection?" },
          { text: "What is the difference between abstraction and encapsulation?" },
        ],
      },
      {
        id: 30,
        text: "What is polymorphism — compile-time vs runtime?",
        answer:
            "**Compile-time polymorphism** (static dispatch) is achieved through **method overloading** — the compiler picks which method to call based on the argument types at compile time.\n\n**Runtime polymorphism** (dynamic dispatch) comes from **method overriding** — the JVM picks the implementation from the actual object type, not the declared one. Write `PaymentGateway gateway = new StripeGateway()` and `gateway.charge()` runs Stripe's version. That's the whole basis of dependency injection: swap the implementation, callers never change.\n\nThe trap: **only instance methods are polymorphic.** Fields and `static` methods are *hidden*, not overridden. They resolve on the declared type, so `Parent p = new Child(); p.describe()` runs the parent's `static` version.",
        explanation: `**Compile-time — decided before the program runs:**

\`\`\`java
class Printer {
    void print(String s) { System.out.println("String: " + s); }
    void print(int n)    { System.out.println("Int: " + n); }
}

Printer p = new Printer();
p.print("hello"); // compiler sees String arg → calls first method
p.print(42);      // compiler sees int arg → calls second method
// Resolved at compile time — no runtime decision needed
\`\`\`

**Runtime — decided when the program runs:**
\`\`\`java
interface Shape {
    double area();
}

class Circle implements Shape {
    private final double radius;
    Circle(double radius) { this.radius = radius; }
    public double area() { return Math.PI * radius * radius; }
}

class Rectangle implements Shape {
    private final double w, h;
    Rectangle(double w, double h) { this.w = w; this.h = h; }
    public double area() { return w * h; }
}

// Variable type is Shape (interface)
List<Shape> shapes = List.of(new Circle(5), new Rectangle(3, 4));
for (Shape s : shapes) {
    System.out.println(s.area()); // JVM looks at actual object type at runtime
}
// 78.54 (Circle's area), then 12.0 (Rectangle's area)
\`\`\`

**Can constructors be polymorphic?** No. Constructors aren't inherited and can't be overridden. The new keyword explicitly specifies which class to instantiate — there's no dynamic dispatch. However, constructors can call virtual (overridable) methods, which IS a known gotcha — the subclass method runs before the subclass constructor body, potentially on uninitialized fields.`,
        followUps: [
          { text: "Why is overloading resolved before the program even runs?" },
          { text: "How does the JVM know which overridden method to call?" },
          { text: "What happens if a constructor calls an overridable method?" },
        ],
      },
      {
        id: 31,
        text: "What is the difference between composition and inheritance? Which is preferred and why?",
        answer:
            "**Inheritance** models an \"is-a\" relationship — `SavingsAccount extends BankAccount`. The subclass is welded to the parent's implementation, so a change upstream can silently break it. That's the fragile base class problem.\n\n**Composition** models \"has-a\" — `OrderService` holds a `PaymentGateway` and delegates to it.\n\nPrefer composition, for three reasons that all point the same way. You can swap the component at runtime, which is exactly what dependency injection does every time it hands your service a different implementation. You can combine behaviours without growing a deep hierarchy to hang them on. And a change inside the component stays inside it, instead of rippling out to everything that extended it.\n\nThe GoF line is **\"Favor object composition over class inheritance.\"** Inheritance still wins when the subtype genuinely *is* the supertype and the parent's contract is stable — which is far rarer than the number of `extends` in most codebases suggests.",
        explanation: `**The fragile base class problem inheritance creates:**

\`\`\`java
// Inheritance — you inherit the parent's INTERNAL call sequence too
class InstrumentedHashSet<E> extends HashSet<E> {
    private int addCount = 0;

    @Override
    public boolean add(E e) {
        addCount++;
        return super.add(e);
    }

    @Override
    public boolean addAll(Collection<? extends E> c) {
        addCount += c.size();   // +3
        return super.addAll(c); // HashSet.addAll internally calls add() → +3 again
    }

    public int getAddCount() { return addCount; }
}

// The broken-counter example from Effective Java, Item 18
var set = new InstrumentedHashSet<String>();
set.addAll(List.of("a", "b", "c"));
set.getAddCount(); // returns 6, not 3 — superclass self-use double-counts
\`\`\`

**Composition fixes it:**
\`\`\`java
class InstrumentedSet<E> implements Set<E> {
    private final Set<E> delegate; // composed, not inherited
    private int addCount = 0;
    
    public InstrumentedSet(Set<E> delegate) {
        this.delegate = delegate;
    }
    
    @Override
    public boolean add(E e) {
        addCount++;
        return delegate.add(e); // forward to delegate
    }
    
    @Override
    public boolean addAll(Collection<? extends E> c) {
        addCount += c.size();
        return delegate.addAll(c); // no double counting — delegate handles internally
    }
}
\`\`\`

**When inheritance IS the right choice:**
- A true is-a relationship (Dog is an Animal, not just an Animal-lookalike)
- You control both the parent and child class
- The parent is designed and documented for extension
- You need to override behavior, not just add behavior

**In Spring:** Spring itself favors composition heavily — ApplicationContext composes multiple strategy objects (message sources, event publishers, etc.) rather than subclassing them all.`,
        followUps: [
          { text: "What does `extends` commit you to that holding a field doesn't?" },
          { text: "Give an example where inheritance is still the right choice." },
        ],
      },
      {
        id: 32,
        text: "What is coupling and cohesion?",
        answer:
            "**Coupling** is how much one class depends on another. **Low coupling** is the goal — `OrderService` depending on a `PaymentGateway` interface can be tested with a fake and doesn't change when Stripe's SDK does. High coupling means one edit forces edits everywhere.\n\n**Cohesion** is how focused a single class is. **High cohesion** means everything inside it belongs together. The classic smell is a `UserService` that sends email, renders PDFs, and calls the payment API — three unrelated reasons to change one file.\n\nAim for **high cohesion and low coupling**: each class does one thing, and knows as little as possible about how the others do theirs.",
        explanation: `**Analogy:** A Swiss Army knife has low cohesion — it does many unrelated things. A scalpel has high cohesion — it does exactly one thing perfectly. An operating room has low coupling — the anesthesiologist doesn't need to know the details of the surgeon's stitching technique; they communicate through standardized protocols.

**Tight coupling — the problem:**
\`\`\`java
// OrderController is tightly coupled to MySQL — bad
@RestController
public class OrderController {
    // Direct dependency on concrete class + creates it yourself
    private final MySQLOrderRepository repository = new MySQLOrderRepository();
    
    @PostMapping("/orders")
    public Order createOrder(@RequestBody OrderRequest req) {
        return repository.save(new Order(req)); // what if we switch to PostgreSQL?
    }
}

// ---- Loose coupling — with DI ----
// OrderController depends only on the interface — low coupling
@RestController
public class OrderController {
    private final OrderRepository repository; // interface, not concrete class
    
    public OrderController(OrderRepository repository) { // Spring injects it
        this.repository = repository;
    }
    // Now you can swap MySQL → PostgreSQL → Redis without touching this class
}
\`\`\`

**Low cohesion — the "God class" problem:**
\`\`\`java
// BAD — UserService does too many unrelated things
public class UserService {
    void createUser(UserDto dto) { ... }
    void sendWelcomeEmail(String email) { ... }  // email logic doesn't belong here
    void generateInvoice(Long userId) { ... }     // billing logic doesn't belong here
    void resizeProfilePicture(byte[] image) { ... } // image processing?!
}

// GOOD — split by responsibility
public class UserService { void createUser(UserDto dto) { ... } }
public class EmailService { void sendWelcomeEmail(String email) { ... } }
public class InvoiceService { void generateInvoice(Long userId) { ... } }
\`\`\``,
        followUps: [
          { text: "How do the controller, service, and repository layers reflect cohesion and coupling?" },
          { text: "How does dependency injection reduce coupling?" },
        ],
      },
      {
        id: 33,
        text: "Explain SOLID principles with examples.",
        answer:
            "Five principles that all push toward classes being small and swappable.\n\n**Single Responsibility** — one reason to change. An `InvoiceService` that computes totals *and* renders the PDF has two, so it breaks whenever the tax rules move or the layout does. **Open/Closed** — open for extension, closed for modification. Adding a third `PaymentGateway` shouldn't mean editing a `switch` inside `OrderService`.\n\n**Liskov Substitution** — a subtype has to work anywhere its parent does. `Square extends Rectangle` is the classic violation: `setWidth(5)` quietly changes the height too, so code written against `Rectangle` breaks when handed a `Square`.\n\n**Interface Segregation** — keep interfaces small and focused, so a read-only `CatalogRepository` never has to implement a `delete()` it must not call. **Dependency Inversion** — depend on abstractions, so `OrderService` takes a `PaymentGateway` and never a `StripeClient`, leaving the container to pick the implementation at runtime.\n\nThose last two are what Spring's container is built on. You apply them every time you inject an interface, whether or not you call them by name.",
        explanation: `**S — Single Responsibility:**
\`\`\`java
// VIOLATION — one class handles both user logic AND email
class UserService {
    void createUser(UserDto dto) { ... }
    void sendActivationEmail(String email) { ... } // should be in EmailService
}

// FIXED — separate concerns
class UserService { void createUser(UserDto dto) { ... } }
class EmailService { void sendActivationEmail(String email) { ... } }
\`\`\`

**O — Open/Closed:**
\`\`\`java
// VIOLATION — adding new payment type requires editing existing class
class PaymentProcessor {
    void process(Payment p) {
        if (p.getType() == STRIPE) { ... }
        else if (p.getType() == PAYPAL) { ... } // modify every time you add a new type
    }
}

// FIXED — extend without modifying
interface PaymentGateway { void process(Payment p); }
class StripeGateway implements PaymentGateway { ... }
class PaypalGateway implements PaymentGateway { ... }
// Add Apple Pay? Just add ApplePayGateway — don't touch existing code
\`\`\`

**L — Liskov Substitution:**
\`\`\`java
// VIOLATION — Square IS-A Rectangle mathematically, but not behaviourally
class Rectangle {
    protected int width, height;
    void setWidth(int w)  { this.width = w; }
    void setHeight(int h) { this.height = h; }
    int area() { return width * height; }
}

class Square extends Rectangle {
    @Override void setWidth(int w)  { this.width = w; this.height = w; }  // side effect!
    @Override void setHeight(int h) { this.width = h; this.height = h; }  // side effect!
}

// Code written against Rectangle now breaks when handed a Square:
void resize(Rectangle r) {
    r.setWidth(5);
    r.setHeight(3);
    assert r.area() == 15; // passes for Rectangle, FAILS for Square (area = 9)
}
// Square weakened a postcondition the caller relied on (area == width * height) — LSP violated.
// Fix: don't inherit. Make Square and Rectangle both implement a Shape interface.
\`\`\`

**I — Interface Segregation:**
\`\`\`java
// VIOLATION — fat interface forces implementing unused methods
interface Worker { void work(); void eat(); void sleep(); }
class Robot implements Worker {
    void work() { ... }
    void eat() { throw new UnsupportedOperationException(); } // robots don't eat!
}

// FIXED — small focused interfaces
interface Workable { void work(); }
interface Feedable { void eat(); }
class Human implements Workable, Feedable { ... }
class Robot implements Workable { ... } // only what it needs
\`\`\`

**D — Dependency Inversion:**
\`\`\`java
// VIOLATION — high-level depends on low-level detail
class OrderService {
    private MySQLOrderRepo repo = new MySQLOrderRepo(); // concrete dependency
}

// FIXED — depend on abstraction, inject the concrete at runtime
class OrderService {
    private final OrderRepository repo; // interface
    public OrderService(OrderRepository repo) { this.repo = repo; } // DI
}
\`\`\``,
        followUps: [
          { text: "How does the Open/Closed Principle show up with Strategy pattern?" },
          { text: "How does Interface Segregation apply to Spring repository interfaces?" },
          { text: "What does a Single Responsibility violation look like in a controller?" },
        ],
      },
      {
        id: 34,
        text: "Which design patterns come up most often in a Spring application?",
        answer:
            "The honest answer is that you use most of them without naming them, because Spring is built out of them.\n\n**Singleton** — one shared instance, which is what every Spring bean is by default. **Factory** — something else decides how an object gets built; that's `ApplicationContext` handing you beans. **Builder** — assemble a complex object step by step, like `ResponseEntity.ok().header(...).body(...)`.\n\n**Strategy** is the one worth naming in an interview, because it's the shape of most good Spring code. Inject a `PaymentGateway` interface, let the container choose `StripeGateway` or `PayPalGateway`, and adding a third means adding a class rather than editing a `switch`. **Observer** is `ApplicationEventPublisher` — publish an event, and whatever `@EventListener` cares about it reacts without the publisher knowing it exists.\n\n**Facade** and **Adapter** both wrap something, and the difference is intent. A facade **simplifies** — one `CheckoutService` method hiding four subsystem calls. An adapter **translates** — making a third-party client fit the interface your code already expects, which is how you keep a vendor SDK from leaking through your whole codebase.",
        explanation: `**Builder — the one you use constantly in Spring:**
\`\`\`java
// Spring's own ResponseEntity uses builder pattern
return ResponseEntity
    .status(HttpStatus.CREATED)
    .header("X-User-Id", user.getId().toString())
    .body(new UserDto(user));

// Lombok @Builder for your DTOs
@Builder
public class CreateOrderRequest {
    private Long userId;
    private List<OrderItem> items;
    private String couponCode;
}

CreateOrderRequest request = CreateOrderRequest.builder()
    .userId(123L)
    .items(List.of(item1, item2))
    .couponCode("SAVE10")
    .build();
\`\`\`

**Strategy — pluggable algorithms:**
\`\`\`java
interface DiscountStrategy {
    double apply(double price);
}

@Component("flatDiscount")
class FlatDiscountStrategy implements DiscountStrategy {
    public double apply(double price) { return price - 10; }
}

@Component("percentageDiscount")
class PercentageDiscountStrategy implements DiscountStrategy {
    public double apply(double price) { return price * 0.9; }
}

@Service
class PricingService {
    private final Map<String, DiscountStrategy> strategies; // Spring injects all implementations
    
    public double getPrice(String strategyName, double price) {
        return strategies.get(strategyName).apply(price);
    }
}
\`\`\`

**Adapter — making incompatible APIs work together:**
\`\`\`java
// Third-party SMS library has: smsClient.sendMessage(phone, text)
// Your interface expects: notificationService.notify(Notification)

class SmsAdapter implements NotificationService {
    private final ThirdPartySmsClient client;
    
    public void notify(Notification n) {
        client.sendMessage(n.getPhone(), n.getMessage()); // adapts the call
    }
}
\`\`\`

**Facade — simplifying complexity:**
\`\`\`java
// OrderFacade hides the complexity of coordinating multiple services
@Service
class OrderFacade {
    public OrderConfirmation placeOrder(OrderRequest req) {
        User user = userService.validateUser(req.getUserId());
        Cart cart = cartService.getCart(req.getCartId());
        Payment payment = paymentService.process(req.getPaymentInfo());
        Order order = orderService.create(user, cart, payment);
        notificationService.sendConfirmation(order);
        return new OrderConfirmation(order);
        // Caller just calls placeOrder() — doesn't know about all these services
    }
}
\`\`\``,
        followUps: [
          { text: "When would you use Facade vs Adapter in an integration layer?" },
          { text: "How does the Builder pattern help with complex DTO or entity construction?" },
        ],
      },
      {
        id: 35,
        text: "Why is the Singleton pattern tricky in a multi-threaded environment?",
        answer:
            "The problem is **lazy initialization without synchronization**. If two threads simultaneously check `instance == null` and both find it null, they'll both create a new instance — you get two singletons.\n\nNaive synchronization (making the whole \`getInstance()\` synchronized) works but creates a performance bottleneck since every call acquires the lock even after initialization. **Double-checked locking** with \`volatile\` is the classic fix.\n\nBut the cleanest solutions are: **enum singleton** (thread-safe by JVM spec, free) or just **rely on Spring's singleton scope** (Spring manages the single instance, you never write this boilerplate).",
        explanation: `**The broken lazy singleton — the classic interview question:**

\`\`\`java
// BROKEN — race condition
class Singleton {
    private static Singleton instance;
    
    public static Singleton getInstance() {
        if (instance == null) {           // Thread A and B both see null
            instance = new Singleton();   // Both create an instance — two singletons!
        }
        return instance;
    }
}

// ---- Double-checked locking — the full solution ----
class Singleton {
    private static volatile Singleton instance; // volatile is REQUIRED here
    
    private Singleton() {}
    
    public static Singleton getInstance() {
        if (instance == null) {                    // First check (no lock) — performance
            synchronized (Singleton.class) {
                if (instance == null) {             // Second check (with lock) — safety
                    instance = new Singleton();
                }
            }
        }
        return instance;
    }
}
// volatile prevents: JVM reordering writes so another thread sees
// a partially constructed object before the constructor finishes
\`\`\`

**Enum singleton — the cleanest approach:**
\`\`\`java
public enum DatabaseConnection {
    INSTANCE;
    
    private final Connection connection;

    DatabaseConnection() {
        try {
            connection = DriverManager.getConnection(URL, USER, PASSWORD);
        } catch (SQLException e) {
            // an enum constructor can't throw checked exceptions either
            throw new ExceptionInInitializerError(e);
        }
    }
    
    public Connection getConnection() { return connection; }
}

// Usage
DatabaseConnection.INSTANCE.getConnection();
// Thread-safe by JVM guarantee, handles serialization, immune to reflection attacks
\`\`\`

**The Spring truth:** Spring's default singleton scope means one bean instance per ApplicationContext — Spring handles the thread-safe creation. You never write Singleton pattern boilerplate for Spring-managed beans. The only time you'd write this is for true application-wide singletons outside the Spring context (e.g., in a static utility that runs before the context starts).`,
        followUps: [
          { text: "Why isn't checking for `null` twice enough to make lazy initialization safe?" },
          { text: "How does an enum-based Singleton avoid these issues?" },
          { text: "How does Spring's default singleton scope differ from a classic Singleton implementation?" },
        ],
      },
    ],
  },
  {
    id: "spring-core",
    title: "Spring Core",
    description:
      "IoC, DI, bean lifecycle, scopes, AOP, and the container — core of every Spring interview.",
    icon: "🌱",
    questions: [
      {
        id: 36,
        text: "What is the Spring Framework, and what problem does it solve?",
        answer: "Spring is an enterprise Java framework built around an **IoC container** that creates your objects and wires them together for you. The problem it solves is that `new` hardcodes a dependency: if `OrderService` calls `new StripeGateway()`, you can't test it without hitting Stripe. Spring hands `OrderService` a `PaymentGateway` from outside, so a test passes a fake and production passes the real one. On top of that you get **declarative transactions**, AOP, and the plumbing you'd otherwise hand-write — `@Transactional` replaces the try/commit/rollback/close block around every JDBC call.",
        explanation: `**Analogy:** Building an app without Spring is like moving into a new apartment where you have to lay your own plumbing, wire the electricity, and build your own furniture from raw timber before you can cook dinner. Spring is a fully furnished, plug-and-play apartment where power and water are already connected — you just bring your clothes and start living.

\`\`\`java
// BAD — manual wiring in raw Java creates tight coupling and impossible mocking
public class OrderController {
    private OrderService orderService;

    public OrderController() {
        // Tight coupling to concrete implementation — can't mock in unit tests
        DatabaseConnection conn = new DatabaseConnection("jdbc:mysql://localhost:3306/db");
        OrderRepository repo = new SqlOrderRepository(conn);
        this.orderService = new OrderServiceImpl(repo);
    }
}
\`\`\`

\`\`\`java
// GOOD — Spring container instantiates and injects all dependencies automatically
@RestController
@RequestMapping("/orders")
public class OrderController {
    private final OrderService orderService;

    // Spring passes the managed OrderService bean automatically
    public OrderController(OrderService orderService) {
        this.orderService = orderService;
    }
}
\`\`\`

**The real-world takeaway:** In production Spring Boot applications, you rarely call \`new\` on service, repository, or controller classes. Spring manages their lifecycles as singletons inside the application context, letting you swap implementations or inject mocks during testing without changing a single line of business logic.`,
        followUps: [
          { text: "How is the Spring ecosystem organized, and where does Boot sit in it?" },
          { text: "What is the difference between Spring Framework and Spring Boot?" },
        ],
      },
      {
        id: 37,
        text: "What is Inversion of Control (IoC) and Dependency Injection (DI)?",
        answer: "**IoC** is the principle: something other than your class decides what it gets and when it's created. **DI** is the mechanism that implements it — the dependency arrives from outside, through a constructor, setter, or field. IoC is the *what*, DI is the *how*, and Spring's container is the thing doing the inverting. Concretely, `OrderService` stops calling `new StripeGateway()` and instead declares `OrderService(PaymentGateway gateway)`. It no longer knows which implementation it got, which is exactly what makes it unit-testable and swappable per environment.",
        explanation: `**Analogy:** Think of a Hollywood movie director casting actors. The director doesn't let actors hire themselves or build their own sets ("Don't call us, we'll call you"). The director (IoC container) assigns the roles (injects dependencies) to the actors when the scene starts.

\`\`\`java
// BAD — class controls its own dependencies (violates IoC)
public class NotificationService {
    // Hardcoded instantiation — tightly coupled to SmtpEmailClient
    private EmailClient emailClient = new SmtpEmailClient("smtp.mail.com");

    public void notifyUser(String message) {
        emailClient.send(message); // Can't easily test or switch to SendGrid
    }
}
\`\`\`

\`\`\`java
// GOOD — control inverted; dependencies injected via constructor
@Service
public class NotificationService {
    private final EmailClient emailClient;

    // Spring injects whatever EmailClient bean is registered
    public NotificationService(EmailClient emailClient) {
        this.emailClient = emailClient;
    }
}
\`\`\`

**Edge case to watch out for:** IoC is the broad principle; DI is just one way to implement it. Service Locator and Template Method patterns are also IoC implementations, but Spring uses DI because it keeps classes completely unaware of the container.

**Where it hits production:** Every \`@Service\` or \`@Repository\` class in an enterprise Spring app relies on DI. In unit tests, you pass a mocked \`EmailClient\` straight into \`new NotificationService(mockEmailClient)\` without ever booting Spring, making tests lightning fast.`,
        followUps: [
          { text: "What is the Hollywood Principle, and how does it relate to IoC?" },
          { text: "How does DI improve testability?" },
        ],
      },
      {
        id: 38,
        text: "What are the different types of dependency injection in Spring?",
        answer: "Three: **constructor**, **setter**, and **field**. Constructor injection passes dependencies in as arguments, and it's the one to use. The object is fully built and valid the moment it exists, and its fields can be `final`. Setter injection wires after construction, so it suits genuinely optional dependencies you might re-inject later. Field injection puts `@Autowired` straight on a private field — it reads nicely, and it's the one to avoid. The field can't be `final`, and `new OrderService()` in a plain JUnit test hands you an object whose collaborators are all null.",
        explanation: `\`\`\`java
// BAD — Field injection makes testing hard and allows null references at runtime
@Service
public class PaymentProcessor {
    @Autowired
    private PaymentGateway paymentGateway; // NPE in plain unit tests without Spring runner!
}
\`\`\`

\`\`\`java
// GOOD — Constructor injection forces immutable, fully-initialized beans
@Service
public class PaymentProcessor {
    private final PaymentGateway paymentGateway; // final guarantees immutability

    // No @Autowired needed on single constructor in modern Spring
    public PaymentProcessor(PaymentGateway paymentGateway) {
        this.paymentGateway = Objects.requireNonNull(paymentGateway, "paymentGateway must not be null");
    }
}
\`\`\`

**Nuance:** Setter injection is useful when you have circular references or optional defaults, but if a dependency can be mutated via setter at runtime, your bean is no longer thread-safe. Constructor injection with \`final\` fields guarantees thread safety right after object creation.

**In production:** Spring framework team explicitly recommends constructor injection for all required dependencies. Lombok's \`@RequiredArgsConstructor\` is commonly used across production codebases to auto-generate constructor injection boilerplate.`,
        followUps: [
          { text: "Why is constructor injection recommended for required dependencies?" },
          { text: "When might setter injection still make sense?" },
        ],
      },
      {
        id: 39,
        text: "What is the Spring IoC container / ApplicationContext?",
        answer: "The container reads your configuration, builds every bean, injects them into each other, and manages them until shutdown. `ApplicationContext` is the interface you actually use — it's `BeanFactory` plus events, i18n, resource loading, and AOP. It builds the whole graph **eagerly at startup**, and that's the property that matters. A missing or ambiguous dependency kills the app in the first second with a `BeanCreationException`. That's deliberate: you'd rather fail on deploy than get a `NullPointerException` at 2am on the one code path nobody exercised.",
        explanation: `**Analogy:** The \`ApplicationContext\` is like an automated car assembly line. It reads the manufacturing blueprint (your annotations and \`@Configuration\`), grabs the engine and chassis parts (beans), wires them together in exact order, performs quality checks (bean post-processors), and outputs fully operational cars ready to drive.

\`\`\`java
// How the container initializes in non-web or CLI contexts
public class AppMain {
    public static void main(String[] args) {
        // Creates the IoC container from configuration class
        ApplicationContext context = new AnnotationConfigApplicationContext(AppConfig.class);

        // Fetch managed bean from container
        OrderService orderService = context.getBean(OrderService.class);
        orderService.processOrder(101L);
    }
}
\`\`\`

\`\`\`java
// In Spring Boot, SpringApplication creates the Web ApplicationContext under the hood
@SpringBootApplication
public class Application {
    public static void main(String[] args) {
        // Boots embedded Servlet container and creates ServletWebServerApplicationContext
        ApplicationContext context = SpringApplication.run(Application.class, args);
    }
}
\`\`\`

**Production reality:** You almost never call \`context.getBean()\` directly in business logic. That's the **Service Locator anti-pattern**. Instead, let Spring inject dependencies automatically using constructor injection throughout your service layer.`,
        followUps: [
          { text: "What responsibilities does the container handle beyond creating beans?" },
          { text: "Which `ApplicationContext` implementation does Spring Boot actually create?" },
          { text: "When is the ApplicationContext created in a Spring Boot app?" },
        ],
      },
      {
        id: 40,
        text: "What is the difference between `BeanFactory` and `ApplicationContext`?",
        answer: "`BeanFactory` is the bare container — it creates and hands out beans **lazily**, only when something calls `getBean()`. `ApplicationContext` extends it and adds what real applications need: application events, `@Aspect` and AOP proxying, message sources for i18n, resource loading, and web-aware scopes. It also **pre-instantiates singletons at startup** rather than on first use. In practice you always use `ApplicationContext` — Boot hands you one, and you'd have to work to get anything else. The difference worth remembering is timing. With `ApplicationContext` a broken bean definition fails the deploy; with `BeanFactory` it fails on the first request that touches it.",
        explanation: `\`\`\`java
// BAD for production — a bare BeanFactory builds beans lazily, so config errors surface late
// (XmlBeanFactory is gone — deprecated in Spring 3.1, removed in Spring 5)
DefaultListableBeanFactory factory = new DefaultListableBeanFactory();
factory.registerBeanDefinition("paymentService", new RootBeanDefinition(PaymentService.class));
// Nothing is validated yet — the app "starts" instantly because nothing was built
PaymentService service = factory.getBean(PaymentService.class); // BeanCreationException fires HERE, mid-request
\`\`\`

\`\`\`java
// GOOD — ApplicationContext instantiates every non-lazy singleton at startup
ApplicationContext context = new AnnotationConfigApplicationContext(AppConfig.class);
// Fail-fast: a missing bean or a bad @Value blows up the deployment, NOT the first user request
\`\`\`

**How they actually differ:** \`BeanFactory\` instantiates lazily on \`getBean()\`; \`ApplicationContext\` instantiates non-lazy singletons eagerly during startup. \`BeanFactory\` gives you nothing but bean creation and lookup, while \`ApplicationContext\` layers on AOP auto-proxying, \`ApplicationEvent\` publishing, \`MessageSource\` i18n, resource loading, and web-aware scopes. You pay for that with a slightly larger footprint and a slower start — the only trade that ever favours \`BeanFactory\` is a genuinely memory-constrained embedded device.

**Real-world trap:** If you rely on \`BeanFactory\` or set \`@Lazy\` on your singletons indiscriminately, missing configuration properties or broken bean wiring will only fail when the first production request hits that specific line of code. \`ApplicationContext\` gives you fail-fast protection on deployment.`,
        followUps: [
          { text: "When would you ever use BeanFactory directly?" },
          { text: "When would you deliberately make a bean `@Lazy`?" },
        ],
      },
      {
        id: 41,
        text: "What are Spring Bean scopes (singleton, prototype, request, session)?",
        answer: "**Singleton** is the default: one instance per container, shared by every injection point, built at startup. **Prototype** returns a new instance on every request for the bean, and Spring stops managing it after creation, so `@PreDestroy` never runs. **Request** and **session** are web scopes — one instance per HTTP request, or per user session. The trap is mixing lifetimes. Inject a request-scoped `CurrentUser` into a singleton `OrderService` and startup dies with `Scope 'request' is not active for the current thread`. No request is in flight when the singleton is built. Make the singleton lazy so it survives, and it's worse: it captures the **first** request's instance and serves it to every user afterwards. Add `proxyMode = TARGET_CLASS` so Spring injects a proxy that resolves the right instance per call.",
        explanation: `\`\`\`java
// BROKEN — Injecting a request-scoped bean directly into a singleton without a proxy
@Component
@Scope("request") // New instance per HTTP request
public class UserContext {
    private String currentUserId; // State stored here
}

@Service // Singleton by default (lives forever)
public class AuditService {
    @Autowired
    private UserContext userContext; // TRAP: Injected ONCE at startup! User A's context leaks to User B!
}
\`\`\`

\`\`\`java
// FIXED — Use proxyMode to inject a thread-safe dynamic proxy into the singleton
@Component
@Scope(value = WebApplicationContext.SCOPE_REQUEST, proxyMode = ScopedProxyMode.TARGET_CLASS)
public class UserContext {
    private String currentUserId;
}

@Service
public class AuditService {
    private final UserContext userContext;

    public AuditService(UserContext userContext) {
        // userContext is now a proxy that delegates to the active thread's request scope
        this.userContext = userContext;
    }
}
\`\`\`

**Nuance:** Spring manages the full lifecycle of \`singleton\` beans, including calling destruction callbacks (\`@PreDestroy\`). However, Spring does NOT manage the complete lifecycle of \`prototype\` beans — once instantiated and injected, the container forgets about prototype instances, so destruction callbacks won't run automatically.`,
        followUps: [
          { text: "What happens if a singleton bean depends on a prototype bean?" },
          { text: "How do you inject a request-scoped bean into a singleton safely?" },
          { text: "Are web scopes available outside a web ApplicationContext?" },
        ],
      },
      {
        id: 42,
        text: "What is the Spring Bean lifecycle?",
        answer: "Instantiate the bean, inject its dependencies, run the `Aware` callbacks, then `BeanPostProcessor` before-init, then `@PostConstruct`, then `BeanPostProcessor` after-init — and on shutdown, `@PreDestroy`. The phase that earns its keep is **post-initialization**, because that's where Spring wraps your bean in its AOP proxy. That's why `@Transactional` on a method you call from inside the same class does nothing: the caller holds `this`, not the proxy. It's also why constructor work misbehaves — dependencies aren't injected yet, so anything needing a collaborator belongs in `@PostConstruct`.",
        explanation: `**Analogy:** Buying a custom computer: Instantiation is assembling the hardware parts. Dependency injection is plugging in power and peripheral cables. Pre-initialization is loading the BIOS. Initialization (\`@PostConstruct\`) is setting your username and preferences. Post-initialization is installing antivirus software (AOP proxying). Then you use the PC until shutdown (\`@PreDestroy\`), when work is saved and power is cut.

\`\`\`java
// BAD — performing initialization logic inside the constructor before DI has completed
@Component
public class CacheLoader {
    @Autowired
    private ProductRepository repository;

    public CacheLoader() {
        // BUG: repository is NULL here! Constructor runs BEFORE dependency injection.
        // repository.findAll(); // Throws NullPointerException at startup
    }
}
\`\`\`

\`\`\`java
// GOOD — use @PostConstruct to run initialization after dependencies are fully injected
@Component
public class CacheLoader {
    private final ProductRepository repository;

    public CacheLoader(ProductRepository repository) {
        this.repository = repository; // Constructor assigns reference
    }

    @PostConstruct
    public void initCache() {
        // Safe: repository is fully injected and ready to use
        List<Product> products = repository.findAll();
        System.out.println("Cache initialized with " + products.size() + " items");
    }

    @PreDestroy
    public void cleanup() {
        System.out.println("Cleaning up cache before container shutdown...");
    }
}
\`\`\`

**Production gotcha:** Avoid implementing Spring-specific interfaces like \`InitializingBean\` or \`DisposableBean\` unless you're writing a custom framework starter. Standard \`@PostConstruct\` and \`@PreDestroy\` annotations (from \`jakarta.annotation\`) keep your application code decoupled from Spring APIs.`,
        followUps: [
          { text: "Where do `@PostConstruct` and `@PreDestroy` fit in the lifecycle?" },
          { text: "What is the difference between `InitializingBean` and `@PostConstruct`?" },
          { text: "What do BeanPostProcessors do, and when do they run?" },
        ],
      },
      {
        id: 43,
        text: "What are `@Component`, `@Service`, `@Repository`, and `@Controller` — how do they differ?",
        answer: "All four register a class as a Spring bean, and component scanning picks them up identically. `@Service` is a pure label — swap it for `@Component` on `OrderService` and nothing changes at runtime. The other two carry real behaviour. **`@Repository`** translates vendor exceptions into Spring's `DataAccessException`, so a Postgres duplicate-key error reaches your service as `DuplicateKeyException` rather than a raw `PSQLException`. **`@Controller`** is how `RequestMappingHandlerMapping` recognises a handler, so a plain `@Component` holding `@GetMapping` methods is never mapped and every call to it 404s.",
        explanation: `\`\`\`java
// BAD — plain @Component on a DAO: vendor exceptions leak straight through to callers
@Component
public class SqlUserRepository {
    @PersistenceContext
    private EntityManager entityManager;

    public User findById(Long id) {
        // A dead connection escapes as a raw Hibernate PersistenceException.
        // Now OrderService has to import Hibernate just to catch it — the persistence
        // technology has leaked into your business layer.
        return entityManager.find(User.class, id);
    }
}
\`\`\`

\`\`\`java
// GOOD — @Repository triggers PersistenceExceptionTranslationPostProcessor
@Repository
public class SqlUserRepository {
    @PersistenceContext
    private EntityManager entityManager;

    public User findById(Long id) {
        // Same call, but the bean is proxied: HibernateException / SQLException get rethrown
        // as Spring's DataAccessException hierarchy (e.g. DataIntegrityViolationException).
        // Service code catches one exception family no matter which DB sits underneath.
        return entityManager.find(User.class, id);
    }
}
\`\`\`

**Which stereotype goes where:** \`@Controller\` and \`@RestController\` belong on the web layer, handling HTTP requests and response serialization. \`@Service\` marks the business layer that owns transactions, domain validation, and orchestration. \`@Repository\` marks the persistence layer and buys you the exception translation above. Plain \`@Component\` is the fallback for things that don't sit in any of those tiers — file parsers, external API client wrappers, validators.`,
        followUps: [
          { text: "What breaks if you annotate a DAO with `@Component` instead of `@Repository`?" },
          { text: "When would you use plain `@Component` vs a stereotype annotation?" },
        ],
      },
      {
        id: 44,
        text: "What is `@Autowired`, and how does Spring resolve dependencies?",
        answer: "`@Autowired` tells Spring to find a matching bean and inject it. Resolution goes **by type first**, and one match wins. Several matches and a `@Qualifier` narrows it first, then `@Primary` picks the default, and the last resort is matching the **field or parameter name** against the bean name. No match at all and startup fails with `NoSuchBeanDefinitionException` — unless you set `required = false`, which gets you a null field instead. Since Spring 4.3 you don't write it on a single-constructor class at all. The constructor is autowired implicitly, which is why modern code has almost no `@Autowired` in it.",
        explanation: `\`\`\`java
// Resolution sequence demonstration
public interface MessageSender { void send(String msg); }

@Component("emailSender") // Bean name: "emailSender"
public class EmailSender implements MessageSender { public void send(String msg) {} }

@Component("smsSender") // Bean name: "smsSender"
public class SmsSender implements MessageSender { public void send(String msg) {} }

// AMBIGUITY TRAP — Spring finds 2 beans of type MessageSender
@Service
public class AlertService {
    @Autowired
    private MessageSender smsSender; // Resolves by field name ("smsSender") if type matching yields duplicates
}
\`\`\`

\`\`\`java
// GOOD — Explicit resolution using constructor injection and @Qualifier
@Service
public class AlertService {
    private final MessageSender messageSender;

    public AlertService(@Qualifier("emailSender") MessageSender messageSender) {
        // Explicit qualifier removes reliance on variable naming tricks
        this.messageSender = messageSender;
    }
}
\`\`\`

**Common error in production:** If you annotate a field with \`@Autowired\` and forget to annotate the target class with \`@Component\` or \`@Service\`, Spring will throw \`UnsatisfiedDependencyException\` caused by \`NoSuchBeanDefinitionException\` on startup, stopping deployment.`,
        followUps: [
          { text: "You inject `List<PaymentGateway>` and three implementations exist — what happens?" },
          { text: "What does `required = false` actually give you, and what's better?" },
        ],
      },
      {
        id: 45,
        text: "What happens when there are multiple beans of the same type — how do you resolve ambiguity (`@Qualifier`, `@Primary`)?",
        answer: "Two beans of one type and Spring can't choose, so startup fails with `NoUniqueBeanDefinitionException`. **`@Primary`** marks one as the default for every injection point that doesn't ask for something specific. **`@Qualifier(\"stripeGateway\")`** names the one you want at a single site, and it **beats `@Primary`** when both apply. Reach for `@Primary` when there's an obvious house default — the real `PaymentGateway` in production, with a sandbox one sitting alongside it. Reach for `@Qualifier` when the choice is genuinely per-call-site, and picking the wrong one would fail silently.",
        explanation: `\`\`\`java
// BROKEN — Two implementations of PaymentGateway without @Primary or @Qualifier cause startup crash
public interface PaymentGateway { void process(); }

@Component public class StripeGateway implements PaymentGateway { public void process() {} }
@Component public class PaypalGateway implements PaymentGateway { public void process() {} }

@Service
public class CheckoutService {
    private final PaymentGateway paymentGateway;

    // CRASH: NoUniqueBeanDefinitionException: expected single matching bean but found 2: stripeGateway, paypalGateway
    public CheckoutService(PaymentGateway paymentGateway) {
        this.paymentGateway = paymentGateway;
    }
}
\`\`\`

\`\`\`java
// FIXED — Using @Primary for default, @Qualifier for specific overrides
@Component
@Primary // Default choice across the whole application
public class StripeGateway implements PaymentGateway { public void process() {} }

@Component
public class PaypalGateway implements PaymentGateway { public void process() {} }

@Service
public class SpecificCheckoutService {
    private final PaymentGateway paypalGateway;

    // @Qualifier explicitly overrides @Primary
    public SpecificCheckoutService(@Qualifier("paypalGateway") PaymentGateway paypalGateway) {
        this.paypalGateway = paypalGateway;
    }
}
\`\`\`

**Production Pattern:** A great pattern for microservices is having a primary implementation (\`RealS3StorageService\`) marked with \`@Primary\` for production, and an alternate (\`LocalStorageService\`) qualified for local profile testing.`,
        followUps: [
          { text: "How does bean name relate to field name when resolving by name?" },
          { text: "Can you combine `@Qualifier` with constructor injection?" },
        ],
      },
      {
        id: 46,
        text: "What is the difference between constructor injection and field injection? Which is recommended and why?",
        answer: "Constructor injection takes dependencies as constructor arguments; field injection puts `@Autowired` on the field and sets it by reflection after the object exists. Constructor wins for three concrete reasons. Fields can be `final`, so nothing reassigns a collaborator later. The object is never half-built, so there's no window where a method runs against a null dependency. And `new OrderService(mockRepo, mockGateway)` works in a plain JUnit test with no Spring context at all. Field injection also hides bloat: eight `@Autowired` fields look tidy, while an eight-argument constructor makes the class shout that it does too much.",
        explanation: `\`\`\`java
// BAD — Field injection: Hard to unit test without Spring runner; dependencies can be null
@Service
public class OrderService {
    @Autowired
    private UserRepository userRepository; // Can't be final!

    public User getOrderUser(Long userId) {
        return userRepository.findById(userId).orElseThrow();
    }
}
// Testing requires ReflectionTestUtils or @SpringBootTest (slow!)
\`\`\`

\`\`\`java
// GOOD — Constructor injection: Immutability, clear contract, ultra-fast plain JUnit tests
@Service
public class OrderService {
    private final UserRepository userRepository; // Guaranteed non-null & immutable

    public OrderService(UserRepository userRepository) {
        this.userRepository = Objects.requireNonNull(userRepository);
    }

    public User getOrderUser(Long userId) {
        return userRepository.findById(userId).orElseThrow();
    }
}

// Plain Unit Test without Spring overhead:
// OrderService service = new OrderService(mockUserRepository); // Fast and clean!
\`\`\`

**Architectural benefit:** If a class constructor asks for 8 different dependencies, constructor injection makes that pain glaringly obvious, prompting you to refactor into smaller services (Single Responsibility Principle). Field injection hides this bloat completely.`,
        followUps: [
          { text: "How does constructor injection help with immutability and required deps?" },
          { text: "Why is field injection harder to unit-test without Spring?" },
          { text: "When do you still have to write `@Autowired` on a constructor?" },
        ],
      },
      {
        id: 47,
        text: "What is `@Configuration` and `@Bean` used for?",
        answer: "`@Configuration` marks a class that **defines** beans; `@Bean` marks a method inside it whose return value becomes one. You need them for types you can't annotate — a `RestClient`, a `DataSource`, anything from a third-party jar whose source you don't own. The detail interviewers probe is that Spring **CGLIB-proxies the `@Configuration` class**, so calling one `@Bean` method from another returns the existing singleton instead of building a second object. Set `@Configuration(proxyBeanMethods = false)` and that guarantee disappears — each call constructs a new instance.",
        explanation: `\`\`\`java
// BAD — Instantiating 3rd party classes manually inside business services
@Service
public class PaymentService {
    public void pay() {
        // Don't instantiate external SDK clients inline — wastes connections and hurts testing
        com.stripe.StripeClient client = new com.stripe.StripeClient("api_key_123");
    }
}
\`\`\`

\`\`\`java
// GOOD — Centralized third-party configuration class using @Configuration and @Bean
@Configuration
public class AppConfig {

    @Value("\${stripe.api.key}")
    private String apiKey;

    @Bean // Tells Spring to manage the returned object as a bean
    public com.stripe.StripeClient stripeClient() {
        return new com.stripe.StripeClient(apiKey);
    }
}
\`\`\`

**The CGLIB Gotcha:** If you remove \`@Configuration\` and use \`@Component\` instead (lite mode), calling a \`@Bean\` method from another \`@Bean\` method inside the same class won't intercept the call via CGLIB proxy — it will invoke the raw method and create a new instance, breaking singleton semantics!`,
        followUps: [
          { text: "What is the difference between full `@Configuration` and lite `@Bean` methods?" },
          { text: "When would you define a bean with `@Bean` instead of stereotype annotations?" },
          { text: "How does `@Configuration` use CGLIB proxies?" },
        ],
      },
      {
        id: 48,
        text: "What is component scanning, and how does `@ComponentScan` work?",
        answer: "Spring walks the classpath from a set of base packages and registers every class carrying `@Component` or a stereotype built on it. `@ComponentScan` sets those packages; with no argument it uses the package of the class it sits on, plus everything below. `@SpringBootApplication` already includes it, which is why your main class's package is effectively the root of your application. The failure this causes is quiet: put `com.acme.billing.PaymentService` beside a main class in `com.acme.shop` and it's simply never scanned. You get `NoSuchBeanDefinitionException` at startup — fix it by moving the class under the main package rather than widening `basePackages`.",
        explanation: `The trap is a package layout where a bean sits outside the main class's package tree:

\`\`\`java
// com.company.app          <-- @SpringBootApplication main class lives here
//   ├── controller
//   └── service
// com.company.external     <-- OUTSIDE the main package!
//   └── LegacyHelper.java  <-- annotated @Component, but Spring never finds it

// BAD — scans com.company.app.* ONLY; LegacyHelper is silently skipped, no warning
@SpringBootApplication
public class Application {
    public static void main(String[] args) {
        SpringApplication.run(Application.class, args);
    }
}
\`\`\`

\`\`\`java
// FIXED — Explicitly declare basePackages to scan external package paths
@SpringBootApplication
@ComponentScan(basePackages = {"com.company.app", "com.company.external"})
public class Application {
    public static void main(String[] args) {
        SpringApplication.run(Application.class, args);
    }
}
\`\`\`

**Real-world advice:** Avoid scattering packages across unrelated root packages in multi-module projects. Keep everything under a unified root package like \`com.yourcompany.projectname\` so default component scanning works without manual \`@ComponentScan\` tweaks.`,
        followUps: [
          { text: "What is the default package scanned by `@SpringBootApplication`?" },
          { text: "How do you include or exclude packages/filters from scanning?" },
          { text: "What happens if a bean is outside the scanned packages?" },
        ],
      },
      {
        id: 49,
        text: "What are Spring profiles, and how do you use `@Profile`?",
        answer: "A profile is a named group of beans and properties that's only active in some environments. `@Profile(\"dev\")` on a bean registers it only when `dev` is active. So you can run an in-memory `FakePaymentGateway` locally and the real Stripe one in prod, both behind the same interface. Properties follow the same rule through `application-dev.yml` and `application-prod.yml`, layered over the plain `application.yml`. You activate with `spring.profiles.active`, normally from an environment variable in the container rather than baked into the jar. The bug to watch for is a bean with **no** `@Profile` — it's active everywhere, including the environment you forgot about.",
        explanation: `\`\`\`java
// Registering different beans per environment
public interface ObjectStorage { void upload(String fileName); }

@Component
@Profile("dev") // Active only when spring.profiles.active=dev
public class LocalFileStorage implements ObjectStorage {
    public void upload(String fileName) {
        System.out.println("Saving " + fileName + " to local /tmp folder");
    }
}

@Component
@Profile("prod") // Active only when spring.profiles.active=prod
public class S3ObjectStorage implements ObjectStorage {
    public void upload(String fileName) {
        System.out.println("Uploading " + fileName + " to AWS S3 Bucket");
    }
}
\`\`\`

**Profile expression syntax:** Since Spring 5.1, you can use logical operators inside \`@Profile\`:
\`@Profile("prod & !cloud")\` — Bean registers if \`prod\` is active AND \`cloud\` is NOT active.

**Production configuration setup:**
In production Kubernetes or Docker deployments, never hardcode active profiles in \`application.properties\`. Pass \`SPRING_PROFILES_ACTIVE=prod\` as an environment variable to container pods.`,
        followUps: [
          { text: "How do you activate profiles via properties, env vars, and CLI args?" },
          { text: "Can a bean belong to multiple profiles?" },
          { text: "How do profile-specific `application-{profile}.yml` files work?" },
        ],
      },
      {
        id: 50,
        text: "What is AOP (Aspect-Oriented Programming) in Spring? What are common use cases?",
        answer: "AOP pulls **cross-cutting concerns** — transactions, security, logging, metrics — out of your business methods into one place that gets applied around them. Spring implements it with **runtime proxies**: the bean you inject isn't your class, it's a generated wrapper that runs the extra behaviour and then delegates. You already use it constantly without writing an aspect, since `@Transactional`, `@Cacheable`, `@Async`, and `@PreAuthorize` are all AOP. The consequence to know is that it only works **through the proxy**. An internal call from one method of a bean to another bypasses it, which is the most common reason `@Transactional` looks like it's being ignored.",
        explanation: `**Analogy:** Imagine a nightclub with a security guard (Aspect) stationed at the entrance. Every guest (method call) must be checked for ID and tickets before entering. The DJ inside the club (business logic) doesn't check IDs — security is handled entirely at the doorway proxy before guests enter.

\`\`\`java
// BAD — Business logic cluttered with repetitive cross-cutting concerns
@Service
public class AccountService {
    private final AccountRepository accountRepo;

    public AccountService(AccountRepository accountRepo) { this.accountRepo = accountRepo; }

    public void transferMoney(Long from, Long to, double amount) {
        long start = System.currentTimeMillis(); // Logging concern
        System.out.println("Checking permissions..."); // Security concern

        try {
            // Core business logic hidden under boilerplate
            accountRepo.debit(from, amount);
            accountRepo.credit(to, amount);
        } catch (Exception e) {
            System.out.println("Transaction failed: " + e.getMessage());
            throw e;
        } finally {
            System.out.println("Execution time: " + (System.currentTimeMillis() - start) + "ms");
        }
    }
}
\`\`\`

\`\`\`java
// GOOD — Core logic remains clean; cross-cutting concerns handled by Spring AOP
@Service
public class AccountService {
    private final AccountRepository accountRepo;

    public AccountService(AccountRepository accountRepo) { this.accountRepo = accountRepo; }

    @Transactional // AOP handles transaction start/commit/rollback
    @LogExecutionTime // Custom AOP aspect handles timing and logging
    public void transferMoney(Long from, Long to, double amount) {
        accountRepo.debit(from, amount);
        accountRepo.credit(to, amount);
    }
}
\`\`\`

**Where you actually meet this:** you use Spring AOP every day without writing an aspect — \`@Transactional\`, \`@Cacheable\`, \`@Async\`, and \`@PreAuthorize\` are all proxy-based advice. That also explains the classic bug: because the advice lives on a **proxy**, a \`@Transactional\` method called via \`this\` from inside the same bean bypasses the proxy entirely and never opens a transaction. Custom aspects are worth writing for genuinely global concerns like request timing or audit logging; anything narrower is usually clearer as a plain method call.`,
        followUps: [
          { text: "What are cross-cutting concerns? Give 3 examples in a real app." },
          { text: "Does Spring AOP use proxies or bytecode weaving by default?" },
          { text: "What is the self-invocation problem with Spring AOP proxies?" },
        ],
      },
      {
        id: 51,
        text: "Explain `@Before`, `@After`, `@Around`, and other AOP advice types.",
        answer: "**`@Before`** runs ahead of the method, **`@AfterReturning`** only on success, **`@AfterThrowing`** only when it throws, and **`@After`** always, like a `finally`. **`@Around`** wraps the whole invocation — you get a `ProceedingJoinPoint`, and nothing happens unless you call `proceed()`. That's the one to reach for when you need the return value or the timing, because measuring how long `OrderRepository.save()` took needs both sides of the call. It's also the one that bites: forget `proceed()` and the target method silently never runs, so the caller gets null with no error anywhere.",
        explanation: `\`\`\`java
// Custom AOP Aspect demonstrating @Around advice for performance logging
@Aspect
@Component
public class PerformanceAspect {

    // Pointcut matches all public methods in service package
    @Around("execution(* com.company.service.*.*(..))")
    public Object profileMethod(ProceedingJoinPoint joinPoint) throws Throwable {
        long start = System.currentTimeMillis();

        try {
            // Execute the actual target method
            Object result = joinPoint.proceed();
            return result;
        } catch (Throwable ex) {
            System.err.println("Method " + joinPoint.getSignature() + " failed: " + ex.getMessage());
            throw ex; // Re-throw exception
        } finally {
            long duration = System.currentTimeMillis() - start;
            System.out.println(joinPoint.getSignature() + " took " + duration + " ms");
        }
    }
}
\`\`\`

**Key Difference:** Unlike \`@Before\` or \`@After\`, \`@Around\` MUST return \`Object\` and MUST call \`joinPoint.proceed()\`. If you forget to return the result of \`proceed()\`, the caller receives \`null\` instead of the service method's real return value!`,
        followUps: [
          { text: "When would you use `@Around` instead of `@Before` + `@After`?" },
          { text: "What is a pointcut expression? Give a simple example." },
        ],
      },
      {
        id: 52,
        text: "What is circular dependency in Spring, and how can it be resolved?",
        answer: "Two beans that need each other — `OrderService` takes `PaymentService` in its constructor while `PaymentService` takes `OrderService`. Neither can be built first, so the context fails at startup with `BeanCurrentlyInCreationException`. Since **Spring Boot 2.6 this fails by default for every injection style**, not just constructors. The old trick of switching to setter or field injection now needs `spring.main.allow-circular-references=true` just to boot. Treat that flag and `@Lazy` as ways to get an app running today, not as fixes. The cycle is a design signal: pull the shared behaviour into a third bean both depend on, and the graph becomes a DAG.",
        explanation: `\`\`\`java
// BROKEN — Direct constructor circular dependency crashes at startup
@Service
public class OrderService {
    private final PaymentService paymentService;
    public OrderService(PaymentService paymentService) { // Waits for PaymentService
        this.paymentService = paymentService;
    }
}

@Service
public class PaymentService {
    private final OrderService orderService;
    public PaymentService(OrderService orderService) { // Waits for OrderService
        this.orderService = orderService;
    }
}
// Crash: BeanCurrentlyInCreationException: Error creating bean with name 'orderService': Requested bean is currently in creation
\`\`\`

\`\`\`java
// FIXED — Extract the shared responsibility so neither service references the other
@Service
public class PaymentConfirmationService { // Owns "tell the customer the payment landed"
    public void confirm(Long orderId) { /* send email, write audit row */ }
}

@Service
public class PaymentService {
    // Was OrderService — that reference is what closed the loop
    private final PaymentConfirmationService confirmations;

    public PaymentService(PaymentConfirmationService confirmations) {
        this.confirmations = confirmations;
    }
}
// Graph is now a DAG: OrderService -> PaymentService -> PaymentConfirmationService
// Startup succeeds, and each class has one reason to change
\`\`\`

**The escape hatches, and why they aren't fixes:** \`@Lazy\` on one injection point — \`public PaymentService(@Lazy OrderService orderService)\` — makes Spring inject a proxy that satisfies the constructor immediately and resolves the real bean on first method call. Setter injection works too, since both beans are fully constructed before anything gets wired. Both get the app booting, but the cycle is still in your design: it's no longer visible in the code structure, so the next developer can't see it, and every call through the lazy proxy pays an indirection cost.

**Spring Boot 2.6+ change:** Starting with Spring Boot 2.6, circular dependencies are **forbidden by default** across all injection styles. If legacy code has circular references, you have to explicitly set \`spring.main.allow-circular-references=true\` in \`application.properties\`, but refactoring is the right solution.`,
        followUps: [
          { text: "How does setter injection or `@Lazy` help break cycles?" },
          { text: "You've broken a cycle with `@Lazy` and it boots. What's still wrong?" },
        ],
      },
    ],
  },
  {
    id: "spring-boot",
    title: "Spring Boot",
    description:
      "Auto-configuration, starters, Actuator, externalized config, and Boot-specific productivity features.",
    icon: "🚀",
    questions: [
      {
        id: 53,
        text: "What is Spring Boot, and how is it different from the Spring Framework?",
        answer: "Spring Boot is Spring plus **opinionated defaults** — auto-configuration, starter dependencies, and an embedded server — so `java -jar app.jar` is a running application.\n\nSpring Framework gives you the raw building blocks (IoC, AOP, MVC) and expects you to assemble them yourself. Boot assembles them for you, and backs off the moment you define your own bean.\n\nThe concrete difference: a plain Spring MVC app needed a `web.xml`, a `DispatcherServlet` declaration, a view resolver, and an external Tomcat to deploy a WAR into. The Boot equivalent is one starter and a `main` method.",
        explanation: `**Analogy:** Spring Framework is like buying a computer in individual pieces — processor, RAM, motherboard, graphics card — requiring you to assemble and configure every driver yourself. Spring Boot is like buying a pre-built MacBook — open the lid, press power, and immediately start working with optimal default settings.

\`\`\`java
// BAD — Raw Spring MVC configuration requires complex Java setup and external Tomcat WAR deployment
@Configuration
@EnableWebMvc
@ComponentScan(basePackages = "com.company.app")
public class WebConfig implements WebMvcConfigurer {
    // You must manually configure ViewResolvers, Jackson MessageConverters, and deploy to external Tomcat WAR
}
\`\`\`

\`\`\`java
// GOOD — Spring Boot auto-configures Tomcat, Jackson JSON converters, and DispatcherServlet automatically
@SpringBootApplication
public class Application {
    public static void main(String[] args) {
        // One line boots embedded Tomcat on port 8080 and scans for beans
        SpringApplication.run(Application.class, args);
    }
}
\`\`\`

**Real-world impact:** In microservice architectures, Spring Boot allows teams to bootstrap new microservices in minutes. Dependency management is simplified because \`spring-boot-starter-parent\` guarantees compatible library versions across your entire tech stack.`,
        followUps: [
          { text: "Can you use Spring without Boot? When might you?" },
          { text: "What does \"opinionated\" mean here, and how do you override an opinion?" },
        ],
      },
      {
        id: 54,
        text: "What are Spring Boot Starters?",
        answer: "Starters are **dependency bundles** — one coordinate that pulls in a curated, version-aligned set of jars. Add `spring-boot-starter-web` and you get Spring MVC, Jackson, and embedded Tomcat, all tested together at those versions.\n\nBean Validation split into its own starter in Boot 2.3, so `@Valid` needs `spring-boot-starter-validation` on top.\n\nThe version alignment is the real value: `spring-boot-starter-parent` or the BOM pins everything, so you never write a `<version>` tag for a Spring dependency. Resolve those by hand and you get the classic `NoSuchMethodError` at startup, where the Jackson you pulled in doesn't match the one Spring compiled against.",
        explanation: `**Analogy:** A Spring Boot Starter is like ordering a combo meal at a fast-food restaurant. Instead of ordering a burger, fries, and drink separately, you order "Combo #1", and the restaurant gives you perfectly paired items in one bundle.

\`\`\`xml
<!-- BAD — Adding 10+ separate libraries manually without guaranteed version compatibility -->
<dependency>
    <groupId>org.springframework</groupId>
    <artifactId>spring-webmvc</artifactId>
    <version>6.1.2</version>
</dependency>
<dependency>
    <groupId>com.fasterxml.jackson.core</groupId>
    <artifactId>jackson-databind</artifactId>
    <version>2.15.2</version> <!-- Version mismatch trap! -->
</dependency>
\`\`\`

\`\`\`xml
<!-- GOOD — One starter brings in Spring Web, Jackson, Validation, and Tomcat with verified versions -->
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-web</artifactId>
</dependency>
\`\`\`

**Production advice:** When building enterprise microservices across multiple teams, create a **custom company starter** (e.g., \`company-boot-starter-logging\`) containing standardized security filters, logging formats, and tracing configurations. This ensures every team adheres to enterprise architecture standards automatically.`,
        followUps: [
          { text: "What is `spring-boot-starter-parent`, and what does it manage?" },
          { text: "How would you create a custom starter for shared company config?" },
        ],
      },
      {
        id: 55,
        text: "What is Auto-Configuration in Spring Boot, and how does it work internally?",
        answer: "**Auto-configuration** registers beans based on what's on the classpath and what you haven't already defined. Boot reads its candidate list from `META-INF/spring/org.springframework.boot.autoconfigure.AutoConfiguration.imports`, then filters each entry through `@Conditional` guards — `@ConditionalOnClass`, `@ConditionalOnMissingBean`, `@ConditionalOnProperty`.\n\nSee a JDBC driver on the classpath and no `DataSource` bean of your own, and Boot builds one. Define your own `DataSource` and `@ConditionalOnMissingBean` makes Boot step aside silently.\n\nWhen you can't work out where a bean came from, start with `--debug` and read the **condition evaluation report** — it lists every candidate and why it matched or didn't.",
        explanation: `\`\`\`java
// How Spring Boot auto-configures DataSource internally (Simplified Example)
@Configuration
@ConditionalOnClass(DataSource.class) // Only runs if DataSource class is on classpath
@EnableConfigurationProperties(DataSourceProperties.class)
public class DataSourceAutoConfiguration {

    @Bean
    @ConditionalOnMissingBean // TRAP: Only creates default HikariDataSource if YOU didn't define one!
    public DataSource dataSource(DataSourceProperties properties) {
        return properties.initializeDataSourceBuilder().build();
    }
}
\`\`\`

\`\`\`java
// GOOD — Override auto-configured DataSource simply by declaring your own @Bean
@Configuration
public class CustomDatabaseConfig {

    @Bean
    public DataSource dataSource() {
        // Spring Boot sees this bean and automatically backs off its default HikariCP setup!
        return new CustomHikariDataSource("jdbc:postgresql://db.company.com:5432/main");
    }
}
\`\`\`

**Debugging Tip:** Run your application with the \`--debug\` flag or set \`logging.level.org.springframework.boot.autoconfigure=DEBUG\`. Spring Boot prints a detailed **Conditions Evaluation Report** showing exactly which auto-configurations matched and which ones were negative matches and why.`,
        followUps: [
          { text: "What role do `@ConditionalOnClass`, `@ConditionalOnMissingBean`, etc. play?" },
          { text: "You defined your own `DataSource` bean but Boot's is still being used. Why?" },
        ],
      },
      {
        id: 56,
        text: "What is `@SpringBootApplication` — what annotations does it combine?",
        answer: "It's a meta-annotation combining three: **`@SpringBootConfiguration`** (this class declares beans), **`@EnableAutoConfiguration`** (switch on the auto-config machinery), and **`@ComponentScan`** (scan from here down).\n\nThe \"from here down\" part is what bites. Scanning starts at the package of the annotated class, so a `PaymentService` sitting in a sibling package is never registered, and you get `NoSuchBeanDefinitionException` at startup.\n\nKeep the main class in the root package, above everything else. Each piece stays overridable through attributes like `scanBasePackages` and `exclude`.",
        explanation: `\`\`\`java
// Close to placing all 3 annotations manually (see the caveat below):
@SpringBootConfiguration      // Inherits from @Configuration; enables bean definitions
@EnableAutoConfiguration      // Auto-configures Tomcat, JPA, Jackson, etc.
@ComponentScan                // Scans current package and sub-packages for @Component
public class Application {
    public static void main(String[] args) {
        SpringApplication.run(Application.class, args);
    }
}
\`\`\`

\`\`\`java
// Excluding a specific auto-configuration that you don't need
@SpringBootApplication(exclude = {DataSourceAutoConfiguration.class})
public class NoDbApplication {
    public static void main(String[] args) {
        // Runs a Spring Boot application without trying to connect to a database automatically
        SpringApplication.run(NoDbApplication.class, args);
    }
}
\`\`\`

**The caveat on hand-rolling it:** \`@SpringBootApplication\` also carries \`TypeExcludeFilter\` and \`AutoConfigurationExcludeFilter\` on its \`@ComponentScan\`, so writing the three annotations by hand quietly changes how test slices (\`@WebMvcTest\`, \`@DataJpaTest\`) filter beans. Keep the single annotation and use its \`exclude\`, \`scanBasePackages\`, and \`nameGenerator\` attributes instead.

**Package location rule:** Always place your \`@SpringBootApplication\` annotated class in the **root base package** (e.g., \`com.company.order\`). If you put it inside \`com.company.order.config\`, Spring Boot won't scan sibling packages like \`com.company.order.service\`, causing \`NoSuchBeanDefinitionException\`.`,
        followUps: [
          { text: "Can you replace `@SpringBootApplication` with its composed annotations?" },
          { text: "How do you exclude a specific auto-configuration?" },
        ],
      },
      {
        id: 57,
        text: "How do you externalize configuration in Spring Boot (`application.properties` / `application.yml`)?",
        answer: "You keep configuration **outside the jar**, so one build artifact runs unchanged in every environment. Values arrive from `application.yml`, profile-specific files, environment variables, JVM system properties, and command-line arguments.\n\nYou read them with **`@Value`** for one-offs or **`@ConfigurationProperties`** for a typed group.\n\nPrecedence runs most-specific-wins: command-line args beat environment variables, which beat `application-prod.yml`, which beats `application.yml`. That ordering is what lets you point a container at a different database with `SPRING_DATASOURCE_URL` and rebuild nothing.",
        explanation: `\`\`\`yaml
# application.yml — Hierarchical, clean format for complex properties
server:
  port: 8080

app:
  payment:
    timeout-ms: 5000
    gateway-url: https://api.stripe.com
\`\`\`

\`\`\`java
// Injecting externalized properties into a Spring service
@Service
public class StripePaymentGateway {

    @Value("\${app.payment.gateway-url}")
    private String gatewayUrl; // Injects "https://api.stripe.com"

    @Value("\${app.payment.timeout-ms:3000}") // 3000 is default fallback if property missing
    private int timeoutMs;
}
\`\`\`

**Production Trap:** Never commit passwords, API keys, or database credentials into \`application.yml\` in source control. Store secrets in environment variables or cloud key vaults (AWS Secrets Manager, HashiCorp Vault).`,
        followUps: [
          { text: "What is the property source precedence order?" },
          { text: "When would you prefer YAML over properties?" },
          { text: "How do you supply a default for a property that might be missing?" },
        ],
      },
      {
        id: 58,
        text: "What is the purpose of `@ConfigurationProperties`?",
        answer: "`@ConfigurationProperties(prefix = \"payment\")` binds a whole group of properties onto a typed object, so `payment.gateway.timeout` lands in a `Duration` field.\n\nUnlike `@Value` it handles **nested objects, lists, maps, and relaxed binding** — `api-key`, `API_KEY`, and `apiKey` all bind to the same field. It also supports **`@Validated`**, so malformed config fails at startup instead of at 3am.\n\nThe part people miss: the class has to be **registered**, through `@ConfigurationPropertiesScan`, `@EnableConfigurationProperties`, or `@Component`. Miss that and it binds nothing — every field is silently null.\n\nIn Boot 3 a record or single-constructor class gets **constructor binding** automatically, so the fields can be `final`.",
        explanation: `\`\`\`yaml
# application.yml
app:
  mail:
    host: smtp.mail.com
    port: 587
    recipients:
      - admin@company.com
      - support@company.com
\`\`\`

\`\`\`java
// GOOD — Type-safe binding with validation
@Component
@ConfigurationProperties(prefix = "app.mail")
@Validated // Enforces Jakarta Bean Validation rules at startup
public class MailProperties {

    @NotBlank // Fails app startup if property is missing or blank
    private String host;

    @Min(1)
    private int port;

    private List<String> recipients = new ArrayList<>();

    // Standard getters and setters required for binding
    public String getHost() { return host; }
    public void setHost(String host) { this.host = host; }
    public int getPort() { return port; }
    public void setPort(int port) { this.port = port; }
    public List<String> getRecipients() { return recipients; }
    public void setRecipients(List<String> recipients) { this.recipients = recipients; }
}
\`\`\`

**Why it beats \`@Value\`:** If you have 15 configuration properties for an AWS S3 client, injecting 15 individual \`@Value\` fields litters your class with boilerplate. \`@ConfigurationProperties\` groups them into a single re-usable, testable properties object.`,
        followUps: [
          { text: "How do nested objects, lists, and startup validation work with it?" },
          { text: "Why is it preferred over many `@Value` injections for groups of related properties?" },
        ],
      },
      {
        id: 59,
        text: "How do you manage different configurations for different environments (dev, test, prod)?",
        answer: "You use **profile-specific files** — `application-dev.yml`, `application-prod.yml` — layered over a shared `application.yml`, or one multi-document YAML split by `---`. Activate with `spring.profiles.active=prod`, normally from an environment variable in the container rather than baked into the image.\n\nThe active profile's values override the shared ones, so `application.yml` carries defaults and each profile overrides only what differs.\n\nKeep real secrets out of all of them — those come from the environment or a secret manager, never a file inside the jar.",
        explanation: `\`\`\`yaml
# application.yml (Default baseline properties)
spring:
  application:
    name: order-service

---
# dev profile section
spring:
  config:
    activate:
      on-profile: dev
  datasource:
    url: jdbc:h2:mem:devdb

---
# prod profile section
spring:
  config:
    activate:
      on-profile: prod
  datasource:
    url: jdbc:postgresql://prod-db.company.com:5432/orderdb
\`\`\`

\`\`\`bash
# Activating production profile when launching the executable JAR.
# JVM args go BEFORE -jar: anything after -jar is read as the jar name, then as app args.
java -Dspring.profiles.active=prod -jar order-service.jar

# Or as a Spring command-line argument (highest precedence of all):
java -jar order-service.jar --spring.profiles.active=prod
\`\`\`

**Production best practice:** Keep \`application-prod.yml\` clean of plaintext secrets. Use placeholder references like \`password: \${DB_PASSWORD}\` and let Kubernetes or Docker inject \`DB_PASSWORD\` as an environment variable at container startup.`,
        followUps: [
          { text: "How do you keep prod secrets out of Git?" },
          { text: "What is the difference between multi-document YAML and separate profile files?" },
        ],
      },
      {
        id: 60,
        text: "What is Spring Boot DevTools?",
        answer: "**DevTools** is a development-only module: automatic restart when classes recompile, LiveReload in the browser, and development-friendly defaults like template caching switched off.\n\nThe restart works through two classloaders — your project code in a restart loader, third-party jars in a base loader that's left untouched. Only the restart loader gets discarded, so a reload takes a second or two rather than a full JVM boot.\n\nIt disables itself when launched from a packaged jar, so it can't reach production. Keep it in `optional`/`developmentOnly` scope so it doesn't leak into anything that depends on your module.",
        explanation: `\`\`\`xml
<!-- Add DevTools to your pom.xml as an optional dependency -->
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-devtools</artifactId>
    <scope>runtime</scope>
    <optional>true</optional> <!-- Ensures it won't be transitively included in production JARs -->
</dependency>
\`\`\`

\`\`\`properties
# Development defaults enabled automatically by DevTools:
# Disables template caching so UI edits reflect instantly
spring.thymeleaf.cache=false
# Enables detailed logging output
logging.level.web=DEBUG
\`\`\`

**Important gotcha:** DevTools triggers automatic restarts only when classpath files change. If using IntelliJ IDEA, you must press \`Ctrl+F9\` (or \`Cmd+F9\` on Mac) to compile your modified Java files, or enable "Build project automatically" in settings.`,
        followUps: [
          { text: "Why doesn't a change to a library jar trigger a DevTools restart?" },
        ],
      },
      {
        id: 61,
        text: "What is Spring Boot Actuator, and what are some commonly used endpoints?",
        answer: "**Actuator** exposes production monitoring over HTTP or JMX: **`/actuator/health`** for liveness and readiness, **`/actuator/metrics`** for JVM and HTTP stats via Micrometer, **`/actuator/env`** for resolved configuration, and **`/actuator/loggers`** to read and change log levels at runtime without a redeploy.\n\nBy default **only `/health` is exposed over HTTP** — `/info` was dropped from the defaults in Boot 2.6, and anything else has to be added to `management.endpoints.web.exposure.include` by hand.\n\nNever open `/actuator/**` wholesale. `/actuator/env` prints configuration including credentials, and `/actuator/heapdump` hands over a file containing live memory — so keep it behind `hasRole(\"ADMIN\")` or on a separate `management.server.port` reachable only inside the cluster.",
        explanation: `\`\`\`yaml
# application.yml — Secure Actuator endpoint exposure in production
management:
  endpoints:
    web:
      exposure:
        include: "health,info,metrics,prometheus" # Expose ONLY safe monitoring endpoints
  endpoint:
    health:
      show-details: always # Shows database and disk component health
\`\`\`

\`\`\`java
// Spring Security config securing Actuator endpoints
@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http.authorizeHttpRequests(auth -> auth
            .requestMatchers("/actuator/health").permitAll() // Public health check for K8s probes
            .requestMatchers("/actuator/**").hasRole("ADMIN") // Require ADMIN for all other endpoints
            .anyRequest().authenticated()
        );
        return http.build();
    }
}
\`\`\`

**Real-world usefulness:** The \`/actuator/loggers\` endpoint lets you temporarily bump package log levels to \`TRACE\` on a running production instance via a \`POST\` request, allowing you to debug live issues without restarting the pod!`,
        followUps: [
          { text: "What is the difference between disabling an endpoint and not exposing it?" },
          { text: "How do you customize health status aggregation?" },
        ],
      },
      {
        id: 62,
        text: "How do you create a custom Actuator health indicator?",
        answer: "Implement **`HealthIndicator`** and register it as a bean — the bean name becomes the key in the response, so `paymentGatewayHealthIndicator` appears as `paymentGateway`. Inside `health()` you run the check and return `Health.up()`, or `Health.down().withDetail(\"error\", ex.getMessage())` to attach diagnostics.\n\nBoot aggregates every indicator into `/actuator/health`, and **a single `DOWN` drags the whole endpoint to `DOWN`** with HTTP 503.\n\nThat's the danger worth saying out loud: put a slow third-party ping in there and you've wired someone else's outage to your Kubernetes liveness probe. Give the check a timeout, and put it in the **readiness** group rather than liveness.",
        explanation: `\`\`\`java
// Custom HealthIndicator checking third-party Payment API availability
@Component
public class PaymentGatewayHealthIndicator implements HealthIndicator {

    private final PaymentGatewayClient client;

    public PaymentGatewayHealthIndicator(PaymentGatewayClient client) {
        this.client = client;
    }

    @Override
    public Health health() {
        try {
            boolean isHealthy = client.ping();
            if (isHealthy) {
                return Health.up()
                    .withDetail("gateway", "Stripe API")
                    .withDetail("latencyMs", 42)
                    .build();
            } else {
                return Health.down()
                    .withDetail("error", "Gateway ping returned false")
                    .build();
            }
        } catch (Exception ex) {
            // Returns DOWN status if connection throws exception
            return Health.down(ex).build();
        }
    }
}
\`\`\`

**Kubernetes Integration:** In cloud environments, Kubernetes uses \`/actuator/health/liveness\` to check if the pod container should be restarted, and \`/actuator/health/readiness\` to check if the pod can accept incoming web traffic.`,
        followUps: [
          { text: "How do you stop a slow dependency check from hanging `/health`?" },
          { text: "When would you mark a custom check as DOWN vs OUT_OF_SERVICE?" },
          { text: "How does readiness vs liveness differ in Kubernetes health probes?" },
        ],
      },
      {
        id: 63,
        text: "What embedded servers does Spring Boot support?",
        answer: "Spring Boot supports three embedded Servlet containers: **Apache Tomcat** (the default for `spring-boot-starter-web`), **Eclipse Jetty**, and **Red Hat Undertow**, alongside **Netty** for reactive applications (`spring-boot-starter-webflux`).\n\nYou switch by excluding `spring-boot-starter-tomcat` from `spring-boot-starter-web` and adding the starter you want in its place. Either way the server ships inside your jar, so there's no container to install or patch on the host.\n\nLeaving two server starters on the classpath doesn't fail — the auto-configuration is ordered Tomcat, Jetty, Undertow, each guarded by `@ConditionalOnMissingBean`, so **Tomcat silently wins**. That's the actual bug: you add Undertow, tune its properties, and nothing changes because you never excluded Tomcat.",
        explanation: `\`\`\`xml
<!-- Switching from default Tomcat to Undertow in Maven -->
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-web</artifactId>
    <exclusions>
        <!-- Exclude default Tomcat -->
        <exclusion>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-tomcat</artifactId>
        </exclusion>
    </exclusions>
</dependency>

<!-- Add Undertow starter -->
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-undertow</artifactId>
</dependency>
\`\`\`

**When to switch servers:** Undertow offers a lower memory footprint and higher concurrency handling for heavy I/O workloads compared to Tomcat. Netty is used exclusively when building non-blocking, reactive applications using Spring WebFlux.`,
        followUps: [
          { text: "When would you deploy as WAR to an external server instead?" },
          { text: "Why would you pick Undertow or Jetty over Tomcat?" },
        ],
      },
      {
        id: 64,
        text: "How do you change the default embedded server or port in Spring Boot?",
        answer: "Set **`server.port`** in `application.yml`, or override it per environment with the `SERVER_PORT` environment variable or `--server.port=9090` on the command line.\n\nSetting `server.port=0` binds a **random free port** — that's what `@SpringBootTest(webEnvironment = RANDOM_PORT)` uses so parallel test runs don't collide. If the port is already taken, startup fails with `PortInUseException`.\n\nTo change the server itself rather than the port, **exclude `spring-boot-starter-tomcat`** from `spring-boot-starter-web` and add the Jetty or Undertow starter. The exclusion is the step people skip.",
        explanation: `\`\`\`yaml
# application.yml — Setting custom port and context path
server:
  port: 8081 # Changes default 8080 to 8081
  servlet:
    context-path: /api/v1 # Prefixes all HTTP endpoints with /api/v1
\`\`\`

\`\`\`java
// Accessing the random server port dynamically in integration tests
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
public class OrderApiIntegrationTest {

    @LocalServerPort // Injects the randomly assigned port at runtime
    private int port;

    @Test
    public void testEndpoint() {
        System.out.println("Test server started on port: " + port); // e.g. prints 54321
    }
}
\`\`\`

**Configuring SSL/TLS on embedded server:**
To enable HTTPS, add \`server.ssl.key-store=classpath:keystore.p12\` and \`server.ssl.key-store-password=secret\` to \`application.yml\`. Tomcat will automatically start listening on HTTPS.`,
        followUps: [
          { text: "How do you configure SSL on the embedded server?" },
          { text: "What is `management.server.port` for?" },
        ],
      },
      {
        id: 65,
        text: "How does Spring Boot handle logging, and how do you configure log levels?",
        answer: "Boot logs through **SLF4J** with **Logback** bound by default and already configured, so you get sensible console output without adding anything.\n\nSet levels per package in properties — `logging.level.com.acme.order=DEBUG`, or `logging.level.org.hibernate.SQL=DEBUG` to watch the generated SQL.\n\nFor anything structural (JSON output for ELK, rolling files, per-profile appenders) add a `logback-spring.xml`, which Boot processes itself so `<springProfile>` blocks work.\n\nThe default level is `INFO`. During an incident you can flip a level at runtime through `/actuator/loggers` with no redeploy, which is the trick worth remembering.",
        explanation: `\`\`\`yaml
# application.yml — Declarative log level configuration
logging:
  level:
    root: INFO # Global default log level
    com.company.service: DEBUG # Verbose logging for business logic package
    org.hibernate.SQL: DEBUG # Prints formatted SQL statements to console
\`\`\`

\`\`\`java
// Standard SLF4J logger usage in a Spring service
@Service
public class OrderService {
    // Standard SLF4J logger reference (or use Lombok @Slf4j)
    private static final Logger log = LoggerFactory.getLogger(OrderService.class);

    public void processOrder(Long id) {
        log.info("Processing order id: {}", id); // Efficient parameterized logging
        log.debug("Fetching user details from repository for order: {}", id);
    }
}
\`\`\`

**Performance Trap:** Avoid string concatenation inside log statements (\`log.debug("Processing order " + id)\`). String concatenation evaluates immediately regardless of whether DEBUG level is enabled! Always use parameterized anchors (\`log.debug("Processing order {}", id)\`).`,
        followUps: [
          { text: "How do SLF4J and Logback relate to each other?" },
          { text: "How do you set package-level log levels in `application.yml`?" },
          { text: "How do you use a custom `logback-spring.xml` with profiles?" },
        ],
      },
      {
        id: 66,
        text: "What is the difference between `CommandLineRunner` and `ApplicationRunner`?",
        answer: "Both run **after the context is refreshed but before `SpringApplication.run()` returns** — the slot for startup work like seeding reference data or warming a cache.\n\nThe only real difference is the argument shape. `CommandLineRunner` hands you the raw `String... args`. `ApplicationRunner` hands you `ApplicationArguments`, which has already split `--env=prod` into option names and values, so you call `args.getOptionValues(\"env\")` instead of parsing strings yourself.\n\nSequence several with `@Order`. If a runner throws, the application **fails to start** — usually exactly what you want for a required migration.",
        explanation: `\`\`\`java
// CommandLineRunner — Receives raw string array
@Component
@Order(1) // Controls execution order when multiple runners exist
public class DataSeederRunner implements CommandLineRunner {

    @Override
    public void run(String... args) throws Exception {
        // Raw args array: args[0] = "--env=prod"
        System.out.println("CommandLineRunner executed with raw args: " + Arrays.toString(args));
    }
}
\`\`\`

\`\`\`java
// ApplicationRunner — Receives parsed, structured arguments
@Component
@Order(2)
public class CacheWarmupRunner implements ApplicationRunner {

    @Override
    public void run(ApplicationArguments args) throws Exception {
        // Structured argument inspection
        boolean isImport = args.containsOption("importData");
        List<String> envValues = args.getOptionValues("env"); // Gets "prod" directly!
        System.out.println("ApplicationRunner executing cache warmup...");
    }
}
\`\`\`

**Real-world usage:** In production, use \`CommandLineRunner\` sparingly. Long-running or blocking tasks inside a runner will delay the embedded web server startup, causing readiness probe timeouts in cloud deployments.`,
        followUps: [
          { text: "How do you control order when multiple runners exist?" },
          { text: "What are the risks of doing heavy work inside a runner?" },
        ],
      },
      {
        id: 67,
        text: "How do you package a Spring Boot application (JAR vs WAR)?",
        answer: "The default is an **executable fat JAR** — your classes, every dependency, and an embedded Tomcat, launched with `java -jar app.jar`.\n\nA **WAR** targets an external servlet container: set packaging to `war`, mark the embedded server `provided`, and extend **`SpringBootServletInitializer`** so the container can bootstrap the app.\n\nFat JAR wins in modern deployments because it's a single artifact with no server to install or patch separately.\n\nFor containers, build a **layered** image with `layertools` or a Buildpack so dependencies cache in their own layer. A code-only rebuild then ships a few hundred KB instead of the whole 200MB.",
        explanation: `\`\`\`java
// Packaging as a WAR requires extending SpringBootServletInitializer
@SpringBootApplication
public class ServletInitializerApplication extends SpringBootServletInitializer {

    // Overriding configure connects the servlet container to the Spring ApplicationContext
    @Override
    protected SpringApplicationBuilder configure(SpringApplicationBuilder application) {
        return application.sources(ServletInitializerApplication.class);
    }

    public static void main(String[] args) {
        SpringApplication.run(ServletInitializerApplication.class, args);
    }
}
\`\`\`

\`\`\`bash
# Executing an executable Fat JAR in Docker / Production
# JVM args (-D, -Xmx) come BEFORE -jar; Spring args (--key=value) come AFTER the jar name
java -Xmx512m -jar target/order-service-1.0.0.jar --server.port=8080
\`\`\`

**How executable JARs work internally:**
Spring Boot uses a custom \`JarLauncher\` that allows nesting JAR dependencies inside \`BOOT-INF/lib/\` within a single ZIP structure without needing to explode dependencies onto host file systems.`,
        followUps: [
          { text: "How does `java -jar` load dependencies that are themselves jars inside the jar?" },
          { text: "How do you run a Boot JAR with external config?" },
        ],
      },
      {
        id: 68,
        text: "What is the difference between `@RestController` and `@Controller`?",
        answer: "`@Controller` returns **view names** — the returned string is resolved to a Thymeleaf or JSP template and rendered server-side. `@RestController` is `@Controller` + `@ResponseBody`, so the return value goes through an `HttpMessageConverter` and is serialized straight into the response body as JSON.\n\nUse `@RestController` for APIs, `@Controller` for server-rendered pages.\n\nThe mistake you make once: leave `@Controller` on a REST class returning a `UserDto`, and Spring tries to resolve a **view** instead of serializing it. You get a template-not-found error rather than your JSON.",
        explanation: `\`\`\`java
// Traditional MVC Controller — Returns HTML view template name
@Controller
public class WebPageController {

    @GetMapping("/welcome")
    public String showWelcomePage(Model model) {
        model.addAttribute("username", "Alice");
        return "welcome-page"; // Resolves to /templates/welcome-page.html template!
    }
}
\`\`\`

\`\`\`java
// REST API Controller — Automatically serializes return objects into JSON response body
@RestController
@RequestMapping("/api/v1/users")
public class UserRestController {

    @GetMapping("/{id}")
    public UserDto getUser(@PathVariable Long id) {
        return new UserDto(id, "Alice"); // Jackson serializes into: {"id":1, "name":"Alice"}
    }
}
\`\`\`

**Common mistake:** If you annotate a REST controller with \`@Controller\` instead of \`@RestController\` and forget \`@ResponseBody\` on methods, Spring will interpret the returned string as a view template name, throwing a \`404 Not Found\` or \`Circular view path\` exception!`,
        followUps: [
          { text: "What happens if a `@Controller` method returns a `String` without `@ResponseBody`?" },
          { text: "When would you still reach for plain `@Controller`?" },
          { text: "Can you mix both in the same application?" },
        ],
      },
    ],
  },
  {
    id: "spring-mvc-rest",
    title: "Spring MVC / REST APIs",
    description:
      "Request flow, controllers, validation, exception handling, and REST best practices.",
    icon: "🌐",
    questions: [
      {
        id: 69,
        text: "Explain the request flow in Spring MVC (DispatcherServlet, HandlerMapping, etc.).",
        answer: "Every HTTP request hits a single **`DispatcherServlet`** (Spring's front controller), which asks **`HandlerMapping`** to find the controller method for the URL, uses a **`HandlerAdapter`** to invoke that method, binds parameters, runs the business logic, then resolves the return value into a response — JSON for `@RestController`, a view for `@Controller`.\n\n`HandlerInterceptor`s run around the handler, and `@ExceptionHandler`s catch anything thrown.\n\nThe key idea is **one servlet dispatches everything**, so routing, validation, and exception handling stay centralized instead of living in each controller.",
        explanation: `\`\`\`java
// The full chain for: GET /api/users/42 on an @RestController
// 1. Filter chain (Spring Security, CORS) runs FIRST
// 2. DispatcherServlet.doDispatch() takes over
DispatcherServlet
  -> HandlerMapping          // finds getUser(Long id) at GET /api/users/{id}
  -> HandlerInterceptor[]    // preHandle() — auth/logging checks
  -> HandlerAdapter          // invokes the controller method
  -> Controller.getUser(42)  // @PathVariable bound, business logic runs
  -> HandlerInterceptor[]    // postHandle()
  -> HttpMessageConverter    // Jackson serializes UserDto -> JSON
  -> HttpServletResponse     // 200 OK + JSON body
\`\`\`

**Where it shows up:** when a request returns the wrong status or content type, 90% of the time the fix lives in this chain — a missing converter, a filter ordering issue, or an interceptor short-circuiting the response. Knowing the order tells you *where* to put a breakpoint.`,
        followUps: [
          { text: "What roles do HandlerAdapter, ViewResolver, and interceptors play?" },
          { text: "Where does filter chain sit relative to DispatcherServlet?" },
        ],
      },
      {
        id: 70,
        text: "What is `@RequestMapping`, and how do `@GetMapping`, `@PostMapping`, etc. differ from it?",
        answer: "**`@RequestMapping`** is the generic mapping annotation — without a `method` it matches **every HTTP verb** on the given path, which is almost never what you want.\n\n**`@GetMapping`**, **`@PostMapping`**, `@PutMapping`, `@PatchMapping`, and `@DeleteMapping` are composed shorthands that pin the handler to one HTTP method. The intent reads at a glance and you don't accidentally handle a DELETE on what should be a GET-only endpoint.\n\nUse the composed shortcuts for every handler; reserve raw `@RequestMapping` for **class-level base paths**.",
        explanation: `\`\`\`java
// WITHOUT narrowed mapping — handles GET, POST, PUT, DELETE... all of them
@RequestMapping("/users")
public List<User> getUsers() { ... }   // a DELETE to /users also lands here — dangerous
\`\`\`

\`\`\`java
// GOOD — composed annotations lock the HTTP method explicitly
@RestController
@RequestMapping("/api/users")   // class-level base path, no method = fine here
public class UserController {
    @GetMapping("/{id}")                       // GET /api/users/42 only
    public User get(@PathVariable Long id) { ... }

    @PostMapping                               // POST /api/users only
    public User create(@RequestBody UserDto dto) { ... }

    @DeleteMapping("/{id}")                    // DELETE /api/users/42 only
    public void delete(@PathVariable Long id) { ... }
}
// One verb per method — these annotations are NOT stackable on a single method
\`\`\`

\`@GetMapping\` is literally \`@RequestMapping(method = GET)\` under the hood — it's pure sugar, but the sugar is what stops you from exposing unintended verbs. In a code review, a bare \`@RequestMapping("/x")\` on a method is an automatic flag.`,
        followUps: [
          { text: "How do you map multiple paths or HTTP methods on one method?" },
          { text: "How do `consumes` and `produces` attributes work?" },
        ],
      },
      {
        id: 71,
        text: "What is the difference between `@PathVariable` and `@RequestParam`?",
        answer: "**`@PathVariable`** pulls a value **out of the URL path** — `/users/{id}` → `@PathVariable Long id` — so the variable is part of the resource identifier itself.\n\n**`@RequestParam`** pulls a value **from the query string** — `/users?role=ADMIN` → `@RequestParam String role` — used for filtering, sorting, and optional options.\n\nRule of thumb: if it identifies *which* resource, it's a path variable; if it modifies *how* you fetch the collection, it's a request param. Path variables are required by nature; request params can be optional with defaults.",
        explanation: `\`\`\`java
@RestController
@RequestMapping("/users")
public class UserController {

    // @PathVariable — value embedded IN the path
    // GET /users/42
    @GetMapping("/{id}")
    public User getUser(@PathVariable Long id) { ... }   // id = 42

    // @RequestParam — value in the QUERY STRING, optional + defaultable
    // GET /users?role=ADMIN&page=2
    @GetMapping
    public List<User> list(
        @RequestParam(required = false) String role,
        @RequestParam(defaultValue = "0") int page) { ... }
}
\`\`\`

**Trap:** \`/users/{id}\` with \`id = "42"\` works, but a free-text value with slashes (\`/users/a/b\`) breaks the path match entirely — push messy or optional values into \`@RequestParam\`, not the path. Encoded slashes (\`%2F\`) are rejected by Tomcat by default.`,
        followUps: [
          { text: "When is a request param required vs optional, and how do you set defaults?" },
          { text: "How do you bind multiple query params into an object?" },
          { text: "What happens when a path variable contains an encoded slash or space?" },
        ],
      },
      {
        id: 72,
        text: "What is `@RequestBody` and `@ResponseBody` used for?",
        answer: "**`@ResponseBody`** tells Spring to write the method's return value **straight into the HTTP response body** by serializing it (to JSON via Jackson) instead of treating it as a view name.\n\n**`@RequestBody`** does the reverse — it takes the **incoming request body** and deserializes it into a Java object before the method runs.\n\nIn practice you rarely write either by hand: `@RestController` bakes `@ResponseBody` onto every method, and you just add `@RequestBody` to the DTO parameter of a POST/PUT.",
        explanation: `\`\`\`java
// @RequestBody — deserialize the INCOMING JSON into a Java object
// @ResponseBody — serialize the RETURN object into JSON (implicit on @RestController)

@RestController
@RequestMapping("/orders")
public class OrderController {

    @PostMapping
    public OrderDto create(@RequestBody @Valid CreateOrderRequest req) {
        // Jackson converts {"itemId":7,"qty":2} -> CreateOrderRequest
        OrderDto saved = orderService.create(req);
        return saved; // Jackson converts OrderDto -> JSON response body
    }
}
\`\`\`

Both conversions run through an **\`HttpMessageConverter\`** — \`MappingJackson2HttpMessageConverter\` for JSON. The classic mistake is using plain \`@Controller\` for a JSON endpoint and forgetting \`@ResponseBody\`: Spring then treats the returned String as a **view name** and 404s looking for a template. \`@RestController\` exists so you can't make that error.`,
        followUps: [
          { text: "Which `HttpMessageConverter` handles JSON by default?" },
          { text: "What happens if deserialization fails for the request body?" },
        ],
      },
      {
        id: 73,
        text: "How do you handle validation of request payloads in Spring Boot (`@Valid`, `@Validated`)?",
        answer: "You annotate the **DTO fields** with Bean Validation constraints (`@NotBlank`, `@Email`, `@Size`, `@Min`), then add **`@Valid`** next to the `@RequestBody` parameter so Spring validates the object **before** the method runs — violations throw `MethodArgumentNotValidException`, which Spring maps to a **400 Bad Request**.\n\n**`@Validated`** is Spring's extended version that also enables **validation groups** (validate differently on create vs update) and method-level parameter validation.\n\nUse `@Valid` for the common case; reach for `@Validated` only when you need partial/grouped validation.",
        explanation: `\`\`\`java
// WRONG — no validation, garbage data hits your service/DB
public Order create(@RequestBody CreateOrderRequest req) {
    return orderService.save(req); // req.email could be null or ""
}
\`\`\`

\`\`\`java
// GOOD — constraints on the DTO, @Valid triggers them at binding time
public record CreateOrderRequest(
    @NotBlank String email,            // cannot be null or blank
    @Min(1) int quantity,              // must be >= 1
    @Size(max = 500) String note       // capped length
) {}

@RestController
public class OrderController {
    @PostMapping("/orders")
    public Order create(@RequestBody @Valid CreateOrderRequest req) {
        // reaches here ONLY if all constraints pass; otherwise 400
        return orderService.create(req);
    }
}
\`\`\`

**Production note:** catch \`MethodArgumentNotValidException\` in a \`@RestControllerAdvice\` and return a **structured 400** with field-level errors — Spring's default gives a bare "Bad Request" that tells the client nothing about *which* field failed.`,
        followUps: [
          { text: "You put `@Min(1)` on a `@RequestParam` and it's ignored. Why?" },
          { text: "Where do you put constraint annotations — DTO fields or custom validators?" },
          { text: "How do you return a structured 400 response for validation errors?" },
        ],
      },
      {
        id: 74,
        text: "How do you implement global exception handling (`@ControllerAdvice`, `@ExceptionHandler`)?",
        answer: "**`@ExceptionHandler`** goes inside a controller and catches specific exception types thrown by that controller's methods, converting them into an HTTP response.\n\n**`@ControllerAdvice`** lifts that to **application-wide** — a single class whose `@ExceptionHandler` methods catch exceptions from *every* controller, giving you one consistent error-response shape. For REST APIs you use **`@RestControllerAdvice`** (it's `@ControllerAdvice` + `@ResponseBody`) so error bodies serialize to JSON automatically.\n\nSince Spring 6 you don't invent the error body either. **`ProblemDetail`** is the built-in RFC 7807 type — `type`, `title`, `status`, `detail`, `instance` — so a hand-rolled `ErrorResponse` DTO is the 2019 answer.",
        explanation: `\`\`\`java
// WITHOUT global handling — every controller repeats try/catch, inconsistent errors
@PostMapping("/users")
public ResponseEntity<?> create(@RequestBody User u) {   // note the wildcard return type
    try {
        return ResponseEntity.ok(service.create(u));
    } catch (DuplicateEmailException e) {
        // hand-built response, copy-pasted into every controller
        return ResponseEntity.status(409).body(Map.of("error", e.getMessage()));
    }
}
// The ResponseEntity<?> is itself a smell — the method's type no longer
// documents what it returns, because it returns two different shapes.
\`\`\`

\`\`\`java
// GOOD — one @RestControllerAdvice handles it app-wide, returning RFC 7807 ProblemDetail
@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(UserNotFoundException.class)
    public ProblemDetail notFound(UserNotFoundException ex) {
        // Spring 6 builds the {type, title, status, detail} body for you
        ProblemDetail pd = ProblemDetail.forStatusAndDetail(NOT_FOUND, ex.getMessage());
        pd.setTitle("User not found");
        pd.setProperty("userId", ex.getUserId()); // anything extra goes in as a property
        return pd;
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ProblemDetail validation(MethodArgumentNotValidException ex) {
        ProblemDetail pd = ProblemDetail.forStatus(BAD_REQUEST);
        pd.setProperty("errors", fieldErrorsOf(ex)); // structured field errors
        return pd;
    }
}
\`\`\`

This is how production APIs keep error responses **uniform** — every endpoint returns the same shape instead of each controller inventing its own, and it keeps controllers free of try/catch noise. Returning \`ProblemDetail\` also sets the content type to \`application/problem+json\`, which tells a client the body follows RFC 7807 rather than your house format.`,
        followUps: [
          { text: "How do you map domain exceptions to HTTP status codes?" },
          { text: "How much of an exception should the client see?" },
        ],
      },
      {
        id: 75,
        text: "What HTTP status codes are commonly used, and how do you return custom status codes from a controller?",
        answer: "The core set:\n\n- **200 OK** — success\n- **201 Created** — a new resource, with a `Location` header pointing at it\n- **204 No Content** — success, empty body\n- **400 Bad Request** — the client sent garbage, or validation failed\n- **401 Unauthorized** — not logged in\n- **403 Forbidden** — logged in, but not allowed\n- **404 Not Found**\n- **409 Conflict** — duplicate, or a clash with current state\n- **500 Internal Server Error** — your bug\n\nYou return a custom status two ways: **`ResponseEntity.status(code).body(obj)`** for dynamic runtime control, or **`@ResponseStatus(code)`** for a fixed status on a method or exception class.",
        explanation: `\`\`\`java
// ResponseEntity — status decided at RUNTIME, can vary per branch
@PostMapping("/users")
public ResponseEntity<User> create(@RequestBody @Valid CreateUserRequest req) {
    User saved = userService.create(req);
    URI location = URI.create("/users/" + saved.getId());
    return ResponseEntity.created(location).body(saved); // 201 + Location header
}

// @ResponseStatus — FIXED status, good for exception -> status mapping
@ResponseStatus(HttpStatus.NOT_FOUND)
public class UserNotFoundException extends RuntimeException { ... }
// throwing it anywhere now returns 404 automatically
\`\`\`

**Two traps:** (1) returning **200 for a create** is wrong — it should be **201** with a \`Location\` header so the client knows where the new resource lives. (2) **401 vs 403** are misnamed: 401 really means *unauthenticated* ("who are you?"), 403 means *authenticated but not allowed* ("I know you, and no"). Getting these backwards breaks client re-login flows.`,
        followUps: [
          { text: "What is the difference between 401 and 403?" },
          { text: "A request is well-formed but breaks a business rule — 400, 409 or 422?" },
        ],
      },
      {
        id: 76,
        text: "What is `ResponseEntity`, and when would you use it?",
        answer: "**`ResponseEntity<T>`** is a Spring wrapper that lets a controller method set the **HTTP status code, headers, and body together** as the return value, instead of just returning a DTO.\n\nYou use it whenever the response needs a **non-200 status** (201 Created, 409 Conflict), **custom headers** (`Location`, `ETag`, `X-Total-Count`), or conditional logic that picks the status at runtime.\n\nFor a plain successful GET that always returns 200 with a body, returning the DTO directly is enough — don't wrap everything in `ResponseEntity` for no reason.",
        explanation: `\`\`\`java
// OVERKILL — simple 200 GET doesn't need ResponseEntity
@GetMapping("/{id}")
public ResponseEntity<User> get(@PathVariable Long id) {
    return ResponseEntity.ok(userService.findById(id));
}
// Just return the DTO:  public User get(@PathVariable Long id) { return ...; }
\`\`\`

\`\`\`java
// ResponseEntity EARNS its place — needs status + header + body
@PostMapping
public ResponseEntity<User> create(@RequestBody @Valid CreateUserRequest req) {
    User saved = userService.create(req);
    URI location = URI.create("/users/" + saved.getId());
    return ResponseEntity
        .created(location)              // 201 Created
        .header("X-Created-By", "web")  // custom header
        .body(saved);                   // response body
}
\`\`\`

The builder API (\`ResponseEntity.status(409).header(...).body(...)\`, plus shortcuts \`.ok\`, \`.created\`, \`.noContent().build()\`) reads top-down and lets you omit any leg you don't need. Use it when status/headers/conditional behavior matter; use a bare DTO return when they don't.`,
        followUps: [
          { text: "How do you set custom headers with ResponseEntity?" },
          { text: "How do you return a file download with `ResponseEntity`?" },
        ],
      },
      {
        id: 77,
        text: "How do you version REST APIs?",
        answer: "The common strategies are **URI versioning** (`/v1/users`), **header versioning** (`Accept: application/vnd.app.v2+json` or a custom `X-API-Version`), and **query-param versioning** (`/users?version=2`).\n\nURI versioning is the most widely used — it's **explicit, cacheable, and easy to route and document**, at the cost of cluttering the URL. Header versioning keeps URLs clean but is invisible in browsers and harder to test.\n\nVersioning exists so you can ship **breaking changes** without nuking existing clients. It also lets you **deprecate the old version** on a timeline instead of cutting it off overnight.",
        explanation: `\`\`\`java
// URI versioning — most common, explicit, trivial to route
@RestController
@RequestMapping("/api/v1/users")
public class UserV1Controller { ... }

@RestController
@RequestMapping("/api/v2/users")
public class UserV2Controller { ... } // breaking change lives here, v1 keeps working
\`\`\`

\`\`\`java
// Header versioning — clean URLs, but invisible + harder to test/curl
@GetMapping(value = "/users", headers = "X-API-Version=2")
public UserV2 getUserV2() { ... }
\`\`\`

**Deprecation matters more than the strategy:** shipping v2 is the easy half. Retiring v1 without breaking clients you don't control is the part measured in months, and it's what the strategy has to support. Most teams default to URI versioning because its discoverability and caching outweigh the URL clutter.`,
        followUps: [
          { text: "How do you deprecate an old API version safely?" },
          { text: "What are trade-offs of query-param versioning?" },
        ],
      },
      {
        id: 78,
        text: "What is HATEOAS?",
        answer: "**HATEOAS** (Hypermedia As The Engine Of Application State) means a REST response includes **hypermedia links** that tell the client what actions are available next — a `GET /orders/42` response carries `_links` like `self`, `cancel`, `payment`, so the client navigates by following links instead of hard-coding URLs.\n\nThe server drives the state machine by advertising valid transitions, so clients stay decoupled from your URL scheme.\n\nIt's a **level of REST maturity** (Richardson level 3), and in practice most APIs skip full HATEOAS because it adds payload overhead and clients usually hard-code URLs anyway.",
        explanation: `\`\`\`json
// A HATEOAS response — data + links to valid next actions
{
  "id": 42,
  "status": "PENDING",
  "total": 99.99,
  "_links": {
    "self":   { "href": "/orders/42" },
    "cancel": { "href": "/orders/42/cancel", "method": "POST" },
    "pay":    { "href": "/orders/42/payment",  "method": "POST" }
  }
}
// Notice the 'cancel' link only appears because status is PENDING —
// the server controls what the client can do next based on state.
\`\`\`

In Spring you build these with **Spring HATEOAS** (\`EntityModel\`, \`WebMvcLinkBuilder\`): \`linkTo(methodOn(OrderController.class).cancel(id)).withRel("cancel")\`. It's worth the complexity for **public, discoverable APIs** where you want to evolve URLs without breaking clients. For internal microservices where one team owns both sides, hand-coded links (or none) are simpler — the boilerplate rarely pays off.`,
        followUps: [
          { text: "When is HATEOAS worth the extra complexity?" },
        ],
      },
      {
        id: 79,
        text: "How do you handle CORS in a Spring Boot application?",
        answer: "**CORS** (Cross-Origin Resource Sharing) is the browser's security mechanism that blocks a web page from calling an API on a different origin unless the API **explicitly allows it** via `Access-Control-Allow-*` response headers.\n\nIn Spring Boot you enable it three ways: **`@CrossOrigin`** on a single controller/method, **global CORS** via `WebMvcConfigurer.addCorsMappings()`, or — if **Spring Security** is present — inside the `SecurityFilterChain` with `http.cors(...)`.\n\nThe critical gotcha: with Spring Security on the classpath, it owns the filter chain and **overrides the MVC CORS config**. Configure CORS inside the security chain or it silently breaks in production.\n\nThe other one that bites: `allowedOrigins(\"*\")` together with `allowCredentials(true)` is **rejected at startup** — use `allowedOriginPatterns` instead.",
        explanation: `\`\`\`java
// Per-controller — quick for one endpoint
@CrossOrigin(origins = "https://app.example.com")
@GetMapping("/users/{id}")
public User getUser(@PathVariable Long id) { ... }
\`\`\`

\`\`\`java
// Global — one place, applies app-wide
@Configuration
public class CorsConfig implements WebMvcConfigurer {
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**")
            .allowedOrigins("https://app.example.com")
            .allowedMethods("GET", "POST", "PUT", "DELETE")
            .allowedHeaders("*")
            .allowCredentials(true);
    }
}
\`\`\`

**The trap that bites in prod:** with Spring Security on the classpath, the MVC config above is **ignored** — you must wire a \`CorsConfigurationSource\` bean and call \`http.cors(Customizer.withDefaults())\` inside \`SecurityFilterChain\`. Forgetting this is the #1 cause of "CORS works locally, breaks deployed." Also remember browsers send an **OPTIONS preflight** before non-simple requests, so your CORS config must allow OPTIONS, not just the real verb.`,
        followUps: [
          { text: "What is a preflight request, and which HTTP method is used?" },
          { text: "Which headers actually drive the browser's CORS decision?" },
        ],
      },
      {
        id: 80,
        text: "What is content negotiation in Spring MVC?",
        answer: "**Content negotiation** is how Spring decides the **response format** (JSON, XML, etc.) based on what the client asks for — primarily the **`Accept`** request header — and, on the input side, how it reads the request body based on **`Content-Type`**.\n\nThe client sends `Accept: application/xml`, Spring picks the `HttpMessageConverter` that produces XML, serializes the response, and if no converter can satisfy the requested type it returns **406 Not Acceptable**.\n\nMost REST APIs just default to JSON and ignore this, but it's the mechanism behind serving the same endpoint in multiple formats.",
        explanation: `\`\`\`java
// Same endpoint, different response format based on the Accept header
@GetMapping(value = "/users/{id}", produces = {"application/json", "application/xml"})
public User getUser(@PathVariable Long id) {
    return userService.findById(id); // same object, converter picks format
}
// Accept: application/json  -> Jackson JSON converter
// Accept: application/xml   -> Jackson XML converter (needs jackson-dataformat-xml)
// Accept: text/csv          -> 406 Not Acceptable (no matching converter)
\`\`\`

\`consumes\` does the mirror for the **request** — \`@PostMapping(consumes = "application/json")\` rejects a non-JSON body with **415 Unsupported Media Type**. Historically Spring also supported path-extension (\`/users.json\`) and query-param (\`?format=xml\`) negotiation, but **path-extension is deprecated** for security (RFD attacks) and off by default. The modern, safe approach is **\`Accept\` header only**.`,
        followUps: [
          { text: "How can path extensions or query params participate in negotiation?" },
          { text: "How do you support both JSON and XML for the same endpoint?" },
        ],
      },
      {
        id: 81,
        text: "How do you document REST APIs (Swagger/OpenAPI)?",
        answer: "You document REST APIs with **OpenAPI 3** (the current standard, formerly Swagger), and in Spring Boot you integrate it via **`springdoc-openapi`**, which auto-generates an OpenAPI spec at `/v3/api-docs` and a **Swagger UI** at `/swagger-ui.html` by introspecting your `@RestController` classes — zero config.\n\nYou enrich it with annotations like `@Operation`, `@ApiResponse`, and `@Schema` to describe endpoints, parameters, and DTO fields.\n\nThis gives clients live, interactive docs and a machine-readable contract without hand-writing a spec.",
        explanation: `\`\`\`java
// springdoc-openapi picks this up automatically; annotations add detail
@Operation(summary = "Get user by ID", description = "Returns a single user")
@ApiResponses({
    @ApiResponse(responseCode = "200", description = "User found"),
    @ApiResponse(responseCode = "404", description = "User not found")
})
@GetMapping("/users/{id}")
public User getUser(
    @Parameter(description = "User ID") @PathVariable Long id) {
    return userService.findById(id);
}
\`\`\`

\`\`\`xml
<!-- Spring Boot 3: add this dependency, that's the whole setup -->
<dependency>
    <groupId>org.springdoc</groupId>
    <artifactId>springdoc-openapi-starter-webmvc-ui</artifactId>
    <version>2.5.0</version>
</dependency>
\`\`\`

**Naming note:** Swagger was the original spec (2.0); it was donated to the Linux Foundation and renamed **OpenAPI**, with OpenAPI 3 as the successor. "Swagger UI" survives as the viewer, but the spec you author today is OpenAPI 3. The older **springfox** library is unmaintained and doesn't support Spring Boot 3 — use **springdoc**. In production, lock down or remove the UI so you don't hand attackers a map of every endpoint.`,
        followUps: [
          { text: "What is the difference between Swagger and OpenAPI 3?" },
          { text: "How do you document auth (Bearer JWT) in OpenAPI?" },
        ],
      },
      {
        id: 82,
        text: "What is the difference between PUT, PATCH, and POST?",
        answer: "**POST** creates a new resource where the **server assigns the ID** (`POST /users` → new user) and is **not idempotent** — repeating it creates duplicates.\n\n**PUT** does a **full replacement** of a resource at a known URL (`PUT /users/1` with the whole object) and **is idempotent** — calling it N times leaves the same state.\n\n**PATCH** does a **partial update** — you send only the fields that change (`PATCH /users/1` with `{email}`), and it's *not guaranteed* idempotent.\n\nThe core divider is **idempotency and full-vs-partial**, not just the verb.",
        explanation: `\`\`\`java
// POST — server assigns ID, NOT idempotent (repeat = duplicate)
@PostMapping("/users")
public User create(@RequestBody CreateUserRequest req) {
    return userService.create(req); // POST /users twice -> two users
}

// PUT — full replace at known URL, IDEMPOTENT
@PutMapping("/users/{id}")
public User replace(@PathVariable Long id, @RequestBody User fullUser) {
    return userService.replace(id, fullUser); // omitted fields get cleared
}

// PATCH — partial update, send only what changed
@PatchMapping("/users/{id}")
public User patch(@PathVariable Long id, @RequestBody Map<String, Object> changes) {
    return userService.partialUpdate(id, changes); // only touched fields change
}
\`\`\`

**Two traps:** (1) If you implement PUT as a *partial* update you break its idempotency contract and confuse clients — pick one semantics per endpoint and stick to it. (2) POST isn't *forced* to be non-idempotent: with an **idempotency key** header (Stripe's pattern), a retried POST returns the cached result instead of creating a duplicate, which is how you make payment endpoints safe to retry.`,
        followUps: [
          { text: "Which methods are idempotent, and why does that matter?" },
          { text: "Is POST always non-idempotent? What about create-with-client-id patterns?" },
        ],
      },
      {
        id: 83,
        text: "How do you implement pagination and sorting in a REST API?",
        answer: "You expose pagination through **query parameters** — `?page=0&size=20&sort=createdAt,desc` — and in Spring Boot you accept a **`Pageable`** parameter in the controller, which Spring binds automatically from those params and passes straight to `repository.findAll(pageable)`, returning a **`Page<T>`** with the content, total element count, total pages, and current page info.\n\nThe response should include the **content array plus totalElements and page metadata** so the client can render \"page 3 of 12\" and build navigation.\n\nThe non-negotiable rule: **never expose an unbounded list endpoint** — always cap the page size so a `?size=1000000` can't OOM your DB.",
        explanation: `\`\`\`java
// WRONG — unbounded SELECT *, will OOM on a big table
@GetMapping("/orders")
public List<Order> all() { return orderRepo.findAll(); }
\`\`\`

\`\`\`java
// GOOD — Pageable binds ?page=0&size=20&sort=createdAt,desc automatically
@GetMapping("/orders")
public Page<Order> list(@PageableDefault(size = 20, sort = "createdAt") Pageable pageable) {
    return orderRepo.findAll(pageable); // content + totalElements + totalPages
}
\`\`\`

\`Page<T>\` serializes to \`{ content: [...], totalElements: 105, totalPages: 6, number: 0, size: 20 }\`. The \`@PageableDefault\` caps the defaults, but you should also **clamp the max size** so a malicious or buggy \`?size=999999\` is rejected — Spring Boot lets you set \`spring.data.web.pageable.max-page-size\`. For large exports that clients paginate through, pair this with a streaming or cursor-based endpoint rather than deep \`page=5000\` offsets, which get slow on most DBs.`,
        followUps: [
          { text: "Why does `?page=5000` get slow, and what do you use instead?" },
          { text: "How do you prevent expensive unbounded list endpoints?" },
        ],
      },
    ],
  },
  {
    id: "spring-data-jpa",
    title: "Spring Data JPA / Hibernate",
    description:
      "Repositories, relationships, transactions, caching, N+1, and database performance.",
    icon: "🗄️",
    questions: [
      {
        id: 84,
        text: "What is Spring Data JPA, and how does it simplify database access?",
        answer:
          "**Spring Data JPA** is a Spring layer over JPA that **generates the repository implementation at startup** from an interface you declare — you write no DAO code. You extend `JpaRepository<User, Long>` and get `save`, `findById`, and paging for free.\n\nIt also **derives queries from method names** — `findByEmailAndActiveTrue` becomes a real query with no body written.\n\nThat covers most of what an app needs, but not everything. Once the derived name gets unreadable, you switch to `@Query` and write the JPQL yourself. And if you only need three columns out of a twenty-column entity, a **DTO projection** keeps you from loading whole objects you'll throw away.",
        explanation: `The pain without it is real. Plain JPA looks like this:

\`\`\`java
// WITHOUT Spring Data JPA — every DAO is 50+ lines like this
public class UserDao {
    @PersistenceContext
    private EntityManager em;

    public User findById(Long id) {
        return em.find(User.class, id); // manual
    }

    public void save(User user) {
        em.persist(user); // manage transaction manually
    }
}
\`\`\`

With Spring Data JPA, that entire class is replaced by:

\`\`\`java
// Spring generates the implementation at startup via JDK proxy
public interface UserRepository extends JpaRepository<User, Long> {
    // findById, save, findAll, delete — all already there
    Optional<User> findByEmail(String email); // derived query — no SQL needed
}
\`\`\`

**Production context:** In a real service you get 80% of your DB access needs from the interface alone. The generated proxy delegates to \`SimpleJpaRepository\`, which wraps \`EntityManager\` internally. You still drop to \`@Query\` or \`EntityManager\` for complex joins or bulk operations — Spring Data doesn't replace SQL, it eliminates the scaffolding around it.`,
        followUps: [
          { text: "How do repository interfaces get implemented at runtime?" },
          { text: "What is the difference between Spring Data JPA and JDBC Template?" },
        ],
      },
      {
        id: 85,
        text: "What is the difference between JPA, Hibernate, and Spring Data JPA?",
        answer:
          "**JPA** is a specification — `jakarta.persistence.*`, an interface contract for ORM in Java with no code that actually runs. **Hibernate** is the implementation behind it, and it does the real work: generating the SQL, managing the session, handling the caching. **Spring Data JPA** sits one layer above and writes your repositories for you, driving Hibernate through the JPA API.\n\nSo the annotations on your entity come from JPA, the SQL in your logs comes from Hibernate, and the `UserRepository` interface with no body comes from Spring Data.\n\nSwap Hibernate for EclipseLink and your `@Entity` classes don't change — that's the whole point of coding against the spec.",
        explanation: `Think of it as three layers:

\`\`\`
Your Code
    ↓
Spring Data JPA   ← generates repos, handles transactions, derives queries
    ↓
JPA API           ← standard interfaces: EntityManager, @Entity, JPQL
    ↓
Hibernate         ← implements JPA: translates JPQL → SQL, manages sessions
    ↓
JDBC / DB Driver  ← actual DB connection
    ↓
Database
\`\`\`

A real example: you call \`userRepository.findByEmail(email)\`. **Spring Data JPA** parses the method name and builds a JPQL query. That JPQL goes into **JPA's** \`EntityManager.createQuery()\`. **Hibernate** then translates it to \`SELECT ... FROM users WHERE email = ?\` and fires it through JDBC.

**The vendor lock-in question comes up in interviews:** If you stick to standard JPA annotations (\`@Entity\`, \`@OneToMany\`) and avoid Hibernate-specific extensions (\`@BatchSize\`, \`@Cache\`), you could theoretically swap Hibernate for EclipseLink. Nobody does this in practice, but understanding the layer separation matters when you read docs and trace bugs.`,
        followUps: [
          { text: "Is Hibernate a JPA implementation or a separate API?" },
          { text: "Can you use Hibernate features that are not in the JPA standard?" },
        ],
      },
      {
        id: 86,
        text: "What is the difference between `JpaRepository`, `CrudRepository`, and `PagingAndSortingRepository`?",
        answer:
          "`CrudRepository` is the base — 7 methods, `save`, `findById`, `delete` and the rest. `PagingAndSortingRepository` adds `findAll(Pageable)` and `findAll(Sort)` on top of that. One thing catches people out: since **Spring Data 3.0** it no longer extends `CrudRepository`, so the two are separate branches now.\n\n`JpaRepository` extends both and adds the JPA-specific pieces — `flush`, `saveAndFlush`, batch deletes — and it returns `List<T>` where the others return `Iterable<T>`.\n\nIn practice you extend `JpaRepository` and stop thinking about it. You'll want paging or a flush eventually, and switching the interface later means touching every caller that relied on `Iterable`.",
        explanation: `The hierarchy:

\`\`\`
Spring Data 3.x (Boot 3) — these two are now SEPARATE branches:

CrudRepository              → save, findById, findAll (Iterable), delete, count
PagingAndSortingRepository  → findAll(Pageable), findAll(Sort)
                              (no longer extends CrudRepository as it did in 2.x)

ListCrudRepository / ListPagingAndSortingRepository
                            → same, but List<T> instead of Iterable<T>
    ↑
JpaRepository               → extends BOTH List* variants, and adds
                              saveAll, flush, saveAndFlush, deleteAllInBatch,
                              getReferenceById
                              (getById and deleteInBatch are deprecated —
                               don't reach for them in a Boot 3 codebase)
\`\`\`

The \`Iterable<T>\` vs \`List<T>\` difference is the most annoying in practice:

\`\`\`java
// CrudRepository — you get Iterable, can't call .size() or .get(0)
Iterable<User> users = userRepo.findAll();
users.forEach(...); // only this

// JpaRepository — you get List, immediately usable
List<User> users = userRepo.findAll();
users.size();      // works
users.get(0);      // works
users.stream()...  // works
\`\`\`

**The production warning:** \`JpaRepository\` exposes \`deleteAll()\` and \`deleteAllInBatch()\` as public methods. Those wipe the entire table. Never expose them through a service interface without an explicit admin guard. Restrict at the service layer — don't count on callers being careful.`,
        followUps: [
          { text: "What is the difference between `findById` and `getReferenceById`?" },
          { text: "Should you expose delete-all methods on production repositories?" },
        ],
      },
      {
        id: 87,
        text: "How do you write custom queries using `@Query`?",
        answer:
          "`@Query` lets you write the query yourself, right on the repository method, instead of having Spring derive it from the method name. You reach for it when the derived name would be unreadable, or when the query needs a join, a subquery, or an aggregation that no method name can express.\n\nIt takes **JPQL** by default, or real SQL if you set `nativeQuery = true`.\n\nThere's one rule you can't skip. Any query that writes needs both **`@Modifying`** and **`@Transactional`** on it. Leave `@Modifying` off and Hibernate tries to run your `UPDATE` through `executeQuery` and throws; leave the transaction off and you get `TransactionRequiredException` instead.",
        explanation: `\`\`\`java
public interface OrderRepository extends JpaRepository<Order, Long> {

    // JPQL — references entity class name and field names, not table/column
    @Query("SELECT o FROM Order o WHERE o.user.id = :userId AND o.status = :status")
    List<Order> findByUserAndStatus(
        @Param("userId") Long userId,
        @Param("status") OrderStatus status
    );

    // Native SQL — raw SQL, ties you to schema column names
    @Query(value = "SELECT * FROM orders WHERE created_at > NOW() - INTERVAL '7 days'",
           nativeQuery = true)
    List<Order> findLastWeek();

    // Modifying query MUST have both @Modifying and @Transactional
    @Modifying
    @Transactional
    @Query("UPDATE Order o SET o.status = :status WHERE o.id = :id")
    int updateStatus(@Param("id") Long id, @Param("status") OrderStatus status);
}
\`\`\`

**The stale cache trap:** After a \`@Modifying\` bulk UPDATE, the first-level cache (session cache) still holds the old entity state. Add \`@Modifying(clearAutomatically = true)\` so Hibernate evicts cached entities after the update — otherwise \`findById\` in the same transaction returns the old value from cache, not the updated DB value. This bites people in tests constantly.`,
        followUps: [
          { text: "What is the difference between JPQL and native SQL in `@Query`?" },
          { text: "How do you use named parameters vs positional parameters?" },
          { text: "What do you have to get right when running a bulk `@Modifying` update?" },
        ],
      },
      {
        id: 88,
        text: "What is the difference between derived query methods and `@Query` annotated methods?",
        answer:
          "**Derived methods** get their JPQL generated by Spring from the method name at startup — `findByEmailAndStatus` becomes `WHERE email = ? AND status = ?` with nothing for you to write.\n\n**`@Query` methods** are the opposite: you write the JPQL or SQL explicitly and Spring just runs it.\n\nThe line between them is about complexity, not preference. Derived names are fine for one or two conditions. Once you need a join, a subquery, or an aggregation, the method name grows into forty characters nobody can read — that's the point where you switch to `@Query`.",
        explanation: `Spring's name parser works by stripping the prefix (\`findBy\`, \`existsBy\`, \`countBy\`, \`deleteBy\`) and tokenizing the rest using camelCase boundaries against your entity's field names:

\`\`\`java
// These are all valid derived method names:
Optional<User> findByEmail(String email);
List<User> findByStatusAndDepartmentName(String status, String dept); // dept.name via traversal
List<Order> findByCreatedAtAfterOrderByTotalDesc(Instant after);
boolean existsByEmail(String email);
long countByStatus(OrderStatus status);
\`\`\`

The trap — when names get ridiculous:

\`\`\`java
// DON'T — unreadable, fragile, breaks if you rename a field
List<Order> findByUserEmailAndStatusInAndCreatedAtAfterAndTotalGreaterThanOrderByCreatedAtDesc(
    String email, List<OrderStatus> statuses, Instant from, BigDecimal minTotal);

// DO — use @Query for anything this complex
@Query("SELECT o FROM Order o JOIN o.user u " +
       "WHERE u.email = :email AND o.status IN :statuses " +
       "AND o.createdAt > :from AND o.total > :minTotal " +
       "ORDER BY o.createdAt DESC")
List<Order> findComplexOrders(...);
\`\`\`

**Key advantage of derived methods:** errors are caught at **startup**, not at runtime. If you typo \`findByEmial\`, Spring fails to start with \`PropertyReferenceException: No property 'emial' found\`. That's a free compile-time-equivalent check.`,
        followUps: [
          { text: "When does a derived method name become ambiguous?" },
          { text: "How does Spring parse method names like `findByEmailAndStatus`?" },
          { text: "Can derived queries support pagination and sorting?" },
        ],
      },
      {
        id: 89,
        text: "What is the N+1 select problem, and how do you solve it?",
        answer:
          "N+1 is when loading a list of N entities fires N **extra queries** to load their associations — one query for the parent list, then one more per row for the children. Load 50 orders, touch `order.getItems()` in a loop, and you've sent 51 queries instead of 1. Nothing throws an error, it's just slow, which is exactly why it ships to production.\n\nThe fix depends on what you actually need. If you want the full entities, **`JOIN FETCH`** or **`@EntityGraph`** pulls parent and children in a single query. If it's a read-only endpoint that needs three columns, a **DTO projection** is cheaper still.\n\nAnd **`@BatchSize`** is the low-effort option when you can't restructure the query — it turns N queries into N divided by the batch size.",
        explanation: `The classic scenario: you load orders with their items.

\`\`\`java
// LAZY is the default on @OneToMany — looks innocent
List<Order> orders = orderRepo.findAll(); // SELECT * FROM orders (1 query)
for (Order o : orders) {
    o.getItems().size(); // SELECT * FROM items WHERE order_id = ? — fires N times!
}
// 50 orders = 51 queries total. N+1.
\`\`\`

Three fixes, cheapest last:

\`\`\`java
// FIX 1 — JOIN FETCH in JPQL: one query, full control over what's loaded
@Query("SELECT DISTINCT o FROM Order o JOIN FETCH o.items")
List<Order> findAllWithItems();
// Single query: SELECT o.*, i.* FROM orders o JOIN items i ON i.order_id = o.id

// FIX 2 — @EntityGraph: same JOIN FETCH, cleaner repository signature
@EntityGraph(attributePaths = {"items"})
List<Order> findAll(); // Spring generates the fetch join for you

// FIX 3 — @BatchSize on the association: no query changes at all
@OneToMany
@BatchSize(size = 25) // 50 orders = 2 IN-clause queries instead of 50
private List<Item> items;
// Or globally: hibernate.default_batch_fetch_size=25
\`\`\`

For a **read-only endpoint** none of these are ideal — if you only need an order id and a total, a DTO projection (\`SELECT new com.app.OrderSummary(o.id, o.total) FROM Order o\`) skips entity hydration entirely and never touches the association.

**Detection:** enable \`spring.jpa.show-sql=true\` and count the \`SELECT\` statements in logs. In tests, use Hypersistence Optimizer or assert query count with p6spy. Never discover N+1 in production — it's a perf cliff, not a gradual degradation.`,
        followUps: [
          { text: "How would you detect N+1 in logs or with a tool?" },
          { text: "`JOIN FETCH`, `@EntityGraph`, `@BatchSize` — when does each one break?" },
          { text: "When is DTO projection a better fix than eager fetching?" },
        ],
      },
      {
        id: 90,
        text: "What is the difference between `FetchType.LAZY` and `FetchType.EAGER`?",
        answer:
          "`FetchType.LAZY` tells Hibernate to load the association **only when you touch it** — it puts a proxy in the field and fires the SELECT on first access. `FetchType.EAGER` loads it **immediately with the parent**, adding a join or an extra select to every single load whether you use the data or not.\n\nThe defaults are what catch people out. `@ManyToOne` and `@OneToOne` are EAGER, while `@OneToMany` and `@ManyToMany` are LAZY. So one `findById` on an entity with three `@ManyToOne` fields quietly drags three more tables along with it.\n\nOverride `@ManyToOne` to `LAZY` in almost every case, then pull in what you actually need with a `JOIN FETCH` on the query that needs it.",
        explanation: `The EAGER trap in practice:

\`\`\`java
@Entity
public class Order {
    @ManyToOne(fetch = FetchType.EAGER) // default — dangerous
    private User user;
}

// Even this innocent call JOINs the user table:
Order order = orderRepo.findById(id).get();
// SQL: SELECT o.*, u.* FROM orders o JOIN users u ON u.id = o.user_id WHERE o.id = ?
// You just loaded User even though you only wanted the Order's total.
\`\`\`

Change to LAZY everywhere and load what you need explicitly:

\`\`\`java
@Entity
public class Order {
    @ManyToOne(fetch = FetchType.LAZY) // explicitly lazy
    private User user;
}

// Now the JOIN doesn't happen unless you access order.getUser()
// And if you DO need the user, JOIN FETCH in the query:
@Query("SELECT o FROM Order o JOIN FETCH o.user WHERE o.id = :id")
Optional<Order> findWithUser(@Param("id") Long id);
\`\`\`

**LazyInitializationException:** the price of LAZY is that you get a proxy. Access \`order.getUser().getName()\` outside an open session (after the \`@Transactional\` method returns) and Hibernate throws \`LazyInitializationException\` — the session is closed, it can't issue the SELECT. Solution: load what you need inside the transaction.`,
        followUps: [
          { text: "Why is EAGER the harder default to live with?" },
          { text: "What is `LazyInitializationException`, and when does it occur?" },
          { text: "How do Open Session In View (OSIV) settings affect lazy loading?" },
        ],
      },
      {
        id: 91,
        text: "Explain the different types of entity relationships (`@OneToOne`, `@OneToMany`, `@ManyToOne`, `@ManyToMany`).",
        answer:
          "`@OneToOne` means one row maps to exactly one other row, like `User` and `UserProfile`. `@OneToMany` and `@ManyToOne` are the two halves of a parent-child pair — an `Order` has many `OrderItem`s, and each item points back with a `@ManyToOne`. The FK column always lives on the child, the `@ManyToOne` side.\n\n`@ManyToMany` is when both sides can have many of the other, like `Student` and `Course`, and it needs a join table to hold the pairs.\n\nThe part that actually bites you is the **owning side**. The side without `mappedBy` is the one Hibernate reads when it writes the FK. Add the item to `order.getItems()`, never set `item.setOrder(order)`, and the row saves with a null FK — the link is silently lost.",
        explanation: `The bidirectional “mappedBy” confusion is the #1 relationship mistake:

\`\`\`java
@Entity
public class Order {
    @Id Long id;

    // owning side — no mappedBy, holds the user_id FK in the orders table
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    // INVERSE side — mappedBy = "order" means "Item.order owns this relationship".
    // Hibernate reads Item.order to write the FK; it never writes anything from this list.
    @OneToMany(mappedBy = "order", cascade = CascadeType.PERSIST)
    private List<Item> items = new ArrayList<>();
}

@Entity
public class Item {
    @ManyToOne // owning side — holds the FK order_id
    @JoinColumn(name = "order_id")
    private Order order;
}
\`\`\`

The mistake people make:

\`\`\`java
// BAD — only sets the inverse side
order.getItems().add(item); // sets Order.items list
// But item.order is null — Hibernate reads the OWNING side to write the FK!
// Result: order_id is NULL in the DB

// GOOD — always set both sides
item.setOrder(order);       // owning side — FK is written
order.getItems().add(item); // inverse side — in-memory consistency
\`\`\`

**Many-to-many with extra columns:** standard \`@ManyToMany\` can't hold extra columns on the join table. Create an explicit entity (\`StudentCourse\` with \`enrolledAt\`, \`grade\`) with \`@ManyToOne\` to each side instead.`,
        followUps: [
          { text: "How do you keep both sides of a bidirectional relationship in sync?" },
          { text: "How do you model a many-to-many that needs extra columns on the join?" },
          { text: "What cascade types are commonly used, and when is `CascadeType.ALL` dangerous?" },
        ],
      },
      {
        id: 92,
        text: "What is the Hibernate first-level and second-level cache?",
        answer:
          "The **first-level cache** is the Hibernate session cache. It's always on, you can't switch it off, and it lives for exactly one transaction. Call `findById(1)` twice in the same `@Transactional` method and the second call never reaches the DB — you get the same object instance back.\n\nThe **second-level cache** is opt-in, shared across sessions and requests for the whole app, and it needs a provider like Ehcache or Redis wired in.\n\nWhat really separates them is who owns the staleness. L1 can't go stale, because it dies with the transaction. L2 can, so the moment you turn it on you're responsible for evicting entries when another instance updates that row.",
        explanation: `First-level cache — works silently for you:

\`\`\`java
@Transactional
public void processOrder(Long id) {
    Order o1 = orderRepo.findById(id).get(); // SELECT fires
    Order o2 = orderRepo.findById(id).get(); // returns cached instance, no SELECT
    System.out.println(o1 == o2); // true — same object reference
} // session closes, L1 cache cleared
\`\`\`

Second-level cache — explicit setup:

\`\`\`java
// 1. application.properties
// spring.jpa.properties.hibernate.cache.use_second_level_cache=true
// spring.jpa.properties.hibernate.cache.region.factory_class=org.hibernate.cache.jcache.JCacheRegionFactory

// 2. annotate the entity
@Entity
@Cache(usage = CacheConcurrencyStrategy.READ_WRITE) // must annotate each entity
public class Product { ... }

// Now findById(productId) for the same product ID across different sessions
// hits the L2 cache instead of the DB.
\`\`\`

**The staleness trap:** L2 cache with \`READ_WRITE\` strategy handles concurrent updates safely via versioning. But if you bypass Hibernate (bulk SQL update, Flyway script, external service writes), the L2 cache is **never invalidated** and serves stale data until TTL expires. The query cache has the same issue — a table write invalidates all cached queries for that entity type, which can be worse than no cache at all on write-heavy tables.`,
        followUps: [
          { text: "A batch job loads 100,000 rows in one transaction and runs out of memory. Why?" },
          { text: "How do you enable and configure the second-level cache?" },
          { text: "What is query cache, and when is it useful?" },
        ],
      },
      {
        id: 93,
        text: "What is the difference between `save()`, `saveAndFlush()`, and `persist()`?",
        answer:
          "Spring Data's `save()` isn't purely an insert — it checks the ID and calls `persist()` when the entity is new, `merge()` when it already has one.\n\n`saveAndFlush()` does the same thing and then **flushes**, pushing the SQL to the DB instead of waiting for commit. You need that when the very next line runs a query that has to see the write.\n\n`persist()` is raw JPA and only accepts a **new transient entity** — hand it something detached and it throws.\n\nThe trap is in `merge()`. It doesn't manage the object you passed in — it copies the state into a managed instance and returns *that*. Keep the return value, or every change you make afterwards goes nowhere.",
        explanation: `The merge return value trap is real:

\`\`\`java
// WRONG — user is detached, save() calls merge(), but you keep using the argument
User user = new User();
user.setId(existingId); // detached entity
repo.save(user);
user.setName("updated"); // user is NOT managed — this change goes nowhere

// RIGHT — always use the returned instance
User managed = repo.save(user); // returns the managed copy
managed.setName("updated");     // this is on the managed entity
\`\`\`

When to use \`saveAndFlush()\`:

\`\`\`java
@Transactional
public void auditAndQuery() {
    User user = repo.save(newUser);
    // At this point the INSERT is NOT in the DB yet — just in session

    // If we now run a native SQL query, it won't see the uncommitted row
    // Fix: flush first
    repo.flush();  // or use saveAndFlush() above

    // Now the native query sees the new row
    List<User> all = jdbcTemplate.query("SELECT * FROM users", ...);
}
\`\`\`

**In tests:** \`saveAndFlush()\` is the right call when you want to verify the DB state immediately (e.g., test that a \`@Column(unique = true)\` constraint fires). Without flush, the INSERT may not have hit the DB when your assertion runs.`,
        followUps: [
          { text: "Why would `save()` fire a SELECT before it inserts?" },
          { text: "When do you need `flush` before a subsequent query in the same transaction?" },
        ],
      },
      {
        id: 94,
        text: "What is optimistic locking vs pessimistic locking?",
        answer:
          "**Optimistic locking** assumes collisions are rare, so nothing blocks. You add a `@Version` column, and at commit Hibernate checks the version still matches the one you read. If someone else committed first the version has moved, you get an `OptimisticLockException`, and the caller retries the whole operation.\n\n**Pessimistic locking** assumes collisions are common, so it takes a real database lock up front with `SELECT ... FOR UPDATE` and makes every other writer wait.\n\nOptimistic is the right default for a web app, where two users editing the same row in the same instant is unusual. Go pessimistic when a retry isn't acceptable or contention is constant — decrementing the last item in stock, or moving money between two accounts.",
        explanation: `Optimistic locking with \`@Version\`:

\`\`\`java
@Entity
public class Product {
    @Id Long id;
    String name;
    int stock;

    @Version  // Hibernate adds WHERE version = ? AND id = ? on every UPDATE
    Long version;
}

// Transaction A reads Product (version=1), Transaction B reads Product (version=1)
// Transaction A saves (version bumps to 2) — succeeds
// Transaction B tries to save — WHERE version=1 matches 0 rows
// Hibernate throws OptimisticLockException — rollback, show conflict to user
\`\`\`

Pessimistic locking — when you need a hard lock:

\`\`\`java
// You declare the lock on the repository method — there is no
// findById(id, LockModeType) overload on JpaRepository
public interface SeatRepository extends JpaRepository<Seat, Long> {

    @Lock(LockModeType.PESSIMISTIC_WRITE)   // adds FOR UPDATE to the SELECT
    @Query("SELECT s FROM Seat s WHERE s.id = :id")
    Optional<Seat> findByIdForUpdate(@Param("id") Long id);
}

@Transactional  // REQUIRED — no transaction means no lock
public void reserveSeat(Long seatId) {
    // SELECT * FROM seats WHERE id = ? FOR UPDATE
    // Other transactions block here until this transaction commits
    Seat seat = seatRepo.findByIdForUpdate(seatId).orElseThrow();

    if (!seat.isAvailable()) throw new SeatTakenException();
    seat.setAvailable(false); // guaranteed: no one else sees it as available
}
// Lock released on commit — hold it for as short a window as possible
\`\`\`

**Catch 409, not 500:** When optimistic lock fails, return HTTP 409 Conflict with a \"please refresh and retry\" message. Letting it surface as a 500 makes it look like a server bug when it's actually a concurrency signal.`,
        followUps: [
          { text: "How does `@Version` implement optimistic locking?" },
          { text: "How should the API respond when an optimistic lock fails?" },
          { text: "What does a pessimistic lock cost you in production?" },
        ],
      },
      {
        id: 95,
        text: "How do you manage database transactions in Spring (`@Transactional`)?",
        answer:
          "`@Transactional` wraps the method in a database transaction using Spring AOP — it opens the transaction before the method runs, commits when it returns, and rolls back if a **runtime exception** escapes.\n\nIt only works through a **Spring proxy**, which means the call has to arrive from outside the bean. Call `this.saveOrder()` from another method in the same class and the annotation does nothing at all — no error, no transaction, just silently unwrapped. Same for private methods, because the proxy can't override them.\n\nPut the boundary at the **service layer**, where one method is one unit of work. A controller is too early and a repository is too fine-grained — per-repository transactions commit each save separately, so a half-failed operation leaves half the rows written.",
        explanation: `The proxy trap — the #1 \`@Transactional\` bug:

\`\`\`java
@Service
public class OrderService {

    public void placeOrder(OrderDto dto) {
        // This method is NOT @Transactional
        // It calls saveItems() via 'this' — bypasses the Spring proxy
        this.saveItems(dto.getItems()); // NO TRANSACTION — this is a self-call
    }

    @Transactional // silently ignored for self-calls
    public void saveItems(List<Item> items) {
        itemRepo.saveAll(items);
    }
}
\`\`\`

Fix: move to a separate bean or use the outer method as the transaction boundary:

\`\`\`java
@Service
public class OrderService {

    @Transactional // wraps the whole unit of work
    public void placeOrder(OrderDto dto) {
        Order order = orderRepo.save(toEntity(dto));
        itemRepo.saveAll(toItemEntities(dto.getItems(), order));
        paymentRepo.save(toPaymentEntity(dto, order));
        // all three succeed or all roll back — one transaction
    }
}
\`\`\`

**Rollback defaults:** Spring rolls back on \`RuntimeException\` (unchecked) and commits on checked exceptions. So a \`SQLException\` (checked) by default does NOT roll back. Always specify \`rollbackFor = Exception.class\` or use unchecked exceptions for domain failures.`,
        followUps: [
          { text: "What is the default rollback policy for runtime vs checked exceptions?" },
          { text: "A `@Transactional` method called from the same class starts no transaction. How do you fix it?" },
          { text: "Repositories are already transactional — so why put `@Transactional` on the service?" },
        ],
      },
      {
        id: 96,
        text: "What is transaction propagation, and what are the different propagation types?",
        answer:
          "Propagation decides what happens when a `@Transactional` method gets called while a transaction is already running. **`REQUIRED`** is the default — it joins the existing transaction, or starts one if there isn't any. That's what you want for nearly every service call, because the whole chain then commits or rolls back together.\n\n**`REQUIRES_NEW`** suspends the outer transaction and starts its own, so its commit survives even when the caller rolls back — audit logging is the classic case.\n\n**`NESTED`** is supposed to be a savepoint inside the outer transaction, but `JpaTransactionManager` doesn't support it and throws `NestedTransactionNotSupportedException`, so on a JPA app it isn't really an option.\n\nIn practice you use `REQUIRED`, occasionally `REQUIRES_NEW`, and that's the whole list.",
        explanation: `The audit log scenario that demonstrates \`REQUIRES_NEW\`:

\`\`\`java
@Service
public class OrderService {

    @Autowired AuditService auditService;

    @Transactional  // REQUIRED — outer transaction
    public void cancelOrder(Long orderId) {
        Order order = orderRepo.findById(orderId).orElseThrow();
        order.setStatus(CANCELLED);
        orderRepo.save(order);

        // Audit must commit regardless of what happens after
        auditService.log("ORDER_CANCELLED", orderId);

        // Suppose this throws — outer transaction rolls back
        // But audit is ALREADY committed thanks to REQUIRES_NEW
        sendCancellationEmail(order); // throws
    }
}

@Service
public class AuditService {
    @Transactional(propagation = Propagation.REQUIRES_NEW) // own transaction
    public void log(String event, Long entityId) {
        auditRepo.save(new AuditLog(event, entityId, Instant.now()));
    } // commits here, independent of the outer transaction
}
\`\`\`

With \`REQUIRED\` instead of \`REQUIRES_NEW\` on \`auditService.log()\`, the audit entry would roll back along with the outer transaction whenever \`sendCancellationEmail\` throws — leaving a gap in your audit trail.`,
        followUps: [
          { text: "What happens with `NOT_SUPPORTED` and `MANDATORY`?" },
          { text: "What can go wrong with `REQUIRES_NEW` when the connection pool is small?" },
        ],
      },
      {
        id: 97,
        text: "What are transaction isolation levels?",
        answer:
          "Isolation levels decide **how much of another transaction's uncommitted work yours is allowed to see**.\n\n`READ_UNCOMMITTED` is the weakest and permits dirty reads — you can read a row that gets rolled back a second later. `READ_COMMITTED` stops that, and it's the default in Postgres, Oracle and SQL Server. `REPEATABLE_READ` also guarantees a row you read twice looks identical both times, and it's MySQL's default under InnoDB. `SERIALIZABLE` is the strongest, blocking phantom rows as well, and it costs the most concurrency.\n\nAlmost every Spring app runs at `READ_COMMITTED` and never touches the setting. You go higher only for a specific anomaly you've actually seen, because each step up buys correctness with throughput.",
        explanation: `The three anomalies each level prevents:

\`\`\`
Anomaly          | What it means                              | Prevented by
-----------------|--------------------------------------------|------------------
Dirty Read       | Read uncommitted data (may be rolled back)  | READ_COMMITTED+
Non-repeatable   | Row changes between two reads in same txn  | REPEATABLE_READ+
Phantom Read     | Range query returns different rows later    | SERIALIZABLE
\`\`\`

Practical example of non-repeatable read (the silent bug):

\`\`\`java
// @Query("SELECT a.balance FROM Account a WHERE a.id = :id")
// BigDecimal findBalanceById(@Param("id") Long id);

@Transactional(isolation = Isolation.READ_COMMITTED) // default
public void checkAndCharge(Long id) {
    BigDecimal first = accountRepo.findBalanceById(id);  // READ 1: 1000
    // ... business logic; meanwhile another txn commits a withdrawal ...
    BigDecimal second = accountRepo.findBalanceById(id); // READ 2: 500 — changed!
    // At READ_COMMITTED every statement sees the latest COMMITTED data,
    // so first != second inside ONE transaction. Non-repeatable read.
}

// Fix: REPEATABLE_READ — both reads see the same MVCC snapshot.
// Nothing is locked; the writer still commits. You just don't SEE the change.
@Transactional(isolation = Isolation.REPEATABLE_READ)
public void checkAndCharge(Long id) { ... } // READ 1 == READ 2, guaranteed
\`\`\`

**Why a scalar projection, not \`findById\` twice:** calling \`findById(id)\` twice in one transaction would *not* show this anomaly — Hibernate's first-level cache returns the same instance for the second call without touching the DB, hiding the change. The persistence context gives you repeatable reads for whole entities regardless of the DB isolation level, so you need a scalar query (or \`em.refresh()\`) to observe what the database is actually doing.

**A consistent read is still not a safe write.** If you read the balance and then decrement it, raising isolation doesn't save you — you need \`@Version\` (optimistic) or \`SELECT ... FOR UPDATE\` (pessimistic). Isolation alone won't stop lost updates.

**Production advice:** Don't change isolation level speculatively. Understand your exact consistency requirement, prove READ_COMMITTED is insufficient, then raise it. Every level above READ_COMMITTED trades throughput for correctness.`,
        followUps: [
          { text: "Explain dirty read, non-repeatable read, and phantom read." },
          { text: "Does Spring choose an isolation level for you?" },
          { text: "How do you set isolation on `@Transactional`?" },
        ],
      },
      {
        id: 98,
        text: "How do you handle database migrations (Flyway/Liquibase)?",
        answer:
          "Flyway and Liquibase run **versioned SQL scripts** in order at startup and record every one in a history table with a checksum. That gives you a schema you can rebuild from an empty database and review in a pull request.\n\nThey exist to replace `ddl-auto=update`, which is fine on your laptop and dangerous in production — it never drops a column, never records what it did, and nobody reviews it.\n\nFlyway names files like `V2__add_email_index.sql`, Liquibase uses XML or YAML changesets. Both run before the app starts, so the code never boots against a schema it doesn't expect. Edit a migration after it's already been applied and Flyway fails startup on the checksum mismatch — that's the feature, not a bug.",
        explanation: `Flyway naming and workflow:

\`\`\`sql
-- Files live in src/main/resources/db/migration/ and run in version order:
--   V1__create_users_table.sql
--   V2__add_email_to_users.sql
--   V3__create_orders_table.sql
--   V4__add_user_id_index.sql

-- V2__add_email_to_users.sql
ALTER TABLE users ADD COLUMN email VARCHAR(255);
CREATE UNIQUE INDEX idx_users_email ON users(email);
\`\`\`

Flyway records each applied file in a \`flyway_schema_history\` table — version, description, a **checksum** of the file contents, and whether it succeeded. If you edit \`V2__\` after it's already been applied somewhere, the checksum no longer matches the recorded one and Flyway **refuses to start**. That's the safety net against silent schema drift: migrations are append-only, so fixing a mistake means adding \`V5__\`, never editing \`V2__\`.

**vs \`ddl-auto=update\`:**

\`\`\`properties
# NEVER in production: adds columns but never removes them, leaves no audit
# trail, drifts between environments, and isn't reviewable in a pull request
spring.jpa.hibernate.ddl-auto=update

# USE INSTEAD — validate only checks that the schema matches your entities
# and fails startup if it doesn't. Flyway owns the actual changes.
spring.jpa.hibernate.ddl-auto=validate
\`\`\``,
        followUps: [
          { text: "What does `ddl-auto=update` do when you rename a field?" },
          { text: "Someone edited a migration that already ran and the app won't start. What now?" },
          { text: "How do you handle a failed migration in a shared environment?" },
        ],
      },
      {
        id: 99,
        text: "What is connection pooling, and which connection pool does Spring Boot use by default (HikariCP)?",
        answer:
          "A connection pool keeps a set of **already-open DB connections** that threads borrow and hand back, instead of opening a fresh one per request. That matters because opening a connection is expensive — TCP handshake, authentication, driver setup — and it's pure overhead on every call.\n\nSpring Boot ships **HikariCP** as the default and you configure nothing to get it.\n\nThe size is the number worth remembering. The default pool is **10 connections**, which is a hard ceiling on how many requests can touch the DB at once. Once all 10 are checked out the next thread just waits, and if nothing frees up within 30 seconds it fails with `SQLTransientConnectionException`.",
        explanation: `What happens without a pool:

\`\`\`
WITHOUT A POOL
Request 1 → CREATE connection (30-100ms) → query → CLOSE connection
Request 2 → CREATE connection (30-100ms) → query → CLOSE connection
// 100 concurrent users = 100 new DB connections per request cycle
// DB server limit: 100 connections total → queue builds → timeouts

WITH HIKARICP
Startup: CREATE 10 connections, hold them open
Request 1 → BORROW connection (microseconds) → query → RETURN to pool
Request 2 → BORROW same connection → query → RETURN
// 100 concurrent users share 10 connections, queueing when all are busy
\`\`\`

Key HikariCP settings:

\`\`\`yaml
spring:
  datasource:
    hikari:
      maximum-pool-size: 10    # max connections (default 10)
      minimum-idle: 5          # keep 5 warm at all times
      connection-timeout: 30000 # 30s wait before throwing
      idle-timeout: 600000     # evict idle connections after 10min
      max-lifetime: 1800000    # recycle before DB server kills them (30min)
\`\`\`

**Pool size math:** don't blindly set it to 100. DB has a connection limit; divide by app instances. If DB allows 100 connections and you run 5 app pods, max pool is 20 per pod. Oversizing causes DB-side resource exhaustion; undersizing causes HikariCP queue buildup and timeout errors under load.`,
        followUps: [
          { text: "Which HikariCP settings actually matter in production?" },
          { text: "What symptoms indicate pool exhaustion?" },
          { text: "How do you monitor pool metrics with Actuator?" },
        ],
      },
      {
        id: 100,
        text: "What is the difference between SQL and NoSQL databases, and when would you choose one over the other?",
        answer:
          "**SQL databases** like PostgreSQL and MySQL store rows in tables with a fixed schema, enforce foreign keys, and give you ACID transactions across several tables at once.\n\n**NoSQL** isn't one thing — MongoDB stores documents, Redis stores key-value pairs, Cassandra stores wide columns. What they share is the trade: joins and a strict schema, given up for horizontal scale and schema changes without `ALTER TABLE`.\n\nThe honest answer is that SQL is the default. Most business data is relational, and you want a real transaction the first time one order has to update stock and payment together. Reach for NoSQL when the shape genuinely doesn't fit — fields that vary per record, a cache that needs sub-millisecond reads, or write volume one machine can't absorb.",
        explanation: `The choosing-wrong-DB problem is real and expensive to fix later. Here's the decision:

\`\`\`
Use PostgreSQL (SQL) when:
✓ You have entities with relationships (User → Order → Payment)
✓ You need ACID transactions across multiple rows/tables
✓ Your schema is stable and well-understood
✓ You need complex JOINs, aggregations, window functions
✓ Reporting and analytics queries matter

Use MongoDB (NoSQL) when:
✓ Documents are self-contained and rarely joined (product catalog, events)
✓ Schema varies per document type (e-commerce products with different attributes)
✓ You need flexible, fast schema evolution without migrations
✓ Write throughput is very high (event logging, telemetry)
\`\`\`

Polyglot persistence — both in one system:

\`\`\`java
// Spring Boot config supports both simultaneously
@SpringBootApplication
// JPA for relational data (users, orders, payments)
@EnableJpaRepositories(basePackages = "com.app.repositories.sql")
// MongoDB for product catalog, search documents
@EnableMongoRepositories(basePackages = "com.app.repositories.mongo")
public class Application { ... }
\`\`\`

**The cross-store consistency trap:** if you write to Postgres and Mongo in the same operation and Mongo write fails, you've got partial state. No distributed transaction covers both. Solve it with the Outbox pattern or accept eventual consistency explicitly.`,
        followUps: [
          { text: "Variable schema is the usual reason to reach for Mongo — does `JSONB` settle it?" },
          { text: "How do transactions differ in document stores vs relational DBs?" },
          { text: "Can you use both SQL and NoSQL in one Spring Boot system?" },
        ],
      },
      {
        id: 101,
        text: "Explain indexing in databases and how it affects query performance.",
        answer:
          "An index is a **separate B-tree** the database maintains next to the table, mapping column values to the rows that hold them.\n\nWithout one, `WHERE email = ?` on a 10-million-row table does a full scan and reads all 10 million rows. With an index on `email`, it walks a tree three or four levels deep and goes straight to the row — `O(log n)` instead of `O(n)`.\n\nThe cost lands on writes. Every INSERT, UPDATE and DELETE has to update every index on that table, so ten indexes make a single write roughly ten times the work. Index the columns you filter and join on, and nothing else.",
        explanation: `The visible cost of a missing index:

\`\`\`sql
-- SLOW: full table scan on 10M rows
SELECT * FROM orders WHERE user_id = 42;
-- EXPLAIN shows: Seq Scan, cost=0..250000 rows=50

-- Add index
CREATE INDEX idx_orders_user_id ON orders(user_id);

-- FAST: index scan
SELECT * FROM orders WHERE user_id = 42;
-- EXPLAIN shows: Index Scan using idx_orders_user_id, cost=0..8 rows=50
\`\`\`

Composite index column order matters:

\`\`\`sql
-- Index: (user_id, status, created_at)
CREATE INDEX idx_orders_composite ON orders(user_id, status, created_at);

-- CAN use this index (left-prefix match):
WHERE user_id = 42
WHERE user_id = 42 AND status = 'PENDING'
WHERE user_id = 42 AND status = 'PENDING' AND created_at > '2024-01-01'

-- CANNOT use this index (no left-prefix):
WHERE status = 'PENDING'   -- skips user_id
WHERE created_at > '2024-01-01' -- skips both
\`\`\`

**Too many indexes trap:** a table with 10 indexes means every INSERT triggers 10 B-tree updates. On a write-heavy \`orders\` table (high insert rate), this serializes writes and tanks throughput. Use \`pg_stat_user_indexes\` in PostgreSQL to find indexes with \`idx_scan = 0\` (never used) and drop them.`,
        followUps: [
          { text: "Which indexes should you drop?" },
          { text: "What is a composite index, and does column order matter?" },
          { text: "How would you find out that a slow query is missing an index?" },
        ],
      },
      {
        id: 102,
        text: "What is the difference between `INNER JOIN`, `LEFT JOIN`, and `RIGHT JOIN`?",
        answer:
          "**`INNER JOIN`** keeps only the rows where the condition matches on **both sides** — anything unmatched on either side just disappears from the result.\n\n**`LEFT JOIN`** keeps every row from the left table and fills the right-side columns with `NULL` wherever there's no match.\n\n**`RIGHT JOIN`** is the same thing mirrored, keeping every row from the right table instead. In real code you use INNER and LEFT and basically never RIGHT, because any RIGHT JOIN turns into a LEFT JOIN if you swap the table order.\n\nThe choice comes down to what a missing match means. Use INNER when it makes the row irrelevant, and LEFT when you still need it — a user with no orders should still show up in a user list.",
        explanation: `Data model: Users may or may not have Orders.

\`\`\`sql
-- INNER JOIN: only users who have at least one order
SELECT u.name, o.total
FROM users u
INNER JOIN orders o ON u.id = o.user_id;
-- Alice (2 orders) → 2 rows. Bob (0 orders) → NOT included.

-- LEFT JOIN: all users, including those with no orders
SELECT u.name, o.total
FROM users u
LEFT JOIN orders o ON u.id = o.user_id;
-- Alice → 2 rows. Bob → 1 row with o.total = NULL

-- Find users with NO orders (classic use of LEFT JOIN + NULL check)
SELECT u.name
FROM users u
LEFT JOIN orders o ON u.id = o.user_id
WHERE o.id IS NULL;  -- only rows where right side is NULL = no match
\`\`\`

The accidental CROSS JOIN:

\`\`\`sql
-- FORGOT the ON clause — every user paired with every order
SELECT u.name, o.total FROM users u, orders o;
-- 1000 users x 10000 orders = 10,000,000 rows returned
-- This will OOM or timeout the DB under any real data volume
\`\`\`

**JPA connection:** \`JOIN FETCH\` in JPQL maps to SQL INNER JOIN; \`LEFT JOIN FETCH\` maps to LEFT OUTER JOIN and is necessary when the association can be \`null\` (optional \`@ManyToOne\`) — INNER JOIN would silently drop entities with a null FK.`,
        followUps: [
          { text: "Why does a `WHERE` on the right-hand table turn a LEFT JOIN into an INNER JOIN?" },
          { text: "How do joins relate to JPA association fetching?" },
          { text: "What is a CROSS JOIN, and when is it accidental/bad?" },
        ],
      },
    ],
  },
  {
    id: "security",
    title: "Security",
    description:
      "Authentication, authorization, JWT, Spring Security configuration, and secure password handling.",
    icon: "🔒",
    questions: [
      {
        id: 103,
        text: "What is Spring Security, and what problem does it solve?",
        answer: "Spring Security is a **filter-based** framework that handles **authentication** (who are you) and **authorization** (what may you do) before a request ever reaches your controller.\n\nIt also ships the hardening you'd otherwise hand-roll — password hashing, CSRF tokens, session fixation protection, and security response headers.\n\nAdd `spring-boot-starter-security` and **every endpoint is locked down by default**; you then open up exactly what should be public. Skip it and you scatter `if (user == null) return 401` checks across every controller — and the one you forget is the breach.",
        explanation: `**Analogy:** a building's security desk. Everyone entering passes one lobby — badge checked once, at the door. You don't post a guard inside every meeting room, and no room can forget to have one.

\`\`\`java
// BAD — security scattered through controllers
@RestController
class OrderController {
    @GetMapping("/api/orders/{id}")
    public OrderDto get(@PathVariable Long id, HttpSession session) {
        User user = (User) session.getAttribute("user");
        if (user == null) throw new ResponseStatusException(UNAUTHORIZED);  // repeated in 40 methods
        if (!user.isAdmin()) throw new ResponseStatusException(FORBIDDEN);  // forget once = data leak
        return orderService.find(id);
    }
}
\`\`\`

\`\`\`java
// GOOD — one place declares the rules; filters enforce them before the controller runs
@Configuration
@EnableWebSecurity
public class SecurityConfig {
    @Bean
    SecurityFilterChain chain(HttpSecurity http) throws Exception {
        return http
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/api/auth/**").permitAll()
                .requestMatchers("/api/orders/**").hasRole("ADMIN")
                .anyRequest().authenticated())   // default-deny
            .build();
    }
}
\`\`\`

The controller is now pure business logic — it never sees an unauthenticated request, because the filter chain runs **before \`DispatcherServlet\`** and short-circuits with a 401.

\`anyRequest().authenticated()\` is the line that matters most: it makes the default **deny**, so an endpoint someone adds next sprint is protected before anyone remembers to protect it. The opposite ordering — listing what to secure and leaving the rest open — is how endpoints leak.`,
        followUps: [
          { text: "What is the security filter chain at a high level?" },
          { text: "How does Spring Security run inside a servlet container that knows nothing about Spring beans?" },
          { text: "What do you lose the moment you declare your own `SecurityFilterChain`?" },
        ],
      },
      {
        id: 104,
        text: "What is the difference between authentication and authorization?",
        answer: "**Authentication** answers *who are you* — it verifies credentials and stores an `Authentication` object in the `SecurityContext`.\n\n**Authorization** answers *what are you allowed to do* — it checks that principal's authorities against the rule for this URL or method.\n\nAuthentication always runs first; authorization is meaningless without it. The status codes tell them apart. **401 means we don't know who you are; 403 means we know and you still can't have it.** Return 403 for an expired token and clients go chasing the wrong bug.",
        explanation: `**Analogy:** an airport. Authentication is the passport check at the gate — proving you're you. Authorization is the lounge door — you're definitely you, and you're still not getting in on an economy ticket.

\`\`\`java
// Authentication happens in a filter: credentials -> Authentication -> SecurityContext
UsernamePasswordAuthenticationToken auth =
    new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities());
SecurityContextHolder.getContext().setAuthentication(auth);
// From here on, "who" is settled. Everything downstream only asks "may they?"
\`\`\`

\`\`\`java
// Authorization happens twice: URL-level in the chain, method-level on the bean
http.authorizeHttpRequests(a -> a
    .requestMatchers("/api/admin/**").hasRole("ADMIN")   // 403 for a logged-in USER
    .anyRequest().authenticated());                      // 401 for no token at all

@PreAuthorize("hasRole('ADMIN') or #userId == authentication.name")
public UserDto getProfile(String userId) { ... }        // 403 if the SpEL is false
\`\`\`

Spring routes the two failures to different components: \`AuthenticationEntryPoint\` handles "not authenticated" (401), \`AccessDeniedHandler\` handles "authenticated but denied" (403). On a JSON API you override both, or an expired token gets a **302 redirect to /login** and your mobile client parses an HTML page as JSON.`,
        followUps: [
          { text: "Where does each happen in a typical request to a secured API?" },
          { text: "What exactly does the `Authentication` object hold after a successful login?" },
        ],
      },
      {
        id: 105,
        text: "How does JWT-based authentication work in a Spring Boot application?",
        answer: "The client logs in once, the server **signs** a JWT holding the user id, roles, and an expiry, and hands it back.\n\nEvery later request sends it as `Authorization: Bearer <token>`. A custom filter parses it, **verifies the signature and expiry**, and populates the `SecurityContext` — no server-side session, so any instance can serve any request.\n\nThe token is **signed, not encrypted**: anyone can base64-decode the claims, so never put a password or PII in it.\n\nThe real cost is revocation — you can't un-issue a token, so keep the access token short (5–15 minutes) and pair it with a revocable refresh token.",
        explanation: `**Analogy:** a festival wristband. The gate checks your ID once and gives you a tamper-proof band. Every stage after that just looks at the band — nobody phones the gate. Which is also the problem: kick someone out and the band still works until it expires.

\`\`\`java
// The filter that runs on every request, once, before the controller
public class JwtAuthFilter extends OncePerRequestFilter {
    protected void doFilterInternal(HttpServletRequest req, HttpServletResponse res, FilterChain chain)
            throws ServletException, IOException {
        String header = req.getHeader("Authorization");
        if (header != null && header.startsWith("Bearer ")) {
            try {
                Claims claims = jwtService.parseAndVerify(header.substring(7)); // throws if signature/exp bad
                var authorities = List.of(new SimpleGrantedAuthority("ROLE_" + claims.get("role")));
                var auth = new UsernamePasswordAuthenticationToken(claims.getSubject(), null, authorities);
                SecurityContextHolder.getContext().setAuthentication(auth);
            } catch (JwtException e) {
                SecurityContextHolder.clearContext();   // bad token = anonymous, NOT an exception page
            }
        }
        chain.doFilter(req, res);   // must always continue, or the response never completes
    }
}
\`\`\`

\`\`\`java
// Wire it in: stateless session + the filter placed before form-login's filter
@Bean
SecurityFilterChain chain(HttpSecurity http, JwtAuthFilter jwt) throws Exception {
    return http
        .csrf(csrf -> csrf.disable())                                     // no cookies = no CSRF vector
        .sessionManagement(s -> s.sessionCreationPolicy(STATELESS))       // don't create JSESSIONID
        .authorizeHttpRequests(a -> a
            .requestMatchers("/api/auth/**").permitAll()
            .anyRequest().authenticated())
        .addFilterBefore(jwt, UsernamePasswordAuthenticationFilter.class)
        .build();
}
\`\`\`

Two traps bite people in production. Forget \`STATELESS\` and Spring still creates a session per request — memory grows and you've lost the statelessness you paid for. And **verify the algorithm**, don't just decode: a library that accepts \`alg: none\` or lets the token choose HMAC vs RSA lets an attacker forge any claim they like. Use a vetted library (\`jjwt\`, Nimbus) and a key of at least 256 bits.`,
        followUps: [
          { text: "What stops a client from editing the claims in its own JWT?" },
          { text: "Where should the token live on the client, and what attack does each choice expose you to?" },
          { text: "How do you handle token refresh and expiration?" },
        ],
      },
      {
        id: 106,
        text: "What is the difference between session-based and token-based authentication?",
        answer: "**Session-based**: the server keeps the state and hands the client an opaque `JSESSIONID` cookie; every request looks that session up in server memory or Redis.\n\n**Token-based**: the server keeps nothing — the signed token itself carries the identity and the server just verifies the signature.\n\nSessions are **instantly revocable** (delete the row) but need sticky sessions or a shared store to scale out; tokens **scale for free** but stay valid until they expire.\n\nCookies are sent automatically by the browser, which is exactly why sessions need CSRF protection and an `Authorization` header doesn't.",
        explanation: `**Analogy:** a coat check versus a wristband. The coat check keeps a numbered stub — you hand over a meaningless ticket and the desk looks up what it means. The wristband carries the information on it; nobody looks anything up, and nobody can take it back either.

\`\`\`java
// Session — the cookie is a lookup key; the real data lives server-side
// Cookie: JSESSIONID=9F2A...   (opaque, meaningless to the client)
// Server: sessionStore.get("9F2A...") -> { userId: 42, roles: [ADMIN], cart: [...] }
// Revoke = session.invalidate();          // effective on the very next request
// Scale out = sticky sessions at the LB, or spring-session-data-redis

// Token — the cookie/header IS the data, signed so it can't be edited
// Authorization: Bearer eyJhbGci...   (base64 claims: sub=42, role=ADMIN, exp=...)
// Revoke = you can't, short of a denylist that re-introduces the state you removed
// Scale out = nothing to do; any instance verifies with the same key
\`\`\`

Use **sessions** for a server-rendered app or a first-party web app where instant logout and "log out all devices" matter — with \`spring-session-data-redis\` the scaling objection mostly disappears. Use **tokens** for mobile clients, public APIs, and service-to-service calls where there's no cookie jar and you need cross-domain calls.

The honest middle ground most teams land on: short-lived JWT access tokens plus a **refresh token stored server-side**. Revocation happens at refresh time, so the blast radius of a stolen token is one token lifetime instead of forever. Anyone who tells you JWTs are strictly better than sessions is skipping the revocation conversation.`,
        followUps: [
          { text: "How does horizontal scaling differ for sticky sessions vs JWT?" },
          { text: "What is session fixation, and how is it mitigated?" },
        ],
      },
      {
        id: 107,
        text: "How do you secure REST APIs using Spring Security?",
        answer: "Declare one `SecurityFilterChain` bean that turns the API **stateless** (`SessionCreationPolicy.STATELESS`), disables form login and CSRF because there's no cookie or login page, plugs in a **JWT or OAuth2 resource-server filter**, and ends the matcher list with `anyRequest().authenticated()`.\n\nAdd `@EnableMethodSecurity` and `@PreAuthorize` for rules that depend on the data, not just the URL.\n\nOverride the `AuthenticationEntryPoint` so failures return **JSON 401**, not a redirect to `/login`.\n\nThe rule that saves you: order matchers most-specific-first and make the last one deny — new endpoints are then secure by default.",
        explanation: `\`\`\`java
// BAD — the mistakes that make an "API" behave like a web app
http.authorizeHttpRequests(a -> a
        .anyRequest().permitAll()              // catch-all FIRST: every rule below is dead code
        .requestMatchers("/api/admin/**").hasRole("ADMIN"))
    .formLogin(withDefaults());                // 302 -> /login; your mobile client sees HTML
// plus a session per request, since STATELESS was never set
\`\`\`

\`\`\`java
// GOOD — stateless, JSON errors, default-deny
@Bean
SecurityFilterChain api(HttpSecurity http, JwtAuthFilter jwt) throws Exception {
    return http
        .csrf(csrf -> csrf.disable())
        .sessionManagement(s -> s.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
        .formLogin(AbstractHttpConfigurer::disable)
        .httpBasic(AbstractHttpConfigurer::disable)
        .authorizeHttpRequests(a -> a
            .requestMatchers("/api/auth/**", "/actuator/health").permitAll()
            .requestMatchers(HttpMethod.GET, "/api/products/**").permitAll()  // method-specific
            .requestMatchers("/api/admin/**").hasRole("ADMIN")
            .anyRequest().authenticated())                                    // last, and denying
        .exceptionHandling(e -> e
            .authenticationEntryPoint((req, res, ex) -> {                     // 401 as JSON
                res.setStatus(401);
                res.setContentType("application/json");
                res.getWriter().write("{\\"error\\":\\"unauthorized\\"}");
            }))
        .addFilterBefore(jwt, UsernamePasswordAuthenticationFilter.class)
        .build();
}
\`\`\`

**Matcher order is evaluated top-down and the first match wins** — a stray \`permitAll()\` near the top silently opens everything below it, and no test that only checks happy paths will catch it. Write a \`MockMvc\` test that hits each protected endpoint **with no token** and asserts 401; that's the test that catches a bad reorder during review.

Also secure the actuator explicitly. \`/actuator/health\` is fine to expose, but \`/actuator/env\` and \`/actuator/heapdump\` leak credentials and memory contents — keep them behind \`hasRole("ADMIN")\` or off the public port entirely.`,
        followUps: [
          { text: "How do you permit public endpoints like `/login` and `/actuator/health`?" },
          { text: "What breaks if you add a JWT filter but leave form login and sessions enabled?" },
          { text: "Why doesn't `@RestControllerAdvice` catch your 401s?" },
        ],
      },
      {
        id: 108,
        text: "What is `SecurityFilterChain`, and how do you configure it?",
        answer: "`SecurityFilterChain` is a **bean** that pairs a request matcher with an ordered list of security filters — since Spring Security 5.7 it's how you configure security, replacing the deprecated `WebSecurityConfigurerAdapter`.\n\nYou build one by taking `HttpSecurity` as a method parameter, chaining the DSL, and returning `http.build()`.\n\nYou can register **several** chains: `securityMatcher` decides which requests each one claims, and **the first chain whose matcher hits handles the request — the rest are skipped entirely**. Get the `@Order` wrong and a broad chain swallows requests you meant a narrower one to protect.",
        explanation: `\`\`\`java
// The old way — deprecated in 5.7, removed in 6.0. Don't write this.
@Configuration
public class SecurityConfig extends WebSecurityConfigurerAdapter {
    @Override protected void configure(HttpSecurity http) { ... }  // inheritance = one config, hard to compose
}
\`\`\`

\`\`\`java
// Two chains: the API is stateless + JWT, the admin UI keeps sessions + form login
@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    @Order(1)                                              // most specific FIRST
    SecurityFilterChain apiChain(HttpSecurity http, JwtAuthFilter jwt) throws Exception {
        return http
            .securityMatcher("/api/**")                    // this chain only claims /api/**
            .csrf(AbstractHttpConfigurer::disable)
            .sessionManagement(s -> s.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(a -> a.anyRequest().authenticated())
            .addFilterBefore(jwt, UsernamePasswordAuthenticationFilter.class)
            .build();
    }

    @Bean
    @Order(2)                                              // catch-all LAST
    SecurityFilterChain webChain(HttpSecurity http) throws Exception {
        return http
            .authorizeHttpRequests(a -> a.anyRequest().hasRole("ADMIN"))
            .formLogin(withDefaults())                     // CSRF stays ON here — cookies are in play
            .build();
    }
}
\`\`\`

Swap those \`@Order\` values and the catch-all chain matches \`/api/**\` first — your JWT filter never runs and API clients get redirected to a login form. There's no warning; the app starts fine.

Placement inside a chain matters too. \`addFilterBefore(jwt, UsernamePasswordAuthenticationFilter.class)\` puts your filter after the exception-translation and context-persistence filters but **before** authorization runs, which is the only window where setting the \`SecurityContext\` still counts. Put it after \`FilterSecurityInterceptor\` and every request is denied before your filter ever executes. Set \`logging.level.org.springframework.security=DEBUG\` and Boot prints the resolved chain and every filter in order at startup — that's the fastest way to see which chain actually claimed a request when the behaviour doesn't match the config you think you wrote.`,
        followUps: [
          { text: "Why did Spring Security move away from `WebSecurityConfigurerAdapter`?" },
          { text: "Your JWT filter never runs and API clients get redirected to a login form. Why?" },
          { text: "Where does your custom JWT filter sit in the chain?" },
        ],
      },
      {
        id: 109,
        text: "What is CSRF, and how does Spring Security handle it?",
        answer: "**Cross-Site Request Forgery** is an attack where a malicious page makes the victim's browser fire a state-changing request at your site — and because **cookies are attached automatically**, it arrives fully authenticated.\n\nSpring Security defends with the **synchronizer token pattern**. It puts a random token in the session, requires it on every `POST`/`PUT`/`DELETE`, and rejects the request with 403 if it's missing or wrong.\n\nThe attacker's page can make the browser send the request but **can't read your token** — the same-origin policy stops it. CSRF is enabled by default, and you only turn it off when authentication rides in a header instead of a cookie.",
        explanation: `**Analogy:** someone forges a cheque in your name and the bank cashes it because the signature is real. Your browser is the signature — it attaches the cookie to every request to that domain, no matter who triggered it.

\`\`\`xml
<!-- The attack. Victim is logged into your bank in another tab and visits evil.com -->
<form action="https://yourbank.com/transfer" method="POST">
  <input type="hidden" name="to" value="attacker" />
  <input type="hidden" name="amount" value="5000" />
</form>
<script>document.forms[0].submit();</script>
<!-- Browser attaches JSESSIONID automatically -> server sees a valid, authenticated transfer -->
\`\`\`

\`\`\`java
// The defence, and when to switch it off

// Cookie-session web app: leave CSRF ON (default). Thymeleaf injects the hidden
// _csrf field into every <form> automatically; a request without it gets 403.

// Stateless JWT API: no cookie is used for auth, so there's nothing to forge
http.csrf(AbstractHttpConfigurer::disable);

// SPA on a different origin that DOES use a cookie: keep it on, expose the token to JS
http.csrf(csrf -> csrf.csrfTokenRepository(CookieCsrfTokenRepository.withHttpOnlyFalse()));
\`\`\`

The decision rule is one question: **does the browser attach your credential automatically?** Cookie or HTTP Basic — yes, so you need CSRF protection. A JWT the client reads from storage and puts in an \`Authorization\` header — no, the attacker's page can't add that header, so CSRF adds nothing.

Where teams get burned: they read "JWTs don't need CSRF", disable it, then later store the JWT in a cookie for convenience. The protection is off and the vector is back. If your token lives in a cookie, you need CSRF protection **or** \`SameSite=Strict\`, regardless of what the token contains.`,
        followUps: [
          { text: "Why is CSRF often disabled for pure stateless JWT APIs?" },
          { text: "When would disabling CSRF actually get your app exploited?" },
          { text: "Why is `GET` exempt from CSRF checks?" },
        ],
      },
      {
        id: 110,
        text: "What is role-based access control, and how do you implement it (`@PreAuthorize`, `@Secured`)?",
        answer: "RBAC means permissions attach to **roles**, not to individual users — you grant `ROLE_ADMIN` once and every admin inherits it.\n\nIn Spring you enforce it at the URL level with `hasRole(\"ADMIN\")` in the filter chain. At the method level you use **`@PreAuthorize`**, which takes a **SpEL expression** and can see the method's arguments.\n\n`@Secured` is the older annotation and only accepts a plain list of role names — no expressions — so `@PreAuthorize` is the one to use.\n\nMethod security needs **`@EnableMethodSecurity`**; without it the annotations are silently ignored and every call goes through.",
        explanation: `\`\`\`java
// URL-level RBAC catches the coarse case, but it can't see the data
http.authorizeHttpRequests(a -> a
    .requestMatchers("/api/admin/**").hasRole("ADMIN")       // "ROLE_" prefix added for you
    .requestMatchers("/api/reports/**").hasAuthority("report:read"));  // no prefix added here

// GET /api/orders/99 passes this check for ANY authenticated user — including
// the one whose order it isn't. That's a broken-object-level-authorization bug (OWASP #1).
\`\`\`

\`\`\`java
@Configuration
@EnableMethodSecurity          // WITHOUT this line every annotation below is a no-op
public class MethodSecurityConfig { }

@Service
public class OrderService {

    @PreAuthorize("hasRole('ADMIN')")                      // runs BEFORE the method body
    public void deleteOrder(Long id) { ... }

    // SpEL sees the arguments and the authenticated principal — this is the ownership check
    @PreAuthorize("hasRole('ADMIN') or #customerId == authentication.name")
    public List<OrderDto> ordersFor(String customerId) { ... }

    // When ownership is only knowable AFTER loading, filter the return value instead
    @PostAuthorize("returnObject.customerId == authentication.name")
    public OrderDto findById(Long id) { ... }
}
\`\`\`

Two things trip people up. **The \`ROLE_\` prefix is inconsistent**: \`hasRole("ADMIN")\` prepends \`ROLE_\` for you, \`hasAuthority("ADMIN")\` does not — so if your DB stores \`ADMIN\` without the prefix, \`hasRole\` fails and \`hasAuthority\` works, and vice versa. Pick one convention and store authorities to match it.

And method security runs through **Spring AOP proxies**, so it only fires on calls that cross the proxy boundary. A \`@PreAuthorize\` method invoked from another method of the *same* bean is called directly on \`this\` — the annotation is bypassed entirely. Same self-invocation limitation as \`@Transactional\`, same fix: call it from a different bean.`,
        followUps: [
          { text: "What is the difference between roles and authorities in Spring Security?" },
          { text: "`@EnableMethodSecurity` is on and `@PreAuthorize` still isn't firing. Why?" },
          { text: "How do you check that a user owns the specific record they're requesting?" },
        ],
      },
      {
        id: 111,
        text: "How do you store passwords securely (`PasswordEncoder`, BCrypt)?",
        answer: "You **hash** passwords, never encrypt them — encryption is reversible and a leaked key hands over every account.\n\nUse Spring's `PasswordEncoder` with **BCrypt** (or Argon2/scrypt), which is deliberately **slow** and generates a **random salt per password** that it stores inside the hash string itself.\n\nVerification never decrypts anything: `encoder.matches(rawPassword, storedHash)` re-hashes the input with the stored salt and compares.\n\nThe work factor is the point — a fast hash like MD5 or SHA-256 lets an attacker try billions of guesses a second against a stolen dump.",
        explanation: `**Analogy:** a hash is a paper shredder, not a safe. A safe can be opened with the key; shredded paper can only be compared against another shred of the same document. Salting means every document goes through a differently-configured shredder, so identical passwords don't produce identical shreds.

\`\`\`java
// BAD — each of these is a real incident waiting to happen
user.setPassword(rawPassword);                            // plain text: dump = game over
user.setPassword(DigestUtils.md5Hex(rawPassword));        // unsalted + fast: rainbow tables
user.setPassword(aesEncrypt(rawPassword, secretKey));     // reversible: leak the key, leak everything
// Unsalted also means two users with the same password get the same hash —
// crack one row and you've cracked every account that shares it.
\`\`\`

\`\`\`java
@Bean
PasswordEncoder passwordEncoder() {
    return PasswordEncoderFactories.createDelegatingPasswordEncoder();  // BCrypt by default
}

// Registration — hash once, store the result
user.setPassword(passwordEncoder.encode(dto.getRawPassword()));
// stored: {bcrypt}$2a$10$N9qo8uLOickgx2ZMRZoMye...
//          ^prefix   ^cost ^22-char salt + hash — the salt travels WITH the hash

// Login — never decrypt, never compare strings directly
if (!passwordEncoder.matches(dto.getRawPassword(), user.getPassword())) {
    throw new BadCredentialsException("Invalid credentials");  // same message for bad user AND bad password
}
\`\`\`

That \`{bcrypt}\` prefix is what makes **\`DelegatingPasswordEncoder\`** the right default: the stored hash declares its own algorithm, so old \`{md5}\` rows still verify while new ones are written with BCrypt. Re-encode a user's password on their next successful login and the whole table migrates itself, no forced reset.

Two production details. Keep the BCrypt strength at **10–12** — higher is safer but each step doubles login CPU cost, and a strength of 15 will melt your login endpoint under load. And return an **identical error message and similar response time** for "unknown user" and "wrong password"; leaking which one failed turns your login form into a tool for enumerating who has an account.`,
        followUps: [
          { text: "Where does the salt live if the database column only stores one hash string?" },
          { text: "How do you switch hashing algorithms without forcing every user to reset their password?" },
        ],
      },
      {
        id: 112,
        text: "What is OAuth2, and how does Spring Boot integrate with it?",
        answer: "OAuth2 is a **delegated authorization** protocol: it lets an app act on a user's behalf against another service **without ever seeing their password**.\n\nThe user authenticates at the authorization server (Google, Okta, Keycloak), which issues a scoped **access token** the app presents to the resource server.\n\nOAuth2 is about *authorization* — **OpenID Connect** is the thin layer on top that adds an `id_token` and makes it usable for *login*.\n\nIn Spring Boot you don't implement any of it: add `spring-boot-starter-oauth2-client` to be the app logging users in, or `spring-boot-starter-oauth2-resource-server` to be the API validating incoming tokens.",
        explanation: `**Analogy:** a hotel key card. You prove who you are once at reception, and they hand you a card that opens your room and the gym — for three nights. The gym door never learns your name or your credit card; it just checks the card. Reception can cancel it without changing every lock.

\`\`\`yaml
# Your API as a RESOURCE SERVER — validate tokens someone else issued.
# Boot fetches the public keys from the issuer and verifies every JWT signature for you.
spring:
  security:
    oauth2:
      resourceserver:
        jwt:
          issuer-uri: https://auth.company.com/realms/orders
\`\`\`

\`\`\`java
// That's it — no filter to write. Map the token's scopes to your rules:
@Bean
SecurityFilterChain chain(HttpSecurity http) throws Exception {
    return http
        .authorizeHttpRequests(a -> a
            .requestMatchers(HttpMethod.GET, "/api/orders/**").hasAuthority("SCOPE_orders:read")
            .requestMatchers(HttpMethod.POST, "/api/orders/**").hasAuthority("SCOPE_orders:write")
            .anyRequest().authenticated())
        .oauth2ResourceServer(o -> o.jwt(Customizer.withDefaults()))
        .build();
}

// Read claims straight off the validated token in a controller:
@GetMapping("/me")
public String me(@AuthenticationPrincipal Jwt jwt) { return jwt.getSubject(); }
\`\`\`

**Authorization code flow** in four steps: your app redirects the browser to the authorization server; the user logs in there and consents; the server redirects back with a short-lived **code**; your app exchanges that code for tokens over a **back-channel** HTTPS call using its client secret. The token never travels through the browser URL — that's the whole reason the code step exists. Public clients (SPAs, mobile) have no secret to protect, so they add **PKCE**; the implicit flow that used to serve them is deprecated.

The distinction interviewers push on: **authorization server** issues and signs tokens and owns the login UI; **resource server** owns the data and only ever *validates* tokens. Most teams build resource servers and buy the authorization server. Writing your own is a security project, not a sprint task.`,
        followUps: [
          { text: "Why couldn't people just use OAuth2 for login?" },
          { text: "Explain authorization code flow at a high level." },
          { text: "What is a resource server vs an authorization server?" },
        ],
      },
    ],
  },
  {
    id: "microservices",
    title: "Microservices",
    description:
      "Service discovery, gateways, resilience, messaging, and distributed system patterns.",
    icon: "🕸️",
    questions: [
      {
        id: 113,
        text: "What are microservices, and how do they differ from a monolithic architecture?",
        answer: "Microservices split an application into **small, independently deployable services**, each owning one business capability and **its own database**, communicating over the network.\n\nThe difference that matters isn't size — it's the **deployment and data boundary**. A monolith is one build, one deploy, one schema, and an in-process call wrapped in a real ACID transaction.\n\nMicroservices give each team its own release cadence, and turn that method call into a network call that can be **slow, duplicated, or lost**.\n\nYou take that on when independent scaling, independent deploys, or team autonomy are genuinely hurting you. What you pay is distributed transactions, eventual consistency, and an operational surface that multiplies by the number of services.",
        explanation: `**Analogy:** a monolith is one big restaurant kitchen — every chef shares the stove and the pantry, so passing a dish across is free, but one fire shuts down every order. Microservices are a food court: each stall has its own kitchen, its own suppliers, its own opening hours. One stall closing doesn't stop the others, but now moving a dish between stalls needs a courier, and nobody can give the customer one bill.

The boundary you actually feel is the transaction:

\`\`\`java
// MONOLITH — one transaction, one database. All three succeed or none do.
@Transactional
public Order placeOrder(OrderRequest req) {
    inventoryService.reserve(req.sku(), req.qty());        // in-process method call
    Payment payment = paymentService.charge(req.card());   // same tx, same DB
    return orderRepository.save(new Order(req, payment.getId()));
}
// paymentService throws -> the inventory reservation rolls back too. Free.
\`\`\`

\`\`\`java
// MICROSERVICES — three network calls, three databases, no shared transaction.
public Order placeOrder(OrderRequest req) {
    inventoryClient.reserve(req.sku(), req.qty());   // may time out AFTER succeeding
    paymentClient.charge(req.card());                // fails -> stock is ALREADY reserved
    return orderRepository.save(new Order(req, PENDING));
}
// @Transactional here would be a lie: it only covers the local save.
// You now need a saga + compensating transactions to undo the reservation by hand.
\`\`\`

That single change — losing the shared transaction — is where most of the added complexity comes from, and it's why the honest split criterion is organizational, not technical. Split when **teams block each other on releases**, when one component needs radically different scaling (a search service that needs 40 pods next to an admin UI that needs one), or when you need failure isolation so a broken reporting job can't take checkout down.

At 2 YoE the answer interviewers actually want is the counterweight: **start with a modular monolith**. Get the boundaries right with packages and enforced module dependencies, keep one deploy and one database, and extract a service only when you can point at the specific pain it removes. Splitting a domain you don't understand yet cements the wrong boundaries in HTTP, and moving them afterwards means coordinated multi-team releases instead of a rename in your IDE.`,
        followUps: [
          { text: "What are the operational costs of microservices that people underestimate?" },
          { text: "When is a modular monolith a better choice?" },
          { text: "How do you decide where one service ends and the next begins?" },
        ],
      },
      {
        id: 114,
        text: "What is service discovery, and how does Eureka work?",
        answer: "Service discovery is how a service finds the **current network address** of another one without anybody hardcoding a host and port.\n\nIn a containerized estate instances come and go constantly — autoscaling, rolling deploys, crashes — so any URL you put in a config file is wrong within a day.\n\n**Eureka** is a registry: each service **registers itself on startup** and **heartbeats every 30 seconds** to renew its lease. Clients pull the registry, cache it locally, and pick an instance themselves via Spring Cloud LoadBalancer.\n\nIt's **eventually consistent, not authoritative** — a dead instance can stay in the registry for up to 90 seconds. Discovery reduces bad calls; it never eliminates them.",
        explanation: `**Analogy:** a hotel switchboard. You don't memorize which room a guest is in — that changes every night. You ask the switchboard, which knows who checked in and who checked out, and it connects you. If someone leaves without checking out, the switchboard keeps connecting you to an empty room until it notices.

\`\`\`java
// BAD — the address is baked in. Works on your laptop, dies in production.
@Value("\${inventory.url:http://10.0.4.17:8081}")   // pod dies -> new IP -> outage
private String inventoryUrl;
// Scale to 5 instances and you're still calling exactly one of them.
// The "fix" people reach for is a load balancer per service, hand-maintained.

// GOOD — call it by SERVICE ID; the load balancer resolves it per request.
@Bean @LoadBalanced   // this annotation is what makes the service-id lookup work
RestClient.Builder restClientBuilder() { return RestClient.builder(); }

restClient.get().uri("http://inventory-service/api/stock/{sku}", sku).retrieve();
//                    ^^^^^^^^^^^^^^^^^ not a DNS name — a registry lookup
\`\`\`

\`\`\`yaml
# The client side. Register yourself, and refresh your cached copy of the registry.
eureka:
  client:
    service-url:
      defaultZone: http://eureka-1:8761/eureka/,http://eureka-2:8761/eureka/
    registry-fetch-interval-seconds: 30   # how stale your local view can be
  instance:
    prefer-ip-address: true               # containers rarely have resolvable hostnames
    lease-renewal-interval-in-seconds: 30 # heartbeat
    lease-expiration-duration-in-seconds: 90  # evicted after 3 missed heartbeats
\`\`\`

Read those last two numbers together and you have the interview answer: a **hard-killed instance keeps receiving traffic for up to 90 seconds**, and clients refresh on their own 30-second cycle on top of that. Eureka also has **self-preservation mode**, where if it loses more than ~15% of expected heartbeats it assumes the *network* broke rather than the services, and stops evicting anything at all — which is safe during a partition and deeply confusing during a real mass outage. So discovery is a routing convenience, not a health guarantee: you still need timeouts and a circuit breaker.

In practice, be ready to say that **you'd probably not run Eureka on Kubernetes**. The platform already tracks pod readiness, so \`http://inventory-service:8080\` resolves through cluster DNS with endpoints updated in seconds by the readiness probe, and running a registry on top duplicates the job with worse propagation and one more stateful component to operate. Eureka still earns its place on VMs, on ECS without service discovery, or in a hybrid estate.`,
        followUps: [
          { text: "What is the difference between client-side and server-side discovery?" },
          { text: "How does a service register and renew its lease?" },
          { text: "What would you use instead of Eureka on Kubernetes, and why?" },
        ],
      },
      {
        id: 115,
        text: "What is an API Gateway, and why is it needed?",
        answer: "An API Gateway is the **single entry point** in front of your services: it routes each request to the right one and handles the concerns that are identical for all of them — TLS termination, authentication, rate limiting, CORS, and correlation ids.\n\nWithout it, every service reimplements the same filter chain. Worse, **clients get coupled to your internal topology** — a mobile app calling six hostnames directly can't survive you splitting or renaming a service.\n\n**Spring Cloud Gateway** is the current Spring implementation, built on WebFlux and Netty so a slow downstream parks a cheap continuation instead of pinning a thread.\n\nA gateway routes and protects. The moment business logic moves into it, it becomes a shared bottleneck every team queues behind.",
        explanation: `**Analogy:** reception in an office building. Everyone enters through one desk that checks your badge, hands you a visitor pass, and tells you which floor to go to. Nobody wanders in through a side door, and the meeting rooms don't each need their own security guard. Reception doesn't decide what happens in your meeting — the moment it does, every meeting waits on reception.

\`\`\`yaml
# Routing is declarative: predicates decide WHICH route, filters decide what happens to it.
spring:
  cloud:
    gateway:
      routes:
        - id: order-service
          uri: lb://order-service        # lb:// = resolve via discovery + load balance
          predicates:
            - Path=/api/orders/**
          filters:
            - StripPrefix=1              # /api/orders/42 -> /orders/42 downstream
            - name: CircuitBreaker
              args: { name: orderCb, fallbackUri: forward:/fallback/orders }
            - name: RequestRateLimiter   # counters live in Redis, NOT in memory —
              args:                      # in-memory would force sticky routing
                redis-rate-limiter.replenishRate: 20
                redis-rate-limiter.burstCapacity: 40
\`\`\`

\`\`\`java
// A global filter — runs for every route. Stamp a correlation id at the edge.
@Component
public class CorrelationIdFilter implements GlobalFilter, Ordered {
    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
        String id = Optional.ofNullable(exchange.getRequest().getHeaders().getFirst("X-Correlation-Id"))
                            .orElseGet(() -> UUID.randomUUID().toString());
        // NEVER do blocking work here (JDBC, RestTemplate) — you'd stall a Netty
        // event-loop thread and degrade every unrelated request on this instance.
        return chain.filter(exchange.mutate()
                .request(r -> r.header("X-Correlation-Id", id)).build());
    }
    @Override public int getOrder() { return -1; }   // before routing
}
\`\`\`

The split that gets you marks: the gateway does the **coarse** security pass — verify the JWT signature and reject garbage before it touches your fleet — while **fine-grained authorization stays in the service**, because only the order service knows whether this user owns order 4711. Cache the JWKS at the gateway or you've added a network call to the issuer on every single request.

Its two real risks are worth naming unprompted. It's a **single point of failure on the hot path**, so run at least two stateless instances and keep per-route timeouts tight. And it's an **organizational bottleneck** if every new endpoint needs a hand-edited route in a repo one team owns — prefer discovery-based routing so teams self-serve. On Kubernetes, plain routing is often better served by an **Ingress or Gateway API** resource, and you keep Spring Cloud Gateway for the cases that need real request logic.`,
        followUps: [
          { text: "What belongs in the gateway, and what should stay in the services?" },
          { text: "How does Spring Cloud Gateway differ from Zuul?" },
          { text: "What are the risks of a gateway becoming a bottleneck?" },
        ],
      },
      {
        id: 116,
        text: "What is Spring Cloud, and what problems does it solve?",
        answer: "Spring Cloud is an **umbrella of projects** that implement the recurring distributed-system patterns — service discovery, centralized configuration, edge routing, declarative HTTP clients, client-side load balancing, circuit breaking, and distributed tracing — as Boot starters and auto-configuration.\n\nIt solves the problem that **every microservice estate needs the same plumbing**, and hand-rolling it per team produces six incompatible half-implementations.\n\nIt began as a Spring-friendly wrapper around **Netflix OSS**, and most of those components are now dead. Ribbon, Hystrix, and Zuul were replaced by Spring Cloud LoadBalancer, Resilience4j, and Spring Cloud Gateway.\n\nToday it's a **BOM you import for version alignment**, and you pick only the pieces Kubernetes doesn't already give you.",
        explanation: `Spring Cloud's real trick is that these are **starters plus auto-configuration**, so the pattern shows up as an annotation and a few properties rather than a library you wire by hand:

\`\`\`xml
<!-- The BOM is the point: it pins every spring-cloud-* artifact to a set that was
     tested together, against a specific Boot version. Mismatch it and you get
     NoSuchMethodError at startup, not a helpful build failure. -->
<dependencyManagement>
  <dependencies>
    <dependency>
      <groupId>org.springframework.cloud</groupId>
      <artifactId>spring-cloud-dependencies</artifactId>
      <version>2025.0.0</version>   <!-- release train, not a semver of its own -->
      <type>pom</type><scope>import</scope>
    </dependency>
  </dependencies>
</dependencyManagement>
\`\`\`

\`\`\`java
@SpringBootApplication
@EnableFeignClients            // OpenFeign: declarative HTTP clients
public class OrderServiceApplication { }

// Discovery, load balancing and tracing need no annotation at all — they auto-configure
// off the classpath. That's the value: the pattern arrives as a dependency.
@FeignClient(name = "inventory-service")   // service id, resolved via discovery
interface InventoryClient {
    @GetMapping("/api/stock/{sku}") StockDto findStock(@PathVariable String sku);
}
\`\`\`

The projects worth naming: **Gateway** (edge routing), **Config** (Git-backed external configuration), **OpenFeign** (declarative clients), **LoadBalancer** (replaced Ribbon), **CircuitBreaker** (an abstraction over Resilience4j), **Stream** (a binder model so the same \`Function\` bean runs over Kafka or RabbitMQ), and **Netflix Eureka** — the *only* Netflix component still shipped.

Say the Kubernetes part unprompted, because it's what separates a current answer from a 2018 one. Kubernetes absorbed the **platform** concerns: Services and cluster DNS instead of Eureka, kube-proxy instead of Ribbon, Ingress instead of a gateway for plain routing, ConfigMaps and Secrets instead of a Config Server, and probes instead of registry heartbeats. What it can't do is **in-process behaviour** — a circuit breaker, a fallback, a retry with jitter, a bulkhead around one specific downstream call — so **Resilience4j and Micrometer Tracing stay** while much of the rest is optional. A modern Boot 3 service on Kubernetes often uses Spring Cloud for exactly two things: resilience and declarative clients.`,
        followUps: [
          { text: "Which Spring Cloud projects would you actually reach for today?" },
          { text: "How does Spring Cloud relate to Netflix OSS historically?" },
          { text: "What has Kubernetes replaced in modern Spring Cloud setups?" },
        ],
      },
      {
        id: 117,
        text: "How do microservices communicate with each other (REST, messaging, gRPC)?",
        answer: "Two families. **Synchronous** — JSON over HTTP or **gRPC** — means the caller blocks waiting for a response. Use it when you need the answer to decide what to do next, like checking stock before confirming an order.\n\n**Asynchronous messaging** over Kafka or RabbitMQ, where you publish an event and move on; use it when the caller doesn't need the result to finish its own job.\n\nThe trap in synchronous chains is that **availability multiplies**: three services at 99.9% chained together give you 99.7%, and every downstream's latency lands in your p99.\n\nSo the default should be **async where you can, sync where you must**. Every synchronous call needs a timeout and a circuit breaker, or one slow service takes down the whole estate.",
        explanation: `**Analogy:** a phone call versus an email. A phone call gets you an answer now, but only if they pick up, and you stand there holding the receiver while they check. An email goes out whether they're at their desk or not, they'll deal with it eventually, and you can CC four people at no extra cost — you just can't act on the reply immediately.

\`\`\`java
// SYNCHRONOUS — the caller owns everyone else's failures and latency.
public Order placeOrder(OrderRequest req) {
    inventoryClient.reserve(req.sku());     // 120ms
    paymentClient.charge(req.card());       // 400ms
    notificationClient.sendEmail(req);      // 900ms — and email being down
    loyaltyClient.addPoints(req.userId());  //         fails the ORDER. Why?
    return orderRepository.save(new Order(req));
}
// Latency = the sum. Availability = the product. Adding a 5th consumer means
// editing and redeploying this method.
\`\`\`

\`\`\`java
// ASYNC — commit what you own, publish the fact, let others react.
@Transactional
public Order placeOrder(OrderRequest req) {
    inventoryClient.reserve(req.sku());   // still sync: we need the answer NOW
    Order order = orderRepository.save(new Order(req, PENDING));
    outbox.save(new OrderPlaced(order.getId(), req.userId()));  // same tx as the order
    return order;                          // 120ms, not 1.4s
}
// A relay publishes from the outbox after commit — notification, loyalty and
// analytics each consume independently. A 4th consumer needs zero changes here.
\`\`\`

That \`outbox\` line is the detail that shows you've done this: writing to the database and publishing to a broker are **two systems with no shared transaction**, so a naive \`repository.save(); kafka.send();\` loses the event on a crash between them, or publishes an event for an order that rolled back. Writing the event to a table in the same transaction and relaying it afterwards makes the pair atomic.

**gRPC** is the third option and it's an internal one: Protobuf over HTTP/2 gives you a compact binary payload, a generated client, and a contract the compiler enforces, typically several times faster than JSON. The costs are that it's unreadable in \`curl\`, browsers can't call it without a proxy, and you've added codegen to every build. Common shape: **gRPC service-to-service on hot paths, JSON REST at the edge.**

Whatever you pick synchronously, set **connect and read timeouts explicitly** — \`RestTemplate\` and \`RestClient\` ship with none — and keep the caller's budget larger than the callee's so timeouts nest. Retries only on **idempotent** operations, with exponential backoff and jitter, behind a circuit breaker; three blind retries against a struggling service triple its load exactly when it can least cope.`,
        followUps: [
          { text: "When would you choose async messaging over synchronous REST?" },
          { text: "What are the trade-offs of gRPC vs JSON REST?" },
          { text: "How do timeouts and retries affect cascading failures?" },
        ],
      },
      {
        id: 118,
        text: "What is Feign Client, and how is it used?",
        answer: "OpenFeign is a **declarative REST client**: you write an interface annotated with the same Spring MVC annotations you'd use on a controller, and Feign generates the implementation at runtime — no URL building, no `ResponseEntity` unwrapping, no manual JSON mapping.\n\nYou name the target by **service id** rather than host, so it resolves through discovery and Spring Cloud LoadBalancer and scaling instances needs no config change.\n\nEnable it with `@EnableFeignClients` and inject the interface like any other bean.\n\nThe one thing you must not skip is configuration. **Feign's defaults give you generous timeouts and a generic `FeignException`**, so set `connectTimeout`/`readTimeout` per client and supply an `ErrorDecoder`. Skip that and a slow downstream hangs your threads, and every failure looks identical.",
        explanation: `\`\`\`java
// BAD — the boilerplate Feign exists to delete. This is 15 lines of plumbing
// around one idea: "get the stock for a SKU".
public StockDto findStock(String sku) {
    String url = UriComponentsBuilder.fromHttpUrl(inventoryBaseUrl)   // hardcoded host
            .path("/api/stock/{sku}").buildAndExpand(sku).toUriString();
    ResponseEntity<StockDto> res = restTemplate.exchange(
            url, HttpMethod.GET, new HttpEntity<>(authHeaders()), StockDto.class);
    if (res.getStatusCode() != HttpStatus.OK) {
        throw new IllegalStateException("inventory call failed");  // loses the real cause
    }
    return res.getBody();
}
\`\`\`

\`\`\`java
// GOOD — the interface IS the client. Same MVC annotations you already know.
@FeignClient(name = "inventory-service", configuration = InventoryFeignConfig.class)
interface InventoryClient {

    @GetMapping("/api/stock/{sku}")
    StockDto findStock(@PathVariable String sku);

    @PostMapping("/api/stock/reserve")
    ReservationDto reserve(@RequestBody ReserveRequest request);
}

// Map downstream status codes to YOUR domain exceptions — otherwise every failure
// arrives as one opaque FeignException and callers can't react differently.
public class InventoryErrorDecoder implements ErrorDecoder {
    @Override public Exception decode(String methodKey, Response response) {
        return switch (response.status()) {
            case 404 -> new SkuNotFoundException(methodKey);
            case 409 -> new InsufficientStockException(methodKey);
            case 503 -> new RetryableException(503, "inventory down", GET, null, response.request());
            default  -> new IllegalStateException("inventory failed: " + response.status());
        };   // only mark genuinely transient statuses retryable — a retried 400
    }        // hammers a downstream with a request it will never accept.
}
\`\`\`

Set the timeouts in properties, per client or with \`default\` as the key for everything:
\`spring.cloud.openfeign.client.config.inventory-service.connectTimeout=2000\` and \`readTimeout=5000\`. Then wrap the client in Resilience4j — discovery hands you a **dead instance** for tens of seconds after a pod dies, so Feign alone doesn't make calls reliable.

Where Feign sits against the alternatives: **Feign** when the call is a plain typed RPC and you want it to disappear from your code; **\`RestClient\`** (Boot 3.2+) when you need a fluent imperative API with real control over the request — it's the modern replacement for \`RestTemplate\`, which is in maintenance mode; **\`WebClient\`** when you're on WebFlux or genuinely need to fan out several calls concurrently without burning threads. All three integrate with Spring Cloud LoadBalancer, so discovery isn't what decides it.

Two traps worth mentioning unprompted: a \`@FeignClient\` interface **isn't a controller**, so don't put \`@RequestMapping\` on the type expecting Spring to serve it; and by default Feign **doesn't forward headers**, so the caller's \`Authorization\` and trace headers vanish unless you add a \`RequestInterceptor\`.`,
        followUps: [
          { text: "How does OpenFeign integrate with load balancing and service discovery?" },
          { text: "How do you configure timeouts and error decoding?" },
          { text: "What is the difference between Feign and WebClient/RestClient?" },
        ],
      },
      {
        id: 119,
        text: "What is circuit breaker pattern, and how is it implemented (Resilience4j/Hystrix)?",
        answer: "A circuit breaker **stops calling a dependency that's already failing**. It counts failures over a sliding window, and once the failure rate crosses a threshold it **opens**.\n\nEvery further call is then rejected instantly with a fallback — no network traffic at all. After a wait period it goes **half-open** and lets a few probe calls through to see if the dependency recovered.\n\nThe point is twofold: you **fail fast** instead of piling up threads on 30-second timeouts, and you **stop hammering a service that's trying to recover**.\n\nIn Spring Boot you use **Resilience4j** via `@CircuitBreaker(name = \"...\", fallbackMethod = \"...\")` and a block of YAML. Hystrix is end-of-life and was removed from Spring Cloud.",
        explanation: `**Analogy:** the breaker in your fuse box. When a circuit draws too much current it trips and cuts power to that one line — not because tripping is good, but because the alternative is the house burning down. It doesn't reset itself instantly either; you flip it back once and see whether it holds.

\`\`\`java
// WITHOUT — inventory-service starts taking 30s instead of 200ms.
public StockDto findStock(String sku) {
    return inventoryClient.findStock(sku);   // blocks 30s, on every single call
}
// 200 req/s x 30s = every Tomcat thread parked waiting. Your service now returns
// nothing at all — including for endpoints that never touch inventory.
// Meanwhile inventory gets the full retry load while it's trying to recover.

// WITH — fail fast, degrade, and let the downstream breathe.
@CircuitBreaker(name = "inventory", fallbackMethod = "stockUnknown")
@Retry(name = "inventory")            // retry runs INSIDE the breaker: retries count
public StockDto findStock(String sku) {   // toward the failure rate, as they should
    return inventoryClient.findStock(sku);
}

// Same signature + a trailing Throwable. Return degraded truth, never fake success.
private StockDto stockUnknown(String sku, Throwable t) {
    log.warn("inventory unavailable for {}, serving cached", sku, t);
    return stockCache.get(sku).orElse(StockDto.unknown(sku));  // NOT "in stock"
}
\`\`\`

\`\`\`yaml
resilience4j.circuitbreaker.instances.inventory:
  slidingWindowSize: 100
  failureRateThreshold: 50          # >50% of the last 100 calls fail -> OPEN
  waitDurationInOpenState: 30s      # reject everything for 30s, zero downstream load
  permittedNumberOfCallsInHalfOpenState: 5   # then probe with 5 calls
  minimumNumberOfCalls: 20          # don't trip on the first 2 failures at startup
\`\`\`

\`minimumNumberOfCalls\` is the one people forget — without it a single failed call at 3am is a 100% failure rate and the breaker opens on a service nobody was using.

Know when **not** to fall back. Returning \`PaymentStatus.SUCCESS\` because the gateway timed out is how you ship free orders; for anything touching money or safety the correct degradation is to fail loudly or queue the work, not to guess. And make sure the fallback can't fail the same way — one that queries the database that just timed out isn't a fallback.

On the Hystrix comparison: Netflix stopped developing it in 2018 and Spring Cloud removed it, so naming it as a current choice is a red flag. Resilience4j is lighter (no Archaius or RxJava), runs on the **caller's thread with a semaphore bulkhead** by default rather than a thread pool per dependency, and ships retry, rate limiter, bulkhead, and time limiter as separate composable modules. Breaker state transitions publish Micrometer metrics and an Actuator endpoint, so **alert on the breaker opening** — it's usually the earliest signal that a downstream is dying.`,
        followUps: [
          { text: "What happens to the very first request after the circuit has been open for a while?" },
          { text: "How does Resilience4j compare to Netflix Hystrix?" },
          { text: "How do fallback methods help degrade gracefully?" },
        ],
      },
      {
        id: 120,
        text: "How do you handle distributed configuration in microservices (Spring Cloud Config)?",
        answer: "You **externalize configuration out of the deployable** so the same image runs in every environment and a config change doesn't need a rebuild.\n\n**Spring Cloud Config Server** serves properties from a **Git repo** over HTTP. Each client asks for its own application name and profile at startup, and gets a merged view of `application.yml`, `{app}.yml`, and `{app}-{profile}.yml`. That lands in its `Environment` before any bean is created.\n\nGit is what makes it work operationally — config gets **review, history, and rollback via `git revert`**.\n\nTwo rules. **Secrets never go in that repo** in plaintext — use Vault or your cloud's secret manager. And the config server is on the startup path, so run more than one and set `fail-fast` with retry. On Kubernetes, **ConfigMaps and Secrets** cover most of this without a config server at all.",
        explanation: `The problem it fixes: twelve services × four environments = 48 property files drifting apart, with the production database URL living in someone's Jenkins job.

\`\`\`yaml
# --- In the Git repo the server reads ---
# application.yml       -> shared by EVERY service
# order-service.yml     -> all environments of one service
# order-service-prod.yml-> most specific, wins
#
# --- In the client, application.yml ---
spring:
  application:
    name: order-service         # becomes the {application} in the lookup
  config:
    import: "optional:configserver:http://config-server:8888"
  cloud:
    config:
      fail-fast: true           # don't boot half-configured against defaults
      retry:
        max-attempts: 6         # config server restarting shouldn't kill the fleet
# Server resolves GET /order-service/prod/main and merges the three files.
\`\`\`

\`\`\`java
// @RefreshScope wraps the bean in a proxy holding a lazily-created target.
@RefreshScope
@Component
public class PricingProperties {
    @Value("\${pricing.surge-multiplier:1.0}")
    private BigDecimal surgeMultiplier;
}
// POST /actuator/refresh -> re-fetch config, EVICT the cached target.
// The next call through the proxy rebuilds the bean: constructor and @PostConstruct
// run again, @Value fields are re-read. Nothing restarts.
//
// Consequences people miss:
//  - in-flight requests keep using the OLD instance
//  - any state the bean held is thrown away -> keep refresh-scoped beans stateless
//  - server.port, and a DataSource already built into a pool, do NOT change
\`\`\`

For a fleet-wide refresh you either drive it from your deployment tooling or use **Spring Cloud Bus** over Kafka/RabbitMQ, where one \`POST /actuator/busrefresh\` fans the event out to every instance.

Secrets are where teams get this wrong. The whole value of a Git-backed repo is that lots of people can read it, so plaintext credentials there are a breach waiting for an audit. Spring Cloud Config's built-in \`{cipher}\` encryption is better than nothing, but the key lives on the server and rotation is manual. The stronger answer is **Vault** (via Spring Cloud Vault) or a cloud secret manager, which gives you audit logs, per-service policies, and **short-lived dynamic credentials** — a database password minted per instance with a TTL.

Be ready for the Kubernetes version of the question: **ConfigMaps and Secrets** mounted as env vars or files cover non-sensitive config with no extra component to operate, and Spring Boot reads them like any other property source. A Config Server still earns its place when you want config **versioned in Git with review**, shared across clusters or non-Kubernetes workloads, or changeable without a pod restart.`,
        followUps: [
          { text: "How does a config server with a Git backend work?" },
          { text: "What actually happens to a bean when a config refresh fires?" },
          { text: "What secrets management approaches pair with config servers?" },
        ],
      },
      {
        id: 121,
        text: "What is the Saga pattern, and why is it used in distributed transactions?",
        answer: "A saga replaces one distributed transaction with a **sequence of local transactions**, each in its own service, plus a **compensating transaction** for every step that can undo it.\n\nThere's no rollback across services — if step three fails you run the compensations for steps two and one in reverse order: release the reserved stock, then refund the payment.\n\nYou need it because `@Transactional` stops at the first network call and **2PC isn't viable** across services that hold locks over the network or don't support XA at all.\n\nThe trade you're accepting is **eventual consistency**: intermediate states are visible to users, so an order sits in `PENDING` rather than being atomically confirmed.",
        explanation: `**Analogy:** booking a trip through three separate websites. There's no single \"cancel my holiday\" button — if the car rental falls through, you cancel the hotel and cancel the flight yourself, one at a time. The flight refund is a **new** transaction that shows up on your statement, not the original charge being erased.

\`\`\`java
// BROKEN — this looks atomic and isn't. The annotation covers only the local save.
@Transactional
public Order placeOrder(OrderRequest req) {
    inventoryClient.reserve(req.sku());   // COMMITTED in another DB. Not rollbackable.
    paymentClient.charge(req.card());     // throws -> Spring rolls back... the local tx
    return orderRepository.save(new Order(req));
}
// Result: stock reserved forever for an order that doesn't exist. Silent inventory
// leak that nobody notices until the warehouse count stops matching the system.
\`\`\`

\`\`\`java
// ORCHESTRATED SAGA — one place owns the flow and the undo path.
public void execute(SagaState saga) {
    try {
        inventoryClient.reserve(saga.sku(), saga.id());   // saga id = idempotency key
        saga.mark(INVENTORY_RESERVED);
        paymentClient.charge(saga.card(), saga.id());
        saga.mark(PAID);
        orderService.confirm(saga.orderId());
    } catch (Exception e) {
        compensate(saga);                                 // reverse order, only what ran
    }
}

private void compensate(SagaState saga) {
    // Compensations are BUSINESS operations, not DB rollbacks, and they must be
    // idempotent (keyed on saga id) and retried until they succeed — a failed
    // compensation leaves real money or real stock stranded.
    if (saga.reached(PAID))                 paymentClient.refund(saga.id());
    if (saga.reached(INVENTORY_RESERVED))   inventoryClient.release(saga.id());
    orderService.cancel(saga.orderId(), "payment failed");
}
\`\`\`

The two styles: **choreography** has no coordinator — each service publishes an event and the next reacts (\`OrderCreated\` → \`PaymentCompleted\` → \`StockReserved\`). It's decoupled and needs no extra component, but **nobody owns the flow**, so answering "why did order 4711 stall?" means reading five repos, and accidental event cycles are easy to build. **Orchestration** puts the flow in one explicit state machine, which is worth a lot operationally, at the cost of a component that must be highly available. Rule of thumb: **choreography for two or three steps, orchestration once it's four or more** or the compensation logic turns conditional.

Why not 2PC: it holds locks across a network round trip, so throughput collapses under contention, and the **coordinator is a single point of failure** — if it dies after prepare, participants sit holding locks with no idea whether to commit, and a human resolves in-doubt transactions by hand. It also needs XA support from every participant, which rules out Kafka, REST APIs, Stripe, and most NoSQL stores.

Two production details. **Persist saga state** — an in-memory orchestrator that dies mid-flow leaves an order permanently half-processed, so the state machine goes in a table and a scheduled job resumes or compensates anything stuck. And some steps have **no real undo**: you can't un-send an email, so you send a cancellation, and you order the saga so the irreversible step goes **last**.`,
        followUps: [
          { text: "What is the difference between choreography and orchestration sagas?" },
          { text: "How do compensating transactions work?" },
          { text: "Why is 2PC often avoided in microservices?" },
        ],
      },
      {
        id: 122,
        text: "How do you handle centralized logging and tracing across microservices?",
        answer: "You **ship logs off the box** into one searchable store (ELK/OpenSearch, Loki, Datadog) and stamp every request with a **trace id** that propagates across service boundaries, so one search reconstructs the whole journey.\n\nLogs go out as **JSON, not plain text**, with the trace id as a field, because `grep` across twelve services' pods isn't a debugging strategy.\n\nTracing adds the timing view — each hop is a **span** with a parent, so a waterfall shows which of five calls ate 900ms of a 1-second request.\n\nIn Boot 3 that's **Micrometer Tracing** exporting to Zipkin, Tempo, or Jaeger. **Spring Cloud Sleuth is Boot 2 only** and was discontinued.",
        explanation: `**Analogy:** a parcel tracking number. Every depot the parcel passes through scans the same number, so one lookup shows the whole route and where it's been sitting for two days. Without it you'd have to phone each depot and ask if they've seen a brown box.

\`\`\`bash
# WITHOUT — plain text, no shared id. Which of these belong to the same request?
gateway   2026-08-02 10:14:02 INFO  POST /api/orders
order-svc 2026-08-02 10:14:02 INFO  creating order for user 88
payment   2026-08-02 10:14:31 ERROR gateway timeout        # is this even the same one?

# WITH — one traceId across every service, so one query returns the whole story.
{"ts":"...","svc":"gateway",  "traceId":"a1b2c3","spanId":"01","msg":"POST /api/orders"}
{"ts":"...","svc":"order-svc","traceId":"a1b2c3","spanId":"02","msg":"creating order"}
{"ts":"...","svc":"payment",  "traceId":"a1b2c3","spanId":"03","level":"ERROR"}
\`\`\`

\`\`\`yaml
# Boot 3: micrometer-tracing-bridge-brave + zipkin-reporter-brave on the classpath.
# NOT spring-cloud-starter-sleuth — that ended with Boot 2.
management:
  tracing:
    sampling:
      probability: 0.1        # 100% of traces is expensive; 10% + always-sample-errors
  zipkin:
    tracing:
      endpoint: http://zipkin:9411/api/v2/spans
logging:
  pattern:
    level: "%5p [\${spring.application.name},%X{traceId:-},%X{spanId:-}]"
# %X reads the MDC — that's how the id reaches your log lines for free.
\`\`\`

Propagation happens over HTTP headers — the W3C \`traceparent\`, or the older B3 \`X-B3-TraceId\` — injected and read automatically by instrumented \`RestClient\`, \`WebClient\`, and Feign. Two places it silently breaks: **async boundaries**, where a raw \`new Thread(...)\` or an uninstrumented executor loses the context, and **message brokers**, where the producer has to write the id into message headers and the consumer has to restore it. If your traces stop dead at a Kafka topic, that's why.

Know the three pillars and what each is for. **Logs** are discrete events with full context, so they tell you *what exactly* happened — expensive to store, awkward to aggregate. **Metrics** are cheap numeric time series with low-cardinality tags (error rate, p99, heap) and are what you **alert** on, but a metric can never tell you which order broke. **Traces** show one request's path and timing, which answers *where*. The workflow ties them together: a metric alert fires, a trace shows which hop is failing, and the logs for that trace id say why. Never put a user id or order id in a **metric tag** — high cardinality is how you take down Prometheus.

In production, log JSON via \`logstash-logback-encoder\`, write to **stdout** and let the platform's agent ship it, and never log tokens, passwords, or card numbers — centralized logging means one leaked field is now indexed and searchable by everyone with dashboard access.`,
        followUps: [
          { text: "What is a correlation/trace ID, and how is it propagated?" },
          { text: "How does Micrometer Tracing relate to Sleuth in modern Boot?" },
          { text: "What is the difference between logs, metrics, and traces?" },
        ],
      },
      {
        id: 123,
        text: "What is message-driven architecture, and how do Kafka/RabbitMQ fit into Spring Boot apps?",
        answer: "Services communicate by **publishing messages to a broker** instead of calling each other directly, so the producer doesn't know or wait for its consumers.\n\nThat buys you **temporal decoupling** (the broker buffers while a consumer is down or redeploying), **fan-out for free** (a fourth consumer needs no producer change), and **load levelling** under spikes.\n\n**Kafka** is a durable partitioned log where consumers track their own offset, so events can be **replayed** — right for event streams and high throughput.\n\n**RabbitMQ** is a smart broker with rich routing, per-message ack, TTLs, and dead-letter queues, where a message is gone once consumed — right for work queues. Spring gives both the same shape: a template to send, an annotated listener to receive.",
        explanation: `**Analogy:** Kafka is a newspaper archive — every issue stays on the shelf, and each reader keeps their own bookmark, so a new subscriber can start from January. RabbitMQ is the post office — it routes your letter to exactly the right recipient, and once they've opened it, it's gone.

\`\`\`java
// Producer + consumer, Spring for Apache Kafka. The framework owns serialization,
// connection management, polling threads and acks — you write the two ends.
@Service
class OrderEventPublisher {
    private final KafkaTemplate<String, OrderPlaced> kafka;
    void publish(Order order) {
        // KEY = orderId -> same partition -> ORDER IS GUARANTEED per key.
        // Pass null and events for one order can be processed out of sequence.
        kafka.send("orders", order.getId(), new OrderPlaced(order));
    }
}

@Component
class InvoiceListener {
    @KafkaListener(topics = "orders", groupId = "invoice-service")
    void on(OrderPlaced event) {
        // The offset commits only if this returns normally. Throw and it redelivers —
        // so this method MUST be idempotent. Assume you'll see every event twice.
        invoiceService.createIfAbsent(event.orderId());
    }
}
\`\`\`

\`\`\`yaml
spring.kafka:
  consumer:
    group-id: invoice-service    # each group gets its OWN copy of every message;
    auto-offset-reset: earliest  # two instances in one group SPLIT the partitions
    enable-auto-commit: false    # commit after processing, not on a timer
  listener:
    ack-mode: record
# A DefaultErrorHandler with backoff + a dead-letter topic after N attempts is the
# other half: without it, one poison message blocks its partition forever.
\`\`\`

That last comment is the incident you'll actually have. A message that always throws gets redelivered indefinitely and **stalls its entire partition** — nothing behind it is processed. Configure a \`DeadLetterPublishingRecoverer\` so it lands in \`orders.DLT\` after a few tries and the queue keeps moving.

On delivery guarantees, the answer interviewers want: **at-least-once is the default and what you should design for.** The consumer crashing after processing but before committing the offset is enough to redeliver. At-most-once (ack first, process after) loses messages. **Exactly-once** genuinely exists in Kafka via idempotent producers plus transactions that commit records and offsets atomically — but it **stops at Kafka's boundary**, so the moment your handler calls Stripe or writes to Postgres outside that transaction, the guarantee is gone. So: assume at-least-once and **make the consumer idempotent** — dedupe on the event id, or make the write an upsert. Effectively-once through idempotency is simpler and portable.

**Spring Cloud Stream** goes one abstraction higher: declare \`@Bean Function<OrderPlaced, Invoice>\` and bind it to Kafka or RabbitMQ in properties, so switching brokers is a dependency swap. Useful when you're genuinely broker-agnostic, an unnecessary layer when you're not.`,
        followUps: [
          { text: "When would you pick Kafka over RabbitMQ?" },
          { text: "How does Spring for Apache Kafka / Spring AMQP abstract producers and consumers?" },
          { text: "What is at-least-once vs exactly-once delivery?" },
        ],
      },
      {
        id: 124,
        text: "What is idempotency, and why does it matter in distributed systems?",
        answer: "An operation is idempotent when **running it twice has the same effect as running it once**.\n\nIt matters because in a distributed system a **timeout tells you nothing** — the request may have been processed and the response lost on the way back. So every client, load balancer, and retry policy will eventually send you a duplicate.\n\nWithout idempotency that's a double charge, a double order, or duplicate stock movements. `GET`, `PUT`, and `DELETE` are idempotent by HTTP definition and safe to retry; **`POST` is not**.\n\nThat's why payment and order endpoints take an **idempotency key**: a client-generated id you store with a **unique constraint in the same transaction as the business write**. A duplicate then replays the original response instead of charging again.",
        explanation: `**Analogy:** the call button for a lift. Pressing it eight times doesn't summon eight lifts — the first press records "someone is waiting", and the rest change nothing. A vending machine is the opposite: eight presses, eight chocolate bars, eight charges.

\`\`\`java
// BAD — every retry is a new charge, and the client CANNOT tell that its first
// attempt succeeded, because the response never arrived.
@PostMapping("/api/payments")
public PaymentDto pay(@RequestBody PaymentRequest req) {
    return paymentGateway.charge(req.card(), req.amount());   // network blip = 2 charges
}
// It compounds: the HTTP client retries, Feign retries, the LB retries, and the
// user hits the button again. One "retry once" per layer multiplies into six charges.
\`\`\`

\`\`\`java
@PostMapping("/api/payments")
@Transactional   // the key insert and the business write commit TOGETHER or not at all
public ResponseEntity<PaymentDto> pay(@RequestHeader("Idempotency-Key") String key,
                                      @RequestBody PaymentRequest req) {
    try {
        // Let the UNIQUE constraint arbitrate. A "select first, then insert" check
        // is a race — two concurrent retries both pass it and both charge.
        idempotencyRepo.saveAndFlush(new IdempotencyRecord(key, hash(req)));
    } catch (DataIntegrityViolationException duplicate) {
        return idempotencyRepo.findResponse(key)
            .map(saved -> ResponseEntity.ok(saved))              // replay the original
            .orElseGet(() -> ResponseEntity.status(409).build()); // still in flight
    }
    PaymentDto result = paymentGateway.charge(req.card(), req.amount(), key);
    idempotencyRepo.storeResponse(key, result);   // so the replay has something to return
    return ResponseEntity.ok(result);
}
\`\`\`

The key is generated **once per logical operation** — when the user clicks Pay, not per HTTP attempt — and reused across every retry of that click. Store it in your **primary transactional database**, not only Redis: the guarantee comes from committing the key and the business change atomically, and a Redis eviction or failover turns into a double charge. Keep a hash of the request body alongside, so the same key arriving with different parameters returns **422** instead of silently replaying the wrong response, and purge rows after a day or two.

Design the operation to help you where you can. \`PUT /orders/{clientOrderId}\` is naturally idempotent in a way \`POST /orders\` never is; an \`UPSERT\` is idempotent where an \`INSERT\` isn't; and \`UPDATE accounts SET balance = 100\` is idempotent where \`balance = balance - 10\` is emphatically not.

The same rule governs consumers. Kafka and RabbitMQ are **at-least-once**, so a listener will see the same event twice after a redelivery — dedupe on the event id before acting, or you'll email a customer twice about one order. And where an operation genuinely can't be made idempotent, don't paper over it with retries: **surface the uncertainty** for a reconciliation job or a human, which is exactly what payment providers do when a charge is left in an unknown state.`,
        followUps: [
          { text: "How do you make a payment or order API idempotent?" },
          { text: "What is an idempotency key, and where is it stored?" },
          { text: "How do retries interact with non-idempotent operations?" },
        ],
      },
    ],
  },
  {
    id: "testing",
    title: "Testing",
    description:
      "Unit vs integration tests, Mockito, MockMvc, slice tests, and Testcontainers.",
    icon: "🧪",
    questions: [
      {
        id: 125,
        text: "What is the difference between unit testing and integration testing?",
        answer: "A **unit test** exercises one class with its collaborators replaced by mocks — no Spring context, no database, no network — so it runs in milliseconds and tells you exactly which class broke. An **integration test** wires real components together and checks they work as a group: the repository really talks to Postgres, the controller really deserializes the JSON. The distinction that matters is what a failure tells you. A failing unit test points at one method; a failing integration test says something along the path is broken. Keep most of your tests at the unit level, for speed and precision. Then keep enough integration tests to prove the wiring, because mocks agreeing with each other proves nothing about production.",
        explanation: `**Analogy:** a unit test is bench-testing the fuel pump on its own — you know instantly whether the pump is bad. An integration test is starting the engine: it proves fuel, spark, and air actually work together, and when it fails you go looking for which part let you down.

\`\`\`java
// BAD — this calls itself a unit test but boots the entire application to check
// arithmetic. Eight seconds of context startup for a method with no dependencies.
@SpringBootTest
class DiscountCalculatorTest {
    @Autowired DiscountCalculator calculator;

    @Test
    void appliesTenPercentOverFiftyPounds() {
        assertThat(calculator.discountFor(new BigDecimal("60.00")))
            .isEqualByComparingTo("6.00");
    }
}
\`\`\`

\`\`\`java
// GOOD — no Spring, no context, runs in single-digit milliseconds.
class DiscountCalculatorTest {
    private final DiscountCalculator calculator = new DiscountCalculator();

    @Test
    void appliesTenPercentOverFiftyPounds() {
        assertThat(calculator.discountFor(new BigDecimal("60.00")))
            .isEqualByComparingTo("6.00");
    }
}
\`\`\`

**Where the line actually falls in a Spring app:** anything that's pure logic — pricing rules, validation, state transitions, mapping — is a plain JUnit test with mocks and no Spring. Anything whose *correctness lives in the wiring* needs the real thing: a \`@Query\` that has to be valid JPQL, a \`@Transactional\` boundary that must actually roll back, JSON that must deserialize into your DTO, a security rule that must reject an anonymous caller. Mocks can't fail those, because a mock repository returns whatever you told it to regardless of what the real query does.

The suite that goes wrong is the one that's all integration tests: it takes 25 minutes, so people stop running it locally, and a failure names a whole request path rather than a class. The opposite failure is a suite that's all unit tests with everything mocked — every test green, and the app doesn't start because two beans were never wired together.`,
        followUps: [
          { text: "Where do you draw the line in a Spring Boot app (service unit test vs `@SpringBootTest`)?" },
          { text: "What is the testing pyramid, and why prefer more unit tests?" },
          { text: "When is an end-to-end test worth the cost?" },
        ],
      },
      {
        id: 126,
        text: "How do you write unit tests in Spring Boot using JUnit and Mockito?",
        answer: "You test the class with **plain JUnit 5 and no Spring at all** — either `new OrderService(mockRepo, mockGateway)` directly, or `@ExtendWith(MockitoExtension.class)` with `@Mock` fields and `@InjectMocks`. Structure every test **Arrange-Act-Assert**: set up the stubs, call the one method under test, assert the outcome. Stub only what the path actually uses, because Mockito's strict stubs fail the test with `UnnecessaryStubbingException` when you don't. And assert on **behaviour, not implementation** — check that the returned order is `CONFIRMED` and that `paymentGateway.charge()` was called once, not that six internal methods ran in a particular order.",
        explanation: `\`\`\`java
// BAD — a Spring context for a class with two mockable dependencies, plus field
// injection so you can't even construct it yourself. Slow AND awkward to set up.
@SpringBootTest
class OrderServiceTest {
    @Autowired OrderService orderService;
    @MockitoBean OrderRepository orderRepository;   // 8s startup to test an if-statement
}
\`\`\`

\`\`\`java
// GOOD — plain JUnit 5 + Mockito. No Spring anywhere. Arrange-Act-Assert.
@ExtendWith(MockitoExtension.class)      // activates @Mock/@InjectMocks + strict stubs
class OrderServiceTest {

    @Mock private OrderRepository orderRepository;
    @Mock private PaymentGateway paymentGateway;
    @InjectMocks private OrderService orderService;   // built via its constructor

    @Test
    void confirmsOrderWhenPaymentSucceeds() {
        // Arrange
        Order pending = new Order(1L, PENDING);
        when(orderRepository.findById(1L)).thenReturn(Optional.of(pending));
        when(paymentGateway.charge(any())).thenReturn(PaymentResult.approved("ch_1"));

        // Act — exactly one call, so a failure has exactly one cause
        Order result = orderService.confirm(1L);

        // Assert — on the outcome, plus the one interaction that matters
        assertThat(result.getStatus()).isEqualTo(CONFIRMED);
        verify(paymentGateway).charge(any());
    }
}
\`\`\`

**Strict stubs will fail your test, and that's a feature.** \`MockitoExtension\` runs in \`STRICT_STUBS\` mode, so a \`when(...)\` that no code path ever reaches throws \`UnnecessaryStubbingException\`. It feels hostile the first time. What it's telling you is that either the test is lying about what it exercises, or you copy-pasted setup you don't need.

**Two habits worth forming.** Use **AssertJ** (\`assertThat(x).isEqualTo(y)\`) rather than JUnit's bare \`assertEquals\` — the fluent API gives far better failure messages on collections and objects, and \`spring-boot-starter-test\` already ships it. And name tests after behaviour: \`confirmsOrderWhenPaymentSucceeds\` tells you what broke from the CI output alone, where \`testConfirm1\` sends you reading code.`,
        followUps: [
          { text: "What is the difference between JUnit 4 and JUnit 5 annotations?" },
          { text: "How do you structure Arrange-Act-Assert in a clean test?" },
          { text: "When do you use `@ExtendWith(MockitoExtension.class)`?" },
        ],
      },
      {
        id: 127,
        text: "What is `@SpringBootTest`, and how does it differ from `@WebMvcTest` and `@DataJpaTest`?",
        answer: "`@SpringBootTest` starts the **whole application context** — every bean, and optionally a real embedded server — so it's the honest end-to-end check and the slowest thing in your suite. **Slice annotations** load one layer instead. `@WebMvcTest` gives you the MVC stack and your controllers with `MockMvc` wired up, but **no `@Service` or `@Repository` beans** — you supply those as `@MockitoBean`. `@DataJpaTest` gives you Hibernate, your entities and repositories against a test database, and **rolls back after every test**. Reach for a slice when you're testing one layer's behaviour, and for `@SpringBootTest` when the thing you're testing *is* the wiring.",
        explanation: `\`\`\`java
// WEB SLICE — controllers, @ControllerAdvice, converters, filters. No @Service,
// no @Repository, no DataSource. Starts in about a second.
@WebMvcTest(OrderController.class)
class OrderControllerTest {

    @Autowired MockMvc mockMvc;

    // The service doesn't exist in this context, so you must supply it.
    // @MockitoBean since Boot 3.4 — @MockBean is the deprecated older spelling.
    @MockitoBean OrderService orderService;

    @Test
    void returns404WhenOrderMissing() throws Exception {
        when(orderService.findById(99L)).thenThrow(new OrderNotFoundException(99L));
        mockMvc.perform(get("/api/orders/99"))
               .andExpect(status().isNotFound());   // proves your @ControllerAdvice works
    }
}
\`\`\`

\`\`\`java
// JPA SLICE — entities, repositories, EntityManager, a test DataSource.
// Transactional per test method and rolled back automatically.
@DataJpaTest
class OrderRepositoryTest {

    @Autowired OrderRepository orderRepository;
    @Autowired TestEntityManager em;

    @Test
    void findsPendingOrdersOlderThanADay() {
        em.persist(new Order(PENDING, Instant.now().minus(2, DAYS)));
        em.flush();   // force the INSERT, or the query below won't see the row

        assertThat(orderRepository.findStalePending(Instant.now().minus(1, DAYS)))
            .hasSize(1);
    }
}
\`\`\`

**Why slices are fast is context caching, not just bean count.** Spring caches one application context per unique test configuration and reuses it across test classes. Every class with the same annotations and the same mocks shares a context; every distinct combination builds another one. That's why scattering \`@MockitoBean\` of different types across many classes quietly multiplies your contexts and slows the whole suite — and it's why \`@DirtiesContext\` is expensive, since it evicts a cached context that everything after it has to rebuild.

**When you genuinely need the full context:** when the thing under test *is* the wiring. A \`@Transactional\` rollback that has to work through the real proxy, a \`@Scheduled\` job, security filter-chain ordering, or a request path running from HTTP all the way to a real database. Add \`webEnvironment = RANDOM_PORT\` and inject \`TestRestTemplate\` when you want a real HTTP round trip rather than \`MockMvc\`. Keep the number of these low and deliberate — they're what turns a 40-second suite into a 20-minute one.`,
        followUps: [
          { text: "What does each slice load into the context?" },
          { text: "Why are slice tests faster than full `@SpringBootTest`?" },
          { text: "When must you use a full application context?" },
        ],
      },
      {
        id: 128,
        text: "What is Mockito, and how do `@Mock`, `@InjectMocks`, and `@Spy` differ?",
        answer: "Mockito is the mocking library bundled in `spring-boot-starter-test` — it generates stand-in objects so you can test one class without its real collaborators. **`@Mock`** creates a fake whose every method returns null, 0, or empty until you stub it. **`@Spy`** wraps a **real object** and runs the real methods unless you stub one, so it's a partial mock. **`@InjectMocks`** builds the class under test and pushes the `@Mock` fields into it, preferring its constructor. Default to `@Mock`, and reach for `@Spy` only when you need most of a real object's behaviour with one method overridden. The trap with `@InjectMocks` is silence: a dependency with no matching mock stays **null**, and you find out through an NPE rather than a wiring error.",
        explanation: `\`\`\`java
// @Mock — fully faked. Unstubbed methods return null/0/empty, never real logic.
@Mock private OrderRepository orderRepository;

// @Spy — a REAL object. Unstubbed methods run their real implementation.
@Spy private PricingRules pricingRules = new PricingRules();

// @InjectMocks — constructs the subject and feeds the mocks above into it.
@InjectMocks private OrderService orderService;

@Test
void usesRealPricingExceptForTheSurchargeRule() {
    // Stub ONE method on the spy; every other rule keeps its real behaviour.
    // Note doReturn(...).when(spy) — when(spy.surchargeFor(...)) would CALL the
    // real method while setting up the stub. That's how spies surprise people.
    doReturn(new BigDecimal("5.00")).when(pricingRules).surchargeFor(any());

    assertThat(orderService.quote(order)).isEqualByComparingTo("55.00");
}
\`\`\`

\`\`\`java
// THE @InjectMocks TRAP — a dependency with no matching @Mock is silently null.
@ExtendWith(MockitoExtension.class)
class OrderServiceTest {
    @Mock private OrderRepository orderRepository;
    // Someone added a PaymentGateway parameter to OrderService's constructor and
    // didn't add a @Mock for it here. Nothing complains at setup time.
    @InjectMocks private OrderService orderService;

    @Test
    void confirmsOrder() {
        orderService.confirm(1L);   // NullPointerException — paymentGateway is null
    }
}
// Which is why a plain constructor call ages better in tests:
// new OrderService(orderRepository, paymentGateway) stops COMPILING when the
// constructor changes, instead of failing at runtime with an NPE.
\`\`\`

**When a spy is genuinely the right call:** a legacy class doing five things where you need four of them real and one stubbed out — usually the one that hits the network or reads the clock. It's a pragmatic tool for code you can't refactor today. If you're reaching for \`@Spy\` on code you own, that's usually the class telling you it has two responsibilities and wants splitting.

**The Spring-context equivalents are \`@MockitoBean\` and \`@MockitoSpyBean\`** (Boot 3.4+, replacing the now-deprecated \`@MockBean\` and \`@SpyBean\`). Those **replace the bean inside the application context**, so every collaborator that gets it injected receives the fake. That's the difference from \`@Mock\`, which only exists inside your test class and knows nothing about Spring.`,
        followUps: [
          { text: "When would you use a spy instead of a mock?" },
          { text: "What is the difference between `when().thenReturn()` and `doReturn().when()`?" },
          { text: "How do you verify interactions (`verify`, `times`, `never`)?" },
        ],
      },
      {
        id: 129,
        text: "How do you mock a REST API call in a test?",
        answer: "It depends which side you're testing. To test **your own class's logic**, mock the client interface with Mockito — `when(inventoryClient.findStock(\"SKU-1\")).thenReturn(...)` — and no HTTP happens at all. To test **the client itself** — URL building, headers, status handling, JSON deserialization — you need a fake HTTP server. That's `MockRestServiceServer` for `RestTemplate` and `RestClient`, usually via the `@RestClientTest` slice, or **WireMock** for anything else. Mockito tests your code; WireMock tests the contract. The gap people miss is that a Mockito stub happily returns a response shape the real API never sends, so a field-name mismatch survives a completely green suite.",
        explanation: `\`\`\`java
// Testing YOUR logic — the HTTP client is just an interface, so Mockito is enough.
@ExtendWith(MockitoExtension.class)
class OrderServiceTest {
    @Mock private InventoryClient inventoryClient;     // Feign interface, or any client
    @InjectMocks private OrderService orderService;

    @Test
    void rejectsOrderWhenStockIsShort() {
        when(inventoryClient.findStock("SKU-1")).thenReturn(new StockDto("SKU-1", 0));

        assertThatThrownBy(() -> orderService.place(new OrderRequest("SKU-1", 2)))
            .isInstanceOf(InsufficientStockException.class);
    }
    // Fast and focused. But note what it CANNOT catch: if the real /api/stock returns
    // {"quantity": 0} and StockDto maps "available", this test still passes.
}
\`\`\`

\`\`\`java
// Testing the CLIENT ITSELF — real HTTP against a stub server, so URL building,
// headers, status handling and JSON mapping all get genuinely exercised.
@SpringBootTest
@AutoConfigureWireMock(port = 0)
class InventoryClientTest {

    @Autowired InventoryClient inventoryClient;

    @Test
    void mapsServiceUnavailableToRetryableException() {
        stubFor(get(urlEqualTo("/api/stock/SKU-1"))
            .willReturn(aResponse().withStatus(503)));        // downstream is down

        assertThatThrownBy(() -> inventoryClient.findStock("SKU-1"))
            .isInstanceOf(RetryableException.class);          // proves your ErrorDecoder
    }

    @Test
    void surfacesSlowResponseAsATimeout() {
        stubFor(get(urlEqualTo("/api/stock/SKU-2"))
            .willReturn(aResponse().withFixedDelay(5_000)));  // beyond your readTimeout

        assertThatThrownBy(() -> inventoryClient.findStock("SKU-2"))
            .isInstanceOf(FeignException.class);
    }
}
\`\`\`

**The lighter option** for \`RestTemplate\` and \`RestClient\` is \`MockRestServiceServer\`, normally through the \`@RestClientTest\` slice. It intercepts at the client level with no socket involved, so it starts faster than WireMock — but for the same reason it can't reproduce a timeout, a connection reset, or a half-written response body. For \`WebClient\`, use WireMock or OkHttp's \`MockWebServer\`, since \`MockRestServiceServer\` doesn't cover it.

**Testing the failure paths is the part people skip**, and it's where the interesting bugs live. WireMock can return a 503, stall past your read timeout, drop the connection mid-body, or return valid JSON with the wrong shape. Those are precisely the paths your retry policy, \`ErrorDecoder\`, circuit breaker, and fallback exist for — and precisely the ones a Mockito stub can never exercise honestly, because it throws whatever exception you told it to rather than whatever the HTTP stack really produces.`,
        followUps: [
          { text: "How do you mock a Feign client vs WebClient?" },
          { text: "What is WireMock, and when do you prefer it over pure Mockito?" },
          { text: "How do you test timeout and error handling paths?" },
        ],
      },
      {
        id: 130,
        text: "What is `MockMvc`, and how is it used to test controllers?",
        answer: "`MockMvc` calls your controllers **through the real Spring MVC machinery** — routing, argument resolution, validation, message converters, exception handlers — but without starting a server or opening a socket. So you get realistic controller behaviour at close to unit-test speed. You drive it with `mockMvc.perform(get(\"/api/orders/1\"))` and assert with `andExpect(status().isOk())` and `jsonPath(\"$.status\").value(\"CONFIRMED\")`. Pair it with `@WebMvcTest` so only the web layer loads and the services beneath are `@MockitoBean`. What it can't prove is anything below the controller: no repository, no real JSON over the wire, no embedded server.",
        explanation: `\`\`\`java
@WebMvcTest(OrderController.class)
class OrderControllerTest {

    @Autowired MockMvc mockMvc;
    @MockitoBean OrderService orderService;      // @MockBean is deprecated in Boot 3.4+

    @Test
    void returnsOrderAsJson() throws Exception {
        when(orderService.findById(1L)).thenReturn(new OrderDto(1L, "CONFIRMED"));

        mockMvc.perform(get("/api/orders/1").accept(APPLICATION_JSON))
               .andExpect(status().isOk())
               .andExpect(jsonPath("$.id").value(1))
               .andExpect(jsonPath("$.status").value("CONFIRMED"));
    }

    @Test
    void returns400WhenQuantityIsNegative() throws Exception {
        mockMvc.perform(post("/api/orders")
                   .contentType(APPLICATION_JSON)
                   .content("{\\"sku\\":\\"SKU-1\\",\\"quantity\\":-2}"))
               .andExpect(status().isBadRequest());   // proves @Valid is really wired
    }
}
\`\`\`

\`\`\`java
// Secured endpoints — spring-security-test drives the security context for you.
@Test
@WithMockUser(roles = "ADMIN")            // the request runs as an ADMIN principal
void adminCanCancelOrder() throws Exception {
    mockMvc.perform(delete("/api/orders/1").with(csrf()))   // omit csrf() and you get 403
           .andExpect(status().isNoContent());
}

@Test
void anonymousCallerIsRejected() throws Exception {
    mockMvc.perform(delete("/api/orders/1").with(csrf()))
           .andExpect(status().isUnauthorized());
}
\`\`\`

**Standalone setup versus the Spring context.** \`MockMvcBuilders.standaloneSetup(new OrderController(service))\` registers just that one controller against a bare-bones MVC setup, with no application context at all — the fastest option there is. What you lose is everything configured *around* the controller: your \`@ControllerAdvice\` isn't registered, custom converters and argument resolvers aren't applied, and there's no security filter chain. So a test asserting the 404 your exception handler produces passes under \`@WebMvcTest\` and fails standalone. Prefer the slice; keep standalone for a controller with genuinely no framework interaction.

**Know its boundary.** \`MockMvc\` never opens a socket — it invokes \`DispatcherServlet\` directly with a mock request and response. That's what makes it fast while still running the whole MVC pipeline, but it means the embedded server, real connection handling, and everything below your controller go untested. When you want an actual HTTP round trip, that's \`@SpringBootTest(webEnvironment = RANDOM_PORT)\` with \`TestRestTemplate\`.`,
        followUps: [
          { text: "How do you assert JSON paths and status codes with MockMvc?" },
          { text: "What is the difference between standalone setup and full Spring context?" },
          { text: "How do you test secured endpoints with MockMvc?" },
        ],
      },
      {
        id: 131,
        text: "What is Testcontainers, and why would you use it?",
        answer: "Testcontainers starts **real dependencies in Docker containers** for the life of your tests — the same Postgres 16, the same Kafka, the same Redis you run in production — and throws them away afterwards. You use it because the usual alternative, H2, is **a different database wearing a costume**. It has no `jsonb`, no real `ON CONFLICT`, and dialect differences that hand you a green suite and a broken deploy. In Boot 3.1+ you wire it with **`@ServiceConnection`** on the container field and Spring points the datasource at it automatically, with no `@DynamicPropertySource` boilerplate. The costs are real — Docker has to exist on every machine and in CI, and each container adds seconds to startup.",
        explanation: `**Analogy:** H2 is a flight simulator. Good enough to practise the basics, but it doesn't have your aircraft's engine, and only one of the two tells you whether you'll actually make it off the runway.

\`\`\`java
// Boot 3.1+ — @ServiceConnection wires the datasource automatically.
// No @DynamicPropertySource, no URL/username/password plumbing.
@SpringBootTest
@Testcontainers
class OrderRepositoryIT {

    @Container
    @ServiceConnection                     // Boot reads host/port/credentials itself
    static PostgreSQLContainer<?> postgres =
        new PostgreSQLContainer<>("postgres:16-alpine");
    // static = ONE container shared by every test in this class. Non-static starts
    // and stops a fresh Postgres per test method — minutes of pure waste.

    @Autowired OrderRepository orderRepository;

    @Test
    void nativeUpsertWorksOnRealPostgres() {
        // ON CONFLICT ... DO UPDATE is Postgres syntax that H2 rejects outright,
        // so this test can only exist against the real database.
        orderRepository.upsertByClientRef("ref-1", CONFIRMED);
        assertThat(orderRepository.findByClientRef("ref-1")).isPresent();
    }
}
\`\`\`

\`\`\`java
// Same pattern for Kafka — and for Redis, RabbitMQ, Mongo, Elasticsearch.
@Container
@ServiceConnection
static KafkaContainer kafka =
    new KafkaContainer(DockerImageName.parse("confluentinc/cp-kafka:7.6.0"));
// Boot sets spring.kafka.bootstrap-servers from the running container.
\`\`\`

**Why not H2.** It's a different database pretending to be yours. Even in Postgres-compatibility mode it lacks \`jsonb\`, real \`ON CONFLICT\`, partial indexes, and the exact locking and constraint-violation behaviour you depend on. The bugs it lets through are the ones that only surface in production — a native query that won't parse, a unique constraint that fires differently, a migration that works on one engine and not the other. If your tests run Flyway migrations, Testcontainers also verifies **the migrations themselves**, which H2 usually can't do at all.

**Paying for it honestly.** Docker must be available locally and in CI, cold image pulls are slow the first time, and every container adds startup seconds. Mitigate with a **static container per class**, a **singleton container** shared across the whole suite, or **reuse** — \`withReuse(true)\` plus \`testcontainers.reuse.enable=true\` in \`~/.testcontainers.properties\` keeps the container alive between runs. Reuse is a developer-machine optimisation: leave it off in CI, where every build should start from clean state.`,
        followUps: [
          { text: "How do you spin up Postgres/Kafka in integration tests?" },
          { text: "What are the trade-offs vs H2 in-memory databases?" },
          { text: "How do you reuse containers across tests for speed?" },
        ],
      },
      {
        id: 132,
        text: "How do you handle test data setup and teardown in Spring Boot tests?",
        answer: "Default to **`@Transactional` on the test class**: Spring starts a transaction per test method and **rolls it back at the end**, so every test sees a clean database and you write no cleanup code. `@Sql` runs a script before or after a test when you need a bulk fixture, and `@BeforeEach` builds objects in Java when the setup is small enough to read. The rule that keeps a suite healthy is **isolation** — every test creates what it needs and relies on nothing another test left behind. And know where rollback stops working. If the code under test commits on a different thread your transaction can't undo it — exactly the case with `@SpringBootTest(webEnvironment = RANDOM_PORT)` over real HTTP.",
        explanation: `\`\`\`java
// The default: a transaction per test, rolled back when the method ends.
@DataJpaTest              // already transactional; @SpringBootTest needs @Transactional
class OrderRepositoryTest {

    @Autowired OrderRepository orderRepository;
    @Autowired TestEntityManager em;

    @Test
    void findsByStatus() {
        em.persist(new Order("SKU-1", PENDING));
        em.flush();       // WITHOUT flush the INSERT sits in the persistence context
                          // and the repository query below won't see the row
        assertThat(orderRepository.findByStatus(PENDING)).hasSize(1);
    }
    // No cleanup code anywhere. The rollback handles it.
}
\`\`\`

\`\`\`java
// WHERE ROLLBACK QUIETLY STOPS WORKING — a real HTTP call is handled on a server
// thread with its OWN transaction, which commits. Your test can't roll that back.
@SpringBootTest(webEnvironment = RANDOM_PORT)
@Transactional                                  // gives you FALSE confidence here
class OrderApiIT {

    @Autowired TestRestTemplate restTemplate;

    @Test
    void createsOrder() {
        restTemplate.postForEntity("/api/orders", new OrderRequest("SKU-1", 1), Void.class);
        // That row is COMMITTED by the server thread and outlives this test.
        // The next test will see it. Clean up explicitly or reset with @Sql.
    }
}
\`\`\`

**\`@Sql\` for the fixtures that Java setup makes ugly.** \`@Sql("/fixtures/orders.sql")\` runs before the test method, and \`@Sql(scripts = "/cleanup.sql", executionPhase = AFTER_TEST_METHOD)\` runs after it. Use it for bulk reference data or for states that are awkward to express through the entity model. Keep \`@BeforeEach\` for small, readable object graphs — if you have to open another file to work out what the test is doing, the script cost you more than it saved.

**\`@DirtiesContext\` is the expensive one.** It marks the cached application context as polluted, so Spring closes and rebuilds it — and every later test class that would have reused that context now pays full startup again. A single careless \`@DirtiesContext\` can add minutes to a suite. You do need it when a test genuinely mutates shared singleton state (a cache, an in-memory registry, a bean you reconfigured at runtime), but resetting that state in an \`@AfterEach\` is nearly always the cheaper fix.

**Isolation is what keeps the suite trustworthy.** Order-dependent tests pass locally in your IDE and fail in CI when the runner shuffles them, and that failure costs far more to debug than the shared fixture ever saved you.`,
        followUps: [
          { text: "What does `@Transactional` on a test class do for rollback?" },
          { text: "How do you use `@Sql` scripts or `@BeforeEach` fixtures?" },
          { text: "When is `@DirtiesContext` necessary, and why is it expensive?" },
        ],
      },
    ],
  },
  {
    id: "build-git",
    title: "Build Tools, Git & DevOps",
    description:
      "Maven/Gradle, Git workflows, CI/CD, Docker, and Kubernetes basics.",
    icon: "⚙️",
    questions: [
      {
        id: 133,
        text: "What is the difference between Maven and Gradle?",
        answer: "Both compile your code and resolve dependencies — the difference is how you describe the build. **Maven** is declarative XML with a fixed lifecycle, so it's verbose but every Maven project looks the same and any developer can read it. **Gradle** is a Groovy or Kotlin script, so it's far more concise and flexible, at the risk of the build becoming its own codebase nobody wants to touch. Gradle is usually **faster** because of incremental builds and a warm daemon. For a standard Spring Boot service either works, and most teams pick Maven for predictability.",
        explanation: `The same dependency, both ways:

\`\`\`xml
<!-- Maven — pom.xml. No <version>: spring-boot-starter-parent manages it. -->
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-web</artifactId>
</dependency>
\`\`\`

\`\`\`groovy
// Gradle — build.gradle. One line, version managed by the Boot plugin.
dependencies {
    implementation 'org.springframework.boot:spring-boot-starter-web'
}
\`\`\`

**Running a Boot app:** \`mvn spring-boot:run\` or \`./gradlew bootRun\`. Building the JAR: \`mvn clean package\` or \`./gradlew build\`. Both produce the same executable fat JAR.

**Why Maven still wins by default in the Spring world:** the XML is rigid, and rigidity is the feature — there's one obvious way to do things, so a new joiner reads the POM and knows the build. Gradle's speed advantage is real on large multi-module projects, which is why Android standardised on it, but on a single service that builds in 30 seconds you'll never notice it. Use the **wrapper** either way (\`mvnw\` / \`gradlew\`) so CI and every laptop build with the same tool version.`,
        followUps: [
          { text: "What are pros of Gradle's incremental builds and Kotlin DSL?" },
          { text: "Why do many Spring Boot projects still default to Maven?" },
          { text: "How do you run a Boot app with each tool?" },
        ],
      },
      {
        id: 134,
        text: "What is the Maven lifecycle, and what are common phases (compile, test, package, install)?",
        answer: "Maven runs a **fixed, ordered sequence of phases**, and asking for one runs every phase before it too. The default lifecycle is `validate` → `compile` → `test` → `package` → `verify` → `install` → `deploy`. So `mvn package` validates, compiles, runs your unit tests, and only then builds the JAR — you never run these individually. `clean` belongs to a separate lifecycle, which is why you write `mvn clean package` to wipe `target/` first. That cumulative behaviour is the one thing to remember.",
        explanation: `\`\`\`bash
mvn compile        # validate + compile -> target/classes
mvn test           # ...+ run unit tests (surefire)
mvn package        # ...+ build the JAR into target/
mvn verify         # ...+ run integration tests (failsafe)
mvn install        # ...+ copy the JAR into your local ~/.m2 repository
mvn deploy         # ...+ upload it to a remote/company repository

mvn clean verify   # 'clean' is a DIFFERENT lifecycle, so you name it explicitly
\`\`\`

**\`package\` vs \`install\`** is the pair that gets asked. \`package\` leaves the JAR in \`target/\`, where only this project can see it. \`install\` also copies it into your local \`~/.m2\` repository, so **another project on your machine** can declare it as a dependency. You need \`install\` when you're building a shared library locally; for a deployable service, \`package\` is enough.

**Plugins do the actual work.** A phase on its own does nothing — it's a slot that plugin goals bind to. \`maven-compiler-plugin:compile\` binds to \`compile\`, \`maven-surefire-plugin:test\` binds to \`test\`, and \`spring-boot-maven-plugin:repackage\` binds to \`package\`, which is what turns a plain JAR into an executable fat JAR. That's why \`mvn package\` on a Boot project gives you something \`java -jar\` can run.

**Surefire vs Failsafe** explains \`verify\`: Surefire runs \`*Test\` classes at the \`test\` phase and **fails the build immediately**, while Failsafe runs \`*IT\` classes at \`integration-test\` and defers failure to \`verify\` so cleanup still happens. That's why integration tests get the \`IT\` suffix.`,
        followUps: [
          { text: "What is the difference between `package` and `install`?" },
          { text: "How do plugins bind to lifecycle phases?" },
          { text: "What does `mvn clean verify` run?" },
        ],
      },
      {
        id: 135,
        text: "What is dependency management in Maven, and how do you resolve version conflicts?",
        answer: "Maven pulls **transitive dependencies** automatically, so two libraries you declared can each drag in a different version of the same jar. Maven picks one by **nearest-wins**: the version at the shallowest depth in the dependency tree, with ties going to whichever was declared first. You see the whole picture with `mvn dependency:tree`. To take control, pin the version yourself in `<dependencyManagement>` or import a **BOM** — which is exactly what `spring-boot-starter-parent` does — and use `<exclusions>` to cut a specific transitive jar. The reason this matters is that getting it wrong fails at **runtime** with `NoSuchMethodError`, not at build time.",
        explanation: `\`\`\`bash
$ mvn dependency:tree
[INFO] com.acme:order-service
[INFO] +- org.springframework.boot:spring-boot-starter-web:3.3.0
[INFO] |  \\- com.fasterxml.jackson.core:jackson-databind:2.17.1
[INFO] \\- com.acme:legacy-client:2.4.0
[INFO]    \\- com.fasterxml.jackson.core:jackson-databind:2.9.0   (omitted for conflict)
#          ^ two versions wanted; 2.17.1 wins because it sits one level shallower.
#            If 2.9.0 had won, Spring would call methods that don't exist there
#            and you'd get NoSuchMethodError on the first request, not at build.
\`\`\`

\`\`\`xml
<!-- Fixing it: exclude the transitive jar, or pin the version centrally. -->
<dependency>
    <groupId>com.acme</groupId>
    <artifactId>legacy-client</artifactId>
    <version>2.4.0</version>
    <exclusions>
        <exclusion>   <!-- no <version> tag on an exclusion -->
            <groupId>com.fasterxml.jackson.core</groupId>
            <artifactId>jackson-databind</artifactId>
        </exclusion>
    </exclusions>
</dependency>
\`\`\`

**What a BOM buys you.** \`spring-boot-starter-parent\` (or importing \`spring-boot-dependencies\` with \`<scope>import</scope>\` if you already have a corporate parent) carries a \`dependencyManagement\` block pinning hundreds of libraries to versions Spring tested together. That's why you declare Spring dependencies **with no \`<version>\` tag** — and why adding one by hand is a common way to break an app that was working.

**Useful second command:** \`mvn dependency:tree -Dincludes=com.fasterxml.jackson.core\` filters a large tree down to the one library you're chasing, which beats reading 400 lines of output.`,
        followUps: [
          { text: "What is nearest-wins and dependency mediation?" },
          { text: "How does `dependencyManagement` / BOM help (e.g., Spring Boot parent)?" },
          { text: "How do you find and exclude transitive dependencies?" },
        ],
      },
      {
        id: 136,
        text: "What is the difference between `git merge` and `git rebase`?",
        answer: "**`git merge`** joins two branches with a **merge commit**, preserving the true history including the fact that work happened in parallel. **`git rebase`** replays your commits one at a time on top of the target branch, giving a **linear history** with no merge commit. The catch is that every replayed commit is a **new commit with a new hash**. That rewriting is the whole rule. Rebase your own local branch to tidy it before opening a PR; merge when you're combining branches other people have. Never rebase anything someone else has already pulled.",
        explanation: `\`\`\`bash
# Starting point: you branched off main, then main moved on.
#   main    A---B---C
#                \\
#   feature        D---E

git merge main      # -> a merge commit M ties both histories together
#   main    A---B---C
#                \\       \\
#   feature        D---E---M     history shows the branch really existed

git rebase main     # -> D and E are REPLAYED on top of C as new commits
#   feature A---B---C---D'---E'   linear, but D' and E' have new hashes
\`\`\`

**Why rewriting hashes is dangerous on a shared branch.** If a colleague has pulled \`D\` and \`E\`, and you rebase and force-push \`D'\` and \`E'\`, their Git sees commits that no longer exist upstream and commits you don't have. Their next pull creates duplicates of the same changes, and someone ends up reverting the wrong one. The safe rule: **rebase only commits that exist nowhere but your machine.**

**Conflicts feel different in each.** A merge stops once and you fix everything in a single resolution, then \`git commit\`. A rebase stops **per replayed commit**, so a five-commit branch can hand you the same conflict five times — you fix, \`git add\`, \`git rebase --continue\`, repeat. Either way \`--abort\` puts you back exactly where you started.

**What linear history buys you** is readable \`git log\` and usable \`git bisect\`: every commit is a real state of the project, so bisecting to find the commit that introduced a bug actually converges. A history dense with merge commits makes both harder to read. Common team compromise: rebase your feature branch onto \`main\` to keep it current, then merge the PR with a merge commit or a squash so \`main\` records one entry per feature.`,
        followUps: [
          { text: "When is rebase dangerous on shared branches?" },
          { text: "What does a linear history buy you?" },
          { text: "How do you resolve conflicts in each workflow?" },
        ],
      },
      {
        id: 137,
        text: "What is a merge conflict, and how do you resolve it?",
        answer: "A conflict happens when two branches changed **the same lines of the same file** and Git can't decide which version to keep. Git stops, writes both versions into the file between `<<<<<<<`, `=======`, and `>>>>>>>` markers, and waits for you. You resolve it by editing the file into what the code should actually be, markers deleted, then `git add` that file. Finish with `git commit` for a merge, or `git rebase --continue` for a rebase. If it's going badly, `git merge --abort` or `git rebase --abort` puts you back exactly where you started. The real fix is prevention: small branches merged often.",
        explanation: `\`\`\`java
public BigDecimal total() {
<<<<<<< HEAD                          // what's on the branch you're merging INTO
    return subtotal.add(shippingFee);
=======                               // the dividing line
    return subtotal.add(taxAmount);
>>>>>>> feature/add-tax              // what's coming FROM the other branch
}

// Resolve by writing the code you actually want — often BOTH changes, not either:
public BigDecimal total() {
    return subtotal.add(shippingFee).add(taxAmount);
}
// Then: git add PricingService.java && git rebase --continue
\`\`\`

**Read the markers correctly.** The top block is **HEAD** — where you currently are, which in a rebase is confusingly the *target* branch, not your work. The bottom is the incoming change. That inversion during a rebase is why people resolve conflicts backwards and discard their own commit; check with \`git status\`, which names both sides explicitly.

**Useful escape hatches:** \`git merge --abort\` / \`git rebase --abort\` cancel cleanly at any point. \`git checkout --ours <file>\` and \`--theirs <file>\` take one side wholesale for files where merging line-by-line is meaningless, like a regenerated lockfile. And \`git diff\` during a conflict shows only the conflicted regions.

**Prevention is the real answer**, and it's what an interviewer is listening for. Conflicts scale with **how long a branch lives and how much it touches**. A branch open for two weeks that reformats a shared class will conflict with everything; a branch merged daily rarely conflicts at all. Pull \`main\` into your branch often rather than at the end, keep PRs small, and agree formatting rules in the toolchain so nobody's IDE reformats a file and collides with every other change in it.`,
        followUps: [
          { text: "What markers appear in conflicted files?" },
          { text: "How do you abort a merge or rebase mid-conflict?" },
          { text: "How do code reviews help prevent painful conflicts?" },
        ],
      },
      {
        id: 138,
        text: "What is the difference between `git fetch` and `git pull`?",
        answer: "**`git fetch`** downloads new commits from the remote and updates your remote-tracking branches like `origin/main`, but changes **nothing** in your working directory or your current branch. **`git pull`** is `fetch` followed immediately by `merge` — so it moves your branch, touches your files, and can drop you into a conflict on the spot. Fetch is always safe; pull is the one that surprises you. Fetch first when you want to see what landed before integrating it, especially on a branch you're mid-way through.",
        explanation: `\`\`\`bash
git fetch origin                  # safe: updates origin/main, touches nothing of yours
git log --oneline HEAD..origin/main   # what landed that I don't have?
git diff HEAD origin/main             # what would actually change?
git merge origin/main                 # integrate, now that you've looked

git pull                          # = fetch + merge, all in one, no chance to look
git pull --rebase                 # = fetch + rebase: replays YOUR commits on top
\`\`\`

**\`git pull --rebase\` is the one worth adopting.** A plain \`pull\` on a branch where you have local commits creates a merge commit every time, so a busy shared branch fills with "Merge branch 'main' of github.com..." noise that says nothing. \`--rebase\` replays your local commits on top of what you fetched instead, keeping the history linear. Make it the default with \`git config --global pull.rebase true\`. The same rebase caution applies — it's fine here because it's rewriting **your own unpushed commits**.

**A fast-forward merge** is what happens when your branch has no commits of its own and the remote has simply moved ahead: Git doesn't need a merge commit, it just slides your branch pointer forward to the newer commit. That's why pulling on an untouched \`main\` produces no merge commit at all, and why "fast-forward" shows up in the output.`,
        followUps: [
          { text: "What does `git pull --rebase` do?" },
          { text: "Why might you prefer fetch + inspect before merging?" },
          { text: "What is a fast-forward merge?" },
        ],
      },
      {
        id: 139,
        text: "What is CI/CD, and have you worked with any pipelines (Jenkins, GitHub Actions)?",
        answer: "**CI** means every push automatically builds the project and runs the test suite, so integration problems show up in minutes instead of at merge time. **CD** takes that verified build onward. **Continuous delivery** means every green build is *deployable* and a human clicks release; **continuous deployment** means it ships automatically with no gate. A typical Spring Boot pipeline is: build and unit test, integration tests, build a Docker image, push it to a registry, deploy to staging, then production. The rule that makes any of it worth having is that the pipeline is the **only** path to production, and a red build blocks the merge.",
        explanation: `\`\`\`yaml
# .github/workflows/build.yml — a realistic minimum for a Spring Boot service
name: build
on: [push, pull_request]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-java@v4
        with:
          java-version: '21'
          distribution: 'temurin'
          cache: maven                  # cache ~/.m2 or every build re-downloads it

      - run: ./mvnw clean verify        # compile + unit tests + integration tests

      - name: Build and push image
        if: github.ref == 'refs/heads/main'    # only from main, not from every PR
        run: |
          ./mvnw spring-boot:build-image -DskipTests
          echo "\${{ secrets.REGISTRY_TOKEN }}" | docker login -u ci --password-stdin
          docker push ghcr.io/acme/order-service:\${{ github.sha }}
\`\`\`

**Tag images with the commit SHA, not \`latest\`.** \`latest\` is mutable, so you can never say with certainty which code is running in production, and a rollback has nothing specific to roll back *to*. The SHA gives you an exact, immutable link from a running container to a line of code.

**Secrets never live in the repo.** Use the CI provider's secret store — GitHub Actions secrets, Jenkins credentials — injected as environment variables at run time, and scoped per environment so a PR build can't reach production credentials. They're masked in logs, but that masking is best-effort, so don't echo them. If one leaks, **rotate it**; deleting the commit doesn't help, since the value is in the reflog and on every clone.

**Delivery vs deployment** is the distinction interviewers actually probe. Continuous *delivery* stops at a human approval gate, which is what most teams with a real change-management process run. Continuous *deployment* removes the gate entirely, and it only works if you genuinely trust the tests — plus feature flags and fast rollback to limit the blast radius of a bad change.`,
        followUps: [
          { text: "What stages would you put in a Spring Boot pipeline?" },
          { text: "How do you keep secrets in CI?" },
          { text: "What is the difference between continuous delivery and continuous deployment?" },
        ],
      },
      {
        id: 140,
        text: "What is Docker, and how do you containerize a Spring Boot application?",
        answer: "Docker packages your application together with its runtime and dependencies into an **image**, which runs identically on any machine with Docker — that's what kills \"works on my machine\". For a Spring Boot app the minimum is a `Dockerfile` that starts from a JRE base image, copies the fat JAR in, and sets `ENTRYPOINT [\"java\",\"-jar\",\"app.jar\"]`. Better is a **multi-stage build**: one stage with the JDK and Maven to compile, and a final stage holding only a JRE and the JAR. That way you don't ship your source code and build tools to production. You can also skip the Dockerfile entirely with `./mvnw spring-boot:build-image`, which uses Cloud Native Buildpacks.",
        explanation: `\`\`\`bash
# Stage 1 — build. Needs the full JDK and Maven; none of it ships.
FROM maven:3.9-eclipse-temurin-21 AS build
WORKDIR /app
COPY pom.xml .
RUN mvn dependency:go-offline        # cached layer: only re-runs when pom.xml changes
COPY src ./src
RUN mvn clean package -DskipTests

# Stage 2 — run. Only a JRE and the JAR: smaller image, smaller attack surface.
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
RUN addgroup -S app && adduser -S app -G app   # don't run as root
USER app
COPY --from=build /app/target/*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
\`\`\`

**Why a JRE-only final stage.** A JDK image carries a compiler, debugging tools, and often a shell you have no use for at runtime — that's hundreds of megabytes of extra download on every pull and a much larger surface for a CVE scanner to flag. Copying only the JAR into a JRE base typically takes the image from ~500MB to ~200MB, and less on Alpine.

**Layer ordering is what makes rebuilds fast.** Docker caches each instruction and invalidates everything after the first change. Copying \`pom.xml\` and resolving dependencies *before* copying \`src\` means a code-only change reuses the cached dependency layer instead of re-downloading the internet. Boot's **layered JARs** take this further, splitting dependencies from application classes so a code change ships a few hundred KB rather than the whole fat JAR.

**Configuration comes in as environment variables**, never baked into the image — that's the whole point of one artifact per build. \`docker run -e SPRING_PROFILES_ACTIVE=prod -e SPRING_DATASOURCE_URL=... -p 8080:8080 order-service:abc123\`. Relaxed binding maps those underscored names onto \`spring.datasource.url\`, so no code or image change is needed per environment.`,
        followUps: [
          { text: "What would a multi-stage Dockerfile for a Boot JAR look like at a high level?" },
          { text: "Why use a JRE-only base image in the final stage?" },
          { text: "How do you pass env vars / profiles into a container?" },
        ],
      },
      {
        id: 141,
        text: "What is the purpose of a Dockerfile vs docker-compose?",
        answer: "A **Dockerfile** describes how to build **one image**. **docker-compose** describes how to run **several containers together** — your app plus Postgres plus Redis. Their networks, volumes, ports, and environment all sit in one `docker-compose.yml`, started with a single `docker compose up`. They're not alternatives: compose normally *builds* from your Dockerfile and then runs that image alongside its dependencies. Compose is a local-development and small-deployment tool. On Kubernetes you don't use it at all, because Deployments and Services do that job.",
        explanation: `\`\`\`yaml
# docker-compose.yml — the whole local stack in one command
services:
  app:
    build: .                    # builds using your Dockerfile
    ports: ["8080:8080"]
    environment:
      SPRING_PROFILES_ACTIVE: dev
      SPRING_DATASOURCE_URL: jdbc:postgresql://db:5432/orders   # 'db' = service name
    depends_on:
      db: { condition: service_healthy }   # wait for READY, not just started

  db:
    image: postgres:16-alpine
    environment:
      POSTGRES_DB: orders
      POSTGRES_PASSWORD: devonly
    volumes: ["pgdata:/var/lib/postgresql/data"]   # survives 'docker compose down'
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 5s

volumes:
  pgdata:
\`\`\`

**Networking is the part that surprises people.** Compose puts every service on a shared network and makes each reachable **by its service name** — so the app connects to \`db:5432\`, not \`localhost:5432\`, because inside a container \`localhost\` is that container. The \`ports:\` mapping is only for reaching a container **from your laptop**; containers talking to each other don't need it.

**Volumes** persist data outside the container's writable layer. Without \`pgdata\`, every \`docker compose down\` wipes your local database; with it, the data outlives the container. A bind mount (\`./src:/app/src\`) instead maps a host directory in, which is handy for live-reloading config during development.

**Not for production Kubernetes.** Compose has no scheduling, no self-healing, no rolling updates, no autoscaling, and no multi-node story. Kubernetes replaces it with Deployments, Services, and ConfigMaps. Compose stays genuinely useful for local development and CI — and it's worth noting **Testcontainers covers the same ground for integration tests**, starting the same dependencies from inside the test itself.`,
        followUps: [
          { text: "When do you use compose for local dev with DB + app + Redis?" },
          { text: "How do volumes and networks work in compose?" },
          { text: "Is compose typically used in production Kubernetes environments?" },
        ],
      },
      {
        id: 142,
        text: "What is Kubernetes, and what is its role in deploying microservices?",
        answer: "Kubernetes is a **container orchestrator**. You declare the desired state — ten replicas of this image, this much memory, this port — and it continuously makes reality match. That means restarting crashed containers, rescheduling off dead nodes, and rolling out new versions without downtime. For microservices it supplies the platform work you'd otherwise build yourself: **service discovery** through cluster DNS, load balancing, config and secrets, health checking, and autoscaling. The four objects worth being able to name:\n\n- **Pod** — one or more containers running together, sharing a network namespace\n- **Deployment** — keeps N pods of a version alive and handles rolling updates\n- **Service** — a stable address and load balancer in front of changing pods\n- **Ingress** — routes external HTTP traffic into the cluster",
        explanation: `\`\`\`yaml
apiVersion: apps/v1
kind: Deployment                    # keeps 3 pods running; handles the rolling update
metadata: { name: order-service }
spec:
  replicas: 3
  template:
    spec:
      containers:
        - name: order-service
          image: ghcr.io/acme/order-service:abc123    # the commit SHA, never :latest
          ports: [{ containerPort: 8080 }]
          env:
            - name: SPRING_PROFILES_ACTIVE
              value: prod
          livenessProbe:            # failing => RESTART the container
            httpGet: { path: /actuator/health/liveness, port: 8080 }
          readinessProbe:           # failing => remove from the Service, no restart
            httpGet: { path: /actuator/health/readiness, port: 8080 }
          resources:
            requests: { memory: "512Mi", cpu: "250m" }   # what the scheduler reserves
            limits:   { memory: "1Gi",   cpu: "1000m" }  # exceed memory => OOMKilled
\`\`\`

**The probes are where Kubernetes meets Spring Boot**, and it's the detail worth getting right. Actuator exposes \`/actuator/health/liveness\` and \`/actuator/health/readiness\` once the probes are enabled — automatic when Boot detects Kubernetes. **Liveness failing restarts the container**; **readiness failing only pulls the pod out of the Service** load balancer. Put a database check in the *liveness* probe and a brief DB blip restarts your entire fleet at once, turning a short outage into a much longer one. Dependency checks belong in **readiness**; liveness should fail only when the JVM itself is unrecoverable.

**Why this replaces most of Spring Cloud.** A **Service** gives you a stable DNS name and load balancing, so \`http://order-service:8080\` works without Eureka. **ConfigMaps and Secrets** cover externalized config without a Config Server. **Ingress** handles edge routing. What Kubernetes can't do is in-process behaviour — a circuit breaker, a fallback, a retry with jitter — which is why Resilience4j stays.

**Horizontal Pod Autoscaling** watches a metric, typically CPU or a custom Micrometer metric, and adjusts \`replicas\` between a floor and a ceiling. It only works if your app is **stateless**, since any pod can vanish at any time — which is the same constraint that makes sticky sessions and in-memory rate limiting a bad idea.`,
        followUps: [
          { text: "What are Pod, Deployment, Service, and Ingress?" },
          { text: "How do liveness and readiness probes relate to Spring Actuator?" },
          { text: "What is horizontal pod autoscaling at a high level?" },
        ],
      },
    ],
  },
  {
    id: "system-design",
    title: "System Design / Scenarios",
    description:
      "Practical design scenarios: scaling, caching, async processing, and production debugging.",
    icon: "🏗️",
    questions: [
      {
        id: 143,
        text: "How would you design a URL shortener service?",
        answer: "Two endpoints: `POST /urls` stores the long URL and returns a short code, and `GET /{code}` looks it up and issues a **redirect**. The interesting parts are code generation and read scale. Generate codes by **base62-encoding an auto-increment id** — seven characters covers 3.5 trillion URLs — rather than hashing the URL, because hashes collide and force a retry loop. Traffic is overwhelmingly **read-heavy**, often 100:1, so the redirect path should hit **Redis** with the database only as a fallback. Use a **302** rather than a 301 if you want click analytics, because browsers cache a 301 and you never see the second click.",
        explanation: `\`\`\`sql
-- The whole schema. Note what's indexed and what isn't.
CREATE TABLE short_url (
    id          BIGSERIAL PRIMARY KEY,      -- the counter we base62-encode
    code        VARCHAR(10) UNIQUE NOT NULL, -- unique index = the lookup path
    long_url    TEXT        NOT NULL,
    owner_id    BIGINT,
    expires_at  TIMESTAMPTZ,                 -- NULL = never expires
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_short_url_owner ON short_url(owner_id);
-- Click events go in a SEPARATE table (or a stream), never as a counter
-- column here — every redirect would otherwise UPDATE the same hot row.
\`\`\`

\`\`\`java
@GetMapping("/{code}")
public ResponseEntity<Void> redirect(@PathVariable String code) {
    // Cache first: this is the 99% path and it should never touch Postgres.
    String longUrl = cache.get(code, () -> repository.findByCode(code)
            .filter(u -> u.getExpiresAt() == null || u.getExpiresAt().isAfter(now()))
            .map(ShortUrl::getLongUrl)
            .orElseThrow(() -> new CodeNotFoundException(code)));

    clickPublisher.publish(code);   // async — never block the redirect on analytics

    return ResponseEntity.status(HttpStatus.FOUND)   // 302, so we see repeat clicks
            .location(URI.create(longUrl))
            .build();
}
\`\`\`

**Why base62 over a hash.** Encoding a monotonic id is collision-free by construction — id 1 is \`b\`, id 125 is \`cb\`, and no two ids ever produce the same string. Hashing the long URL means checking whether the code already exists and retrying on collision, which adds a read to every write. The one downside is that sequential ids make codes **guessable and enumerable**; if that matters, encode \`id XOR secret\` or draw ids from a shuffled range. For multiple instances, hand each one a **block of ids** (a Redis \`INCRBY\` of 1000) so they don't contend on a single sequence.

**Custom aliases and expiry** are small additions: an alias is just a user-supplied \`code\` that has to pass the unique constraint, so let the database arbitrate and return **409** on violation rather than checking first, which races. Expiry is a nullable \`expires_at\` checked on read, plus a nightly job deleting old rows — check on read regardless, since a cached entry can outlive its own expiry.`,
        followUps: [
          { text: "How do you generate unique short codes at scale (hash vs base62 counter)?" },
          { text: "How would you handle custom aliases and expiration?" },
          { text: "What is the read/write ratio, and how does that affect caching?" },
        ],
      },
      {
        id: 144,
        text: "How would you design a rate limiter for an API?",
        answer: "You cap how many requests a client can make in a time window, keyed by API key, user id, or IP. **Token bucket** is the usual pick: the bucket refills at a steady rate and each request spends a token, so short bursts are allowed while the long-run average stays capped. That's what Spring Cloud Gateway's `RequestRateLimiter` implements. The critical design point is that the counters must live **outside the instance**, in Redis. Keep them in memory and each pod enforces its own separate limit, so ten pods means ten times the intended rate. Reject with **429** plus a `Retry-After` header so clients back off instead of hammering.",
        explanation: `\`\`\`yaml
# Spring Cloud Gateway — token bucket, counters in Redis so all instances share them
spring:
  cloud:
    gateway:
      routes:
        - id: order-service
          uri: lb://order-service
          predicates: [Path=/api/orders/**]
          filters:
            - name: RequestRateLimiter
              args:
                redis-rate-limiter.replenishRate: 20    # sustained requests/second
                redis-rate-limiter.burstCapacity: 40    # bucket size = burst allowance
                key-resolver: "#{@apiKeyResolver}"      # bucket per API key, not per IP
\`\`\`

\`\`\`java
// Doing it in a service instead — the check must be ATOMIC or two concurrent
// requests both read "19 used" and both pass, letting you exceed the limit.
public boolean tryConsume(String apiKey) {
    String key = "rl:" + apiKey + ":" + (now().getEpochSecond() / 60);   // per-minute
    Long count = redis.opsForValue().increment(key);   // INCR is atomic; read-then-write is not
    if (count == 1) redis.expire(key, Duration.ofMinutes(2));  // let old windows die
    return count <= 100;
}
// Exceeded -> 429 with Retry-After, plus X-RateLimit-Remaining so good clients self-regulate.
\`\`\`

**The three algorithms.** **Fixed window** counts per calendar minute — trivial to implement, but it allows a **double burst at the boundary**: 100 requests at 11:59:59 and 100 more at 12:00:00 is 200 in one second. **Sliding window** fixes that by weighting the previous window, at the cost of more state. **Token bucket** refills continuously and allows a controlled burst, which suits real traffic best. **Leaky bucket** drains at a fixed rate and smooths output completely, which is what you want protecting a fragile downstream that can't absorb bursts at all.

**Gateway, service, or both — both, for different reasons.** The **gateway** does the coarse per-client limit and keeps junk traffic off your fleet entirely. **Individual services** protect specific expensive endpoints — a report that runs a 30-second query needs its own much lower limit than a cache-backed lookup. Rate limiting only at the service means the traffic already cost you a network hop and a thread; only at the gateway means one expensive endpoint can still be hammered inside your limit.`,
        followUps: [
          { text: "Compare token bucket, leaky bucket, and fixed window algorithms." },
          { text: "How would you implement rate limiting with Redis in Spring?" },
          { text: "Should rate limiting live in the gateway, service, or both?" },
        ],
      },
      {
        id: 145,
        text: "How would you handle a scenario where an API needs to process a large file upload without blocking the main thread?",
        answer: "Ideally the file never passes through your API at all. Use a **pre-signed URL**: the client asks your service for a short-lived S3 URL, uploads **directly to object storage**, then tells you the key. Your JVM never touches the bytes, so file size stops being your problem. If it must go through the service, **stream it** with `MultipartFile.getInputStream()` and never `getBytes()`, which loads the whole file into heap and OOMs the pod. Then do the work **asynchronously**: accept the upload, return **202 Accepted** with a job id, and let a worker process it while the client polls that id for status. Set `spring.servlet.multipart.max-file-size` deliberately, because the default is 1MB.",
        explanation: `\`\`\`java
// GOOD — accept, hand off, return immediately. The HTTP thread is free in ~50ms.
@PostMapping("/api/imports")
public ResponseEntity<ImportJobDto> upload(@RequestParam MultipartFile file) {
    if (file.getSize() > MAX_BYTES) throw new PayloadTooLargeException();

    ImportJob job = importJobService.create(file.getOriginalFilename());  // status=PENDING

    // Stream straight to storage — never file.getBytes(), which is the whole file in heap.
    try (InputStream in = file.getInputStream()) {
        storage.put(job.getStorageKey(), in, file.getSize());
    }
    importQueue.publish(new ImportRequested(job.getId()));   // a worker picks this up

    return ResponseEntity.accepted()                          // 202, not 200
            .body(ImportJobDto.from(job));                    // client polls /api/imports/{id}
}
\`\`\`

\`\`\`yaml
# Defaults will bite you: max-file-size is 1MB out of the box.
spring:
  servlet:
    multipart:
      max-file-size: 100MB
      max-request-size: 120MB      # must exceed max-file-size (multipart overhead)
      file-size-threshold: 2KB     # spill to disk above this instead of buffering in heap
server:
  tomcat:
    connection-timeout: 20s
    max-swallow-size: -1           # don't truncate a rejected upload's body mid-stream
\`\`\`

**Why pre-signed URLs win.** A 2GB upload through your service occupies a request thread for minutes, counts against your pod's memory and network, and dies entirely if you deploy mid-upload. With a pre-signed URL the client talks to S3 directly, gets **multipart upload and resume for free**, and your service handles two tiny JSON calls instead. The trade is that you must validate **after** the fact — check the content type and size on the stored object before processing, since you no longer see the bytes on the way in.

**Reporting progress and failures** is what makes 202 usable. The job id addresses a status resource returning \`PENDING\`, \`RUNNING\`, \`COMPLETED\`, or \`FAILED\` with an error message and, for a row-oriented import, a per-row error report. Polling every few seconds is fine and far simpler than WebSockets; use Server-Sent Events only if the UX genuinely needs live progress. Make the worker **idempotent on job id** so a redelivered queue message doesn't import the same file twice.`,
        followUps: [
          { text: "Would you use async processing, streaming, or object storage direct upload?" },
          { text: "How do you report progress and failures to the client?" },
          { text: "What timeouts and size limits would you configure?" },
        ],
      },
      {
        id: 146,
        text: "How would you design a notification service that sends emails/SMS asynchronously?",
        answer: "It **consumes events** rather than exposing a synchronous API — `OrderPlaced` lands on a queue and the notification service decides what to send to whom. That's the central decision: the order service must never wait on email, or a broken SMTP provider fails checkout. Internally it resolves the user's channel preferences, renders a **template**, and calls the provider through an adapter so Twilio or SES can be swapped. Retries use **exponential backoff** with a dead-letter queue for messages that keep failing. Store a record of every send keyed by the **event id**, because at-least-once delivery means a redelivery would otherwise email the customer twice.",
        explanation: `\`\`\`java
@KafkaListener(topics = "order-events", groupId = "notification-service")
public void on(OrderPlaced event) {
    // IDEMPOTENCY FIRST — this listener WILL see the same event twice.
    // Unique index on (event_id, channel) lets the DB arbitrate; a select-then-insert races.
    if (!sendLog.claim(event.eventId(), EMAIL)) {
        log.debug("already sent for {}, skipping", event.eventId());
        return;
    }

    UserPrefs prefs = prefsService.forUser(event.userId());
    if (!prefs.wants(ORDER_CONFIRMATION, EMAIL)) return;     // respect opt-out
    if (rateLimiter.exceeded(event.userId())) return;        // no notification storms

    Rendered body = templates.render("order-confirmation", prefs.locale(), event);
    emailProvider.send(prefs.email(), body);                 // retried by the container
}
\`\`\`

**Retries without spamming.** The rule is that a retry must never produce a second delivery, so idempotency comes before backoff, not after. Distinguish **retryable** failures (a 503 from the provider, a timeout — retry with exponential backoff and jitter) from **permanent** ones (invalid address, hard bounce, user opted out — do not retry, mark failed, and suppress that address). Cap attempts and send the rest to a **DLT** with an alert. Then add a **per-user rate cap** on top: a bulk job touching 10,000 orders shouldn't put 200 emails in one person's inbox, and that limit is separate from provider-level retry logic.

**Templating at scale** means the template lives outside the code — in the database or object storage — so marketing can change copy without a deploy, with a rendering engine like Thymeleaf or Handlebars applied per **locale**. Pass the template a small explicit context object rather than your domain entity, or you'll leak internal fields into an email. Version the templates so a send record can say which version produced it, and keep a preview endpoint, because a broken template discovered in production is a broken template that already reached customers.`,
        followUps: [
          { text: "How do you ensure delivery retries without spamming users?" },
          { text: "What role do message queues play in this design?" },
          { text: "How do you template and personalize notifications at scale?" },
        ],
      },
      {
        id: 147,
        text: "How do you handle caching in a Spring Boot application (`@Cacheable`, Redis)?",
        answer: "Put **`@Cacheable`** on the method and `@EnableCaching` on a config class: Spring stores the return value keyed by the arguments, and the next call with the same arguments skips the method body entirely. Back it with **Redis** rather than the default in-memory map, so every instance shares one cache and a restart doesn't cold-start it. **`@CachePut`** always runs the method and updates the entry, and **`@CacheEvict`** removes one — you need those two to stop serving data you've just changed. Always set a **TTL**, so a stale entry heals itself instead of persisting forever. And remember it's proxy-based AOP: a call from inside the same class bypasses the cache completely.",
        explanation: `\`\`\`java
@Service
public class ProductService {

    @Cacheable(value = "products", key = "#id")      // miss -> run method, store result
    public ProductDto findById(Long id) {
        return repository.findById(id).map(ProductDto::from).orElseThrow();
    }

    @CachePut(value = "products", key = "#product.id")  // ALWAYS runs, refreshes the entry
    public ProductDto update(ProductDto product) {
        return ProductDto.from(repository.save(product.toEntity()));
    }

    @CacheEvict(value = "products", key = "#id")        // remove on delete
    public void delete(Long id) { repository.deleteById(id); }

    public ProductDto refreshThenRead(Long id) {
        update(fetchLatest(id));
        return findById(id);   // SELF-INVOCATION: bypasses the proxy, so NOT cached
    }                          // same trap as @Transactional — the call never leaves 'this'
}
\`\`\`

\`\`\`yaml
spring:
  cache:
    type: redis
    redis:
      time-to-live: 10m          # a default TTL on EVERY entry — never cache forever
      cache-null-values: false   # or a null result gets cached and hides new data
  data:
    redis:
      host: redis
\`\`\`

**Choosing TTLs and keys.** The TTL is a **staleness budget**: how out-of-date may this data be before someone is harmed? Product descriptions tolerate an hour, stock levels maybe seconds, a permission check arguably nothing. Pick it from that question, not from a round number. Keys must include **everything that changes the result** — a per-user response keyed only by product id serves user A's data to user B, which is a data-leak bug rather than a performance one. Prefer an explicit \`key = "#id + ':' + #locale"\` over the default key generator, which quietly changes meaning when someone adds a parameter.

**Cache stampede** is what happens when a hot key expires and a hundred concurrent requests all miss simultaneously, all hitting the database with the identical query — the load spike arrives exactly when the cache stops protecting you. Mitigate by **staggering TTLs with jitter** so keys don't expire together, and for genuinely hot keys by letting only one caller recompute while the others briefly serve the stale value or wait on a short lock. Caffeine's \`refreshAfterWrite\` does this by refreshing asynchronously while continuing to serve the old value.`,
        followUps: [
          { text: "What is the difference between `@Cacheable`, `@CachePut`, and `@CacheEvict`?" },
          { text: "How do you choose TTLs and cache keys?" },
          { text: "What is cache stampede, and how do you mitigate it?" },
        ],
      },
      {
        id: 148,
        text: "How would you scale a Spring Boot application to handle increased traffic?",
        answer: "**Measure before you scale**, because adding instances usually isn't what helps first. Look at where the time actually goes: an N+1 query, a missing index, or an exhausted connection pool will not improve at all when you double the pods. Once the app itself is sane, scale **horizontally** — more instances behind a load balancer — since that's the only axis that keeps going and it's what Kubernetes does natively. The hard prerequisite is that the service is **stateless**: no in-memory session, no local files, no in-memory counters, so any instance can serve any request. Expect the **database to be the next bottleneck**, because twenty pods contending on one Postgres just moves the queue.",
        explanation: `\`\`\`yaml
# The setting that surprises people: 20 pods x 10 connections = 200 connections,
# against a Postgres whose default max_connections is 100. Scaling out here takes
# the database DOWN rather than making anything faster.
spring:
  datasource:
    hikari:
      maximum-pool-size: 10        # per instance — multiply by replica count
      connection-timeout: 3000     # fail fast instead of queueing forever
  jpa:
    properties:
      hibernate:
        jdbc:
          batch_size: 50           # batch inserts instead of one round trip per row
        default_batch_fetch_size: 25   # blunt but effective N+1 mitigation
\`\`\`

**Vertical versus horizontal.** Vertical means a bigger machine — more CPU and RAM for one instance. It's the quickest fix, needs no code change, and is sometimes exactly right, but it **caps out** at the largest instance you can buy, requires a restart to change, and leaves you a single point of failure. Horizontal means more instances behind a load balancer: effectively unlimited headroom, no restart to scale, and redundancy included. The catch is that it only works for **stateless** services, which is why in-memory HTTP sessions, local file uploads, and in-memory rate-limit counters all have to move to Redis or object storage first. Once they have, a Kubernetes HPA can add pods on CPU or a custom metric automatically.

**The order bottlenecks actually appear in.** First the **database** — missing indexes and N+1 queries, which no amount of scaling fixes. Then the **connection pool**, where requests queue for a connection and latency climbs while CPU sits idle; that symptom pair is diagnostic. Then **external API calls** without timeouts, where one slow downstream parks every request thread. **GC pressure** and CPU come last for a typical CRUD service, and heap tuning is usually the least valuable place to start despite being the most tempting. Check them in that order and you'll fix the real problem far sooner.`,
        followUps: [
          { text: "What is the difference between vertical and horizontal scaling?" },
          { text: "How do stateless services + load balancers enable scale-out?" },
          { text: "What bottlenecks appear first (DB, pool, GC, external APIs)?" },
        ],
      },
      {
        id: 149,
        text: "How would you debug a production issue where an API is responding slowly?",
        answer: "Start with **metrics, not code**. Check `http.server.requests` in Actuator or your dashboard. Which endpoint, which latency percentile, and did the change line up with a deploy or a traffic spike? Then pull a **distributed trace** for a slow request. The waterfall shows which hop consumed the time — your service, a downstream, or the database. From there it's usually one of a short list: an N+1 query, a missing index, connection-pool exhaustion, a downstream call with no timeout, or GC pressure. Only once you've narrowed that far is a **thread dump** worth taking, to see where threads are actually parked. Then change one thing and confirm against the same metric.",
        explanation: `\`\`\`bash
# Narrowing down, cheapest signal first — all read-only, all safe on a live pod.

# 1. Is it one endpoint or everything? p99 vs p50 separates "slow for all"
#    from "slow for some" — a big gap means a subset of requests, e.g. one tenant.
curl -s localhost:8080/actuator/metrics/http.server.requests | jq

# 2. Connection pool: threads waiting here while CPU is idle = pool exhaustion,
#    the single most common cause of "the whole app got slow at once".
curl -s localhost:8080/actuator/metrics/hikaricp.connections.pending | jq

# 3. GC: rising pause time with a full heap points at memory, not the database.
curl -s localhost:8080/actuator/metrics/jvm.gc.pause | jq

# 4. Only now, and only if the above didn't answer it — where are threads stuck?
jcmd 1 Thread.print > /tmp/threads.txt     # or /actuator/threaddump if exposed
\`\`\`

**Read the thread dump for patterns, not individual threads.** Fifty threads parked in \`SocketRead\` on the same downstream host means that dependency is slow and you're missing a timeout. Fifty in \`HikariPool.getConnection\` means the pool is exhausted — and the fix is usually a slow query holding connections, not a bigger pool. Threads in \`synchronized\` blocks on one monitor means lock contention. Take **two or three dumps a few seconds apart**: threads present in all of them are genuinely stuck, where a single dump can't distinguish stuck from merely busy.

**Profiling a live JVM safely.** \`jcmd\` thread dumps are cheap and safe. **Java Flight Recorder** is designed for production, typically under 2% overhead — \`jcmd 1 JFR.start duration=60s filename=/tmp/rec.jfr\` gives you allocation, lock, and CPU profiles you open later in JDK Mission Control. What you don't do is attach a sampling profiler with high overhead, enable DEBUG logging fleet-wide, or take a **heap dump** on a large heap, since that pauses the JVM for seconds and writes gigabytes. If you need a heap dump, take it from **one pod pulled out of the load balancer**, which is exactly what readiness probes let you do.`,
        followUps: [
          { text: "What metrics and logs would you check first?" },
          { text: "How do distributed traces help isolate the slow hop?" },
          { text: "How would you safely profile or thread-dump a live JVM?" },
        ],
      },
      {
        id: 150,
        text: "How do you ensure data consistency when multiple services update related data?",
        answer: "You accept that a single ACID transaction can't span services and design for **eventual consistency** instead. Each service commits **its own local transaction** and publishes an event; the others react. Two patterns make that reliable. The **transactional outbox** writes the event to a table in the same transaction as the business change, and a relay publishes it after commit. So you can never save the order and lose the event, or publish an event for an order that rolled back. **Idempotent consumers** handle the other half, because at-least-once delivery guarantees duplicates. For a multi-step process use a **saga** with compensating transactions, and avoid 2PC — it holds locks across the network and most things you integrate with don't support XA.",
        explanation: `\`\`\`java
// BROKEN — two systems, no shared transaction. Crash between them and you
// have an order nobody was told about, or an event for an order that rolled back.
@Transactional
public Order place(OrderRequest req) {
    Order order = orderRepository.save(new Order(req, PENDING));
    kafka.send("orders", new OrderPlaced(order.getId()));   // NOT part of the tx
    return order;
}
\`\`\`

\`\`\`java
// OUTBOX — the event is a ROW, written in the same transaction as the order.
// Either both commit or neither does; there is no window in between.
@Transactional
public Order place(OrderRequest req) {
    Order order = orderRepository.save(new Order(req, PENDING));
    outboxRepository.save(new OutboxEvent("OrderPlaced", order.getId(), toJson(order)));
    return order;
}

// A relay publishes committed rows afterwards and marks them sent. If it crashes
// mid-publish it republishes — at-least-once, which is why consumers must dedupe.
@Scheduled(fixedDelay = 500)
public void relay() {
    for (OutboxEvent e : outboxRepository.findUnpublished(100)) {
        kafka.send(e.getTopic(), e.getPayload());
        e.markPublished();
    }
}
\`\`\`

**Strong versus eventual consistency.** **Strong** means every read sees the latest write — what a single database gives you inside a transaction. It's the right model where a stale read is genuinely unsafe: an account balance during a withdrawal, a seat inventory, an authorization check. **Eventual** means replicas converge given time, with a window where different services disagree. That's acceptable far more often than people expect — an order confirmation email arriving 200ms after the order, a search index updating in a second. The design question isn't which is better, it's **how long a window the business can tolerate**, and making that window visible in the UI (\"processing\") rather than pretending it doesn't exist.

**When a saga beats 2PC.** Effectively always across services. 2PC holds locks through a network round trip so throughput collapses under contention, the coordinator is a single point of failure that can leave participants stuck in-doubt, and it needs XA support from every participant — which rules out Kafka, REST APIs, Stripe, and most NoSQL. A saga keeps each transaction **local, short, and independently committable**, paying for it with visible intermediate states and compensating transactions you have to write yourself. Inside one service and one database, a plain \`@Transactional\` is still the right answer — don't reach for a saga where a transaction works.`,
        followUps: [
          { text: "What consistency models exist (strong, eventual)?" },
          { text: "How do outbox pattern and idempotent consumers help?" },
          { text: "When is a saga preferable to a distributed transaction?" },
        ],
      },
      {
        id: 151,
        text: "What is asynchronous processing in Spring Boot (`@Async`), and when would you use it?",
        answer: "`@Async` makes a method return immediately and run on **another thread** from a pool. You put `@EnableAsync` on a config class, annotate the method, and return `void` or `CompletableFuture<T>`. Use it for genuinely fire-and-forget work inside one service — sending an email, writing an audit record, warming a cache — so the HTTP thread isn't held waiting. Two limits matter. It's **proxy-based**, so calling it from another method of the same class does nothing at all, exactly like `@Transactional`. And you should **define your own executor** rather than trusting the default, sizing the pool and queue deliberately. If the work must survive a restart, use a **message queue** instead: an in-memory pool loses the task when the pod dies.",
        explanation: `\`\`\`java
@Configuration
@EnableAsync
public class AsyncConfig {

    @Bean("notificationExecutor")
    public Executor notificationExecutor() {
        ThreadPoolTaskExecutor ex = new ThreadPoolTaskExecutor();
        ex.setCorePoolSize(4);
        ex.setMaxPoolSize(8);
        ex.setQueueCapacity(100);              // bounded! an unbounded queue hides overload
        ex.setThreadNamePrefix("notify-");     // so thread dumps are readable
        // Queue full: run on the CALLER's thread. Slows the caller, but never drops work.
        ex.setRejectedExecutionHandler(new ThreadPoolExecutor.CallerRunsPolicy());
        return ex;
    }
}

@Service
public class OrderService {

    @Async("notificationExecutor")   // name the executor — don't rely on the default
    public void sendConfirmation(Long orderId) { /* runs off the HTTP thread */ }

    public Order place(OrderRequest req) {
        Order order = repository.save(new Order(req));
        this.sendConfirmation(order.getId());   // BUG: self-invocation, runs SYNCHRONOUSLY
        return order;                            // no proxy in the path, so no @Async
    }
}
\`\`\`

**The limitations, stated plainly.** Self-invocation silently degrades to a normal blocking call — no error, so it looks like it works. The return type must be \`void\` or \`CompletableFuture\` (or \`Future\`); anything else returns \`null\` immediately. Exceptions are the sharpest edge: in a \`void\` async method an exception **vanishes** unless you register an \`AsyncUncaughtExceptionHandler\`, so failures disappear entirely. With \`CompletableFuture\` the exception surfaces when somebody calls \`get()\` — and if nobody does, it's lost the same way. Security and request context don't propagate to the new thread by default either, so \`SecurityContextHolder\` is empty unless you configure the delegating executor.

**When to use a queue instead.** \`@Async\` state lives in your JVM's heap, so a restart, a deploy, or an OOM **loses every queued task with no record it existed**. That's fine for a cache warm-up and unacceptable for a payment confirmation. Use a broker when the work must survive a crash, needs retries with backoff and a dead-letter queue, should be spread across instances, or has to be observable. \`@Async\` is right for short, cheap, best-effort work inside one process — nothing more.`,
        followUps: [
          { text: "How do you configure the executor for `@Async` methods?" },
          { text: "What are the limitations of `@Async` (proxy, return types, error handling)?" },
          { text: "When should you use a message queue instead of `@Async`?" },
        ],
      },
      {
        id: 152,
        text: "How do you schedule recurring tasks in Spring Boot (`@Scheduled`)?",
        answer: "Put `@EnableScheduling` on a config class and `@Scheduled` on a **no-argument** method. Three timing modes. **`fixedRate`** starts every N milliseconds regardless of how long the last run took, and **`fixedDelay`** waits N milliseconds *after* the previous run finishes. **`cron`** takes a calendar expression like `0 0 2 * * *` for 2am daily. The default scheduler is **single-threaded**, so one slow job delays every other job in the application. The trap that actually bites in production is that in a **multi-instance deployment every instance runs the job** — a nightly billing run fires three times. Guard it with **ShedLock** or a database lock so only one instance wins.",
        explanation: `\`\`\`java
@Component
public class ReportJobs {

    // fixedDelay: waits 60s AFTER the previous run ENDS. Runs never overlap.
    @Scheduled(fixedDelay = 60_000)
    public void pollInbox() { }

    // fixedRate: starts every 60s NO MATTER WHAT. If a run takes 90s, the next
    // one is already due — with a bigger pool they overlap and double-process.
    @Scheduled(fixedRate = 60_000)
    public void publishMetrics() { }

    // cron: second minute hour day month weekday. 2am daily, in an EXPLICIT zone —
    // without it you get the server's zone, which shifts twice a year on DST.
    @Scheduled(cron = "0 0 2 * * *", zone = "Europe/London")
    @SchedulerLock(name = "nightlyBilling", lockAtMostFor = "30m")   // ShedLock
    public void nightlyBilling() { }   // exactly ONE instance runs this
}
\`\`\`

\`\`\`yaml
# The default scheduler pool size is 1 — one slow job blocks every other job.
spring:
  task:
    scheduling:
      pool:
        size: 4
      thread-name-prefix: sched-
\`\`\`

**Preventing overlap.** \`fixedDelay\` prevents it by construction within one instance, since the next run is measured from the end of the last. \`fixedRate\` and \`cron\` do not — with a pool size above 1 a long-running job can be re-entered while still working, which double-processes rows. Guard those with a lock, or make the job **idempotent** so a second concurrent run is harmless. ShedLock's \`lockAtMostFor\` matters here too: it's a safety net so a job whose instance dies mid-run doesn't hold the lock forever.

**Multi-instance is where naive scheduling breaks.** Three replicas means three executions of the same cron — three invoice runs, three sets of emails. **ShedLock** is the light answer: it takes a row-level lock in your existing database or Redis, and only the winner executes. **Quartz** in clustered mode is the heavier one, and it earns its place when you need persistent job state, misfire handling, or dynamic scheduling at runtime. For anything genuinely important, the strongest option is to take it out of the app entirely — a **Kubernetes CronJob** running a separate pod gives you isolation, its own resource limits, retries, and a run history you can inspect, none of which \`@Scheduled\` provides.`,
        followUps: [
          { text: "What is the difference between fixedRate, fixedDelay, and cron?" },
          { text: "How do you prevent overlapping executions of the same job?" },
          { text: "How would you run scheduled jobs in a multi-instance deployment (ShedLock)?" },
        ],
      },
    ],
  },
  {
    id: "behavioral",
    title: "Behavioral / Project-Based",
    description:
      "Project walkthroughs, production incidents, collaboration, and continuous learning.",
    icon: "💬",
    questions: [
      {
        id: 153,
        text: "Walk me through a project you built end-to-end using Spring Boot.",
        answer: "Keep it to about two minutes with a fixed shape: **what the system did and who used it**, **which part was yours**, **the stack and why**, then **one problem worth talking about**. Lead with the business purpose rather than the dependency list. \"An order service that took checkout requests and coordinated payment and inventory\" tells an interviewer far more than a stack list. Say what *you* built rather than what the team shipped, because the next question is always about your specific contribution. Have one real number ready: requests per day, table size, p95 latency, team size. Finish with something you'd do differently, which reads as judgement rather than weakness.",
        explanation: `This is your own project, so the content has to be yours — what follows is the **shape** to pour it into, not a script to memorise.

\`\`\`text
1. CONTEXT   (20s)  What it did, who used it, why it existed.
                    "Internal order service for a retail site — took checkout
                     requests, coordinated payment and inventory, ~40k orders/day."

2. YOUR PART (30s)  Concretely what you owned. Not "we built" — "I built".
                    "I owned the order lifecycle and the payment integration.
                     Two other devs did the fulfilment side."

3. STACK     (20s)  Choices AND reasons. A reason beats a longer list.
                    "Boot 3, Postgres, Kafka for events. Kafka rather than REST
                     because three teams needed the same order events."

4. PROBLEM   (40s)  One thing that was genuinely hard, and how you worked it out.
                    This is the part they're actually listening to.

5. HINDSIGHT (10s)  One thing you'd change, with the reason.
\`\`\`

**Answering the three sub-questions well.** For **your contribution versus the team's**, be precise and honest — inflating scope collapses the moment they ask a detailed question about a part you didn't write, and "I owned X, and Y was someone else's" reads as confident, not diminished. For **architecture decisions**, give the trade-off rather than the conclusion: "we used a database table for the job queue instead of Kafka because we had one consumer and no ops budget for a broker" shows reasoning where "we used Kafka" shows a noun. For **auth, data, and deployment**, have one sentence each ready — JWT validated at the gateway, Postgres with Flyway migrations, Docker image deployed to Kubernetes via GitHub Actions — since that trio is the fastest way for an interviewer to check you saw a system end-to-end.

**On the "what would you change" question:** pick something real and technical with a reason attached — "we put too much in one service and the deploy coupling hurt", or "we should have added tracing on day one instead of after the first incident". Avoid both fake humility ("I'd have written more tests") and anything that suggests you didn't understand the problem at the time.`,
        followUps: [
          { text: "What was your specific contribution vs the team's?" },
          { text: "What architecture decisions did you make, and what would you change?" },
          { text: "How did you handle auth, data, and deployment in that project?" },
        ],
      },
      {
        id: 154,
        text: "Describe a challenging bug you fixed in production — how did you diagnose it?",
        answer: "Use **STAR** — situation, task, action, result — and spend most of it on the action. What's being assessed is your **diagnostic method**, not how clever the fix was. So walk the path: the symptom, the first signal you looked at, what you ruled out, and how you *confirmed* the cause instead of guessing. Say explicitly how you **stopped the bleeding** while still investigating — a rollback, a feature flag, scaling up. Mitigating before root-causing is the instinct that separates people who've been on call. Close with the result as a number if you have one, and what you changed so it can't recur: a test, an alert, a timeout.",
        explanation: `The bug has to be yours. This is the **structure** that makes a real one land, and the trap is spending three minutes on the symptom and ten seconds on the reasoning.

\`\`\`text
SITUATION  "Checkout p99 went from 300ms to 12s, only during morning peak,
            starting two days after a release."
TASK       "I picked it up as the on-call dev."
ACTION     - Metrics first: latency was up, CPU was flat. That ruled out our code
             being slow and pointed at waiting on something.
           - hikaricp.connections.pending was climbing -> pool exhaustion.
           - Thread dump: 40 threads parked in getConnection.
           - Ruled out traffic (volume was normal) and the DB (CPU fine).
           - Found a new endpoint holding a connection across an HTTP call
             to a slow third party.
MITIGATION  Feature-flagged the endpoint off, latency recovered in minutes,
            THEN kept digging.
RESULT      "Moved the external call outside the transaction, p99 back to 320ms.
             Added an alert on pending connections and a timeout on that client."
\`\`\`

**On tools and signals**, name the specific thing you looked at and what it told you — "CPU was flat while latency climbed, which meant we were waiting, not computing" is a sentence that demonstrates reasoning. Metrics dashboards, distributed traces, thread dumps, GC logs, and the query log are the usual cast. Saying "I added logging and eventually found it" is honest but weak; if that's genuinely what happened, describe **how you narrowed where to add it**.

**On mitigation**, the point being tested is whether you know that restoring service and understanding the cause are two different jobs with different urgency. Rollback, feature flag, scale out, disable the endpoint, fail over — any of them, as long as you did it *before* the root cause was fully understood and can say why that was right.

**On prevention**, keep it proportionate and concrete: the alert that would have caught it 20 minutes earlier, the regression test, the timeout that was missing. Avoid grand process proposals — "we introduced a full incident review process" from one bug sounds invented. One specific, well-chosen change is more convincing than a policy.`,
        followUps: [
          { text: "What tools and signals led you to the root cause?" },
          { text: "How did you mitigate impact while investigating?" },
          { text: "What process changes did you introduce to prevent recurrence?" },
        ],
      },
      {
        id: 155,
        text: "How do you approach code reviews, and what do you look for?",
        answer: "Read for **correctness first, then security, then readability** — in that order, because a beautifully formatted race condition is still a bug. Concretely: does it handle the null and empty cases, is there a test covering the behaviour that changed, does it log PII or leak a credential, is there an N+1 query. Leave **formatting to the toolchain** rather than to review comments. Phrase feedback as a question when you might be missing context: \"what happens if this list is empty?\". Mark clearly what's blocking versus a suggestion, so the author knows what actually stops the merge. And review **quickly**: a PR sitting for two days costs the team more than most comments save.",
        explanation: `\`\`\`text
Order matters — read for these in sequence, not all at once:

1. CORRECTNESS   Does it do what the ticket says? Null/empty/boundary cases?
                 Is there a test for the behaviour that CHANGED?
                 Concurrency: shared mutable state, non-atomic check-then-act?
2. SECURITY      Secrets in code or logs? PII in logs? Input validated?
                 Authorization checked at the service, not just the controller?
                 SQL built by string concatenation?
3. PERFORMANCE   N+1 query? Missing index on a new lookup column?
                 Unbounded collection or query with no pagination?
4. READABILITY   Will someone understand this in six months? Names accurate?
                 Is the complexity essential or accidental?
5. STYLE         Leave it to Spotless/Checkstyle. Don't spend human review on it.
\`\`\`

**Giving feedback without blocking the team.** Separate the blocking from the optional explicitly — many teams prefix with \`nit:\` for "take it or leave it" — because an author who can't tell which comments are mandatory either argues about all of them or silently accepts all of them. Ask rather than assert when you might lack context: "what happens if this list is empty?" invites an answer where "this will NPE" is wrong if there's a guard you missed. Comment on the **code, not the person**. And weigh the cost of delay: for a small fix, approving with a comment beats another round trip. If a PR needs a real redesign, that's a five-minute conversation, not fifteen review comments.

**Handling disagreement.** State the concern once with a reason, and hear the response properly — the author has usually thought about it and may know a constraint you don't. If it's genuinely important and you still disagree, take it out of the comment thread to a call, because text makes technical disagreement feel more adversarial than it is. Escalate to a third person on the team when you're deadlocked, which is normal rather than a failure. The thing to avoid is a review thread with fifteen replies: past two or three exchanges, the medium has stopped working. And be willing to be wrong out loud — "fair enough, you're right about the ordering" is cheap and builds a lot of trust.`,
        followUps: [
          { text: "How do you give constructive feedback without blocking the team?" },
          { text: "What correctness, security, and readability checks do you prioritize?" },
          { text: "How do you handle disagreements in review?" },
        ],
      },
      {
        id: 156,
        text: "Tell me about a time you had to optimize a slow-performing API or query.",
        answer: "The structure is **measure, find the real bottleneck, fix one thing, measure again**. Open with a number, because \"it felt slow\" isn't a baseline and you can't demonstrate an improvement without one — p95 latency from Actuator or your APM works. Most Spring Boot slowness lives in the data layer, so check the **N+1 query** first by counting queries per request, then a missing index with `EXPLAIN ANALYZE`. Fix the cheapest real cause: a join fetch, an index, a projection that stops loading columns nobody uses. Reach for caching **after** the query is sane, not instead of fixing it — caching a bad query just hides it. Then state the after-number and what the fix cost you.",
        explanation: `\`\`\`sql
-- The measurement that usually finds it. Run the real query with real data volumes;
-- a plan against 50 test rows tells you nothing about production.
EXPLAIN ANALYZE
SELECT * FROM orders WHERE customer_id = 42 AND status = 'PENDING';

-- Seq Scan on orders  (cost=0.00..18400 rows=1 width=284)
--   Filter: ((customer_id = 42) AND (status = 'PENDING'))
--   Rows Removed by Filter: 847213          <-- reading 847k rows to return 1
-- Planning Time: 0.1 ms
-- Execution Time: 412 ms

CREATE INDEX CONCURRENTLY idx_orders_customer_status ON orders(customer_id, status);
-- CONCURRENTLY: doesn't lock writes on a live table. Slower to build, no outage.

-- Index Scan using idx_orders_customer_status  (cost=0.42..8.44 rows=1)
-- Execution Time: 0.3 ms                      <-- 412ms -> 0.3ms
\`\`\`

**Measuring before and after.** Same endpoint, same data volume, same percentile — and prefer **p95 or p99 over the mean**, because an average hides exactly the slow tail users complain about. For a query, \`EXPLAIN ANALYZE\` gives you a real number and, more usefully, the *reason*: a sequential scan, a nested loop over a large set, a sort spilling to disk. For an endpoint, \`http.server.requests\` before and after a deploy is the honest comparison. Watch the **query count** too, not just total time — 200 fast queries is an N+1 and no index will fix it.

**Which fix, in which order.** Fix the **query** first: an N+1 resolved with a join fetch or an \`@EntityGraph\`, a missing index, a projection that stops loading a 2MB blob column you never read. Then **pagination**, since an endpoint returning 50,000 rows is slow no matter how good the index is. **Caching** comes after that — it's the right answer for genuinely hot, rarely-changing, expensive-to-compute data, and the wrong answer as a substitute for an index. **Architecture** changes (read replicas, denormalisation, a search index) come last because they cost the most.

**Name the trade-off, because every optimisation has one.** An index costs write throughput and disk. A cache costs staleness and invalidation complexity. Denormalisation costs consistency. A join fetch can produce a cartesian product if you fetch two collections at once. An interviewer asking this question is usually listening for whether you know what you gave up.`,
        followUps: [
          { text: "How did you measure before and after?" },
          { text: "Was the fix caching, indexing, query rewrite, or architecture?" },
          { text: "What trade-offs did the optimization introduce?" },
        ],
      },
      {
        id: 157,
        text: "How do you keep yourself updated with new Spring/Java features?",
        answer: "Name **specific, checkable sources** rather than \"I read blogs\": the Spring Boot **release notes and migration guides** on GitHub, the official Spring blog, the JEP list for each new Java release, and something with editorial depth like Baeldung or InfoQ. The stronger half of the answer is **how you use them**. Read the release notes for the version you're actually on, so you learn what's deprecated before it's removed rather than during an upgrade. Then give one concrete thing you adopted and why it mattered: records for DTOs, `RestClient` replacing `RestTemplate`, virtual threads. For upgrades at work the honest process is: read the migration guide, bump in a branch, let the test suite find the breakage. Move one major version at a time.",
        explanation: `\`\`\`text
Worth knowing as current, because these are what interviewers probe:

Java 17 -> 21   records, sealed types, pattern matching for switch,
                text blocks, virtual threads (21)
Boot 3.0        Jakarta EE (javax.* -> jakarta.*), Java 17 baseline,
                spring.factories removed for auto-config
Boot 3.1        Testcontainers @ServiceConnection, Docker Compose support
Boot 3.2        RestClient; virtual thread support (spring.threads.virtual.enabled)
Boot 3.4        @MockBean/@SpyBean deprecated -> @MockitoBean/@MockitoSpyBean
Spring Cloud    Ribbon/Hystrix/Zuul gone; Sleuth -> Micrometer Tracing (Boot 3)
\`\`\`

**Answer the sub-questions with substance.** For **resources**, the specific beats the generic: "the Boot release notes on the GitHub wiki" is checkable, "various blogs" isn't. Release notes and migration guides are genuinely the highest-value source, because they tell you what *changed*, which is what actually costs you time. For **something you adopted**, pick a real one and give the reason: records for DTOs removes fifty lines of boilerplate per class; \`RestClient\` because \`RestTemplate\` is in maintenance; \`@ServiceConnection\` because it deleted the \`@DynamicPropertySource\` boilerplate from every integration test. Don't claim virtual threads in production unless you can discuss pinning and what happens with \`synchronized\` blocks.

**On evaluating a major upgrade at work**, the credible answer is procedural rather than heroic. Read the migration guide and the deprecations first. Do it in a branch and let the test suite tell you what broke — which is the real argument for having one. Go **one major version at a time** (2.7 → 3.0 → 3.1, not 2.5 → 3.2), since the guides are written pairwise. Check that your dependencies support the target before starting, because a library that never made the Jakarta namespace move is a blocker no amount of your own effort fixes. And time it deliberately: the strongest reason to upgrade is usually **end of security support** for your current version, which turns it from a nice-to-have into a date on the calendar.`,
        followUps: [
          { text: "What resources do you follow (docs, blogs, release notes)?" },
          { text: "Have you adopted a recent Java or Spring feature in a project?" },
          { text: "How do you evaluate whether to upgrade major versions at work?" },
        ],
      },
      {
        id: 158,
        text: "Describe a situation where you disagreed with a technical decision — how did you handle it?",
        answer: "What's being assessed is whether you can **disagree on evidence and then commit to the outcome**. The shape is: state the concern once and clearly, with something concrete behind it — a benchmark, a spike, a specific failure mode you can name, not a preference. Then listen to the counter-argument properly, because the other person usually knows a constraint you don't. If the team goes the other way, **commit fully** and help make it work rather than relitigating it in standups. Say what you'd watch for so you'd know early whether the concern was real. And if you turned out to be wrong, say so — that's the strongest version of this answer, not the weakest.",
        explanation: `The situation has to be yours. The pattern below is what makes a real one land, and the failure mode is telling a story where you were right and everyone else eventually admitted it.

\`\`\`text
CONCERN     Stated once, specifically, with a mechanism — not a preference.
            WEAK   "I didn't think MongoDB was the right choice."
            STRONG "Our access pattern was relational — four joins on the main
                    query — and we'd lose transactional consistency across them."

EVIDENCE    A spike, a benchmark, a prototype, a named failure mode.
            "I spent half a day modelling it both ways and showed the query
             we'd have to write by hand in Mongo."

LISTEN      What constraint did they have that you didn't see?
            Time pressure, team skills, an existing ops contract.

OUTCOME     They chose differently -> you commit, properly.
            "I wrote the repository layer for it and made sure we had the
             integration tests to catch the consistency issues I'd worried about."

FOLLOW-UP   What you'd watch to find out who was right, and what happened.
\`\`\`

**Presenting alternatives with data.** A prototype ends more arguments than an opinion does, and it's usually cheaper than the debate it replaces — half a day of spiking beats three meetings. Where you can't measure, name the **specific failure mode** rather than a general worry: "if the payment provider is slow, this holds a DB connection for the whole call and exhausts the pool" is arguable in a way that "this feels fragile" isn't. Write it down for anything significant, even a short decision record, so the reasoning survives the meeting.

**When the team chooses differently**, the answer interviewers are listening for is genuine commitment — you helped make it succeed rather than waiting to be proven right. Say what you did to de-risk the path you disagreed with: tests around the part that worried you, a metric or alert on the failure mode, a documented note on what would trigger revisiting. That's the professional version of disagree-and-commit, and it also gives the story a real ending.

**On what you learned about communication:** the useful, non-generic lessons are usually about **timing and audience** — raising it before the decision hardened rather than after, taking it to a call once text started going in circles, or framing the concern in terms of what the business cared about (downtime, delivery date) rather than technical elegance. Avoid a lesson that's really a complaint about someone else.`,
        followUps: [
          { text: "How did you present alternatives with data or prototypes?" },
          { text: "What did you do when the team chose a different path?" },
          { text: "What did you learn about communication from that situation?" },
        ],
      },
    ],
  },
];

// Enrich followups with their answers, keyed by exact text.
categories.forEach((cat) =>
  cat.questions.forEach((q) =>
    q.followUps.forEach((fu) => {
      if (!fu.answer && followupAnswers[fu.text]) {
        fu.answer = followupAnswers[fu.text];
      }
    })
  )
);

export function getCategoryById(id: string): Category | undefined {
  return categories.find((c) => c.id === id);
}

export function getAllQuestions() {
  return categories.flatMap((c) =>
    c.questions.map((q) => ({ ...q, categoryId: c.id, categoryTitle: c.title }))
  );
}

export function getTotalQuestionCount(): number {
  return categories.reduce((sum, c) => sum + c.questions.length, 0);
}

export function getTotalFollowUpCount(): number {
  return categories.reduce(
    (sum, c) =>
      sum + c.questions.reduce((qs, q) => qs + q.followUps.length, 0),
    0
  );
}

export function getAdjacentCategories(id: string) {
  const idx = categories.findIndex((c) => c.id === id);
  if (idx === -1) return { prev: undefined, next: undefined };
  return {
    prev: idx > 0 ? categories[idx - 1] : undefined,
    next: idx < categories.length - 1 ? categories[idx + 1] : undefined,
  };
}
