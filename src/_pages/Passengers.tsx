import Navbar from '@/components/layout/Navbar';

const samplePassengers = [
  {
    name: 'Alice Cooper',
    avatar: 'https://randomuser.me/api/portraits/women/1.jpg',
    wallet: '0x1234...abcd',
  },
  {
    name: 'Bob Marley',
    avatar: 'https://randomuser.me/api/portraits/men/2.jpg',
    wallet: '0xbeef...cafe',
  },
  {
    name: 'Charlie Chaplin',
    avatar: 'https://randomuser.me/api/portraits/men/3.jpg',
    wallet: '0xdead...beef',
  },
];

const PassengersPage = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-6xl mx-auto py-8 px-4">
        <h2 className="text-2xl font-bold mb-8 text-gray-800">Passengers</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
          {samplePassengers.map((p) => (
            <div
              key={p.wallet}
              className="bg-white rounded-lg shadow p-6 flex flex-col items-center"
            >
              <img
                src={p.avatar}
                alt={p.name}
                className="w-24 h-24 rounded-full mb-4 object-cover border-2 border-blue-200"
              />
              <div className="text-lg font-semibold text-gray-800 mb-1">
                {p.name}
              </div>
              <div className="text-gray-500 text-sm">{p.wallet}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PassengersPage;
