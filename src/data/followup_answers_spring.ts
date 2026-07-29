/**
 * Answer bank for follow-up questions — Spring MVC / REST APIs category.
 * Keyed by the exact follow-up `text` so answers merge into the FollowUp
 * objects at runtime without touching questions.ts.
 *
 * Style (per answer_rules.md):
 *  - 2-5 sentences, prose, no bullets/headers
 *  - Bold the terms that actually matter
 *  - No GPT fluff, no "In conclusion", active voice, contractions
 *  - BAD/GOOD code only where it proves understanding
 */
export const followupAnswersSpring: Record<string, string> = {
  // ===================== Q69: Spring MVC request flow =====================
  "What is the Front Controller pattern, and how does DispatcherServlet implement it?":
    "The **Front Controller** pattern routes every request through a single handler so cross-cutting concerns — routing, security, view resolution — live in one place instead of scattered across servlets. `DispatcherServlet` is that single handler in Spring MVC: it receives every request, delegates to `HandlerMapping` to find the controller method, uses a `HandlerAdapter` to invoke it, then resolves the response. The win is **centralized control** — you don't hand-wire a servlet per page; the framework handles dispatch, interceptors, and exception resolution consistently. If you've ever wondered why you never write a `web.xml` servlet per endpoint, this is why.",

  "What roles do HandlerAdapter, ViewResolver, and interceptors play?":
    "`HandlerAdapter` **executes** the controller method Spring found — it bridges between DispatcherServlet and however your handler is actually shaped (annotated, `RequestMappingHandlerAdapter`, etc.), because DispatcherServlet doesn't know how to call arbitrary handlers directly. `ViewResolver` **maps a logical view name** like `\"users/list\"` to a real template (Thymeleaf, JSP) — mostly irrelevant for `@RestController` since there's no view to resolve. `HandlerInterceptor` runs **before, after, and after-completion** around your handler — that's where auth checks, logging, and timing live without polluting controllers. Interceptors run *inside* DispatcherServlet, after the filter chain.",

  "Where does filter chain sit relative to DispatcherServlet?":
    "Filters run **before** DispatcherServlet — they sit in the servlet container's filter chain, so they see the raw `HttpServletRequest` before Spring's front controller is even invoked. That's why Spring Security is implemented as a filter (`DelegatingFilterProxy` → `FilterChainProxy`) — auth has to happen before any controller runs. Interceptors, by contrast, run **inside** DispatcherServlet, after handler mapping. Rule of thumb: if it must happen regardless of whether Spring can route the request (CORS, security, compression), use a filter; if it's tied to a specific handler, use an interceptor.",

  // ===================== Q70: @RequestMapping / composed mappings =====================
  "Can you put `@RequestMapping` on a class for a base path?":
    "Yes — putting `@RequestMapping(\"/api/users\")` on the **class** sets a base path, and then method-level `@GetMapping(\"/{id}\")` is relative to it, resolving to `/api/users/{id}`. You can also narrow by `method`, `params`, `headers`, `consumes`, and `produces` at the class level, and the method-level values **combine** with them. Modern code mostly skips raw `@RequestMapping` on methods and uses `@GetMapping`/`@PostMapping` directly, but the class-level base path is still the idiomatic way to avoid repeating `/api/users` on every method.",

  "How do you map multiple paths or HTTP methods on one method?":
    "`@GetMapping({\"/users\", \"/customers\"})` maps the same method to **multiple paths** — handy for aliases or backward-compatible routes. For multiple HTTP methods on one method you'd use `@RequestMapping(method = {GET, HEAD})`, but in practice you rarely want one method handling both GET and POST since they usually return different things. Don't abuse this — if a method is branching on `request.getMethod()`, you've probably got two endpoints pretending to be one.",

  "How do `consumes` and `produces` attributes work?":
    "`consumes` restricts the endpoint to requests whose **`Content-Type`** matches — `@PostMapping(consumes = \"application/json\")` rejects a form-encoded body with **415 Unsupported Media Type**. `produces` restricts what the response can be based on the client's **`Accept`** header — `produces = \"application/json\"` answers a `Accept: application/xml` request with **406 Not Acceptable** if you don't produce XML. They're how Spring does **content negotiation at the mapping level**, narrowing a handler before it ever runs. Skip them and Spring accepts any content type, which can let a caller send a payload your converter can't actually deserialize.",

  // ===================== Q71: @PathVariable vs @RequestParam =====================
  "When is a request param required vs optional, and how do you set defaults?":
    "Both `@RequestParam` and `@PathVariable` are **required by default** — a missing `@RequestParam(\"sort\")` triggers a 400. Make it optional with `@RequestParam(required = false)` or give it a default: `@RequestParam(defaultValue = \"createdAt\") String sortBy`. `@PathVariable` is trickier — if it's optional the route itself usually needs two mappings, since a missing path segment won't match the URL pattern. Don't mark everything optional and then NPE inside the method — set a `defaultValue` so the behavior is predictable.",

  "How do you bind multiple query params into an object?":
    "Declare a POJO and Spring binds matching query params to its fields automatically — `record FilterParams(String status, Integer page, Integer size) {}` and `getList(FilterParams filter)` pulls `?status=ACTIVE&page=0` into the object with no annotation needed. This is **command-object binding**, the same mechanism that backs form submissions. For nested or complex binding you add `@ModelAttribute`, and for validation you annotate fields and add `@Valid`. It keeps the controller signature clean when you've got 5+ query params instead of a 5-argument method.",

  "What happens with encoded path segments (e.g., spaces, slashes)?":
    "`@PathVariable` is **automatically URL-decoded** by Spring, so `/users/John%20Doe` arrives as `\"John Doe\"`. The trap is **encoded slashes** (`%2F`) — many containers (Tomcat) reject them by default for security, and a real `/` in a path variable breaks the URL pattern match entirely. For free-text values, prefer `@RequestParam` over `@PathVariable` so slashes and special characters don't corrupt the route. If you must put messy values in the path, configure the container to allow encoded slashes and document it, because it'll bite you in production otherwise.",

  // ===================== Q72: @RequestBody / @ResponseBody =====================
  "Which HttpMessageConverter handles JSON by default (Jackson)?":
    "**`MappingJackson2HttpMessageConverter`** — Spring Boot auto-configures it because Jackson is on the classpath, and it converts between Java objects and JSON for both `@RequestBody` (deserialize) and `@ResponseBody` (serialize). You customize it by registering an `ObjectMapper` bean — that's how you set `SnakeCase` naming, `JavaTimeModule` for `LocalDateTime`, or `FAIL_ON_UNKNOWN_PROPERTIES = false`. If Jackson isn't on the classpath and you return an object, Spring has no converter and you get a **415/500** depending on the direction. For XML you'd add Jackson XML or JAXB and the converter picks based on `Content-Type`.",

  "How does `@RestController` relate to `@ResponseBody`?":
    "`@RestController` is a **meta-annotation** that bundles `@Controller` + `@ResponseBody`, so every handler method writes its return value straight to the response body via a message converter — you never write `@ResponseBody` per method. The classic trap: use plain `@Controller` for a JSON endpoint, forget `@ResponseBody`, and Spring treats your returned String as a **view name** and 404s looking for a template. `@RestController` exists precisely so you can't make that mistake for API endpoints.",

  "What happens if deserialization fails for the request body?":
    "If the JSON is malformed or doesn't match the target type, Jackson throws **`HttpMessageNotReadableException`**, which Spring translates into a **400 Bad Request** by default — the controller method never runs. The common gotcha: the **exception message leaks details** (unknown property, type mismatch), so in production you catch it in `@ControllerAdvice` and return a generic error. Also watch `@Valid` — a *syntactically valid* JSON that violates a bean constraint throws `MethodArgumentNotValidException`, a different 400 path. Both need handling if your API should return clean errors.",

  // ===================== Q73: @Valid / @Validated =====================
  "What is the difference between `@Valid` and `@Validated` (groups)?":
    "`@Valid` is the **Bean Validation** annotation (JSR-380) that triggers validation of a `@RequestBody` DTO, cascading into nested objects — it validates **everything**. `@Validated` is Spring's extension: it adds **validation groups** so the same DTO can be validated differently per context (`@Validated(OnCreate.class)` vs `@Validated(OnUpdate.class)`), and it also works on **method-level** parameters (not just DTOs). Use `@Valid` for the common case; reach for `@Validated` only when you genuinely need partial validation, like \"id must be null on create but required on update.\"",

  "Where do you put constraint annotations — DTO fields or custom validators?":
    "Built-in constraints (`@NotBlank`, `@Email`, `@Size`) go straight on **DTO fields**. When a rule can't be expressed declaratively — \"endDate must be after startDate\", \"email must be unique in the DB\" — you write a **custom `ConstraintValidator`** annotated with `@Target`/`@Constraint(validatedBy = ...)`. Never validate business rules that need the database inside a bean-validation annotation casually — it makes your validator call the repo and creates hidden DB hits at binding time. Keep field-level checks in annotations; do cross-field and DB-dependent checks in the service layer.",

  "How do you return a structured 400 response for validation errors?":
    "Catch **`MethodArgumentNotValidException`** in an `@RestControllerAdvice` and build a consistent error body — field name, rejected value, message — returning `ResponseEntity.status(400).body(errorResponse)`. Without this, Spring's default 400 dumps a generic \"Bad Request\" with no field details, so the client can't tell *what* was wrong. The structured shape also makes it uniform across all endpoints instead of each controller inventing its own error format. Don't expose the raw `BindingResult` internals — map it to your own `ErrorResponse` DTO.",

  // ===================== Q74: @ControllerAdvice / @ExceptionHandler =====================
  "What is the difference between `@ControllerAdvice` and `@RestControllerAdvice`?":
    "`@ControllerAdvice` applies to all `@Controller` beans; to return JSON from its `@ExceptionHandler` methods you add `@ResponseBody` (or return `ResponseEntity`). `@RestControllerAdvice` is `@ControllerAdvice` + `@ResponseBody` baked in, so every handler's return value is serialized to the body — **that's the one you want for REST APIs**. Functionally identical to writing `@ResponseBody` on every method, just less ceremony. Pick `@RestControllerAdvice` for JSON error bodies; use plain `@ControllerAdvice` if some handlers render error views.",

  "How do you map domain exceptions to HTTP status codes?":
    "Annotate the exception class with **`@ResponseStatus(HttpStatus.NOT_FOUND)`** and any uncaught throw of it returns that status — quick but inflexible. The flexible way: catch it in `@RestControllerAdvice` with `@ExceptionHandler(UserNotFoundException.class)` and return `ResponseEntity.status(404).body(...)`, which lets you attach a body and vary the status per context. Don't leak a raw **500** for business errors — a missing user isn't a server fault, it's a 404, and a duplicate email is a 409. Mapping domain exceptions to correct statuses is what makes an API actually usable.",

  "Should you expose stack traces to clients in production? Why not?":
    "**Never in production** — a stack trace leaks implementation details: framework versions, internal package structure, sometimes SQL fragments and file paths, which is a **security attack surface**. In dev you turn it on for debugging (`server.error.include-stacktrace=ALWAYS`); in prod set it to `NEVER` and return a correlation ID plus a generic message. Log the full stack server-side with the ID so you can trace it. Exposing internals is how attackers fingerprint your stack and target known CVEs.",

  // ===================== Q75: HTTP status codes =====================
  "When would you return 201 Created vs 200 OK?":
    "Return **201 Created** when a POST (or sometimes PUT) actually creates a resource — and include a **`Location` header** pointing at the new resource's URI, which is the part most people forget. Use **200 OK** for a successful GET, PUT replace, DELETE, or a POST that doesn't create anything (like an action endpoint `/process`). If you're returning 200 for a create because \"it works,\" you're breaking REST semantics and denying clients the standard signal that something new exists. A pure 201 with no Location is half-correct.",

  "What is the difference between 401 and 403?":
    "**401 Unauthorized** actually means *unauthenticated* — the server doesn't know who you are, so you need to log in (no/invalid credentials, missing token). **403 Forbidden** means *authenticated but not allowed* — the server knows who you are and you still can't touch this resource (wrong role, not the owner). The names are backwards and confusing: 401 is really \"who are you?\" and 403 is \"I know who you are, and no.\" Getting this right matters because clients react differently — 401 triggers a re-login flow, 403 shows an access-denied screen.",

  "How do you return a status with `ResponseEntity` vs `@ResponseStatus`?":
    "`@ResponseStatus(HttpStatus.CREATED)` on a method or exception class sets a **static** status and you can't attach headers or vary it at runtime. `ResponseEntity.created(location).body(user)` lets you **compute** the status, add headers like `Location`, and still return a body — that's why it's the default for anything non-trivial. Use `@ResponseStatus` for simple fixed cases and exception-to-status mapping; use `ResponseEntity` whenever the status, headers, or body depend on what happened during the request.",

  // ===================== Q76: ResponseEntity =====================
  "How do you set custom headers with ResponseEntity?":
    "Use the builder: `ResponseEntity.ok().header(\"X-Total-Count\", \"42\").body(users)`, or `ResponseEntity.created(URI).header(HttpHeaders.LOCATION, uri).build()`. For multiple headers chain `.header(...)` calls or use `HttpHeaders` object directly. Setting headers via `HttpServletResponse` works but bypasses Spring's processing and breaks testability with `MockMvc` — prefer `ResponseEntity` so the contract is explicit and assertable. Headers matter for pagination metadata, rate-limit info (`X-RateLimit-Remaining`), and the `Location` header on creates.",

  "When is returning a DTO directly (with `@RestController`) enough?":
    "When the response is always **200 OK** with no custom headers and a straightforward body — `return userService.findById(id)` is clean and readable. Reach for `ResponseEntity` the moment you need a non-200 status, headers (`Location`, `ETag`, pagination), or conditional behavior (204 No Content when the body is empty). Don't wrap every return in `ResponseEntity` just for consistency if the simple case doesn't need it — it's ceremony with no payoff. The line is: custom status/headers → ResponseEntity; plain success body → return the DTO.",

  "How do you build a ResponseEntity with the builder API?":
    "Static factory + fluent chain: `ResponseEntity.status(409).header(\"X-Reason\", \"duplicate\").body(error)`, or the shortcuts `ResponseEntity.ok(body)`, `ResponseEntity.noContent().build()`, `ResponseEntity.created(location).build()`. `.build()` skips the body for responses like 204. The builder pattern is preferable to `new ResponseEntity<>(body, headers, status)` because it reads top-down and lets you omit any leg you don't need. Pick the static helper that matches your intent (`.ok`, `.created`, `.noContent`) for the common cases.",

  // ===================== Q77: API versioning =====================
  "Compare URI versioning (`/v1/users`) vs header versioning.":
    "**URI versioning** (`/v1/users`) is the most explicit and readable — clients see the version in the URL, it caches cleanly, and it's trivial to route, but it litters the URL space. **Header versioning** (`Accept: application/vnd.myapp.v2+json` or a custom `X-API-Version`) keeps URLs clean but is invisible in the browser, harder to test with curl, and harder to document. Most teams pick URI versioning because discoverability and caching outweigh aesthetic concerns. Header versioning fits internal APIs where you control all clients.",

  "How do you deprecate an old API version safely?":
    "Keep `/v1` running, add a **`Sunset`** and **`Deprecation`** header to its responses to signal end-of-life, document a migration path with a concrete shutdown date, and monitor usage so you only retire it once traffic is near zero. Never hard-cut a version — external clients you don't control will break. Add the deprecation early, communicate it loudly, and give a runway measured in months, not days. A clean v1→v2 often involves keeping both talking to the same service layer so behavior stays consistent.",

  "What are trade-offs of query-param versioning?":
    "Query-param versioning (`/users?version=2`) keeps URLs resource-centric and is easy to default (`version` falls back to 1), but it's **invisible in the URL path**, easy to forget, and breaks HTTP caching because the path looks identical across versions. It also collides with actual query parameters and confuses routing layers. It works for quick internal needs but rarely scales for public APIs. URI versioning wins for clarity, header versioning for cleanliness — query versioning is the awkward middle.",

  // ===================== Q78: HATEOAS =====================
  "What does \"hypermedia as the engine of application state\" mean in practice?":
    "It means the response doesn't just give you data — it gives you **links** telling the client what it can do next: a `GET /orders/42` response includes `_links` like `cancel`, `payment`, `self`, so the client navigates by following links rather than hard-coding URLs. The \"engine\" part is that the server drives state transitions by advertising available actions; the client doesn't need to know the URL scheme. In practice few APIs fully embrace it because it adds payload overhead and complexity, and most clients just hard-code the URLs anyway.",

  "Have you used Spring HATEOAS? When is it worth the complexity?":
    "Spring HATEOAS gives you `EntityModel`, `CollectionModel`, and `WebMvcLinkBuilder` to attach `_links` to responses with type-safe link building like `linkTo(methodOn(OrderController.class).cancel(id)).withRel(\"cancel\")`. It's worth it when you have a genuinely stateful, navigable API or external clients who benefit from discoverability. For internal microservices where the same team owns client and server, the boilerplate usually isn't justified — hand-coded links or none at all are simpler. It shines in public APIs that want to evolve URL schemes without breaking hardcoded clients.",

  "How do links in responses help API discoverability?":
    "Links let a client **explore** the API from a single entry point without out-of-band URL knowledge — start at `/`, follow `users`, then `create`, then `orders`, the way a browser navigates a website. It decouples the client from specific URLs, so the server can rename or restructure routes and clients that follow links keep working. Discoverability also makes onboarding easier: hit one URL, read the links, and you know what's possible. The cost is a heavier response payload and clients that actually have to honor the links instead of hard-coding them.",

  // ===================== Q79: CORS =====================
  "What is a preflight request, and which HTTP method is used?":
    "A **preflight** is an automatic **OPTIONS** request the browser sends before a \"non-simple\" cross-origin request — anything with custom headers, non-simple methods like PUT/DELETE, or a non-basic Content-Type. The server responds with `Access-Control-Allow-*` headers saying what's allowed, and only then does the browser send the real request. \"Simple\" requests (basic GET/POST with standard headers) skip the preflight. For REST APIs with JSON bodies and auth headers, you'll always see the OPTIONS preflight, so your CORS config must handle OPTIONS, not just the real verb.",

  "How do `@CrossOrigin`, global CORS config, and Security CORS differ?":
    "`@CrossOrigin(origins = \"https://app.com\")` enables CORS **per controller/method** — fine for a single endpoint. Global config via `WebMvcConfigurer.addCorsMappings(...)` sets it **app-wide** without touching controllers. The trap: if **Spring Security** is on the classpath, it owns the filter chain and **overrides** the MVC CORS config — you must configure CORS inside `SecurityFilterChain` with `http.cors(Customizer.withDefaults())` wired to a `CorsConfigurationSource` bean. Forgetting that is why CORS \"works in dev, breaks in prod\" the moment you add security.",

  "What headers matter for CORS (`Origin`, `Access-Control-Allow-*`)?":
    "The browser sends **`Origin`** on cross-origin requests; the server replies with **`Access-Control-Allow-Origin`** (the allowed origin or `*`), **`Access-Control-Allow-Methods`**, **`Access-Control-Allow-Headers`** (which request headers are permitted), and for credentialed requests **`Access-Control-Allow-Credentials: true`** plus a specific origin (never `*`). Preflight responses also include `Access-Control-Max-Age` to cache the preflight. Mismatch any of these — say, you allow `*` but the client sends credentials — and the browser blocks the response even though the server returned 200.",

  // ===================== Q80: Content negotiation =====================
  "How does the `Accept` header influence response format?":
    "The client sends **`Accept: application/json`** (or XML, or a priority list with q-values), and Spring picks the `HttpMessageConverter` that can produce that media type to serialize the response. If no configured converter matches the requested type, Spring returns **406 Not Acceptable**. This is the core of content negotiation: same handler, different response format based on what the client asks for. Most REST APIs just default to JSON and ignore this, but it's why `produces` and the `Accept` header exist.",

  "How can path extensions or query params participate in negotiation?":
    "Historically Spring let `/users.json` or `/users?format=xml` drive content negotiation via `favorPathExtension` / `favorParameter`, but **path-extension negotiation is deprecated** for security (it opens up RFD — reflected file download — attacks) and is off by default in modern Spring. Query-param (`?format=xml`) is still possible via `ContentNegotiationConfigurer.favorParameter(true)` but discouraged. The idiomatic, safe approach today is the **`Accept` header only**. If clients can't set headers, version the URL instead of abusing extensions.",

  "How do you support both JSON and XML for the same endpoint?":
    "Add the **Jackson XML** dependency (`jackson-dataformat-xml`), and Spring auto-registers `MappingJackson2XmlHttpMessageConverter` alongside the JSON one — the same `@RestController` method then returns XML for `Accept: application/xml` and JSON for `Accept: application/json`, no code changes. Narrow explicitly with `@GetMapping(produces = {\"application/json\", \"application/xml\"})`. The gotcha: JAXB annotations (`@XmlRootElement`) and Jackson JSON annotations can conflict, and collections render differently in XML (need a wrapper element). Most teams standardize on JSON and skip XML unless a specific integration demands it.",

  // ===================== Q81: Swagger / OpenAPI =====================
  "What is the difference between Swagger and OpenAPI 3?":
    "**Swagger** was the original spec (Swagger 2.0) owned by SmartBear; in 2015 it was donated to the Linux Foundation and renamed **OpenAPI** — OpenAPI 3 is its successor. OpenAPI 3 replaced Swagger 2's dual-spec-plus-separate-definitions model with a single components structure, added proper support for `Content-Type` per operation, better security scheme definitions, and links/callbacks. \"Swagger UI\" still exists as a viewer, but the spec you author today is OpenAPI 3. The naming overlap trips people up — Swagger is the tooling lineage, OpenAPI is the current standard.",

  "How do you integrate springdoc-openapi with Spring Boot?":
    "Add the **`springdoc-openapi-starter-webmvc-ui`** dependency (Spring Boot 3) and it auto-generates an OpenAPI 3 doc at `/v3/api-docs` plus Swagger UI at `/swagger-ui.html` — zero config, it introspects your `@RestController` classes. Customize with `@Operation`, `@ApiResponse`, `@Schema` on controllers/DTOs, and register a `GroupedOpenApi` bean to split docs by module. It replaced the older springfox library, which is unmaintained and doesn't support Spring Boot 3. For a public API you'd lock down the UI in production so you don't expose endpoints to attackers.",

  "How do you document auth (Bearer JWT) in OpenAPI?":
    "Define a **security scheme** of type `http` with `scheme: bearer` and `bearerFormat: JWT`, then apply `@SecurityScheme` + `@SecurityRequirement` in springdoc — the Swagger UI then shows an **Authorize** button that injects `Authorization: Bearer <token>` into every request. In raw OpenAPI YAML it's `components.securitySchemes.bearerAuth` plus a top-level or per-operation `security: [{ bearerAuth: [] }]`. Without this, callers have to manually add the header to test secured endpoints, which is painful. Mark public endpoints with `@SecurityRequirements({})` to opt them out.",

  // ===================== Q82: PUT / PATCH / POST =====================
  "Which methods are idempotent, and why does that matter?":
    "**GET, PUT, DELETE, HEAD** are idempotent — calling them N times has the same effect as calling once. **POST** is not (each call can create a new resource), and **PATCH** is *not guaranteed* idempotent (it can be, depending on how you implement partial updates). Idempotency matters for **retries and safety**: if a network timeout leaves you unsure whether a DELETE went through, you can safely retry it; a naive POST-create you can't. For payments and money movement, idempotency keys exist precisely to make POST safe to retry.",

  "When would you use PUT for full replace vs PATCH for partial update?":
    "**PUT** replaces the **entire** resource — you send the full representation and omitted fields get cleared, so `PUT /users/1` with `{name}` nulls out the unset fields. **PATCH** sends just the **changes** — `{email}` updates only email and leaves the rest alone. Use PUT when the client owns the full state (and you want \"if you didn't send it, it's gone\"); use PATCH when the client only knows what changed. The subtle trap: people implement PUT as partial-update and break idempotency and client expectations — pick one semantics per endpoint and stick to it.",

  "Is POST always non-idempotent? What about create-with-client-id patterns?":
    "POST is **idempotent by default, not by design** — repeat `POST /orders` and you usually get two orders. But you can *make* it idempotent with an **idempotency key**: the client sends a unique `Idempotency-Key` header, the server stores the first response, and a retry returns the cached result instead of creating a duplicate. Stripe's API does exactly this. So POST isn't *inherently* idempotent like PUT, but with a server-side key store you get the safety of idempotency without changing the method. This is the standard pattern for payment endpoints.",

  // ===================== Q83: Pagination and sorting =====================
  "How does Spring Data's `Pageable` integrate with controllers?":
    "Declare `Pageable pageable` as a controller method parameter and Spring binds `?page=0&size=20&sort=createdAt,desc` into it automatically — no parsing. Pass that `Pageable` straight to `repository.findAll(pageable)` and you get a `Page<T>` back with content, total elements, and page metadata. You can also constrain it with `@PageableDefault(size = 50, sort = \"id\")` so missing params get sane defaults. The win is you write almost no boilerplate for pagination — the framework handles query params, DB query, and counting.",

  "What should a paginated response include (content, total, page, size)?":
    "At minimum: the **content** array for the current page, **totalElements** (so clients can compute total pages), the current **page** number and **size**, and ideally **totalPages** plus **`first`/`last`** flags and navigation links. Without `totalElements`, clients can't render \"page 3 of 12\" or know whether to show a Next button. Spring Data's `Page<T>` serializes all of this by default; if you hand-roll a wrapper, don't drop the total or you'll strand the UI unable to paginate. Include the sort info too if your client can re-sort.",

  "How do you prevent expensive unbounded list endpoints?":
    "**Never** expose a raw `GET /orders` with no limit — it'll eventually be called with a huge table and OOM or time out the DB. Enforce a `Pageable` with a **max page size** (`Pageable` with `size` capped, or `@PageableDefault(size = 50)` plus validation) so a malicious `?size=1000000` is clamped. For full exports, use a dedicated streaming or async download endpoint, not the list API. Unbounded list endpoints are a classic production incident — cap them from day one, not after the first `SELECT *` takes down the service.",
};
