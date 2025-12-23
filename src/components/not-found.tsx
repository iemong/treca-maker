import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";

export function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center space-y-6 text-center">
      <h1 className="font-bold text-4xl">404 Not Found</h1>
      <p className="text-lg text-muted-foreground">
        お探しのページは見つかりませんでした。
      </p>
      <Button asChild>
        <Link to="/">ホームに戻る</Link>
      </Button>
    </div>
  );
}
