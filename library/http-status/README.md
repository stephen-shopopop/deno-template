# Library http-status

[![JSR @oneday](https://jsr.io/badges/@oneday/http-status)](https://jsr.io/@oneday/http-status)
[![JSR Score](https://jsr.io/badges/@oneday/http-status/score)](https://jsr.io/@oneday>/http-status)

- 🚀 Full-featured deno and node
- 🏄‍♀️ Simple usage

## Description

Enum of http status for typescript.

## Usage

Enum of http status for typescript

```ts
import { assertEquals } from 'jsr:@std/assert/equals'
import { HTTPStatus } from 'jsr:@oneday/http-status'

assertEquals(HTTPStatus.InternalServerError, 500)
```

_httpStatusText()_:

```ts
import { assertEquals } from 'jsr:@std/assert/equals'
import { httpStatusText } from 'jsr:@oneday/http-status'

assertEquals(httpStatusText(500), 'InternalServerError')
```
