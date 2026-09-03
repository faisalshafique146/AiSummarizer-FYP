import { useState } from "react";
import PropTypes from "prop-types";
import { auth } from "../firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import {
  Button,
  Dialog,
  Card,
  CardBody,
  CardFooter,
  Typography,
  Input,
} from "@material-tailwind/react";
import { Link, useNavigate } from "react-router-dom";

function SigninModal({ onClose }) {
  const navigate = useNavigate();
  const [values, setValues] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const handleClose = () => (onClose ? onClose() : navigate("/"));

  const handleSubmit = () => {
    if (!values.email || !values.password) {
      setError("Please fill all the fields");
      return;
    }
    if (!values.email.includes("@")) {
      setError("Invalid Email");
      return;
    }

    signInWithEmailAndPassword(auth, values.email, values.password)
      .then(() => {
        navigate("/");
      })
      .catch((err) => {
        if (err.code === "auth/user-disabled") {
          setError("Your account has been disabled. Please contact support.");
        } else {
          setError(err.message);
        }
      });
  };

  return (
    <Dialog
      size="xs"
      open={true}
      handler={handleClose}
      className="bg-transparent shadow-none"
    >
      <Card className="mx-auto w-full max-w-[24rem]">
        <CardBody className="flex flex-col gap-4">
          <Typography variant="h4" color="blue-gray">
            Sign In
          </Typography>
          <Typography
            className="mb-3 font-normal"
            variant="paragraph"
            color="gray"
          >
            Enter your email and password to Sign In.
          </Typography>
          <Typography className="-mb-2" variant="h6">
            Your Email
          </Typography>
          <Input
            label="Email"
            type="email"
            size="lg"
            onChange={(event) =>
              setValues((prev) => ({ ...prev, email: event.target.value }))
            }
          />
          <Typography className="-mb-2" variant="h6">
            Your Password
          </Typography>
          <Input
            label="Password"
            type="password"
            size="lg"
            onChange={(event) =>
              setValues((prev) => ({ ...prev, password: event.target.value }))
            }
          />
        </CardBody>
        <CardFooter className="pt-0">
          <div className=" text-red-900">{error}</div>
          <Button variant="gradient" onClick={handleSubmit} fullWidth>
            Sign In
          </Button>
          <Typography variant="small" className="mt-4 flex justify-center">
            Don&apos;t have an account?
            <Link to="/SignupModal" className="ml-1 font-bold text-blue-gray-900">
              Sign up
            </Link>
          </Typography>
        </CardFooter>
      </Card>
    </Dialog>
  );
}

SigninModal.propTypes = {
  onClose: PropTypes.func,
};

SigninModal.defaultProps = {
  onClose: undefined,
};

export default SigninModal;
