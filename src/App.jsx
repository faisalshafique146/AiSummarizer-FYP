// App.js
import React, { useState, useEffect } from "react";
import "./App.css";
import Demo from "./components/Demo";
import Hero from "./components/Hero";
import SignupModal from "./components/SignupModal";
import SigninModal from "./components/SigninModal";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { auth } from "./firebase";

const App = () => {
  const [userName, setUserName] = useState("");
  const logout = () => {
    setUserName(null);
  };
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        console.log(user);

        setUserName(user.displayName || user.email);
      } else {
        setUserName("");
      }
    });
    return () => unsubscribe();
  }, []);

  return (
    <main>
      <BrowserRouter>
        <Routes>
          <Route path="/SignupModal" element={<SignupModal />} />
          <Route path="/SigninModal" element={<SigninModal />} />
          <Route
            path="/"
            element={
              <>
                <div className="main">
                  <div className="gradient" />
                </div>
                <div className="app">
                  <Hero name={userName} onLogout={logout} />
                  {userName ? (
                    <Demo />
                  ) : (
                    <p className="orange_gradient pt-9 text-5xl font-bold h-[600px]">
                      Please Sign in To Summarize
                    </p>
                  )}
                </div>
              </>
            }
          />
        </Routes>
      </BrowserRouter>
    </main>
  );
};

export default App;
