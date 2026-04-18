import React from "react";
import { Hospital, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "../ui/button";
import { useState } from "react";
import { useLocation } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Menu } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { getDashboardRoutes } from "@/lib/DasboardRotes";

const DashboardNavbar = () => {
  const routes = getDashboardRoutes("doctor");
  const location = useLocation();
  const path = location.pathname;
  const [open, setOpen] = useState(false);
  console.log(routes);
  return (
    <nav className="flex items-center justify-between bg-card py-3 px-6 lg:px-20 border-b-2 border-border shadow-sm">
      <Link to={"/"} className="flex items-center gap-1 ">
        <Hospital className="text-primary font-black size-8" />
        <h1 className="text-2xl font-bold text-primary">CareSync</h1>
      </Link>
      <div className="hidden lg:flex lg:gap-15">
        {routes.map((link, index) => {
          const isActive = path === link.route;

          return (
            <Link
              key={index}
              to={link.route}
              className={`
        relative text-primary font-semibold px-2
        after:absolute after:left-0 after:-top-4 after:h-0.75 after:bg-destructive
        after:w-0 after:transition-all after:duration-300
        ${isActive ? "after:w-full" : ""}
      `}
            >
              {link.name}
            </Link>
          );
        })}
      </div>
      <div className="block lg:hidden">
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="icon"
              size="sm"
              className={"rounded-full cursor-pointer"}
            >
              <Menu className="size-8 text-secondary" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-screen mt-3 bg-primary text-secondary rounded-none">
            {routes.map((link, index) => (
              <Link key={index} to={link.route}>
                <Button
                  variant="ghost"
                  size="sm"
                  className={"w-full justify-start"}
                  onClick={() => setOpen(false)}
                >
                  <ArrowRight
                    className={`size-4 ${path === link.route && "text-secondary"} text-primary`}
                  />
                  {link.name}
                </Button>
              </Link>
            ))}
          </PopoverContent>
        </Popover>
      </div>

      <div className="flex items-center gap-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Avatar>
              <AvatarImage src="https://github.com/shadcn.png" />
              <AvatarFallback>CN</AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className={"mt-3"}>
            <DropdownMenuItem variant="destructive">Logout</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </nav>
  );
};

export default DashboardNavbar;
