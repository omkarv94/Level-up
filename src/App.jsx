import React, { useEffect, useState } from "react";
import { getToken } from "./api";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";

function App() {
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    if (getToken()) setAuthenticated(true);
  }, []);

  return authenticated ? (
    <Dashboard onLogout={() => setAuthenticated(false)} />
  ) : (
    <Login onLogin={() => setAuthenticated(true)} />
  );
}

export default App;