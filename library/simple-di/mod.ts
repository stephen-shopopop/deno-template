/**
 * A lightweight, type-safe dependency injection library for Deno/TypeScript.
 *
 * This module provides a simple yet powerful dependency injection container with:
 * - **Strict type checking**: Constructor parameters are validated at compile time
 * - **Optional caching**: Control whether instances are reused or recreated
 * - **Manual injection**: Override services for testing with mock implementations
 * - **Disposable support**: Automatic cleanup of injected disposable resources
 *
 * @module
 *
 * @example Basic usage
 * ```ts
 * import { Dependency } from 'jsr:@oneday/simple-di';
 *
 * class UserService {
 *   constructor(public name: string, public age: number) {}
 * }
 *
 * const userDep = new Dependency(UserService, ['Alice', 30]);
 * console.log(userDep.resolve.name); // "Alice"
 * console.log(userDep.resolve.age); // 30
 * ```
 *
 * @example Testing with mocks
 * ```ts
 * import { Dependency } from 'jsr:@oneday/simple-di';
 *
 * class ApiService {
 *   async fetchData() {
 *     return await fetch('https://api.example.com/data');
 *   }
 * }
 *
 * class MockApiService {
 *   async fetchData() {
 *     return { json: () => ({ mock: true }) };
 *   }
 * }
 *
 * const apiDep = new Dependency(ApiService, []);
 *
 * // In production
 * const data = await apiDep.resolve.fetchData();
 *
 * // In tests
 * apiDep.injection(new MockApiService());
 * const mockData = await apiDep.resolve.fetchData();
 * ```
 *
 * @example Disposable pattern
 * ```ts
 * import { Dependency } from 'jsr:@oneday/simple-di';
 *
 * class Database implements Disposable {
 *   constructor(public url: string) {
 *     console.log(`Connected to ${url}`);
 *   }
 *
 *   [Symbol.dispose]() {
 *     console.log(`Disconnected from ${this.url}`);
 *   }
 * }
 *
 * const dbDep = new Dependency(Database, ['postgresql://prod']);
 *
 * {
 *   using _ = dbDep;
 *   dbDep.injection(new Database('postgresql://test'));
 *   // Use test database...
 * } // Automatically calls [Symbol.dispose]() on the test database
 *
 * console.log(dbDep.resolve.url); // "postgresql://prod"
 * ```
 */

export { Dependency } from './dependencies.ts'
