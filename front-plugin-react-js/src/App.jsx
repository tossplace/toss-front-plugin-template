import { useEffect } from "react";
import sdk from "./sdk";

function App() {
  useEffect(() => {
    (async () => {
      const { serialNumber } = await sdk.app.getSerialNumber();
      console.log("serialNumber >> ", serialNumber);

      const merchant = await sdk.app.getMerchant();
      console.log("merchant >> ", merchant);
    })();
  }, []);

  return (
    <main>
      <h2>프론트 React 템플릿 화면입니다</h2>
    </main>
  );
}

export default App;
