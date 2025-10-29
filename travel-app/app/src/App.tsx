import { useMemo, useState } from 'react';
import FlightCard from './components/FlightCard';
import type { FlightOffer } from './components/FlightCard';

const flights: FlightOffer[] = [
  {
    id: 'SEA-JFK-001',
    origin: 'Seattle',
    destination: 'New York (JFK)',
    departure: '2024-07-12T09:30:00-07:00',
    arrival: '2024-07-12T17:50:00-04:00',
    durationMinutes: 320,
    fareClass: 'Business Flex',
    cashPrice: 689,
    pointsPrice: 55200,
    perks: ['2 checked bags', 'Lounge access', 'Priority boarding']
  },
  {
    id: 'SFO-CDG-101',
    origin: 'San Francisco',
    destination: 'Paris (CDG)',
    departure: '2024-08-04T13:05:00-07:00',
    arrival: '2024-08-05T09:35:00+02:00',
    durationMinutes: 640,
    fareClass: 'Premium Select',
    cashPrice: 1149,
    pointsPrice: 86400,
    perks: ['Lie-flat seat', 'Fine dining', 'Arrivals lounge access']
  },
  {
    id: 'ATL-CUN-207',
    origin: 'Atlanta',
    destination: 'Cancún (CUN)',
    departure: '2024-06-18T07:15:00-04:00',
    arrival: '2024-06-18T10:55:00-05:00',
    durationMinutes: 160,
    fareClass: 'SkyComfort',
    cashPrice: 289,
    pointsPrice: 22400,
    perks: ['Extra legroom', 'Welcome beverage']
  }
];

const formatDate = (iso: string) =>
  new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    timeZoneName: 'short'
  }).format(new Date(iso));

const formatDuration = (minutes: number) => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours}h ${mins}m`;
};

function App() {
  const [selectedCabin, setSelectedCabin] = useState<string>('All cabins');

  const cabins = useMemo(() => ['All cabins', ...new Set(flights.map((flight) => flight.fareClass))], []);

  const filteredFlights = useMemo(() => {
    if (selectedCabin === 'All cabins') {
      return flights;
    }
    return flights.filter((flight) => flight.fareClass === selectedCabin);
  }, [selectedCabin]);

  return (
    <div style={{ padding: '32px', maxWidth: '980px', margin: '0 auto' }}>
      <header style={{ marginBottom: '24px' }}>
        <p style={{ color: '#475569', fontSize: '14px', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
          Skyward Rewards
        </p>
        <h1 style={{ margin: 0, fontSize: '40px', fontWeight: 700 }}>Choose your next reward escape ✈️</h1>
        <p style={{ color: '#475569', maxWidth: '640px', marginTop: '12px', lineHeight: 1.6 }}>
          Browse curated flight offers and compare the cash and points prices side-by-side. Book with the option
          that fits your balance and travel style.
        </p>
      </header>

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
          marginBottom: '24px',
          flexWrap: 'wrap'
        }}
      >
        <label htmlFor="cabin-filter" style={{ fontWeight: 600, color: '#0f172a' }}>
          Fare cabin
        </label>
        <select
          id="cabin-filter"
          value={selectedCabin}
          onChange={(event) => setSelectedCabin(event.target.value)}
          style={{
            padding: '10px 14px',
            borderRadius: '10px',
            border: '1px solid #cbd5f5',
            background: 'white',
            fontSize: '15px',
            fontWeight: 500,
            color: '#1e293b'
          }}
        >
          {cabins.map((cabin) => (
            <option key={cabin} value={cabin}>
              {cabin}
            </option>
          ))}
        </select>
      </div>

      <main style={{ display: 'grid', gap: '20px' }}>
        {filteredFlights.map((flight) => (
          <FlightCard
            key={flight.id}
            flight={{
              ...flight,
              departureLabel: formatDate(flight.departure),
              arrivalLabel: formatDate(flight.arrival),
              durationLabel: formatDuration(flight.durationMinutes)
            }}
          />
        ))}
      </main>
    </div>
  );
}

export default App;
