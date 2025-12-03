import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/")({ component: App });

function App() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <h1 className="text-6xl font-black mb-8 bg-gradient-to-r from-yellow-400 to-yellow-600 bg-clip-text text-transparent">
        TRECA MAKER
      </h1>
      <p className="text-xl text-muted-foreground mb-12 text-center max-w-2xl">
        日常の瞬間を、伝説のトレーディングカードへ。
        <br />
        AIがあなたの写真を解析し、世界に一枚だけのカードを生成します。
      </p>

      <div className="flex gap-6">
        <Button asChild size="lg" className="text-lg px-8">
          <Link to="/generate">カードを作る</Link>
        </Button>
        <Button asChild variant="outline" size="lg" className="text-lg px-8">
          <Link to="/collection">コレクションを見る</Link>
        </Button>
      </div>
    </div>
  );
}
