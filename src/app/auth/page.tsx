"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { Snackbar, Alert } from "@mui/material";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { Label } from "../components/ui/label";
import { styles } from "../styles/styles";
import Link from "next/link";
import CircularProgress from "@mui/material/CircularProgress";

const Login = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState<boolean>(false);
  const [open, setOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  const handleClose = () => setOpen(false);

  const handleAuth = async () => {
    if (!email || !password) {
      setErrorMessage("Please fill in all fields.");
      setOpen(true);
      return; 
    }
    try {
      setLoading(true);
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setErrorMessage(error.message);
        setOpen(true);
      } else {
        router.push("/");
      }
    } catch (error: any) {
      console.error(error.message);
      setErrorMessage("An unexpected error occurred.");
      setOpen(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen w-full items-center justify-center">
      <div className="relative bg-[rgba(255,255,255,0.4)] rounded-lg shadow-md h-[480px] flex flex-col gap-4 items-center justify-center p-4">
        <h1 style={styles.introductionQuestion}>Sign in</h1>
        <div className="flex flex-col w-96 gap-8 p-4">
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
          <Button type="submit" onClick={handleAuth}>
          {loading ? <CircularProgress size={20} color="inherit" /> : "Log in"}
          </Button>
        </div>
        <div className="flex flex-row w-full items-center justify-between p-4">
          <h4 style={styles.lightText}>Don't have an account?</h4>
          <Link href={"/auth/register"}>
            <h4 style={styles.registerLink}>Register</h4>
          </Link>
        </div>
      </div>
      {errorMessage && (
        <Snackbar
          open={open}
          autoHideDuration={6000}
          onClose={handleClose}
          anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        >
          <Alert
            onClose={handleClose}
            severity="error"
            variant="filled"
            sx={{ width: "100%" }}
          >
            {errorMessage}
          </Alert>
        </Snackbar>
      )}
    </div>
  );
};

export default Login;
