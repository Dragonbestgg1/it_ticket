"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import style from "../../styles/page.module.css";

// Lazy-load Header component
const Header = dynamic(() => import("../../components/ui/Header"), { ssr: false });

export default function Home() {
  const [ticketStats, setTicketStats] = useState<{ totalTickets: number; openTickets: number } | null>(null);
  const [showTotalTickets, setShowTotalTickets] = useState(true); // Toggles between stats

  // Toggle between totalTickets and openTickets every 7 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setShowTotalTickets((prev) => !prev); // Switch between stats
    }, 7000);

    return () => clearInterval(interval);
  }, []);

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
    <div className={style.main}>
      <Header />
      <h1 className={style.title}><p className={style.color}>IT</p> tickets</h1>
      <div className={style.statsDetails}>
        <p className={`${style.statsTitle}`}>Stats details:</p>
        {ticketStats && (
          <div className={style.fadeContainer}>
            <div className={`${style.fade} ${showTotalTickets ? style.visible : style.hidden}`}>
              <p className={`${style.details}`}>Total Tickets: {ticketStats.totalTickets}</p>
            </div>

            <div className={`${style.fade} ${showTotalTickets ? style.hidden : style.visible}`}>
              <p className={`${style.details}`}>Open Tickets: {ticketStats.openTickets}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}