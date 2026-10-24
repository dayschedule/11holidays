export interface FaqItem {
  q: string;
  a: string;
}

/** Visible FAQ answers; pair it with `faqSchema` in the route head so the page and JSON-LD match */
export function FaqSection({ items, title = 'Frequently asked questions' }: { items: FaqItem[]; title?: string }) {
  return (
    <section className="space-y-4">
      <h2 className="text-2xl font-bold">{title}</h2>
      <div className="divide-y rounded-2xl border bg-card shadow-xs">
        {items.map((f) => (
          <div key={f.q} className="p-4">
            <h3 className="font-semibold">{f.q}</h3>
            <p className="mt-1.5 text-sm text-muted-foreground">{f.a}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
