import { Link } from "@tanstack/react-router";
import { CreditCard, Library } from "lucide-react";

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur-sm">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link className="flex items-center space-x-2" to="/">
          <span className="font-bold text-xl tracking-tighter">
            Treca Maker
          </span>
        </Link>
        <nav className="flex items-center space-x-6 font-medium text-sm">
          <Link
            activeProps={{ className: "text-foreground" }}
            className="flex items-center text-muted-foreground transition-colors hover:text-foreground"
            to="/generate"
          >
            <CreditCard className="mr-1 h-4 w-4" />
            <span>生成</span>
          </Link>
          <Link
            activeProps={{ className: "text-foreground" }}
            className="flex items-center text-muted-foreground transition-colors hover:text-foreground"
            to="/collection"
          >
            <Library className="mr-1 h-4 w-4" />
            <span>コレクション</span>
          </Link>
        </nav>
      </div>
    </header>
  );
}
