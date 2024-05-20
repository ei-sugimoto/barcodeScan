import React, { useEffect, useRef, useState, useCallback } from "react";
import Quagga from "quagga";

function App() {
  const [codes, setCodes] = useState([]);
  const [isScanning, setIsScanning] = useState(false);
  const videoRef = useRef(null);
  const handleDetected = useCallback(
    (data) => {
      const code = data.codeResult.code;
      if (!codes.includes(code)) {
        setCodes((prevCodes) => [...prevCodes, code]);
        setIsScanning(false); // Stop scanning after a barcode is detected
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
              width: { min: 1280 },
              height: { min: 720 },
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
      }
    };
  }, [isScanning, handleDetected]);

  const startScanning = () => {
    setIsScanning(true);
    setCodes([]);
  };
  const endScanning = () => {
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

  return (
    <div className="App">
      <h1>JANコードリーダー</h1>
      {isScanning}
      <button onClick={startScanning}>スキャン開始</button>
      {codes.length > 0 && <button onClick={endScanning}>スキャン終了</button>}
      <div
        ref={videoRef}
        style={{
          width: "100%",
          height: "400px",
        }}
      ></div>

      <h2>読み取ったJANコード一覧</h2>
      {mostFrequentCode.map((code, index) => (
        <p key={index}>{code}</p>
      ))}
    </div>
  );
}

export default App;
