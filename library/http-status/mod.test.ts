import { HTTPStatus, httpStatusText } from './mod.ts'
import { assertEquals } from 'jsr:@std/assert@^1'

Deno.test({
  name: 'HTTPStatus',
  fn() {
    assertEquals(HTTPStatus.OK, 200)
    assertEquals(HTTPStatus.NoContent, 204)
    assertEquals(HTTPStatus.NotFound, 404)
    assertEquals(HTTPStatus.InternalServerError, 500)
  },
})

Deno.test({
  name: 'httpStatusText',
  fn() {
    assertEquals(httpStatusText(HTTPStatus.OK), 'OK')
    assertEquals(httpStatusText(HTTPStatus.NoContent), 'NoContent')
    assertEquals(httpStatusText(HTTPStatus.NotFound), 'NotFound')
    assertEquals(
      httpStatusText(HTTPStatus.InternalServerError),
      'InternalServerError',
    )
    assertEquals(
      httpStatusText(1),
      'UnknownError',
    )
  },
})
