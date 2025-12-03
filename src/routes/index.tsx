import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/")({ component: App });

function App() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <h1 className="mb-8 bg-gradient-to-r from-yellow-400 to-yellow-600 bg-clip-text font-black text-6xl text-transparent">
        TRECA MAKER
      </h1>
      <p className="mb-12 max-w-2xl text-center text-muted-foreground text-xl">
        日常の瞬間を、伝説のトレーディングカードへ。
        <br />
        AIがあなたの写真を解析し、世界に一枚だけのカードを生成します。
      </p>

      <div className="flex gap-6">
        <Button asChild className="px-8 text-lg" size="lg">
          <Link to="/generate">カードを作る</Link>
        </Button>
        <Button asChild className="px-8 text-lg" size="lg" variant="outline">
          <Link to="/collection">コレクションを見る</Link>
        </Button>
      </div>
    </div>
  );
}
