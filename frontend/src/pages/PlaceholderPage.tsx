/** Stand-in for pages that don't exist yet, so every nav link has somewhere to go */
export default function PlaceholderPage({ title }: { title: string }) {
  return (
    <div className="min-h-[300vh] bg-neutral-400">
      <h1 className="p-8 font-display text-4xl font-extrabold uppercase [font-stretch:125%]">
        {title}
      </h1>
    </div>
  )
}