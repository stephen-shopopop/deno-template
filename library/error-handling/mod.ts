/**
 * @module
 */

import { HTTPStatus } from '@oneday/http-status'
import { context } from '@oneday/global-context'
import { inspect } from 'node:util'
import process from 'node:process'
import diagnostics_channel from 'node:diagnostics_channel'

type Observer = (value: AppError) => void

const channels = {
  /**
   * ```ts
   * import diagnostics_channel from 'node:diagnostics_channel'
   *
   * diagnostics_channel.subscribe('error-handling:handleError', (message, name) => {
   *  console.log(message, name)
   * })
   * ```
   */
  handleError: diagnostics_channel.channel('error-handling:handleError'),
  /**
   * ```ts
   * import diagnostics_channel from 'node:diagnostics_channel'
   *
   * diagnostics_channel.subscribe('error-handling:error', (message, name) => {
   *  console.log(message, name)
   * })
   * ```
   */
  error: diagnostics_channel.channel('error-handling:error'),
}

export class AppError extends Error {
  readonly context: Record<PropertyKey, unknown> | undefined

  constructor(
    public override name: string,
    public override message: string,
    public HttpStatus: HTTPStatus = HTTPStatus.InternalServerError,
    public override cause?: unknown,
  ) {
    super(message)

    this.context = context.getStore()
  }
}

class ErrorHandler {
  static #instance: ErrorHandler
  #observers: Array<Observer> = []

  // Prevent new with private constructor
  private constructor() {
    /** */
  }

  static getInstance(): ErrorHandler {
    if (!ErrorHandler.#instance) {
      ErrorHandler.#instance = new ErrorHandler()
    }

    return ErrorHandler.#instance
  }

  attach(func: Observer) {
    if (typeof func !== 'function' || this.#observers.includes(func)) {
      return
    }

    this.#observers.push(func)
  }

  detach(func: Observer) {
    this.#observers = this.#observers.filter((observer) => observer !== func)
  }

  notify(data: AppError) {
    for (const observer of this.#observers) {
      observer(data)
    }
  }

  #getObjectIfNotAlreadyObject(target: Readonly<unknown>): object {
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

  #getOneOfTheseProperties = <ReturnType>(
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

  convertUnknownToAppError(
    errorToHandle: Readonly<unknown>,
  ): AppError & object {
    if (errorToHandle instanceof AppError) {
      return errorToHandle
    }
    const errorToEnrich: object = ErrorHandler.#instance
      .#getObjectIfNotAlreadyObject(
        errorToHandle,
      )

    const message = ErrorHandler.#instance.#getOneOfTheseProperties(
      errorToEnrich,
      ['message', 'reason', 'description'],
      'Unknown error',
    )

    const name = ErrorHandler.#instance.#getOneOfTheseProperties(
      errorToEnrich,
      ['name', 'code'],
      'unknown-error',
    )

    const httpStatus = ErrorHandler.#instance.#getOneOfTheseProperties(
      errorToEnrich,
      ['HTTPStatus', 'statusCode', 'status'],
      HTTPStatus.InternalServerError,
    )

    const stackTrace = this.#getOneOfTheseProperties<string | undefined>(
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

  handleError(errorToHandle: Readonly<unknown>): HTTPStatus {
    try {
      const appError = ErrorHandler.#instance.convertUnknownToAppError(
        errorToHandle,
      )

      channels.handleError.publish({ errorToHandle, appError })

      ErrorHandler.#instance.notify(appError)

      return appError.HttpStatus
    } catch (handlingError) {
      channels.error.publish({ handlingError, errorToHandle })

      process.stdout.write('Error handler failed')
      process.stdout.write(inspect(handlingError))
      process.stdout.write(inspect(errorToHandle))

      return HTTPStatus.InternalServerError
    }
  }
}

export const errorHandler: Readonly<ErrorHandler> = Object.freeze(
  ErrorHandler.getInstance(),
)
