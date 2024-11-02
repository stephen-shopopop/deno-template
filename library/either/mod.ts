/**
 * @module
 *
 * In error handling, we have two possible paths, either a successful calculation or a failure.
 * The imperative way to control the flow is to use exceptions and a try/catch block.
 * In functional programming, they recognised that these two **paths ok or error can be joined in a structure that means either** as a possibility and that we can thus unify them in a **So <ok,error>** structure.
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

export type Either<A, B> = Left<A> | Right<B>

export function isLeft<A, B>(val: Either<A, B>): val is Left<A> {
  return val.tag === 'left'
}

export function isRight<A, B>(val: Either<A, B>): val is Right<B> {
  return val.tag === 'right'
}

export function Left<A>(val: A): Left<A> {
  return { tag: 'left', value: val }
}

export function Right<B>(val: B): Right<B> {
  return { tag: 'right', value: val }
}
