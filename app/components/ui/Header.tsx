"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import style from "../../styles/header.module.css";

const Header = () => {
    const pathname = usePathname();

    const navLinks = [
        { href: "/routes/home", label: "Home" },
        { href: "/routes/tickets", label: "Tickets" },
        { href: "/routes/statistics", label: "Statistics" },
    ];

    return (
        <header className={style.main}>
            {navLinks.map(({ href, label }) => (
                <Link
                    key={href}
                    href={href}
                    className={`${style.route} ${pathname.startsWith(href) ? style.active : ""}`}
                >
                    {label}
                </Link>
            ))}
        </header>
    );
};

export default Header;