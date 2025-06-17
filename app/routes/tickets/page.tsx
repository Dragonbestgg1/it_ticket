"use client";

import { useEffect, useState } from "react";
import Modal from "react-modal";
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
    const [statusFilter, setStatusFilter] = useState("");
    const [dateFilter, setDateFilter] = useState("");
    const [modalIsOpen, setModalIsOpen] = useState(false);
    const [newTicket, setNewTicket] = useState({
        client_name: "",
        title: "",
        status: "open",
        priority: "medium"
    });
    const [errors, setErrors] = useState<{
        client_name?: string;
        title?: string;
        priority?: string
    }>({});
    const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
    const [editModalIsOpen, setEditModalIsOpen] = useState(false);
    const [confirmDeleteModalIsOpen, setConfirmDeleteModalIsOpen] = useState(false);


    const validateInputs = () => {
        let newErrors: any = {};

        if (!newTicket.client_name.trim()) {
            newErrors.client_name = "Client name is required.";
        }

        if (!newTicket.title.trim()) {
            newErrors.title = "Title is required.";
        }

        if (!["low", "medium", "high", "critical"].includes(newTicket.priority)) {
            newErrors.priority = "Priority must be valid.";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    useEffect(() => {
        Modal.setAppElement(document.body);
    }, []);

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
            (statusFilter === "" || ticket.status === statusFilter) &&
            (dateFilter === "" || ticket.created_at.startsWith(dateFilter))
        );
    });

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setNewTicket({ ...newTicket, [e.target.name]: e.target.value });
    };

    const handleSubmit = async () => {
        if (!validateInputs()) return;

        try {
            const response = await fetch("/api/newTicket", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(newTicket)
            });

            if (response.ok) {
                // Fetch updated tickets
                const updatedResponse = await fetch("/api/ticketStats");
                const updatedTickets = await updatedResponse.json();

                const sortedTickets = updatedTickets.sort((a: Ticket, b: Ticket) => a.id - b.id);
                setTicketData(sortedTickets);

                setModalIsOpen(false);
                setNewTicket({ client_name: "", title: "", status: "open", priority: "medium" });
                setErrors({});
            }
        } catch (error) {
            console.error("Error adding ticket:", error);
        }
    };

    const openEditModal = (ticket: Ticket) => {
        setSelectedTicket({
            id: ticket.id,
            client_name: ticket.client_name || "",
            title: ticket.title || "",
            status: ticket.status || "open",
            priority: ticket.priority || "medium",
            created_at: ticket.created_at || new Date().toISOString(),
            updated_at: ticket.updated_at || new Date().toISOString(),
        });
        setEditModalIsOpen(true);
    };


    const handleUpdate = async () => {
        if (!selectedTicket) return;

        try {
            const response = await fetch(`/api/updateTicket/${selectedTicket.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(selectedTicket),
            });

            if (response.ok) {
                const updatedResponse = await fetch("/api/ticketStats");
                const updatedTickets = await updatedResponse.json();
                setTicketData(updatedTickets.sort((a: Ticket, b: Ticket) => a.id - b.id));
                setEditModalIsOpen(false);
            }
        } catch (error) {
            console.error("Error updating ticket:", error);
        }
    };

    const handleDelete = async () => {
        if (!selectedTicket) return;

        try {
            const response = await fetch(`/api/deleteTicket/${selectedTicket.id}`, { method: "DELETE" });

            if (response.ok) {
                const updatedResponse = await fetch("/api/ticketStats");
                const updatedTickets = await updatedResponse.json();
                setTicketData(updatedTickets.sort((a: Ticket, b: Ticket) => a.id - b.id));

                setEditModalIsOpen(false); // Close edit modal
                setConfirmDeleteModalIsOpen(false); // Close delete confirmation modal
            } else {
                console.error("Failed to delete ticket.");
            }
        } catch (error) {
            console.error("Error deleting ticket:", error);
        }
    };

    return (
        <div className={`${style.main}`}>
            <Header />
            <button onClick={() => setModalIsOpen(true)} className={style.button}>
                Submit a Ticket +
            </button>

            <Modal className={`${style.modal}`} isOpen={modalIsOpen} onRequestClose={() => setModalIsOpen(false)} ariaHideApp={false}>
                <h2 className={`${style.modalTitle}`}>Create new Ticket</h2>
                <input
                    type="text"
                    name="client_name"
                    placeholder="Client Name"
                    className={`${style.modalInput}`}
                    value={newTicket.client_name}
                    onChange={handleInputChange}
                />
                {errors.client_name && <p className={`${style.error}`}>{errors.client_name}</p>}

                <input
                    type="text"
                    name="title"
                    placeholder="Title"
                    className={`${style.modalInput}`}
                    value={newTicket.title}
                    onChange={handleInputChange}
                />
                {errors.title && <p className={`${style.error}`}>{errors.title}</p>}

                <select
                    name="priority"
                    value={newTicket.priority}
                    onChange={handleInputChange}
                    className={`${style.modalInput} ${style.pointer}`}
                >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="critical">Critical</option>
                </select>
                {errors.priority && <p className={`${style.error}`}>{errors.priority}</p>}
                <button className={`${style.modalSubmit}`} onClick={handleSubmit}>Submit</button>
                <button className={`${style.modalCancel}`} onClick={() => setModalIsOpen(false)}>Close</button>
            </Modal>

            <div className={`${style.tableContainer}`}>
                <h1 className={`${style.title}`}>All Tickets</h1>
                <table className={`${style.table}`}>
                    <thead style={{ visibility: (modalIsOpen || editModalIsOpen) ? "hidden" : "visible" }}>
                        <tr>
                            <th className={`${style.input}`}>ID</th>
                            <th>
                                <input className={`${style.input} ${style.pointer}`} type="text" placeholder="Client Name" value={clientNameFilter} onChange={(e) => setClientNameFilter(e.target.value)} />
                            </th>
                            <th>
                                <input className={`${style.input} ${style.pointer}`} type="text" placeholder="Title" value={titleFilter} onChange={(e) => setTitleFilter(e.target.value)} />
                            </th>
                            <th>
                                <select className={`${style.input} ${style.pointer}`} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                                    <option className={`${style.color}`} value="">All Statuses</option>
                                    <option className={`${style.color}`} value="open">Open</option>
                                    <option className={`${style.color}`} value="closed">Closed</option>
                                    <option className={`${style.color}`} value="in_progress">In Progress</option>
                                </select>
                            </th>
                            <th>
                                <select className={`${style.input} ${style.pointer}`} value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)}>
                                    <option className={`${style.color}`} value="">All Priorities</option>
                                    <option className={`${style.color}`} value="low">Low</option>
                                    <option className={`${style.color}`} value="medium">Medium</option>
                                    <option className={`${style.color}`} value="high">High</option>
                                    <option className={`${style.color}`} value="critical">Critical</option>
                                </select>
                            </th>
                            <th>
                                <input
                                    className={`${style.input} ${style.pointer}`}
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
                            <tr key={ticket.id} onClick={() => openEditModal(ticket)} className={style.clickableRow}>
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
                <Modal className={`${style.modal}`} isOpen={editModalIsOpen} onRequestClose={() => setEditModalIsOpen(false)} ariaHideApp={false}>
                    <h2 className={`${style.modalTitle}`}>Edit Ticket</h2>

                    <input
                        type="text"
                        name="client_name"
                        placeholder="Client Name"
                        className={`${style.modalInput}`}
                        value={selectedTicket?.client_name || ""}
                        onChange={(e) => setSelectedTicket({ ...selectedTicket, client_name: e.target.value })}
                    />

                    <input
                        type="text"
                        name="title"
                        placeholder="Title"
                        className={`${style.modalInput}`}
                        value={selectedTicket?.title || ""}
                        onChange={(e) => setSelectedTicket({ ...selectedTicket, title: e.target.value })}
                    />

                    <select
                        name="priority"
                        value={selectedTicket?.priority || ""}
                        onChange={(e) => setSelectedTicket({ ...selectedTicket, priority: e.target.value })}
                        className={`${style.modalInput} ${style.pointer}`}
                    >
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                        <option value="critical">Critical</option>
                    </select>

                    <select
                        name="status"
                        value={selectedTicket?.status || ""}
                        onChange={(e) => setSelectedTicket({ ...selectedTicket, status: e.target.value })}
                        className={`${style.modalInput} ${style.pointer}`}
                    >
                        <option value="open">Open</option>
                        <option value="closed">Closed</option>
                        <option value="in_progress">In Progress</option>
                    </select>

                    <button className={`${style.modalSubmit}`} onClick={handleUpdate}>Update Ticket</button>
                    <button className={`${style.modalCancel}`} onClick={() => setEditModalIsOpen(false)}>Close</button>
                    <button className={`${style.deleteButton}`} onClick={() => setConfirmDeleteModalIsOpen(true)}>
                        Delete Ticket
                    </button>
                </Modal>
                <Modal
                    className={`${style.modalConfirm}`}
                    isOpen={confirmDeleteModalIsOpen}
                    onRequestClose={() => setConfirmDeleteModalIsOpen(false)}
                    ariaHideApp={false}
                >
                    <h2 className={`${style.modalTitle}`}>Confirm Delete</h2>
                    <p>Are you sure you want to delete this ticket?</p>

                    <button className={`${style.modalSubmit}`} onClick={handleDelete}>
                        Yes, Delete
                    </button>
                    <button className={`${style.modalCancel}`} onClick={() => setConfirmDeleteModalIsOpen(false)}>
                        Cancel
                    </button>
                </Modal>
            </div>
        </div>
    );
}