# Simple Dependency Injection

A lightweight, type-safe dependency injection library for Deno/TypeScript with support for the Disposable pattern.

## Features

- ✅ **Strict typing**: Constructor argument types are validated at compile time
- 🔄 **Optional caching**: Control whether instances are reused or recreated
- 💉 **Manual injection**: Override services for testing with mock implementations
- 🎯 **Type inference**: TypeScript automatically infers parameter types
- 🧹 **Disposable support**: Automatic cleanup of **injected** disposable resources

## Installation

```typescript
import { Dependency } from 'jsr:@oneday/simple-di'
```

## Quick Start

```typescript
import { Dependency } from 'jsr:@oneday/simple-di'

class UserService {
  constructor(public name: string, public age: number) {}

  greet() {
    return `Hello, I'm ${this.name}, ${this.age} years old`
  }
}

const userDep = new Dependency(UserService, ['Alice', 30])
console.log(userDep.resolve.greet()) // "Hello, I'm Alice, 30 years old"
```

## Usage Examples

### Class without parameters

```typescript
class LoggerService {
  log(message: string) {
    console.log(`[LOG] ${message}`)
  }
}

// Arguments are optional for classes without parameters
const logger = new Dependency(LoggerService)
logger.resolve.log('Hello World') // "[LOG] Hello World"
```

### Class with parameters (strict typing)

```typescript
class UserService {
  constructor(public name: string, public age: number) {}
}

// ✅ Correct: types and number of arguments match
const user = new Dependency(UserService, ['John', 25])

// ❌ COMPILE ERROR: missing parameters
// const user = new Dependency(UserService)

// ❌ COMPILE ERROR: incorrect types
// const user = new Dependency(UserService, [123, 'invalid'])

// ❌ COMPILE ERROR: too many parameters
// const user = new Dependency(UserService, ['John', 25, 'extra'])
```

### Optional parameters

```typescript
class ProductService {
  constructor(
    public id: number,
    public name: string,
    public price?: number,
  ) {}
}

// Both are valid because price is optional
const product1 = new Dependency(ProductService, [1, 'Laptop'])
const product2 = new Dependency(ProductService, [1, 'Laptop', 999.99])
```

### Cache management

```typescript
class CounterService {
  counter = 0
  increment() {
    this.counter++
  }
}

// Cache enabled by default (3rd parameter = true)
const cached = new Dependency(CounterService, [], true)
cached.resolve.increment()
cached.resolve.increment()
console.log(cached.resolve.counter) // 2 (same instance)

// Cache disabled
const notCached = new Dependency(CounterService, [], false)
notCached.resolve.increment()
notCached.resolve.increment()
console.log(notCached.resolve.counter) // 1 (new instance each time)
```

### Manual injection for testing

```typescript
class UserRepository {
  constructor(public dbUrl: string) {}

  async findUser(id: number) {
    // Real database call
    return await fetch(`${this.dbUrl}/users/${id}`)
  }
}

class MockUserRepository {
  async findUser(id: number) {
    // Mock data
    return { id, name: 'Mock User' }
  }
}

// Production code
const userRepo = new Dependency(UserRepository, ['postgresql://prod-db'])
const realUser = await userRepo.resolve.findUser(1)

// Test code
userRepo.injection(new MockUserRepository())
const mockUser = await userRepo.resolve.findUser(1) // Returns mock data

// Back to production
userRepo.clearInjected()
const realUser2 = await userRepo.resolve.findUser(2) // Real database call
```

### Disposable pattern (injected services only)

**⚠️ Important:** The Disposable pattern applies **only to manually injected services**, not to services created by the constructor.

The `Dependency` class implements `Disposable` to automatically clean up injected resources:

```typescript
class DatabaseConnection implements Disposable {
  private connected = false

  constructor(public connectionString: string) {
    this.connected = true
    console.log(`📡 Connected to: ${connectionString}`)
  }

  query(sql: string) {
    if (!this.connected) {
      throw new Error('Database connection is closed')
    }
    return `Query result: ${sql}`
  }

  [Symbol.dispose]() {
    if (this.connected) {
      console.log(`🔌 Disconnecting from: ${this.connectionString}`)
      this.connected = false
    }
  }
}

// Production dependency
const dbDep = new Dependency(DatabaseConnection, ['postgresql://prod-db'])

{
  using _ = dbDep

  // Inject a test database connection
  const testDb = new DatabaseConnection('postgresql://test-db')
  dbDep.injection(testDb)
  // 📡 Connected to: postgresql://test-db

  dbDep.resolve.query('SELECT * FROM users')
} // 🔌 Disconnecting from: postgresql://test-db (automatically disposed)

// The production database is still available (NOT disposed)
console.log(dbDep.resolve.connectionString) // "postgresql://prod-db"
```

### Why only injected services?

This design allows you to:

1. **Keep production services cached and available** for the lifetime of your application
2. **Automatically clean up temporary mocks/stubs** used in tests
3. **Avoid unexpected resource disposal** of long-lived services

```typescript
// ✅ Good: Test mock is disposed after use
const apiDep = new Dependency(ApiService, ['https://api.prod.com'])

{
  using _ = apiDep
  const mockApi = new MockApiService() // Disposable mock
  apiDep.injection(mockApi)
  // Run tests...
} // Mock is disposed, production service remains

// ❌ Bad design (not implemented): Production service would be disposed
// const apiDep = new Dependency(DisposableApiService, ['https://api.prod.com'])
// {
//   using _ = apiDep
//   apiDep.resolve.fetch('/data')
// } // Would dispose production service unexpectedly!
```

### Multiple disposable injections

```typescript
class TestDatabase implements Disposable {
  constructor(public name: string) {
    console.log(`🔧 Created ${name}`)
  }

  [Symbol.dispose]() {
    console.log(`🧹 Cleaned up ${this.name}`)
  }
}

const dbDep = new Dependency(TestDatabase, ['production'])

{
  using _ = dbDep

  // First injection
  dbDep.injection(new TestDatabase('test-1'))
  // 🔧 Created test-1

  // Second injection (replaces first, but first is not disposed yet)
  dbDep.injection(new TestDatabase('test-2'))
  // 🔧 Created test-2
} // 🧹 Cleaned up test-2 (only the last injected service is disposed)

// Production instance still available
console.log(dbDep.resolve.name) // "production"
```

### Programmatic cleanup with `clearInjected()`

```typescript
class DisposableMock implements Disposable {
  [Symbol.dispose]() {
    console.log('🧹 Mock cleaned up')
  }
}

const dep = new Dependency(RealService, ['config'])

// Inject a mock
dep.injection(new DisposableMock())

// Manually clear and dispose the mock
dep.clearInjected()
// 🧹 Mock cleaned up

// Back to real service
console.log(dep.resolve) // RealService instance
```

## API Reference

### Constructor

#### `new Dependency(serviceInitializer, args?, cacheable?)`

Creates a new `Dependency` instance.

**Parameters:**

- `serviceInitializer`: The class constructor to instantiate
- `args`: Array of constructor arguments (optional if class has no required parameters)
  - TypeScript enforces strict type checking on these arguments
- `cacheable`: Enable instance caching (default: `true`)

**Type Safety:**

The constructor uses TypeScript's `ConstructorParameters<T>` to enforce type-safe arguments:

- For classes without parameters: `args` is optional
- For classes with parameters: `args` is **required** and must match the constructor signature exactly

**Examples:**

```typescript
// No parameters
new Dependency(LoggerService)
new Dependency(LoggerService, [])

// With parameters
new Dependency(UserService, ['Alice', 30])

// With caching control
new Dependency(UserService, ['Bob', 25], true) // cached
new Dependency(UserService, ['Charlie', 35], false) // not cached
```

### Methods

#### `injection(service: Service): this`

Manually injects a service instance, overriding the default service.

**Use Cases:**

- Inject mocks or stubs for testing
- Temporarily replace a service with an alternative implementation
- Inject disposable resources that should be cleaned up automatically

**Disposable Behavior:**

- If the injected service implements `Disposable`, it will be automatically disposed when:
  - `clearInjected()` is called
  - `[Symbol.dispose]()` is called (via `using` keyword or manually)

**Returns:** The `Dependency` instance for method chaining

**Example:**

```typescript
const userRepo = new Dependency(UserRepository, ['prod-db'])

// Inject a mock
userRepo.injection(new MockUserRepository())
console.log(userRepo.resolve) // MockUserRepository instance

// Chain multiple operations
userRepo.injection(new MockUserRepository()).clearInjected()
```

#### `clearInjected(): this`

Clears the manually injected service and returns to the original service.

**Disposable Behavior:**

- If the injected service implements `Disposable`, its `[Symbol.dispose]()` method is called before clearing

**Returns:** The `Dependency` instance for method chaining

**Example:**

```typescript
const dep = new Dependency(RealService, ['config'])

dep.injection(new MockService())
console.log(dep.resolve) // MockService

dep.clearInjected()
console.log(dep.resolve) // RealService (original)
```

### Properties

#### `resolve` (getter)

Resolves and returns the service instance.

**Resolution Priority:**

1. **Injected service** (if exists) - highest priority
2. **Cached service** (if caching enabled and instance exists)
3. **New service** - created from constructor arguments

**Returns:** The resolved service instance

**Example:**

```typescript
const dep = new Dependency(UserService, ['Alice', 30])

// First call - creates and caches instance
const user1 = dep.resolve

// Second call - returns cached instance (if caching enabled)
const user2 = dep.resolve

console.log(user1 === user2) // true (with caching)
```

#### `[Symbol.dispose](): void`

Disposes the dependency and cleans up resources.

**Behavior:**

- Clears the injected service reference
- If the injected service implements `Disposable`, calls its `[Symbol.dispose]()` method
- **Does NOT** dispose services created by the constructor
- Automatically called when using the `using` keyword

**Example:**

```typescript
// Automatic disposal with 'using'
{
  using dep = new Dependency(RealService, ['config'])
  dep.injection(new DisposableMock())
  // Use mock...
} // Automatically disposes the mock

// Manual disposal
const dep = new Dependency(RealService, ['config'])
dep.injection(new DisposableMock())
dep[Symbol.dispose]() // Manually dispose
```

## Key Benefits

### Strict Type Safety

The system uses `ConstructorParameters<T>` to extract and validate constructor parameter types at compile time.

**Benefits:**

1. **Compile-time safety**: Type errors are caught before execution
2. **IDE autocomplete**: Full IntelliSense support for constructor arguments
3. **Safe refactoring**: TypeScript warns you everywhere when constructor signatures change
4. **Self-documenting**: Types serve as always up-to-date documentation

**Example:**

```typescript
class ApiService {
  constructor(
    public baseUrl: string,
    public timeout: number,
    public retries?: number,
  ) {}
}

// ✅ TypeScript knows exactly what's expected
const api = new Dependency(ApiService, [
  'https://api.example.com',
  3000,
  3,
])

// ❌ Compile error: Argument of type 'number' is not assignable to parameter of type 'string'
const api2 = new Dependency(ApiService, [3000, 'https://api.example.com'])
```

### Smart Disposable Pattern

**Design Philosophy:**

- **Production services**: Long-lived, should not be disposed
- **Test mocks**: Short-lived, should be automatically cleaned up
- **Injected resources**: Temporary overrides, perfect for automatic disposal

**Benefits:**

1. **No memory leaks**: Temporary mocks are automatically cleaned up
2. **Production safety**: Long-lived services are never accidentally disposed
3. **Exception safety**: Resources are disposed even if exceptions occur
4. **Predictable behavior**: Only manually injected services are affected

**Pattern:**

```typescript
// ✅ Recommended: Clean up test resources
const service = new Dependency(ProductionService, ['config'])

// In tests
{
  using _ = service
  service.injection(new DisposableTestMock())
  // Run tests...
} // Test mock is automatically cleaned up

// Production service still works
service.resolve.doWork()
```

### Flexible Caching

Control instance lifecycle to match your needs:

```typescript
// Singleton pattern (default)
const singleton = new Dependency(Service, ['config'], true)
const a = singleton.resolve
const b = singleton.resolve
console.log(a === b) // true

// Factory pattern
const factory = new Dependency(Service, ['config'], false)
const c = factory.resolve
const d = factory.resolve
console.log(c === d) // false
```

## Requirements

- Deno 1.40+ (for `using` keyword and `Disposable` support)
- TypeScript 5.2+ (for `using` keyword support)

## License

MIT
