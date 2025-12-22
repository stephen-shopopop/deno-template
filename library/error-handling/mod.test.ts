import { HTTPStatus } from '@oneday/http-status'
import { AppError, errorHandler } from './mod.ts'
import { assertEquals, assertInstanceOf, assertObjectMatch } from '@std/assert'
import { assertSpyCall, assertSpyCalls, spy, stub } from '@std/testing/mock'
import diagnostics_channel from 'node:diagnostics_channel'
import process from 'node:process'

Deno.test({
  name: 'Class AppError',
  fn() {
    assertObjectMatch(
      new AppError(
        'ResourceNotFound',
        'User resource not found',
      ),
      {
        name: 'ResourceNotFound',
        message: 'User resource not found',
        isOperational: false,
        HttpStatus: HTTPStatus.InternalServerError,
      },
    )

    assertObjectMatch(
      new AppError(
        'ResourceNotFound',
        'User resource not found',
        true,
        HTTPStatus.NotFound,
      ),
      {
        name: 'ResourceNotFound',
        message: 'User resource not found',
        isOperational: true,
        HttpStatus: HTTPStatus.NotFound,
      },
    )

    assertInstanceOf(
      new AppError(
        'ResourceNotFound',
        'User resource not found',
      ),
      Error,
    )
  },
})

Deno.test({
  name: 'errorHandler: convertUnknownToAppError',
  fn() {
    assertObjectMatch(
      errorHandler.convertUnknownToAppError(
        new Error('User resource not found'),
      ),
      {
        name: 'Error',
        message: 'User resource not found',
        isOperational: false,
        HttpStatus: HTTPStatus.InternalServerError,
      },
    )

    assertObjectMatch(
      errorHandler.convertUnknownToAppError(
        new Date(),
      ),
      {
        name: 'unknown-error',
        message: 'Unknown error',
        isOperational: false,
        HttpStatus: HTTPStatus.InternalServerError,
        stack: undefined,
      },
    )

    assertObjectMatch(
      errorHandler.convertUnknownToAppError(
        Number.NaN,
      ),
      {
        name: 'unknown-error',
        message: 'Unknown error',
        isOperational: false,
        HttpStatus: HTTPStatus.InternalServerError,
        stack: undefined,
      },
    )

    assertObjectMatch(
      errorHandler.convertUnknownToAppError(
        Number.POSITIVE_INFINITY,
      ),
      {
        name: 'unknown-error',
        message: 'Unknown error',
        isOperational: false,
        HttpStatus: HTTPStatus.InternalServerError,
        stack: undefined,
      },
    )

    assertObjectMatch(
      errorHandler.convertUnknownToAppError(
        false,
      ),
      {
        name: 'unknown-error',
        message: 'Unknown error',
        isOperational: false,
        HttpStatus: HTTPStatus.InternalServerError,
        stack: undefined,
      },
    )

    assertObjectMatch(
      errorHandler.convertUnknownToAppError(
        () => undefined,
      ),
      {
        name: 'unknown-error',
        message: 'Unknown error',
        isOperational: false,
        HttpStatus: HTTPStatus.InternalServerError,
        stack: undefined,
      },
    )

    assertObjectMatch(
      errorHandler.convertUnknownToAppError(
        {},
      ),
      {
        name: 'unknown-error',
        message: 'Unknown error',
        isOperational: false,
        HttpStatus: HTTPStatus.InternalServerError,
        stack: undefined,
      },
    )

    assertObjectMatch(
      errorHandler.convertUnknownToAppError(
        {
          code: 'UnreachableDB',
          description: 'Not processable',
          status: 422,
          operational: true,
        },
      ),
      {
        name: 'UnreachableDB',
        message: 'Not processable',
        isOperational: true,
        HttpStatus: HTTPStatus.UnprocessableEntity,
        stack: undefined,
      },
    )

    assertObjectMatch(
      errorHandler.convertUnknownToAppError(
        '',
      ),
      {
        name: 'unknown-error',
        message: '',
        isOperational: false,
        HttpStatus: HTTPStatus.InternalServerError,
        stack: undefined,
      },
    )

    assertObjectMatch(
      errorHandler.convertUnknownToAppError(
        new AppError(
          'ResourceNotFound',
          'User resource not found',
          true,
          HTTPStatus.NotFound,
        ),
      ),
      {
        name: 'ResourceNotFound',
        message: 'User resource not found',
        isOperational: true,
        HttpStatus: HTTPStatus.NotFound,
      },
    )
  },
})

Deno.test({
  name: 'errorHandler:attach with notify',
  fn() {
    // Arrange
    const appError = new AppError('ResourceNotFound', 'User resource not found')
    const func = spy()

    errorHandler.attach(func)

    // Act
    errorHandler.notify(appError)

    // Assert
    assertSpyCalls(func, 1)
    assertSpyCall(func, 0, {
      args: [
        appError,
      ],
      returned: undefined,
    })
  },
})

Deno.test({
  name: 'errorHandler:detach with notify',
  fn() {
    // Arrange
    const appError = new AppError('ResourceNotFound', 'User resource not found')
    const func = spy()

    errorHandler.attach(func)
    errorHandler.detach(func)

    // Act
    errorHandler.notify(appError)

    // Assert
    assertSpyCalls(func, 0)
  },
})

Deno.test({
  name: 'errorHandler:handleError with Error',
  fn() {
    // Arrange
    const func = spy()

    errorHandler.attach(func)

    // Act
    const httpStatus = errorHandler.handleError(new Error('Technical error'))

    // Assert
    assertEquals(httpStatus, HTTPStatus.InternalServerError)
    assertSpyCalls(func, 1)
  },
})

Deno.test({
  name: 'errorHandler:handleError with AppError',
  fn() {
    // Arrange
    const appError = new AppError(
      'ResourceNotFound',
      'User resource not found',
      true,
      HTTPStatus.NotFound,
    )
    const func = spy()

    errorHandler.attach(func)

    // Act
    const httpStatus = errorHandler.handleError(appError)

    // Assert
    assertEquals(httpStatus, HTTPStatus.NotFound)
    assertSpyCalls(func, 1)
    assertSpyCall(func, 0, {
      args: [
        appError,
      ],
      returned: undefined,
    })
  },
})

Deno.test({
  name: 'errorHandler:handleError diagnostics_channel',
  fn() {
    // Arrange
    let errorHandling: unknown
    let errorToHandle: unknown

    const appError = new AppError('ResourceNotFound', 'User resource not found')

    diagnostics_channel.subscribe(
      'error-handling:handleError',
      (message) => {
        errorHandling = (message as { appError: unknown })?.appError
        errorToHandle = (message as { errorToHandle: unknown })?.errorToHandle
      },
    )
    // Act
    errorHandler.handleError(appError)

    // Assert
    assertEquals(errorHandling, appError)
    assertEquals(errorToHandle, appError)
  },
})

Deno.test({
  name: 'error-handling:error diagnostics_channel',
  fn() {
    // Arrange
    stub(process.stdout, 'write')

    let errorHandling: unknown
    let errorToHandle: unknown

    const appError = new AppError('ResourceNotFound', 'User resource not found')

    diagnostics_channel.subscribe(
      'error-handling:error',
      (message) => {
        errorHandling = (message as { handlingError: unknown })?.handlingError
        errorToHandle = (message as { errorToHandle: unknown })?.errorToHandle
      },
    )

    errorHandler.attach((error: AppError) => {
      throw error
    })

    // Act
    errorHandler.handleError(appError)

    // Assert
    assertEquals(errorHandling, appError)
    assertEquals(errorToHandle, appError)
  },
})
