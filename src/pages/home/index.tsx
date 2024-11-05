import styles from './styles.module.css';

export function HomePage() {
  const handleCommand = () => {
    document.dispatchEvent(new CustomEvent('toggleCommand'));
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-4 sm:gap-8 px-4">
      <div
        className="w-32 h-32 sm:w-48 sm:h-48 rounded-lg flex items-center justify-center cursor-pointer"
        onClick={handleCommand}
      >
        <img
          src="/partyjs/partyjs.svg"
          alt="PartyJS Logo"
          className={`w-full h-full object-contain ${styles.animateBounce}`}
        />
      </div>
      <h1
        className={`text-3xl sm:text-4xl font-bold font-mono tracking-wide ${styles.glitch} cursor-pointer`}
        data-text="PartyJS"
        onClick={handleCommand}
      >
        PartyJS
      </h1>
    </div>
  );
}
