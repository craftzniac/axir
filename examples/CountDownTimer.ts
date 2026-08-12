import { Button, Div, AxirElement, Text, computed, state, effect, State, Observable } from "../axir.ts"

const MAX_SECONDS = 120
const MIN_SECONDS = 10

const TimerState = { PLAYING: "playing", PAUSED: "paused", FINISHED: "finished" } as const
type TimingState = typeof TimerState[keyof typeof TimerState]

export default function CountDownTimer(): AxirElement {
  const timerValue = state(60)
  const remainingTimeInSec = state(-1)
  const remainingTimeInSecLabel = computed(() => {
    if (remainingTimeInSec.get() == -1) return `--:--`
    const time = remainingTimeInSec.get()
    const mins = time >= 60 ? Math.floor(time / 60) : 0
    const secs = time < 60 ? time : time % 60
    return `${mins < 10 ? "0" : ""}${mins}:${secs < 10 ? "0" : ""}${secs}`
  }, [remainingTimeInSec])

  const timingState = state<TimingState>("finished")

  effect(() => {
    const ts = timingState.get()
    if (ts !== TimerState.PLAYING) return

    const timerId = setInterval(() => {
      if (remainingTimeInSec.get() <= 0) {
        clearInterval(timerId)
      } else {
        remainingTimeInSec.set(prev => prev - 1)
      }
    }, 1000 /* 1 second tick */)

    return () => {
      clearInterval(timerId)
    }
  }, [timingState])

  const startTimer = () => {
    remainingTimeInSec.set(timerValue.get())
    timingState.set(TimerState.PLAYING)
  }
  const reset = () => {
    timingState.set(TimerState.FINISHED)
    remainingTimeInSec.set(timerValue.get())
  }
  const resumeTimer = () => timingState.set(TimerState.PLAYING)
  const pauseTimer = () => timingState.set(TimerState.PAUSED)

  return Div({ className: "w-full bg-white max-w-150 p-8 md:p-14 rounded-3xl shadow flex flex-col items-center gap-12" }, [
    TimeSelection(timerValue),
    Text(remainingTimeInSecLabel, { className: "text-[4rem]" }),
    ControlButtons(startTimer, reset, pauseTimer, resumeTimer, timingState)
  ])
}

function TimeSelection(timeInSec: State<number>): AxirElement {
  function increment() {
    timeInSec.set(prev => prev >= MAX_SECONDS ? prev : prev + 1)
  }

  function decrement() {
    timeInSec.set(prev => prev <= MIN_SECONDS ? prev : prev - 1)
  }

  return Div({ className: "flex flex-col items-center gap-2" }, [
    Text(`Time (btw ${MIN_SECONDS} and ${MAX_SECONDS} secs)`, { type: "p", className: "font-bold" }),
    Div({ className: "flex items-center w-full justify-center gap-2" }, [
      Button({
        textContent: "-", className: "rounded w-10 h-10 flex items-center justify-center  bg-gray-100 rounded-md text-2xl hover:bg-gray-300",
        onclick: () => decrement()
      }),
      Text(computed(() => timeInSec.get() + "", [timeInSec])),
      Button({ textContent: "+", className: "rounded w-10 h-10 flex items-center justify-center  bg-gray-100 rounded-md text-2xl hover:bg-gray-300", onclick: () => increment() }),
    ])
  ])
}

type VoidFn = () => void

function ControlButtons(startTimer: VoidFn, reset: VoidFn, pauseTimer: VoidFn, resumeTimer: VoidFn, timingState: Observable<TimingState>): AxirElement {
  return Div({ className: "flex items-center gap-4" }, [
    Button({
      textContent: computed(() => {
        const ts = timingState.get()
        switch (ts) {
          case TimerState.PAUSED: return "Resume"
          case TimerState.PLAYING: return "Pause"
          default: return "Start"
        }
      }, [timingState]),
      className: "rounded-md bg-purple-500 hover:bg-purple-600 text-white px-8 py-2 font-bold",
      onclick: () => {
        const ts = timingState.get()
        if (ts === TimerState.PLAYING) {
          pauseTimer()
        } else if (ts === TimerState.PAUSED) {
          resumeTimer()
        } else {
          startTimer()
        }
      }
    }),
    Button({ textContent: "Reset", className: "rounded-md bg-red-500 hover:bg-red-600 text-white px-8 py-2 font-bold", onclick: () => reset() })
  ])
}
