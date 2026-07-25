import type { Category } from "./types";

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
        answer: "`==` compares **references** — it checks whether two variables point to the exact same object in memory. `.equals()` compares **content** — what the object actually represents. For primitives like `int` or `char`, `==` compares values directly because primitives live on the stack, not the heap. For objects, you almost always want `.equals()`.",
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
          { text: "What happens when you compare two `Integer` objects with `==` that fall within the Integer cache range (-128 to 127)?" },
          { text: "Why must `equals()` and `hashCode()` always be overridden together?" },
          { text: "What is the contract of `equals()` (reflexive, symmetric, transitive, consistent)?" },
        ],
      },
      {
        id: 2,
        text: "Explain the difference between `String`, `StringBuilder`, and `StringBuffer`.",
        answer: "`String` is **immutable** — every modification creates a new object in memory. `StringBuilder` is **mutable** and not thread-safe, designed for single-threaded string manipulation. `StringBuffer` is also mutable but **thread-safe** (all methods are synchronized). In practice: use `String` for values you don't need to change, use `StringBuilder` when building strings in a loop or algorithm, and almost never reach for `StringBuffer` in modern code because synchronized blocks are expensive and you usually control thread access at a higher level.",
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
          { text: "Why is `String` immutable, and what benefits does that provide (string pool, security, thread-safety)?" },
          { text: "When would you choose `StringBuffer` over `StringBuilder` in modern code?" },
          { text: "What does the `+` operator compile to for string concatenation in a loop vs a single expression?" },
        ],
      },
      {
        id: 3,
        text: "What are the differences between abstract classes and interfaces?",
        answer: "An **abstract class** can have instance variables, constructors, and a mix of abstract and concrete methods. A class can extend only one abstract class. An **interface** defines a contract — it traditionally had only abstract methods, but since Java 8 it can also have `default` and `static` methods, and since Java 9, `private` helper methods. A class can implement multiple interfaces. The key decision: if you need to share **state** (fields) or provide a **base implementation**, use an abstract class. If you need to define a **capability** that unrelated classes can all share, use an interface.",
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
    
    protected Connection getConnection() { // shared impl
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
        answer: "`ArrayList` is backed by a **dynamic array** — random access is O(1) but inserting/deleting in the middle is O(n) because elements must shift. `LinkedList` is a **doubly-linked list** — inserting/removing at ends is O(1), but random access is O(n) because you have to walk the chain. In almost every real Spring Boot application, `ArrayList` is the right choice because: (1) we mostly iterate and random-access, not insert-in-middle, (2) `ArrayList`'s contiguous memory layout is CPU-cache friendly, and (3) `LinkedList` has higher memory overhead per node (two pointers per element).",
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
        answer: "`HashMap` internally uses an **array of buckets** (Entry[]). When you call `put(key, value)`, it calls `key.hashCode()`, applies a bit-mixing function, and takes `hash % capacity` to find the bucket index. If two keys land in the same bucket (collision), they form a chain. Before Java 8, that chain was a **linked list** — worst case O(n) per operation. Since Java 8, when a bucket's chain exceeds 8 entries, it **converts to a red-black tree**, reducing worst-case to O(log n). When the map's fill exceeds `capacity × loadFactor` (default 0.75), it **rehashes** — doubles the array and redistributes all entries.",
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
          { text: "What changed in Java 8 regarding collision handling (linked list → red-black tree)?" },
          { text: "What is the load factor, and when does rehashing occur?" },
          { text: "What is the difference between `HashMap` and `ConcurrentHashMap` for multi-threaded access?" },
        ],
      },
      {
        id: 6,
        text: "What is the difference between `HashMap`, `LinkedHashMap`, and `TreeMap`?",
        answer: "All three implement the `Map` interface but differ in **ordering** and **performance**. `HashMap` makes no guarantees about iteration order — O(1) average for get/put. `LinkedHashMap` maintains **insertion order** (or access order if configured) by layering a doubly-linked list on top of the hash table — still O(1) for get/put with slightly more memory. `TreeMap` stores keys in **sorted order** (natural or via Comparator) using a red-black tree — O(log n) for get/put. `TreeMap` cannot have null keys; `HashMap` and `LinkedHashMap` allow one null key.",
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
        answer: "`HashSet` is backed by a `HashMap` (values are stored as keys, a dummy object as value) — O(1) for add/contains/remove, no ordering. `LinkedHashSet` extends `HashSet` with a linked list to maintain **insertion order** — same O(1) operations, slight memory overhead. `TreeSet` implements `SortedSet` — elements are kept in **natural sorted order** or by a `Comparator`, using a red-black tree, so O(log n) operations. `HashSet` allows one `null`; `TreeSet` throws `NullPointerException` because it can't compare null to other elements.",
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
          { text: "Does `HashSet` allow `null` elements? Does `TreeSet`?" },
        ],
      },
      {
        id: 8,
        text: "Explain the concept of immutability. How do you create an immutable class in Java?",
        answer: "An immutable object's **state cannot be changed after construction**. To create an immutable class: (1) declare the class `final` so it can't be subclassed, (2) make all fields `private final`, (3) don't provide setters, (4) initialize all fields in the constructor, (5) for any mutable field (like a `List` or `Date`), make a **defensive copy** in the constructor and return a defensive copy in the getter. Java's built-in `String`, `Integer`, `LocalDate` are all immutable. Since Java 16, `record` types give you immutability out of the box.",
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
          { text: "What steps are required to make a class truly immutable (final class, final fields, defensive copies)?" },
          { text: "How do you handle mutable fields (like `Date` or `List`) inside an immutable class?" },
          { text: "Why are immutable objects naturally thread-safe?" },
        ],
      },
      {
        id: 9,
        text: "What is the difference between checked and unchecked exceptions?",
        answer: "**Checked exceptions** extend `Exception` (but not `RuntimeException`) — the compiler forces you to either catch them or declare them in the method signature with `throws`. They represent conditions the caller is expected to anticipate and handle (e.g., `IOException`, `SQLException`). **Unchecked exceptions** extend `RuntimeException` — no compiler enforcement, they propagate up the call stack until caught or the program crashes (e.g., `NullPointerException`, `IllegalArgumentException`). In modern Spring applications, **unchecked exceptions are almost always preferred** for custom exceptions because they don't pollute every method signature, and Spring's `@ControllerAdvice` handles them globally.",
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
          { text: "Give examples of each from the JDK." },
          { text: "When should you create a custom checked exception vs an unchecked one in a Spring service?" },
          { text: "What is the difference between `throw` and `throws`?" },
        ],
      },
      {
        id: 10,
        text: "What is the try-with-resources statement and why is it useful?",
        answer: "Try-with-resources (introduced in Java 7) **automatically closes resources** declared in the try header when the block exits — whether normally, or due to an exception. A resource must implement the `AutoCloseable` interface (one method: `close()`). Before this, developers had to write `finally` blocks to close streams, DB connections, etc. — and frequently got it wrong by forgetting to check for null or handle exceptions thrown by `close()` itself. Try-with-resources fixes all of that.",
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
\`\`\`

**The right way — try-with-resources:**

\`\`\`java
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
          { text: "Can you declare multiple resources in a single try-with-resources block?" },
        ],
      },
      {
        id: 11,
        text: "Explain the concept of autoboxing and unboxing.",
        answer: "**Autoboxing** is the automatic conversion Java does when you assign a primitive to its wrapper type (e.g., `int` → `Integer`). **Unboxing** is the reverse — wrapper to primitive. Java does this transparently, so you can write `Integer x = 5` without an explicit `Integer.valueOf(5)`. The compiler inserts those calls for you. The traps: (1) unboxing a `null` wrapper causes `NullPointerException`, (2) comparing boxed values with `==` is unreliable due to the Integer cache (-128 to 127), and (3) autoboxing in tight loops creates garbage that pressures the GC.",
        explanation: `**The null unboxing trap — a real production bug:**

\`\`\`java
// This looks fine but will throw NullPointerException
Map<String, Integer> counts = new HashMap<>();
int count = counts.get("nonexistent"); // get() returns null, unboxing null → NPE
// Fix:
int count = counts.getOrDefault("nonexistent", 0); // safe
\`\`\`

**The Integer cache surprise:**

\`\`\`java
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
int sum = nums.stream()
              .mapToInt(Integer::intValue) // unbox once
              .sum(); // no more boxing
\`\`\``,
        followUps: [
          { text: "What is the difference between `int` and `Integer` in terms of memory and nullability?" },
          { text: "How can autoboxing cause a `NullPointerException`?" },
          { text: "Why can comparing boxed integers with `==` be surprising due to caching?" },
        ],
      },
      {
        id: 12,
        text: "What is the difference between `final`, `finally`, and `finalize()`?",
        answer: "These three have nothing to do with each other beyond sharing the word 'final'. **`final`** is a modifier: on a variable = can't reassign, on a method = can't override, on a class = can't extend. **`finally`** is a block in exception handling that always runs after try/catch, regardless of whether an exception was thrown — used for cleanup. **`finalize()`** was a method on `Object` called by the GC before collecting an object — it was **deprecated in Java 9** and removed in Java 18 because it was unreliable, slow, and caused GC pauses. Use `AutoCloseable` + try-with-resources instead.",
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
          { text: "Can a `final` method be overridden? Can a `final` class be extended?" },
          { text: "Does `finally` always execute? What about `System.exit()`?" },
          { text: "Why is `finalize()` deprecated, and what should you use instead?" },
        ],
      },
      {
        id: 13,
        text: "What are functional interfaces? Give examples of built-in ones.",
        answer: "A functional interface has **exactly one abstract method** — that's what makes it a valid target for a lambda expression or method reference. The `@FunctionalInterface` annotation is optional but recommended — it makes the compiler enforce the single-abstract-method rule. Built-in ones in `java.util.function`: `Predicate<T>` (takes T, returns boolean), `Function<T,R>` (takes T, returns R), `Consumer<T>` (takes T, returns nothing), `Supplier<T>` (takes nothing, returns T), `BiFunction<T,U,R>` (takes two args). A functional interface CAN have multiple default or static methods — only the abstract method count matters.",
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
          { text: "Can a functional interface have default methods?" },
        ],
      },
      {
        id: 14,
        text: "What are Lambda expressions and how do they improve code readability?",
        answer: "A lambda is an **anonymous function** — it has parameters, a body, and a return type, but no name and no class. Lambdas implement functional interfaces inline, eliminating the need for anonymous inner class boilerplate. The syntax is `(parameters) -> expression` or `(parameters) -> { block; }`. They don't just save lines — they make the *intent* clearer by keeping the 'what to do' close to 'where it's used.' Method references (`Class::method`) go even further by eliminating the lambda wrapping when you're just delegating to an existing method.",
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
        answer: "**Intermediate operations** (like `filter`, `map`, `sorted`, `distinct`) transform the stream and return a new stream — they are **lazy**, meaning they don't execute until a terminal operation is called. **Terminal operations** (like `collect`, `forEach`, `count`, `findFirst`, `reduce`) trigger actual processing and produce a result or side effect. Streams are single-use — once a terminal operation is called, the stream is consumed and can't be reused. The laziness matters for performance: `filter(...).map(...).findFirst()` stops as soon as the first match is found — it doesn't process the entire collection.",
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
        answer: "`map()` applies a function to each element and produces **one output per input** — the stream stays the same size. `flatMap()` applies a function that returns a stream for each element, then **flattens all those streams into one** — use it when each element produces multiple results. The mental model: `map` is 1-to-1 transformation; `flatMap` is 1-to-many transformation where you want the results in a single flat stream, not a stream of lists.",
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
\`\`\`

**flatMap on Optional — the monadic use:**

\`\`\`java
// Without flatMap — returns Optional<Optional<String>>
Optional<String> city = user
    .map(User::getAddress)      // Optional<Address>
    .map(Address::getCity);     // Optional<Optional<String>> — wrong!

// With flatMap — stays Optional<String>
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
        answer: "`Comparable` defines the **natural ordering** of a class — it's implemented on the class itself via `compareTo()`. It bakes ordering into the class: `String`, `Integer`, `LocalDate` all implement Comparable. `Comparator` is an **external ordering strategy** — a separate object that knows how to compare two instances. Use Comparable for the default sort order that makes the most sense for the type. Use Comparator when you need an alternative sort order, or when sorting a class you don't own (third-party or JDK class).",
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
\`\`\`

**Comparator — external, flexible, chainable:**

\`\`\`java
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
          { text: "Where is natural ordering defined, and when would you use an external Comparator?" },
          { text: "How do you sort a list of objects by multiple fields using Comparator chaining?" },
          { text: "What happens if `compareTo` is inconsistent with `equals`?" },
        ],
      },
      {
        id: 18,
        text: "What is the diamond problem in Java, and how does Java handle it with interfaces?",
        answer: "The diamond problem occurs when a class inherits from two sources that both define the same method, creating ambiguity about which version to use. Java avoids this for classes by **disallowing multiple class inheritance** — a class can only extend one class. But with interfaces, since Java 8 introduced `default` methods, a class can implement two interfaces that both have the same default method. Java resolves this by **forcing the implementing class to override the method** — the code won't compile until you do. The priority rules: class wins over interface, more specific interface wins over more general.",
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
        answer: "**Overloading** is having multiple methods with the same name in the same class but **different parameter lists** (different type, count, or order). Resolved at **compile time** based on the argument types — this is static/compile-time polymorphism. **Overriding** is when a subclass provides a **different implementation for a method inherited from the parent class** — same name, same parameter list, same (or covariant) return type. Resolved at **runtime** based on the actual object type — this is dynamic/runtime polymorphism.",
        explanation: `**Overloading — resolved at compile time:**

\`\`\`java
public class Calculator {
    public int add(int a, int b) { return a + b; }
    public double add(double a, double b) { return a + b; }
    public int add(int a, int b, int c) { return a + b + c; }
}
// The compiler picks the right version based on argument types
\`\`\`

**Overriding — resolved at runtime (dynamic dispatch):**

\`\`\`java
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
          { text: "Is return type considered for overloading? What about for overriding (covariant returns)?" },
          { text: "Can you override a static method? What is method hiding?" },
          { text: "What access modifier rules apply when overriding a method?" },
        ],
      },
      {
        id: 20,
        text: "What is the significance of the `static` keyword?",
        answer: "`static` means the member belongs to the **class itself**, not to any particular instance. A static field is shared across all instances — there's only one copy per class. A static method can be called without creating an object. Static blocks run once when the class is loaded by the JVM. Static nested classes don't hold a reference to the outer class instance. Key implications: static members can't access instance fields/methods (no `this` reference), and they can't be overridden (only hidden).",
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
\`\`\`

**Static block — runs once at class load:**
\`\`\`java
public class DbDriver {
    static {
        // Runs when class is first loaded
        // Order: static block → instance block → constructor
        System.out.println("Loading DB driver...");
        Class.forName("com.mysql.cj.jdbc.Driver");
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
          { text: "Can you override a static method? Why or why not?" },
          { text: "What are static imports, and when are they appropriate?" },
        ],
      },
      {
        id: 21,
        text: "What are Java generics and why are they used?",
        answer: "Generics let you write **type-safe, reusable code** by parameterizing classes and methods with type placeholders. Instead of `List list` (where you could accidentally mix types), you write `List<String>` — the compiler enforces that only Strings go in and come out. At **runtime, generics are erased** (type erasure) — `List<String>` becomes `List` in bytecode. This is why you can't do `new T[]`, `instanceof T`, or `T.class` at runtime — the JVM doesn't know what `T` is anymore.",
        explanation: `**Why generics exist — the pre-generics pain:**

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
\`\`\`

**Type erasure — what actually exists at runtime:**
\`\`\`java
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
        answer: "`volatile` guarantees **visibility** — when one thread writes to a volatile variable, the new value is immediately visible to all other threads. Without it, threads may read stale values from their CPU cache. What `volatile` does NOT guarantee: **atomicity**. `count++` is a read-modify-write operation — even if `count` is volatile, two threads doing `count++` simultaneously can both read the same value and both write the same result, losing an increment. Use `AtomicInteger` for thread-safe incrementing, and `synchronized` when you need to protect a multi-step critical section.",
        explanation: `**The visibility problem volatile solves:**

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
\`\`\`

**The atomicity trap — volatile is NOT enough for count++:**
\`\`\`java
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
        answer: "Prefer `Runnable` over extending `Thread`. Extending `Thread` burns your only inheritance slot and tightly couples the task to the threading mechanism. `Runnable` separates what to do from how it runs — you can pass the same `Runnable` to a thread pool, a timer, or a new `Thread`. `Callable<T>` is like `Runnable` but can return a value and throw checked exceptions. In modern Java, you almost never directly extend `Thread` — you pass `Runnable` or `Callable` to an `ExecutorService`.",
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
\`\`\`

**The Runnable approach — prefer this:**
\`\`\`java
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
        answer: "A **synchronized method** locks the entire method — on `this` for instance methods, on the `Class` object for static methods. A **synchronized block** locks only a specific section of code, and you choose the monitor object explicitly. Prefer synchronized blocks because they minimize the time you hold the lock — narrower critical sections mean less contention and better throughput. If you synchronize a whole method that does 90% non-shared work, you're blocking other threads unnecessarily for the whole duration.",
        explanation: `**Synchronized method — locks the whole thing:**

\`\`\`java
// Instance method — locks on 'this'
public synchronized void increment() {
    count++; // only this line needs protection, but whole method is locked
    log("incremented"); // slow I/O — but still holding the lock!
}

// Static method — locks on Counter.class
public static synchronized Counter getInstance() { ... }
\`\`\`

**Synchronized block — lock only what matters:**
\`\`\`java
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
\`\`\`java
// Without synchronization — race condition
// Thread 1: reads count = 5
// Thread 2: reads count = 5
// Thread 1: writes count = 6
// Thread 2: writes count = 6  ← increment lost!
private int count = 0;
public void increment() { count++; }

// With synchronization — atomic read-modify-write
public synchronized void increment() { count++; }
// Or use AtomicInteger — faster, no lock needed
private AtomicInteger count = new AtomicInteger(0);
\`\`\`

**The lock object matters:** Don't synchronize on public objects or literals — someone else could lock on the same object and create unexpected deadlocks. Use a private dedicated lock object:
\`\`\`java
private final Object lock = new Object();
synchronized (lock) { ... } // safer than synchronized (this)
\`\`\``,
        followUps: [
          { text: "What object is locked when you synchronize on a static method vs an instance method?" },
          { text: "Why is synchronizing on a smaller critical section usually preferred?" },
          { text: "What is a race condition, and how does synchronization prevent it?" },
        ],
      },
      {
        id: 25,
        text: "What are `ExecutorService` and thread pools?",
        answer: "`ExecutorService` is the standard Java API for managing a pool of reusable threads. Instead of creating a new `Thread` for every task (expensive — OS thread creation costs ~1ms and ~1MB stack), you submit tasks to a pool that recycles threads. `execute(Runnable)` is fire-and-forget — no return value. `submit(Callable)` returns a `Future<T>` that you can use to get the result, check completion, or cancel. In Spring Boot, `@Async` methods use an `ExecutorService` under the hood, and you configure it via a `ThreadPoolTaskExecutor` bean.",
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
\`\`\`

**execute() vs submit():**
\`\`\`java
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
          { text: "How do you configure a custom thread pool in a Spring Boot app (`@Async`)?" },
        ],
      },
      {
        id: 26,
        text: "What is a deadlock, and how can it be avoided?",
        answer: "A deadlock happens when two or more threads are each waiting for a lock held by the other — creating a circular wait where nobody makes progress. The four necessary conditions (Coffman): **mutual exclusion** (resource can only be held by one thread), **hold and wait** (thread holds one lock while waiting for another), **no preemption** (locks can't be forcibly taken), and **circular wait** (thread A waits for B, B waits for A). Break any one of these and deadlock can't occur. Common strategies: consistent lock ordering, using `tryLock()` with timeout, or restructuring to avoid holding multiple locks.",
        explanation: `**The classic deadlock:**

\`\`\`java
Object lockA = new Object();
Object lockB = new Object();

// Thread 1: acquires A, then tries to get B
Thread t1 = new Thread(() -> {
    synchronized (lockA) {
        Thread.sleep(100); // simulate work
        synchronized (lockB) { // WAITING — Thread 2 holds B
            System.out.println("T1 done");
        }
    }
});

// Thread 2: acquires B, then tries to get A
Thread t2 = new Thread(() -> {
    synchronized (lockB) {
        Thread.sleep(100);
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
\`\`\`

**Fix 2 — tryLock with timeout (ReentrantLock):**
\`\`\`java
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
          { text: "What are the four necessary conditions for deadlock (Coffman conditions)?" },
          { text: "How would you diagnose a deadlock in a running JVM (thread dump, jstack)?" },
          { text: "How do lock ordering and timeouts help prevent deadlocks?" },
        ],
      },
      {
        id: 27,
        text: "What is garbage collection in Java, and how does it work at a high level?",
        answer: "Java's garbage collector automatically reclaims memory for objects that are no longer reachable from any live thread or static variable. It works on the **generational hypothesis**: most objects die young. The heap is split into **Young Generation** (new objects) and **Old Generation** (long-lived objects). Minor GC runs frequently to clean up Eden space (where new objects are born) — it's fast because most objects are already dead. Major/Full GC cleans the Old Generation — it's slower and pauses the application. Modern collectors like G1GC and ZGC reduce pause times by doing most work concurrently with the application.",
        explanation: `**The generational heap — how objects move:**

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
          { text: "What is the generational hypothesis, and how do young/old gen work?" },
          { text: "Name common GC algorithms (G1, ZGC, Parallel) and when you might pick one." },
          { text: "What is the difference between `StackOverflowError` and `OutOfMemoryError`?" },
        ],
      },
      {
        id: 28,
        text: "What are the different types of references in Java (strong, weak, soft, phantom)?",
        answer: "Java has four reference strengths that affect whether the GC collects an object. **Strong reference** (normal `=` assignment) — GC never collects reachable objects. **Soft reference** (`SoftReference<T>`) — collected only when memory is low; useful for memory-sensitive caches. **Weak reference** (`WeakReference<T>`) — collected at the next GC cycle whenever no strong references exist; useful for caches where you don't want to prevent collection. **Phantom reference** — object is already finalized, enqueued for post-mortem cleanup; useful for off-heap resource cleanup. `WeakHashMap` uses weak keys — entries disappear automatically when keys are garbage collected.",
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
        answer: "**Encapsulation** — bundle state and behavior together, hide internal details. A `BankAccount` class exposes `deposit()` and `withdraw()` but keeps `balance` private. **Abstraction** — expose only what's necessary, hide complexity. A `PaymentService` interface exposes `processPayment()` — callers don't know if it talks to Stripe or PayPal. **Inheritance** — a subclass inherits and extends a parent's behavior. `SavingsAccount extends BankAccount` adds interest calculation. **Polymorphism** — the same interface behaves differently based on the actual type. A `List<PaymentProcessor>` can hold Stripe, PayPal, and Apple Pay processors, all called the same way.",
        explanation: `**The Spring context for each pillar:**

**Encapsulation:** Your service layer encapsulates business logic and hides repository details from controllers. The controller calls userService.createUser(dto) — it doesn't know whether that triggers a DB write, a Kafka event, or both.

**Abstraction:** Spring Data's JpaRepository is a perfect abstraction. You define findByEmail(String email) — the "how" (SQL generation, connection management) is completely hidden.

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
        answer: "**Compile-time polymorphism** (static dispatch) is achieved through **method overloading** — the compiler picks which method to call based on the argument types at compile time. **Runtime polymorphism** (dynamic dispatch) is achieved through **method overriding** — the JVM picks which implementation to call based on the actual object type at runtime, not the declared variable type. Runtime polymorphism is what makes dependency injection and interface-based programming powerful — you can swap implementations without changing callers.",
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
    double radius;
    public double area() { return Math.PI * radius * radius; }
}

class Rectangle implements Shape {
    double w, h;
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
          { text: "How does method overloading relate to compile-time polymorphism?" },
          { text: "How does the JVM resolve overridden methods at runtime (dynamic dispatch)?" },
          { text: "Can constructors be polymorphic?" },
        ],
      },
      {
        id: 31,
        text: "What is the difference between composition and inheritance? Which is preferred and why?",
        answer: "**Inheritance** models an \"is-a\" relationship — `Dog extends Animal`. The subclass is tightly coupled to the parent's implementation; changes to the parent break the subclass (fragile base class problem). **Composition** models a \"has-a\" relationship — `Car has an Engine`. You delegate to contained objects rather than inheriting from them. Composition is preferred in most cases because: you can swap the composed component at runtime, you can mix multiple behaviors without deep hierarchies, and changes to the component don't affect the container. The GoF book says: **\"Favor object composition over class inheritance.\"**",
        explanation: `**The fragile base class problem inheritance creates:**

\`\`\`java
// Inheritance — changes to parent break children
class Set<E> extends ArrayList<E> { // WRONG: ArrayList is not a Set
    int addCount = 0;
    
    @Override
    public boolean add(E e) {
        addCount++;
        return super.add(e);
    }
    
    @Override
    public boolean addAll(Collection<? extends E> c) {
        addCount += c.size();
        return super.addAll(c); // calls add() internally — addCount doubles!
    }
}
// This is the famous "broken set" example from Effective Java
// addAll([1,2,3]) results in addCount = 6, not 3
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
          { text: "What is the \"favor composition over inheritance\" principle?" },
          { text: "How does composition help avoid the fragile base class problem?" },
          { text: "Give an example where inheritance is still the right choice." },
        ],
      },
      {
        id: 32,
        text: "What is coupling and cohesion?",
        answer: "**Coupling** measures how much one class/module depends on another. **Low coupling** is good — components can change independently. **High coupling** is bad — changing one thing forces changes everywhere. **Cohesion** measures how focused a class/module is — does everything in it belong together? **High cohesion** is good — a class does one clear thing. **Low cohesion** is bad — a class does too many unrelated things. The goal is **high cohesion + low coupling**: each class does one thing well and doesn't need to know details of other classes.",
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
\`\`\`

**Loose coupling — with DI:**
\`\`\`java
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
          { text: "Why is high cohesion and low coupling desirable in a Spring layered architecture?" },
          { text: "How does dependency injection reduce coupling?" },
          { text: "What is the difference between tight and loose coupling with a code example?" },
        ],
      },
      {
        id: 33,
        text: "Explain SOLID principles with examples.",
        answer: "**S**ingle Responsibility: a class should have only one reason to change. **O**pen/Closed: classes should be open for extension but closed for modification — add behavior through new classes, not by editing existing ones. **L**iskov Substitution: subclasses should be substitutable for their parent class without breaking the program. **I**nterface Segregation: prefer small, focused interfaces over fat ones — clients shouldn't depend on methods they don't use. **D**ependency Inversion: depend on abstractions, not concretions — high-level modules shouldn't depend on low-level modules directly.",
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
// VIOLATION — Square extends Rectangle but breaks the contract
class Rectangle { void setWidth(int w); void setHeight(int h); }
class Square extends Rectangle {
    @Override void setWidth(int w) { super.setWidth(w); super.setHeight(w); } // side effects!
}
// Rectangle r = new Square(); r.setWidth(5); r.setHeight(3);
// Expected: area = 15. Actual: area = 9 (square forced equal sides) — LSP violated
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
          { text: "Give a real violation of Single Responsibility you've seen (or would fix) in a controller." },
        ],
      },
      {
        id: 34,
        text: "What are some common design patterns you've used (Singleton, Factory, Builder, Strategy, Observer)? Extra: Facade, Adapter",
        answer: "**Singleton** — one instance per JVM (Spring beans are singletons by default). **Factory** — abstract object creation; Spring's `ApplicationContext.getBean()` is a factory. **Builder** — construct complex objects step by step; `ResponseEntity.ok().header(...).body(...)` is a builder. **Strategy** — swap algorithms at runtime through an interface; payment gateway selection is a strategy. **Observer** — publish/subscribe; Spring's `ApplicationEvent` system is observer. **Facade** — simplified interface to a complex subsystem. **Adapter** — make incompatible interfaces work together.",
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
          { text: "Where does Spring itself use Singleton and Factory patterns?" },
          { text: "When would you use Facade vs Adapter in an integration layer?" },
          { text: "How does the Builder pattern help with complex DTO or entity construction?" },
        ],
      },
      {
        id: 35,
        text: "Why is the Singleton pattern tricky in a multi-threaded environment?",
        answer: "The problem is **lazy initialization without synchronization**. If two threads simultaneously check `instance == null` and both find it null, they'll both create a new instance — you get two singletons. Naive synchronization (making the whole `getInstance()` synchronized) works but creates a performance bottleneck since every call acquires the lock even after initialization. **Double-checked locking** with `volatile` is the classic fix. But the cleanest solutions are: **enum singleton** (thread-safe by JVM spec, free) or just **rely on Spring's singleton scope** (Spring manages the single instance, you never write this boilerplate).",
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
\`\`\`

**Double-checked locking — the full solution:**
\`\`\`java
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
    
    private Connection connection;
    
    DatabaseConnection() {
        connection = DriverManager.getConnection(...);
    }
    
    public Connection getConnection() { return connection; }
}

// Usage
DatabaseConnection.INSTANCE.getConnection();
// Thread-safe by JVM guarantee, handles serialization, immune to reflection attacks
\`\`\`

**The Spring truth:** Spring's default singleton scope means one bean instance per ApplicationContext — Spring handles the thread-safe creation. You never write Singleton pattern boilerplate for Spring-managed beans. The only time you'd write this is for true application-wide singletons outside the Spring context (e.g., in a static utility that runs before the context starts).`,
        followUps: [
          { text: "Explain double-checked locking and why `volatile` is needed." },
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
        answer: "Spring is an enterprise Java framework that manages application infrastructure through an **Inversion of Control (IoC) container**. Before Spring, developers wrote tedious factory boilerplate, manually instantiated dependencies, and managed transaction boundaries with raw JDBC code. Spring handles **dependency injection**, **transaction management**, and **boilerplate plumbing** so you focus purely on business logic. Without Spring, your codebase becomes tightly coupled, impossible to test cleanly, and cluttered with structural glue code.",
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
          { text: "What modules make up the Spring ecosystem (Core, MVC, Data, Security, etc.)?" },
          { text: "How does Spring promote loose coupling compared to manual object wiring?" },
          { text: "What is the difference between Spring Framework and Spring Boot?" },
        ],
      },
      {
        id: 37,
        text: "What is Inversion of Control (IoC) and Dependency Injection (DI)?",
        answer: "**Inversion of Control (IoC)** is a design principle where the control of object creation, lifecycle, and flow is transferred from your custom code to a container framework. **Dependency Injection (DI)** is the concrete design pattern used to achieve IoC by passing dependencies into a class via constructor, setter, or field rather than letting the class instantiate them directly. In Spring, the **IoC container** manages the entire lifecycle of your application objects (beans). If you don't use DI, your classes remain tightly coupled to specific implementations, destroying testability and code reusability.",
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
          { text: "Is DI a form of IoC, or are they the same thing?" },
          { text: "What is the Hollywood Principle (\"don't call us, we'll call you\")?" },
          { text: "How does DI improve testability?" },
        ],
      },
      {
        id: 38,
        text: "What are the different types of dependency injection in Spring?",
        answer: "Spring supports three main types of dependency injection: **constructor injection**, **setter injection**, and **field injection**. **Constructor injection** passes dependencies when the object is instantiated and is the recommended approach for mandatory dependencies. **Setter injection** uses public setter methods and works best for optional dependencies or reconfigurability. **Field injection** uses `@Autowired` directly on private fields, but it makes unit testing difficult and hides dependency smells, so you should avoid it in modern applications.",
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
          { text: "Compare constructor, setter, and field injection with pros/cons." },
          { text: "Why is constructor injection recommended for required dependencies?" },
          { text: "When might setter injection still make sense?" },
        ],
      },
      {
        id: 39,
        text: "What is the Spring IoC container / ApplicationContext?",
        answer: "The **Spring IoC container** is the engine at the core of Spring that creates, configures, wires, and manages the complete lifecycle of application objects called **beans**. `ApplicationContext` is the advanced container interface that extends `BeanFactory` with enterprise features like event publishing, internationalization, and declarative AOP. The container reads configuration metadata (annotations, Java configuration classes, or XML) to assemble the application graph at startup. If the container fails to resolve a dependency graph during boot, it throws a **`BeanCreationException`** and shuts down immediately.",
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
          { text: "Name a few commonly used ApplicationContext implementations." },
          { text: "When is the ApplicationContext created in a Spring Boot app?" },
        ],
      },
      {
        id: 40,
        text: "What is the difference between `BeanFactory` and `ApplicationContext`?",
        answer: "`BeanFactory` is the basic IoC container interface that provides fundamental bean creation and retrieval using **lazy initialization** (beans are instantiated only when requested with `getBean()`). `ApplicationContext` is a child interface of `BeanFactory` designed for enterprise applications, offering **eager initialization** of singleton beans during startup. `ApplicationContext` adds support for AOP integration, application events, message source i18n, and web-aware scopes. You should always use **`ApplicationContext`** in real apps, reserving `BeanFactory` strictly for memory-constrained environments like Android or embedded IoT devices.",
        explanation: `\`\`\`java
// BAD for production — BeanFactory loads lazily, so configuration errors pop up at runtime
BeanFactory factory = new XmlBeanFactory(new ClassPathResource("beans.xml"));
// App starts fast, but crashes later when a user hits a misconfigured bean!
PaymentService service = (PaymentService) factory.getBean("paymentService"); // NPE or BeanDefinitionException here
\`\`\`

\`\`\`java
// GOOD — ApplicationContext loads eagerly, validating all singleton beans at startup
ApplicationContext context = new AnnotationConfigApplicationContext(AppConfig.class);
// Fail-Fast: If a required bean is missing or misconfigured, context fails during startup, NOT during a user request
\`\`\`

**Feature matrix comparison:**

| Feature | \`BeanFactory\` | \`ApplicationContext\` |
| :--- | :--- | :--- |
| **Bean Initialization** | Lazy (on \`getBean()\`) | Eager (at startup for singletons) |
| **Enterprise Services (AOP, Events)** | No | Built-in |
| **Memory Footprint** | Lightweight | Slightly higher |
| **Usage Scenario** | Mobile / Embedded IoT | Standard Web & Microservices |

**Real-world trap:** If you rely on \`BeanFactory\` or set \`@Lazy\` on your singletons indiscriminately, missing configuration properties or broken bean wiring will only fail when the first production request hits that specific line of code. \`ApplicationContext\` gives you fail-fast protection on deployment.`,
        followUps: [
          { text: "Does ApplicationContext eagerly or lazily instantiate singleton beans by default?" },
          { text: "What extra features does ApplicationContext provide (events, i18n, AOP)?" },
          { text: "When would you ever use BeanFactory directly?" },
        ],
      },
      {
        id: 41,
        text: "What are Spring Bean scopes (singleton, prototype, request, session)?",
        answer: "Bean scope defines the **lifecycle and visibility** of a Spring-managed bean instance within the container. **Singleton** is the default scope, creating exactly one shared bean instance per Spring container. **Prototype** creates a brand new bean instance every time the bean is requested from the container. Web-aware scopes include **request** (one instance per HTTP request) and **session** (one instance per HTTP session). If you inject a shorter-lived scope (like request or prototype) into a singleton without a **scoped proxy**, the singleton retains the initial instance forever, corrupting user data across requests.",
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
        answer: "The **Spring Bean lifecycle** represents the sequence of phases a bean goes through from instantiation to destruction inside the container. It starts with **instantiation** (calling the constructor), followed by **dependency injection**, then **Aware interface callbacks** (`BeanNameAware`), **`BeanPostProcessor` pre-initialization**, **initialization callbacks** (`@PostConstruct` or `InitializingBean`), and **`BeanPostProcessor` post-initialization** (where AOP proxies are created). Finally, the bean is ready for use, and upon container shutdown, **destruction callbacks** (`@PreDestroy` or `DisposableBean`) execute. Understanding this sequence is vital when performing custom setup or creating runtime proxy wrappers.",
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
        answer: "`@Component` is the generic stereotype annotation indicating that a Java class is a Spring-managed bean. `@Service`, `@Repository`, and `@Controller` are **specialized meta-annotations** that inherit from `@Component` but convey clear architectural roles across your application layers. `@Controller` marks web request handlers, `@Service` holds business logic, and `@Repository` marks data persistence components while enabling automatic **persistence exception translation** into Spring's `DataAccessException` hierarchy. You should use the specific stereotype for each layer to improve code semantics and leverage layer-specific Spring features.",
        explanation: `\`\`\`java
// BAD — using generic @Component for database access hides persistence errors
@Component
public class SqlUserRepository {
    public User findById(Long id) {
        // If SQLException is thrown here, Spring won't translate it into a Spring DataAccessException
        throw new SQLException("Connection timeout");
    }
}
\`\`\`

\`\`\`java
// GOOD — @Repository translates vendor-specific SQL exceptions automatically
@Repository
public class SqlUserRepository {
    public User findById(Long id) {
        // Spring automatically translates vendor exceptions (e.g., SQLException, HibernateException)
        // into uniform Spring DataAccessException types like DataAccessResourceFailureException
        return entityManager.find(User.class, id);
    }
}
\`\`\`

**Real-world architecture breakdown:**
- \`@Controller\` / \`@RestController\` — Web Presentation layer (handles HTTP requests and response serialization)
- \`@Service\` — Business Logic layer (handles transactions, domain validations, orchestration)
- \`@Repository\` — Persistence layer (handles SQL/NoSQL DB interaction and exception translation)
- \`@Component\` — Cross-cutting utilities (file parsers, external API client helpers, validators)`,
        followUps: [
          { text: "Are they functionally the same for component scanning?" },
          { text: "What extra behavior does `@Repository` enable (exception translation)?" },
          { text: "When would you use plain `@Component` vs a stereotype annotation?" },
        ],
      },
      {
        id: 44,
        text: "What is `@Autowired`, and how does Spring resolve dependencies?",
        answer: "`@Autowired` is an annotation that instructs Spring to perform automatic **dependency injection** by matching managed beans in the container. Spring resolves `@Autowired` dependencies first **by type**; if multiple beans match the requested type, it attempts resolution **by qualifier** (`@Qualifier`) or **by bean name**. If no matching bean is found and `required=true` (the default), Spring throws a **`NoSuchBeanDefinitionException`** during application context startup. In Spring 4.3+, `@Autowired` is completely optional on classes with a single constructor.",
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
          { text: "What is the order of type matching, qualifier, and bean name resolution?" },
          { text: "What happens if no matching bean is found and `required=true`?" },
          { text: "Can you use `@Autowired` on constructors, setters, and fields?" },
        ],
      },
      {
        id: 45,
        text: "What happens when there are multiple beans of the same type — how do you resolve ambiguity (`@Qualifier`, `@Primary`)?",
        answer: "When multiple candidate beans of the same type exist, Spring cannot determine which bean to inject and throws a **`NoUniqueBeanDefinitionException`** at startup. You resolve this ambiguity using **`@Primary`** to mark one bean as the default implementation, or **`@Qualifier`** at the injection site to explicitly name the desired target bean. `@Qualifier` takes precedence over `@Primary` when both are present. You should use `@Primary` when one implementation is used in 90% of cases, and `@Qualifier` when you need precise control at specific injection points.",
        explanation: `\`\`\`java
// BROKEN — Two implementations of PaymentGateway without @Primary or @Qualifier cause startup crash
public interface PaymentGateway { void process(); }

@Component public class StripeGateway implements PaymentGateway { public void process() {} }
@Component public class PaypalGateway implements PaymentGateway { public void process() {} }

@Service
public class CheckoutService {
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
          { text: "What is the difference between `@Qualifier` and `@Primary`?" },
          { text: "How does bean name relate to field name when resolving by name?" },
          { text: "Can you combine `@Qualifier` with constructor injection?" },
        ],
      },
      {
        id: 46,
        text: "What is the difference between constructor injection and field injection? Which is recommended and why?",
        answer: "**Constructor injection** passes dependencies directly through the class constructor during object creation, while **field injection** uses `@Autowired` on private fields using reflection after the instance is allocated. Constructor injection is strongly recommended because it allows fields to be marked **`final` for immutability**, prevents **`NullPointerException` in plain unit tests**, and highlights code smells like having too many responsibilities when constructor parameter lists grow too long. Field injection hides hidden coupling and forces you to run a full Spring container runner just to test a simple unit test.",
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
          { text: "Does Spring still need `@Autowired` on a single constructor (recent versions)?" },
        ],
      },
      {
        id: 47,
        text: "What is `@Configuration` and `@Bean` used for?",
        answer: "`@Configuration` marks a Java class as a source of Spring bean definitions, replacing legacy XML configuration files. `@Bean` is applied to methods within a `@Configuration` class to indicate that the method returns a bean to be managed by the Spring IoC container. `@Configuration` classes are proxied using **CGLIB** so that calling `@Bean` methods internally always returns the cached singleton bean instance rather than executing raw Java method invocations repeatedly. You use `@Bean` primarily when instantiating third-party library classes that you cannot annotate with `@Component`.",
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
        answer: "**Component scanning** is the process where Spring searches your application's classpath for classes annotated with `@Component`, `@Service`, `@Repository`, or `@Controller` and registers them as beans. `@ComponentScan` specifies the base packages to scan; if no package is declared, it defaults to the package of the class containing the `@ComponentScan` annotation. `@SpringBootApplication` automatically includes `@ComponentScan` targeting its own package and all sub-packages. If a bean class lives in a package hierarchy outside the main boot application package, Spring will silently ignore it unless explicitly added to `basePackages`.",
        explanation: `**Project Package Layout TRAP:**
\`\`\`
com.company.app          <-- @SpringBootApplication main class lives here
  ├── controller
  └── service

com.company.external     <-- OUTSIDE MAIN PACKAGE!
  └── LegacyHelper.java  <-- Annotated @Component, but Spring CANNOT find it by default!
\`\`\`

\`\`\`java
// BAD — Spring boot main class won't pick up com.company.external
@SpringBootApplication // Scans com.company.app.* ONLY
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
        answer: "**Spring profiles** provide a mechanism to segregate application configuration and conditionally register beans based on the active runtime environment (such as `dev`, `test`, `staging`, or `prod`). `@Profile` instructs Spring to register a bean or `@Configuration` class only when the specified profile is active. Active profiles are set using `spring.profiles.active` in `application.properties`, environment variables, or JVM arguments (`-Dspring.profiles.active=prod`). If no profile is activated explicitly, Spring activates the `default` profile.",
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
        answer: "**Aspect-Oriented Programming (AOP)** is a programming paradigm that modularizes **cross-cutting concerns** — secondary features like logging, security, transaction management, and performance monitoring — away from core business logic. Spring AOP achieves this by creating **runtime dynamic proxies** around target beans, intercepting method calls before, after, or around execution. Common use cases include `@Transactional` for database transaction boundaries, `@PreAuthorize` for security checks, and custom performance timing annotations. Without AOP, cross-cutting logic clutters every service method with duplicated try-catch and logging code.",
        explanation: `**Analogy:** Imagine a nightclub with a security guard (Aspect) stationed at the entrance. Every guest (method call) must be checked for ID and tickets before entering. The DJ inside the club (business logic) doesn't check IDs — security is handled entirely at the doorway proxy before guests enter.

\`\`\`java
// BAD — Business logic cluttered with repetitive cross-cutting concerns
@Service
public class AccountService {
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

    @Transactional // AOP handles transaction start/commit/rollback
    @LogExecutionTime // Custom AOP aspect handles timing and logging
    public void transferMoney(Long from, Long to, double amount) {
        accountRepo.debit(from, amount);
        accountRepo.credit(to, amount);
    }
}
\`\`\``,
        followUps: [
          { text: "What are cross-cutting concerns? Give 3 examples in a real app." },
          { text: "Does Spring AOP use proxies or bytecode weaving by default?" },
          { text: "What is the self-invocation problem with Spring AOP proxies?" },
        ],
      },
      {
        id: 51,
        text: "Explain `@Before`, `@After`, `@Around`, and other AOP advice types.",
        answer: "AOP **advice** defines what action an aspect takes and when that action executes during method execution. **`@Before`** runs before the target method executes; **`@AfterReturning`** runs after successful method execution; **`@AfterThrowing`** runs if the method throws an exception; **`@After` (finally)** runs after completion regardless of outcome. **`@Around`** is the most powerful advice type because it surrounds method invocation completely, allowing you to modify arguments, inspect or modify return values, handle exceptions, or prevent method execution entirely using `ProceedingJoinPoint.proceed()`. ",
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
          { text: "What is the difference between `@After`, `@AfterReturning`, and `@AfterThrowing`?" },
          { text: "When would you use `@Around` instead of `@Before` + `@After`?" },
          { text: "What is a pointcut expression? Give a simple example." },
        ],
      },
      {
        id: 52,
        text: "What is circular dependency in Spring, and how can it be resolved?",
        answer: "A **circular dependency** occurs when Bean A requires Bean B via constructor injection, and Bean B simultaneously requires Bean A, creating an unresolvable infinite loop during instantiation. Spring detects this circular reference during application context startup and throws a **`BeanCurrentlyInCreationException`**. You resolve circular dependencies by **refactoring code to eliminate tight coupling** (extracting common behavior into a third bean), using **`@Lazy`** on one injection point to delay proxy creation, or using setter injection. Refactoring your design is always the preferred long-term solution.",
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
// WORKAROUND — Using @Lazy injects a dynamic proxy instead of waiting for bean creation
@Service
public class PaymentService {
    private final OrderService orderService;

    public PaymentService(@Lazy OrderService orderService) {
        // Spring injects a proxy; real OrderService is instantiated only when first invoked
        this.orderService = orderService;
    }
}
\`\`\`

\`\`\`java
// BEST FIX — Refactor! Extract shared logic into a separate AuditNotificationService
@Service
public class OrderService {
    private final PaymentService paymentService;
    private final AuditNotificationService auditService;
    // No circle! OrderService -> PaymentService & AuditNotificationService
}
\`\`\`

**Spring Boot 2.6+ change:** Starting with Spring Boot 2.6, circular dependencies are **forbidden by default** across all injection styles. If legacy code has circular references, you have to explicitly set \`spring.main.allow-circular-references=true\` in \`application.properties\`, but refactoring is the right solution.`,
        followUps: [
          { text: "Does constructor injection allow circular dependencies by default?" },
          { text: "How does setter injection or `@Lazy` help break cycles?" },
          { text: "Is fixing the design (extracting a third bean) better than workarounds? Why?" },
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
        answer: "Spring Boot is an extension of the **Spring Framework** that eliminates XML configuration and complex boilerplate setup by providing **opinionated auto-configuration** and **embedded web servers**. While Spring Framework provides the raw core building blocks like IoC and AOP, Spring Boot wraps those building blocks with **starter dependencies** so you can create stand-alone, production-ready applications in minutes. If you use raw Spring without Boot, you must manually manage library version compatibility in Maven/Gradle and configure web servers like Tomcat externally.",
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
          { text: "What problems does Boot solve that raw Spring still requires boilerplate for?" },
          { text: "Can you use Spring without Boot? When might you?" },
          { text: "What is opinionated configuration?" },
        ],
      },
      {
        id: 54,
        text: "What are Spring Boot Starters?",
        answer: "Spring Boot Starters are **curated dependency descriptors** that bundle common third-party libraries and Spring modules into a single convenience dependency. Instead of hunting for individual library versions and dealing with transitive dependency conflicts, you import a single starter like `spring-boot-starter-web` or `spring-boot-starter-data-jpa`. The `spring-boot-starter-parent` manages all library version numbers through **dependency management**. If you don't use starters, your Maven `pom.xml` will swell with dozens of mismatched, conflicting library versions that break at runtime.",
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
          { text: "Name starters you've used (`web`, `data-jpa`, `security`, `actuator`, etc.)." },
          { text: "What is `spring-boot-starter-parent`, and what does it manage?" },
          { text: "How would you create a custom starter for shared company config?" },
        ],
      },
      {
        id: 55,
        text: "What is Auto-Configuration in Spring Boot, and how does it work internally?",
        answer: "**Auto-configuration** is the mechanism where Spring Boot automatically inspects your application's classpath and declared properties to register pre-configured Spring beans. It operates using conditional annotations like **`@ConditionalOnClass`**, **`@ConditionalOnMissingBean`**, and **`@ConditionalOnProperty`**. Spring Boot scans auto-configuration classes listed in `META-INF/spring/org.springframework.boot.autoconfigure.AutoConfiguration.imports`. If you define your own bean instance of a specific type, `@ConditionalOnMissingBean` kicks in and Spring Boot backs off, allowing your custom bean to take precedence.",
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
          { text: "Where are auto-configuration classes registered (`AutoConfiguration.imports`)?" },
          { text: "How do you debug which auto-configs were applied (`--debug`, conditions report)?" },
        ],
      },
      {
        id: 56,
        text: "What is `@SpringBootApplication` — what annotations does it combine?",
        answer: "`@SpringBootApplication` is a meta-annotation that combines **`@SpringBootConfiguration`**, **`@EnableAutoConfiguration`**, and **`@ComponentScan`** into a single convenience annotation. `@SpringBootConfiguration` marks the class as a configuration source, `@EnableAutoConfiguration` triggers Spring Boot's automatic configuration mechanism based on classpath dependencies, and `@ComponentScan` activates component scanning starting from the current package. It is placed on the main entry-point class of your application. If you place `@SpringBootApplication` in the wrong package root, Spring Boot won't scan your service components, causing missing bean runtime errors.",
        explanation: `\`\`\`java
// Equivalent to placing all 3 annotations manually:
@SpringBootConfiguration      // Inherits from @Configuration; enables bean definitions
@EnableAutoConfiguration     // Auto-configures Tomcat, JPA, Jackson, etc.
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

**Package location rule:** Always place your \`@SpringBootApplication\` annotated class in the **root base package** (e.g., \`com.company.order\`). If you put it inside \`com.company.order.config\`, Spring Boot won't scan sibling packages like \`com.company.order.service\`, causing \`NoSuchBeanDefinitionException\`.`,
        followUps: [
          { text: "Break down `@SpringBootConfiguration`, `@EnableAutoConfiguration`, and `@ComponentScan`." },
          { text: "Can you replace `@SpringBootApplication` with its composed annotations?" },
          { text: "How do you exclude a specific auto-configuration?" },
        ],
      },
      {
        id: 57,
        text: "How do you externalize configuration in Spring Boot (`application.properties` / `application.yml`)?",
        answer: "Spring Boot allows you to externalize configuration values using `application.properties` or `application.yml` files, environment variables, system properties, and command-line arguments. Properties are injected into beans using the **`@Value`** annotation or typed binding via **`@ConfigurationProperties`**. Spring Boot evaluates property sources in a strict precedence hierarchy, where **command-line arguments** and **environment variables** override settings in local configuration files. This externalization allows the exact same application binary (JAR) to run in development, testing, and production environments without rebuilding code.",
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

**Precedence Order (Highest to Lowest):**
1. Command line arguments (\`--server.port=9090\`)
2. Environment variables (\`SERVER_PORT=9090\`)
3. Profile-specific files (\`application-prod.yml\`)
4. Application files (\`application.yml\`)

**Production Trap:** Never commit passwords, API keys, or database credentials into \`application.yml\` in source control. Store secrets in environment variables or cloud key vaults (AWS Secrets Manager, HashiCorp Vault).`,
        followUps: [
          { text: "What is the property source precedence order (CLI, env, files, defaults)?" },
          { text: "When would you prefer YAML over properties?" },
          { text: "How do you inject a property with `@Value` vs `@ConfigurationProperties`?" },
        ],
      },
      {
        id: 58,
        text: "What is the purpose of `@ConfigurationProperties`?",
        answer: "`@ConfigurationProperties` binds external configuration properties from `application.yml` or `application.properties` to a strongly-typed Java class using **type-safe object binding**. Unlike `@Value`, which injects flat values one by one, `@ConfigurationProperties` supports **nested objects**, **lists**, **maps**, and **Bean Validation (`@Validated`)**. You use `@ConfigurationProperties` when managing groups of related configuration settings across enterprise services.",
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
          { text: "How do you enable it (`@EnableConfigurationProperties` / `@ConfigurationPropertiesScan`)?" },
          { text: "How does it support type-safe nested configuration and validation (`@Validated`)?" },
          { text: "Why is it preferred over many `@Value` injections for groups of related properties?" },
        ],
      },
      {
        id: 59,
        text: "How do you manage different configurations for different environments (dev, test, prod)?",
        answer: "You manage environment-specific configurations in Spring Boot using **profile-specific property files** (such as `application-dev.yml` and `application-prod.yml`) or multi-document YAML blocks separated by `---`. You activate a specific profile by setting `spring.profiles.active=prod` via command-line arguments, environment variables, or system properties. Spring Boot first loads default properties from `application.yml` and then overlays values from the active profile's configuration file. If you don't isolate profile configurations, test database credentials might bleed into production code paths.",
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
# Activating production profile when launching the executable JAR
java -jar -Dspring.profiles.active=prod order-service.jar
\`\`\`

**Production best practice:** Keep \`application-prod.yml\` clean of plaintext secrets. Use placeholder references like \`password: \${DB_PASSWORD}\` and let Kubernetes or Docker inject \`DB_PASSWORD\` as an environment variable at container startup.`,
        followUps: [
          { text: "How do profile-specific files and `spring.profiles.active` work together?" },
          { text: "How would you keep secrets out of Git for prod (env vars, vault, etc.)?" },
          { text: "What is the difference between multi-document YAML and separate profile files?" },
        ],
      },
      {
        id: 60,
        text: "What is Spring Boot DevTools?",
        answer: "**Spring Boot DevTools** is a developer productivity module that provides **automatic application restart**, **LiveReload**, and **development-friendly default settings** like caching disabling. DevTools uses two classloaders: a base classloader for third-party libraries (which don't change often) and a restart classloader for your active project code. When a code change is compiled, DevTools discards only the restart classloader, restarting the application in under a second. DevTools is automatically disabled when running an application from a packaged production executable JAR.",
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
          { text: "What features does DevTools provide (auto-restart, LiveReload, property defaults)?" },
          { text: "Is DevTools included in production builds by default?" },
          { text: "What is the difference between restart and reload classloaders?" },
        ],
      },
      {
        id: 61,
        text: "What is Spring Boot Actuator, and what are some commonly used endpoints?",
        answer: "**Spring Boot Actuator** provides production-ready monitoring and management features for your application via HTTP endpoints or JMX. Commonly used endpoints include **`/actuator/health`** (application health status), **`/actuator/metrics`** (JVM metrics, memory, CPU, HTTP request stats), **`/actuator/env`** (environment properties), and **`/actuator/loggers`** (view and modify log levels at runtime). By default, only `/health` and `/info` are exposed over HTTP for security reasons. If you expose sensitive Actuator endpoints to the public internet without Spring Security protection, attackers can read environment secrets or dump heap dumps.",
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
          { text: "Which endpoints would you expose in production, and how do you secure them?" },
          { text: "What do `/health`, `/info`, `/metrics`, and `/env` show?" },
          { text: "How do you customize health status aggregation?" },
        ],
      },
      {
        id: 62,
        text: "How do you create a custom Actuator health indicator?",
        answer: "You create a custom Actuator health indicator by implementing the **`HealthIndicator`** interface and registering it as a Spring bean. You override the `health()` method to execute custom diagnostic checks — such as pinging a legacy payment gateway or checking disk space — and return a **`Health`** object with a status of `UP`, `DOWN`, or `UNKNOWN`. Spring Boot automatically aggregates all registered health indicators into the central `/actuator/health` endpoint. If any single indicator reports `DOWN`, the overall application health status drops to `DOWN` (HTTP 503).",
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
          { text: "What interface or base class do you implement (`HealthIndicator`)?" },
          { text: "When would you mark a custom check as DOWN vs OUT_OF_SERVICE?" },
          { text: "How does readiness vs liveness differ in Kubernetes health probes?" },
        ],
      },
      {
        id: 63,
        text: "What embedded servers does Spring Boot support?",
        answer: "Spring Boot supports three embedded Servlet containers: **Apache Tomcat** (the default for `spring-boot-starter-web`), **Eclipse Jetty**, and **Red Hat Undertow**, alongside **Netty** for reactive applications (`spring-boot-starter-webflux`). You switch embedded servers by excluding Tomcat from `spring-boot-starter-web` and adding your preferred server starter (like `spring-boot-starter-undertow`) in Maven or Gradle. Embedded servers eliminate the need to install and configure standalone Tomcat application servers on host servers. If you attempt to include multiple embedded server starters on the classpath simultaneously, Spring Boot throws a startup configuration exception.",
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
          { text: "What is the default embedded server for `spring-boot-starter-web`?" },
          { text: "How do you switch from Tomcat to Jetty or Undertow?" },
          { text: "When would you deploy as WAR to an external server instead?" },
        ],
      },
      {
        id: 64,
        text: "How do you change the default embedded server or port in Spring Boot?",
        answer: "You change the embedded server port in Spring Boot by setting the **`server.port`** property in `application.yml` or `application.properties`. Setting `server.port=0` instructs Spring Boot to scan for and bind to an **available random port** at startup, which is useful for integration tests or microservices running on dynamic host ports. You can also override the port dynamically using environment variables (`SERVER_PORT=9090`) or command-line arguments. If the configured port is already occupied by another process, Spring Boot throws a `PortInUseException` during startup.",
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
          { text: "How do you set the port via `application.yml`, env var, and CLI?" },
          { text: "What happens if the configured port is already in use?" },
          { text: "How do you configure SSL on the embedded server?" },
        ],
      },
      {
        id: 65,
        text: "How does Spring Boot handle logging, and how do you configure log levels?",
        answer: "Spring Boot uses **SLF4J** as an abstraction façade with **Logback** as the default concrete logging implementation. You configure package-level log levels directly in `application.yml` using the **`logging.level.<package-name>`** property prefix. For advanced logging configurations (like JSON formatting for ELK stack or rolling file appenders), you place a `logback-spring.xml` configuration file in the classpath root. If you don't configure log levels explicitly, Spring Boot defaults to `INFO` level for all application and framework packages.",
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
          { text: "What is the default logging framework, and how does Logback fit in?" },
          { text: "How do you set package-level log levels in `application.yml`?" },
          { text: "How do you use a custom `logback-spring.xml` with profiles?" },
        ],
      },
      {
        id: 66,
        text: "What is the difference between `CommandLineRunner` and `ApplicationRunner`?",
        answer: "Both `CommandLineRunner` and `ApplicationRunner` are Spring Boot callback interfaces used to execute custom code blocks **after the Spring ApplicationContext is fully refreshed** but **before application startup completes**. The key difference is argument parsing: `CommandLineRunner` provides raw, unparsed String array arguments (`String... args`), while `ApplicationRunner` wraps arguments into a structured **`ApplicationArguments`** object that separates option arguments (`--env=prod`) from non-option arguments. You use them primarily for database seeding, cache pre-warming, or warm-up checks at startup.",
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
          { text: "When do these runners execute in the application lifecycle?" },
          { text: "How do you control order when multiple runners exist?" },
          { text: "When would you use them for startup data seeding?" },
        ],
      },
      {
        id: 67,
        text: "How do you package a Spring Boot application (JAR vs WAR)?",
        answer: "Spring Boot packages applications by default as **executable (fat/uber) JARs** containing both your application bytecodes and all embedded server dependencies inside a single archive file. Alternatively, applications can be packaged as traditional **WAR archives** to be deployed onto external application servers like standalone Tomcat or WebLogic. Packaging as a WAR requires modifying Maven/Gradle packaging to `war` and extending **`SpringBootServletInitializer`** in your application entry class. Executable JARs are strongly preferred in modern cloud environments because they embrace containerization and single-command deployment (`java -jar app.jar`).",
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
java -jar -Dserver.port=8080 target/order-service-1.0.0.jar
\`\`\`

**How executable JARs work internally:**
Spring Boot uses a custom \`JarLauncher\` that allows nesting JAR dependencies inside \`BOOT-INF/lib/\` within a single ZIP structure without needing to explode dependencies onto host file systems.`,
        followUps: [
          { text: "What is an executable fat/uber JAR?" },
          { text: "What changes are needed to package as WAR (`SpringBootServletInitializer`)?" },
          { text: "How do you run a Boot JAR with external config?" },
        ],
      },
      {
        id: 68,
        text: "What is the difference between `@RestController` and `@Controller`?",
        answer: "`@Controller` is the traditional Spring MVC annotation used to mark web controller classes that return **HTML view templates** (like Thymeleaf or JSP). `@RestController` is a convenience meta-annotation that combines `@Controller` and **`@ResponseBody`**, automatically serializing method return values into JSON or XML HTTP response bodies. You use `@Controller` when building server-side rendered web applications, and `@RestController` when building stateless RESTful APIs for modern single-page applications or microservices.",
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
          { text: "Does `@RestController` include `@ResponseBody` on every method?" },
          { text: "When would you still use `@Controller` (e.g., MVC views / Thymeleaf)?" },
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
        followUps: [
          { text: "What is the Front Controller pattern, and how does DispatcherServlet implement it?" },
          { text: "What roles do HandlerAdapter, ViewResolver, and interceptors play?" },
          { text: "Where does filter chain sit relative to DispatcherServlet?" },
        ],
      },
      {
        id: 70,
        text: "What is `@RequestMapping`, and how do `@GetMapping`, `@PostMapping`, etc. differ from it?",
        followUps: [
          { text: "Can you put `@RequestMapping` on a class for a base path?" },
          { text: "How do you map multiple paths or HTTP methods on one method?" },
          { text: "How do `consumes` and `produces` attributes work?" },
        ],
      },
      {
        id: 71,
        text: "What is the difference between `@PathVariable` and `@RequestParam`?",
        followUps: [
          { text: "When is a request param required vs optional, and how do you set defaults?" },
          { text: "How do you bind multiple query params into an object?" },
          { text: "What happens with encoded path segments (e.g., spaces, slashes)?" },
        ],
      },
      {
        id: 72,
        text: "What is `@RequestBody` and `@ResponseBody` used for?",
        followUps: [
          { text: "Which HttpMessageConverter handles JSON by default (Jackson)?" },
          { text: "How does `@RestController` relate to `@ResponseBody`?" },
          { text: "What happens if deserialization fails for the request body?" },
        ],
      },
      {
        id: 73,
        text: "How do you handle validation of request payloads in Spring Boot (`@Valid`, `@Validated`)?",
        followUps: [
          { text: "What is the difference between `@Valid` and `@Validated` (groups)?" },
          { text: "Where do you put constraint annotations — DTO fields or custom validators?" },
          { text: "How do you return a structured 400 response for validation errors?" },
        ],
      },
      {
        id: 74,
        text: "How do you implement global exception handling (`@ControllerAdvice`, `@ExceptionHandler`)?",
        followUps: [
          { text: "What is the difference between `@ControllerAdvice` and `@RestControllerAdvice`?" },
          { text: "How do you map domain exceptions to HTTP status codes?" },
          { text: "Should you expose stack traces to clients in production? Why not?" },
        ],
      },
      {
        id: 75,
        text: "What HTTP status codes are commonly used, and how do you return custom status codes from a controller?",
        followUps: [
          { text: "When would you return 201 Created vs 200 OK?" },
          { text: "What is the difference between 401 and 403?" },
          { text: "How do you return a status with `ResponseEntity` vs `@ResponseStatus`?" },
        ],
      },
      {
        id: 76,
        text: "What is `ResponseEntity`, and when would you use it?",
        followUps: [
          { text: "How do you set custom headers with ResponseEntity?" },
          { text: "When is returning a DTO directly (with `@RestController`) enough?" },
          { text: "How do you build a ResponseEntity with the builder API?" },
        ],
      },
      {
        id: 77,
        text: "How do you version REST APIs?",
        followUps: [
          { text: "Compare URI versioning (`/v1/users`) vs header versioning." },
          { text: "How do you deprecate an old API version safely?" },
          { text: "What are trade-offs of query-param versioning?" },
        ],
      },
      {
        id: 78,
        text: "What is HATEOAS?",
        followUps: [
          { text: "What does \"hypermedia as the engine of application state\" mean in practice?" },
          { text: "Have you used Spring HATEOAS? When is it worth the complexity?" },
          { text: "How do links in responses help API discoverability?" },
        ],
      },
      {
        id: 79,
        text: "How do you handle CORS in a Spring Boot application?",
        followUps: [
          { text: "What is a preflight request, and which HTTP method is used?" },
          { text: "How do `@CrossOrigin`, global CORS config, and Security CORS differ?" },
          { text: "What headers matter for CORS (`Origin`, `Access-Control-Allow-*`)?" },
        ],
      },
      {
        id: 80,
        text: "What is content negotiation in Spring MVC?",
        followUps: [
          { text: "How does the `Accept` header influence response format?" },
          { text: "How can path extensions or query params participate in negotiation?" },
          { text: "How do you support both JSON and XML for the same endpoint?" },
        ],
      },
      {
        id: 81,
        text: "How do you document REST APIs (Swagger/OpenAPI)?",
        followUps: [
          { text: "What is the difference between Swagger and OpenAPI 3?" },
          { text: "How do you integrate springdoc-openapi with Spring Boot?" },
          { text: "How do you document auth (Bearer JWT) in OpenAPI?" },
        ],
      },
      {
        id: 82,
        text: "What is the difference between PUT, PATCH, and POST?",
        followUps: [
          { text: "Which methods are idempotent, and why does that matter?" },
          { text: "When would you use PUT for full replace vs PATCH for partial update?" },
          { text: "Is POST always non-idempotent? What about create-with-client-id patterns?" },
        ],
      },
      {
        id: 83,
        text: "How do you implement pagination and sorting in a REST API?",
        followUps: [
          { text: "How does Spring Data's `Pageable` integrate with controllers?" },
          { text: "What should a paginated response include (content, total, page, size)?" },
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
        followUps: [
          { text: "What boilerplate does it remove compared to plain JPA EntityManager code?" },
          { text: "How do repository interfaces get implemented at runtime?" },
          { text: "What is the difference between Spring Data JPA and JDBC Template?" },
        ],
      },
      {
        id: 85,
        text: "What is the difference between JPA, Hibernate, and Spring Data JPA?",
        followUps: [
          { text: "Is Hibernate a JPA implementation or a separate API?" },
          { text: "Can you use Hibernate features that are not in the JPA standard?" },
          { text: "Where does Spring Data JPA sit in this stack?" },
        ],
      },
      {
        id: 86,
        text: "What is the difference between `JpaRepository`, `CrudRepository`, and `PagingAndSortingRepository`?",
        followUps: [
          { text: "Which methods does each interface add?" },
          { text: "Why is `JpaRepository` the most common choice?" },
          { text: "Should you expose delete-all methods on production repositories?" },
        ],
      },
      {
        id: 87,
        text: "How do you write custom queries using `@Query`?",
        followUps: [
          { text: "What is the difference between JPQL and native SQL in `@Query`?" },
          { text: "How do you use named parameters vs positional parameters?" },
          { text: "How do you run modifying queries (`@Modifying`) with `@Transactional`?" },
        ],
      },
      {
        id: 88,
        text: "What is the difference between derived query methods and `@Query` annotated methods?",
        followUps: [
          { text: "When do derived methods become too complex or ambiguous?" },
          { text: "How does Spring parse method names like `findByEmailAndStatus`?" },
          { text: "Can derived queries support pagination and sorting?" },
        ],
      },
      {
        id: 89,
        text: "What is the N+1 select problem, and how do you solve it?",
        followUps: [
          { text: "How would you detect N+1 in logs or with a tool?" },
          { text: "How do `JOIN FETCH`, `@EntityGraph`, and batch fetching help?" },
          { text: "When is DTO projection a better fix than eager fetching?" },
        ],
      },
      {
        id: 90,
        text: "What is the difference between `FetchType.LAZY` and `FetchType.EAGER`?",
        followUps: [
          { text: "What is the default fetch type for `@ManyToOne` vs `@OneToMany`?" },
          { text: "What is `LazyInitializationException`, and when does it occur?" },
          { text: "How do Open Session In View (OSIV) settings affect lazy loading?" },
        ],
      },
      {
        id: 91,
        text: "Explain the different types of entity relationships (`@OneToOne`, `@OneToMany`, `@ManyToOne`, `@ManyToMany`).",
        followUps: [
          { text: "What is owning side vs inverse side, and why does `mappedBy` matter?" },
          { text: "How do you model a many-to-many with an intermediate entity (extra columns)?" },
          { text: "What cascade types are commonly used, and when is `CascadeType.ALL` dangerous?" },
        ],
      },
      {
        id: 92,
        text: "What is the Hibernate first-level and second-level cache?",
        followUps: [
          { text: "Is the first-level cache enabled by default? What is its scope?" },
          { text: "How do you enable and configure second-level cache (e.g., with Redis/Ehcache)?" },
          { text: "What is query cache, and when is it useful?" },
        ],
      },
      {
        id: 93,
        text: "What is the difference between `save()`, `saveAndFlush()`, and `persist()`?",
        followUps: [
          { text: "Is Spring Data's `save()` always an insert or can it update?" },
          { text: "When do you need `flush` before a subsequent query in the same transaction?" },
          { text: "How does `merge()` differ from `persist()` for detached entities?" },
        ],
      },
      {
        id: 94,
        text: "What is optimistic locking vs pessimistic locking?",
        followUps: [
          { text: "How does `@Version` implement optimistic locking?" },
          { text: "What exception is thrown on optimistic lock failure?" },
          { text: "When would you choose pessimistic locking (`LockModeType.PESSIMISTIC_WRITE`)?" },
        ],
      },
      {
        id: 95,
        text: "How do you manage database transactions in Spring (`@Transactional`)?",
        followUps: [
          { text: "What is the default rollback policy for runtime vs checked exceptions?" },
          { text: "Does `@Transactional` work on private methods or self-invocation? Why?" },
          { text: "Where should transactional boundaries live — controller, service, or repository?" },
        ],
      },
      {
        id: 96,
        text: "What is transaction propagation, and what are the different propagation types?",
        followUps: [
          { text: "Explain `REQUIRED`, `REQUIRES_NEW`, and `NESTED` with scenarios." },
          { text: "What happens with `NOT_SUPPORTED` and `MANDATORY`?" },
          { text: "When would you use `REQUIRES_NEW` for audit logging?" },
        ],
      },
      {
        id: 97,
        text: "What are transaction isolation levels?",
        followUps: [
          { text: "Explain dirty read, non-repeatable read, and phantom read." },
          { text: "What is Spring/DB default isolation for most apps?" },
          { text: "How do you set isolation on `@Transactional`?" },
        ],
      },
      {
        id: 98,
        text: "How do you handle database migrations (Flyway/Liquibase)?",
        followUps: [
          { text: "Why prefer migrations over `ddl-auto=update` in production?" },
          { text: "How does Flyway version and checksum migration files?" },
          { text: "How do you handle a failed migration in a shared environment?" },
        ],
      },
      {
        id: 99,
        text: "What is connection pooling, and which connection pool does Spring Boot use by default (HikariCP)?",
        followUps: [
          { text: "What key HikariCP settings matter (`maximumPoolSize`, timeouts)?" },
          { text: "What symptoms indicate pool exhaustion?" },
          { text: "How do you monitor pool metrics with Actuator?" },
        ],
      },
      {
        id: 100,
        text: "What is the difference between SQL and NoSQL databases, and when would you choose one over the other?",
        followUps: [
          { text: "When is MongoDB a better fit than PostgreSQL?" },
          { text: "How do transactions differ in document stores vs relational DBs?" },
          { text: "Can you use both SQL and NoSQL in one Spring Boot system?" },
        ],
      },
      {
        id: 101,
        text: "Explain indexing in databases and how it affects query performance.",
        followUps: [
          { text: "What is the trade-off of too many indexes on write-heavy tables?" },
          { text: "What is a composite index, and does column order matter?" },
          { text: "How would you identify a missing index (EXPLAIN, slow query log)?" },
        ],
      },
      {
        id: 102,
        text: "What is the difference between `INNER JOIN`, `LEFT JOIN`, and `RIGHT JOIN`?",
        followUps: [
          { text: "When would a LEFT JOIN return nulls for the right side?" },
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
        followUps: [
          { text: "What is the security filter chain at a high level?" },
          { text: "How does Spring Security integrate with servlet filters?" },
          { text: "What defaults does Spring Security enable out of the box?" },
        ],
      },
      {
        id: 104,
        text: "What is the difference between authentication and authorization?",
        followUps: [
          { text: "Where does each happen in a typical request to a secured API?" },
          { text: "What is a principal and authorities/roles?" },
          { text: "Can you be authenticated but not authorized? Give an example." },
        ],
      },
      {
        id: 105,
        text: "How does JWT-based authentication work in a Spring Boot application?",
        followUps: [
          { text: "What are the parts of a JWT (header, payload, signature)?" },
          { text: "Where should tokens be stored on the client, and what are XSS/CSRF concerns?" },
          { text: "How do you handle token refresh and expiration?" },
        ],
      },
      {
        id: 106,
        text: "What is the difference between session-based and token-based authentication?",
        followUps: [
          { text: "Why are token-based approaches often preferred for stateless REST APIs?" },
          { text: "How does horizontal scaling differ for sticky sessions vs JWT?" },
          { text: "What is session fixation, and how is it mitigated?" },
        ],
      },
      {
        id: 107,
        text: "How do you secure REST APIs using Spring Security?",
        followUps: [
          { text: "How do you permit public endpoints like `/login` and `/actuator/health`?" },
          { text: "How do you disable form login and use a JWT filter instead?" },
          { text: "How do you return 401 JSON instead of redirecting to a login page?" },
        ],
      },
      {
        id: 108,
        text: "What is `SecurityFilterChain`, and how do you configure it?",
        followUps: [
          { text: "Why did Spring Security move away from `WebSecurityConfigurerAdapter`?" },
          { text: "How do you define multiple filter chains for different path patterns?" },
          { text: "Where does your custom JWT filter sit in the chain?" },
        ],
      },
      {
        id: 109,
        text: "What is CSRF, and how does Spring Security handle it?",
        followUps: [
          { text: "Why is CSRF often disabled for pure stateless JWT APIs?" },
          { text: "When must CSRF protection stay enabled (cookie-based sessions)?" },
          { text: "How does the synchronizer token pattern work?" },
        ],
      },
      {
        id: 110,
        text: "What is role-based access control, and how do you implement it (`@PreAuthorize`, `@Secured`)?",
        followUps: [
          { text: "What is the difference between roles and authorities in Spring Security?" },
          { text: "How do you enable method security (`@EnableMethodSecurity`)?" },
          { text: "When would you use SpEL in `@PreAuthorize` for object-level checks?" },
        ],
      },
      {
        id: 111,
        text: "How do you store passwords securely (`PasswordEncoder`, BCrypt)?",
        followUps: [
          { text: "Why should you never store plain-text or reversible encrypted passwords?" },
          { text: "What is salting, and does BCrypt handle it?" },
          { text: "How do you migrate from one encoder to another with `DelegatingPasswordEncoder`?" },
        ],
      },
      {
        id: 112,
        text: "What is OAuth2, and how does Spring Boot integrate with it?",
        followUps: [
          { text: "What is the difference between OAuth2 and OpenID Connect?" },
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
        followUps: [
          { text: "What are the operational costs of microservices that people underestimate?" },
          { text: "When is a modular monolith a better choice?" },
          { text: "How do you draw service boundaries (domain-driven design)?" },
        ],
      },
      {
        id: 114,
        text: "What is service discovery, and how does Eureka work?",
        followUps: [
          { text: "What is the difference between client-side and server-side discovery?" },
          { text: "How does a service register and renew its lease?" },
          { text: "What alternatives exist (Consul, Kubernetes DNS)?" },
        ],
      },
      {
        id: 115,
        text: "What is an API Gateway, and why is it needed?",
        followUps: [
          { text: "What cross-cutting concerns does a gateway handle (auth, rate limit, routing)?" },
          { text: "How does Spring Cloud Gateway differ from Zuul?" },
          { text: "What are the risks of a gateway becoming a bottleneck?" },
        ],
      },
      {
        id: 116,
        text: "What is Spring Cloud, and what problems does it solve?",
        followUps: [
          { text: "Name key Spring Cloud projects you've used or know." },
          { text: "How does Spring Cloud relate to Netflix OSS historically?" },
          { text: "What has Kubernetes replaced in modern Spring Cloud setups?" },
        ],
      },
      {
        id: 117,
        text: "How do microservices communicate with each other (REST, messaging, gRPC)?",
        followUps: [
          { text: "When would you choose async messaging over synchronous REST?" },
          { text: "What are the trade-offs of gRPC vs JSON REST?" },
          { text: "How do timeouts and retries affect cascading failures?" },
        ],
      },
      {
        id: 118,
        text: "What is Feign Client, and how is it used?",
        followUps: [
          { text: "How does OpenFeign integrate with load balancing and service discovery?" },
          { text: "How do you configure timeouts and error decoding?" },
          { text: "What is the difference between Feign and WebClient/RestClient?" },
        ],
      },
      {
        id: 119,
        text: "What is circuit breaker pattern, and how is it implemented (Resilience4j/Hystrix)?",
        followUps: [
          { text: "What states does a circuit breaker have (closed, open, half-open)?" },
          { text: "How does Resilience4j compare to Netflix Hystrix (status today)?" },
          { text: "How do fallback methods help degrade gracefully?" },
        ],
      },
      {
        id: 120,
        text: "How do you handle distributed configuration in microservices (Spring Cloud Config)?",
        followUps: [
          { text: "How does a config server with a Git backend work?" },
          { text: "How do services refresh config without restart (`@RefreshScope`)?" },
          { text: "What secrets management approaches pair with config servers?" },
        ],
      },
      {
        id: 121,
        text: "What is the Saga pattern, and why is it used in distributed transactions?",
        followUps: [
          { text: "What is the difference between choreography and orchestration sagas?" },
          { text: "How do compensating transactions work?" },
          { text: "Why is 2PC often avoided in microservices?" },
        ],
      },
      {
        id: 122,
        text: "How do you handle centralized logging and tracing across microservices (ELK, Sleuth, Zipkin)?",
        followUps: [
          { text: "What is a correlation/trace ID, and how is it propagated?" },
          { text: "How does Micrometer Tracing relate to Sleuth in modern Boot?" },
          { text: "What is the difference between logs, metrics, and traces?" },
        ],
      },
      {
        id: 123,
        text: "What is message-driven architecture, and how do Kafka/RabbitMQ fit into Spring Boot apps?",
        followUps: [
          { text: "When would you pick Kafka over RabbitMQ?" },
          { text: "How does Spring for Apache Kafka / Spring AMQP abstract producers and consumers?" },
          { text: "What is at-least-once vs exactly-once delivery?" },
        ],
      },
      {
        id: 124,
        text: "What is idempotency, and why does it matter in distributed systems?",
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
        followUps: [
          { text: "Where do you draw the line in a Spring Boot app (service unit test vs `@SpringBootTest`)?" },
          { text: "What is the testing pyramid, and why prefer more unit tests?" },
          { text: "When is an end-to-end test worth the cost?" },
        ],
      },
      {
        id: 126,
        text: "How do you write unit tests in Spring Boot using JUnit and Mockito?",
        followUps: [
          { text: "What is the difference between JUnit 4 and JUnit 5 annotations?" },
          { text: "How do you structure Arrange-Act-Assert in a clean test?" },
          { text: "When do you use `@ExtendWith(MockitoExtension.class)`?" },
        ],
      },
      {
        id: 127,
        text: "What is `@SpringBootTest`, and how does it differ from `@WebMvcTest` and `@DataJpaTest`?",
        followUps: [
          { text: "What does each slice load into the context?" },
          { text: "Why are slice tests faster than full `@SpringBootTest`?" },
          { text: "When must you use a full application context?" },
        ],
      },
      {
        id: 128,
        text: "What is Mockito, and how do `@Mock`, `@InjectMocks`, and `@Spy` differ?",
        followUps: [
          { text: "When would you use a spy instead of a mock?" },
          { text: "What is the difference between `when().thenReturn()` and `doReturn().when()`?" },
          { text: "How do you verify interactions (`verify`, `times`, `never`)?" },
        ],
      },
      {
        id: 129,
        text: "How do you mock a REST API call in a test?",
        followUps: [
          { text: "How do you mock a Feign client vs WebClient?" },
          { text: "What is WireMock, and when do you prefer it over pure Mockito?" },
          { text: "How do you test timeout and error handling paths?" },
        ],
      },
      {
        id: 130,
        text: "What is `MockMvc`, and how is it used to test controllers?",
        followUps: [
          { text: "How do you assert JSON paths and status codes with MockMvc?" },
          { text: "What is the difference between standalone setup and full Spring context?" },
          { text: "How do you test secured endpoints with MockMvc?" },
        ],
      },
      {
        id: 131,
        text: "What is Testcontainers, and why would you use it?",
        followUps: [
          { text: "How do you spin up Postgres/Kafka in integration tests?" },
          { text: "What are the trade-offs vs H2 in-memory databases?" },
          { text: "How do you reuse containers across tests for speed?" },
        ],
      },
      {
        id: 132,
        text: "How do you handle test data setup and teardown in Spring Boot tests?",
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
        followUps: [
          { text: "What are pros of Gradle's incremental builds and Kotlin DSL?" },
          { text: "Why do many Spring Boot projects still default to Maven?" },
          { text: "How do you run a Boot app with each tool?" },
        ],
      },
      {
        id: 134,
        text: "What is the Maven lifecycle, and what are common phases (compile, test, package, install)?",
        followUps: [
          { text: "What is the difference between `package` and `install`?" },
          { text: "How do plugins bind to lifecycle phases?" },
          { text: "What does `mvn clean verify` run?" },
        ],
      },
      {
        id: 135,
        text: "What is dependency management in Maven, and how do you resolve version conflicts?",
        followUps: [
          { text: "What is nearest-wins and dependency mediation?" },
          { text: "How does `dependencyManagement` / BOM help (e.g., Spring Boot parent)?" },
          { text: "How do you find and exclude transitive dependencies?" },
        ],
      },
      {
        id: 136,
        text: "What is the difference between `git merge` and `git rebase`?",
        followUps: [
          { text: "When is rebase dangerous on shared branches?" },
          { text: "What does a linear history buy you?" },
          { text: "How do you resolve conflicts in each workflow?" },
        ],
      },
      {
        id: 137,
        text: "What is a merge conflict, and how do you resolve it?",
        followUps: [
          { text: "What markers appear in conflicted files?" },
          { text: "How do you abort a merge or rebase mid-conflict?" },
          { text: "How do code reviews help prevent painful conflicts?" },
        ],
      },
      {
        id: 138,
        text: "What is the difference between `git fetch` and `git pull`?",
        followUps: [
          { text: "What does `git pull --rebase` do?" },
          { text: "Why might you prefer fetch + inspect before merging?" },
          { text: "What is a fast-forward merge?" },
        ],
      },
      {
        id: 139,
        text: "What is CI/CD, and have you worked with any pipelines (Jenkins, GitHub Actions)?",
        followUps: [
          { text: "What stages would you put in a Spring Boot pipeline (build, test, image, deploy)?" },
          { text: "How do you keep secrets in CI?" },
          { text: "What is the difference between continuous delivery and continuous deployment?" },
        ],
      },
      {
        id: 140,
        text: "What is Docker, and how do you containerize a Spring Boot application?",
        followUps: [
          { text: "What would a multi-stage Dockerfile for a Boot JAR look like at a high level?" },
          { text: "Why use a JRE-only base image in the final stage?" },
          { text: "How do you pass env vars / profiles into a container?" },
        ],
      },
      {
        id: 141,
        text: "What is the purpose of a Dockerfile vs docker-compose?",
        followUps: [
          { text: "When do you use compose for local dev with DB + app + Redis?" },
          { text: "How do volumes and networks work in compose?" },
          { text: "Is compose typically used in production Kubernetes environments?" },
        ],
      },
      {
        id: 142,
        text: "What is Kubernetes, and what is its role in deploying microservices?",
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
        followUps: [
          { text: "How do you generate unique short codes at scale (hash vs base62 counter)?" },
          { text: "How would you handle custom aliases and expiration?" },
          { text: "What is the read/write ratio, and how does that affect caching?" },
        ],
      },
      {
        id: 144,
        text: "How would you design a rate limiter for an API?",
        followUps: [
          { text: "Compare token bucket, leaky bucket, and fixed window algorithms." },
          { text: "How would you implement rate limiting with Redis in Spring?" },
          { text: "Should rate limiting live in the gateway, service, or both?" },
        ],
      },
      {
        id: 145,
        text: "How would you handle a scenario where an API needs to process a large file upload without blocking the main thread?",
        followUps: [
          { text: "Would you use async processing, streaming, or object storage direct upload?" },
          { text: "How do you report progress and failures to the client?" },
          { text: "What timeouts and size limits would you configure?" },
        ],
      },
      {
        id: 146,
        text: "How would you design a notification service that sends emails/SMS asynchronously?",
        followUps: [
          { text: "How do you ensure delivery retries without spamming users?" },
          { text: "What role do message queues play in this design?" },
          { text: "How do you template and personalize notifications at scale?" },
        ],
      },
      {
        id: 147,
        text: "How do you handle caching in a Spring Boot application (`@Cacheable`, Redis)?",
        followUps: [
          { text: "What is the difference between `@Cacheable`, `@CachePut`, and `@CacheEvict`?" },
          { text: "How do you choose TTLs and cache keys?" },
          { text: "What is cache stampede, and how do you mitigate it?" },
        ],
      },
      {
        id: 148,
        text: "How would you scale a Spring Boot application to handle increased traffic?",
        followUps: [
          { text: "What is the difference between vertical and horizontal scaling?" },
          { text: "How do stateless services + load balancers enable scale-out?" },
          { text: "What bottlenecks appear first (DB, pool, GC, external APIs)?" },
        ],
      },
      {
        id: 149,
        text: "How would you debug a production issue where an API is responding slowly?",
        followUps: [
          { text: "What metrics and logs would you check first?" },
          { text: "How do distributed traces help isolate the slow hop?" },
          { text: "How would you safely profile or thread-dump a live JVM?" },
        ],
      },
      {
        id: 150,
        text: "How do you ensure data consistency when multiple services update related data?",
        followUps: [
          { text: "What consistency models exist (strong, eventual)?" },
          { text: "How do outbox pattern and idempotent consumers help?" },
          { text: "When is a saga preferable to a distributed transaction?" },
        ],
      },
      {
        id: 151,
        text: "What is asynchronous processing in Spring Boot (`@Async`), and when would you use it?",
        followUps: [
          { text: "How do you configure the executor for `@Async` methods?" },
          { text: "What are the limitations of `@Async` (proxy, return types, error handling)?" },
          { text: "When should you use a message queue instead of `@Async`?" },
        ],
      },
      {
        id: 152,
        text: "How do you schedule recurring tasks in Spring Boot (`@Scheduled`)?",
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
        followUps: [
          { text: "What was your specific contribution vs the team's?" },
          { text: "What architecture decisions did you make, and what would you change?" },
          { text: "How did you handle auth, data, and deployment in that project?" },
        ],
      },
      {
        id: 154,
        text: "Describe a challenging bug you fixed in production — how did you diagnose it?",
        followUps: [
          { text: "What tools and signals led you to the root cause?" },
          { text: "How did you mitigate impact while investigating?" },
          { text: "What process changes did you introduce to prevent recurrence?" },
        ],
      },
      {
        id: 155,
        text: "How do you approach code reviews, and what do you look for?",
        followUps: [
          { text: "How do you give constructive feedback without blocking the team?" },
          { text: "What correctness, security, and readability checks do you prioritize?" },
          { text: "How do you handle disagreements in review?" },
        ],
      },
      {
        id: 156,
        text: "Tell me about a time you had to optimize a slow-performing API or query.",
        followUps: [
          { text: "How did you measure before and after?" },
          { text: "Was the fix caching, indexing, query rewrite, or architecture?" },
          { text: "What trade-offs did the optimization introduce?" },
        ],
      },
      {
        id: 157,
        text: "How do you keep yourself updated with new Spring/Java features?",
        followUps: [
          { text: "What resources do you follow (docs, blogs, release notes)?" },
          { text: "Have you adopted a recent Java or Spring feature in a project?" },
          { text: "How do you evaluate whether to upgrade major versions at work?" },
        ],
      },
      {
        id: 158,
        text: "Describe a situation where you disagreed with a technical decision — how did you handle it?",
        followUps: [
          { text: "How did you present alternatives with data or prototypes?" },
          { text: "What did you do when the team chose a different path?" },
          { text: "What did you learn about communication from that situation?" },
        ],
      },
    ],
  },
];

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
