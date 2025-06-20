import Navbar from '@/components/layout/Navbar';

const samplePassengers = [
  {
    name: 'Alice Cooper',
    wallet: '0x1234...abcd',
  },
  {
    name: 'Bob Marley',
    wallet: '0xbeef...cafe',
  },
  {
    name: 'Charlie Chaplin',
    wallet: '0xdead...beef',
  },
];

const randomAvatars = [
  'https://api.dicebear.com/7.x/adventurer/svg?seed=alice',
  'https://api.dicebear.com/7.x/adventurer/svg?seed=bob',
  'https://api.dicebear.com/7.x/adventurer/svg?seed=charlie',
];

const PassengersPage = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-2xl mx-auto py-8 px-4">
        <h2 className="text-2xl font-bold mb-8 text-gray-800">Passengers</h2>
        <ul className="divide-y divide-gray-200 bg-white rounded-lg shadow">
          {samplePassengers.map((p, i) => (
            <li key={p.wallet} className="flex items-center gap-4 py-5 px-4">
              <img
                src={randomAvatars[i % randomAvatars.length]}
                alt={p.name}
                className="w-14 h-14 rounded-full object-cover border-2 border-blue-200 bg-gray-100"
              />
              <div className="flex-1">
                <div className="text-lg font-semibold text-gray-800">
                  {p.name}
                </div>
                <div className="text-gray-500 text-sm">{p.wallet}</div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default PassengersPage;
