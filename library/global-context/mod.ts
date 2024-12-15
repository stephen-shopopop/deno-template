/**
 * @module
 *
 * This class creates stores that stay coherent through asynchronous operations.
 */

import { AsyncLocalStorage } from 'node:async_hooks'

type Metadata = {
  [key: string]: unknown
  message?: string
}

type User = {
  id: string | number
  email: string
  username: string
}

type Context = {
  metadata?: Metadata
  user?: Partial<User>
  requestId?: string
}

class ContextStorage<T extends object = Record<PropertyKey, unknown>> {
  readonly #currentContext: AsyncLocalStorage<T>

  constructor() {
    this.#currentContext = new AsyncLocalStorage<T>()
  }

  /**
   * Gets all variables previously set within a running context. If this is called outside of a running context, it will not retrieve the value.t: "Internal Server Error"
   *
   *  # Example
   *
   * ```ts
   * import { assertEquals } from 'jsr:@std/assert/equals';
   * import { context } from "jsr:@oneday/global-context";
   *
   * context.run({ user: { id: '1234' } }, () => {
   *    context.set('metadata', { message: 'hello' })
   *
   *    assertEquals(context.getStore()?.user?.id, '1234');
   * assertEquals(context.getStore()?.metadata?.message, 'hello');
   * })
   * ```
   */
  getStore(): T | undefined {
    return this.#currentContext.getStore()
  }

  /**
   * Sets a variable for a given key within running context. If this is called outside of a running context, it will not store the value.
   *
   *  # Example
   *
   * ```ts
   * import { assertEquals } from 'jsr:@std/assert/equals';
   * import { context } from "jsr:@oneday/global-context";
   *
   * context.run({}, () => {
   *    context.set('user', { id: 34 });
   *
   *    assertEquals(context.get('user')?.id, 34 );
   * })
   * ```
   */
  set<E extends keyof T>(key: E, value: T[E]): void {
    const store = this.getStore()

    // Don't block if store not a record
    if (typeof store === 'object' && store !== null) {
      store[key] = value
    }
  }

  /**
   * Gets a variable previously set within a running context. If this is called outside of a running context, it will not retrieve the value.
   *
   *  # Example
   *
   * ```ts
   * import { assertEquals } from 'jsr:@std/assert/equals';
   * import { context } from "jsr:@oneday/global-context";
   *
   * context.run({}, () => {
   *    context.set('metadata', { message: 'hello' });
   *
   *    assertEquals(context.get('metadata')?.message, 'hello');
   * })
   * ```
   */
  get<E extends keyof T>(key: E): T[E] | undefined {
    const store = this.getStore()

    if (typeof store === 'object' && store !== null) {
      return store[key]
    }

    return undefined
  }

  /**
   * Start an local storage context. Once this method is called, a new context is created, for which get and set calls will operate on a set of entities, unique to this context.
   *
   *  # Example
   *
   * ```ts
   * import { assertEquals } from 'jsr:@std/assert/equals';
   * import { context } from "jsr:@oneday/global-context";
   *
   * context.run({ user: { id: '1234' } }, () => {
   *    assertEquals(context.get('user'), { id: '1234' });
   * })
   * ```
   *
   * # Example await/async
   *
   * ```ts
   * import { assertEquals } from 'jsr:@std/assert/equals';
   * import { context } from "jsr:@oneday/global-context";
   *
   * await context.run({ user: { id: 24 } }, async() => {
   *    await Promise.resolve()
   *
   *    assertEquals(context.get('user')?.id, 24);
   * })
   * ```
   */
  run(initialContext: T, callback: () => void): void {
    this.#currentContext.run(initialContext, callback)
  }
}

/**
 * # Example
 *
 * ```ts
 * import { assertEquals } from 'jsr:@std/assert/equals'
 * import { context } from 'jsr:@oneday/global-context'
 *
 * const id = crypto.randomUUID()
 *
 * context.run({ requestId: id }, () => {
 *    context.set('user', { id: '1234', email: 'oneday@oneday.com' })
 *    context.set('metadata', { message: 'hello' })
 *
 *    assertEquals(context.get('user'), { id: '1234', email: 'oneday@oneday.com' })
 *    assertEquals(context.get('metadata')?.message, 'hello')
 *    assertEquals(context.getStore(), {
 *      user: { id: '1234', email: 'oneday@oneday.com' },
 *      metadata: { message: 'hello' },
 *      requestId: id,
 *    })
 * })
 * ```
 */
export const context: ContextStorage<Partial<Context>> = new ContextStorage<
  Partial<Context>
>()
