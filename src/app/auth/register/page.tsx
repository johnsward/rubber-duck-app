"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { Snackbar, Alert } from "@mui/material";
import { Input } from "../../components/ui/input";
import { Button } from "../../components/ui/button";
import { Label } from "../../components/ui/label";
import { styles } from "../../styles/styles";
import Link from "next/link";
import CircularProgress from "@mui/material/CircularProgress";

const Register = () => {
  const [firstName, setFirstName] = useState<string>("");
  const [lastName, setLastName] = useState<string>("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState<boolean>(false);
  const [openError, setOpenError] = useState(false);
  const [openSuccess, setOpenSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [successMessage, setSuccessMessage] = useState<string>("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  const handleCloseError = () => setOpenError(false);
  const handleCloseSuccess = () => setOpenSuccess(false);

  const handleRegister = async () => {
    if (!email || !firstName || !lastName || !password) {
      setErrorMessage("Please fill in all fields.");
      setOpenError(true);
      return;
    }
    try {
      setLoading(true);

      const { data, error } = await supabase.auth.signUp({ email, password });

      if (error) {
        setErrorMessage(error.message);
        setOpenError(true);
      } else {
        // Notify the user about the confirmation email
        setSuccessMessage(
          "Registration successful! Please check your email for the confirmation link."
        );
        setOpenSuccess(true);

        const { error: profileError } = await supabase.from("users").insert({
          user_id: data.user?.id,
          firstname: firstName,
          lastname: lastName,
          email: email,
          created_at: new Date(),
        });

        if (profileError) {
          console.error("Error inserting user profile:", profileError.message);
        }

        // Redirect after a short delay
        setTimeout(() => router.push("/auth"), 5000);
      }
    } catch (error: any) {
      console.error(error.message);
      setErrorMessage("An unexpected error occurred.");
      setOpenError(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen w-full items-center justify-center">
      <div className="relative bg-[rgba(255,255,255,0.6)] rounded-lg shadow-md h-[520px] flex flex-col gap-4 items-center justify-center p-4">
        <h1 style={styles.introductionQuestion}>Sign up</h1>
        <div className="flex flex-col w-96 gap-8 p-4">
          <div className="flex flex-row gap-2 w-full">
            <div className="grid w-full max-w-sm items-center gap-1.5">
              <Label htmlFor="firstName" style={styles.lightText} />
              <Input
                type="firstName"
                value={firstName}
                placeholder="John"
                onChange={(e) => setFirstName(e.target.value)}
                required
              />
            </div>
            <div className="grid w-full max-w-sm items-center gap-1.5">
              <Label htmlFor="lastName" style={styles.lightText} />
              <Input
                type="lastName"
                value={lastName}
                placeholder="Doe"
                onChange={(e) => setLastName(e.target.value)}
                required
              />
            </div>
          </div>
          <div className="grid w-full max-w-sm items-center gap-1.5">
            <Label htmlFor="email" style={styles.lightText}>
              Email
            </Label>
            <Input
              type="email"
              value={email}
              placeholder="johndoe@example.com"
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="grid w-full max-w-sm items-center gap-1.5">
            <Label htmlFor="password" style={styles.lightText}>
              Password
            </Label>
            <Input
              value={password}
              type="password"
              placeholder="Enter your password"
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <Button type="submit" onClick={handleRegister}>
            {loading ? (
              <CircularProgress size={20} color="inherit" />
            ) : (
              "Register"
            )}
          </Button>
        </div>
        <div className="flex flex-row w-full items-center justify-between p-4">
          <h4 style={styles.lightText}>Already have an account?</h4>
          <Link href={"/auth"}>
            <h4 style={styles.registerLink}>Log in</h4>
          </Link>
        </div>
      </div>
      {errorMessage && (
        <Snackbar
          open={openError}
          autoHideDuration={6000}
          onClose={handleCloseError}
          anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        >
          <Alert
            onClose={handleCloseError}
            severity="error"
            variant="filled"
            sx={{ width: "100%" }}
          >
            {errorMessage}
          </Alert>
        </Snackbar>
      )}
      {successMessage && (
        <Snackbar
          open={openSuccess}
          autoHideDuration={6000}
          onClose={handleCloseSuccess}
          anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        >
          <Alert
            onClose={handleCloseSuccess}
            severity="success"
            variant="filled"
            sx={{ width: "100%" }}
          >
            {successMessage}
          </Alert>
        </Snackbar>
      )}
    </div>
  );
};

export default Register;
