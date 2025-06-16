"use client";

import { useEffect, useState, useRef } from "react";
import dynamic from "next/dynamic";
import style from "../../styles/page.module.css";

const Header = dynamic(() => import("../../components/ui/Header"), { ssr: false });

export default function Home() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [ticketStats, setTicketStats] = useState<{ totalTickets: number; openTickets: number } | null>(null);
  const [showTotalTickets, setShowTotalTickets] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);

  // Lazy loading effect
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add(style.visible);
          }
        });
      },
      { threshold: 0.1 }
    );

    const elements = document.querySelectorAll(`.${style.lazy}`);
    elements.forEach((el) => observer.observe(el));

    return () => {
      elements.forEach((el) => observer.unobserve(el));
    };
  }, []);

  // Toggle between totalTickets and openTickets every 7 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setShowTotalTickets((prev) => !prev);
    }, 7000);

    return () => clearInterval(interval);
  }, []);

  // Handle upload button click
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

  // Fetch ticket stats from the API
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch("/api/homeStats");
        const data = await response.json();
        setTicketStats(data);
      } catch (error) {
        console.error("Error fetching ticket stats:", error);
      }
    };

    fetchStats();
  }, []);

  return (
    <div className={`${style.main}`} ref={containerRef}>
      <div ref={headerRef} className={`${style.lazy}`}>
        <Header />
      </div>
      <h1 className={`${style.title} ${style.lazy}`}>
        <p className={style.color}>IT</p> tickets
      </h1>
      <div className={`${style.statsDetails} ${style.lazy}`}>
        <p className={`${style.statsTitle}`}>Stats details:</p>
        {ticketStats ? (
          <div className={`${style.fadeContainer} ${style.lazy} ${style.visible}`}>
            <div className={`${style.fade} ${showTotalTickets ? style.visible : style.hidden}`}>
              <p className={`${style.details}`}>Total Tickets: {ticketStats.totalTickets}</p>
            </div>
            <div className={`${style.fade} ${showTotalTickets ? style.hidden : style.visible}`}>
              <p className={`${style.details}`}>Open Tickets: {ticketStats.openTickets}</p>
            </div>
          </div>
        ) : (
          <p>Loading stats or unavailable...</p>
        )}
      </div>
      <div className={`${style.alignment} ${style.lazy}`}>
        <div className={`${style.box} ${style.lazy}`}>
          <h1 className={`${style.boxTitle}`}>About us</h1>
          <p className={`${style.boxText}`}>
            We are a team of IT professionals dedicated to providing top-notch support and solutions for all your technical needs. Our mission is to ensure that your IT systems run smoothly and efficiently, allowing you to focus on what matters most.
          </p>
        </div>
        <div className={`${style.box} ${style.lazy}`}>
          <h1 className={`${style.boxTitle}`}>What page does</h1>
          <p className={`${style.boxText}`}>
            This page serves as the main hub for managing IT tickets. It provides statistics on ticket counts, allows users to create tickets, and offers insights into the current status of IT support requests. The interface is designed to be user-friendly and informative, ensuring that users can easily navigate and access the information they need.
          </p>
        </div>
      </div>
    </div>
  );
}