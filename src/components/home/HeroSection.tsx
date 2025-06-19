import { FaMapMarkerAlt, FaClock, FaShieldAlt } from 'react-icons/fa';

const features = [
  {
    icon: <FaMapMarkerAlt className="h-6 w-6 text-blue-600" />,
    text: 'Real-time tracking',
  },
  {
    icon: <FaClock className="h-6 w-6 text-blue-600" />,
    text: 'Fast pickups',
  },
  {
    icon: <FaShieldAlt className="h-6 w-6 text-blue-600" />,
    text: 'Secure payments',
  },
];

export const HeroSection = () => (
  <section className="relative overflow-hidden">
    <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-blue-800 opacity-10"></div>
    <div className="relative z-10 container mx-auto px-4 py-12 md:py-20">
      <div className="max-w-3xl mx-auto text-center">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
          Decentralized Ride-Hailing
          <span className="text-blue-600"> Reimagined</span>
        </h1>
        <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
          Experience the future of transportation with our secure,
          transparent, and user-friendly platform.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
          {features.map((item, index) => (
            <div
              key={index}
              className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-blue-50 mb-4">
                {item.icon}
              </div>
              <h3 className="text-lg font-medium text-gray-900">
                {item.text}
              </h3>
            </div>
          ))}
        </div>
      </div>
    </div>
  </section>
);
