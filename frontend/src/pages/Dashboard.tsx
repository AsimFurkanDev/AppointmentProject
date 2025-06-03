import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Container,
  Typography,
  Card,
  CardContent,
  Button,
  Alert,
  Box,
} from "@mui/material";

interface Appointment {
  _id: string;
  date: string;
  startTime: string;
  endTime: string;
  isAvailable: boolean;
}

const Dashboard = () => {
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    const fetchAppointments = async () => {
      try {
        const response = await axios.get(
          "http://localhost:5000/api/appointments/available",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setAppointments(response.data);
      } catch (error: any) {
        setError(
          error.response?.data?.message || "Failed to fetch appointments"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchAppointments();
  }, [navigate]);

  const handleReserve = async (id: string) => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `http://localhost:5000/api/appointments/${id}/reserve`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Remove the reserved appointment from the list
      setAppointments(appointments.filter((apt) => apt._id !== id));
    } catch (error: any) {
      setError(
        error.response?.data?.message || "Failed to reserve appointment"
      );
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (loading) {
    return (
      <Container>
        <Typography>Loading...</Typography>
      </Container>
    );
  }

  return (
    <Container>
      <Box sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Available Appointments
        </Typography>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        <Box
          sx={{
            display: "grid",
            gap: 3,
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
                <Typography color="textSecondary">
                  Time: {appointment.startTime} - {appointment.endTime}
                </Typography>
                <Button
                  variant="contained"
                  color="primary"
                  sx={{ mt: 2 }}
                  onClick={() => handleReserve(appointment._id)}
                >
                  Reserve
                </Button>
              </CardContent>
            </Card>
          ))}
          {appointments.length === 0 && (
            <Box sx={{ gridColumn: "1/-1" }}>
              <Typography>No available appointments found.</Typography>
            </Box>
          )}
        </Box>
      </Box>
    </Container>
  );
};

export default Dashboard;
