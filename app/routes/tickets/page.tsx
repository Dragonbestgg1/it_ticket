"use client";

import { useEffect, useState } from "react";
import style from "../../styles/tickets.module.css";
import Header from "@/app/components/ui/Header";

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
    const [clientNameFilter, setClientNameFilter] = useState("");
    const [titleFilter, setTitleFilter] = useState("");
    const [priorityFilter, setPriorityFilter] = useState("");
    const [statusFilter, setStatusFilter] = useState(""); // New status filter state
    const [dateFilter, setDateFilter] = useState("");

    useEffect(() => {
        let isMounted = true;

        const fetchAllTickets = async () => {
            try {
                const response = await fetch("/api/ticketStats");
                const data = await response.json();

                if (isMounted) {
                    const sortedData = data.sort((a: Ticket, b: Ticket) => a.id - b.id);
                    setTicketData(sortedData);
                }
            } catch (error) {
                if (isMounted) console.error("Error fetching ticket data:", error);
            }
        };

        fetchAllTickets();

        return () => {
            isMounted = false;
        };
    }, []);

    const filteredTickets = ticketData.filter((ticket) => {
        return (
            (clientNameFilter === "" || ticket.client_name.toLowerCase().includes(clientNameFilter.toLowerCase())) &&
            (titleFilter === "" || ticket.title.toLowerCase().includes(titleFilter.toLowerCase())) &&
            (priorityFilter === "" || ticket.priority === priorityFilter) &&
            (statusFilter === "" || ticket.status === statusFilter) && // Status filter applied
            (dateFilter === "" || ticket.created_at.startsWith(dateFilter))
        );
    });

    return (
        <div className={`${style.main}`}>
            <Header />

            {/* Table */}
            <div className={`${style.tableContainer}`}>
                <table className={`${style.table}`}>
                    <thead>
                        <tr>
                            <th className={`${style.input}`}>ID</th>
                            <th>
                                <input className={`${style.input}`} type="text" placeholder="Client Name" value={clientNameFilter} onChange={(e) => setClientNameFilter(e.target.value)} />
                            </th>
                            <th>
                                <input className={`${style.input}`} type="text" placeholder="Title" value={titleFilter} onChange={(e) => setTitleFilter(e.target.value)} />
                            </th>
                            <th>
                                <select className={`${style.input}`} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                                    <option className={`${style.color}`} value="">All Statuses</option>
                                    <option className={`${style.color}`} value="open">Open</option>
                                    <option className={`${style.color}`} value="closed">Closed</option>
                                    <option className={`${style.color}`} value="in_progress">In Progress</option>
                                </select>
                            </th>
                            <th>
                                <select className={`${style.input}`} value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)}>
                                    <option className={`${style.color}`} value="">All Priorities</option>
                                    <option className={`${style.color}`} value="low">Low</option>
                                    <option className={`${style.color}`} value="medium">Medium</option>
                                    <option className={`${style.color}`} value="high">High</option>
                                    <option className={`${style.color}`} value="critical">Critical</option>
                                </select>
                            </th>
                            <th>
                                <input
                                    className={`${style.input}`}
                                    type="date"
                                    placeholder="Created At"
                                    value={dateFilter}
                                    onChange={(e) => setDateFilter(e.target.value)}
                                />
                            </th>
                            <th className={`${style.input}`}>Updated At</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredTickets.map((ticket) => (
                            <tr key={ticket.id}>
                                <td>{ticket.id}</td>
                                <td>{ticket.client_name}</td>
                                <td>{ticket.title}</td>
                                <td>{ticket.status}</td>
                                <td>{ticket.priority}</td>
                                <td>{new Date(ticket.created_at).toLocaleDateString("en-US")}</td>
                                <td>{new Date(ticket.updated_at).toLocaleDateString("en-US")}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}