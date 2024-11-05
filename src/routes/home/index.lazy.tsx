import { createLazyFileRoute } from '@tanstack/react-router';

export const Route = createLazyFileRoute('/home/')({
  component: Home,
});

export function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-8">
      <img
        src="/partyjs/partyjs.svg"
        alt="PartyJS Logo"
        className="w-48 animate-bounce-slow"
      />
      <h1 className="text-4xl font-bold text-gray-800">PartyJS</h1>
      <style>{`
        @keyframes bounce-slow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-20px); }
        }
        .animate-bounce-slow {
          animation: bounce-slow 3s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
