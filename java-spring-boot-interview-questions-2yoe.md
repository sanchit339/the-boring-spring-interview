# Java Spring Boot Interview Questions — 2 Years Experience

Most likely and must-know questions for a Java Spring Boot developer with ~2 years of experience. Questions only.

---

## 1. Core Java (Must Know)

1. What is the difference between JDK, JRE, and JVM?
2. What is the difference between `==` and `.equals()` in Java?
3. What is the difference between `String`, `StringBuilder`, and `StringBuffer`?
4. Why is String immutable in Java?
5. What is the difference between method overloading and method overriding?
6. What is the difference between an abstract class and an interface?
7. Can an interface have default and static methods? When would you use them?
8. What is the difference between `checked` and `unchecked` exceptions?
9. What is the difference between `throw` and `throws`?
10. What is the difference between `final`, `finally`, and `finalize`?
11. What is the difference between `HashMap` and `Hashtable`?
12. What is the difference between `HashMap` and `ConcurrentHashMap`?
13. How does `HashMap` work internally?
14. What is the difference between `ArrayList` and `LinkedList`?
15. What is the difference between `ArrayList` and `Vector`?
16. What is the difference between `Set` and `List`?
17. What is the difference between `HashSet` and `TreeSet`?
18. What is the difference between `Comparable` and `Comparator`?
19. What is the difference between `fail-fast` and `fail-safe` iterators?
20. What is the difference between `shallow copy` and `deep copy`?
21. What is the difference between `stack` and `heap` memory?
22. What is garbage collection in Java? Name common GC algorithms.
23. What is the difference between `StackOverflowError` and `OutOfMemoryError`?
24. What is autoboxing and unboxing?
25. What is the difference between `int` and `Integer`?
26. What is the `equals()` and `hashCode()` contract?
27. What happens if you override `equals()` but not `hashCode()`?
28. What is the difference between composition and inheritance?
29. What is the difference between association, aggregation, and composition?
30. What are SOLID principles? Explain each briefly.
31. What is the difference between `static` and instance variables/methods?
32. Can you override a static method in Java?
33. What is method hiding?
34. What is a functional interface? Give examples.
35. What is a lambda expression?
36. What is a Stream API? How is it different from a Collection?
37. What is the difference between `map()` and `flatMap()`?
38. What is the difference between `findFirst()` and `findAny()`?
39. What is the difference between intermediate and terminal operations in Streams?
40. What is Optional? Why was it introduced?
41. How do you handle null safely with Optional?
42. What is the difference between `Optional.of()`, `Optional.ofNullable()`, and `Optional.empty()`?
43. What is multithreading? How do you create a thread in Java?
44. What is the difference between `Runnable` and `Callable`?
45. What is the difference between `start()` and `run()`?
46. What is the difference between `sleep()` and `wait()`?
47. What is the difference between `notify()` and `notifyAll()`?
48. What is a race condition? How do you prevent it?
49. What is the `synchronized` keyword? Where can it be used?
50. What is a deadlock? How can you avoid it?
51. What is the difference between `volatile` and `synchronized`?
52. What is the Executor framework?
53. What is the difference between `execute()` and `submit()`?
54. What is a `Future` and `CompletableFuture`?
55. What is the difference between `CountDownLatch` and `CyclicBarrier`?
56. What is a ThreadLocal variable?
57. What are the states of a thread lifecycle?
58. What is the difference between process and thread?
59. What is serialization and deserialization?
60. What is the purpose of the `transient` keyword?
61. What is the difference between `Cloneable` and copy constructor?
62. What are marker interfaces? Give examples.
63. What is reflection in Java?
64. What is the difference between `String.intern()` and normal String creation?
65. What is the Java Memory Model (JMM) at a high level?
66. What is try-with-resources?
67. What is the diamond problem? How does Java handle it with interfaces?
68. What is covariant return type?
69. What is the difference between `public`, `protected`, `default`, and `private`?
70. What is package-private access?
71. How does Java achieve platform independence?
72. What is the difference between `String pool` and heap-allocated strings?
73. What is immutability? How do you create an immutable class?
74. What are design patterns you have used in Java projects?
75. Explain Singleton pattern and its thread-safe implementations.

---

## 2. Spring Core & Dependency Injection (Must Know)

76. What is the Spring Framework?
77. What is Inversion of Control (IoC)?
78. What is Dependency Injection (DI)?
79. What is the difference between IoC and DI?
80. What are the types of Dependency Injection in Spring?
81. What is the difference between constructor injection and setter injection?
82. Which DI type is recommended and why?
83. What is a Spring Bean?
84. What is the Spring Bean lifecycle?
85. What are the different bean scopes in Spring?
86. What is the difference between singleton and prototype scope?
87. What happens if a singleton bean depends on a prototype bean?
88. What is circular dependency in Spring? How can you resolve it?
89. What is the difference between `@Component`, `@Service`, `@Repository`, and `@Controller`?
90. What is `@Autowired`? How does it work?
91. What is the difference between `@Autowired` and `@Inject`?
92. What is `@Qualifier` used for?
93. What is `@Primary` used for?
94. What is the difference between `@Bean` and `@Component`?
95. What is the difference between `@Configuration` and `@Component`?
96. What is a BeanFactory vs ApplicationContext?
97. What is `@ComponentScan`?
98. What is stereotype annotations in Spring?
99. What is `@Lazy` annotation?
100. What is `@Scope` annotation?
101. What is `@Value` annotation used for?
102. What is `@PropertySource`?
103. What is the difference between `@Required` and `@Autowired(required = true)`?
104. How does Spring resolve bean conflicts when multiple beans of the same type exist?
105. What is ApplicationContextAware?
106. What is BeanPostProcessor?
107. What is BeanFactoryPostProcessor?
108. What is the difference between `@PostConstruct` and `InitializingBean`?
109. What is the difference between `@PreDestroy` and `DisposableBean`?
110. What is AOP in Spring?
111. What are advice, pointcut, join point, and aspect in AOP?
112. What types of advice are available in Spring AOP?
113. What is the difference between Spring AOP and AspectJ?
114. What is proxy in Spring? JDK dynamic proxy vs CGLIB?
115. When does Spring use CGLIB vs JDK proxy?
116. What is `@Transactional` and how does AOP relate to it?
117. What is the difference between `@Controller` and `@RestController`?
118. What is DispatcherServlet?
119. What is the Spring MVC request lifecycle?
120. What is HandlerInterceptor?
121. What is Filter vs Interceptor in Spring?
122. What is `@RequestMapping` and its variants (`@GetMapping`, `@PostMapping`, etc.)?
123. What is the difference between `@PathVariable` and `@RequestParam`?
124. What is `@RequestBody` vs `@ResponseBody`?
125. What is `@ModelAttribute`?
126. What is `@CrossOrigin`?
127. What is content negotiation in Spring?
128. What is exception handling in Spring MVC (`@ExceptionHandler`, `@ControllerAdvice`)?
129. What is the difference between `@ControllerAdvice` and `@RestControllerAdvice`?
130. What design patterns does Spring use internally?

---

## 3. Spring Boot Fundamentals (Must Know)

131. What is Spring Boot?
132. What is the difference between Spring and Spring Boot?
133. What are the main advantages of Spring Boot?
134. What is auto-configuration in Spring Boot?
135. How does Spring Boot auto-configuration work internally?
136. What is `@SpringBootApplication` composed of?
137. What is the difference between `@EnableAutoConfiguration` and `@SpringBootApplication`?
138. How can you disable a specific auto-configuration?
139. What are Spring Boot Starters?
140. Name some commonly used Spring Boot starters.
141. What is `spring-boot-starter-web`?
142. What is `spring-boot-starter-data-jpa`?
143. What is Spring Boot Actuator?
144. What are some important Actuator endpoints?
145. How do you secure Actuator endpoints?
146. What is Spring Initializr?
147. What is an embedded server in Spring Boot?
148. Which embedded servers does Spring Boot support?
149. How do you change the default port in Spring Boot?
150. How do you change the embedded server (Tomcat to Jetty/Undertow)?
151. What is `application.properties` vs `application.yml`?
152. What is the order of externalized configuration in Spring Boot?
153. What are Spring Profiles? How do you activate them?
154. How do you define profile-specific configuration files?
155. What is `@Profile` annotation?
156. What is `spring.main.web-application-type`?
157. What is the difference between `CommandLineRunner` and `ApplicationRunner`?
158. What is Spring Boot DevTools?
159. What is hot reload / live reload in Spring Boot?
160. How does a Spring Boot application start? (main method flow)
161. What is `SpringApplication.run()` doing under the hood?
162. What is the difference between JAR and WAR packaging in Spring Boot?
163. How do you create a deployable WAR file from Spring Boot?
164. What is fat/uber JAR in Spring Boot?
165. What is `spring-boot-maven-plugin` / `spring-boot-gradle-plugin`?
166. How do you externalize configuration for different environments?
167. What is `@ConfigurationProperties`?
168. What is the difference between `@Value` and `@ConfigurationProperties`?
169. How do you validate configuration properties?
170. What is relaxed binding in Spring Boot configuration?
171. What is type-safe configuration?
172. How do you read environment variables in Spring Boot?
173. What is the purpose of `banner.txt`?
174. How do you enable/disable the Spring Boot banner?
175. What is graceful shutdown in Spring Boot?
176. How do you configure logging in Spring Boot?
177. What is the difference between Logback and Log4j2 in Spring Boot?
178. How do you change log levels dynamically?
179. What is `spring.jpa.show-sql` and when should you avoid it in production?
180. How do you handle CORS in Spring Boot?
181. What is Spring Boot CLI?
182. What is the difference between `@SpringBootTest` and `@WebMvcTest`?
183. How do you customize the default error response in Spring Boot?
184. What is `ErrorController` / `BasicErrorController`?
185. What is Problem Details (RFC 7807) support in Spring Boot?
186. How do you version a REST API in Spring Boot?
187. What is OpenAPI / Swagger integration with Spring Boot?
188. How do you schedule tasks in Spring Boot (`@Scheduled`, `@EnableScheduling`)?
189. What is `@Async` and how do you enable async processing?
190. How do you configure a custom thread pool for `@Async`?
191. What is Spring Boot Admin?
192. How do you monitor a Spring Boot application in production?
193. What is health check vs readiness vs liveness probes?
194. How do you package and run a Spring Boot app in Docker?
195. What is multi-document YAML in Spring Boot?

---

## 4. REST API Design & Web Layer (Must Know)

196. What is REST? What are REST constraints?
197. What is the difference between REST and SOAP?
198. What are HTTP methods used in REST APIs?
199. What is the difference between PUT and PATCH?
200. What is the difference between PUT and POST?
201. What is idempotency in REST APIs?
202. Which HTTP methods are idempotent?
203. What are common HTTP status codes you use and when?
204. What is the difference between 401 and 403?
205. What is the difference between 400, 404, and 422?
206. What is HATEOAS?
207. What is API versioning? What strategies exist?
208. How do you design a good REST resource URL?
209. What is pagination, sorting, and filtering in REST APIs?
210. How do you implement pagination in Spring Boot?
211. What is DTO? Why use DTOs instead of entities in controllers?
212. What is the difference between Entity and DTO?
213. How do you map Entity to DTO? (MapStruct, ModelMapper, manual)
214. What is request validation in Spring Boot?
215. What is `@Valid` vs `@Validated`?
216. What are Bean Validation annotations (`@NotNull`, `@NotBlank`, `@Size`, etc.)?
217. How do you create a custom validation annotation?
218. How do you handle validation errors globally?
219. What is content type / Accept header?
220. What is `@RequestHeader` used for?
221. How do you upload and download files in Spring Boot?
222. What is multipart form data?
223. How do you implement rate limiting for an API?
224. What is API Gateway?
225. What is the difference between monolithic and microservices APIs?
226. How do you secure a REST API?
227. What is JWT? How does JWT authentication work?
228. What is the structure of a JWT token?
229. What is OAuth2? What are common grant types?
230. What is the difference between authentication and authorization?
231. What is session-based auth vs token-based auth?
232. How do you implement logout with JWT?
233. What is CSRF? How is it handled in Spring Security for REST APIs?
234. What is CORS and why is it needed?
235. How do you test REST APIs? (Postman, curl, integration tests)
236. What is contract testing?
237. What is OpenAPI specification?
238. How do you document REST APIs in Spring Boot?
239. What is rate limiting vs throttling?
240. What is the difference between synchronous and asynchronous APIs?

---

## 5. Spring Data JPA & Hibernate (Must Know)

241. What is JPA?
242. What is Hibernate?
243. What is the difference between JPA and Hibernate?
244. What is Spring Data JPA?
245. What is an Entity in JPA?
246. What is `@Entity`, `@Table`, `@Id`, `@GeneratedValue`?
247. What are the different ID generation strategies?
248. What is the difference between `IDENTITY`, `SEQUENCE`, `TABLE`, and `UUID` generators?
249. What is the Entity lifecycle (transient, managed, detached, removed)?
250. What is EntityManager?
251. What is the difference between `EntityManager` and `Session`?
252. What is the persistence context?
253. What is the difference between `find()` and `getReference()`?
254. What is the difference between `save()`, `saveAndFlush()`, and `persist()`?
255. What is the difference between `merge()` and `save()`?
256. What is dirty checking in Hibernate?
257. What is the first-level cache?
258. What is the second-level cache?
259. What is the difference between first-level and second-level cache?
260. What is query cache?
261. What is lazy loading vs eager loading?
262. What is the N+1 select problem? How do you solve it?
263. What is `@OneToMany`, `@ManyToOne`, `@OneToOne`, `@ManyToMany`?
264. What is the owning side vs inverse side of a relationship?
265. What is `mappedBy`?
266. What is `@JoinColumn` vs `@JoinTable`?
267. What is cascade type? Which cascade types are available?
268. What is orphanRemoval?
269. What is the difference between cascade remove and orphanRemoval?
270. What is bidirectional vs unidirectional mapping?
271. What is `@Fetch` / fetch strategies (`JOIN`, `SELECT`, `SUBSELECT`)?
272. How do you avoid LazyInitializationException?
273. What is Open Session In View (OSIV)? Should you enable it?
274. What is JPQL?
275. What is the difference between JPQL and SQL?
276. What is Criteria API?
277. What is the Specification pattern in Spring Data JPA?
278. What is QueryDSL?
279. What is `@Query` annotation?
280. What is native query vs JPQL?
281. What is `@Modifying` used for?
282. What is derived query method naming in Spring Data JPA?
283. What is `JpaRepository`, `CrudRepository`, and `PagingAndSortingRepository`?
284. What is the difference between `JpaRepository` and `CrudRepository`?
285. What is pagination with `Pageable` and `Page`?
286. What is `Slice` vs `Page`?
287. What is `@Transactional` in the service layer? Why not on repository only?
288. What is transaction propagation?
289. Explain common propagation types: `REQUIRED`, `REQUIRES_NEW`, `NESTED`, `SUPPORTS`.
290. What is transaction isolation level?
291. Explain isolation levels: READ_UNCOMMITTED, READ_COMMITTED, REPEATABLE_READ, SERIALIZABLE.
292. What are dirty read, non-repeatable read, and phantom read?
293. What is `@Transactional(readOnly = true)`?
294. What happens if an exception is thrown inside a `@Transactional` method?
295. Checked vs unchecked exceptions and transaction rollback behavior?
296. What is `rollbackFor` and `noRollbackFor`?
297. Why does `@Transactional` not work on private methods / self-invocation?
298. How do you handle transactions across multiple databases?
299. What is optimistic locking vs pessimistic locking?
300. What is `@Version` annotation?
301. What is `@Lock` in Spring Data JPA?
302. How do you implement soft delete?
303. What is auditing in Spring Data JPA (`@CreatedDate`, `@LastModifiedDate`)?
304. What is `@EntityListeners` and `AuditingEntityListener`?
305. How do you write a custom repository implementation?
306. What is Projection in Spring Data JPA?
307. What is interface-based vs class-based projection?
308. What is DTO projection with JPQL constructor expression?
309. How do you batch inserts/updates in Hibernate?
310. What is `hibernate.jdbc.batch_size`?
311. What is the difference between `getOne()`, `findById()`, and `getById()`?
312. What is `@NamedQuery` and `@NamedNativeQuery`?
313. How do you map an Enum in JPA (`@Enumerated`)?
314. How do you store JSON in a database column with JPA?
315. What is embeddable (`@Embeddable`, `@Embedded`)?
316. What is `@Inheritance` strategies: SINGLE_TABLE, JOINED, TABLE_PER_CLASS?
317. What is secondary table mapping?
318. How do you handle database migrations? (Flyway / Liquibase)
319. What is Flyway? How does it work with Spring Boot?
320. What is the difference between Flyway and Liquibase?

---

## 6. Spring Security (Must Know for Backend Roles)

321. What is Spring Security?
322. What is the Spring Security filter chain?
323. What is Authentication vs Authorization?
324. What is `AuthenticationManager`?
325. What is `UserDetailsService`?
326. What is `UserDetails`?
327. What is `PasswordEncoder`? Which one should you use?
328. Why should you never store plain-text passwords?
329. What is BCrypt?
330. What is the difference between `httpBasic` and `formLogin`?
331. How do you configure security with `SecurityFilterChain` (Spring Security 6)?
332. What is the difference between `WebSecurityConfigurerAdapter` (deprecated) and component-based security config?
333. How do you permit public endpoints and secure others?
334. What is method-level security (`@PreAuthorize`, `@PostAuthorize`, `@Secured`)?
335. What is `@EnableMethodSecurity`?
336. What is role vs authority in Spring Security?
337. What is the difference between `hasRole()` and `hasAuthority()`?
338. How do you implement JWT authentication with Spring Security?
339. What is a OncePerRequestFilter?
340. How do you handle CORS with Spring Security?
341. How do you disable CSRF for stateless APIs and why?
342. What is session management policy (`STATELESS`)?
343. What is OAuth2 Resource Server in Spring Security?
344. What is OpenID Connect (OIDC)?
345. How do you implement role-based access control (RBAC)?
346. What is password grant (deprecated) vs authorization code flow?
347. How do you secure actuator endpoints?
348. What is security context and `SecurityContextHolder`?
349. How do you get the currently logged-in user?
350. What are common security vulnerabilities (OWASP) relevant to Spring apps?

---

## 7. Databases & SQL (Very Common at 2 YoE)

351. What is the difference between SQL and NoSQL databases?
352. When would you choose PostgreSQL vs MongoDB?
353. What is a primary key vs foreign key?
354. What is a unique constraint vs primary key?
355. What is indexing? How does it improve performance?
356. What are the types of indexes?
357. When can an index hurt performance?
358. What is a composite index?
359. What is the difference between clustered and non-clustered index?
360. What is normalization? Explain 1NF, 2NF, 3NF.
361. What is denormalization and when is it useful?
362. What is ACID?
363. What is CAP theorem?
364. What is the difference between INNER JOIN, LEFT JOIN, RIGHT JOIN, FULL JOIN?
365. What is a self join?
366. What is the difference between WHERE and HAVING?
367. What is the difference between UNION and UNION ALL?
368. What is a subquery vs join?
369. What is a CTE (Common Table Expression)?
370. What is a window function? Give examples (`ROW_NUMBER`, `RANK`, `DENSE_RANK`).
371. What is the difference between `RANK()` and `DENSE_RANK()`?
372. What is a stored procedure vs function?
373. What is a trigger?
374. What is a view?
375. What is a materialized view?
376. What is transaction isolation in databases?
377. What is deadlock in databases?
378. How do you optimize a slow SQL query?
379. What is EXPLAIN / EXPLAIN ANALYZE?
380. What is connection pooling? Why is it needed?
381. What is HikariCP?
382. How do you configure HikariCP in Spring Boot?
383. What is the difference between optimistic and pessimistic concurrency control?
384. How do you handle database schema evolution in production?
385. What is database sharding?
386. What is database replication?
387. What is master-slave (primary-replica) architecture?
388. What is the difference between OLTP and OLAP?
389. Write a query to find the second highest salary.
390. Write a query to find duplicate records in a table.
391. Write a query to delete duplicates while keeping one row.
392. How do you implement pagination at the SQL level?
393. What is N+1 in the context of SQL and ORMs?
394. How does Spring Boot configure DataSource auto-configuration?

---

## 8. Microservices Basics (Common at 2 YoE)

395. What is a microservice architecture?
396. What is the difference between monolith and microservices?
397. What are the advantages and disadvantages of microservices?
398. What is service discovery? (Eureka, Consul, Kubernetes DNS)
399. What is an API Gateway? (Spring Cloud Gateway)
400. What is load balancing? Client-side vs server-side?
401. What is Ribbon vs Spring Cloud LoadBalancer?
402. What is Feign / OpenFeign?
403. What is the difference between RestTemplate, WebClient, and OpenFeign?
404. Why is RestTemplate in maintenance mode?
405. What is circuit breaker pattern?
406. What is Resilience4j?
407. What is the difference between circuit breaker, retry, rate limiter, bulkhead?
408. What is distributed tracing? (Sleuth/Micrometer + Zipkin/Jaeger)
409. What is correlation ID / request ID?
410. What is centralized logging?
411. What is config server / externalized config for microservices?
412. What is Spring Cloud Config?
413. What is event-driven architecture?
414. What is message queue? (Kafka, RabbitMQ)
415. What is the difference between Kafka and RabbitMQ?
416. What is eventual consistency?
417. What is the Saga pattern?
418. What is CQRS?
419. What is the difference between synchronous and asynchronous communication between services?
420. What is idempotency in distributed systems?
421. How do you handle distributed transactions?
422. What is the two-phase commit problem?
423. What is service mesh? (Istio, Linkerd) — high level
424. How do you version microservices APIs?
425. What is blue-green deployment vs canary deployment?
426. What is containerization? Why Docker for microservices?
427. What is Kubernetes at a high level?
428. What is a readiness probe vs liveness probe?
429. How do you secure communication between microservices?
430. What is the bulkhead pattern?

---

## 9. Testing (Must Know)

431. What is unit testing vs integration testing?
432. What is the difference between `@SpringBootTest` and slice tests?
433. What is `@WebMvcTest`?
434. What is `@DataJpaTest`?
435. What is `@MockBean` vs `@Mock` (Mockito)?
436. What is `@SpyBean`?
437. What is MockMvc?
438. How do you test a REST controller?
439. How do you test a service layer?
440. How do you test a repository layer?
441. What is Testcontainers?
442. What is `@Sql` annotation for tests?
443. What is `@DirtiesContext`?
444. What is the difference between JUnit 4 and JUnit 5?
445. What are common JUnit 5 annotations (`@Test`, `@BeforeEach`, `@AfterEach`, `@DisplayName`, etc.)?
446. What is AssertJ?
447. What is the given-when-then / arrange-act-assert pattern?
448. How do you mock static methods?
449. What is `@ParameterizedTest`?
450. What is code coverage? Is 100% coverage necessary?
451. What is mutation testing? (high level)
452. How do you test exception scenarios?
453. How do you test security-protected endpoints?
454. What is `@WithMockUser`?
455. What is contract testing (Pact)?
456. What is the test pyramid?
457. How do you write integration tests for a Spring Boot app with a real database?
458. What is `@Transactional` on test methods? What does it do?
459. How do you test async methods?
460. How do you test scheduled jobs?

---

## 10. Maven / Gradle & Build Tools

461. What is Maven?
462. What is `pom.xml`?
463. What is the difference between dependency and plugin in Maven?
464. What is dependency scope (`compile`, `provided`, `runtime`, `test`)?
465. What is the Maven lifecycle? (validate, compile, test, package, install, deploy)
466. What is the difference between `mvn install` and `mvn package`?
467. What is a SNAPSHOT dependency?
468. What is dependency conflict? How does Maven resolve it?
469. What is the difference between Maven and Gradle?
470. What is a multi-module Maven project?
471. What is the Spring Boot parent POM?
472. What is BOM (Bill of Materials)?
473. How do you override a dependency version in Spring Boot?
474. What is the difference between `spring-boot-starter-parent` and `spring-boot-dependencies`?
475. How do you create an executable JAR with Maven?

---

## 11. Git, Collaboration & Practical Engineering

476. What is the difference between `git merge` and `git rebase`?
477. What is the difference between `git pull` and `git fetch`?
478. What is a merge conflict and how do you resolve it?
479. What is branching strategy you follow? (Git Flow, trunk-based)
480. What is a pull request / code review process?
481. What is CI/CD?
482. What tools have you used for CI/CD? (Jenkins, GitHub Actions, GitLab CI)
483. What is the difference between continuous integration and continuous deployment?
484. How do you debug a production issue in a Spring Boot app?
485. How do you read application logs effectively?
486. What is structured logging?
487. How do you handle secrets in an application? (env vars, vault)
488. What is the 12-factor app methodology? (high level)
489. How do you ensure code quality? (SonarQube, checkstyle, reviews)
490. Describe a challenging bug you fixed in a Spring Boot project.

---

## 12. Scenario-Based & Behavioral-Technical (Very Common at 2 YoE)

491. Explain the architecture of a Spring Boot project you worked on.
492. How do you structure packages in a Spring Boot application?
493. Walk me through the flow of a request from controller to database and back.
494. How would you design a User Registration and Login API?
495. How would you design an e-commerce order service API?
496. How do you handle concurrent updates to the same resource (e.g., inventory)?
497. A production API is slow. How do you diagnose and fix it?
498. You see LazyInitializationException in production. How do you fix it?
499. Your service throws frequent 500 errors after a deployment. What do you check first?
500. How do you implement pagination and sorting for a large dataset?
501. How do you prevent SQL injection in a Spring Boot application?
502. How do you handle large file uploads?
503. How do you implement soft delete across entities?
504. How do you design multi-tenant configuration? (high level)
505. How do you implement audit logging for entity changes?
506. How would you migrate a monolith module to a microservice?
507. How do you handle retries when calling an external service?
508. An external API is flaky. How do you make your service resilient?
509. How do you ensure exactly-once processing when consuming Kafka messages? (high level)
510. How do you version database changes without downtime?
511. How do you roll back a bad deployment?
512. How do you manage feature flags?
513. How do you write clean code in a Spring Boot project?
514. What code smells do you look for in a Spring service?
515. How do you decide between checked and unchecked exceptions in your API?
516. When do you use a custom exception vs a generic one?
517. How do you map exceptions to proper HTTP responses?
518. How do you protect sensitive data in logs?
519. How do you implement caching in Spring Boot? (`@Cacheable`, Redis)
520. What is the difference between `@Cacheable`, `@CachePut`, and `@CacheEvict`?
521. When would you use Redis vs in-memory cache (Caffeine)?
522. How do you invalidate cache correctly?
523. How do you handle timezone and date/time issues in APIs? (`Instant`, `LocalDateTime`, `ZonedDateTime`)
524. How do you design idempotent payment or order APIs?
525. Tell me about a performance optimization you did.
526. Tell me about a production incident you handled.
527. How do you prioritize technical debt vs features?
528. How do you onboard yourself to a new Spring Boot codebase?
529. How do you ensure backward compatibility of an API?
530. What would you improve in your current/last project if given time?

---

## 13. Caching, Messaging & Advanced Practical Topics

531. What is caching? Why is it used?
532. What is Spring Cache abstraction?
533. How do you enable caching in Spring Boot?
534. What is Redis? Common use cases with Spring Boot?
535. What is the difference between Redis and Memcached?
536. What is cache stampede / thundering herd?
537. What is TTL in caching?
538. What is message-driven architecture?
539. What is Spring AMQP / RabbitMQ integration?
540. What is Spring Kafka?
541. What is a topic vs queue?
542. What is consumer group in Kafka?
543. What is offset management in Kafka?
544. What is at-least-once vs at-most-once vs exactly-once delivery?
545. How do you configure a Kafka listener in Spring Boot?
546. What is dead letter queue (DLQ)?
547. What is WebSocket support in Spring Boot?
548. What is Server-Sent Events (SSE)?
549. What is reactive programming? (high level for 2 YoE)
550. What is Spring WebFlux vs Spring MVC?
551. What is Mono and Flux?
552. When would you choose WebFlux over MVC?
553. What is virtual threads (Project Loom) and how do they relate to Spring Boot 3.2+?
554. What is Observability? Metrics, logs, and traces.
555. What is Micrometer?
556. How do you expose custom metrics in Spring Boot?
557. What is Prometheus and Grafana in a Spring Boot ecosystem?
558. What is distributed lock? When do you need it?
559. How do you implement a distributed lock with Redis?
560. What is rate limiting with Bucket4j or Redis?

---

## 14. Java 8–21 & Modern Java (Often Asked)

561. What Java version have you worked with? What features do you use daily?
562. What are the main features of Java 8?
563. What is a default method in interfaces?
564. What is the Stream pipeline?
565. What is method reference?
566. What is `CompletableFuture` and how do you chain async calls?
567. What are Records in Java?
568. What are sealed classes?
569. What is pattern matching for `instanceof` / switch?
570. What is text blocks?
571. What are switch expressions?
572. What is `var` (local variable type inference)?
573. What are virtual threads?
574. What is the difference between platform threads and virtual threads?
575. What is structured concurrency? (high level)
576. What are sequenced collections?
577. What is the difference between `Optional` stream methods `stream()`, `ifPresent()`, `orElseThrow()`?
578. How do you handle date and time with `java.time` API?
579. What is the difference between `LocalDateTime` and `Instant`?
580. What is HTTP Client API in modern Java?

---

## 15. Design Patterns & Clean Architecture (Interview Favorites)

581. What is the Singleton pattern? How is it used in Spring?
582. What is the Factory pattern?
583. What is the Builder pattern? Where have you used it?
584. What is the Strategy pattern?
585. What is the Observer pattern?
586. What is the Adapter pattern?
587. What is the Decorator pattern?
588. What is the Template Method pattern?
589. What is the Proxy pattern? How does Spring use it?
590. What is Dependency Inversion Principle?
591. What is Separation of Concerns?
592. What is layered architecture (Controller–Service–Repository)?
593. What is hexagonal / ports and adapters architecture? (high level)
594. What is DRY, KISS, and YAGNI?
595. How do you avoid fat service classes?
596. What is the Repository pattern?
597. What is the DTO pattern vs Entity exposure?
598. What is the Facade pattern?
599. How do you apply SOLID in a Spring Boot project?
600. What anti-patterns have you seen in Spring Boot projects?

---

## 16. Quick-Fire / Often Used as Screening Questions

601. Can we have multiple main classes in a Spring Boot project?
602. Can we override Spring Boot auto-configuration with our own beans?
603. Is `@SpringBootApplication` mandatory?
604. Can `@Transactional` work if placed only on the controller?
605. Why is field injection not recommended?
606. Does Spring create a new bean for every request by default?
607. Can prototype beans be injected into singleton beans safely?
608. What is the default scope of a Spring bean?
609. Can we use `@Autowired` on a constructor without the annotation in recent Spring?
610. What is component scanning base package by default?
611. Can two Spring Boot apps share the same database?
612. How do you run a Spring Boot app on a random port?
613. How do you pass command-line arguments to Spring Boot?
614. What is `server.servlet.context-path`?
615. How do you return a custom HTTP status from a controller?
616. What is `ResponseEntity`?
617. What is the difference between `ResponseEntity` and `@ResponseStatus`?
618. How do you enable HTTPS in Spring Boot?
619. How do you configure multiple data sources?
620. How do you call one microservice from another?
621. What is the use of `application-local.yml`?
622. How do profiles work with `@ActiveProfiles` in tests?
623. What happens if two beans have the same name?
624. Can interfaces be Spring beans?
625. What is `@ConditionalOnProperty`?
626. What is `@ConditionalOnClass`?
627. How does Spring Boot decide which auto-config to apply?
628. What is the difference between `spring.jpa.hibernate.ddl-auto=update` and `validate`?
629. Why should you not use `ddl-auto=update` in production?
630. How do you force a transaction rollback manually?
631. What is `TransactionTemplate`?
632. How do you read a request body twice? (ContentCachingRequestWrapper — concept)
633. What is MDC in logging?
634. How do you add a request ID to every log line?
635. What is the difference between `@RestController` and `@Controller` + `@ResponseBody`?
636. Can you use FreeMarker/Thymeleaf with Spring Boot for server-side rendering?
637. What is CSRF token?
638. What is same-site cookie attribute?
639. What is the difference between opaque tokens and JWT?
640. How long should a JWT access token live? What about refresh tokens?

---

## 17. Hands-On Coding Prompts (Often Live or Take-Home)

641. Create a CRUD REST API for an Employee resource with Spring Boot and JPA.
642. Implement global exception handling with meaningful error responses.
643. Implement JWT-based authentication for a REST API.
644. Write a service method with pagination, sorting, and filtering.
645. Implement a custom `Validator` for a DTO.
646. Write a unit test for a service using Mockito.
647. Write an integration test for a controller using MockMvc.
648. Map a bidirectional `OneToMany` relationship correctly.
649. Fix an N+1 query problem in a given repository/service.
650. Implement `@Cacheable` for a frequently read API.
651. Create a scheduled job that runs every night and cleans old records.
652. Implement file upload and store metadata in DB.
653. Design database tables for an online bookstore (users, books, orders, order_items).
654. Write SQL for top N customers by revenue.
655. Implement optimistic locking on an account balance update.
656. Build a simple rate-limited endpoint.
657. Consume a third-party REST API using WebClient/OpenFeign with timeout and retry.
658. Implement soft delete with a Spring Data JPA repository method override.
659. Create profile-specific configs for dev, test, and prod.
660. Dockerize a Spring Boot application and connect it to PostgreSQL.

---

## 18. System Design Lite (2 YoE Level)

661. Design a URL shortener backend (high-level APIs + data model).
662. Design a notification service (email/SMS) with retries.
663. Design a simple rate limiter.
664. Design an order placement flow for an e-commerce app.
665. How would you design a blog platform backend?
666. How would you design a parking lot system’s backend APIs?
667. How would you design a task management (Jira-like) board API?
668. How do you design search with filters for products?
669. How would you handle spike traffic on a read-heavy API?
670. How do you design an audit trail for sensitive operations?

---

## How to Use This List

- **Must-know core:** Sections 1–6, 9, and key parts of 7 and 12  
- **Strong differentiator:** Microservices, caching, messaging, scenarios  
- **Practice aloud:** Explain with examples from your real projects  
- **Pair with code:** Especially sections 5, 6, 9, and 17  

---

*Curated for Java Spring Boot developers with approximately 2 years of experience. Focus areas: Core Java, Spring Core, Spring Boot, REST, JPA/Hibernate, Security, SQL, testing, and practical scenarios.*
