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
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">コレクション</h1>
        <Button asChild variant="outline">
          <Link to="/">トップへ戻る</Link>
        </Button>
      </div>

      {cards.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground">
          まだカードがありません。
          <br />
          <Link
            to="/generate"
            className="text-primary hover:underline mt-4 inline-block"
          >
            カードを作成する
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {cards.map((card) => (
            <div key={card.id} className="flex flex-col space-y-2 group">
              <div className="relative overflow-hidden rounded-lg shadow-lg transition-transform hover:scale-105">
                <img
                  src={card.imageBase64}
                  alt={card.name}
                  className="w-full h-auto"
                />
              </div>

              <div className="flex justify-between items-center px-2">
                <span className="font-bold truncate flex-1 mr-2">
                  {card.name}
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    if (confirm("本当に削除しますか？")) {
                      card.id && db.cards.delete(card.id);
                    }
                  }}
                  className="text-muted-foreground hover:text-destructive"
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
