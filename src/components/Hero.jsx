import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import { logo } from "../assets";

const Hero = ({ name = "", onLogout }) => {
  return (
    <header className="w-full flex justify-center items-center flex-col">
      <nav className="flex items-center w-full mb-10 pt-3">
        <img src={logo} alt="sumz_logo" className="w-28 object-contain" />

        {!name && (
          <>
            <Link to="/SigninModal" className="black_btn ml-auto">
              Sign In
            </Link>
            <Link to="/SignupModal" className="black_btn ml-2">
              Sign Up
            </Link>
          </>
        )}
        {name && (
          <button type="button" onClick={onLogout} className="black_btn ml-auto">
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

    </header>
  );
};

Hero.propTypes = {
  name: PropTypes.string,
  onLogout: PropTypes.func.isRequired,
};

export default Hero;
