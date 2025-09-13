// src/app/(app)/dashboard/page.tsx
import type { Metadata } from 'next';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from 'next/link';
import { Users, Archive, CalendarCheck, BookOpenText, BarChart3, DollarSign, TrendingUp, AlertTriangle, Building } from 'lucide-react';
import Image from 'next/image';
import LastLogin from '@/components/user';
import { DashboardContent } from './components/dashboard-content';

export const metadata: Metadata = {
  title: 'داشبورد - پنل مدیریت یووتاب',
};

export default function DashboardPage() {
  return <DashboardContent />;
}