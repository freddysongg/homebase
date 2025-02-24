import About from '@/components/About';
import Landing from '@/components/Landing';

const Home = () => {
  return (
    <div className="flex flex-col items-center justify-center gap-10">
      <Landing />
      <About />
    </div>
  );
};

export default Home;
