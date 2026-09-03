// SignupModal.js
import React, { useState } from "react";
import { auth } from "../firebase";
import { signInWithEmailAndPassword, updateProfile } from "firebase/auth";
import {
  Button,
  Dialog,
  Card,
  CardBody,
  CardFooter,
  Typography,
  Input,
  Checkbox,
} from "@material-tailwind/react";
import { Link, useNavigate } from "react-router-dom";

function SigninModal({ onClose }) {
  const navigate = useNavigate();
  const [values, setValues] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = () => {
    if (!values.email || !values.password) {
      setError("Please fill all the fields");
      return;
    }
    if (!values.email.includes("@")) {
      setError("Invalid Email");
      return;
    }

    console.log(values);
    signInWithEmailAndPassword(auth, values.email, values.password)
      .then((res) => {
        setSuccess("Signed in successfully");
        navigate("/");
      })
      .catch((err) => {
        if (err.code === "auth/user-disabled") {
          setError("Your account has been disabled. Please contact support.");
        } else {
          console.log("Error:", err.code, err.message);
          setError(err.message);
        }
        console.log("Error:", err.code, err.message);
      });
  };

  return (
    <Dialog
      size="xs"
      open={true}
      handler={onClose}
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
            size="lg"
            onChange={(event) =>
              setValues((prev) => ({ ...prev, password: event.target.value }))
            }
          />
          <div className="-ml-2.5 -mt-3">
            <Checkbox label="Remember Me" />
          </div>
        </CardBody>
        <CardFooter className="pt-0">
          <div className=" text-red-900">{error}</div>
          <div className=" text-green-900">{success}</div>
          <Button variant="gradient" onClick={handleSubmit} fullWidth>
            Sign In
          </Button>
          <Typography variant="small" className="mt-4 flex justify-center">
            Don't have an account?
            <Typography
              as="a"
              href="/"
              variant="small"
              color="blue-gray"
              className="ml-1 font-bold"
              onClick={onClose}
            >
              <Link to="/SignupModal">Sign up</Link>
            </Typography>
          </Typography>
        </CardFooter>
      </Card>
    </Dialog>
  );
}

export default SigninModal;
