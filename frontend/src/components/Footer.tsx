import Button from './Button';
import Link from 'next/link';

const Footer = () => {
  return (
    <footer className="w-full bg-white dark:bg-dark-primary text-gray-900 dark:text-white border-t border-gray-200 dark:border-dark-border py-4 px-6 text-center mt-auto">
      <div className="flex flex-col md:flex-row justify-between items-center max-w-5xl mx-auto">
        <div className="text-sm text-gray-600 dark:text-gray-300">
          <p>
            Email:{' '}
            <a
              href="mailto:info@mywebsite.com"
              className="text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400"
            >
              info@homebase.com
            </a>
          </p>
          <p>
            Phone:{' '}
            <a
              href="tel:+1234567890"
              className="text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400"
            >
              +1 (234) 567-890
            </a>
          </p>
        </div>

        <nav className="flex space-x-4 text-sm font-medium mt-3 md:mt-0">
          <Link
            href="/"
            className="text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400"
          >
            Chore Management
          </Link>
          <Link
            href="/"
            className="text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400"
          >
            Expense Tracking
          </Link>
          <Link
            href="/"
            className="text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400"
          >
            Household Tasks
          </Link>
          <Link
            href="/"
            className="text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400"
          >
            User Profiles
          </Link>
        </nav>

        <div className="mt-3 md:mt-0">
          <Button
            title="Contact Us"
            link="/contact"
            color="bg-blue-500 dark:bg-blue-600 text-white hover:bg-blue-600 dark:hover:bg-blue-700"
          />
        </div>
      </div>

      <p className="text-xs text-gray-600 dark:text-gray-400 mt-3">
        &copy; {new Date().getFullYear()} HomeBase. All rights reserved.
      </p>
    </footer>
  );
};

export default Footer;
