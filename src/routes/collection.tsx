import { createFileRoute, Link } from "@tanstack/react-router";
import { useLiveQuery } from "dexie-react-hooks";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { db } from "@/lib/db";

export const Route = createFileRoute("/collection")({
  component: CollectionPage,
});

function CollectionPage() {
  const cards = useLiveQuery(() => db.cards.toArray());

  if (!cards) {
    return <div className="p-8 text-center">Loading...</div>;
  }

  return (
    <div className="container mx-auto p-4 py-8">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="font-bold text-3xl">コレクション</h1>
      </div>

      {cards.length === 0 ? (
        <div className="py-20 text-center text-muted-foreground">
          まだカードがありません。
          <br />
          <Link
            className="mt-4 inline-block font-semibold text-primary hover:underline"
            to="/generate"
          >
            カードを生成しに行く
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
          {cards.map((card) => (
            <div className="group flex flex-col space-y-2" key={card.id}>
              <div className="relative overflow-hidden rounded-lg shadow-md transition-all duration-300 hover:scale-105 hover:shadow-xl">
                {/* biome-ignore lint/correctness/useImageSize: Dynamic user content */}
                <img
                  alt={card.name}
                  className="h-auto w-full"
                  src={card.imageBase64}
                />
              </div>

              <div className="flex items-center justify-between px-1">
                <span className="mr-1 flex-1 truncate font-medium text-sm">
                  {card.name}
                </span>
                <Button
                  className="h-8 w-8 text-muted-foreground hover:text-destructive"
                  onClick={() => {
                    // biome-ignore lint/suspicious/noAlert: User interaction required
                    if (window.confirm("本当に削除しますか？") && card.id) {
                      db.cards.delete(card.id);
                    }
                  }}
                  size="icon"
                  variant="ghost"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
