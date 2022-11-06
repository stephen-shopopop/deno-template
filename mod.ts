#!/usr/bin/env deno run --allow-env --allow-run

/**
 * Adds x and y.
 * @param {number} x
 * @param {number} y
 * @returns {number} Sum of x and y
 */
export function add(x: number, y: number): number {
  return x + y;
}

/**
 * Uppercase string
 * @param {string} value
 * @returns {string} uppercase
 *
 * ```ts
 * const t = test('hello)
 * ```
 */
export function upperString(value: string): string {
  return value.toUpperCase();
}

console.log(upperString("Hello world!"));

console.log(add(9, 5));
