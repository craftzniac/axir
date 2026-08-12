/* START ===================== Store_Primitives */

type GetState<S> = () => S
type SetState<S> = (value: S | ((prev: S) => S)) => void
type Listener<S> = (s: S) => void
type Subscribe<T> = (listener: Listener<T>) => () => void

export type Observable<T> = {
  sub: Subscribe<T>
  get: GetState<T>,
}

export type State<T> = Observable<T> & {
  set: SetState<T>,
  get: GetState<T>,
}

export type DerivedState<T> = Observable<T>

export function state<T>(initialValue: T): State<T> {
  let state = initialValue
  const listeners = new Set<Listener<T>>()

  const get: GetState<T> = () => {
    return state;
  }

  const set: SetState<T> = (value) => {
    if (typeof value == "function") {
      state = (value as (prev: T) => T)(state)
    } else {
      state = value
    }

    for (const listener of listeners) {
      listener(state)
    }
  }

  const sub: Subscribe<T> = (listener: Listener<T>) => {
    listeners.add(listener)
    // initial notification to the new listener
    listener(state)
    return () => { // returns a function to unsubscribe this listener
      listeners.delete(listener)
    }
  }

  return {
    get, set, sub
  }
}


export function computed<T>(refresh: () => T, dependencies: Observable<any>[]): DerivedState<T> {
  const store = state<T>(refresh())

  // register with all it's dependencies so that the state here is refreshed whenever any of them change
  dependencies.forEach(dep => dep.sub(() => {
    store.set(() => {
      const returned = refresh()
      if (typeof returned == "function") {  // call the cleanup function 
        returned()
      }

      return returned
    })
  }))

  return { // notice how there's not set(). User shouldnt' be able to set this value directly
    get: store.get,
    sub: store.sub
  }
}

export function effect(fn: () => void | (() => void), dependencies: Observable<any>[]) {
  let cleanup: (() => void) | void

  const run = () => {
    cleanup?.()
    cleanup = fn() ?? undefined
  }

  // initial execution of fn
  run()

  // subscribe to dependencies
  const unsubscribers = dependencies.map(dep => dep.sub(run))

  return () => {
    cleanup?.()
    unsubscribers.forEach(unsub => unsub())
  }

}


/* END   ===================== Store_Primitives */


/* START ===================== Components */

export interface AxirElement {
  element: HTMLElement | AxirElement
}

type ObservableProps<T> = Omit<{
  [K in keyof T]: Observable<T[K]> | T[K]
}, "style"> & { style: Partial<CSSStyleDeclaration> | CSSStyleDeclaration }

type AxirElementOptions = ObservableProps<HTMLElement>

// ====================== container elements

interface DivElement extends AxirElement { }
type DivOptions = AxirElementOptions & {}

export function Div(options: Partial<DivOptions> = {}, children: AxirElement[] = []): DivElement {
  const self = document.createElement("div")
  // register with observers first
  setObservableProps({ self, options })
  children.forEach(child => self.appendChild(child.element as Node))
  return {
    element: self
  }
}


// ====================== Button

interface ButtonElement extends AxirElement { }

type ButtonOptions = AxirElementOptions & {
  onclick: () => void
  textContent: Observable<string | number> | string
}

export function Button(options: Partial<ButtonOptions>, children: AxirElement[] = []): ButtonElement {
  const self = document.createElement("button")
  // register with observers first
  setObservableProps({ self, options })
  children.forEach(child => self.appendChild(child.element as Node))
  return {
    element: self
  }
}


// ========================  text
type TextType = "p" | "h1" | "h2" | "h3" | "h4" | "h5" | "h6"
interface TextElement extends AxirElement { }

type TextOptions = AxirElementOptions & {
  type: TextType,
}

export function Text<T extends string>(text: Observable<T> | T, options: Partial<TextOptions> = {}): TextElement {
  options.textContent = text
  const self = document.createElement(options.type ?? "p")
  // register with observers first
  setObservableProps({ self, options })
  return {
    element: self
  }
}


type HrOptions = AxirElementOptions & {}
export function Hr(options: Partial<HrOptions> = {}): AxirElement {
  const self = document.createElement("hr")
  // register with observers 
  setObservableProps({ self, options })
  return {
    element: self
  }
}

function isTypeofObservable(val: any): val is Observable<any> {
  return val?.get && val?.sub
}

function setObservableProps<T extends HTMLElement, O extends Partial<AxirElementOptions>>({ self, options }: { self: T, options: O }) {
  const propKeys = Object.keys(options)
  propKeys.forEach(_key => {
    const key = _key as keyof typeof options
    let val = options[key as keyof typeof options]
    if (isTypeofObservable(val)) {
      val.sub(s =>
        // @ts-ignore
        self[key] = s)
    } else {
      // @ts-ignore
      self[key] = val ?? ""
    }
  })
}

/* END   ===================== Components */
