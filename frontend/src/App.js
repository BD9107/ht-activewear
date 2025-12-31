import './App.css';

function App() {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #1e293b 0%, #334155 50%, #1e293b 100%)',
      padding: '20px'
    }}>
      {/* Main content */}
      <div style={{
        textAlign: 'center',
        maxWidth: '500px',
        width: '100%'
      }}>
        {/* Icon */}
        <div style={{
          width: '100px',
          height: '100px',
          margin: '0 auto 30px',
          background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
          borderRadius: '20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.3)'
        }}>
          <svg 
            width="50" 
            height="50" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="white" 
            strokeWidth="2"
          >
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          </svg>
        </div>

        {/* Title */}
        <h1 style={{
          fontSize: '2.5rem',
          fontWeight: 'bold',
          color: 'white',
          marginBottom: '30px',
          fontFamily: 'system-ui, -apple-system, sans-serif'
        }}>
          HT Activewear
        </h1>

        {/* Message Box */}
        <div style={{
          background: 'rgba(30, 41, 59, 0.5)',
          backdropFilter: 'blur(20px)',
          borderRadius: '20px',
          padding: '40px',
          border: '1px solid rgba(148, 163, 184, 0.2)',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.3)'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '10px',
            marginBottom: '20px'
          }}>
            <svg 
              width="24" 
              height="24" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="#60a5fa" 
              strokeWidth="2"
            >
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
            <h2 style={{
              fontSize: '1.5rem',
              fontWeight: '600',
              color: 'white',
              margin: 0,
              fontFamily: 'system-ui, -apple-system, sans-serif'
            }}>
              System Maintenance
            </h2>
          </div>
          
          <p style={{
            color: '#cbd5e1',
            fontSize: '1.1rem',
            marginBottom: '20px',
            lineHeight: '1.6',
            fontFamily: 'system-ui, -apple-system, sans-serif'
          }}>
            We're currently performing system upgrades to serve you better.
          </p>
          
          <p style={{
            color: '#94a3b8',
            fontSize: '0.95rem',
            margin: 0,
            fontFamily: 'system-ui, -apple-system, sans-serif'
          }}>
            The order system will be back online shortly.
          </p>
        </div>

        {/* Footer */}
        <div style={{
          marginTop: '40px',
          color: '#64748b',
          fontSize: '0.9rem',
          fontFamily: 'system-ui, -apple-system, sans-serif'
        }}>
          <p style={{ margin: '0 0 10px 0' }}>Questions? Contact us at:</p>
          <p style={{ 
            color: '#60a5fa', 
            margin: 0,
            fontWeight: '500'
          }}>
            blindingmedia@gmail.com
          </p>
        </div>
      </div>
    </div>
  );
}

export default App;