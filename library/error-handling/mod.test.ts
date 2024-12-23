import { HTTPStatus } from '@oneday/http-status'
import { AppError, errorHandler } from './mod.ts'
import { assertInstanceOf, assertObjectMatch } from '@std/assert'

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
