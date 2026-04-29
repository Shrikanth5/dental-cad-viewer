import React from "react";
import LoginStep from "./components/LoginStep";
import RegisterStep from "./components/RegisterStep";
import UploadStep from "./components/UploadStep";
import ResultViewer from "./components/ResultViewer";

function App() {
  const [step, setStep] = React.useState("login"); // 'login' | 'register' | 'upload' | 'result'
  const [user, setUser] = React.useState(null);
  const [scanData, setScanData] = React.useState(null);
  const [resultUrl, setResultUrl] = React.useState(null);

  const sampleResultUrl = "/models/DV0001_LATERALIZING_LEFT.stl";

  const handleLogin = (userData) => {
    console.log('User logged in:', userData);
    setUser(userData);
    setStep("upload");
  };

  const handleLogout = () => {
    console.log('User logged out');
    setUser(null);
    setScanData(null);
    setResultUrl(null);
    setStep("login");
  };

  const handleOpenRegister = () => {
    setStep("register");
  };

  const handleRegisterSuccess = (userData) => {
    console.log('User registered:', userData);
    setUser(userData);
    setStep("upload");
  };

  const handleConfirm = (data) => {
    console.log('Upload confirmed with data:', data);
    setScanData(data);
    setResultUrl(null);
    setStep("result");
  };

  const handleStartOver = () => {
    setScanData(null);
    setResultUrl(null);
    setStep("upload");
  };

  return (
    <div>
      {step === "login" ? (
        <LoginStep onLogin={handleLogin} onRegister={handleOpenRegister} />
      ) : step === "register" ? (
        <RegisterStep
          onRegisterSuccess={handleRegisterSuccess}
          onBackToLogin={() => setStep("login")}
        />
      ) : (
        <>
          <div style={{ 
            padding: "16px 20px", 
            background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            borderBottom: "2px solid #e2e8f0"
          }}>
            <h2 style={{ margin: 0, color: "#1ed7c3", fontSize: "20px", fontWeight: "700" }}>
              Kallisio Stentra Design System
            </h2>
            <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
              <span style={{ color: "#94a3b8", fontSize: "14px" }}>
                Welcome, {user?.userName || 'User'}
              </span>
              <button
                onClick={handleLogout}
                style={{
                  padding: "8px 16px",
                  background: "#ef4444",
                  color: "white",
                  border: "none",
                  borderRadius: "6px",
                  cursor: "pointer",
                  fontSize: "14px",
                  fontWeight: "600",
                  transition: "all 0.3s ease"
                }}
                onMouseEnter={(e) => e.target.style.background = "#dc2626"}
                onMouseLeave={(e) => e.target.style.background = "#ef4444"}
              >
                Logout
              </button>
            </div>
          </div>
          <div style={{ padding: "20px" }}>
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
        </>
      )}
    </div>
  );
}

export default App;