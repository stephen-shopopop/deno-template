#!/usr/bin/env deno run --allow-env --allow-run
import { HTTPStatus } from '@library/http-status'

/**
 * Adds x and y.
 *
 * # Examples
 *
 * ```ts
 * import { assertEquals } from "jsr:@std/assert/equals";
 *
 * const sum = add(1, 2);
 * assertEquals(sum, 3);
 * ```
 */
export function add(x: number, y: number): number {
  return x + y
}

console.log(add(1, 2))

console.log(HTTPStatus.OK)
