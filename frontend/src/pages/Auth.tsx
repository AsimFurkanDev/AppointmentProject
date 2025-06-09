import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Container,
  Typography,
  TextField,
  Button,
  Alert,
  Paper,
  ToggleButton,
  ToggleButtonGroup,
} from "@mui/material";

interface AuthFormData {
  name?: string;
  email: string;
  password: string;
}

type AuthMode = "login" | "register";

const Auth = () => {
  const navigate = useNavigate();
  const [mode, setMode] = useState<AuthMode>("login");
  const [formData, setFormData] = useState<AuthFormData>({
    email: "",
    password: "",
  });
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState(false);

  // Check for token on component mount
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      navigate("/dashboard");
    }
  }, [navigate]);

  const handleModeChange = (
    _event: React.MouseEvent<HTMLElement>,
    newMode: AuthMode | null
  ) => {
    if (newMode) {
      setMode(newMode);
      setError("");
      setFormData({
        ...(newMode === "register" ? { name: "" } : {}),
        email: "",
        password: "",
      });
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    // Basic validation
    if (mode === "register" && !formData.name) {
      setError("Name is required");
      setLoading(false);
      return;
    }
    if (!formData.email || !formData.password) {
      setError("All fields are required");
      setLoading(false);
      return;
    }

    try {
      const endpoint =
        mode === "login" ? "/api/auth/login" : "/api/auth/register";
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            `${mode === "login" ? "Login" : "Registration"} failed`
        );
      }

      // Save token and redirect
      localStorage.setItem("token", data.token);
      navigate("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container component="main" maxWidth="xs">
      <Box
        sx={{
          marginTop: 8,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <Paper elevation={3} sx={{ p: 4, width: "100%" }}>
          <Box sx={{ mb: 3, display: "flex", justifyContent: "center" }}>
            <ToggleButtonGroup
              value={mode}
              exclusive
              onChange={handleModeChange}
              aria-label="authentication mode"
            >
              <ToggleButton value="login" aria-label="login">
                Login
              </ToggleButton>
              <ToggleButton value="register" aria-label="register">
                Register
              </ToggleButton>
            </ToggleButtonGroup>
          </Box>

          <Typography component="h1" variant="h5" align="center" gutterBottom>
            {mode === "login" ? "Sign In" : "Create Account"}
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit} noValidate>
            {mode === "register" && (
              <TextField
                margin="normal"
                required
                fullWidth
                id="name"
                label="Full Name"
                name="name"
                autoComplete="name"
                autoFocus={mode === "register"}
                value={formData.name || ""}
                onChange={handleChange}
                error={
                  mode === "register" &&
                  !formData.name &&
                  formData.name !== undefined
                }
                helperText={
                  mode === "register" &&
                  !formData.name &&
                  formData.name !== undefined
                    ? "Name is required"
                    : ""
                }
              />
            )}
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="Email Address"
              name="email"
              autoComplete="email"
              autoFocus={mode === "login"}
              value={formData.email}
              onChange={handleChange}
              error={!formData.email && formData.email !== ""}
              helperText={
                !formData.email && formData.email !== ""
                  ? "Email is required"
                  : ""
              }
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Password"
              type="password"
              id="password"
              autoComplete={
                mode === "login" ? "current-password" : "new-password"
              }
              value={formData.password}
              onChange={handleChange}
              error={!formData.password && formData.password !== ""}
              helperText={
                !formData.password && formData.password !== ""
                  ? "Password is required"
                  : ""
              }
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
              disabled={loading}
            >
              {loading
                ? mode === "login"
                  ? "Signing in..."
                  : "Registering..."
                : mode === "login"
                ? "Sign In"
                : "Register"}
            </Button>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default Auth;
