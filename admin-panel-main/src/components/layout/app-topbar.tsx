
"use client";

import type { User } from "@/types";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LogOut, Settings, UserCircle, Menu } from "lucide-react";
import { logout } from "@/lib/auth";
import { useRouter } from "next/navigation";
import { useSidebar } from "@/components/ui/sidebar";
import Link from "next/link";

interface AppTopbarProps {
  user: User | null;
}

export default function AppTopbar({ user }: AppTopbarProps) {
  const router = useRouter();
  const { toggleSidebar, isMobile } = useSidebar();

  const handleLogout = async () => {
    await logout();
    router.push("/login");
    router.refresh();
  };

  const getUserInitials = (name: string | undefined) => {
    if (!name) return "اد"; // ادمین
    const names = name.split(" ");
    let initials = names[0].substring(0, 1).toUpperCase();
    if (names.length > 1) {
      initials += names[names.length - 1].substring(0, 1).toUpperCase();
    } else if (name.length > 1) {
      initials += name.substring(1, 2).toUpperCase();
    }
    return initials;
  };

  return (
    <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b bg-background/80 backdrop-blur-md px-4 md:px-6">
      <div className="flex items-center gap-2">
        {isMobile && (
          <Button variant="ghost" size="icon" onClick={toggleSidebar} className="md:hidden">
            <Menu className="h-6 w-6" />
            <span className="sr-only">تغییر وضعیت نوار کناری</span>
          </Button>
        )}
        <h1 className="text-lg font-semibold text-foreground">
          {/* عنوان صفحه به صورت داینامیک در صورت نیاز */}
        </h1>
      </div>

      <div className="flex items-center gap-4">
        <span className="text-sm text-muted-foreground hidden md:inline">
          خوش آمدید، {user?.fullName?.split(' ')[0] || "ادمین"}!
        </span>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-10 w-10 rounded-full">
              <Avatar className="h-10 w-10">
                <AvatarImage src={`https://placehold.co/40x40.png?text=${getUserInitials(user?.fullName)}`} alt={user?.fullName || "کاربر"} data-ai-hint="avatar profile" />
                <AvatarFallback>{getUserInitials(user?.fullName)}</AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" forceMount>
            <DropdownMenuLabel className="font-normal text-right">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">{user?.fullName}</p>
                <p className="text-xs leading-none text-muted-foreground">
                  {user?.username}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/profile" className="flex justify-end"> {/* Placeholder for profile page */}
                <span>پروفایل</span>
                <UserCircle className="ml-2 h-4 w-4" /> {/* mr-2 becomes ml-2 */}
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/settings" className="flex justify-end"> {/* Placeholder for settings page */}
                <span>تنظیمات</span>
                <Settings className="ml-2 h-4 w-4" /> {/* mr-2 becomes ml-2 */}
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className="flex justify-end">
              <span>خروج</span>
              <LogOut className="ml-2 h-4 w-4" /> {/* mr-2 becomes ml-2 */}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
