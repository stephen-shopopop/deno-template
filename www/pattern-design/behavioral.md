# Behavioral

Behavioral patterns are used to identify communication between objects.

## Iterator

The iterator pattern is used to traverse a collection of elements. Most programming languages provide abstrations for iteration like the for loop. However, you can create your own iterators in JavaScript by using the Symbol.iterator property. The code below creates a custom range function that can be used in a regular for loop.

```ts ignore
function range(start: number, end: number, step = 1) {
  let started = start

  return {
    [Symbol.iterator]() {
      return this
    },
    next() {
      if (started < end) {
        started = started + step

        return { value: started, done: false }
      }
      return { done: true, value: end }
    },
  }
}

for (const n of range(0, 20, 5)) {
  console.log(n) // 5, 10, 15, 20
}
```

> ! [Iteration protocols](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Iteration_protocols)

## State

The state pattern is used to encapsulate the state of an object so that it can be changed and accessed independently of the object.

```ts ignore
interface State {
  think(): string
}

class HappyState implements State {
  think() {
    return 'I am happy 🙂'
  }
}

class SadState implements State {
  think() {
    return 'I am sad 🙁'
  }
}

class Human {
  state: State

  constructor() {
    this.state = new HappyState()
  }

  changeState(state: State) {
    this.state = state
  }

  think() {
    return this.state.think()
  }
}

const human = new Human()

console.log(human.think()) // I am happy 🙂

human.changeState(new SadState()) // I am sad 🙁
console.log(human.think())
```

## Strategy

Strategy is a behavioral design pattern that lets you define a family of algorithms, put each of them into a separate class, and make their objects interchangeable.

```ts ignore
interface Strategy {
  doAlgorithm(data: string[]): string[]
}

class ConcreteStrategyA implements Strategy {
  doAlgorithm(data: string[]): string[] {
    return data.sort()
  }
}

class ConcreteStrategyB implements Strategy {
  doAlgorithm(data: string[]): string[] {
    return data.reverse()
  }
}

class Context {
  #strategy: Strategy

  constructor(strategy: Strategy) {
    this.#strategy = strategy
  }

  setStrategy(strategy: Strategy) {
    this.#strategy = strategy
  

  doSomeBusinessLogic(): void {
    const result = this.#strategy.doAlgorithm(['a', 'b', 'c', 'd', 'e'])

    console.log(result.join(','))
  }
}



const context = new Context(new ConcreteStrategyA())
console.log('Client: Strategy is set to normal sorting.')
context.doSomeBusinessLogic() // a,b,c,d,e

console.log('Client: Strategy is set to reverse sorting.')
context.setStrategy(new ConcreteStrategyB())
context.doSomeBusinessLogic() // e,d,c,b,a
```
