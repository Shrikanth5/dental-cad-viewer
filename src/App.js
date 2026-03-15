import React from "react";
import UploadStep from "./components/UploadStep";
import ResultViewer from "./components/ResultViewer";

function App() {
  const [step, setStep] = React.useState("upload"); // 'upload' | 'result'
  const [scanData, setScanData] = React.useState(null);
  const [resultUrl, setResultUrl] = React.useState(null);

  const sampleResultUrl = "/models/DV0001_LATERALIZING_LEFT.stl";

  const handleConfirm = (data) => {
    console.log('Upload confirmed with data:', data);
    setScanData(data);
    setResultUrl(null);
    setStep("result");

    // Simulate AI processing
    setTimeout(() => {
      console.log('Setting result URL:', sampleResultUrl);
      setResultUrl(sampleResultUrl);
    }, 1200);
  };

  const handleStartOver = () => {
    setScanData(null);
    setResultUrl(null);
    setStep("upload");
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>Dental CAD STL Viewer</h2>

      {step === "upload" ? (
        <UploadStep onConfirm={handleConfirm} />
      ) : (
        <ResultViewer
          resultUrl={resultUrl}
          scanData={scanData}
          onStartOver={handleStartOver}
          onSetResultUrl={setResultUrl}
          sampleResultUrl={sampleResultUrl}
        />
      )}

    </div>
  );
}

export default App;