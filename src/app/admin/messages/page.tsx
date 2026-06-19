import { db } from "@/lib/db";
import { MarkReadButton } from "@/components/admin/MarkReadButton";

export const metadata = { title: "Contact Messages" };

export default async function AdminMessagesPage() {
  const messages = await db.contactMessage.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <h1 className="text-2xl font-bold">Contact Messages</h1>
      <div className="mt-8 space-y-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`rounded-2xl border p-6 ${
              msg.read
                ? "border-slate-200 bg-white"
                : "border-amber-200 bg-amber-50/50"
            }`}
          >
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <h2 className="font-semibold">{msg.name}</h2>
                <p className="text-sm text-slate-600">{msg.email}</p>
                {msg.company && (
                  <p className="text-sm text-slate-500">{msg.company}</p>
                )}
              </div>
              <div className="text-right text-xs text-slate-500">
                {msg.createdAt.toLocaleString()}
                {!msg.read && <MarkReadButton id={msg.id} />}
              </div>
            </div>
            {msg.subject && (
              <p className="mt-3 text-sm font-medium">{msg.subject}</p>
            )}
            <p className="mt-2 text-sm text-slate-700">{msg.message}</p>
          </div>
        ))}
        {messages.length === 0 && (
          <p className="text-slate-500">No messages yet.</p>
        )}
      </div>
    </div>
  );
}
