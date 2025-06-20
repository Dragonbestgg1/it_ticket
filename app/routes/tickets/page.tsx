"use client";

import { useEffect, useState, useRef } from "react";
import Modal from "react-modal";
import style from "../../styles/tickets.module.css";
import Header from "@/app/components/ui/Header";
import DOMPurify from "dompurify";

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
    const [showFilters, setShowFilters] = useState(false);
    const [showStatusOptions, setShowStatusOptions] = useState(false);
    const [showPriorityOptions, setShowPriorityOptions] = useState(false);
    const statusDropdownRef = useRef<HTMLDivElement>(null);
    const priorityDropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (
                showStatusOptions &&
                statusDropdownRef.current &&
                !statusDropdownRef.current.contains(event.target as Node)
            ) {
                setShowStatusOptions(false);
            }

            if (
                showPriorityOptions &&
                priorityDropdownRef.current &&
                !priorityDropdownRef.current.contains(event.target as Node)
            ) {
                setShowPriorityOptions(false);
            }
        }

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [showStatusOptions, showPriorityOptions]);


    const sanitizeInput = (input: string) => {
        return DOMPurify.sanitize(input);
    };

    const validateInputs = () => {
        let newErrors: any = {};

        newTicket.client_name = sanitizeInput(newTicket.client_name.trim());
        newTicket.title = sanitizeInput(newTicket.title.trim());

        if (!newTicket.client_name) {
            newErrors.client_name = "Client name is required.";
        }

        if (!newTicket.title) {
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

    useEffect(() => {
        if (modalIsOpen || editModalIsOpen || confirmDeleteModalIsOpen) {
            setShowFilters(false);
            setShowPriorityOptions(false);
            setShowStatusOptions(false);
        }
    }, [modalIsOpen, editModalIsOpen, confirmDeleteModalIsOpen]);


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

                setEditModalIsOpen(false);
                setConfirmDeleteModalIsOpen(false);
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
                <button onClick={() => setModalIsOpen(true)} className={style.button}>
                    Submit a Ticket +
                </button>
                <div onClick={() => setShowFilters(!showFilters)} className={style.filterToggleSvg}>
                    <svg fill="currentColor" className={`${style.filterSvg}`} xmlns="http://www.w3.org/2000/svg" id="Layer_1" data-name="Layer 1" viewBox="0 0 24 24">
                        <path fill="currentColor" d="m19.239,0H4.76C2.687,0,1,1.688,1,3.761c0,.922.337,1.81.95,2.498l7.05,7.932v6.31c0,.176.092.339.243.429l5,3c.079.048.168.071.257.071.085,0,.17-.021.246-.064.157-.089.254-.256.254-.436v-9.31l7.051-7.932c.612-.688.949-1.576.949-2.498,0-2.073-1.688-3.761-3.761-3.761Zm2.063,5.595l-7.177,8.073c-.081.092-.126.21-.126.332v8.617l-4-2.4v-6.217c0-.122-.045-.24-.126-.332L2.697,5.595c-.45-.506-.697-1.157-.697-1.834,0-1.522,1.238-2.761,2.76-2.761h14.479c1.522,0,2.761,1.238,2.761,2.761,0,.677-.247,1.328-.697,1.834Z" />
                    </svg>
                </div>

                {showFilters && (
                    <div className={style.filterContainer}>
                        <h1>Filter by:</h1>

                        <div className={style.filterField}>
                            <label className={style.filterLabel}>Client Name</label>
                            <input
                                type="text"
                                placeholder="Client Name"
                                value={clientNameFilter}
                                onChange={(e) => setClientNameFilter(e.target.value)}
                                className={style.filterInput}
                            />
                        </div>

                        <div className={style.filterField}>
                            <label className={style.filterLabel}>Title</label>
                            <input
                                type="text"
                                placeholder="Title"
                                value={titleFilter}
                                onChange={(e) => setTitleFilter(e.target.value)}
                                className={style.filterInput}
                            />
                        </div>

                        <div className={style.filterField}>
                            <label className={style.filterLabel}>Status</label>
                            <div ref={statusDropdownRef} className={style.customSelectWrapper}>
                                <div className={style.customSelect} onClick={() => setShowStatusOptions(!showStatusOptions)}>
                                    <span className={style.selectValue}>
                                        {statusFilter || "All Statuses"}
                                        {statusFilter && <span className={`${style.dot} ${style[`dotStatus_${statusFilter}`]}`} />}
                                    </span>
                                    <span className={style.arrow}>▾</span>
                                </div>
                                {showStatusOptions && (
                                    <div className={style.customOptions}>
                                        <div onClick={() => setStatusFilter("")} className={style.option}>All Statuses</div>
                                        {["open", "in_progress", "closed"].map((status) => (
                                            <div key={status} onClick={() => setStatusFilter(status)} className={style.option}>
                                                {status}
                                                <span className={`${style.dot} ${style[`dotStatus_${status}`]}`} />
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className={style.filterField}>
                            <label className={style.filterLabel}>Priority</label>
                            <div ref={priorityDropdownRef} className={style.customSelectWrapper}>
                                <div className={style.customSelect} onClick={() => setShowPriorityOptions(!showPriorityOptions)}>
                                    <span className={style.selectValue}>
                                        {priorityFilter || "All Priorities"}
                                        {priorityFilter && <span className={`${style.dot} ${style[`dotPriority_${priorityFilter}`]}`} />}
                                    </span>
                                    <span className={style.arrow}>▾</span>
                                </div>
                                {showPriorityOptions && (
                                    <div className={style.customOptions}>
                                        <div onClick={() => setPriorityFilter("")} className={style.option}>All Priorities</div>
                                        {["low", "medium", "high", "critical"].map((priority) => (
                                            <div key={priority} onClick={() => setPriorityFilter(priority)} className={style.option}>
                                                {priority}
                                                <span className={`${style.dot} ${style[`dotPriority_${priority}`]}`} />
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className={style.filterField}>
                            <label className={style.filterLabel}>Created Date</label>
                            <input
                                type="date"
                                value={dateFilter}
                                onChange={(e) => setDateFilter(e.target.value)}
                                className={style.filterInput}
                            />
                        </div>
                        <button
                            onClick={() => {
                                setClientNameFilter("");
                                setTitleFilter("");
                                setStatusFilter("");
                                setPriorityFilter("");
                                setDateFilter("");
                            }}
                            className={style.clearFiltersButton}
                        >
                            Clear Filters
                        </button>

                    </div>
                )}


                <table className={`${style.table}`}>
                    <thead style={{ visibility: (modalIsOpen || editModalIsOpen) ? "hidden" : "visible" }}>
                        <tr className={`${style.tableHeader}`}>
                            <th><div className={style.headerCell}>ID</div></th>
                            <th><div className={style.headerCell}>Client Name</div></th>
                            <th><div className={style.headerCell}>Title</div></th>
                            <th><div className={style.headerCell}>Statuses</div></th>
                            <th><div className={style.headerCell}>Priority</div></th>
                            <th><div className={style.headerCell}>Date</div></th>
                            <th><div className={style.headerCell}>Updated at</div></th>
                            <th><div className={style.headerCell}>...</div></th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredTickets.map((ticket) => (
                            <tr key={ticket.id} className={style.clickableRow}>
                                <td>#{ticket.id}</td>
                                <td>{ticket.client_name}</td>
                                <td>{ticket.title}</td>
                                <td className={style.statusCell}>
                                    {ticket.status}
                                    <span className={`${style.dot} ${style[`dotStatus_${ticket.status}`]}`} />
                                </td>
                                <td className={style.priorityCell}>
                                    {ticket.priority}
                                    <span className={`${style.dot} ${style[`dotPriority_${ticket.priority}`]}`} />
                                </td>

                                <td>{new Date(ticket.created_at).toLocaleDateString("en-US")}</td>
                                <td>{new Date(ticket.updated_at).toLocaleDateString("en-US")}</td>
                                <td>
                                    <div
                                        className={style.clickableSvg}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            openEditModal(ticket);
                                        }}
                                    >
                                        <div className={style.iconWrapper}>
                                            <svg className={style.iconSvg} xmlns="http://www.w3.org/2000/svg" id="Layer_1" data-name="Layer 1" viewBox="0 0 24 24">
                                                <path fill="currentColor" d="M9.8,9.802c-.755,.753-1.122,1.476-1.122,2.208,0,.957,.64,1.706,1.122,2.187,.74,.739,1.47,1.108,2.2,1.108s1.46-.37,2.2-1.108c.755-.753,1.122-1.476,1.122-2.208,0-.957-.64-1.706-1.122-2.187-1.48-1.478-2.92-1.478-4.4,0Zm3.694,3.688c-1.251,1.248-2.042,.944-2.988,0-.565-.564-.828-1.034-.828-1.479,0-.454,.271-.944,.828-1.5,.583-.582,1.065-.826,1.511-.826,.511,0,.972,.322,1.478,.826,.565,.564,.828,1.034,.828,1.479,0,.454-.271,.944-.828,1.5Z" />
                                                <g fill="currentColor">
                                                    <path fill="currentColor" d="M9.8,9.802c-.755,.753-1.122,1.476-1.122,2.208,0,.957,.64,1.706,1.122,2.187,.74,.739,1.47,1.108,2.2,1.108s1.46-.37,2.2-1.108c.755-.753,1.122-1.476,1.122-2.208,0-.957-.64-1.706-1.122-2.187-1.48-1.478-2.92-1.478-4.4,0Zm3.694,3.688c-1.251,1.248-2.042,.944-2.988,0-.565-.564-.828-1.034-.828-1.479,0-.454,.271-.944,.828-1.5,.583-.582,1.065-.826,1.511-.826,.511,0,.972,.322,1.478,.826,.565,.564,.828,1.034,.828,1.479,0,.454-.271,.944-.828,1.5Z" />
                                                    <path fill="currentColor" d="M23.019,11.948c.008-1.595-.817-2.481-2.521-2.7-.188-.394-.417-.787-.694-1.188,1.205-1.456,1.21-2.694,.026-3.876-1.183-1.181-2.425-1.175-3.884,.029-.401-.274-.794-.501-1.188-.688-.217-1.706-1.134-2.524-2.705-2.524-1.602,.008-2.495,.849-2.725,2.569-.392,.189-.791,.421-1.19,.691-1.451-1.197-2.694-1.194-3.89,0-1.178,1.175-1.18,2.448-.001,3.882-.273,.4-.506,.798-.696,1.189-1.719,.229-2.56,1.122-2.568,2.721-.008,1.595,.817,2.481,2.521,2.7,.188,.394,.417,.787,.694,1.188-1.205,1.456-1.21,2.694-.026,3.876,1.184,1.182,2.425,1.176,3.884-.029,.401,.274,.794,.501,1.188,.688,.216,1.697,1.113,2.524,2.682,2.524,1.605,0,2.519-.849,2.749-2.569,.392-.189,.791-.421,1.19-.691,1.451,1.197,2.694,1.193,3.89,0,1.178-1.175,1.18-2.448,.001-3.882,.273-.4,.506-.798,.696-1.189,1.719-.229,2.56-1.122,2.568-2.721Zm-3.36,2.053c-.227,.515-.544,1.051-.942,1.594-.142,.193-.127,.459,.036,.635,1.373,1.487,.898,2.2,.295,2.802-.63,.628-1.321,1.078-2.812-.295-.175-.162-.44-.176-.634-.036-.541,.395-1.077,.71-1.595,.937-.167,.073-.282,.232-.297,.415-.139,1.615-.779,1.942-1.766,1.947-1.008-.027-1.609-.304-1.734-1.9-.015-.186-.131-.348-.302-.421-.521-.222-1.041-.526-1.588-.929-.089-.065-.193-.097-.296-.097-.122,0-.243,.044-.338,.132-1.503,1.383-2.211,.919-2.807,.324-.595-.594-1.06-1.299,.323-2.797,.163-.177,.178-.444,.035-.637-.4-.541-.716-1.075-.937-1.588-.073-.17-.234-.286-.419-.301-1.587-.126-1.903-.755-1.898-1.729,.005-.984,.333-1.622,1.946-1.761,.182-.016,.341-.129,.415-.296,.227-.515,.544-1.051,.942-1.594,.142-.193,.127-.459-.036-.635-1.373-1.487-.898-2.2-.295-2.802,.606-.604,1.321-1.08,2.812,.295,.176,.163,.441,.178,.634,.036,.541-.395,1.077-.71,1.595-.937,.167-.073,.282-.232,.297-.415,.139-1.615,.779-1.942,1.766-1.947,.99-.027,1.608,.304,1.734,1.9,.015,.186,.131,.348,.302,.421,.521,.222,1.041,.526,1.588,.929,.193,.142,.458,.127,.635-.035,1.504-1.382,2.212-.918,2.807-.324,.595,.594,1.06,1.299-.323,2.797-.163,.177-.178,.444-.035,.637,.4,.541,.716,1.075,.937,1.588,.073,.17,.234,.286,.419,.301,1.587,.126,1.903,.755,1.898,1.729-.005,.984-.333,1.622-1.946,1.761-.182,.016-.341,.129-.415,.296Z" />
                                                </g>
                                            </svg>
                                        </div>
                                    </div>
                                </td>
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