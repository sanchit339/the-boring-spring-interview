/**
 * Answer bank for follow-up questions — Spring Data JPA / Hibernate category.
 * Keyed by the exact follow-up `text` so answers merge into the FollowUp
 * objects at runtime without touching questions.ts.
 *
 * Style (per answer_rules.md):
 *  - 2-5 sentences, prose, no bullets/headers
 *  - Bold the terms that actually matter
 *  - No GPT fluff, no "In conclusion", active voice, contractions
 *  - BAD/GOOD code only where it proves understanding
 */
export const followupAnswersJpa: Record<string, string> = {

  // ===================== Q84: Spring Data JPA basics =====================
  "What boilerplate does it remove compared to plain JPA EntityManager code?":
    "With plain `EntityManager` you write `em.createQuery(...)`, manage `EntityTransaction` manually, handle `close()` in finally blocks, and build parameterized queries by hand for every operation. Spring Data JPA generates all of that — `findById`, `save`, `delete`, pagination — at startup from an interface you declare. The boilerplate that used to be 50 lines of DAO per entity becomes **zero lines**. The only time you go back to `EntityManager` is for advanced JPQL or Criteria API queries that derived methods can't express.",

  "How do repository interfaces get implemented at runtime?":
    "Spring Data scans for interfaces that extend `Repository` and generates a **JDK dynamic proxy** backed by `SimpleJpaRepository` at application startup — the `@EnableJpaRepositories` (auto-enabled in Spring Boot) triggers this. The proxy intercepts method calls and dispatches them to the right query strategy: derived query parser, `@Query` executor, or base `SimpleJpaRepository` methods. You never write an implementation class — the proxy *is* the implementation. Swapping Spring Data Mongo for Spring Data JPA doesn't require changing your interface because the proxy generation mechanism is the same.",

  "What is the difference between Spring Data JPA and JDBC Template?":
    "**`JdbcTemplate`** is a thin wrapper over raw JDBC — you write SQL yourself, map `ResultSet` rows to objects manually, and get predictable query control with no ORM magic. **Spring Data JPA** sits on top of Hibernate (JPA), gives you an entity model with relationships, dirty checking, caching, and zero-SQL for common operations. Use `JdbcTemplate` when you need full SQL control, bulk operations, or reporting queries; use Spring Data JPA when your domain is object-relational and you want productivity on CRUD. Mixing both in one app is fine — many production apps use Spring Data JPA for entities and `JdbcTemplate` for complex read queries.",

  // ===================== Q85: JPA vs Hibernate vs Spring Data JPA =====================
  "Is Hibernate a JPA implementation or a separate API?":
    "Hibernate is **both** — it's a full ORM with its own proprietary API (`Session`, `Criteria`, `HQL`) that predates JPA, and it also **implements** the JPA standard (`EntityManager`, `JPQL`, `@Entity`). The JPA spec (`javax.persistence` / `jakarta.persistence`) is an interface; Hibernate is the most popular implementation of that interface. When Spring Boot adds `spring-boot-starter-data-jpa`, it pulls in Hibernate as the JPA provider by default.",

  "Can you use Hibernate features that are not in the JPA standard?":
    "Yes — `@NaturalId`, `@BatchSize`, `@Filter`, `@Cache` (second-level), `@CreationTimestamp`/`@UpdateTimestamp`, and `Session.doWork(...)` are all Hibernate-specific extensions that go beyond JPA. The trade-off is **vendor lock-in** — using them makes your codebase harder to swap to EclipseLink or another JPA provider, though in practice almost no production app ever switches. If you need a Hibernate feature, use it; don't write 200 lines of workaround to stay \\\"pure JPA.\\\"",

  "Where does Spring Data JPA sit in this stack?":
    "The stack is: **Spring Data JPA → JPA API → Hibernate → JDBC → Database**. Spring Data JPA is the topmost layer — it generates repository implementations that call JPA's `EntityManager`. JPA is the standard API; Hibernate is the implementation that translates `EntityManager` calls into JDBC. Spring Data JPA doesn't replace Hibernate or JPA; it reduces the code *you* write to drive them. Think of it as scaffolding built over a standard interface.",

  // ===================== Q86: Repository hierarchy =====================
  "Which methods does each interface add?":
    "`CrudRepository` gives you `save`, `findById`, `findAll`, `delete`, `deleteById`, `existsById`, and `count` — the absolute CRUD minimum. `PagingAndSortingRepository` extends it with `findAll(Pageable)` and `findAll(Sort)`. `JpaRepository` extends `PagingAndSortingRepository` with `saveAll`, `flush`, `saveAndFlush`, `deleteAllInBatch`, `deleteInBatch`, and `getById` — plus it returns `List` instead of `Iterable` for findAll, which is more practical. Each level adds features without removing lower-level ones.",

  "Why is `JpaRepository` the most common choice?":
    "`JpaRepository` returns `List<T>` from `findAll()` instead of `Iterable<T>`, which means you can immediately call `.size()`, `.get(0)`, or stream it without casting. It also exposes `flush` and `saveAndFlush` for when you need to control when dirty changes hit the DB. More practically: `JpaRepository` gives you everything from both parent interfaces so you never have to upgrade the interface when you need pagination later. There's no meaningful downside to starting with it.",

  "Should you expose delete-all methods on production repositories?":
    "`deleteAll()` and `deleteAllInBatch()` from `JpaRepository` are dangerous because a caller can wipe an entire table — no filter, no confirmation. **Don't expose them** through a service interface or REST endpoint unless you have explicit admin controls and audit logging. The common pattern is to **narrow the repository** by extending `Repository<T, ID>` directly and declaring only the methods you actually need. `JpaRepository`'s deleteAll methods become public API the moment you inject the repo — restrict access at the service layer, not just the UI.",

  // ===================== Q87: @Query =====================
  "What is the difference between JPQL and native SQL in `@Query`?":
    "**JPQL** operates on your entity model — `SELECT u FROM User u WHERE u.email = :email` references the `User` class and its field names, not the table or column names. Hibernate translates it to SQL at runtime, so it's database-agnostic. **Native SQL** (`nativeQuery = true`) is raw SQL — `SELECT * FROM users WHERE email = ?1` — which ties you to your DB schema and breaks if you rename a column. Use JPQL for standard queries; use native SQL only for DB-specific features like `RETURNING`, window functions, or when JPQL can't express the query.",

  "How do you use named parameters vs positional parameters?":
    "**Named parameters** use `:paramName` in the query and `@Param(\"paramName\")` on the method argument — `@Query(\\\"SELECT u FROM User u WHERE u.email = :email\\\") User findByEmail(@Param(\\\"email\\\") String email)`. **Positional parameters** use `?1`, `?2` for method argument positions — `WHERE u.email = ?1 AND u.status = ?2`. Named parameters are far more readable and don't break if you reorder method arguments; always prefer them. Positional params are fine for single-param queries but become a maintenance trap with 3+.",

  "How do you run modifying queries (`@Modifying`) with `@Transactional`?":
    "Any `@Query` that is a `DELETE`, `UPDATE`, or `INSERT` must be annotated with **`@Modifying`** so Spring Data knows to use `executeUpdate()` instead of `getResultList()`. It also **must** be inside a `@Transactional` — without it you get a `TransactionRequiredException` at runtime. Put `@Transactional` on the repository method or (better) on the calling service method. Also add `@Modifying(clearAutomatically = true)` if you read the same entities afterward in the same transaction — otherwise Hibernate's first-level cache returns stale data that doesn't reflect the bulk update.",

  // ===================== Q88: Derived queries vs @Query =====================
  "When do derived methods become too complex or ambiguous?":
    "Once the method name hits 4–5 keywords — `findByStatusAndCreatedAtAfterAndDepartmentNameOrderByCreatedAtDesc` — it becomes unreadable and error-prone. Spring's parser tries to resolve each segment against your entity fields, and ambiguity (a field named `departmentName` vs `department.name`) causes startup failures with cryptic property resolution errors. The rule: if you can't read the method name aloud naturally, switch to `@Query`. Derived methods are great for 1-2 condition lookups; `@Query` is better for anything with JOINs, subqueries, or complex predicates.",

  "How does Spring parse method names like `findByEmailAndStatus`?":
    "Spring Data reads the method name left-to-right, strips `findBy`/`existsBy`/`countBy` as the action prefix, then tokenizes the remainder using **camelCase boundaries** matched against entity property names. `findByEmailAndStatus` → `email` (maps to `User.email`) AND `status` (maps to `User.status`). Keywords like `And`, `Or`, `Between`, `LessThan`, `IgnoreCase`, `OrderBy` modify the predicate or sort. This parsing happens **at startup** — if a property doesn't exist, the app fails to start, which is actually good: you don't get a silent wrong query at runtime.",

  "Can derived queries support pagination and sorting?":
    "Yes — add a `Pageable` or `Sort` parameter as the **last argument** and Spring Data handles it automatically. `Page<User> findByStatus(String status, Pageable pageable)` returns a page with content, totalElements, and page metadata. Combine with `@Query` too — the `Pageable` param works with `@Query` methods, though for count queries Spring Data generates a `SELECT COUNT` automatically unless you provide a `countQuery` in `@Query`. Watch out: a derived query with `DISTINCT` and pagination requires a separate `countQuery` attribute or the count is wrong.",

  // ===================== Q89: N+1 problem =====================
  "How would you detect N+1 in logs or with a tool?":
    "Enable **`spring.jpa.show-sql=true`** and **`logging.level.org.hibernate.SQL=DEBUG`** — if loading 20 orders generates 21 SQL statements in your console, that's N+1. For cleaner detection, add **`spring.jpa.properties.hibernate.generate_statistics=true`** and check `Session Metrics` in logs. In production, use **Datadog APM**, **p6spy** (a JDBC proxy that logs every query), or **Hibernate's slow query log** (`hibernate.session.events.log.LOG_QUERIES_SLOWER_THAN_MS`). Baeldung's `Hypersistence Optimizer` and JPA Buddy also flag N+1 statically. The point is: don't discover N+1 in prod — catch it in integration tests with query count assertions.",

  "How do `JOIN FETCH`, `@EntityGraph`, and batch fetching help?":
    "**`JOIN FETCH`** in JPQL pulls the association in a single query — `SELECT o FROM Order o JOIN FETCH o.items WHERE o.id = :id`. **`@EntityGraph`** does the same declaratively on a repository method without changing the query string — `@EntityGraph(attributePaths = {\"items\"})`. **Batch fetching** (`@BatchSize(size = 25)` on the collection or globally via `hibernate.default_batch_fetch_size`) groups lazy loads into batches — instead of N individual `SELECT`s you get `WHERE id IN (1,2,...,25)`. `JOIN FETCH` is the strongest (1 query), `@EntityGraph` is cleaner for reuse, and batch fetching is a cheap global fix that reduces N+1 impact without changing queries.",

  "When is DTO projection a better fix than eager fetching?":
    "When you're on a **read-only endpoint** and only need a subset of fields — say a list of user names and emails for a dropdown — fetching the full entity (with all relationships loaded) is wasteful. DTO projections (`interface UserSummary { String getName(); String getEmail(); }` or a `record`) make Hibernate `SELECT` only the columns you need, which is faster than eager-joining entire object graphs. They also bypass the first-level cache and dirty checking overhead. Use eager fetching when you need the full entity for business logic; use projections when you're serving a read/display use case.",

  // ===================== Q90: FetchType =====================
  "What is the default fetch type for `@ManyToOne` vs `@OneToMany`?":
    "`@ManyToOne` and `@OneToOne` default to **`FetchType.EAGER`** — Hibernate loads the associated entity in the same query (a JOIN). `@OneToMany` and `@ManyToMany` default to **`FetchType.LAZY`** — Hibernate loads the collection only when you access it. The defaults feel backwards: EAGER on the singular side and LAZY on the collection side. In practice you should **override `@ManyToOne` to LAZY** almost always, because EAGER is the #1 cause of accidental joins and performance issues when you just want the parent entity without its children.",

  "What is `LazyInitializationException`, and when does it occur?":
    "`LazyInitializationException` fires when you access a **lazy-loaded association outside of an open Hibernate session** — for example, in a controller or a unit test after the transaction (and therefore the session) has closed. Hibernate needs an open session to issue the `SELECT` for the lazy collection; once the session is gone, it throws. The classic trap: service returns an entity with a `LAZY` collection, the transaction commits, the controller calls `entity.getItems()`, and boom. Fix: load what you need inside the transaction (JOIN FETCH, `@EntityGraph`), use DTOs, or if you must, enable OSIV (Open Session In View) — but understand OSIV's trade-offs first.",

  "How do Open Session In View (OSIV) settings affect lazy loading?":
    "**OSIV** (`spring.jpa.open-in-view=true`, which is Spring Boot's **default**) keeps the Hibernate session open for the entire HTTP request — from filter chain to view rendering. This means lazy collections resolve transparently in controllers and views without `LazyInitializationException`. The problem: the session stays open while you're doing things like sending JSON responses, which means **Hibernate is executing queries at serialization time**, silently generating N+1 queries you never intended. Disable OSIV (`open-in-view=false`) in production-grade apps and instead be explicit: load everything you need in the service, use DTOs or projections, and you'll have full control over query count.",

  // ===================== Q91: Entity relationships =====================
  "What is owning side vs inverse side, and why does `mappedBy` matter?":
    "In a bidirectional relationship, the **owning side** holds the foreign key column — it's the side **without** `mappedBy`. The **inverse side** uses `mappedBy = \"fieldName\"` to tell Hibernate \\\"the other side owns this, don't manage an FK here.\\\" Hibernate **only looks at the owning side** to decide what SQL to write — if you set only the `mappedBy` side, no FK is persisted. Classic mistake: you add an `Order` to `User.orders` (inverse side) but forget `order.setUser(user)` (owning side), and no FK row is written to the DB. Always set **both sides** of a bidirectional relationship.",

  "How do you model a many-to-many with an intermediate entity (extra columns)?":
    "The standard `@ManyToMany` uses a hidden join table with only the two FK columns — you can't add extra columns (like `enrolledAt` or `role`). When the join table needs additional data, create an **explicit intermediate entity** (`StudentCourse`) with its own `@Id`, then use `@ManyToOne` from `StudentCourse` to `Student` and `@ManyToOne` from `StudentCourse` to `Course`, and `@OneToMany` back from each parent. You lose the convenience of `@ManyToMany` but gain full column control and can query the join table directly. This is the pattern you'll always use in real domain models.",

  "What cascade types are commonly used, and when is `CascadeType.ALL` dangerous?":
    "**`CascadeType.PERSIST`** saves children when you save the parent; **`CascadeType.MERGE`** propagates merge; **`CascadeType.REMOVE`** deletes children when the parent is deleted. These three together cover most use cases. **`CascadeType.ALL`** includes `REMOVE` — if you cascade ALL on a `@ManyToMany`, deleting one side can cascade-delete the shared join records and then trigger deletes on the other side entities you didn't intend to touch. The safe rule: avoid `ALL`, be explicit about which cascades you actually need, and **never cascade REMOVE on ManyToMany**.",

  // ===================== Q92: Caching =====================
  "Is the first-level cache enabled by default? What is its scope?":
    "Yes — the **first-level cache (session cache)** is always on and scoped to a **single Hibernate session**, which in Spring maps to a single `@Transactional` method boundary. Within one transaction, `entityManager.find(User.class, 1L)` called twice hits the DB once and returns the same object instance both times. The cache is wiped when the session closes (transaction ends). You can't share it between requests, can't configure its size, and can't disable it — it's baked into the `EntityManager` contract.",

  "How do you enable and configure second-level cache (e.g., with Redis/Ehcache)?":
    "Add a cache provider dependency (e.g., `hibernate-jcache` + Ehcache, or `hibernate-redis`), set `spring.jpa.properties.hibernate.cache.use_second_level_cache=true` and `hibernate.cache.region.factory_class` to your provider. Then annotate each entity with **`@Cache(usage = CacheConcurrencyStrategy.READ_WRITE)`** — without this annotation, the entity is not cached even if the L2 cache is enabled. The L2 cache is shared across sessions (and nodes if you use a distributed cache like Redis), so stale data is a real risk — use `READ_ONLY` for reference data and `READ_WRITE` or `NONSTRICT_READ_WRITE` for mutable entities where you understand the staleness window.",

  "What is query cache, and when is it useful?":
    "The **query cache** stores the **result set of a JPQL query** (actually just the list of entity IDs or scalar values) alongside the query string + parameters as the key. Subsequent identical query executions return cached IDs and Hibernate fetches entities from the L2 cache instead of hitting the DB. It's useful for **expensive, frequently repeated, read-mostly queries** with the same parameters — like `findAll()` on a small reference table. It's useless for queries whose parameters change every call or whose results change frequently, because every mutation invalidates the cache region. Don't enable the query cache globally without understanding which queries benefit — it can actually hurt performance through excessive cache invalidation.",

  // ===================== Q93: save / saveAndFlush / persist =====================
  "Is Spring Data's `save()` always an insert or can it update?":
    "`save()` checks whether the entity is **new** by inspecting its `@Id` field — if `id` is `null` (or `0` for primitives), it calls `persist()` (INSERT); if `id` is set, it calls `merge()` (UPDATE or INSERT depending on DB state). This means `save(entity)` on a **detached entity** with an ID calls `merge()`, which does a SELECT first to check existence, then an UPDATE — costing an extra query you might not expect. If you set the ID manually (non-generated IDs like natural keys), you'll always hit the `merge()` path even for new entities unless you implement `Persistable<T>` and override `isNew()`.",

  "When do you need `flush` before a subsequent query in the same transaction?":
    "Hibernate batches writes in its action queue and flushes them **before queries by default** (FlushMode.AUTO), so usually you don't need to call `flush()` manually. The case where you do: you've done a `@Modifying` bulk update (which bypasses the session cache), and then you immediately query entities that were affected — the cache might return stale data. Call `entityManager.flush()` (or use `@Modifying(clearAutomatically = true)`) to push pending changes to the DB before the query. Also, `saveAndFlush()` is a convenience for `save()` + `flush()` in one call — useful in tests when you want to verify the DB state immediately.",

  "How does `merge()` differ from `persist()` for detached entities?":
    "`persist()` registers a **new transient entity** with the session — it must not already have an ID, and the session takes ownership of the exact object you passed in. `merge()` takes a **detached entity** (one with an ID but no active session), copies its state onto a managed instance (fetching from DB if needed), and returns that managed instance — the original object you passed is **not managed** after merge. The common bug: `User u = repo.save(detachedUser)` and then calling methods on `detachedUser` (the argument) instead of the returned `u`. The returned value from `merge`/`save` is the managed entity you must use.",

  // ===================== Q94: Optimistic vs Pessimistic locking =====================
  "How does `@Version` implement optimistic locking?":
    "Add a `@Version Long version;` field to your entity. On every UPDATE, Hibernate appends `WHERE id = ? AND version = ?` to the SQL. If another transaction modified the row (bumping `version`), your `UPDATE` affects **0 rows**, and Hibernate throws `OptimisticLockException`. The DB itself does no blocking — both transactions proceed simultaneously, but only the first writer wins. The version field is auto-incremented by Hibernate on each successful update; you never set it manually. It's the lightest concurrency control possible and fits most web app use cases.",

  "What exception is thrown on optimistic lock failure?":
    "Hibernate throws **`OptimisticLockException`** (JPA standard), which Spring wraps into **`ObjectOptimisticLockingFailureException`** (Spring DAO layer). The right response in a web app is to catch it at the service or controller level and return **HTTP 409 Conflict** to the client with a message like \\\"data was modified by another user, please refresh and retry.\\\" Don't swallow it or let it surface as a 500 — a 500 makes clients think it's a server bug, but a 409 tells them to retry. Design a retry strategy for idempotent operations.",

  "When would you choose pessimistic locking (`LockModeType.PESSIMISTIC_WRITE`)?":
    "Use pessimistic locking when **conflicts are frequent** and a retry loop would degrade UX — for example, decrementing inventory in an e-commerce checkout where two users compete for the last item. `PESSIMISTIC_WRITE` issues a `SELECT ... FOR UPDATE`, blocking other writers at the DB level until your transaction commits. The cost is **reduced concurrency and potential deadlocks** — you must keep transactions short. If conflicts are rare (e.g., users editing their own profile), optimistic locking is always cheaper. If your app is doing financial double-entry writes, pessimistic is the safe choice.",

  // ===================== Q95: @Transactional =====================
  "What is the default rollback policy for runtime vs checked exceptions?":
    "By default, `@Transactional` **rolls back on any `RuntimeException` (unchecked)** and **commits on checked exceptions**. This means if your service throws a `SQLException` (checked), the transaction commits and your data corruption is silently saved. If it throws `NullPointerException` or `IllegalStateException` (unchecked), it rolls back. Override with `rollbackFor = {IOException.class}` or `noRollbackFor = {BusinessValidationException.class}` explicitly. Don't rely on the default for checked exceptions — explicitly declare rollback behavior for exceptions that represent genuine failures.",

  "Does `@Transactional` work on private methods or self-invocation? Why?":
    "`@Transactional` on a **private method is silently ignored** — Spring's proxy can't intercept private methods. Self-invocation — calling a `@Transactional` method from within the same class (`this.save()`) — also **bypasses the proxy**, so no transaction starts. This is because Spring uses a JDK or CGLIB proxy that wraps the bean; calls that don't go through the proxy skip all AOP advice. Solutions: move the method to a separate bean, inject the bean into itself via `ApplicationContext`, or use AspectJ weaving (load-time or compile-time). The most common fix is simply moving the logic to a different `@Service`.",

  "Where should transactional boundaries live — controller, service, or repository?":
    "Transactional boundaries belong at the **service layer** — a service method represents a single unit of work that either fully succeeds or fully rolls back. Controllers deal with HTTP concerns and shouldn't own DB transactions; repositories are too fine-grained (you'd have separate transactions per repo call, losing atomicity across them). Spring Data repositories are themselves `@Transactional` by default, but those individual transactions are useless if you want two repo calls to be atomic — only a service-level `@Transactional` wraps both. Controller-level transactions are an anti-pattern because they mix HTTP and DB lifecycle.",

  // ===================== Q96: Transaction propagation =====================
  "Explain `REQUIRED`, `REQUIRES_NEW`, and `NESTED` with scenarios.":
    "**`REQUIRED`** (default) — joins an existing transaction or starts a new one. The standard case: `OrderService.placeOrder()` calls `PaymentService.charge()`, both share one transaction. **`REQUIRES_NEW`** — always suspends the outer transaction and starts a fresh one. Use it for **audit logging**: even if the outer business operation fails and rolls back, you want the audit record committed independently. **`NESTED`** creates a savepoint within the outer transaction — a rollback of the nested call only rolls back to the savepoint, not the entire outer transaction. `NESTED` requires a DB that supports savepoints (PostgreSQL, Oracle) and isn't commonly used outside batch processing.",

  "What happens with `NOT_SUPPORTED` and `MANDATORY`?":
    "**`NOT_SUPPORTED`** suspends any active transaction and runs without one — useful for operations that don't need ACID guarantees (sending an analytics event) and shouldn't accidentally participate in a financial transaction's rollback scope. **`MANDATORY`** throws `IllegalTransactionStateException` if called without an active transaction — it enforces that the method must always be called from within a transactional context, which is a safety net for methods that are only safe inside a transaction. Both are rarely used but valuable: `NOT_SUPPORTED` for deliberate isolation, `MANDATORY` as a defensive contract.",

  "When would you use `REQUIRES_NEW` for audit logging?":
    "If your service rolls back the main transaction (payment failed, order cancelled), you still want the **audit event written to the DB** — \\\"payment attempted, failed at 14:32.\\\" With `REQUIRED`, the audit `INSERT` participates in the outer transaction and gets rolled back along with everything else, leaving a gap in your audit trail. With `REQUIRES_NEW`, the audit service starts its own transaction, commits independently, then returns — the outer rollback doesn't touch it. This is the canonical use case. Trade-off: if the DB connection drops mid-audit, the outer transaction might succeed and the audit fail — log to a separate store (Kafka, dedicated audit DB) for true reliability.",

  // ===================== Q97: Isolation levels =====================
  "Explain dirty read, non-repeatable read, and phantom read.":
    "A **dirty read** is reading **uncommitted data** from another transaction — if that transaction rolls back, you've read data that never existed. A **non-repeatable read** is reading the same row twice in one transaction and getting different values because another transaction committed a change in between. A **phantom read** is running the same range query twice and seeing different *rows* because another transaction inserted or deleted rows. Each isolation level (`READ_COMMITTED`, `REPEATABLE_READ`, `SERIALIZABLE`) prevents progressively more of these anomalies at increasing cost to concurrency.",

  "What is Spring/DB default isolation for most apps?":
    "Most databases default to **`READ_COMMITTED`** (PostgreSQL, Oracle, SQL Server), which prevents dirty reads but allows non-repeatable reads and phantom reads. MySQL InnoDB defaults to **`REPEATABLE_READ`**. Spring's `@Transactional` defaults to **`DEFAULT`** isolation, meaning it defers to whatever the underlying DB is configured for — so the effective isolation depends on your DB. `READ_COMMITTED` is the right default for most web apps: it gives good concurrency while preventing the worst anomaly (dirty reads). Only elevate isolation if you can demonstrate the business case — higher isolation means more locking and lower throughput.",

  "How do you set isolation on `@Transactional`?":
    "Pass the `isolation` attribute: `@Transactional(isolation = Isolation.READ_COMMITTED)`. Spring maps it to the JDBC `Connection.setTransactionIsolation(...)` call. The catch: not all databases support all isolation levels — setting `SERIALIZABLE` on a DB or driver that doesn't support it either silently falls back or throws. Always verify your DB supports the level you set. Also, you **can't change isolation in the middle of an existing transaction** — propagation interplay matters here. If an outer `REQUIRED` transaction is already at `READ_COMMITTED` and an inner method requests `SERIALIZABLE`, you'll get an exception because the inner method joins the existing transaction.",

  // ===================== Q98: Migrations =====================
  "Why prefer migrations over `ddl-auto=update` in production?":
    "`ddl-auto=update` lets Hibernate add columns and create tables automatically — it never **drops** columns or indexes, so drift accumulates silently, and you have no record of what changed when. In production, that means schema changes are non-deterministic across environments, you can't review them in code review, you can't test them, and a bad column rename becomes a permanent ghost column. Flyway and Liquibase run versioned SQL scripts in order, each script is checksummed to prevent tampering, and the exact script that ran on prod is the same one in your repo. `ddl-auto=validate` in prod is fine (it sanity-checks your entity against the schema); `update` is a footgun.",

  "How does Flyway version and checksum migration files?":
    "Flyway names migration files as **`V{version}__{description}.sql`** — e.g., `V3__add_user_index.sql`. It stores each successfully applied migration in a **`flyway_schema_history` table** with the version number and a CRC32 checksum of the script content. On next startup it scans migration files, compares checksums against the history table, and fails fast if a previously applied script was modified — this prevents silent schema drift from edited history. New scripts with higher version numbers are applied in order. Repeatable migrations (`R__description.sql`) are re-applied whenever their checksum changes, useful for views and stored procedures.",

  "How do you handle a failed migration in a shared environment?":
    "Flyway marks failed migrations as `FAILED` in the history table and refuses to proceed until you resolve it. If the migration is partially applied (some DDL was non-transactional — MySQL DDL is auto-commit), you must **manually fix the schema** to match what the script intended, then either delete the failed row from `flyway_schema_history` or use `flyway repair` to remove it. The fix is to then re-run the migration. Prevention: wrap migrations in transactions where your DB supports it (PostgreSQL DDL is transactional), run a migration dry-run against a DB copy before prod, and keep migrations small and backward-compatible for zero-downtime deployments.",

  // ===================== Q99: Connection pooling =====================
  "What key HikariCP settings matter (`maximumPoolSize`, timeouts)?":
    "**`maximumPoolSize`** is the most critical — it caps total DB connections (`spring.datasource.hikari.maximum-pool-size`, default 10). Set it based on your DB server's connection limit divided by your app instances. **`connectionTimeout`** (default 30s) is how long a thread waits for a pool connection before throwing — set it lower in high-throughput APIs so failures surface fast. **`idleTimeout`** controls how long idle connections wait before being evicted. **`maxLifetime`** (default 30min) recycles connections before the DB server kills them — set it slightly below your DB's `wait_timeout`. Undersizing the pool causes connection starvation; oversizing exhausts DB resources.",

  "What symptoms indicate pool exhaustion?":
    "You'll see `HikariPool-1 - Connection is not available, request timed out after 30000ms` in logs, often correlated with slow or long-running transactions holding connections. HTTP threads pile up waiting for a pool slot, causing latency to spike and eventually requests to timeout. JVM thread dumps will show dozens of threads blocked at `HikariDataSource.getConnection()`. Root causes: pool size too small for traffic, a slow query holding a transaction open for seconds, or a missing `@Transactional` scope causing a connection to be held for the entire request. **Actuator `/actuator/metrics/hikaricp.connections.active`** shows real-time connection counts.",

  "How do you monitor pool metrics with Actuator?":
    "Add `spring-boot-starter-actuator` and expose the metrics endpoint — Actuator auto-registers HikariCP metrics via Micrometer: `hikaricp.connections.active`, `hikaricp.connections.idle`, `hikaricp.connections.pending`, and `hikaricp.connections.timeout.total`. Hit `/actuator/metrics/hikaricp.connections.active` to see current usage. Wire Micrometer to Prometheus + Grafana and alert when `active/maximum > 0.8` (80% pool utilization) — that's your early warning before exhaustion. `hikaricp.connections.timeout.total` rising means threads are already waiting, which is the real alert threshold.",

  // ===================== Q100: SQL vs NoSQL =====================
  "When is MongoDB a better fit than PostgreSQL?":
    "MongoDB wins when your data is **document-shaped with highly variable schema** — think product catalogs where each product type has different attributes, or event streams where payload structure differs per event type. You get schema flexibility without running `ALTER TABLE` for every new field and horizontal sharding out of the box. PostgreSQL wins when you need **ACID transactions across multiple entities**, complex JOINs, or a mature relational model where referential integrity matters. For a user-order-payment domain with foreign keys and multi-row updates, PostgreSQL is the right tool; for a CMS or analytics ingestion with polymorphic documents, MongoDB fits better.",

  "How do transactions differ in document stores vs relational DBs?":
    "Traditional RDBMS gives you **multi-table, multi-row ACID transactions** by default. Document stores like MongoDB historically gave you **single-document atomicity** — all field updates within one document are atomic, but cross-document operations were eventually consistent. MongoDB added **multi-document transactions in v4.0**, but they come with meaningful performance overhead and aren't as battle-tested as PostgreSQL transactions. If your data model requires atomically updating two separate collections, you're fighting MongoDB's nature. Design your documents so related data lives together and you rarely need cross-document transactions.",

  "Can you use both SQL and NoSQL in one Spring Boot system?":
    "Yes — this is the **polyglot persistence** pattern. Spring Boot supports multiple datasources: add `spring-boot-starter-data-jpa` (PostgreSQL) and `spring-boot-starter-data-mongodb` in the same app. You'll have both `@Repository` types coexist, and you configure each datasource separately. A common real-world pattern: PostgreSQL for transactional core data (users, orders, payments) and MongoDB for product catalog or search documents, or Redis for caching and session storage. The complexity is managing consistency across stores — a successful order write to Postgres and a failed catalog update to Mongo requires compensation logic or eventual consistency design.",

  // ===================== Q101: Indexing =====================
  "What is the trade-off of too many indexes on write-heavy tables?":
    "Every INSERT, UPDATE, and DELETE must update **all indexes on that table** — the more indexes, the more B-tree pages written per row change. On a write-heavy table (high-frequency order inserts, payment events), too many indexes cause **write amplification**: a single row write can trigger updates to 8–10 index structures, serializing writes and hammering I/O. Indexes also consume storage and slow down VACUUM (PostgreSQL) / table optimization. The right model: index columns used in `WHERE`, `JOIN`, and `ORDER BY` clauses; drop unused indexes; use `pg_stat_user_indexes` (PostgreSQL) to identify indexes with zero scans.",

  "What is a composite index, and does column order matter?":
    "A **composite index** covers multiple columns — `CREATE INDEX idx_orders ON orders(user_id, status, created_at)`. Column order **absolutely matters**: a query filtering only on `user_id` can use this index (leftmost prefix), a query on `user_id AND status` can use it, but a query filtering **only on `status`** cannot use it (no leftmost prefix match). Think of it like a phone book sorted by last name then first name — you can look up \\\"Smith\\\" or \\\"Smith, John\\\" but not \\\"John\\\" alone. Design composite indexes based on your most common query patterns with the **highest-cardinality, most-filtered column first**.",

  "How would you identify a missing index (EXPLAIN, slow query log)?":
    "In PostgreSQL, prefix the query with `EXPLAIN ANALYZE` — look for **Seq Scan** on a large table (full table scan instead of index scan), high `rows removed by filter`, and high actual row counts versus estimated. MySQL's `EXPLAIN` shows `type = ALL` (full scan) and missing index in the `key` column. Enable the **slow query log** (PostgreSQL `log_min_duration_statement = 1000`, MySQL `slow_query_log` + `long_query_time`) to surface queries taking over 1 second. `pg_stat_statements` (PostgreSQL) ranks queries by total execution time — your worst queries without indexes will be at the top. Always run EXPLAIN on production query plans, not just local data.",

  // ===================== Q102: JOINs =====================
  "When would a LEFT JOIN return nulls for the right side?":
    "A LEFT JOIN returns **every row from the left table** and matches from the right table — when no right-table row matches the join condition, it fills right-side columns with `NULL`. So `SELECT u.name, o.total FROM users u LEFT JOIN orders o ON u.id = o.user_id` returns all users, including those with **zero orders** (their `o.total` is `NULL`). Use this when you want \\\"all X, with their Y if it exists\\\" — finding users with no orders is `WHERE o.id IS NULL`. Without the LEFT, an INNER JOIN silently drops those users.",

  "How do joins relate to JPA association fetching?":
    "When you use `FetchType.EAGER` on a `@ManyToOne` or when you write `JOIN FETCH` in JPQL, Hibernate translates that into an actual SQL `JOIN` on the DB — both mechanisms exist to load related data in one query rather than N separate `SELECT`s. `JOIN FETCH` maps to a SQL `INNER JOIN` (or `LEFT JOIN FETCH` for nullable associations). When you load lazily, Hibernate issues a separate `SELECT` per association access — that's the N+1 pattern. Understanding SQL joins helps you reason about what Hibernate actually sends to the DB and why `LEFT JOIN FETCH` vs `INNER JOIN FETCH` matters for nullable foreign keys.",

  "What is a CROSS JOIN, and when is it accidental/bad?":
    "A **CROSS JOIN** produces the Cartesian product of two tables — every row from A paired with every row from B. A table with 1,000 rows crossed with another 1,000 rows gives 1,000,000 result rows. It's almost never intentional in application code. The accidental version: forgetting the `ON` clause in a JOIN, or in JPQL listing two entities in the `FROM` clause without a relationship (`FROM User u, Order o`) — both generate a cross join. In production, an accidental cross join on two large tables can saturate the DB, spike memory, and OOM the JVM while filling network buffers.",
};
