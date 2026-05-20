import { useState, useEffect } from "react";
import { IdleStep, OrderStep } from "./steps";
import sdk from "./sdk";

function App() {
  const [step, setStep] = useState("idle");

  useEffect(function example() {
    (async () => {
      const { serialNumber } = await sdk.app.getSerialNumber();
      console.log("serialNumber >> ", serialNumber);

      const merchant = await sdk.app.getMerchant();
      console.log("merchant >> ", merchant);
    })();
  }, []);

  return (
    <main id="app">
      {step === "idle" ? (
        <IdleStep
          onNext={() => {
            setStep("order");
          }}
        />
      ) : step === "order" ? (
        <OrderStep
          onPrev={() => {
            setStep("idle");
          }}
          onNext={() => {
            setStep("idle");
          }}
        />
      ) : (
        <h2>프론트 React 템플릿 화면입니다</h2>
      )}
    </main>
  );
}

export default App;
