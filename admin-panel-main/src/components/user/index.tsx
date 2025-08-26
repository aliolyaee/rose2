"use client"
import { Users } from 'lucide-react'
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button";

export default function LastLogin() {
    const [lastLogin, setLastLogin] = useState<string | null>(null);

    useEffect(() => {
        const fetchRecentLogins = async () => {
            try {
                const token = localStorage.getItem("accessToken");
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/user/last-login`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                }); const data = await res.json();
                setLastLogin(data.lastLogin); // فقط رشته رو ذخیره کن
            } catch (error) {
                console.error("خطا در دریافت لاگین‌ها:", error);
            }
        };

        fetchRecentLogins();
    }, []);

    if (!lastLogin) return null;

    return (
        <li className="flex items-center justify-between p-3 bg-muted/20 rounded-md">
            <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-full">
                    <Users className="h-5 w-5 text-primary" />
                </div>
                <div>
                    <p className="text-sm font-medium">آخرین ورود شما:</p>
                    <p className="text-xs text-muted-foreground">{lastLogin}</p>
                </div>
            </div>
        </li>
    );
}
