import { useEffect } from "react";
import sdk from "../sdk";

export function OrderStep({ onPrev, onNext }) {
  useEffect(() => {
    sdk.template.renderOrderPage({
      localeCode: "ko",
      order: {
        items: [
          {
            label: "아메리카노",
            value: 3000,
          },
          {
            label: "카페라떼",
            quantity: 2,
            value: 6000,
          },
        ],
        discounts: [],
        summary: {
          totalAmount: 15000,
        },
      },
      onBack: () => {
        onPrev();
      },
      onClick: () => {
        onNext();
      },
    });

    return () => {
      sdk.template.unmountRendering();
    };
  }, [onPrev, onNext]);

  return null;
}
