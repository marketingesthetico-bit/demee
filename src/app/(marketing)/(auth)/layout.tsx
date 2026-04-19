export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-paper px-4 py-12">
      <a href="/" className="mb-10 font-display text-2xl text-ink">
        demee<span className="text-mustard">.</span>
      </a>
      {children}
    </div>
  );
}
