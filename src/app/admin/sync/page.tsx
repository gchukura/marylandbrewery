"use client";

import { useEffect, useState } from 'react';

export default function AdminSyncPage() {
  const [authorized, setAuthorized] = useState(false);
  const [password, setPassword] = useState('');
  const [status, setStatus] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [lastSync, setLastSync] = useState<string>('');
  const [breweryCount, setBreweryCount] = useState<number>(0);
  const [history, setHistory] = useState<Array<{ time: string; count: number; ok: boolean }>>([]);

  useEffect(() => {
    const saved = localStorage.getItem('admin_authed') === 'true';
    setAuthorized(saved);
  }, []);

  const handleAuth = () => {
    const expected = process.env.NEXT_PUBLIC_ADMIN_UI_TOKEN || '';
    if (password && expected && password === expected) {
      setAuthorized(true);
      localStorage.setItem('admin_authed', 'true');
    } else {
      setStatus('Invalid password');
    }
  };

  const runSync = async () => {
    try {
      setLoading(true);
      setStatus('Starting sync...');

      const adminToken = process.env.NEXT_PUBLIC_ADMIN_UI_TOKEN || '';
      const res = await fetch('/api/sync', {
        method: 'POST',
        headers: { 'x-admin-token': adminToken },
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setStatus(`Sync failed: ${data.error || res.statusText}`);
        setHistory((h) => [{ time: new Date().toLocaleString(), count: 0, ok: false }, ...h]);
        return;
      }

      setBreweryCount(data.breweryCount || 0);
      setLastSync(new Date().toLocaleString());
      setStatus('Sync completed');
      setHistory((h) => [{ time: new Date().toLocaleString(), count: data.breweryCount || 0, ok: true }, ...h]);
    } catch (e: any) {
      setStatus(`Sync error: ${e?.message || 'Unknown'}`);
      setHistory((h) => [{ time: new Date().toLocaleString(), count: 0, ok: false }, ...h]);
    } finally {
      setLoading(false);
    }
  };

  if (!authorized) {
    return (
      <div className="max-w-md mx-auto p-6">
        <h1 className="text-2xl font-bold mb-4">Admin Sync</h1>
        <p className="text-gray-600 mb-4">Enter password to continue.</p>
        <input
          type="password"
          className="border rounded px-3 py-2 w-full mb-3"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button
          onClick={handleAuth}
          className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
        >
          Continue
        </button>
        {status && <p className="text-sm text-red-600 mt-3">{status}</p>}
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-2">Admin Sync</h1>
      <p className="text-gray-600 mb-6">Trigger data sync from Google Sheets and revalidate pages.</p>

      <div className="flex items-center gap-3 mb-4">
        <button
          onClick={runSync}
          disabled={loading}
          className={`px-4 py-2 rounded text-white ${loading ? 'bg-gray-400' : 'bg-red-600 hover:bg-red-700'}`}
        >
          {loading ? 'Syncing...' : 'Sync Now'}
        </button>
        {status && <span className="text-sm text-gray-700">{status}</span>}
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="p-4 bg-white rounded border">
          <div className="text-gray-500 text-sm">Last Sync</div>
          <div className="text-lg font-semibold">{lastSync || '—'}</div>
        </div>
        <div className="p-4 bg-white rounded border">
          <div className="text-gray-500 text-sm">Current Breweries</div>
          <div className="text-lg font-semibold">{breweryCount}</div>
        </div>
      </div>

      <div>
        <h2 className="text-lg font-semibold mb-2">Sync History</h2>
        <div className="bg-white rounded border divide-y">
          {history.length === 0 && (
            <div className="p-4 text-sm text-gray-500">No syncs yet.</div>
          )}
          {history.map((item, idx) => (
            <div key={idx} className="p-3 flex items-center justify-between text-sm">
              <span>{item.time}</span>
              <span className={item.ok ? 'text-green-600' : 'text-red-600'}>
                {item.ok ? `OK (${item.count})` : 'Failed'}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
