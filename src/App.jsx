import { useEffect, useState } from "react";
import "./App.css";
import Hero from "./components/Hero";
import Summarizer from "./components/Summarizer";
import SignupModal from "./components/SignupModal";
import SigninModal from "./components/SigninModal";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "./firebase";

const App = () => {
  const [userName, setUserName] = useState("");

  const handleLogout = () => signOut(auth);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
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
                  <Hero name={userName} onLogout={handleLogout} />
                  {userName ? (
                    <Summarizer />
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
