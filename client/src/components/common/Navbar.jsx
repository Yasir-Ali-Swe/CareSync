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
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Menu } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

const NavLinks = [
  { name: "Home", path: "/" },
  { name: "Doctors", path: "/doctors" },
  { name: "Messages", path: "/messages" },
  { name: "Contact Us", path: "/contact-us" },
];

const Navbar = () => {
  const location = useLocation();
  const path = location.pathname;
  const [open, setOpen] = useState(false);
  return (
    <nav className="flex items-center justify-between bg-primary py-3 px-6 lg:px-20">
      <Link to={"/"} className="flex items-center gap-1 ">
        <Hospital className="text-secondary font-black size-8" />
        <h1 className="text-2xl font-bold text-secondary">CareSync</h1>
      </Link>
      <div className="hidden lg:flex lg:gap-15">
        {NavLinks.map((link, index) => (
          <Link
            key={index}
            to={link.path}
            className={`
                        relative text-secondary font-semibold px-2
                        after:absolute after:left-0 after:-top-4 after:h-0.75 after:bg-destructive
                        after:w-0 after:transition-all after:duration-300
                        ${path === link.path ? "after:w-full" : ""}
                        `}
          >
            {link.name}
          </Link>
        ))}
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
            {NavLinks.map((link, index) => (
              <Link key={index} to={link.path}>
                <Button
                  variant="ghost"
                  size="sm"
                  className={"w-full justify-start"}
                  onClick={() => setOpen(false)}
                >
                  <ArrowRight
                    className={`size-4 ${path === link.path && "text-secondary"} text-primary`}
                  />
                  {link.name}
                </Button>
              </Link>
            ))}
          </PopoverContent>
        </Popover>
      </div>

      <div className="flex items-center gap-4">
        <Link to={"/auth/login"}>
          <Button
            variant="outline"
            size="sm"
            className={"rounded-full cursor-pointer"}
          >
            Login
          </Button>
        </Link>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Avatar>
              <AvatarImage src="https://github.com/shadcn.png" />
              <AvatarFallback>CN</AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem>Dashboard</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem variant="destructive">Logout</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </nav>
  );
};

export default Navbar;
