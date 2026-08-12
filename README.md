# AXIR (An eXperiment In Reactivity)
> Disclaimer: This was just something I implemented in a weekend and is incomplete

#### A Counter example
<video src="https://github.com/user-attachments/assets/87a16911-0b04-4fd4-b3d8-f6f5a7afaed7" controls></video>

For a while now, I've wanted to implement the observer pattern and try using that to implement reactivity in javascript, no jsx, just plain javascript functions that are composed to build component trees, so that's what I finally got to do here. This is a tiny experiment to make a tiny ui library in javascript using the observer pattern 

#### How to run
- git clone the repo
- `cd axir && pnpm install`
- `./axir.ts` contains the reactivity primitives and ui components (so far it has only Div, Button and Text)
- `./examples/Counter.ts` -  a simple counter 
- `./examples/CountDownTimer.ts`  -  a countdown timer

#### How is the reactivity implemented
There are 3 reactivity primitives; `state()`, `effect()` and `computed()`
When a function (child) is defined within another function (parent), if a value from the parent function is used within the child function, then javascript guarantees that value will be available whenever that child function is called. 
```ts
function parent(){
    let age = 23
    function child(){
        age += 2
    }

    child()
}

parent()
```
Now, what if `child()` is returned from `parent` and called after `parent()` has returned. Will `age` still be available?  Yes! 
```ts
function parent(){
    let age = 23
    function child(){
        age += 2
        return age
    }

    return child
}


let child = parent()
let age1 = child()   // age1 == 25
let age2 = child()   // age2 == 27
```

`age` will be alive for as long as `child()` is used. This feature that lets the `child()` hold on to `age` even after `parent()` has returned, is called a `closure`

Using closures, I can have a value that is available and then define functions that operate on that data, then return those functions from the parent function, and we have 


##### state()
This function is analogous to `useState()` in react. It is used to create an observable value. Whenever the value changes, all its listeners/observers are executed. Listeners are just functions  
At it's core, `state()` is a function with a closure that implements observable pattern.
##### computed()
This function is used to create values that are observable but are computed from other states. The function takes a callback used to compute a value and a dependency array of all states this computed value depends on, so that when any of that state changes, the value is recomputed
`computed()` is implemented ontop of `store()`
##### effect()
This is analogous to react's `useEffect()` and also carries a dependency array. Whenever any of the state/computed value in it's dependency array changes, the effect()'s callback function is re-run

#### Components
Currently there are 3 components; Div, Text and Button
The idea was to have a component (function) for each html element. The function wires up that element to support the reactivity primites. If every primitive component is reactive, then combining them into more complex components should still produce something reactive

