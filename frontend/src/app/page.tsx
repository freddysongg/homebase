import About from '@/components/About';
import Landing from '@/components/Landing';
import Footer from '@/components/Footer';

const Home = () => {
  return (
    <div className="flex flex-col items-center justify-center gap-10">
      <Landing />
      <About />
      <Footer />
    </div>
  );
};

export default Home;
