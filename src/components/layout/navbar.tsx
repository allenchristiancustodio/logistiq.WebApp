import { useNavigate } from "react-router-dom";
import { useUser } from "@clerk/clerk-react";
import { Bell, Menu, Moon, Settings, Sun, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/hooks/use-auth"; // Our custom hook
import { useUIStore } from "@/stores/ui-store";

export default function Navbar() {
  const navigate = useNavigate();
  const { user: clerkUser } = useUser();
  const { user: storeUser, logout } = useAuth();
  const { toggleSidebar, isDarkMode, toggleDarkMode } = useUIStore();

  const displayName = storeUser?.fullName || clerkUser?.fullName || "User";
  const email =
    storeUser?.email || clerkUser?.emailAddresses[0]?.emailAddress || "";
  const initials = displayName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const handleLogout = async () => {
    console.log("🚪 Logging out from navbar");
    await logout();
  };

  return (
    <div className="flex justify-between items-center w-full mb-7">
      {/* LEFT SIDE */}
      <div className="flex justify-between items-center gap-5">
        <Button
          variant="outline"
          size="icon"
          onClick={toggleSidebar}
          className="bg-gray-100 hover:bg-blue-100"
        >
          <Menu className="w-4 h-4" />
        </Button>

        <div className="relative">
          <input
            type="search"
            placeholder="Start typing to search groups & products"
            className="pl-10 pr-4 py-2 w-50 md:w-60 border-2 border-gray-300 bg-white rounded-lg focus:outline-none focus:border-blue-500"
          />
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Bell className="text-gray-500" size={20} />
          </div>
        </div>
      </div>

      {/* RIGHT SIDE */}
      <div className="flex justify-between items-center gap-5">
        <div className="hidden md:flex justify-between items-center gap-5">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleDarkMode}
            className="text-gray-500 hover:text-gray-700"
          >
            {isDarkMode ? (
              <Sun className="h-5 w-5" />
            ) : (
              <Moon className="h-5 w-5" />
            )}
          </Button>

          <div className="relative">
            <Button
              variant="ghost"
              size="icon"
              className="text-gray-500 hover:text-gray-700"
            >
              <Bell className="h-5 w-5" />
            </Button>
            <span className="absolute -top-1 -right-1 inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-semibold leading-none text-red-100 bg-red-400 rounded-full">
              3
            </span>
          </div>

          <hr className="w-0 h-7 border border-solid border-l border-gray-300 mx-3" />

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="flex items-center gap-3 hover:bg-gray-50"
              >
                <Avatar className="w-8 h-8">
                  <AvatarImage src={clerkUser?.imageUrl} />
                  <AvatarFallback className="bg-blue-600 text-white text-sm">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <span className="font-semibold">{displayName}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium">{displayName}</p>
                  <p className="text-xs text-muted-foreground">{email}</p>
                  {storeUser?.currentCompanyName && (
                    <p className="text-xs text-blue-600">
                      {storeUser.currentCompanyName}
                    </p>
                  )}
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => navigate("/settings")}>
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                <LogOut className="mr-2 h-4 w-4" />
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <Button
          variant="ghost"
          size="icon"
          className="md:hidden text-gray-500 hover:text-gray-700"
          onClick={() => navigate("/settings")}
        >
          <Settings className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
}
