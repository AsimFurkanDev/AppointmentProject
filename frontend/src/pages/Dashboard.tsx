import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  AppBar,
  Toolbar,
  Typography,
  Button,
  Container,
  CircularProgress,
  Card,
  CardContent,
  Alert,
  CardActions,
  Tabs,
  Tab,
} from "@mui/material";
import LogoutIcon from "@mui/icons-material/Logout";
import { authFetch } from "../utils/authFetch";

interface Appointment {
  _id: string;
  date: string;
  startTime: string;
  endTime: string;
}

type TabType = "available" | "my-appointments";

const Dashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabType>("available");
  const [availableAppointments, setAvailableAppointments] = useState<
    Appointment[]
  >([]);
  const [myAppointments, setMyAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [reservingId, setReservingId] = useState<string | null>(null);

  useEffect(() => {
    if (activeTab === "available") {
      fetchAvailableAppointments();
    } else {
      fetchMyAppointments();
    }
  }, [activeTab]);

  const fetchAvailableAppointments = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await authFetch("/api/appointments", {}, navigate);

      if (!response.ok) {
        throw new Error("Failed to fetch available appointments");
      }

      const data = await response.json();
      setAvailableAppointments(data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "An error occurred while fetching appointments"
      );
    } finally {
      setLoading(false);
    }
  };

  const fetchMyAppointments = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await authFetch(
        "/api/appointments?userOnly=true",
        {},
        navigate
      );

      if (!response.ok) {
        throw new Error("Failed to fetch your appointments");
      }

      const data = await response.json();
      setMyAppointments(data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "An error occurred while fetching your appointments"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleReserve = async (appointmentId: string) => {
    setError("");
    setReservingId(appointmentId);

    try {
      const response = await authFetch(
        `/api/appointments/${appointmentId}/reserve`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
        },
        navigate
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Failed to reserve appointment");
      }

      // Refresh both appointment lists
      await Promise.all([fetchAvailableAppointments(), fetchMyAppointments()]);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to reserve appointment"
      );
    } finally {
      setReservingId(null);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/auth");
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const handleTabChange = (_event: React.SyntheticEvent, newValue: TabType) => {
    setActiveTab(newValue);
  };

  const renderAppointments = (appointments: Appointment[]) => {
    if (loading) {
      return (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
          <CircularProgress />
        </Box>
      );
    }

    if (appointments.length === 0) {
      return (
        <Typography
          variant="h6"
          color="textSecondary"
          sx={{ mt: 4, textAlign: "center" }}
        >
          {activeTab === "available"
            ? "No appointments available"
            : "You have no reserved appointments"}
        </Typography>
      );
    }

    return (
      <Box
        sx={{
          display: "grid",
          gap: 3,
          mt: 3,
          gridTemplateColumns: {
            xs: "1fr",
            sm: "repeat(2, 1fr)",
            md: "repeat(3, 1fr)",
          },
        }}
      >
        {appointments.map((appointment) => (
          <Card key={appointment._id}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                {formatDate(appointment.date)}
              </Typography>
              <Typography color="textSecondary" gutterBottom>
                Time: {appointment.startTime} - {appointment.endTime}
              </Typography>
            </CardContent>
            {activeTab === "available" && (
              <CardActions sx={{ justifyContent: "flex-end", p: 2 }}>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => handleReserve(appointment._id)}
                  disabled={reservingId === appointment._id}
                >
                  {reservingId === appointment._id ? "Reserving..." : "Reserve"}
                </Button>
              </CardActions>
            )}
          </Card>
        ))}
      </Box>
    );
  };

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Dashboard
          </Typography>
          <Button
            color="inherit"
            onClick={handleLogout}
            startIcon={<LogoutIcon />}
          >
            Logout
          </Button>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            aria-label="appointment tabs"
          >
            <Tab label="Available Appointments" value="available" />
            <Tab label="My Appointments" value="my-appointments" />
          </Tabs>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mt: 3, mb: 2 }}>
            {error}
          </Alert>
        )}

        {renderAppointments(
          activeTab === "available" ? availableAppointments : myAppointments
        )}
      </Container>
    </Box>
  );
};

export default Dashboard;
