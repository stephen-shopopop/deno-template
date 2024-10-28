# Structural

Structural patterns are primarily used to handle relationships between objects.

## Facade

A facade is a class that provides a simplified API for larger body of code. It is often to used to hide low-level details of a subsystem.

```ts ignore
class PlumbingSystem {
  #pressure = 300

  // low evel access to plumbing system
  setPressure(v: number) {
    this.#pressure = v
  }
  turnOn() {
    console.log(`Plumbing turn on with ${this.#pressure}`)
  }

  turnOff() {
    console.log(`Plumbing turn off with ${this.#pressure}`)
  }
}

class ElectricalSystem {
  #voltage = 220

  // low evel access to electrical system
  setVoltage(v: number) {
    this.#voltage = v
  }

  turnOn() {
    console.log(`Eletrical turn on with ${this.#voltage}`)
  }

  turnOff() {
    console.log(`Eletrical turn off with ${this.#voltage}`)
  }
}

class House {
  #plumbing = new PlumbingSystem()
  #electrical = new ElectricalSystem()

  turnOnSystems() {
    this.#electrical.setVoltage(120)
    this.#electrical.turnOn()
    this.#plumbing.setPressure(500)
    this.#plumbing.turnOn()
  }

  shutDown() {
    this.#plumbing.turnOff()
    this.#electrical.turnOff()
  }
}

const client = new House()

client.turnOnSystems() // Eletrical turn on with 120; Plumbing turn on with 500
client.shutDown() // Eletrical turn off with 120; Plumbing turn off with 500
```

## Proxy

The proxy pattern lets you provide a substitute or placeholder for another object to control access to it.

```ts ignore
const personn = Object.seal({ name: 'jeff' })

const bigBrother = new Proxy(personn, {
  get(target, key) {
    console.log(`Tracking key: "${String(key)}"`)

    return Reflect.get(target, key)
  },
  set(target, key, value) {
    console.log(`Updating key: "${String(key)}" with value: "${value}"`)

    return Reflect.set(target, key, value)
  },
})

bigBrother.name // Tracking key: "name"
bigBrother.name = 'bob' // Updating key: "name" with value: "bob"
```
