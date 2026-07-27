import { Carousel } from './components/Carousel';
import type { CardProps } from './components/Card';

function App() {
  const carouselItems: CardProps[] = [
    {
      image: '/assets/neon_city.jpg',
      caption: 'Futuristic',
      title: 'Neon Metropolis',
      description: 'A sprawling cyberpunk cityscape washed in brilliant neon light, showcasing towering skyscrapers and rain-slicked streets reflecting the glow.',
      className: 'neon-card-first',
    },
    {
      image: '/assets/cyberpunk_forest.jpg',
      caption: 'Nature',
      title: 'Bioluminescent Grove',
      description: 'A magical, hidden forest lit only by glowing purple and teal flora. A quiet river flows through the ancient trees under a blanket of cosmic stars.',
    },
    {
      image: '/assets/cosmic_ocean.jpg',
      caption: 'Cosmos',
      title: 'Nebula Shoreline',
      description: "An alien planet's shore where bioluminescent waves crash against crystalline rocks. Twin moons rise in a colorful nebula-filled night sky.",
    },
    {
      image: '/assets/crystal_cavern.jpg',
      caption: 'Explore',
      title: 'Crystal Sanctuary',
      description: 'Deep beneath the surface lies a cathedral-sized cavern adorned with massive glowing crystals. An explorer walks a narrow path showcasing the scale.',
    },
    {
      image: 'https://picsum.photos/seed/picsum/200/300',
      caption: 'Random',
      title: 'Placeholder',
      description: 'A placeholder image for demonstration purposes.',
    },
    {
      image: 'https://picsum.photos/seed/picsum/400/600',
      caption: 'Random',
      title: 'Placeholder',
      description: 'A placeholder image for demonstration purposes.'
    },
    {
      image: 'https://picsum.photos/200/300',
      caption: 'Random',
      title: 'Placeholder',
      description: 'A placeholder image for demonstration purposes.'
    }
  ];

  return (
    <div className="app-container">
      <main className="app-main">
        <Carousel items={carouselItems} />
      </main>
    </div>
  );
}

export default App;
