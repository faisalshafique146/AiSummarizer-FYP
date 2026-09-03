// SignupModal.js
import React, { useState } from "react";
import { auth } from "../firebase";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import {
  Button,
  Dialog,
  Card,
  CardBody,
  CardFooter,
  Typography,
  Input,
} from "@material-tailwind/react";

function SignupModal({ onClose}) {
  const [values, setValues] = useState({
    name: "",
    email: "",
    password: "",
    repassword: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = () => {
    if (
      !values.name ||
      !values.email ||
      !values.password ||
      !values.repassword
    ) {
      setError("Please fill all the fields");
      return;
    }
    if (values.password !== values.repassword) {
      setError("Passwords do not match");
      return;
    }
    if (values.password.length < 6) {
      setError("Password should be atleast 6 characters long");
      return;
    }
    if (!values.email.includes("@")) {
      setError("Invalid Email");
      return;
    }
    setError("");
    console.log(values);
    
    createUserWithEmailAndPassword(auth, values.email, values.password)
      .then((res) => {
        const user = res.user;
        console.log(user);
        updateProfile(user, {
          displayName: values.name,
        })
          .then(() => {
            onClose();
          })
          .catch((error) => {
            console.log("Error:", error.code, error.message);
            setError(error.message);
          });
        if (user) {
          setSuccess("User created successfully");
        }
      })
      .catch((err) => {
        if (err.code === "auth/email-already-in-use") {
          setError("Email already exists. Please use a different email.");
        } else {
          console.log("Error:", err.code, err.message);
          setError(err.message);
        }
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
            Sign Up
          </Typography>
          <Typography className="font-normal" variant="paragraph" color="gray">
            Enter your Details to Sign Up.
          </Typography>
          <Typography className="-mb-4" variant="h6">
            Your Name
          </Typography>
          <Input
            label="Name"
            size="lg"
            onChange={(event) =>
              setValues((prev) => ({ ...prev, name: event.target.value }))
            }
          />
          <Typography className="-mb-4" variant="h6">
            Your Email
          </Typography>
          <Input
            label="Email"
            size="lg"
            onChange={(event) =>
              setValues((prev) => ({ ...prev, email: event.target.value }))
            }
          />
          <Typography className="-mb-4" variant="h6">
            Your Password
          </Typography>
          <Input
            label="Password"
            size="lg"
            onChange={(event) =>
              setValues((prev) => ({ ...prev, password: event.target.value }))
            }
          />
          <Typography className="-mb-4" variant="h6">
            Rewrite Password
          </Typography>
          <Input
            label="Password"
            size="lg"
            onChange={(event) =>
              setValues((prev) => ({ ...prev, repassword: event.target.value }))
            }
          />
        </CardBody>
        <CardFooter className="pt-0">
          <div className=" text-red-900">{error}</div>
          <div className=" text-green-900">{success}</div>
          <Button variant="gradient" onClick={handleSubmit} fullWidth>
            Sign In
          </Button>
        </CardFooter>
      </Card>
    </Dialog>
  );
}

export default SignupModal;
