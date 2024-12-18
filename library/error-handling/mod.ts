/**
 * @module
 */

import { HTTPStatus } from 'jsr:@oneday/http-status'
import { context } from 'jsr:@oneday/global-context'
import { inspect } from 'node:util'
import process from 'node:process'

export interface ErrorHandler {
  handleError: (errorToHandle: unknown) => HTTPStatus
}

export class AppError extends Error {
  readonly context: Record<PropertyKey, unknown> | undefined

  constructor(
    public override name: string,
    public override message: string,
    public HttpStatus: HTTPStatus = HTTPStatus.InternalServerError,
  ) {
    super(message)

    this.context = context.getStore()
  }
}

function getObjectIfNotAlreadyObject(target: unknown): object {
  if (typeof target === 'string') {
    return {
      message: target,
    }
  }

  if (typeof target === 'object' && target !== null) {
    return target
  }

  return {}
}

const getOneOfTheseProperties = <ReturnType>(
  object: Readonly<object>,
  possibleExistingProperties: Readonly<string[]>,
  defaultValue: ReturnType,
): ReturnType => {
  for (const property of possibleExistingProperties) {
    if (property in object) {
      return Reflect.get(object, property)
    }
  }

  return defaultValue
}

/**
 * Convert unknown to class AppError with object
 */
export function convertUnknownToAppError(
  errorToHandle: unknown,
): AppError & object {
  if (errorToHandle instanceof AppError) {
    return errorToHandle
  }
  const errorToEnrich: object = getObjectIfNotAlreadyObject(errorToHandle)

  const message = getOneOfTheseProperties(
    errorToEnrich,
    ['message', 'reason', 'description'],
    'Unknown error',
  )

  const name = getOneOfTheseProperties(
    errorToEnrich,
    ['name', 'code'],
    'unknown-error',
  )

  const httpStatus = getOneOfTheseProperties(
    errorToEnrich,
    ['HTTPStatus', 'statusCode', 'status'],
    HTTPStatus.InternalServerError,
  )

  const stackTrace = getOneOfTheseProperties<string | undefined>(
    errorToEnrich,
    ['stack'],
    undefined,
  )

  const standardError = new AppError(name, message, httpStatus)
  standardError.stack = stackTrace

  const standardErrorWithOriginProperties = Object.assign(
    standardError,
    errorToEnrich,
  )

  return standardErrorWithOriginProperties
}

export const errorHandler: ErrorHandler = Object.freeze({
  handleError: (errorToHandle: unknown): HTTPStatus => {
    try {
      const appError = convertUnknownToAppError(errorToHandle)

      return appError.HttpStatus
    } catch (handlingError) {
      process.stdout.write('Error handler failed')
      process.stdout.write(inspect(handlingError))
      process.stdout.write(inspect(errorToHandle))

      return HTTPStatus.InternalServerError
    }
  },
})
