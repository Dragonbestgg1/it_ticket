"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import styles from "../../styles/page.module.css";

export default function Home() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
   const [ticketStats, setTicketStats] = useState({ totalTickets: 0, openTickets: 0 });

  const handleUpload = async () => {
    setLoading(true);
    setMessage("");

    try {
      const response = await fetch("/api/saveData", { method: "POST" });

      const data = await response.json();
      setMessage(data.message);
    } catch (error) {
      setMessage("Error uploading data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch("/api/ticketStats");
        const data = await response.json();
        setTicketStats(data);
      } catch (error) {
        console.error("Error fetching ticket stats:", error);
      }
    };

    fetchStats();
  }, []);

  return (
    <div className={styles.main}>
      <h1 className={styles.title}>Welcome to My Page</h1>
      <p>Total Tickets: {ticketStats.totalTickets}</p>
      <p>Open Tickets: {ticketStats.openTickets}</p>

    </div>
  );
}