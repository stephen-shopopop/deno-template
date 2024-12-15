# Library global-context

[![JSR @oneday](https://jsr.io/badges/@oneday/global-context)](https://jsr.io/@oneday/global-context)
[![JSR Score](https://jsr.io/badges/@oneday/global-context/score)](https://jsr.io/@oneday>/global-context)

- 🚀 Full-featured deno and node
- 🏄‍♀️ Simple usage

## Description

This class creates stores that stay coherent through asynchronous operations.

## Usage

### context.run

Start an local storage context. Once this method is called, a new context is created, for which get and set calls will operate on a set of entities, unique to this context.

### context.set

Sets a variable for a given key within running context. If this is called outside of a running context, it will not store the value.

### context.get

Gets a variable previously set within a running context. If this is called outside of a running context, it will not retrieve the value.

### context.getStore()

Gets all variables previously set within a running context. If this is called outside of a running context, it will not retrieve the value.t: "Internal Server Error"

## Basic usage

```typescript ignore
import { assertEquals } from 'jsr:@std/assert/equals'
import { context } from 'jsr:@oneday/global-context'

const id = crypto.randomUUID()

context.run({ requestId: id }, () => {
  context.set('user', { id: '1234', email: 'oneday@oneday.com' })
  context.set('metadata', { message: 'hello' })

  assertEquals(context.get('user'), { id: '1234', email: 'oneday@oneday.com' })
  assertEquals(context.get('metadata')?.message, 'hello')
  assertEquals(context.getStore(), {
    user: { id: '1234', email: 'oneday@oneday.com' },
    metadata: { message: 'hello' },
    requestId: id,
  })
})
```

### http server

```typescript ignore
import * as http from 'node:http'
import { assertEquals } from 'jsr:@std/assert/equals'
import { context } from 'jsr:@oneday/global-context'

http.createServer((req, res) => {
  context.run({}, () => {
    context.set('user', { id: 24 })

    assertEquals(context.getStore()?.user, { id: '1234' })

    res.write(context.get('user'))
    res.end()
  })
}).listen(8080)
```

### Handle an event

```typescript ignore
import { EventEmitter } from 'node:events'
import { assertEquals } from 'jsr:@std/assert/equals'
import { context } from 'jsr:@oneday/global-context'

async function handle(): Promise<void> {
  await context.run({ user: { id: 24 } }, async () => {
    context.set('metadata', { message: 'hello' })

    await Promise.resolve()

    assertEquals(context.get('user'), { id: '1234' })
  })
}

const emitter = new EventEmitter()

emitter.on('event', () => {
  handle().catch((error) => console.error(error))
})
```
