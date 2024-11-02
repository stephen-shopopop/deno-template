# Functional pattern

## Either

In error handling, we have two possible paths, either a successful calculation or a failure. The imperative way to control the flow is to use exceptions and a try/catch block. In functional programming, they recognised that these two **paths ok or error can be joined in a structure that means either** as a possibility and that we can thus unify them in a **So <ok,error>** structure.

This pattern allows us to obtain better error management in order to define http status code, for example, without the domain being coupled to the http server.

We can now separate a technical error from a business error. A technical error will throw and interrupt code execution whereas a business error maintains execution and becomes the responsibility of the domain.

```ts
import { assertEquals } from 'jsr:@std/assert/equals'

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

function add(value?: number): Either<null, number> {
  return value !== undefined ? Right(value) : Left(null)
}

let added = add()

assertEquals(isLeft(added), true)
assertEquals(isRight(added), false)
assertEquals(added.value, null)

added = add(2)

assertEquals(isRight(added), true)
assertEquals(isLeft(added), false)
assertEquals(added.value, 2)
```

## Compose

At its essence, composition is the art of combining functions to create new functions, fostering a style of coding that emphasizes clarity and reusability.

```ts
import { assertEquals } from 'jsr:@std/assert/equals'

type Handle<T> = (value: T) => T

function compose<T>(...functions: Array<Handle<T>>): Handle<T> {
  return (arg: T): T =>
    functions
      .reduce((prev, currentFn) => currentFn(prev), arg)
}

const sanitize = compose<string>(
  (value) => value.trim(),
  (value) => value.replace('j', 'J'),
)

assertEquals(sanitize(' jean '), 'Jean')
```

Variant

```ts
import { assertEquals } from 'jsr:@std/assert/equals'

type Handle<T> = (value: T) => Promise<T> | T

export function compose<T>(
  ...functions: Array<Handle<T>>
): Handle<T> {
  return async (arg: T) => {
    let acc: T = arg

    for (const fn of functions) {
      acc = await fn(acc)
    }

    return acc
  }
}

// Async usage
const sanitizeName = await compose<string>(
  (value) => value.trim(),
  (value) => value.replace('j', 'J'),
  (value) => Promise.resolve(`${value}!`),
)(' jean ')

assertEquals(sanitizeName, 'Jean!')

type User = {
  name: string
  id: number
}

// Object usage
const user = await compose<User>(
  (user) => ({
    ...user,
    name: user.name.trim(),
  }),
  ({ name, id }) => ({
    id,
    name: `${name}!`,
  }),
)({ name: '  jean  ', id: 1 })

assertEquals(user, { name: 'jean!', id: 1 })
```

## Use case

Use [use-case pattern](https://practica.dev/blog/about-the-sweet-and-powerful-use-case-code-pattern)

```ts ignore
import { assertEquals } from 'jsr:@std/assert/equals'
import opentelemetry from 'npm:@opentelemetry/api'

const tracer = opentelemetry.trace.getTracer(
  'deno-demo-tracer',
)

async function runUseCaseStep<T>(
  stepName: string,
  stepFunction: () => Promise<T> | T,
): Promise<Awaited<T>> {
  console.debug(`Use case step ${stepName} starts now.`)

  // Create Open Telemetry custom span
  const span = tracer.startSpan(stepName)

  // Execute step function
  const res = await stepFunction()

  span.end()

  return res
}

function multiply(value: number) {
  return value * 2
}

const res = await runUseCaseStep('Multiply', multiply.bind(null, 2))

assertEquals(res, 4)
```
