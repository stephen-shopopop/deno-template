import { assertEquals } from "https://deno.land/std@0.123.0/testing/asserts.ts";
import { upperString } from "./mod.ts";

// Compact form: name and function
Deno.test("hello world #1", () => {
  const x = 1 + 2;
  assertEquals(x, 3);
});

Deno.test("hello world #2", () => {
  const x = upperString("Hello world!");
  assertEquals(x, "HELLO WORLD!");
});
