import { Chip } from '@mui/material';

type FlightBase = {
  id: string;
  origin: string;
  destination: string;
  departure: string;
  arrival: string;
  durationMinutes: number;
  fareClass: string;
  cashPrice: number;
  pointsPrice: number;
  perks: string[];
};

type DecoratedFields = {
  departureLabel: string;
  arrivalLabel: string;
  durationLabel: string;
};

export type FlightOffer = FlightBase & Partial<DecoratedFields>;

interface FlightCardProps {
  flight: FlightBase & DecoratedFields;
  onCheckout?: (flight: FlightBase & DecoratedFields) => void;
}

const FlightCard = ({ flight, onCheckout }: FlightCardProps) => {
  return (
    <article
      style={{
        padding: '24px',
        background: 'white',
        borderRadius: '18px',
        border: '1px solid rgba(148, 163, 184, 0.2)',
        boxShadow: '0 18px 40px rgba(15, 23, 42, 0.07)',
        display: 'grid',
        gap: '18px'
      }}
    >
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '16px' }}>
        <div>
          <h2 style={{ margin: '0 0 4px', fontSize: '22px', fontWeight: 700 }}>
            {flight.origin} → {flight.destination}
          </h2>
          <p style={{ margin: 0, color: '#475569', fontWeight: 500 }}>{flight.fareClass}</p>
        </div>
        <div style={{ textAlign: 'right' }}>
          <p style={{ margin: 0, fontSize: '14px', color: '#64748b' }}>Duration</p>
          <p style={{ margin: 0, fontWeight: 600 }}>{flight.durationLabel}</p>
        </div>
      </header>

      <section
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '16px',
          alignItems: 'stretch'
        }}
      >
        <div
          style={{
            borderRadius: '12px',
            border: '1px solid rgba(59, 130, 246, 0.2)',
            padding: '16px',
            background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.12), rgba(14, 165, 233, 0.08))'
          }}
        >
          <p style={{ margin: 0, color: '#2563eb', fontSize: '14px', fontWeight: 600, letterSpacing: '0.08em' }}>
            Cash fare
          </p>
          <p style={{ margin: '6px 0 0', fontSize: '28px', fontWeight: 700 }}>${flight.cashPrice.toLocaleString()}</p>
          <p style={{ margin: '4px 0 0', color: '#475569', fontSize: '14px' }}>Taxes & fees included</p>
        </div>

        <div
          style={{
            borderRadius: '12px',
            border: '1px solid rgba(30, 64, 175, 0.25)',
            padding: '16px',
            background: 'linear-gradient(135deg, rgba(30, 64, 175, 0.18), rgba(56, 189, 248, 0.1))',
            color: '#0f172a'
          }}
        >
          <p style={{ margin: 0, color: '#1d4ed8', fontSize: '14px', fontWeight: 600, letterSpacing: '0.08em' }}>
            Points fare
          </p>
          <p style={{ margin: '6px 0 0', fontSize: '28px', fontWeight: 700 }}>
            {flight.pointsPrice.toLocaleString()} pts
          </p>
          <p style={{ margin: '4px 0 0', color: '#0f172a', fontSize: '14px' }}>Best for mileage maximizers</p>
        </div>
      </section>

      <footer style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
        {flight.perks.map((perk) => (
          <Chip key={perk} label={perk} color="primary" variant="outlined" sx={{ fontWeight: 600 }} />
        ))}
      </footer>

      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', flexWrap: 'wrap' }}>
        <button
          type="button"
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
          Hold with points
        </button>
        <button
          type="button"
          style={{
            padding: '12px 18px',
            borderRadius: '10px',
            border: 'none',
            background: 'linear-gradient(135deg, #2563eb, #7c3aed)',
            color: 'white',
            fontWeight: 600,
            cursor: 'pointer',
            boxShadow: '0 10px 20px rgba(59, 130, 246, 0.3)'
          }}
          onClick={() => onCheckout?.(flight)}
        >
          Continue to checkout
        </button>
      </div>
    </article>
  );
};

export default FlightCard;
