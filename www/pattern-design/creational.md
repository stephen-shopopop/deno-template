# Creational

Creational patterns are related to the creation of new objects.

## Singleton

A singleton is an object that can only be instantiated once. It is useful fo implementing a global object that can be accessed from anywhere in the application.

```ts ignore
class Singleton {
  static #instance: Singleton

  readonly #mode = 'dark'

  // prevent new with private constructor
  private constructor() {
    /** */
  }

  static getInstance(): Singleton {
    if (!Singleton.#instance) {
      Singleton.#instance = new Singleton()
    }

    return Singleton.#instance
  }

  someBusinessLogic() {
    return Singleton.#instance.#mode
  }
}

const singleton = new Singleton() // throws error
const singleton = Singleton.getInstance()

console.log(singleton.someBusinessLogic()) // dark
```

Or use

```ts ignore
const singleton = Object.freeze({
  mode: 'dark',
  someBusinessLogic: function () {
    return this.mode
  },
})

console.log(singleton.someBusinessLogic()) // dark
```

!> [Object.freeze](https://developer.mozilla.org/fr/docs/Web/JavaScript/Reference/Global_Objects/Object/freeze)

!> [Object.seal](https://developer.mozilla.org/fr/docs/Web/JavaScript/Reference/Global_Objects/Object/seal)

## Prototype

Prototype allows objects to be clones of other objects, rather then extended via inheritance.

```ts ignore
const zombie = Object.seal({
  mode: 'night',
  eatBrains: function () {
    return `yum 🧠 at ${this.mode}`
  },
})

const chad = Object.create(zombie, { name: { value: 'chad' } }) as
  & typeof zombie
  & Readonly<{ name: string }>

chad.mode = 'day'

console.log(chad.eatBrains()) // yum 🧠 at day
console.log(zombie.eatBrains()) // yum 🧠 at nigth

console.log(chad.name) // chad
```

!> [Object.create](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/create)

## Factory

A factory is a method or function that creates an object, or a set of objects, without exposing the creation logic to the client.

```ts ignore
class IOSButton {
  readonly display = 'ios'
}

class AndroidButton {
  readonly display = 'android'
}

class ButtonFactory {
  createButton(os: string): IOSButton | AndroidButton {
    if (os === 'ios') {
      return new IOSButton()
    }

    return new AndroidButton()
  }
}

// Factory
const factory = new ButtonFactory()

const btn1 = factory.createButton('ios')
console.log(btn1.display) // 'ios'

const btn2 = factory.createButton('andrdoid')
console.log(btn2.display) // 'android'
```

## Builder

The builder pattern is a creational design pattern that lets you construct complex objects step by step. It JavaScript, we can achieve this with method chaining.

```ts ignore
class HotDog {
  constructor(
    readonly bread: string,
    ketchup?: boolean
    mustard?: boolean
    kraut?: boolean
  ) { /** */ }

  addKetchup() {
    this.ketchup = true

    return this
  }
  addMustard() {
    this.mustard = true

    return this
  }
  addKraut() {
    this.kraut = true

    return this
  }
}

const myLunch = new HotDog('gluten free')
  .addKetchup()
  .addMustard()
  .addKraut()

console.log(myLunch) // { ketchup: true, mustard: true, kraut: true, bread: 'gluten free' }
```
