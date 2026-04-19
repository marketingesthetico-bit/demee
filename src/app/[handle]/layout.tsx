export default function PublicHandleLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <footer className="border-t border-black/10 bg-paper py-8 text-center text-xs text-ink/40">
        <a href="/" className="hover:text-ink/70">
          Built on demee.app ↗
        </a>
      </footer>
    </>
  );
}
