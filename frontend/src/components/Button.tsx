import Link from 'next/link';

const Button = ({ title, link }: { title: string; link: string }) => {
  return (
    <Link
      href={link}
      className="inline-block px-6 py-3 bg-black text-white text-lg font-medium rounded-lg shadow-md hover:bg-gray-900 transition"
    >
      {title}
    </Link>
  );
};

export default Button;
