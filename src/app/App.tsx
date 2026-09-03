import { BrowserRouter, Navigate, Route, Routes } from "react-router";
import SignInPage from "../features/auth/SignInPage";
import SignUpPage from "../features/auth/SignUpPage";
import HomePage from "./HomePage";
import "../App.css";

function App() {
  return (
    <BrowserRouter>
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
    </BrowserRouter>
  );
}

export default App;
