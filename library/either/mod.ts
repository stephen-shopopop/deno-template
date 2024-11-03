/**
 * @module
 *
 * In error handling, we have two possible paths, either a successful calculation or a failure.
 * The imperative way to control the flow is to use exceptions and a try/catch block.
 * In functional programming, they recognised that these two **paths ok or error can be joined in a structure that means either** as a possibility and that we can thus unify them in a **So <error,ok>** structure.
 *
 * This pattern allows us to obtain better error management in order to define http status code, for example, without the domain being coupled to the http server.
 *
 * We can now separate a technical error from a business error. A technical error will throw and interrupt code execution whereas a business error maintains execution and becomes the responsibility of the domain.
 */

interface Left<A> {
  readonly value: A
  readonly tag: 'left'
}

interface Right<B> {
  readonly value: B
  readonly tag: 'right'
}

/**
 * Error Handling with the Either type
 *
 *  # Example
 *
 * ```ts ignore
 * import { assertEquals } from 'jsr:@std/assert/equals';
 * import { Either } from "jsr:@oneday/either";
 *
 * const parseValue = (value: unknown): Either<string, number> =>
 *    typeof value === 'number' ? Right(value) : Left('Invalid value')
 *
 * const valueOrError = parseValue('Hello')
 *
 * assertEquals(isLeft(valueOrError), true);
 * assertEquals(valueOrError.value, 'Invalid value');
 * ```
 */
export type Either<A, B> = Left<A> | Right<B>

/**
 * Determine if value on Left
 *
 * # Example
 *
 * ```ts
 * import { assertEquals } from 'jsr:@std/assert/equals';
 * import { Left, isLeft } from "jsr:@oneday/either";
 *
 * const leftValue = Left('value');
 *
 * assertEquals(isLeft(leftValue), true);
 * ```
 */
export function isLeft<A, B>(val: Either<A, B>): val is Left<A> {
  return val.tag === 'left'
}

/**
 * Determine if value on Right
 *
 * # Example
 *
 * ```ts
 * import { assertEquals } from 'jsr:@std/assert/equals';
 * import { Right, isRight } from "jsr:@oneday/either";
 *
 * const rightValue = Right('value');
 *
 * assertEquals(isRight(rightValue), true);
 * ```
 */
export function isRight<A, B>(val: Either<A, B>): val is Right<B> {
  return val.tag === 'right'
}

/**
 *  # Example
 *
 * ```ts
 * import { assertEquals } from 'jsr:@std/assert/equals';
 * import { Left } from "jsr:@oneday/either";
 *
 * const leftValue = Left('value');
 *
 * assertEquals(leftValue, { tag: 'left', value: 'value' });
 * ```
 */
export function Left<A>(val: A): Left<A> {
  return { tag: 'left', value: val }
}

/**
 *  # Example
 *
 * ```ts
 * import { assertEquals } from 'jsr:@std/assert/equals';
 * import { Right } from "jsr:@oneday/either";
 *
 * const rightValue = Right('value');
 *
 * assertEquals(rightValue, { tag: 'right', value: 'value' });
 * ```
 */
export function Right<B>(val: B): Right<B> {
  return { tag: 'right', value: val }
}
