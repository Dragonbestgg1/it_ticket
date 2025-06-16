"use client";

import React from "react";
import Link from "next/link";
import style from "../../styles/header.module.css";

const Header = () => {
    return (
        <header className={style.main}>
            <Link href="/routes/home" className={`${style.route}`}>Home</Link>
            <Link href="/routes/tickets" className={`${style.route}`}>Tickets</Link>
            <Link href="/routes/statistics" className={`${style.route}`}>Statistics</Link>
        </header>
    );
};

export default Header;