"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import style from "../../styles/login.module.css";

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
    const router = useRouter();

    const validateForm = () => {
        let newErrors: { email?: string; password?: string } = {};

        if (!email.trim()) {
            newErrors.email = "Email is required.";
        } else if (!/\S+@\S+\.\S+/.test(email)) {
            newErrors.email = "Please enter a valid email address.";
        }

        if (!password.trim()) {
            newErrors.password = "Password is required.";
        } else if (password.length < 6) {
            newErrors.password = "Password must be at least 6 characters.";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        console.log("Logging in with:", { email, password });
        router.push("/routes/home");
    };

    return (
        <div className={style.main}>
            <form onSubmit={handleLogin} className={style.form}>
                <h1 className={style.title}>Login</h1>

                <div className={style.inputGroup}>
                    <label htmlFor="email" className={style.label}>Email</label>
                    <input
                        type="email"
                        id="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className={style.input}
                    />
                    {errors.email && <p className={style.error}>{errors.email}</p>}
                </div>

                <div className={style.inputGroup}>
                    <label htmlFor="password" className={style.label}>Password</label>
                    <input
                        type="password"
                        id="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className={style.input}
                    />
                    {errors.password && <p className={style.error}>{errors.password}</p>}
                </div>

                <button type="submit" className={style.button}>Login</button>
            </form>
        </div>
    );
}