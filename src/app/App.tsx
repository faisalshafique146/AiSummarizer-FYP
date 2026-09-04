import { lazy, Suspense } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router";
import HomePage from "./HomePage";
import "../App.css";

const SignInPage = lazy(() => import("../features/auth/SignInPage"));
const SignUpPage = lazy(() => import("../features/auth/SignUpPage"));

function RouteLoadingState() {
  return (
    <main
      className="flex min-h-screen items-center justify-center bg-[#f8f8f6] px-4 text-sm text-slate-600"
      id="main-content"
    >
      <p role="status">Loading page...</p>
    </main>
  );
}

function App() {
  return (
    <BrowserRouter>
      <a className="skip-link" href="#main-content">
        Skip to content
      </a>
      <Suspense fallback={<RouteLoadingState />}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/sign-in" element={<SignInPage />} />
          <Route path="/sign-up" element={<SignUpPage />} />
          <Route
            path="/SigninModal"
            element={<Navigate to="/sign-in" replace />}
          />
          <Route
            path="/SignupModal"
            element={<Navigate to="/sign-up" replace />}
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

export default App;
