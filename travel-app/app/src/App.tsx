import { FormEvent, useMemo, useState } from 'react';
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

type FlightWithLabels = FlightOffer & {
  departureLabel: string;
  arrivalLabel: string;
  durationLabel: string;
};

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
  const [view, setView] = useState<'browse' | 'auth' | 'checkout'>('browse');
  const [selectedFlight, setSelectedFlight] = useState<FlightWithLabels | null>(null);
  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [authError, setAuthError] = useState<string>('');

  const cabins = useMemo(() => ['All cabins', ...new Set(flights.map((flight) => flight.fareClass))], []);

  const filteredFlights = useMemo(() => {
    if (selectedCabin === 'All cabins') {
      return flights;
    }
    return flights.filter((flight) => flight.fareClass === selectedCabin);
  }, [selectedCabin]);

  const decoratedFlights = useMemo<FlightWithLabels[]>(
    () =>
      filteredFlights.map((flight) => ({
        ...flight,
        departureLabel: formatDate(flight.departure),
        arrivalLabel: formatDate(flight.arrival),
        durationLabel: formatDuration(flight.durationMinutes)
      })),
    [filteredFlights]
  );

  const handleCheckoutRequest = (flight: FlightWithLabels) => {
    setSelectedFlight(flight);
    setView('auth');
    setUsername('');
    setPassword('');
    setAuthError('');
  };

  const handleAuthSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (username.trim() === 'test' && password === 'testpass') {
      setAuthError('');
      setView('checkout');
    } else {
      setAuthError('Incorrect username or password. Try test / testpass.');
    }
  };

  const handleReturnToBrowse = () => {
    setView('browse');
    setSelectedFlight(null);
    setAuthError('');
  };

  if (view === 'auth' && selectedFlight) {
    return (
      <div
        style={{
          minHeight: '100vh',
          background: '#f8fafc',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px'
        }}
      >
        <div
          style={{
            maxWidth: '420px',
            width: '100%',
            background: 'white',
            borderRadius: '18px',
            border: '1px solid rgba(148, 163, 184, 0.2)',
            boxShadow: '0 18px 40px rgba(15, 23, 42, 0.1)',
            padding: '32px',
            display: 'grid',
            gap: '20px'
          }}
        >
          <button
            type="button"
            onClick={handleReturnToBrowse}
            style={{
              alignSelf: 'flex-start',
              padding: '8px 14px',
              borderRadius: '10px',
              border: '1px solid #cbd5f5',
              background: 'white',
              fontWeight: 600,
              color: '#2563eb',
              cursor: 'pointer'
            }}
          >
            ← Back to flights
          </button>
          <div>
            <p style={{ margin: 0, color: '#475569', fontSize: '14px', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
              Secure checkout
            </p>
            <h1 style={{ margin: '6px 0 0', fontSize: '30px', fontWeight: 700 }}>Sign in to continue</h1>
            <p style={{ margin: '10px 0 0', color: '#475569' }}>
              Use the demo credentials <strong>test</strong> / <strong>testpass</strong> to unlock the checkout flow.
            </p>
          </div>
          <form onSubmit={handleAuthSubmit} style={{ display: 'grid', gap: '16px' }}>
            <label style={{ display: 'grid', gap: '6px', fontWeight: 600, color: '#0f172a' }}>
              Username
              <input
                type="text"
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                placeholder="Enter username"
                style={{
                  padding: '12px 14px',
                  borderRadius: '10px',
                  border: '1px solid #cbd5f5',
                  fontSize: '15px'
                }}
                required
              />
            </label>
            <label style={{ display: 'grid', gap: '6px', fontWeight: 600, color: '#0f172a' }}>
              Password
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Enter password"
                style={{
                  padding: '12px 14px',
                  borderRadius: '10px',
                  border: '1px solid #cbd5f5',
                  fontSize: '15px'
                }}
                required
              />
            </label>
            {authError && (
              <p style={{ margin: 0, color: '#ef4444', fontWeight: 600, fontSize: '14px' }} role="alert">
                {authError}
              </p>
            )}
            <button
              type="submit"
              style={{
                marginTop: '8px',
                padding: '12px 18px',
                borderRadius: '10px',
                border: 'none',
                background: 'linear-gradient(135deg, #2563eb, #7c3aed)',
                color: 'white',
                fontWeight: 600,
                cursor: 'pointer',
                boxShadow: '0 10px 20px rgba(59, 130, 246, 0.35)'
              }}
            >
              Login
            </button>
          </form>
        </div>
      </div>
    );
  }

  if (view === 'checkout' && selectedFlight) {
    const pointsBalance = 120000;
    const remainingPoints = pointsBalance - selectedFlight.pointsPrice;
    const formattedRemaining =
      remainingPoints >= 0 ? remainingPoints.toLocaleString() : `-${Math.abs(remainingPoints).toLocaleString()}`;

    return (
      <div
        style={{
          minHeight: '100vh',
          background: '#eef2ff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px'
        }}
      >
        <div
          style={{
            maxWidth: '720px',
            width: '100%',
            background: 'white',
            borderRadius: '20px',
            border: '1px solid rgba(59, 130, 246, 0.16)',
            boxShadow: '0 24px 50px rgba(37, 99, 235, 0.18)',
            padding: '36px',
            display: 'grid',
            gap: '24px'
          }}
        >
          <button
            type="button"
            onClick={handleReturnToBrowse}
            style={{
              justifySelf: 'flex-start',
              padding: '10px 16px',
              borderRadius: '10px',
              border: '1px solid rgba(37, 99, 235, 0.3)',
              background: 'white',
              color: '#2563eb',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            ← Back to flights
          </button>
          <header>
            <p style={{ margin: 0, color: '#475569', fontSize: '14px', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
              Checkout
            </p>
            <h1 style={{ margin: '6px 0 0', fontSize: '34px', fontWeight: 700 }}>
              Confirm your Skyward Rewards redemption
            </h1>
            <p style={{ margin: '12px 0 0', color: '#475569' }}>
              Review the flight details and make sure you have enough points before completing your booking.
            </p>
          </header>

          <section
            style={{
              borderRadius: '16px',
              border: '1px solid rgba(59, 130, 246, 0.2)',
              padding: '24px',
              background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.08), rgba(14, 165, 233, 0.04))'
            }}
          >
            <h2 style={{ margin: 0, fontSize: '22px', fontWeight: 700 }}>
              {selectedFlight.origin} → {selectedFlight.destination}
            </h2>
            <p style={{ margin: '8px 0 0', color: '#475569', fontWeight: 600 }}>{selectedFlight.fareClass}</p>
            <div style={{ marginTop: '16px', display: 'grid', gap: '8px', color: '#0f172a' }}>
              <span>
                <strong>Departure:</strong> {selectedFlight.departureLabel}
              </span>
              <span>
                <strong>Arrival:</strong> {selectedFlight.arrivalLabel}
              </span>
              <span>
                <strong>Duration:</strong> {selectedFlight.durationLabel}
              </span>
            </div>
          </section>

          <section
            style={{
              display: 'grid',
              gap: '16px',
              padding: '24px',
              borderRadius: '16px',
              border: '1px solid rgba(15, 23, 42, 0.08)',
              background: '#f8fafc'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 600, color: '#0f172a' }}>
              <span>Your points balance</span>
              <span>{pointsBalance.toLocaleString()} pts</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#2563eb', fontWeight: 600 }}>
              <span>Flight cost</span>
              <span>{selectedFlight.pointsPrice.toLocaleString()} pts</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, color: '#0f172a' }}>
              <span>Balance after booking</span>
              <span>{formattedRemaining} pts</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#475569' }}>
              <span>Cash comparison</span>
              <span>${selectedFlight.cashPrice.toLocaleString()}</span>
            </div>
          </section>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={handleReturnToBrowse}
              style={{
                padding: '12px 18px',
                borderRadius: '10px',
                border: '1px solid #2563eb',
                background: 'white',
                color: '#2563eb',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => {
                alert('Demo checkout complete! Returning to flight search.');
                handleReturnToBrowse();
              }}
              style={{
                padding: '12px 18px',
                borderRadius: '10px',
                border: 'none',
                background: 'linear-gradient(135deg, #2563eb, #7c3aed)',
                color: 'white',
                fontWeight: 600,
                cursor: 'pointer',
                boxShadow: '0 10px 20px rgba(59, 130, 246, 0.35)'
              }}
            >
              Complete booking
            </button>
          </div>
        </div>
      </div>
    );
  }

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
        {decoratedFlights.map((flight) => (
          <FlightCard
            key={flight.id}
            flight={flight}
            onCheckout={handleCheckoutRequest}
          />
        ))}
      </main>
    </div>
  );
}

export default App;
