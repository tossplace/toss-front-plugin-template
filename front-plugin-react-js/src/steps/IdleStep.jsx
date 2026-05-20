import { useEffect } from "react";
import sdk from "../sdk";

export function IdleStep({ onNext }) {
  useEffect(() => {
    sdk.template.renderIdlePage({
      type: "oneButton",
      button: {
        text: "다음",
        onClick: onNext,
      },
    });
  }, [onNext]);

  return null;
}
