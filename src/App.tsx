import { useEffect, useState } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { BrowserRouter, Route, Routes } from "react-router";
import "./App.css";
import Hero from "./components/Hero";
import SigninModal from "./components/SigninModal";
import SignupModal from "./components/SignupModal";
import Summarizer from "./components/Summarizer";
import { auth, toAuthenticatedUser } from "./firebase";
import type { AuthenticatedUser } from "./types";

function App() {
  const [user, setUser] = useState<AuthenticatedUser | null>(null);

  useEffect(
    () =>
      onAuthStateChanged(auth, (firebaseUser) => {
        setUser(firebaseUser ? toAuthenticatedUser(firebaseUser) : null);
      }),
    [],
  );

  const handleLogout = async (): Promise<void> => {
    try {
      await signOut(auth);
    } catch (error: unknown) {
      console.error("Failed to sign out:", error);
    }
  };

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
                  <Hero user={user} onLogout={handleLogout} />
                  {user ? (
                    <Summarizer />
                  ) : (
                    <p className="orange_gradient h-[600px] pt-9 text-5xl font-bold">
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
}

export default App;
