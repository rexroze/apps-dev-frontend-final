import Image from "next/image";

export default function AuthLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-8 w-full max-w-lg">
        {/* <div className="flex items-center gap-4">
          <Image className="dark:invert" src="/next.svg" alt="Next.js logo" width={100} height={20} priority />
          <span className="text-2xl font-bold">+</span>
          <Image className="dark:invert" src="/express.png" alt="Express.js logo" width={100} height={20} priority />
        </div> */}

        <div className="bg-card rounded-lg p-8 w-full shadow-sm border border-border">
          {children}
        </div>
      </div>
    </main>
  );
}