import { assertEquals } from 'jsr:@std/assert@^1'

// Compact form: name and function
Deno.test('hello world #1', () => {
  const x = 1 + 2

  assertEquals(x, 3)
})
