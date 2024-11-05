import { createLazyFileRoute } from '@tanstack/react-router';

export const Route = createLazyFileRoute('/home/')({
  component: Home,
});

export function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-4 sm:gap-8 px-4">
      <img
        src="/partyjs/partyjs.svg"
        alt="PartyJS Logo"
        className="w-32 sm:w-48 animate-bounce-slow"
      />
      <h1
        className="text-3xl sm:text-4xl font-bold font-mono tracking-wide glitch"
        data-text="PartyJS"
      >
        PartyJS
      </h1>
      <style>{`
        @keyframes bounce-slow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-20px); }
        }
        .animate-bounce-slow {
          animation: bounce-slow 3s ease-in-out infinite;
        }

        .glitch {
          position: relative;
          color: #2d3436;
          text-shadow: 0.05em 0 0 #00fffc,
                      -0.03em -0.04em 0 #fc00ff,
                      0.025em 0.04em 0 #fffc00;
          animation: glitch 725ms infinite;
        }

        .glitch span {
          position: absolute;
          top: 0;
          left: 0;
        }

        .glitch::before,
        .glitch::after {
          content: attr(data-text);
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
        }

        .glitch::before {
          left: 2px;
          text-shadow: -2px 0 #ff00c1;
          clip: rect(44px, 450px, 56px, 0);
          animation: glitch-anim 5s infinite linear alternate-reverse;
        }

        .glitch::after {
          left: -2px;
          text-shadow: -2px 0 #00fff9;
          clip: rect(44px, 450px, 56px, 0);
          animation: glitch-anim2 1s infinite linear alternate-reverse;
        }

        @keyframes glitch {
          0% {
            text-shadow: 0.05em 0 0 #00fffc,
                        -0.03em -0.04em 0 #fc00ff,
                        0.025em 0.04em 0 #fffc00;
          }
          15% {
            text-shadow: 0.05em 0 0 #00fffc,
                        -0.03em -0.04em 0 #fc00ff,
                        0.025em 0.04em 0 #fffc00;
          }
          16% {
            text-shadow: -0.05em -0.025em 0 #00fffc,
                        0.025em 0.035em 0 #fc00ff,
                        -0.05em -0.05em 0 #fffc00;
          }
          49% {
            text-shadow: -0.05em -0.025em 0 #00fffc,
                        0.025em 0.035em 0 #fc00ff,
                        -0.05em -0.05em 0 #fffc00;
          }
          50% {
            text-shadow: 0.05em 0.035em 0 #00fffc,
                        0.03em 0 0 #fc00ff,
                        0 -0.04em 0 #fffc00;
          }
          99% {
            text-shadow: 0.05em 0.035em 0 #00fffc,
                        0.03em 0 0 #fc00ff,
                        0 -0.04em 0 #fffc00;
          }
          100% {
            text-shadow: -0.05em 0 0 #00fffc,
                        -0.025em -0.04em 0 #fc00ff,
                        -0.04em -0.025em 0 #fffc00;
          }
        }

        @keyframes glitch-anim {
          0% {
            clip: rect(15px, 9999px, 87px, 0);
          }
          20% {
            clip: rect(45px, 9999px, 34px, 0);
          }
          40% {
            clip: rect(23px, 9999px, 92px, 0);
          }
          60% {
            clip: rect(64px, 9999px, 98px, 0);
          }
          80% {
            clip: rect(32px, 9999px, 23px, 0);
          }
          100% {
            clip: rect(12px, 9999px, 78px, 0);
          }
        }

        @keyframes glitch-anim2 {
          0% {
            clip: rect(65px, 9999px, 32px, 0);
          }
          20% {
            clip: rect(15px, 9999px, 84px, 0);
          }
          40% {
            clip: rect(45px, 9999px, 46px, 0);
          }
          60% {
            clip: rect(54px, 9999px, 12px, 0);
          }
          80% {
            clip: rect(31px, 9999px, 88px, 0);
          }
          100% {
            clip: rect(86px, 9999px, 62px, 0);
          }
        }
      `}</style>
    </div>
  );
}
