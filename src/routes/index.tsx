import { createFileRoute, Link } from "@tanstack/react-router";
import { FireEffect } from "@/components/fire-effect";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/")({ component: App });

function App() {
  const cards = [
    "/cards/pic_1.png",
    "/cards/pic_2.png",
    "/cards/pic_3.png",
    "/cards/pic_4.png",
    "/cards/pic_5.png",
    "/cards/pic_6.png",
    "/cards/pic_7.png",
  ];

  return (
    <div className="relative flex min-h-[calc(100vh-64px)] flex-col items-center justify-center overflow-hidden bg-background p-4">
      {/* Background with scrolling cards */}
      <div className="absolute inset-0 z-0 select-none overflow-hidden opacity-20 brightness-50 contrast-125 grayscale dark:opacity-10">
        <div className="flex w-[200%] animate-marquee">
          {/* First set of cards */}
          <div className="flex w-1/2 justify-around gap-4 px-2">
            {cards.map((src, i) => (
              <div
                className="aspect-[2/3] h-full max-h-[80vh] w-auto flex-shrink-0 skew-y-6 transform overflow-hidden rounded-xl border border-white/10 object-cover shadow-2xl transition-transform duration-500 hover:skew-y-0"
                key={`bg-card-1-${i}`}
              >
                <img
                  alt=""
                  className="h-full w-full object-cover"
                  loading="eager"
                  src={src}
                />
              </div>
            ))}
          </div>
          {/* Duplicate set for seamless loop */}
          <div className="flex w-1/2 justify-around gap-4 px-2">
            {cards.map((src, i) => (
              <div
                className="aspect-[2/3] h-full max-h-[80vh] w-auto flex-shrink-0 skew-y-6 transform overflow-hidden rounded-xl border border-white/10 object-cover shadow-2xl transition-transform duration-500 hover:skew-y-0"
                key={`bg-card-2-${i}`}
              >
                <img
                  alt=""
                  className="h-full w-full object-cover"
                  loading="eager"
                  src={src}
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Overlay to ensure text readability */}
      <div className="absolute inset-0 z-0 bg-background/60 backdrop-blur-[2px]" />

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
