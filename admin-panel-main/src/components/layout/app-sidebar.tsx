
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  Users,
  Archive,
  CalendarCheck,
  BookOpenText,
  Image as ImageIcon,
  LogOut,
  ChefHat,
} from "lucide-react";
import { logout } from "@/lib/auth";
import { useRouter } from "next/navigation";
import type { User } from "@/types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface AppSidebarProps {
  user: User | null;
}

const navItems = [
  { href: "/dashboard", label: "داشبورد", icon: LayoutDashboard },
  { href: "/users", label: "کاربران", icon: Users },
  { href: "/tables", label: "میزها", icon: Archive },
  { href: "/reservations", label: "رزروها", icon: CalendarCheck },
  { href: "/menu", label: "منو", icon: BookOpenText },
  { href: "/images", label: "تصاویر", icon: ImageIcon },
];

export default function AppSidebar({ user }: AppSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.push("/login");
    router.refresh();
  };

  const getUserInitials = (name: string) => {
    if (!name) return 'ک'; // For کاربر (User)
    const parts = name.split(' ');
    if (parts.length > 1) {
      return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  }

  return (
    <Sidebar collapsible="icon" variant="sidebar" className="border-l right-0"> {/* border-r becomes border-l for RTL */}
      <SidebarHeader className="p-4 flex items-center gap-2 justify-between">
        <div className="flex items-center gap-2 group-data-[collapsible=icon]:hidden">
          <ChefHat className="h-8 w-8 text-primary" />
          <h1 className="text-xl font-semibold text-sidebar-foreground">یووتاب</h1>
        </div>
        <SidebarTrigger className="md:hidden" />
      </SidebarHeader>
      <SidebarContent className="flex-1 overflow-y-auto p-2">
        <SidebarMenu>
          {navItems.map((item) => (
            <SidebarMenuItem key={item.href}>
              <Link href={item.href} passHref legacyBehavior>
                <SidebarMenuButton
                  isActive={pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href))}
                  tooltip={item.label}
                  className="justify-start"
                >
                  <item.icon className="h-5 w-5" />
                  <span>{item.label}</span>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter className="p-4 border-t border-sidebar-border">
        <div className="flex items-center gap-3 group-data-[collapsible=icon]:hidden">
          <Avatar className="h-10 w-10">
            <AvatarImage src={`https://placehold.co/40x40.png?text=${getUserInitials(user?.fullName || 'کاربر')}`} alt={user?.fullName} data-ai-hint="avatar profile" />
            <AvatarFallback>{getUserInitials(user?.fullName || 'کاربر')}</AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <span className="text-sm font-medium text-sidebar-foreground">{user?.fullName}</span>
            <span className="text-xs text-sidebar-foreground/70">{user?.username}</span>
          </div>
        </div>
        <Button
          variant="ghost"
          onClick={handleLogout}
          className="w-full justify-start mt-2 text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground group-data-[collapsible=icon]:justify-center"
          aria-label="خروج"
          title="خروج"
        >
          <LogOut className="ml-2 h-5 w-5 group-data-[collapsible=icon]:ml-0" /> {/* mr-2 becomes ml-2 */}
          <span className="group-data-[collapsible=icon]:hidden">خروج</span>
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}
