import HomeDetails from '@/components/homes/HomeDetails';

export default async function HomePage({ params }: { params: { homeCode: string } }) {
  const { homeCode } = await params;

  return <HomeDetails homeCode={homeCode} />;
}
