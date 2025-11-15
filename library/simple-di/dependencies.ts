export type ClassType<T = any, Args extends any[] = any[]> =
  new (...args: Args) => T;


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
export class Dependency<Service, Args extends any[] = any[]> {
  #serviceInjected?: Service
  #serviceCached?: Service

  constructor(
    private serviceInitializer: ClassType<Service, Args>,
    private args: Args = [] as unknown as Args,
    private cacheable = true,
  ) {/** */}

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
}
