/**
 * A class constructor type that can be used to create instances of type T.
 *
 * @template T The type of the instance that will be created.
 *
 * @example
 * ```ts
 * import { Dependency } from 'jsr:@oneday/simple-di'
 *
 * class User {
 *   constructor(public name: string) {}
 * }
 *
 * const dep = new Dependency(User, ['John'])
 * const user = dep.resolve
 * ```
 */
// deno-lint-ignore no-explicit-any
type ClassType<T = any> = new (...args: any[]) => T

/**
 * A type-safe dependency injection container with support for caching and the Disposable pattern.
 *
 * The `Dependency` class manages service instantiation with strict type checking,
 * optional caching, and automatic cleanup of injected disposable resources.
 *
 * @template Service The type of service this dependency manages.
 *
 * @example Basic usage
 * ```ts
 * import { Dependency } from 'jsr:@oneday/simple-di';
 *
 * class UserService {
 *   constructor(public name: string) {}
 * }
 *
 * const userDep = new Dependency(UserService, ['Alice']);
 * console.log(userDep.resolve.name); // "Alice"
 * ```
 *
 * @example With caching
 * ```ts
 * import { Dependency } from 'jsr:@oneday/simple-di'
 *
 * class UserService {
 *   constructor(public name: string) {}
 * }
 *
 * const cached = new Dependency(UserService, ['Bob'], true);
 * const instance1 = cached.resolve;
 * const instance2 = cached.resolve;
 * console.log(instance1 === instance2); // true (same instance)
 *
 * const notCached = new Dependency(UserService, ['Charlie'], false);
 * const instance3 = notCached.resolve;
 * const instance4 = notCached.resolve;
 * console.log(instance3 === instance4); // false (different instances)
 * ```
 *
 * @example Manual injection for testing
 * ```ts
 * import { Dependency } from 'jsr:@oneday/simple-di'
 *
 * class UserService {
 *   constructor(public name: string) {}
 * }
 *
 * class MockUserService extends UserService {
 *   constructor() {
 *     super('Mock')
 *   }
 * }
 *
 * const userDep = new Dependency(UserService, ['Alice']);
 * userDep.injection(new MockUserService());
 * console.log(userDep.resolve.name); // "Mock"
 *
 * userDep.clearInjected();
 * console.log(userDep.resolve.name); // "Alice"
 * ```
 *
 * @example Disposable pattern
 * ```ts
 * import { Dependency } from 'jsr:@oneday/simple-di'
 *
 * class Database implements Disposable {
 *   constructor(public url: string) {}
 *
 *   [Symbol.dispose]() {
 *     console.log('Closing database connection');
 *   }
 * }
 *
 * const dbDep = new Dependency(Database, ['postgresql://localhost']);
 *
 * {
 *   using _ = dbDep;
 *   dbDep.injection(new Database('mock://test'));
 *   // Use mockDb...
 * } // mockDb is automatically disposed here
 * ```
 */
export class Dependency<Service> implements Disposable {
  #serviceInjected?: Service

  #serviceCached?: Service

  #stack = new DisposableStack()

  /**
   * Creates a new Dependency instance for a class without required constructor parameters.
   *
   * @param serviceInitializer The class constructor to instantiate.
   * @param args Optional empty array of constructor arguments.
   * @param cacheable Whether to cache the resolved instance. Defaults to `true`.
   *
   * @example
   * ```ts
   * class Logger {
   *   log(msg: string) { console.log(msg); }
   * }
   *
   * const logger = new Dependency(Logger);
   * logger.resolve.log('Hello'); // "Hello"
   * ```
   */
  constructor(
    serviceInitializer: ClassType<Service> & (new () => Service),
    args?: [],
    cacheable?: boolean,
  )
  /**
   * Creates a new Dependency instance for a class with constructor parameters.
   *
   * @param serviceInitializer The class constructor to instantiate.
   * @param args Array of constructor arguments with strict type checking.
   * @param cacheable Whether to cache the resolved instance. Defaults to `true`.
   *
   * @example
   * ```ts
   * class UserService {
   *   constructor(public name: string, public age: number) {}
   * }
   *
   * // ✅ Correct: types match
   * const user = new Dependency(UserService, ['Alice', 30]);
   *
   * // ❌ Compile error: wrong types
   * // const user = new Dependency(UserService, [123, 'invalid']);
   * ```
   */
  constructor(
    serviceInitializer: ClassType<Service>,
    args: ConstructorParameters<ClassType<Service>>,
    cacheable?: boolean,
  )
  constructor(
    private serviceInitializer: ClassType<Service>,
    // deno-lint-ignore no-explicit-any
    private args: ConstructorParameters<ClassType<Service>> = [] as any,
    private cacheable = true,
  ) {
    this.#stack.adopt(this.injection, () => {
      this.#serviceInjected = undefined
    })
  }

  /**
   * Manually injects a service instance, overriding the default service.
   *
   * This is particularly useful for testing, where you can inject mock implementations.
   * If the injected service implements `Disposable`, it will be automatically disposed
   * when the dependency is disposed or when `clearInjected()` is called.
   *
   * **Important:** Only injected services are disposed, not services created by the constructor.
   *
   * @param service The service instance to inject.
   * @returns This dependency instance for method chaining.
   *
   * @example Basic injection
   * ```ts
   * import { Dependency } from 'jsr:@oneday/simple-di'
   *
   * class UserService {
   *   getUser() { return 'Real user'; }
   * }
   *
   * class MockUserService extends UserService {
   *   override getUser() { return 'Mock user'; }
   * }
   *
   * const userDep = new Dependency(UserService, []);
   * userDep.injection(new MockUserService());
   * console.log(userDep.resolve.getUser()); // "Mock user"
   * ```
   *
   * @example Disposable injection
   * ```ts
   * import { Dependency } from 'jsr:@oneday/simple-di'
   *
   * class Database implements Disposable {
   *   constructor(public name: string) {}
   *
   *   [Symbol.dispose]() {
   *     console.log('Cleanup');
   *   }
   * }
   *
   * const dbDep = new Dependency(Database, ['prod']);
   * {
   *   using _ = dbDep;
   *   dbDep.injection(new Database('mock'));
   *   // Use mock...
   * } // Automatically calls [Symbol.dispose]() on the mock
   * ```
   */
  injection(service: Service): this {
    this.#serviceInjected = service

    // If the injected service is Disposable, add it to the stack
    if (
      service &&
      typeof service === 'object' &&
      Symbol.dispose in service
    ) {
      this.#stack.use(service as Disposable)
    }

    return this
  }

  /**
   * Clears the manually injected service and returns to using the original service.
   *
   * If the injected service implements `Disposable`, its `[Symbol.dispose]()` method
   * will be called automatically before clearing the reference.
   *
   * @returns This dependency instance for method chaining.
   *
   * @example
   * ```ts
   * class UserService {
   *   constructor(public name: string) {}
   * }
   *
   * class MockUserService {
   *   constructor(public name: string) {}
   * }
   *
   * const userDep = new Dependency(UserService, ['Alice']);
   * console.log(userDep.resolve.name); // "Alice"
   *
   * userDep.injection(new MockUserService('Mock'));
   * console.log(userDep.resolve.name); // "Mock"
   *
   * userDep.clearInjected();
   * console.log(userDep.resolve.name); // "Alice" (back to original)
   * ```
   *
   * @example With Disposable service
   * ```ts
   * class Database implements Disposable {
   *   constructor(public url: string) {}
   *
   *   [Symbol.dispose]() {
   *     console.log(`Closing connection to ${this.url}`);
   *   }
   * }
   *
   * const dbDep = new Dependency(Database, ['prod-db']);
   * dbDep.injection(new Database('test-db'));
   *
   * dbDep.clearInjected(); // Logs: "Closing connection to test-db"
   * console.log(dbDep.resolve.url); // "prod-db"
   * ```
   */
  clearInjected(): this {
    this.#serviceInjected = undefined

    return this
  }

  /**
   * Resolves and returns the service instance.
   *
   * Returns the manually injected service if one exists, otherwise returns
   * the cached instance (if caching is enabled) or creates a new instance.
   *
   * @returns The resolved service instance.
   *
   * @example Basic usage
   * ```ts
   * class UserService {
   *   constructor(public name: string) {}
   * }
   *
   * const userDep = new Dependency(UserService, ['Alice']);
   * const user = userDep.resolve;
   * console.log(user.name); // "Alice"
   * ```
   *
   * @example With caching enabled (default)
   * ```ts
   * class Counter {
   *   count = 0;
   *   increment() { this.count++; }
   * }
   *
   * const counterDep = new Dependency(Counter, [], true);
   * counterDep.resolve.increment();
   * counterDep.resolve.increment();
   * console.log(counterDep.resolve.count); // 2 (same instance)
   * ```
   *
   * @example With caching disabled
   * ```ts
   * class Counter {
   *   count = 0;
   *   increment() { this.count++; }
   * }
   *
   * const counterDep = new Dependency(Counter, [], false);
   * counterDep.resolve.increment();
   * counterDep.resolve.increment();
   * console.log(counterDep.resolve.count); // 1 (new instance each time)
   * ```
   *
   * @example Priority: injected > cached > new
   * ```ts
   * import { Dependency } from 'jsr:@oneday/simple-di'
   *
   * class UserService {
   *   constructor(public name: string) {}
   * }
   *
   * const userDep = new Dependency(UserService, ['Original']);
   *
   * const cached = userDep.resolve; // Creates and caches instance
   * console.log(cached.name); // "Original"
   *
   * userDep.injection(new UserService('Injected'));
   * console.log(userDep.resolve.name); // "Injected" (injected takes priority)
   *
   * userDep.clearInjected();
   * console.log(userDep.resolve.name); // "Original" (returns to cached)
   * ```
   */
  get resolve(): Service {
    if (this.#serviceInjected) {
      return this.#serviceInjected
    }

    if (!this.cacheable) {
      this.#serviceCached = undefined
    }

    return (this.#serviceCached ??= Reflect.construct(
      this.serviceInitializer,
      this.args,
    ) as Service)
  }

  /**
   * Disposes the dependency and cleans up resources.
   *
   * This method is called automatically when using the `using` keyword.
   * It disposes any injected service that implements `Disposable` and clears
   * the injected service reference.
   *
   * **Important:** Only manually injected services are disposed, not services
   * created by the constructor. The cached service instance is preserved.
   *
   * @example Automatic disposal with `using` keyword
   * ```ts
   * import { Dependency } from 'jsr:@oneday/simple-di'
   *
   * class Database implements Disposable {
   *   constructor(public url: string) {
   *     console.log(`Connected to ${url}`);
   *   }
   *
   *   [Symbol.dispose]() {
   *     console.log(`Disconnected from ${this.url}`);
   *   }
   * }
   *
   * const dbDep = new Dependency(Database, ['prod-db']);
   *
   * {
   *   using _ = dbDep;
   *   dbDep.injection(new Database('test-db'));
   *   // Logs: "Connected to test-db"
   *   // Use test-db...
   * } // Logs: "Disconnected from test-db" (automatic disposal)
   *
   * console.log(dbDep.resolve.url); // "prod-db" (original still available)
   * ```
   *
   * @example Manual disposal
   * ```ts
   * import { Dependency } from 'jsr:@oneday/simple-di'
   *
   * class Database implements Disposable {
   *   constructor(public url: string) {}
   *
   *   [Symbol.dispose]() {
   *     console.log(`Disconnected from ${this.url}`);
   *   }
   * }
   *
   * const dbDep = new Dependency(Database, ['prod-db']);
   * dbDep.injection(new Database('test-db'));
   *
   * dbDep[Symbol.dispose](); // Manually dispose
   * // Logs: "Disconnected from test-db"
   * ```
   */
  [Symbol.dispose]() {
    this.#stack.dispose()
  }
}
