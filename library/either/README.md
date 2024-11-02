# Library

[![JSR @oneday](https://jsr.io/badges/@oneday)](https://jsr.io/@oneday/either)

- 🚀 Full-featured deno and node
- 🏄‍♀️ Simple usage

## Description

In error handling, we have two possible paths, either a successful calculation or a failure. The imperative way to control the flow is to use exceptions and a try/catch block. In functional programming, they recognised that these two **paths ok or error can be joined in a structure that means either** as a possibility and that we can thus unify them in a **So <ok,error>** structure.

This pattern allows us to obtain better error management in order to define http status code, for example, without the domain being coupled to the http server.

We can now separate a technical error from a business error. A technical error will throw and interrupt code execution whereas a business error maintains execution and becomes the responsibility of the domain.

## Usage
