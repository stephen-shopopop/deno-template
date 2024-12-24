/**
 * @module
 *
 * ## AppError
 *
 * ### Extend the built-in Error object
 *
 * Use only the built-in Error object - centralized error object that derives from Error
 *
 * Some libraries throw errors as a string or as some custom type – this complicates the error handling logic and the interoperability between modules.
 * Instead, create app error object/class that extends the built-in Error object and use it whenever rejecting, throwing or emitting an error.
 * The app error should add useful imperative properties like the error name/code and isOperational.
 * By doing so, all errors have a unified structure and support better error handling.
 *
 * ### Distinguish catastrophic errors from operational errors
 *
 * Operational errors (e.g. API received an invalid input) refer to known cases where the error impact is fully understood and can be handled thoughtfully.
 * On the other hand, catastrophic error (also known as programmer errors) refers to unusual code failures that dictate to gracefully restart the application
 *
 * ### Example
 *
 * ```typescript ignore
 * import { AppError } from 'jsr:@oneday/error-handling';
 * import { HTTPStatus } from "jsr:@oneday/http-status";
 *
 * // client throwing an exception
 * throw new AppError(commonErrors.resourceNotFound,'further explanation', true, HTTPStatus.NotFound);
 * ```
 *
 * ## errorHandler
 *
 * Handle errors centrally
 *
 * Without one dedicated object for error handling, greater are the chances for inconsistent errors handling:
 * Errors thrown within web requests might get handled differently from those raised during the startup phase and those raised by scheduled jobs.
 * This might lead to some types of errors that are being mismanaged.
 * This single error handler object is responsible for making the error visible,
 * for example, by writing to a well-formatted logger, firing metrics using some monitoring product (like Prometheus, CloudWatch, DataDog, and Sentry)
 * and to decide whether the process should crash.
 * Most web frameworks provide an error catching middleware mechanism - A typical mistake is to place the error handling code within this middleware.
 * By doing so, you won't be able to reuse the same handler for errors that are caught in different scenarios like scheduled jobs, message queue subscribers, and uncaught exceptions.
 * Consequently, the error middleware should only catch errors and forward them to the handler.
 * A typical error handling flow might be: Some module throws an error -> API router catches the error -> it propagates the error to the middleware (e.g. or to other mechanism for catching request-level error) who is responsible for catching errors -> a centralized error handler is called.
 *
 * ### Example Hono
 *
 * ```typescript ignore
 * import * as logger from 'jsr:@std/log';
 * import { errorHandler } from 'jsr:@oneday/error-handling';
 * import { Hono, type Context } from 'hono';
 *
 * // Attach logger to errorHandler
 * errorHandler.attach(logger.error);
 *
 * // Hono middleware
 * export const defineErrorHonoMiddleware = (err: Error, c: Context): Response => {
 *  const appError = errorHandler.convertUnknownToAppError(err);
 *
 *  return c.json({
 *     error: {
 *       code: appError.isOperational
 *          ? appError.name
 *          : 'unknown-error',
 *       message: appError.isOperational
 *          ? appError.message
 *          : 'technical-error'
 *     }
 *   },
 *   errorHandler.handleError(appError)
 *  );
 * });
 *
 * const app = new Hono();
 *
 * app.onError(defineErrorHonoMiddleware);
 *
 * export default app;
 * ```
 *
 * ### Example Koa
 *
 * ```typescript ignore
 * import * as logger from 'jsr:@std/log';
 * import { errorHandler } from 'jsr:@oneday/error-handling';
 * import Koa, { Context, Next } from 'npm:koa';
 *
 * // Attach logger to errorHandler
 * errorHandler.attach(logger.error);
 *
 * export async function defineErrorHandlingKoaMiddleware (
 *  ctx: Context,
 *  next; Next
 * ): Promise<void> {
 *  try {
 *     await next()
 *  } catch (error) {
 *    const appError = errorHandler.convertUnknownToAppError(err);
 *
 *    ctx.response.status = errorHandler.handleError(appError);
 *    ctx.response.body = {
 *       error: {
 *         code: appError.isOperational
 *          ? appError.name
 *          : 'unknown-error',
 *         message: appError.isOperational
 *          ? appError.message
 *          : 'technical-error',
 *       }
 *     }
 *  }
 * };
 *
 * const app = new Koa();
 *
 * app.onError(defineErrorHandlingKoaMiddleware);
 *
 * export default app;
 * ```
 *
 *  ### Example Express
 *
 * ```typescript ignore
 * import * as logger from 'jsr:@std/log';
 * import { errorHandler } from 'jsr:@oneday/error-handling';
 * import express from 'npm:express';
 *
 * // Attach logger to errorHandler
 * errorHandler.attach(logger.error);
 *
 * export async function defineErrorHandlingExpressMiddleware (
 *  error: unknown,
 *  _req: express.Request,
 *  res: express.Response,
 *  _next: express.NextFunction
 * ): void {
 *    const appError = errorHandler.convertUnknownToAppError(err);
 *
 *    res
 *      .status(errorHandler.handleError(appError))
 *      .json({
 *        error: {
 *          code: appError.isOperational
 *            ? appError.name
 *            : 'unknown-error',
 *          message: appError.isOperational
 *            ? appError.message
 *            : 'technical-error',
 *          }
 *      })
 *      .end();
 * };
 *
 * const app = express();
 *
 * export default app;
 * ```
 *
 * ### Example eventEmitter
 *
 * ```typescript ignore
 * import { EventEmitter } from 'node:events';
 * import * as logger from 'jsr:@std/log';
 * import { errorHandler } from 'jsr:@oneday/error-handling';
 *
 * // Attach logger to errorHandler
 * errorHandler.attach(logger.error);
 *
 * async function handle(): Promise<void> {
 *   await Promise.resolve();
 * }
 *
 * const emitter = new EventEmitter();
 *
 * emitter.on('event', () => {
 *    handle().catch((error) => errorHandler.handleError(error));
 * })
 * ```
 *
 *  ### Example script
 *
 * ```typescript ignore
 * import { EventEmitter } from 'node:events';
 * import * as logger from 'jsr:@std/log';
 * import { errorHandler } from 'jsr:@oneday/error-handling';
 *
 * // Attach logger to errorHandler
 * errorHandler.attach(logger.error);
 *
 * async function start(): Promise<AddressInfo> {
 * // 🦉 Array of entry point is being used to support more entry-points kinds like message queue, scheduled job,
 *    const [, addressInfo] = await Promise.all([
 *      redisClient.connect(),
 *      startWebServer(),
 *    ])
 *
 *    return addressInfo;
 * }
 *
 * start()
 * .then((connection) => {
 *   logger.info(`Server is listening on port: ${connection.port}`)
 * })
 * .catch((error) => {
 *   errorHandler.handleError(error);
 *
 *  process.exit(1);
 * })
 * ```
 */

import { HTTPStatus } from '@oneday/http-status'
import { inspect } from 'node:util'
import process from 'node:process'
import diagnostics_channel from 'node:diagnostics_channel'

export type Observer = (value: AppError) => void

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

/**
 * Use only the built-in Error object - centralized error object that derives from Error
 *
 * Some libraries throw errors as a string or as some custom type – this complicates the error handling logic and the interoperability between modules.
 * Instead, create app error object/class that extends the built-in Error object and use it whenever rejecting, throwing or emitting an error.
 * The app error should add useful imperative properties like the error name/code and isOperational.
 * By doing so, all errors have a unified structure and support better error handling.
 *
 * # Example
 *
 * ```typescript ignore
 * import { AppError } from 'jsr:@oneday/error-handling';
 * import { HTTPStatus } from "jsr:@oneday/http-status";
 *
 * // client throwing an exception
 * throw new AppError(commonErrors.resourceNotFound,'further explanation', true, HTTPStatus.NotFound)
 * ```
 */
export class AppError extends Error {
  /**
   * @param name Error Name
   * @param message further explanation
   * @param isOperational operational 's error - default false
   * @param HttpStatus Http status code
   */
  constructor(
    public override name: string,
    public override message: string,
    public isOperational = false,
    public HttpStatus: HTTPStatus = HTTPStatus.InternalServerError,
  ) {
    super(message)

    Object.setPrototypeOf(this, new.target.prototype) // restore prototype chain

    Error.captureStackTrace(this)
  }
}

export class ErrorHandler {
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

  /**
   * # Example
   *
   * ```ts
   * import * as logger from 'jsr:@std/log';
   * import { errorHandler } from 'jsr:@oneday/error-handling';
   *
   * errorHandler.attach(logger.error)
   * ```
   */
  attach(func: Observer) {
    if (typeof func !== 'function' || this.#observers.includes(func)) {
      return
    }

    this.#observers.push(func)
  }

  /**
   * # Example
   *
   * ```ts
   * import * as logger from 'jsr:@std/log';
   * import { errorHandler } from 'jsr:@oneday/error-handling';
   *
   * errorHandler.detach(logger.error)
   * ```
   */
  detach(func: Observer) {
    this.#observers = this.#observers.filter((observer) => observer !== func)
  }

  /**
   * # Example
   *
   * ```typescript ignore
   * import * as logger from 'jsr:@std/log';
   * import { errorHandler } from 'jsr:@oneday/error-handling';
   *
   * errorHandler.attach(logger.error)
   *
   * errorHandler.notify(new AppError('resourceNotFound','further explanation'))
   *
   * // stdout: ERROR resourceNotFound: further explanation
   * ```
   */
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

  /**
   * Convert unknown to AppError
   *
   * # Example
   *
   * ```ts
   * import { assertInstanceOf } from 'jsr:@std/assert';
   * import { errorHandler, AppError } from 'jsr:@oneday/error-handling';
   *
   * assertInstanceOf(errorHandler.convertUnknownToAppError(new Error('test')), AppError);
   * assertInstanceOf(errorHandler.convertUnknownToAppError({ message: 'further explanation'}), AppError);
   * assertInstanceOf(errorHandler.convertUnknownToAppError('I am a string'), AppError);
   * ```
   */
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

    const isOperational = ErrorHandler.#instance.#getOneOfTheseProperties<
      boolean
    >(
      errorToEnrich,
      ['isOperational', 'operational'],
      false,
    )

    const stackTrace = ErrorHandler.#instance.#getOneOfTheseProperties<
      string | undefined
    >(
      errorToEnrich,
      ['stack'],
      undefined,
    )

    const standardError = new AppError(name, message, isOperational, httpStatus)
    standardError.stack = stackTrace

    const standardErrorWithOriginProperties = Object.assign(
      standardError,
      errorToEnrich,
    )

    return standardErrorWithOriginProperties
  }

  /**
   *  Handle errors centrally
   *
   * Error handling logic such as logging, deciding whether to crash and monitoring metrics should be encapsulated in a dedicated and centralized object
   * that all entry-points (e.g. APIs, cron jobs, scheduled jobs) call when an error comes in
   *
   * @param errorToHandle
   * @returns HTTPStatus - http status code
   *
   * # Example 1
   *
   * ```typescript ignore
   * import { errorHandler } from 'jsr:@oneday/error-handling';
   *
   * try {
   *    ...
   * } catch(error){
   *  errorHandler.handleError(error);
   * }
   * ```
   *
   * # Example 2 - NodeJs
   *
   * ```typescript ignore
   * import { errorHandler } from 'jsr:@oneday/error-handling';
   *
   * process.on("uncaughtException", (error:Error) => {
   *    errorHandler.handleError(error);
   * });
   *
   * process.on("unhandledRejection", (reason) => {
   *    errorHandler.handleError(reason);
   * });
   * ```
   *
   *  # Example 3 - Deno
   *
   * ```typescript ignore
   * import { errorHandler } from 'jsr:@oneday/error-handling';
   *
   * globalThis.addEventListener("unhandledrejection", (e) => {
   *    errorHandler.handleError(e);
   *
   *    e.preventDefault();
   * });
   * ```
   */
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
