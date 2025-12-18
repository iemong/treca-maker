import { createFileRoute, Link } from "@tanstack/react-router";
import { FireEffect } from "@/components/fire-effect";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/")({ component: App });

function App() {
  return (
    <div className="relative flex min-h-[calc(100vh-64px)] flex-col items-center justify-center overflow-hidden bg-background p-4">
      <FireEffect />

      <div className="relative z-10 flex flex-col items-center justify-center text-center">
        <h1 className="mb-8 bg-gradient-to-r from-yellow-400 via-orange-500 to-red-600 bg-clip-text font-black text-6xl text-transparent tracking-tight sm:text-7xl md:text-8xl">
          TRECA MAKER
        </h1>
        <p className="mb-12 max-w-2xl text-lg text-muted-foreground sm:text-xl md:text-2xl">
          日常の瞬間を、伝説のトレーディングカードへ。
          <br />
          AIがあなたの写真を解析し、世界に一枚だけのカードを生成します。
        </p>

        <div className="flex w-full max-w-sm flex-col gap-4 sm:w-auto sm:flex-row sm:gap-6">
          <Button
            asChild
            className="w-full px-8 py-7 text-xl sm:w-auto"
            size="lg"
          >
            <Link to="/generate">カードを作る</Link>
          </Button>
          <Button
            asChild
            className="w-full px-8 py-7 text-xl sm:w-auto"
            size="lg"
            variant="outline"
          >
            <Link to="/collection">コレクションを見る</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
