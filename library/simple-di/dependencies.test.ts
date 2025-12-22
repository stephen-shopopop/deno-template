import { assertEquals, assertInstanceOf } from '@std/assert'
import { Dependency } from './mod.ts'
import { assertType, type IsExact } from '@std/testing/types'

Deno.test({
  name: 'Class Dependency with simple class',
  fn() {
    // Arrange
    class User {}

    // Act
    const user = new Dependency(User)

    // Assert
    assertInstanceOf(user.resolve, User)
    assertType<IsExact<typeof user.resolve, User>>(true)
  },
})

Deno.test({
  name: 'Class Dependency with simple class',
  fn() {
    // Arrange
    class User {}

    // Act
    const user = new Dependency(User)

    // Assert
    assertInstanceOf(user.resolve, User)
    assertType<IsExact<typeof user.resolve, User>>(true)
  },
})

Deno.test({
  name: 'Class Dependency with constructor class',
  fn() {
    // Arrange
    class User {
      constructor(public value: string) {}
    }

    // Act
    const user = new Dependency(User, ['hello'])

    // Act
    assertInstanceOf(user.resolve, User)
    assertType<IsExact<typeof user.resolve, User>>(true)
    assertEquals(user.resolve.value, 'hello')
  },
})

Deno.test({
  name: 'Class Dependency injected class',
  fn() {
    // Arrange
    class User {
      constructor(public value: string) {}
    }

    class UserInject {
      constructor(public value: string) {}
    }

    // Act
    const user = new Dependency(User, ['hello'])
    user.injection(new UserInject('world'))

    // Assert
    assertInstanceOf(user.resolve, UserInject)
    assertType<IsExact<typeof user.resolve, UserInject>>(true)
    assertEquals(user.resolve.value, 'world')
  },
})

Deno.test({
  name: 'Class Dependency clear injected class',
  fn() {
    // Arrange
    class User {
      constructor(public value: string) {}
    }

    class UserInject {
      constructor(public value: string) {}
    }

    // Act
    const user = new Dependency(User, ['hello'])
    user.injection(new UserInject('world'))
    user.clearInjected()

    // Assert
    assertInstanceOf(user.resolve, User)
    assertType<IsExact<typeof user.resolve, User>>(true)
    assertEquals(user.resolve.value, 'hello')
  },
})

Deno.test({
  name: 'Class Dependency cacheable default activate',
  fn() {
    // Arrange
    class User {
      constructor(public value: string) {}
    }

    // Act
    const user = new Dependency(User, ['hello'])
    user.resolve.value = 'john'

    // Assert
    assertInstanceOf(user.resolve, User)
    assertType<IsExact<typeof user.resolve, User>>(true)
    assertEquals(user.resolve.value, 'john')
  },
})

Deno.test({
  name: 'Class Dependency cacheable disable',
  fn() {
    // Arrange
    class User {
      constructor(public value: string) {}
    }

    // Act
    const user = new Dependency(User, ['hello'], false)
    user.resolve.value = 'john'

    // Assert
    assertInstanceOf(user.resolve, User)
    assertType<IsExact<typeof user.resolve, User>>(true)
    assertEquals(user.resolve.value, 'hello')
  },
})

Deno.test({
  name: 'Class Dependency with Disposable service injected',
  fn() {
    // Arrange
    let disposedOriginal = false
    let disposedInjected = false

    class DisposableService implements Disposable {
      constructor(public value: string) {}

      [Symbol.dispose]() {
        disposedOriginal = true
      }
    }

    class InjectedDisposableService implements Disposable {
      constructor(public value: string) {}

      [Symbol.dispose]() {
        disposedInjected = true
      }
    }

    // Act
    {
      using service = new Dependency(DisposableService, ['test'])

      // Inject a disposable service
      service.injection(new InjectedDisposableService('injected'))

      // Assert
      assertInstanceOf(service.resolve, InjectedDisposableService)
      assertEquals(service.resolve.value, 'injected')
      assertEquals(disposedOriginal, false)
      assertEquals(disposedInjected, false)
    }

    // After the block, ONLY the injected service should be disposed
    assertEquals(disposedOriginal, false) // NOT disposed (created by constructor)
    assertEquals(disposedInjected, true) // Disposed (manually injected)
  },
})

Deno.test({
  name: 'Class Dependency implements Disposable',
  fn() {
    // Arrange
    class User {
      constructor(public value: string) {}
    }

    // Act
    using user = new Dependency(User, ['hello'])

    // Assert
    assertInstanceOf(user.resolve, User)
    assertEquals(user.resolve.value, 'hello')

    // Verify Dependency implements Disposable
    assertEquals(typeof user[Symbol.dispose], 'function')
  },
})

Deno.test({
  name: 'Class Dependency dispose only clears injected reference',
  fn() {
    // Arrange
    let disposedInjected = false

    class User {
      counter = 0
    }

    class InjectedUser implements Disposable {
      counter = 100;

      [Symbol.dispose](): void {
        disposedInjected = true
      }
    }

    // Act
    const user = new Dependency(User, [])
    user.resolve.counter = 42

    assertEquals(user.resolve.counter, 42) // Same cached instance

    // Inject a disposable service
    user.injection(new InjectedUser())
    assertEquals(user.resolve.counter, 100) // Injected service

    // Dispose manually
    user[Symbol.dispose]()

    // The injected service should be disposed
    assertEquals(disposedInjected, true)

    // After dispose, should return to the original cached service
    assertEquals(user.resolve.counter, 42) // Original cached instance
  },
})
