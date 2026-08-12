import "./style.css";
import CountDownTimer from "./examples/CountDownTimer.ts";
import { Div, AxirElement } from "./axir.ts";
import Counter from "./examples/Counter.ts";

const App = document.getElementById("app");

function Page(): AxirElement {
  return Div({ className: "w-full h-full flex flex-col overflow-y-auto p-8 bg-gray-200 justify-center items-center" }, [
    // CountDownTimer(),
    Counter()
  ])
}

App?.appendChild(Page().element as Node);
