import React, { useEffect, useRef, useState, useCallback } from "react";
import Quagga from "quagga";
import Barcode from "./Barcode";

function App() {
  const [codes, setCodes] = useState([]);
  const [isScanning, setIsScanning] = useState(false);
  const videoRef = useRef(null);
  const handleDetected = useCallback(
    (data) => {
      const code = data.codeResult.code;
      if (!codes.includes(code)) {
        setCodes((prevCodes) => [...prevCodes, code]);
        setIsScanning(false);
      }
      if (codes.length > 0) {
        setMostFrequentCode((prev) => [...prev, mostFrequentElement(codes)]);
      }
    },
    [codes]
  );
  useEffect(() => {
    if (isScanning) {
      Quagga.init(
        {
          inputStream: {
            type: "LiveStream",
            constraints: {
              width: { min: 640 },
              height: { min: 480 },
              facingMode: "environment",
              aspectRatio: { min: 1, max: 2 },
            },
            target: videoRef.current,
          },
          locator: {
            patchSize: "small",
            halfSample: false,
          },
          numOfWorkers: 4,
          decoder: {
            readers: ["code_128_reader"],
          },
          locate: true,
        },
        (err) => {
          if (err) {
            console.error(err);
            return;
          }
          Quagga.start();
        }
      );

      Quagga.onDetected(handleDetected);
    }

    return () => {
      if (Quagga.initialized) {
        Quagga.offDetected(handleDetected);
        Quagga.stop();
      }
    };
  }, [isScanning, handleDetected]);

  const [isInit, setIsInit] = useState(true);
  const startScanning = () => {
    setIsInit(false);
    setIsScanning(true);
    setCodes([]);
  };
  const endScanning = () => {
    setIsInit(true);
    setIsScanning(false);
    if (codes.length > 0) {
      setMostFrequentCode((prev) => [...prev, mostFrequentElement(codes)]);
    }
    Quagga.stop();
    setCodes([]);
  };

  function mostFrequentElement(arr) {
    // 出現回数を記録するオブジェクト
    const frequencyMap = {};

    // 配列内の各要素の出現回数をカウント
    arr.forEach((element) => {
      if (frequencyMap[element]) {
        frequencyMap[element]++;
      } else {
        frequencyMap[element] = 1;
      }
    });

    // 最も頻度が高い要素を見つける
    let mostFrequent = null;
    let maxCount = 0;

    for (const element in frequencyMap) {
      if (frequencyMap[element] > maxCount) {
        mostFrequent = element;
        maxCount = frequencyMap[element];
      }
    }

    return mostFrequent;
  }
  const [mostFrequentCode, setMostFrequentCode] = useState([]);
  const [barcodeValue, setBarcodeValue] = useState([]);
  const handleGenerate = () => {
    setBarcodeValue(mostFrequentCode.map((code) => code));
  };

  return (
    <div className="App">
      <h1>JANコードリーダー</h1>
      {isScanning}
      {isInit && (
        <button
          onClick={startScanning}
          style={{ width: "200px", height: "50px" }}
        >
          <div style={{ fontSize: 20 }}> スキャン開始</div>
        </button>
      )}
      {codes.length > 0 && (
        <button
          onClick={endScanning}
          style={{ width: "200px", height: "50px" }}
        >
          スキャン終了
        </button>
      )}
      <div
        ref={videoRef}
        style={{
          width: "100%",
          height: "400px",
          display: isScanning ? "block" : "none",
        }}
      ></div>

      <h2>読み取ったJANコード一覧</h2>
      {mostFrequentCode.map((code, index) => (
        <p key={index} style={{ fontSize: 20 }}>
          {code}
        </p>
      ))}
      <h1>Code128バーコード生成器</h1>
      <button onClick={handleGenerate}>生成</button>
      {barcodeValue &&
        barcodeValue.map((value, index) => {
          return (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                width: 400,
                height: 400,
              }}
            >
              <React.Fragment key={index}>
                <Barcode value={value} />
              </React.Fragment>
            </div>
          );
        })}
    </div>
  );
}

export default App;
