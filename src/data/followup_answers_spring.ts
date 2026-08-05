/**
 * Answer bank for followup questions — Spring MVC / REST APIs category.
 * Keyed by the exact followup `text` so answers merge into the FollowUp
 * objects at runtime without touching questions.ts.
 *
 * Style (per answer_rules.md):
 *  - Length follows the question — no sentence quota, no padding
 *  - Bold the terms that actually matter
 *  - No GPT fluff, no "In conclusion", active voice, contractions
 *  - BAD/GOOD code only where it proves understanding
 */
export const followupAnswersSpring: Record<string, string> = {
  // ===================== Q69: Spring MVC request flow =====================
  "What roles do HandlerAdapter, ViewResolver, and interceptors play?":
    "`HandlerAdapter` **executes** the controller method Spring found — it bridges between DispatcherServlet and however your handler is actually shaped (annotated, `RequestMappingHandlerAdapter`, etc.), because DispatcherServlet doesn't know how to call arbitrary handlers directly. `ViewResolver` **maps a logical view name** like `\"users/list\"` to a real template (Thymeleaf, JSP) — mostly irrelevant for `@RestController` since there's no view to resolve. `HandlerInterceptor` runs **before, after, and after-completion** around your handler — that's where auth checks, logging, and timing live without polluting controllers. Interceptors run *inside* DispatcherServlet, after the filter chain.",

  "Where does filter chain sit relative to DispatcherServlet?":
    "Filters run **before** DispatcherServlet — they sit in the servlet container's filter chain, so they see the raw `HttpServletRequest` before Spring's front controller is even invoked. That's why Spring Security is implemented as a filter (`DelegatingFilterProxy` → `FilterChainProxy`) — auth has to happen before any controller runs. Interceptors, by contrast, run **inside** DispatcherServlet, after handler mapping. Rule of thumb: if it must happen regardless of whether Spring can route the request (CORS, security, compression), use a filter; if it's tied to a specific handler, use an interceptor.",

  // ===================== Q70: @RequestMapping / composed mappings =====================
  "How do you map multiple paths or HTTP methods on one method?":
    "`@GetMapping({\"/users\", \"/customers\"})` maps the same method to **multiple paths** — handy for aliases or backward-compatible routes. For multiple HTTP methods on one method you'd use `@RequestMapping(method = {GET, HEAD})`, but in practice you rarely want one method handling both GET and POST since they usually return different things. Don't abuse this — if a method is branching on `request.getMethod()`, you've probably got two endpoints pretending to be one.",

  "How do `consumes` and `produces` attributes work?":
    "`consumes` restricts the endpoint to requests whose **`Content-Type`** matches — `@PostMapping(consumes = \"application/json\")` rejects a form-encoded body with **415 Unsupported Media Type**. `produces` restricts what the response can be based on the client's **`Accept`** header — `produces = \"application/json\"` answers a `Accept: application/xml` request with **406 Not Acceptable** if you don't produce XML. They're how Spring does **content negotiation at the mapping level**, narrowing a handler before it ever runs. Skip them and Spring accepts any content type, which can let a caller send a payload your converter can't actually deserialize.",

  // ===================== Q71: @PathVariable vs @RequestParam =====================
  "When is a request param required vs optional, and how do you set defaults?":
    "Both `@RequestParam` and `@PathVariable` are **required by default** — a missing `@RequestParam(\"sort\")` triggers a 400. Make it optional with `@RequestParam(required = false)` or give it a default: `@RequestParam(defaultValue = \"createdAt\") String sortBy`. `@PathVariable` is trickier — if it's optional the route itself usually needs two mappings, since a missing path segment won't match the URL pattern. Don't mark everything optional and then NPE inside the method — set a `defaultValue` so the behavior is predictable.",

  "How do you bind multiple query params into an object?":
    "Declare a POJO and Spring binds matching query params to its fields automatically — `record FilterParams(String status, Integer page, Integer size) {}` and `getList(FilterParams filter)` pulls `?status=ACTIVE&page=0` into the object with no annotation needed. This is **command-object binding**, the same mechanism that backs form submissions. For nested or complex binding you add `@ModelAttribute`, and for validation you annotate fields and add `@Valid`. It keeps the controller signature clean when you've got 5+ query params instead of a 5-argument method.",

  "What happens when a path variable contains an encoded slash or space?":
    "`@PathVariable` is **automatically URL-decoded** by Spring, so `/users/John%20Doe` arrives as `\"John Doe\"`. The trap is **encoded slashes** (`%2F`) — many containers (Tomcat) reject them by default for security, and a real `/` in a path variable breaks the URL pattern match entirely. For free-text values, prefer `@RequestParam` over `@PathVariable` so slashes and special characters don't corrupt the route. If you must put messy values in the path, configure the container to allow encoded slashes and document it, because it'll bite you in production otherwise.",

  // ===================== Q72: @RequestBody / @ResponseBody =====================
  "Which `HttpMessageConverter` handles JSON by default?":
    "**`MappingJackson2HttpMessageConverter`** — Spring Boot auto-configures it because Jackson is on the classpath, and it converts between Java objects and JSON for both `@RequestBody` (deserialize) and `@ResponseBody` (serialize). You customize it by registering an `ObjectMapper` bean — that's how you set `SnakeCase` naming, `JavaTimeModule` for `LocalDateTime`, or `FAIL_ON_UNKNOWN_PROPERTIES = false`. If Jackson isn't on the classpath and you return an object, Spring has no converter and you get a **415/500** depending on the direction. For XML you'd add Jackson XML or JAXB and the converter picks based on `Content-Type`.",

  "What happens if deserialization fails for the request body?":
    "If the JSON is malformed or doesn't match the target type, Jackson throws **`HttpMessageNotReadableException`**, which Spring translates into a **400 Bad Request** by default — the controller method never runs. The common gotcha: the **exception message leaks details** (unknown property, type mismatch), so in production you catch it in `@ControllerAdvice` and return a generic error. Also watch `@Valid` — a *syntactically valid* JSON that violates a bean constraint throws `MethodArgumentNotValidException`, a different 400 path. Both need handling if your API should return clean errors.",

  // ===================== Q73: @Valid / @Validated =====================
  "You put `@Min(1)` on a `@RequestParam` and it's ignored. Why?":
    "Because a constraint on a plain method parameter isn't part of request-body binding — it needs **method validation**, which is a separate mechanism from the `@Valid` you put on a `@RequestBody` DTO.\n\nBefore Spring Framework 6.1 you turned it on by putting **`@Validated` on the controller class**, which wraps the bean in a validating proxy. Then watch what a failure looks like: it throws `ConstraintViolationException`, and with nothing handling that you return a **500** for what is plainly a client error.\n\nSpring Framework 6.1 (Boot 3.2) built this into MVC — constraints on controller method parameters are applied directly, and a violation raises `HandlerMethodValidationException`, which maps to **400** out of the box. So on a current Boot the annotation just works; on anything older, a missing `@Validated` is your answer.",

  "Where do you put constraint annotations — DTO fields or custom validators?":
    "Built-in constraints (`@NotBlank`, `@Email`, `@Size`) go straight on **DTO fields**. When a rule can't be expressed declaratively — \"endDate must be after startDate\", \"email must be unique in the DB\" — you write a **custom `ConstraintValidator`** annotated with `@Target`/`@Constraint(validatedBy = ...)`. Never validate business rules that need the database inside a bean-validation annotation casually — it makes your validator call the repo and creates hidden DB hits at binding time. Keep field-level checks in annotations; do cross-field and DB-dependent checks in the service layer.",

  "How do you return a structured 400 response for validation errors?":
    "Catch **`MethodArgumentNotValidException`** in an `@RestControllerAdvice` and build a consistent error body — field name, rejected value, message — returning `ResponseEntity.status(400).body(errorResponse)`. Without this, Spring's default 400 dumps a generic \"Bad Request\" with no field details, so the client can't tell *what* was wrong. The structured shape also makes it uniform across all endpoints instead of each controller inventing its own error format. Don't expose the raw `BindingResult` internals — map it to your own `ErrorResponse` DTO.",

  // ===================== Q74: @ControllerAdvice / @ExceptionHandler =====================
  "How do you map domain exceptions to HTTP status codes?":
    "Annotate the exception class with **`@ResponseStatus(HttpStatus.NOT_FOUND)`** and any uncaught throw of it returns that status — quick but inflexible. The flexible way: catch it in `@RestControllerAdvice` with `@ExceptionHandler(UserNotFoundException.class)` and return `ResponseEntity.status(404).body(...)`, which lets you attach a body and vary the status per context. Don't leak a raw **500** for business errors — a missing user isn't a server fault, it's a 404, and a duplicate email is a 409. Mapping domain exceptions to correct statuses is what makes an API actually usable.",

  "How much of an exception should the client see?":
    "As little as identifies the problem: the status, a stable error code, a human-readable message, and a **correlation ID**. Log the full detail server-side against that ID so support can find it in seconds.\n\nWhat never goes out is the **stack trace**. It leaks framework versions, internal package structure, sometimes SQL fragments and file paths — that's a fingerprint an attacker uses to match your stack against known CVEs. `server.error.include-stacktrace=ALWAYS` is a dev-only setting; production is `NEVER`.\n\nThe same restraint applies to messages you didn't write. A raw `DataIntegrityViolationException` message names your tables and constraints, so map domain exceptions to your own wording rather than passing `ex.getMessage()` straight through.",

  // ===================== Q75: HTTP status codes =====================
  "What is the difference between 401 and 403?":
    "**401 Unauthorized** actually means *unauthenticated* — the server doesn't know who you are, so you need to log in (no/invalid credentials, missing token). **403 Forbidden** means *authenticated but not allowed* — the server knows who you are and you still can't touch this resource (wrong role, not the owner). The names are backwards and confusing: 401 is really \"who are you?\" and 403 is \"I know who you are, and no.\" Getting this right matters because clients react differently — 401 triggers a re-login flow, 403 shows an access-denied screen.",

  "A request is well-formed but breaks a business rule — 400, 409 or 422?":
    "It depends which kind of rule, and the honest answer is that teams differ.\n\n**409 Conflict** is for a clash with current state — the email is already registered, the order was already cancelled, an optimistic-lock version mismatch. It carries the useful hint that retrying might work once the state changes.\n\n**422 Unprocessable Entity** is for a body that parses and passes field validation but is semantically wrong: `endDate` before `startDate`, a currency the account can't transact in. Plenty of APIs use plain **400** for this instead and that's defensible. What isn't defensible is a **500** — it tells the client to retry something that will never succeed, and pages someone for a system that's working correctly.\n\nPick one convention and document it. The client mostly needs to know whose fault it is: 4xx means don't retry until you change something, 5xx means back off and try again.",

  // ===================== Q76: ResponseEntity =====================
  "How do you set custom headers with ResponseEntity?":
    "Use the builder: `ResponseEntity.ok().header(\"X-Total-Count\", \"42\").body(users)`, or `ResponseEntity.created(URI).header(HttpHeaders.LOCATION, uri).build()`. For multiple headers chain `.header(...)` calls or use `HttpHeaders` object directly. Setting headers via `HttpServletResponse` works but bypasses Spring's processing and breaks testability with `MockMvc` — prefer `ResponseEntity` so the contract is explicit and assertable. Headers matter for pagination metadata, rate-limit info (`X-RateLimit-Remaining`), and the `Location` header on creates.",

  "How do you return a file download with `ResponseEntity`?":
    "Return a **`ResponseEntity<Resource>`** and set two headers: `Content-Type` (via `.contentType(MediaType.APPLICATION_PDF)` or `APPLICATION_OCTET_STREAM` when you don't know) and **`Content-Disposition: attachment; filename=\"invoice.pdf\"`**, which is what makes the browser download rather than render it. Add `.contentLength(...)` when you know the size so the client can show a progress bar.\n\nThe part that matters in production is **not loading the file into memory**. A `ByteArrayResource` reads the whole thing onto the heap, so a few concurrent downloads of a 200MB export will OOM the pod. Use an `InputStreamResource` over the file or S3 stream, or a `StreamingResponseBody`, so bytes flow straight to the socket.\n\nAlso sanitise the filename if any part of it comes from user input — a newline or quote in a `Content-Disposition` header is a header-injection bug.",

  // ===================== Q77: API versioning =====================
  "How do you deprecate an old API version safely?":
    "Keep `/v1` running, add a **`Sunset`** and **`Deprecation`** header to its responses to signal end-of-life, document a migration path with a concrete shutdown date, and monitor usage so you only retire it once traffic is near zero. Never hard-cut a version — external clients you don't control will break. Add the deprecation early, communicate it loudly, and give a runway measured in months, not days. A clean v1→v2 often involves keeping both talking to the same service layer so behavior stays consistent.",

  "What are trade-offs of query-param versioning?":
    "Query-param versioning (`/users?version=2`) keeps URLs resource-centric and is easy to default (`version` falls back to 1), but it's **invisible in the URL path**, easy to forget, and breaks HTTP caching because the path looks identical across versions. It also collides with actual query parameters and confuses routing layers. It works for quick internal needs but rarely scales for public APIs. URI versioning wins for clarity, header versioning for cleanliness — query versioning is the awkward middle.",

  // ===================== Q78: HATEOAS =====================
  "When is HATEOAS worth the extra complexity?":
    "Rarely, and the test is who owns the client. It pays off for a **public API you want to evolve** — clients follow `_links` instead of hardcoding URL patterns, so you can move an endpoint without breaking them — and for genuinely stateful resources where the available transitions change with state, like which actions an order allows once it's shipped. For internal microservices where the same team owns both sides, it doesn't pay: you're adding a wrapper type and link-building code to every response so a client can read a URL it could have constructed. Mechanically it's `EntityModel`, `CollectionModel`, and `WebMvcLinkBuilder` — `linkTo(methodOn(OrderController.class).cancel(id)).withRel(\"cancel\")` — which is type-safe, but still boilerplate on every endpoint.",

  // ===================== Q79: CORS =====================
  "What is a preflight request, and which HTTP method is used?":
    "A **preflight** is an automatic **OPTIONS** request the browser sends before a \"non-simple\" cross-origin request — anything with custom headers, non-simple methods like PUT/DELETE, or a non-basic Content-Type. The server responds with `Access-Control-Allow-*` headers saying what's allowed, and only then does the browser send the real request. \"Simple\" requests (basic GET/POST with standard headers) skip the preflight. For REST APIs with JSON bodies and auth headers, you'll always see the OPTIONS preflight, so your CORS config must handle OPTIONS, not just the real verb.",

  "Which headers actually drive the browser's CORS decision?":
    "The browser sends **`Origin`** on cross-origin requests; the server replies with **`Access-Control-Allow-Origin`** (the allowed origin or `*`), **`Access-Control-Allow-Methods`**, **`Access-Control-Allow-Headers`** (which request headers are permitted), and for credentialed requests **`Access-Control-Allow-Credentials: true`** plus a specific origin (never `*`). Preflight responses also include `Access-Control-Max-Age` to cache the preflight. Mismatch any of these — say, you allow `*` but the client sends credentials — and the browser blocks the response even though the server returned 200.",

  // ===================== Q80: Content negotiation =====================
  "How can path extensions or query params participate in negotiation?":
    "Historically Spring let `/users.json` or `/users?format=xml` drive content negotiation via `favorPathExtension` / `favorParameter`, but **path-extension negotiation is deprecated** for security (it opens up RFD — reflected file download — attacks) and is off by default in modern Spring. Query-param (`?format=xml`) is still possible via `ContentNegotiationConfigurer.favorParameter(true)` but discouraged. The idiomatic, safe approach today is the **`Accept` header only**. If clients can't set headers, version the URL instead of abusing extensions.",

  "How do you support both JSON and XML for the same endpoint?":
    "Add the **Jackson XML** dependency (`jackson-dataformat-xml`), and Spring auto-registers `MappingJackson2XmlHttpMessageConverter` alongside the JSON one — the same `@RestController` method then returns XML for `Accept: application/xml` and JSON for `Accept: application/json`, no code changes. Narrow explicitly with `@GetMapping(produces = {\"application/json\", \"application/xml\"})`. The gotcha: JAXB annotations (`@XmlRootElement`) and Jackson JSON annotations can conflict, and collections render differently in XML (need a wrapper element). Most teams standardize on JSON and skip XML unless a specific integration demands it.",

  // ===================== Q81: Swagger / OpenAPI =====================
  "What is the difference between Swagger and OpenAPI 3?":
    "**Swagger** was the original spec (Swagger 2.0) owned by SmartBear; in 2015 it was donated to the Linux Foundation and renamed **OpenAPI** — OpenAPI 3 is its successor. OpenAPI 3 replaced Swagger 2's dual-spec-plus-separate-definitions model with a single components structure, added proper support for `Content-Type` per operation, better security scheme definitions, and links/callbacks. \"Swagger UI\" still exists as a viewer, but the spec you author today is OpenAPI 3. The naming overlap trips people up — Swagger is the tooling lineage, OpenAPI is the current standard.",

  "How do you document auth (Bearer JWT) in OpenAPI?":
    "Define a **security scheme** of type `http` with `scheme: bearer` and `bearerFormat: JWT`, then apply `@SecurityScheme` + `@SecurityRequirement` in springdoc — the Swagger UI then shows an **Authorize** button that injects `Authorization: Bearer <token>` into every request. In raw OpenAPI YAML it's `components.securitySchemes.bearerAuth` plus a top-level or per-operation `security: [{ bearerAuth: [] }]`. Without this, callers have to manually add the header to test secured endpoints, which is painful. Mark public endpoints with `@SecurityRequirements({})` to opt them out.",

  // ===================== Q82: PUT / PATCH / POST =====================
  "Which methods are idempotent, and why does that matter?":
    "**GET, PUT, DELETE, HEAD** are idempotent — calling them N times has the same effect as calling once. **POST** is not (each call can create a new resource), and **PATCH** is *not guaranteed* idempotent (it can be, depending on how you implement partial updates). Idempotency matters for **retries and safety**: if a network timeout leaves you unsure whether a DELETE went through, you can safely retry it; a naive POST-create you can't. For payments and money movement, idempotency keys exist precisely to make POST safe to retry.",

  "Is POST always non-idempotent? What about create-with-client-id patterns?":
    "POST is **non-idempotent by default, but that's a default and not a law** — repeat `POST /orders` and you usually get two orders. But you can *make* it idempotent with an **idempotency key**: the client sends a unique `Idempotency-Key` header, the server stores the first response, and a retry returns the cached result instead of creating a duplicate. Stripe's API does exactly this. So POST isn't *inherently* idempotent like PUT, but with a server-side key store you get the safety of idempotency without changing the method. This is the standard pattern for payment endpoints.",

  // ===================== Q83: Pagination and sorting =====================
  "Why does `?page=5000` get slow, and what do you use instead?":
    "Because offset pagination makes the database **walk and discard every row it skips**. `LIMIT 20 OFFSET 100000` reads a hundred thousand rows to throw them away, so latency climbs with the page number even though the response size is constant. `Page<T>` compounds it by running a second `COUNT(*)` on every request, which on a large table can cost more than the page itself.\n\nFor deep paging the fix is **keyset (cursor) pagination**: carry the last row's sort key instead of an offset — `WHERE (created_at, id) < (:lastCreatedAt, :lastId) ORDER BY created_at DESC, id DESC LIMIT 20`. That's an index seek, so page 5000 costs the same as page 1. The trade is that you can only move forward and back, not jump to an arbitrary page, which suits infinite scroll and API consumers but not a \"page 3 of 12\" UI.\n\nIf you're staying with offsets, returning **`Slice<T>`** instead of `Page<T>` at least drops the count query when the client only needs to know whether there's a next page.",

  "How do you prevent expensive unbounded list endpoints?":
    "**Never** expose a raw `GET /orders` with no limit — it'll eventually be called with a huge table and OOM or time out the DB. Enforce a `Pageable` with a **max page size** (`Pageable` with `size` capped, or `@PageableDefault(size = 50)` plus validation) so a malicious `?size=1000000` is clamped. For full exports, use a dedicated streaming or async download endpoint, not the list API. Unbounded list endpoints are a classic production incident — cap them from day one, not after the first `SELECT *` takes down the service.",
};
