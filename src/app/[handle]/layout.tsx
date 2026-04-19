export default function PublicHandleLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-paper">
      {children}
      <footer className="border-t border-ink/10 py-8 text-center text-xs text-ink/40">
        <a href="/" className="hover:text-ink/70">
          Built on demee.app ↗
        </a>
      </footer>
    </div>
  );
}
