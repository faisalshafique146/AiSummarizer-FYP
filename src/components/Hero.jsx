// Hero.js
import React, { useState } from "react";
import { Link } from "react-router-dom"; 
import { logo } from "../assets";
import SignupModal from "./SignupModal"; 
import SigninModal from "./SigninModal"; 

const Hero = (props,{ name, onLogout}) => {
  const [showSignupModal, setShowSignupModal] = useState(false);
  const [showSigninModal, setShowSigninModal] = useState(false);

  const handleLogout = () => {
    props.onLogout(); 
    setShowSignupModal(false);
    setShowSigninModal(false); 
    props.name = null;
  };
  return (
    <header className="w-full flex justify-center items-center flex-col">
      <nav className="flex items-center w-full mb-10 pt-3">
        <img src={logo} alt="sumz_logo" className="w-28 object-contain" />

        {!name && (
          <>
        <button
          type="button"
          onClick={() => setShowSigninModal(true)}
          className="black_btn ml-auto"
        >
          <Link to="/SigninModal" onClick={() => setShowSigninModal(true)}>{props.name ? `Welcome  - ${props.name}` : "Sign In"}</Link>
        </button>
        <button
          type="button"
          onClick={() => setShowSignupModal(true)}
          className="black_btn ml-2"
        >
          <Link to="/SignupModal" onClick={() => setShowSignupModal(true)}>Sign Up</Link>
          </button>
          </>
        )}
          {props.name && (
      <button
      type="button"
      onClick={handleLogout}
      className="black_btn ml-2"
    >
      Sign Out
      </button>
    )}
        
      </nav>

      <h1 className="head_text">
        Summarize Articles with <br className="max-md:hidden" />
        <span className="orange_gradient">HiSumz AI</span>
      </h1>
      <h2 className="desc">
        Simplify your reading with HiSumz, an open-source article summarizer
        that transforms lengthy articles into clear and concise summaries
      </h2>

      {showSignupModal && <SignupModal onClose={() => setShowSignupModal(false)} />}
      {showSigninModal && <SigninModal onClose={() => setShowSigninModal(false)} />}
    </header>
  );
};

export default Hero;
