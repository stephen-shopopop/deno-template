export type ClassType<T = any> = new (...args: any[]) => T

export type NonEmptyArray<T> = [T, ...T[]]

/**
 * Use to manage class dependencies
 *
 * # Example
 *
 * ```ts
 * import { assertEquals } from 'jsr:@std/assert';
 * import { Dependency } from 'jsr:@oneday/simple-di';
 *
 * class User { constructor(public name: string) { } };
 *
 * const user = new Dependency(User, ['John'], true);
 *
 * assertEquals(user.resolve.name, 'John');
 * ```
 */
export class Dependency<Service> implements Disposable {
  #serviceInjected?: Service

  #serviceCached?: Service

  #stack = new DisposableStack()

  /**
   * Constructor overload for classes without required parameters
   */
  constructor(
    serviceInitializer: ClassType<Service> & (new () => Service),
    args?: [],
    cacheable?: boolean,
  )
  /**
   * Constructor overload for classes with parameters
   */
  constructor(
    serviceInitializer: ClassType<Service>,
    args: ConstructorParameters<ClassType<Service>>,
    cacheable?: boolean,
  )
  constructor(
    private serviceInitializer: ClassType<Service>,
    private args: ConstructorParameters<ClassType<Service>> = [] as any,
    private cacheable = true,
  ) {
    this.#stack.adopt(this.injection, () => {
      this.#serviceInjected = undefined
    })
  }

  /**
   * Injects a service instance directly. Useful for overriding the default service.
   *
   * # Example
   *
   * ```ts
   * import { assertInstanceOf } from 'jsr:@std/assert';
   * import { Dependency } from 'jsr:@oneday/simple-di';
   *
   * class User {};
   * class UserInjected {};
   *
   * const user = new Dependency(User, []);
   * user.injection(new UserInjected());
   *
   * assertInstanceOf(user.resolve, UserInjected);
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
   * Clear injected service.
   *
   * # Example
   *
   * ```ts
   * import { assertInstanceOf } from 'jsr:@std/assert';
   * import { Dependency } from 'jsr:@oneday/simple-di';
   *
   * class User {};
   * class UserInjected {};
   *
   * const user = new Dependency(User, []);
   * user.injection(new UserInjected());
   * user.clearInjected();
   *
   * assertInstanceOf(user.resolve, User);
   * ```
   */
  clearInjected(): this {
    this.#serviceInjected = undefined

    return this
  }

  /**
   * Resolve dependencies.
   *
   * # Example
   *
   * ```ts
   * import { assertEquals } from 'jsr:@std/assert';
   * import { Dependency } from 'jsr:@oneday/simple-di';
   *
   * class User { constructor(public name: string) {} };
   *
   * const user = new Dependency(User, ['John']);
   *
   * assertEquals(user.resolve.name, 'John');
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

  [Symbol.dispose]() {
    this.#stack.dispose()
  }
}
