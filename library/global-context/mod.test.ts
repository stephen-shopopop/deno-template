import { context } from './mod.ts'
import { describe, test } from '@std/testing/bdd'
import { expect } from '@std/expect'
import { assertSpyCall, assertSpyCalls, spy } from '@std/testing/mock'

describe('global-context', () => {
  test('When instantiating a new context with initial context, then should return the initial context', () => {
    // Arrange
    const getCurrentContext = spy(() => context.getStore())

    const initContext = { requestId: 'a' }

    // Act
    context.run({ ...initContext }, () => getCurrentContext())

    // Assert
    assertSpyCalls(getCurrentContext, 1)
    assertSpyCall(getCurrentContext, 0, {
      args: [],
      returned: {
        requestId: 'a',
      },
    })
  })

  test('When instantiating a new context object and add properties, then return keys/values of store', () => {
    // Arrange
    const requestId = crypto.randomUUID()
    const getCurrentContext = spy(() => context.getStore())

    let message: unknown

    // Act
    context.run({}, () => {
      context.set('requestId', requestId)

      getCurrentContext()

      message = context.get('requestId')
    })

    // Assert
    expect(message).toBe(requestId)
    assertSpyCalls(getCurrentContext, 1)
    assertSpyCall(getCurrentContext, 0, {
      args: [],
      returned: {
        requestId,
      },
    })
  })

  test('When no instantiating a new context, then return undefined', () => {
    // Arrange
    let user: unknown

    // Act
    context.run({}, () => {
      context.set('user', { id: 1234 })

      user = context.get('user')
    })

    // Assert
    expect(user).toEqual({ id: 1234 })
  })

  test('When no instantiating a new context, then return undefined', () => {
    // Arrange
    context.set('requestId', crypto.randomUUID())

    // Act
    const getStore = context.getStore()

    // Assert
    expect(getStore).toEqual(undefined)
  })
})
