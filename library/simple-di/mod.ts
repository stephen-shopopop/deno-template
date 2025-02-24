interface Constructor<T, U> {
  constructor: new (...args: U[]) => T
  arguments: U
}

export class Dependency<Service, Args> {
  #serviceInjected?: Service
  #serviceCached?: Service

  constructor(
    private serviceInitializer: Constructor<Service, Args>['constructor'],
    private args: Constructor<Service, Args>['arguments'][],
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

/**
 * POC test
 */

class TestService {
  constructor(public name: string, public first: string) {}

  setValue(val: string) {
    this.name = val
  }

  hi() {
    return `Hello ${this.name}`
  }
}

class TestService2 {
  constructor(public name: string, public first: string) {}

  setValue(val: string) {
    this.name = val
  }

  hi() {
    return `Hello ${this.name}`
  }
}

class Order {
  constructor(private user: TestService) {
    /** */
  }

  execute() {
    return this.user.hi()
  }
}

const dep2 = new Dependency(TestService, ['the world', 'harry'])
console.log(dep2.resolve.hi()) // Hello the world

dep2.resolve.setValue('daddy')
console.log(dep2.resolve.hi()) // Hello daddy (use cache)

dep2.injection(new TestService2('mummy', 'john'))
console.log(dep2.resolve.hi()) // Hello mummy

dep2.clearInjected()
console.log(dep2.resolve.hi()) // Hello daddy (use cache)

const user = new Dependency(TestService, ['Bernard', 'Noe'])
user.injection(new TestService2('marie', 'joe'))
const order = new Dependency(Order, [user.resolve])
user.clearInjected()
const order2 = new Dependency(Order, [user.resolve])

console.log(order.resolve.execute())
console.log(order2.resolve.execute())
