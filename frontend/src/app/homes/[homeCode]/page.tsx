import HomeDetails from '@/components/homes/HomeDetails';

export default function HomePage({ params }: { params: { homeCode: string } }) {
  return <HomeDetails homeCode={params.homeCode} />;
}
