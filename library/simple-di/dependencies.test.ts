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
