#!/usr/bin/env deno run --allow-env --allow-run

// import { HTTPStatus } from '@oneday/http-status'
// import stream from 'node:stream'
// import { setTimeout as sleep } from 'node:timers/promises'
// import process from 'node:process'
// import { Buffer } from 'node:buffer'
// import { pipeline } from 'node:stream/promises'



// /**
//  * Adds x and y.
//  *
//  * # Examples
//  *
//  * ```ts
//  * import { assertEquals } from "jsr:@std/assert/equals";
//  *
//  * const sum = add(1, 2);
//  * assertEquals(sum, 3);
//  * ```
//  */
// export function add(x: number, y: number): number {
//   return x + y
// }

// console.log(add(1, 2))

// console.log(HTTPStatus.OK)

// console.info('\nPrepare\n---\n')
// async function* generate() {
//   let index = 0

//   while (index < 4) {
//     await sleep(50)
//     index++
//     yield { name: 'hello' }
//   }
// }

// // Simple
// // Test simple
// // stream.Readable.from(generate()).on('data', (chunk) => console.log(chunk))

// console.info('\nReadable\n---\n')
// for await (const item of stream.Readable.from(generate())) {
//   console.log('readable:', item)
// }

// // Pipeline
// console.info('\nPipeline\n---\n')

// await pipeline(
//   generate(),
//   async function* (source) {
//     for await (const chunk of source) {
//       yield chunk.name.toString().toUpperCase()
//     }
//   },
//   async (source) => {
//     for await (const chunk of source) {
//       console.log('pipeline:', chunk)
//     }
//   },
// )

// // Transform
// console.info('\nTransform\n---\n')

// const upper = new stream.Transform({
//   transform: function (data, _enc, cb) {
//     this.push(Buffer.from(JSON.stringify({ name: data.name.toUpperCase() })))

//     cb()
//   },
//   objectMode: true,
// })

// stream.Readable.from(generate())
//   .pipe(upper)
//   .pipe(process.stdout)

// // Pattern iterator async
// console.info('\nTPattern iterator\n---\n')
// function range(start: number, end: number, step = 1) {
//   let started = start

//   return {
//     [Symbol.iterator]() {
//       return this
//     },
//     async next() {
//       if (started < end) {
//         await sleep(10)
//         started = started + step

//         return { value: started, done: false }
//       }
//       return { done: true, value: end }
//     },
//   }
// }

// const countdown = range(0, 4, 2)

// let result = await countdown.next()

// while (!result.done) {
//   console.log('pattern iterator async:', result.value)

//   result = await countdown.next()
// }

// await sleep(1500)

// console.log('')
// console.info('bye')
// Element interface

class Adaptee {
  fetchData() {
      return {
          data: { name: 'john', age: 25, social: { email: 'john@doe.com' } },
      } as const;
  }
}

interface Target {
  email: string;
}

class Adapter implements Target {
  constructor(private adaptee: Adaptee) {/** */}

  get email(): string {
      return this.adaptee.fetchData().data.social.email;
  }
}

function clientCode(data: Target) {
  console.log(`Email: ${data.email}`);
}

const adaptee = new Adaptee();
const adapter = new Adapter(adaptee);
clientCode(adapter); // Email: john@doe.com'