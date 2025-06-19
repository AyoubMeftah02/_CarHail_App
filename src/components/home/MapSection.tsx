import { Map } from '@/components/map/Map';

interface MapSectionProps {
  userAccount: string | null;
}

export const MapSection = ({ userAccount }: MapSectionProps) => (
  <section className="relative z-20 -mt-16 md:-mt-24 mb-16 px-4">
    <div className="container mx-auto">
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-200">
        <Map userAccount={userAccount || ''} />
      </div>
    </div>
  </section>
);
