
import type { Metadata } from 'next';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from 'next/link';
import { Users, Archive, CalendarCheck, BookOpenText, BarChart3, DollarSign, TrendingUp, AlertTriangle } from 'lucide-react';
import Image from 'next/image';
import LastLogin from '@/components/user';

export const metadata: Metadata = {
  title: 'داشبورد - پنل مدیریت یووتاب',
};

// Mock data for dashboard cards - Should be replaced with API data
const summaryStats = [
  { title: "رزروهای امروز", value: "۱۲", icon: CalendarCheck, trend: "۵٪+", trendColor: "text-green-500" },
  { title: "در انتظار تایید", value: "۳", icon: AlertTriangle, trendColor: "text-yellow-500" },
  { title: "میزهای اشغال شده", value: "۸/۱۵", icon: Archive },
  { title: "کل آیتم‌های منو", value: "۴۵", icon: BookOpenText },
];

const quickLinks = [
  { href: "/reservations/new", label: "افزودن رزرو", icon: CalendarCheck },
  { href: "/tables", label: "مدیریت میزها", icon: Archive },
  { href: "/menu/new", label: "افزودن آیتم منو", icon: BookOpenText },
  { href: "/users", label: "مشاهده کاربران", icon: Users },
];

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">داشبورد</h1>
          <p className="text-muted-foreground">نمای کلی از فعالیت‌های رستوران شما.</p>
        </div>
        <Link href="/reservations/new" passHref>
          <Button>
            <CalendarCheck className="ml-2 h-4 w-4" /> رزرو جدید {/* mr-2 to ml-2 */}
          </Button>
        </Link>
      </div>

      {/* Summary Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {summaryStats.map((stat) => (
          <Card key={stat.title} className="shadow-lg hover:shadow-xl transition-shadow duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              {stat.trend && <p className={`text-xs ${stat.trendColor} mt-1`}>{stat.trend} نسبت به هفته گذشته</p>}
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Quick Links Card */}
        <Card className="lg:col-span-1 shadow-lg">
          <CardHeader>
            <CardTitle>دسترسی سریع</CardTitle>
            <CardDescription>دسترسی سریع به وظایف متداول.</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-4">
            {quickLinks.map(link => (
              <Link key={link.href} href={link.href} passHref>
                <Button variant="outline" className="w-full justify-start text-right h-auto py-3"> {/* text-left to text-right */}
                  <link.icon className="ml-3 h-5 w-5 flex-shrink-0" /> {/* mr-3 to ml-3 */}
                  <span className="flex-grow">{link.label}</span>
                </Button>
              </Link>
            ))}
          </CardContent>
        </Card>

        {/* Placeholder for a chart */}
        <Card className="lg:col-span-2 shadow-lg">
          <CardHeader>
            <CardTitle>روند رزروها</CardTitle>
            <CardDescription>نمایش گرافیکی رزروها در طول زمان.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center h-64 bg-muted/30 rounded-md">
            <Image src="https://placehold.co/600x300.png?text=Chart+Placeholder" alt="نمودار جایگزین" data-ai-hint="chart analytics" width={600} height={300} className="opacity-50" />
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity Placeholder */}
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>فعالیت‌ اخیر شما</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-3">
            <LastLogin />
          </ul>
        </CardContent>
      </Card>

    </div>
  );
}
