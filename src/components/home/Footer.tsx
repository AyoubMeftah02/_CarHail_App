export const Footer = () => (
  <footer className="bg-gray-900 text-gray-400 py-8">
    <div className="container mx-auto px-4">
      <div className="flex flex-col md:flex-row justify-between items-center">
        <div className="mb-4 md:mb-0">
          <span className="text-white font-bold text-lg">CarHail</span>
          <p className="text-sm mt-1">
            © {new Date().getFullYear()} All rights reserved
          </p>
        </div>
        <div className="flex space-x-6">
          <a href="#" className="hover:text-white transition-colors">
            Terms
          </a>
          <a href="#" className="hover:text-white transition-colors">
            Privacy
          </a>
          <a href="#" className="hover:text-white transition-colors">
            Help
          </a>
        </div>
      </div>
    </div>
  </footer>
);
