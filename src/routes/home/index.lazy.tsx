import { createLazyFileRoute } from '@tanstack/react-router';

export const Route = createLazyFileRoute('/home/')({
  component: Home,
});

export function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white">
      <div className="max-w-4xl mx-auto px-4 py-16">
        <header className="text-center mb-16">
          <h1 className="text-5xl font-bold mb-4">PartyJS</h1>
          <p className="text-xl text-gray-600">
            Open-source party games for the web browser
          </p>
        </header>

        <section className="mb-16">
          <h2 className="text-3xl font-semibold mb-6">Why PartyJS?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 bg-white rounded-lg shadow-sm">
              <h3 className="text-xl font-semibold mb-3">No Installation</h3>
              <p className="text-gray-600">
                Play instantly in your browser - no downloads or apps required
              </p>
            </div>
            <div className="p-6 bg-white rounded-lg shadow-sm">
              <h3 className="text-xl font-semibold mb-3">Cross Platform</h3>
              <p className="text-gray-600">
                Works on any device with a modern web browser
              </p>
            </div>
            <div className="p-6 bg-white rounded-lg shadow-sm">
              <h3 className="text-xl font-semibold mb-3">Free & Open Source</h3>
              <p className="text-gray-600">
                Community-driven development, forever free to use
              </p>
            </div>
          </div>
        </section>

        <section className="text-center mb-16">
          <h2 className="text-3xl font-semibold mb-6">Get Started</h2>
          <p className="text-xl mb-8">
            Join the fun with our collection of multiplayer party games!
          </p>
          <button className="bg-purple-600 text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-purple-700 transition-colors">
            Browse Games
          </button>
        </section>

        <section className="text-center">
          <h2 className="text-3xl font-semibold mb-6">Join Our Community</h2>
          <p className="text-gray-600 mb-6">
            PartyJS is an open-source project. We welcome contributors of all
            skill levels!
          </p>
          <div className="flex justify-center gap-4">
            <a
              href="https://github.com/winzipsdo/partyjs"
              className="text-gray-600 hover:text-gray-900"
            >
              GitHub
            </a>
          </div>
        </section>
      </div>
    </div>
  );
}
