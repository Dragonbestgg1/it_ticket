"use client";

import { useEffect, useState, useRef, useMemo } from "react";
import dynamic from "next/dynamic";
import style from "../../styles/statistics.module.css";
import { Bar } from "react-chartjs-2";
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
} from "chart.js";

const Header = dynamic(() => import("../../components/ui/Header"), { ssr: false });

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

interface Ticket {
    id: number;
    client_name: string;
    title: string;
    status: string;
    priority: string;
    created_at: string;
    updated_at: string;
}

export default function Statistics() {
    const [ticketData, setTicketData] = useState<Ticket[]>([]);
    const headerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        let isMounted = true;

        const fetchAllTickets = async () => {
            try {
                const response = await fetch("/api/ticketStats");
                const data = await response.json();
                if (isMounted) setTicketData(data);
            } catch (error) {
                if (isMounted) console.error("Error fetching ticket data:", error);
            }
        };

        fetchAllTickets();

        return () => {
            isMounted = false; // Cleanup to prevent state updates after unmounting
        };
    }, []);

    const now = new Date();

    //Loop for ticket statistics
    const { priorityCounts, overdueTicketCounts, recentTicketCounts, closedPriorityCounts, activeTickets, closedTickets } = useMemo(() => {
        const priorityCounts: Record<string, number> = {};
        const overdueTicketCounts: Record<string, number> = {};
        const recentTicketCounts: Record<string, number> = {};
        const closedPriorityCounts: Record<string, number> = {};

        const activeTickets: Ticket[] = [];
        const closedTickets: Ticket[] = [];

        ticketData.forEach((ticket) => {
            const updatedDate = new Date(ticket.updated_at);
            const diffDays = (now.getTime() - updatedDate.getTime()) / (1000 * 60 * 60 * 24);

            priorityCounts[ticket.priority] = (priorityCounts[ticket.priority] || 0) + 1;

            if (diffDays > 5) {
                overdueTicketCounts[ticket.priority] = (overdueTicketCounts[ticket.priority] || 0) + 1;
            } else {
                recentTicketCounts[ticket.priority] = (recentTicketCounts[ticket.priority] || 0) + 1;
            }

            if (ticket.status === "closed") {
                closedTickets.push(ticket);
                closedPriorityCounts[ticket.priority] = (closedPriorityCounts[ticket.priority] || 0) + 1;
            } else {
                activeTickets.push(ticket);
            }
        });

        return { priorityCounts, overdueTicketCounts, recentTicketCounts, closedPriorityCounts, activeTickets, closedTickets };
    }, [ticketData]);

    // Charts
    const priorityChartData = useMemo(() => ({
        labels: Object.keys(priorityCounts),
        datasets: [
            {
                label: "Number of Tickets by Priority",
                data: Object.values(priorityCounts),
                backgroundColor: ["green", "yellow", "orange", "red"],
            },
        ],
    }), [priorityCounts]);

    const overdueChartData = useMemo(() => ({
        labels: Object.keys(overdueTicketCounts),
        datasets: [
            {
                label: "Overdue Tickets by Priority (>5 Days Old)",
                data: Object.values(overdueTicketCounts),
                backgroundColor: ["green", "yellow", "orange", "red"],
            },
        ],
    }), [overdueTicketCounts]);

    const recentChartData = useMemo(() => ({
        labels: Object.keys(recentTicketCounts),
        datasets: [
            {
                label: "Recently Updated Tickets by Priority (Last 5 Days)",
                data: Object.values(recentTicketCounts),
                backgroundColor: ["green", "yellow", "orange", "red"],
            },
        ],
    }), [recentTicketCounts]);

    const closedVsOpenChartData = useMemo(() => ({
        labels: ["Open Tickets", "Closed - Low", "Closed - Medium", "Closed - High", "Closed - Critical"],
        datasets: [
            {
                label: "Closed vs Open Tickets (Sorted by Priority)",
                data: [
                    activeTickets.length,
                    closedPriorityCounts["low"] || 0,
                    closedPriorityCounts["medium"] || 0,
                    closedPriorityCounts["high"] || 0,
                    closedPriorityCounts["critical"] || 0,
                ],
                backgroundColor: ["green", "lightgreen", "yellow", "orange", "red"],
            },
        ],
    }), [activeTickets.length, closedPriorityCounts]);

    return (
        <div className={`${style.main}`}>
            <div ref={headerRef} className={`${style.lazy} ${style.visible}`}>
                <Header />
            </div>

            <h2 className={`${style.statsTitle}`}>Ticket Statistics</h2>
            <div className={`${style.statsAlignment} ${style.lazy} ${style.visible}`}>
                {/* Priority-Based Ticket Distribution */}
                <div className={style.chartContainer}>
                    <h3>Tickets by Priority</h3>
                    <Bar data={priorityChartData} />
                </div>

                {/* Overdue Tickets (Grouped by Priority) */}
                <div className={style.chartContainer}>
                    <h3>Overdue Tickets by Priority (Older than 5 Days)</h3>
                    <Bar data={overdueChartData} />
                </div>

                {/* Recently Updated Tickets (Grouped by Priority) */}
                <div className={style.chartContainer}>
                    <h3>Recently Updated Tickets by Priority (Last 5 Days)</h3>
                    <Bar data={recentChartData} />
                </div>

                {/* Closed vs Open Tickets (Sorted by Priority) */}
                <div className={style.chartContainer}>
                    <h3>Closed vs Open Tickets (Sorted by Priority)</h3>
                    <Bar data={closedVsOpenChartData} />
                </div>
            </div>
        </div>
    );
}