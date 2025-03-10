
import { ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { Home, BarChart, Users } from "lucide-react";
import { Button } from "./ui/button";

interface FooterProps {
  children?: ReactNode;
}

const Footer = ({ children }: FooterProps) => {
  const navigate = useNavigate();

  return (
    <div className="container h-full flex items-center justify-between px-4">
      <nav className="flex w-full items-center justify-around">
        <Button
          variant="ghost"
          size="icon"
          className="h-10 w-10"
          onClick={() => navigate("/")}
        >
          <Home className="h-5 w-5" />
        </Button>
        
        <Button
          variant="ghost"
          size="icon"
          className="h-10 w-10"
          onClick={() => navigate("/stats")}
        >
          <BarChart className="h-5 w-5" />
        </Button>

        <Button
          variant="ghost"
          size="icon"
          className="h-10 w-10"
          onClick={() => navigate("/clubs")}
        >
          <Users className="h-5 w-5" />
        </Button>
      </nav>
      {children}
    </div>
  );
};

export default Footer;
