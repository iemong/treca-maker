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

  if (!cards) return <div className="p-8 text-center">Loading...</div>;

  return (
    <div className="container mx-auto p-4">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="font-bold text-3xl">コレクション</h1>
        <Button asChild variant="outline">
          <Link to="/">トップへ戻る</Link>
        </Button>
      </div>

      {cards.length === 0 ? (
        <div className="py-20 text-center text-muted-foreground">
          まだカードがありません。
          <br />
          <Link
            className="mt-4 inline-block text-primary hover:underline"
            to="/generate"
          >
            カードを作成する
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {cards.map((card) => (
            <div className="group flex flex-col space-y-2" key={card.id}>
              <div className="relative overflow-hidden rounded-lg shadow-lg transition-transform hover:scale-105">
                <img
                  alt={card.name}
                  className="h-auto w-full"
                  src={card.imageBase64}
                />
              </div>

              <div className="flex items-center justify-between px-2">
                <span className="mr-2 flex-1 truncate font-bold">
                  {card.name}
                </span>
                <Button
                  className="text-muted-foreground hover:text-destructive"
                  onClick={() => {
                    if (confirm("本当に削除しますか？")) {
                      card.id && db.cards.delete(card.id);
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
