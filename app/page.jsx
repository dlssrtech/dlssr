import LandingPage from '../components/LandingPage';
import defaultContent from '../server/data/defaultContent.json';

async function loadContent() {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000'}/api/content`, {
      cache: 'no-store',
    });
    if (!response.ok) throw new Error('Unable to load content');
    return response.json();
  } catch (error) {
    return defaultContent;
  }
}

export default async function HomePage() {
  const content = await loadContent();
  return <LandingPage content={content} />;
}
