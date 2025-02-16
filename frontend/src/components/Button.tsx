import Link from "next/link";

interface ButtonProps {
  title: string;
  link: string;
  color?: string; // Optional prop for custom background color
}

const Button: React.FC<ButtonProps> = ({ title, link, color }) => {
  return (
    <Link
      href={link}
      className={`inline-block px-6 py-3 text-lg font-medium rounded-lg shadow-md transition ${
        color ? color : "bg-black text-white hover:bg-gray-900"
      }`}
    >
      {title}
    </Link>
  );
};

export default Button;