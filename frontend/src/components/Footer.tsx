import Button from './Button';
import Link from 'next/link';

const Footer = () => {
  return (
    <footer className="w-full bg-black text-white py-4 px-6 text-center">
      <div className="flex flex-col md:flex-row justify-between items-center max-w-5xl mx-auto">
        <div className="text-sm text-gray-300">
          <p>
            Email:{' '}
            <a href="mailto:info@mywebsite.com" className="text-white hover:underline">
              info@homebase.com
            </a>
          </p>
          <p>
            Phone:{' '}
            <a href="tel:+1234567890" className="text-white hover:underline">
              +1 (234) 567-890
            </a>
          </p>
        </div>

        <nav className="flex space-x-4 text-sm font-medium mt-3 md:mt-0">
          <Link href="/chore" className="hover:underline">
            Chore Management
          </Link>
          <Link href="/expense" className="hover:underline">
            Expense Tracking
          </Link>
          <Link href="/tasks" className="hover:underline">
            Household Tasks
          </Link>
          <Link href="/user-profiles" className="hover:underline">
            User Profiles
          </Link>
        </nav>

        <div className="mt-3 md:mt-0">
          <Button
            title="Contact Us"
            link="/contact"
            color="bg-white text-black hover:bg-gray-200"
          />
        </div>
      </div>

      <p className="text-xs text-gray-400 mt-3">
        &copy; {new Date().getFullYear()} HomeBase. All rights reserved.
      </p>
    </footer>
  );
};

export default Footer;
