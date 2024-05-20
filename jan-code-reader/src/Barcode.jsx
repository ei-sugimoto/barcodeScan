import React, { useRef, useEffect } from "react";
import JsBarcode from "jsbarcode";

const Barcode = ({ value }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (canvasRef.current) {
      JsBarcode(canvasRef.current, value, {
        format: "CODE128",
        displayValue: true,
      });
    }
  }, [value]);

  return <canvas ref={canvasRef}></canvas>;
};

export default Barcode;
