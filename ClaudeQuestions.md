# Java Spring Boot Interview Questions — 2 Years Experience

## Core Java

1. What is the difference between `==` and `.equals()` in Java?
2. Explain the difference between `String`, `StringBuilder`, and `StringBuffer`.
3. What are the differences between abstract classes and interfaces?
4. What is the difference between `ArrayList` and `LinkedList`?
5. How does `HashMap` work internally? What happens on collision?
6. What is the difference between `HashMap`, `LinkedHashMap`, and `TreeMap`?
7. What is the difference between `HashSet`, `LinkedHashSet`, and `TreeSet`?
8. Explain the concept of immutability. How do you create an immutable class in Java?
9. What is the difference between checked and unchecked exceptions?
10. What is the try-with-resources statement and why is it useful?
11. Explain the concept of autoboxing and unboxing.
12. What is the difference between `final`, `finally`, and `finalize()`?
13. What are functional interfaces? Give examples of built-in ones.
14. What are Lambda expressions and how do they improve code readability?
15. Explain the Stream API — what is the difference between intermediate and terminal operations?
16. What is the difference between `map()` and `flatMap()` in streams?
17. What is the difference between `Comparable` and `Comparator`?
18. What is the diamond problem in Java, and how does Java handle it with interfaces?
19. Explain method overloading vs method overriding.
20. What is the significance of the `static` keyword?
21. What are Java generics and why are they used?
22. What is the volatile keyword used for?
23. Explain the basics of multithreading — `Thread` vs `Runnable`.
24. What is the difference between `synchronized` method and `synchronized` block?
25. What are `ExecutorService` and thread pools?
26. What is a deadlock, and how can it be avoided?
27. What is garbage collection in Java, and how does it work at a high level?
28. What are the different types of references in Java (strong, weak, soft, phantom)?

## Object-Oriented Programming

29. Explain the four pillars of OOP with examples.
30. What is polymorphism — compile-time vs runtime?
31. What is the difference between composition and inheritance? Which is preferred and why?
32. What is coupling and cohesion?
33. Explain SOLID principles with examples.
34. What are some common design patterns you've used (Singleton, Factory, Builder, Strategy, Observer)? - Extra -> Facade , Adapter
35. Why is the Singleton pattern tricky in a multi-threaded environment?

## Spring Core

36. What is the Spring Framework, and what problem does it solve?
37. What is Inversion of Control (IoC) and Dependency Injection (DI)?
38. What are the different types of dependency injection in Spring?
39. What is the Spring IoC container / ApplicationContext?
40. What is the difference between `BeanFactory` and `ApplicationContext`?
41. What are Spring Bean scopes (singleton, prototype, request, session)?
42. What is the Spring Bean lifecycle?
43. What are `@Component`, `@Service`, `@Repository`, and `@Controller` — how do they differ?
44. What is `@Autowired`, and how does Spring resolve dependencies?
45. What happens when there are multiple beans of the same type — how do you resolve ambiguity (`@Qualifier`, `@Primary`)?
46. What is the difference between constructor injection and field injection? Which is recommended and why?
47. What is `@Configuration` and `@Bean` used for?
48. What is component scanning, and how does `@ComponentScan` work?
49. What are Spring profiles, and how do you use `@Profile`?
50. What is AOP (Aspect-Oriented Programming) in Spring? What are common use cases?
51. Explain `@Before`, `@After`, `@Around`, and other AOP advice types.
52. What is circular dependency in Spring, and how can it be resolved?

## Spring Boot

53. What is Spring Boot, and how is it different from the Spring Framework?
54. What are Spring Boot Starters?
55. What is Auto-Configuration in Spring Boot, and how does it work internally?
56. What is `@SpringBootApplication` — what annotations does it combine?
57. How do you externalize configuration in Spring Boot (`application.properties` / `application.yml`)?
58. What is the purpose of `@ConfigurationProperties`?
59. How do you manage different configurations for different environments (dev, test, prod)?
60. What is Spring Boot DevTools?
61. What is Spring Boot Actuator, and what are some commonly used endpoints?
62. How do you create a custom Actuator health indicator?
63. What embedded servers does Spring Boot support?
64. How do you change the default embedded server or port in Spring Boot?
65. How does Spring Boot handle logging, and how do you configure log levels?
66. What is the difference between `CommandLineRunner` and `ApplicationRunner`?
67. How do you package a Spring Boot application (JAR vs WAR)?
68. What is the difference between `@RestController` and `@Controller`?

## Spring MVC / REST APIs

69. Explain the request flow in Spring MVC (DispatcherServlet, HandlerMapping, etc.).
70. What is `@RequestMapping`, and how do `@GetMapping`, `@PostMapping`, etc. differ from it?
71. What is the difference between `@PathVariable` and `@RequestParam`?
72. What is `@RequestBody` and `@ResponseBody` used for?
73. How do you handle validation of request payloads in Spring Boot (`@Valid`, `@Validated`)?
74. How do you implement global exception handling (`@ControllerAdvice`, `@ExceptionHandler`)?
75. What HTTP status codes are commonly used, and how do you return custom status codes from a controller?
76. What is `ResponseEntity`, and when would you use it?
77. How do you version REST APIs?
78. What is HATEOAS?
79. How do you handle CORS in a Spring Boot application?
80. What is content negotiation in Spring MVC?
81. How do you document REST APIs (Swagger/OpenAPI)?
82. What is the difference between PUT, PATCH, and POST?
83. How do you implement pagination and sorting in a REST API?

## Spring Data JPA / Hibernate / Database

84. What is Spring Data JPA, and how does it simplify database access?
85. What is the difference between JPA, Hibernate, and Spring Data JPA?
86. What is the difference between `JpaRepository`, `CrudRepository`, and `PagingAndSortingRepository`?
87. How do you write custom queries using `@Query`?
88. What is the difference between derived query methods and `@Query` annotated methods?
89. What is the N+1 select problem, and how do you solve it?
90. What is the difference between `FetchType.LAZY` and `FetchType.EAGER`?
91. Explain the different types of entity relationships (`@OneToOne`, `@OneToMany`, `@ManyToOne`, `@ManyToMany`).
92. What is the Hibernate first-level and second-level cache?
93. What is the difference between `save()`, `saveAndFlush()`, and `persist()`?
94. What is optimistic locking vs pessimistic locking?
95. How do you manage database transactions in Spring (`@Transactional`)?
96. What is transaction propagation, and what are the different propagation types?
97. What are transaction isolation levels?
98. How do you handle database migrations (Flyway/Liquibase)?
99. What is connection pooling, and which connection pool does Spring Boot use by default (HikariCP)?
100. What is the difference between SQL and NoSQL databases, and when would you choose one over the other?
101. Explain indexing in databases and how it affects query performance.
102. What is the difference between `INNER JOIN`, `LEFT JOIN`, and `RIGHT JOIN`?

## Security

103. What is Spring Security, and what problem does it solve?
104. What is the difference between authentication and authorization?
105. How does JWT-based authentication work in a Spring Boot application?
106. What is the difference between session-based and token-based authentication?
107. How do you secure REST APIs using Spring Security?
108. What is `SecurityFilterChain`, and how do you configure it?
109. What is CSRF, and how does Spring Security handle it?
110. What is role-based access control, and how do you implement it (`@PreAuthorize`, `@Secured`)?
111. How do you store passwords securely (`PasswordEncoder`, BCrypt)?
112. What is OAuth2, and how does Spring Boot integrate with it?

## Microservices

113. What are microservices, and how do they differ from a monolithic architecture?
114. What is service discovery, and how does Eureka work?
115. What is an API Gateway, and why is it needed?
116. What is Spring Cloud, and what problems does it solve?
117. How do microservices communicate with each other (REST, messaging, gRPC)?
118. What is Feign Client, and how is it used? 
119. What is circuit breaker pattern, and how is it implemented (Resilience4j/Hystrix)?
120. How do you handle distributed configuration in microservices (Spring Cloud Config)?
121. What is the Saga pattern, and why is it used in distributed transactions?
122. How do you handle centralized logging and tracing across microservices (ELK, Sleuth, Zipkin)?
123. What is message-driven architecture, and how do Kafka/RabbitMQ fit into Spring Boot apps?
124. What is idempotency, and why does it matter in distributed systems?

## Testing

125. What is the difference between unit testing and integration testing?
126. How do you write unit tests in Spring Boot using JUnit and Mockito?
127. What is `@SpringBootTest`, and how does it differ from `@WebMvcTest` and `@DataJpaTest`?
128. What is Mockito, and how do `@Mock`, `@InjectMocks`, and `@Spy` differ?
129. How do you mock a REST API call in a test?
130. What is `MockMvc`, and how is it used to test controllers?
131. What is Test Containers, and why would you use it?
132. How do you handle test data setup and teardown in Spring Boot tests?

## Build Tools, Git, and General

133. What is the difference between Maven and Gradle?
134. What is the Maven lifecycle, and what are common phases (compile, test, package, install)?
135. What is dependency management in Maven, and how do you resolve version conflicts?
136. What is the difference between `git merge` and `git rebase`?
137. What is a merge conflict, and how do you resolve it?
138. What is the difference between `git fetch` and `git pull`?
139. What is CI/CD, and have you worked with any pipelines (Jenkins, GitHub Actions)?
140. What is Docker, and how do you containerize a Spring Boot application?
141. What is the purpose of a Dockerfile vs docker-compose?
142. What is Kubernetes, and what is its role in deploying microservices?

## System Design / Scenario-Based

143. How would you design a URL shortener service?
144. How would you design a rate limiter for an API?
145. How would you handle a scenario where an API needs to process a large file upload without blocking the main thread?
146. How would you design a notification service that sends emails/SMS asynchronously?
147. How do you handle caching in a Spring Boot application (`@Cacheable`, Redis)?
148. How would you scale a Spring Boot application to handle increased traffic?
149. How would you debug a production issue where an API is responding slowly?
150. How do you ensure data consistency when multiple services update related data?
151. What is asynchronous processing in Spring Boot (`@Async`), and when would you use it?
152. How do you schedule recurring tasks in Spring Boot (`@Scheduled`)?

## Behavioral / Project-Based

153. Walk me through a project you built end-to-end using Spring Boot.
154. Describe a challenging bug you fixed in production — how did you diagnose it?
155. How do you approach code reviews, and what do you look for?
156. Tell me about a time you had to optimize a slow-performing API or query.
157. How do you keep yourself updated with new Spring/Java features?
158. Describe a situation where you disagreed with a technical decision — how did you handle it?