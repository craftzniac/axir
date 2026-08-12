import { AxirElement, Button, computed, Div, effect, state, Text } from "../axir";

export default function Counter(): AxirElement {
  const count = state(0)

  effect(() => {
    console.log("count:", count.get())
  }, [count])

  const increment = () => count.set(prev => prev + 1)
  const decrement = () => count.set(prev => prev - 1)

  return (
    Div({ className: "flex flex-col gap-8 w-full h-full justify-center items-center p-8" }, [
      Text(computed(() => count.get() + "", [count]), { className: "text-[3rem]" }),
      Div({ className: "flex items-center gap-4" }, [
        Button({
          onclick: () => increment(), className: "bg-green-800 rounded text-white p-3",
          textContent: "increment (+)"
        }),
        Button({
          onclick: () => decrement(), className: "bg-red-800 rounded text-white p-3",
          textContent: "decrement (-)"
        }),
      ])
    ])
  )
}
