
import { useState } from "react";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail
} from "firebase/auth";
import { auth } from "@/firebase";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function LoginPage() {

  const [email,setEmail] = useState("");
  const [password,setPassword] = useState("");
  const [mode,setMode] = useState("login");

  const handleLogin = async () => {
    try {
      await signInWithEmailAndPassword(auth,email,password);
    } catch {
      alert("Invalid email or password");
    }
  };

  const handleSignup = async () => {
    try {
      await createUserWithEmailAndPassword(auth,email,password);
      alert("Account created");
    } catch (e:any) {
      alert(e.message);
    }
  };

  const handleForgot = async () => {
    if(!email){
      alert("Enter email first");
      return;
    }
    await sendPasswordResetEmail(auth,email);
    alert("Password reset email sent");
  };

  return (

    <div className="flex items-center justify-center h-screen bg-muted">

      <Card className="w-[350px]">

        <CardHeader>
          <CardTitle className="text-center">
            Hello Buddy 👋
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">

          <Input
            placeholder="Email"
            value={email}
            onChange={(e)=>setEmail(e.target.value)}
          />

          <Input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e)=>setPassword(e.target.value)}
          />

          {mode === "login" && (
            <Button className="w-full" onClick={handleLogin}>
              Login
            </Button>
          )}

          {mode === "signup" && (
            <Button className="w-full" onClick={handleSignup}>
              Create Account
            </Button>
          )}

          <div className="text-sm text-center space-y-1">

            <p
              className="cursor-pointer text-blue-600"
              onClick={()=>setMode(mode==="login"?"signup":"login")}
            >
              {mode==="login" ? "Create account" : "Back to login"}
            </p>

            <p
              className="cursor-pointer text-blue-600"
              onClick={handleForgot}
            >
              Forgot password
            </p>

          </div>

        </CardContent>

      </Card>

    </div>

  );

}

