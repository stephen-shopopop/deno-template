// deno-lint-ignore no-explicit-any
type Constructor<T> = new (...args: any[]) => T

export class Dependency2<Service> {
  #serviceInjected?: Service
  #serviceCached?: Service

  constructor(
    private serviceInitializer: Constructor<Service>,
    private args: ConstructorParameters<Constructor<Service>>,
    private cacheable = true,
  ) {/** */}

  /**
   * Injects a service instance directly. Useful for overriding the default service.
   */
  injection(service: Service): this {
    this.#serviceInjected = service

    return this
  }

  /**
   * Clear injected service.
   */
  clearInjected(): this {
    this.#serviceInjected = undefined

    return this
  }

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
    ))
  }
}

// Default
// const user = new Dependency(() => null);

class TestService {
  constructor(public name: string) {}

  setValue(val: string) {
    this.name = val
  }

  hi() {
    return `Hello ${this.name}`
  }
}

class TestService2 {
  constructor(public name: string) {}

  setValue(val: string) {
    this.name = val
  }

  hi() {
    return `Hello ${this.name}`
  }
}

const dep2 = new Dependency2(TestService, ['test'], true)
console.log(dep2.resolve.hi()) // Hello test
dep2.resolve.setValue('manger')
console.log(dep2.resolve.hi()) // Hello manger (use cache)
dep2.injection(new TestService2('nope'))
console.log(dep2.resolve.hi()) // Hello nope
dep2.clearInjected()
console.log(dep2.resolve.hi()) // Hello manger (use cache)
