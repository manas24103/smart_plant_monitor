import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../services/AuthContext';
import { sensorService, controlService } from '../services/api';

/* ─── Circular Progress ─────────────────────────────────────── */
const CircularProgress = ({ value, max, color, size = 110, stroke = 9, children }) => {
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const pct = Math.min(Math.max(value / max, 0), 1);
  const offset = circ * (1 - pct);
  return (
    <div style={{ position: 'relative', width: size, height: size, margin: '0 auto' }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#e9ecef" strokeWidth={stroke} />
        <circle
          cx={size / 2} cy={size / 2} r={r} fill="none"
          stroke={color} strokeWidth={stroke}
          strokeDasharray={circ} strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 0.6s ease' }}
        />
      </svg>
      <div style={{
        position: 'absolute', inset: 0,
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center'
      }}>
        {children}
      </div>
    </div>
  );
};

/* ─── Metric Card ────────────────────────────────────────────── */
const MetricCard = ({ title, value, unit, statusText, statusColor, statusIcon, circleColor, circleMax, centerIcon }) => (
  <div style={{
    background: '#fff', borderRadius: 20, padding: '20px 16px',
    boxShadow: '0 2px 12px rgba(0,0,0,0.06)', flex: '1 1 140px',
    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12,
    minWidth: 140
  }}>
    <p style={{ margin: 0, fontSize: 13, color: '#6c757d', fontWeight: 600 }}>{title}</p>
    <CircularProgress value={value || 0} max={circleMax} color={circleColor} size={108} stroke={9}>
      {centerIcon
        ? <span style={{ fontSize: 22 }}>{centerIcon}</span>
        : <>
            <span style={{ fontSize: 22, fontWeight: 800, color: circleColor, lineHeight: 1 }}>
              {value != null ? value : '--'}
            </span>
            <span style={{ fontSize: 12, color: '#6c757d', fontWeight: 600 }}>{unit}</span>
          </>
      }
    </CircularProgress>
    <div style={{
      display: 'flex', alignItems: 'center', gap: 5,
      fontSize: 12, fontWeight: 700, color: statusColor
    }}>
      <span>{statusIcon}</span>
      <span>{statusText}</span>
    </div>
    {centerIcon && (
      <div style={{ textAlign: 'center' }}>
        <p style={{ margin: 0, fontSize: 16, fontWeight: 800, color: '#1a1a2e' }}>
          {value != null ? value : '--'} {unit}
        </p>
        <p style={{ margin: 0, fontSize: 12, color: '#6c757d' }}>{statusText}</p>
      </div>
    )}
  </div>
);

/* ─── Toggle Switch ──────────────────────────────────────────── */
// Replaced the small checkbox button with a proper toggle switch
// so the active/inactive state is clearly visible and clickable.
const ToggleSwitch = ({ active, onToggle }) => (
  <button
    onClick={onToggle}
    style={{
      width: 48,
      height: 26,
      borderRadius: 13,
      border: 'none',
      background: active ? '#2e7d32' : '#d1d5db',
      cursor: 'pointer',
      position: 'relative',
      flexShrink: 0,
      transition: 'background 0.25s ease',
      padding: 0,
    }}
    aria-pressed={active}
  >
    <span style={{
      position: 'absolute',
      top: 3,
      left: active ? 25 : 3,
      width: 20,
      height: 20,
      borderRadius: '50%',
      background: '#fff',
      boxShadow: '0 1px 4px rgba(0,0,0,0.2)',
      transition: 'left 0.25s ease',
      display: 'block',
    }} />
  </button>
);

/* ─── Control Row ────────────────────────────────────────────── */
const ControlRow = ({ icon, label, sub, active, onToggle }) => (
  <div style={{
    display: 'flex', alignItems: 'center', gap: 14,
    background: '#fff', borderRadius: 16, padding: '14px 16px',
    boxShadow: '0 1px 6px rgba(0,0,0,0.05)', border: '1px solid #f0f0f0'
  }}>
    <div style={{
      width: 44, height: 44, borderRadius: 12,
      background: '#f4f9f4', display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: 22, flexShrink: 0
    }}>{icon}</div>
    <div style={{ flex: 1 }}>
      <p style={{ margin: 0, fontWeight: 700, fontSize: 15, color: '#1a1a2e' }}>{label}</p>
      <p style={{ margin: 0, fontSize: 12, color: '#9ca3af' }}>{sub}</p>
    </div>
    <ToggleSwitch active={active} onToggle={onToggle} />
  </div>
);

/* ─── Bottom Nav ─────────────────────────────────────────────── */
const BottomNav = ({ active, setActive }) => {
  const items = [
    { id: 'dashboard', icon: '▦', label: 'Dashboard' },
    { id: 'insights', icon: '📊', label: 'Insights' },
    { id: 'schedule', icon: '🕐', label: 'Schedule' },
    { id: 'settings', icon: '⚙️', label: 'Settings' },
  ];
  return (
    <div style={{
      position: 'fixed', bottom: 0, left: 0, right: 0,
      background: '#fff', borderTop: '1px solid #f0f0f0',
      display: 'flex', justifyContent: 'space-around',
      padding: '10px 0 20px', zIndex: 100,
      boxShadow: '0 -2px 12px rgba(0,0,0,0.06)'
    }}>
      {items.map(it => (
        <button key={it.id} onClick={() => setActive(it.id)} style={{
          background: 'none', border: 'none', cursor: 'pointer',
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3,
          color: active === it.id ? '#2e7d32' : '#9ca3af',
          fontSize: 10, fontWeight: active === it.id ? 700 : 500
        }}>
          <span style={{ fontSize: 20 }}>{it.icon}</span>
          {it.label}
        </button>
      ))}
    </div>
  );
};

/* ─── Dashboard ──────────────────────────────────────────────── */
const Dashboard = () => {
  const [sensorData, setSensorData] = useState({ temperature: null, humidity: null, soil: null, light: null });
  const [pumpActive, setPumpActive] = useState(false);
  const [ventsActive, setVentsActive] = useState(false);
  const [fanActive, setFanActive] = useState(true);
  const [fanSpeed] = useState(40);
  const [activeNav, setActiveNav] = useState('dashboard');
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  const fetchSensorData = async () => {
    try {
      const data = await sensorService.getSensorData();
      console.log("🌱 Frontend received sensor data:", data);
      console.log("🌱 Soil moisture received:", data.soil, "(type:", typeof data.soil, ")");
      setSensorData(data || {});
    } catch (e) { 
      console.error('Sensor data fetch error:', e);
    }
  };

  const fetchControlState = async () => {
    try {
      const data = await controlService.getControlData();
      console.log('🎛️ Current control state:', data);
      // Update local state with backend state
      if (data.pump !== undefined) setPumpActive(data.pump);
      if (data.fan !== undefined) setFanActive(data.fan > 0);
    } catch (e) { 
      console.error('Control state fetch error:', e);
    }
  };

  useEffect(() => {
    fetchSensorData();
    fetchControlState(); // Fetch initial control state
    const sensorInterval = setInterval(fetchSensorData, 5000); // Reduced to 5 seconds
    const controlInterval = setInterval(fetchControlState, 10000); // Sync control state every 10 seconds
    return () => {
      clearInterval(sensorInterval);
      clearInterval(controlInterval);
    };
  }, []); // Empty dependency array - runs only once

  const togglePump = async () => {
    try {
      const next = !pumpActive;
      console.log('🎛️ Toggling pump:', next);
      await controlService.updateControl({ pump: next });
      setPumpActive(next);
      console.log('✅ Pump control updated successfully');
    } catch (e) { 
      console.error("❌ Pump toggle error:", e); 
    }
  };

  const toggleFan = async () => {
    try {
      const next = !fanActive;
      console.log('🎛️ Toggling fan:', next, 'Speed:', next ? fanSpeed : 0);
      await controlService.updateControl({ fan: next ? fanSpeed : 0 });
      setFanActive(next);
      console.log('✅ Fan control updated successfully');
    } catch (e) { 
      console.error("❌ Fan toggle error:", e); 
    }
  };

  const toggleVents = () => setVentsActive(prev => !prev);

  /* ── Notification Bell ── */
  const NotificationBell = () => (
    <button
      onClick={() => alert('Notifications: System is running normally')}
      style={{
        width: 44, height: 44, borderRadius: 12,
        background: '#f3f4f6', border: 'none', cursor: 'pointer',
        fontSize: 20, display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0,
      }}
    >
      🔔
    </button>
  );

  const tempOk = sensorData.temperature != null && sensorData.temperature >= 20 && sensorData.temperature <= 35;
  const humOk = sensorData.humidity != null && sensorData.humidity >= 40 && sensorData.humidity <= 80;
  const soilOk = sensorData.soil != null && sensorData.soil >= 30; // Using percentage from ESP32
  const lightHigh = sensorData.light != null && sensorData.light >= 12000;
  const allOk = tempOk && humOk && soilOk;

  const now = new Date();
  const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <div style={{
      minHeight: '100vh', background: '#f7faf7',
      fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
      maxWidth: '1200px', margin: '0 auto',
      paddingBottom: 90
    }}>
      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '24px 32px 16px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{
            width: 48, height: 48, borderRadius: 12,
            background: '#e8f5e9', display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 24
          }}>🌿</div>
          <div>
            <p style={{ margin: 0, fontWeight: 800, fontSize: 20, color: '#1a1a2e' }}>Greenhouse Monitor</p>
            <p style={{ margin: 0, fontSize: 14, color: '#64748b', fontWeight: 600 }}>
              Welcome back, {user?.name || user?.email || 'User'}
            </p>
          </div>
        </div>

        {/* Right side: time + bell + logout icon */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
          <div style={{ fontSize: 14, color: '#6c757d', fontWeight: 500, whiteSpace: 'nowrap' }}>
            {timeStr}
          </div>
          <NotificationBell />
          {/* Logout as icon button — no text overflow */}
          <button
            onClick={logout}
            title="Logout"
            style={{
              width: 44, height: 44, borderRadius: 12,
              background: '#f3f4f6', border: 'none', cursor: 'pointer',
              fontSize: 20, display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            🚪
          </button>
        </div>
      </div>

      {/* Health Banner */}
      <div style={{ padding: '0 32px 24px' }}>
        <div style={{
          background: 'linear-gradient(135deg, #e8f5e9 0%, #f1f8f1 100%)',
          borderRadius: 20, padding: '24px 32px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          border: '1px solid #c8e6c9'
        }}>
          <div>
            <p style={{ margin: 0, fontSize: 14, color: '#6c757d', fontWeight: 600 }}>Current Health</p>
            <p style={{ margin: 0, fontSize: 32, fontWeight: 800, color: '#2e7d32' }}>
              {allOk ? 'Excellent' : soilOk === false ? 'Needs Water' : 'Fair'}
            </p>
          </div>
          <div style={{ display: 'flex', gap: 12 }}>
            {['🌿', '💧'].map((e, i) => (
              <div key={i} style={{
                width: 44, height: 44, borderRadius: 50,
                background: '#c8e6c9', display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 20
              }}>{e}</div>
            ))}
          </div>
        </div>
      </div>

      {/* Live Metrics */}
      <div style={{ padding: '0 32px 32px' }}>
        <p style={{ margin: '0 0 20px', fontWeight: 800, fontSize: 20, color: '#1a1a2e' }}>Live Metrics</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 20 }}>
          <MetricCard
            title="Temperature"
            value={sensorData.temperature}
            unit="°C"
            circleColor={sensorData.temperature > 35 ? '#ef4444' : '#22c55e'}
            circleMax={50}
            statusIcon={sensorData.temperature > 35 ? '⚠' : '✅'}
            statusText={sensorData.temperature > 35 ? 'TOO HIGH' : 'Normal'}
            statusColor={sensorData.temperature > 35 ? '#ef4444' : '#2e7d32'}
          />
          <MetricCard
            title="Humidity"
            value={sensorData.humidity}
            unit="%"
            circleColor="#22c55e"
            circleMax={100}
            statusIcon=""
            statusText="Optimal"
            statusColor="#2e7d32"
          />
          <MetricCard
            title="Soil Moisture"
            value={sensorData.soil != null ? Math.round(sensorData.soil) : '--'}
            unit="%"
            circleColor={sensorData.soil < 30 ? '#eab308' : '#22c55e'}
            circleMax={100}
            statusIcon={sensorData.soil < 30 ? '💧' : '✅'}
            statusText={sensorData.soil < 30 ? 'NEEDS WATER' : 'Good'}
            statusColor={sensorData.soil < 30 ? '#eab308' : '#2e7d32'}
          />
          <MetricCard
            title="Illumination"
            value={sensorData.light != null ? Math.round(sensorData.light) : '--'}
            unit="lux"
            circleColor="#22c55e"
            circleMax={20000}
            centerIcon="☀️"
            statusIcon={sensorData.light > 12000 ? '🌞' : '🌤️'}
            statusText={sensorData.light > 12000 ? 'High Brightness' : 'Good Light'}
            statusColor="#2e7d32"
          />
        </div>
      </div>

      {/* View Trends Button */}
      <div style={{ padding: '0 32px 32px' }}>
        <button style={{
          width: '100%', padding: '20px', borderRadius: 16,
          background: '#f3f4f6', border: 'none', cursor: 'pointer',
          fontWeight: 700, fontSize: 16, color: '#2e7d32',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12
        }}>
          View Trends & Analytics <span style={{ fontSize: 18 }}>↗</span>
        </button>
      </div>

      {/* System Controls */}
      <div style={{ padding: '0 32px 32px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <p style={{ margin: 0, fontWeight: 800, fontSize: 20, color: '#1a1a2e' }}>System Controls</p>
          <span style={{ fontSize: 13, fontWeight: 600, color: '#2e7d32', cursor: 'pointer' }}>Manual Override</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <ControlRow
            icon="💧"
            label="Water Pump"
            sub={pumpActive ? 'Currently running' : 'Last active 1h ago'}
            active={pumpActive}
            onToggle={togglePump}
          />
          <ControlRow
            icon="▦"
            label="Vents"
            sub={ventsActive ? 'Currently Open' : 'Currently Closed'}
            active={ventsActive}
            onToggle={toggleVents}
          />
          <ControlRow
            icon="🌀"
            label="Extraction Fan"
            sub={fanActive ? `Running at ${fanSpeed}%` : 'Currently off'}
            active={fanActive}
            onToggle={toggleFan}
          />
        </div>
      </div>

      {/* Footer */}
      <div style={{ textAlign: 'center', padding: '0 20px 16px' }}>
        <p style={{ margin: 0, fontSize: 12, color: '#9ca3af', fontStyle: 'italic' }}>
          Last updated: Today at {timeStr}
        </p>
        <p style={{ margin: '2px 0 0', fontSize: 10, color: '#d1d5db', letterSpacing: 1, fontWeight: 600 }}>
          PREMIUM VERSION 2.0.4
        </p>
      </div>

      <BottomNav active={activeNav} setActive={setActiveNav} />
    </div>
  );
};

export default Dashboard;