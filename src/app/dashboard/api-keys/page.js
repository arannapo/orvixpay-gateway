"use client";

import { useState, useEffect } from 'react';
import { Copy, Plus, Key, Eye, EyeOff, Check, AlertCircle } from 'lucide-react';

export default function ApiKeysPage() {
  const [keys, setKeys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [copiedKey, setCopiedKey] = useState(null);
  const [visibleSecrets, setVisibleSecrets] = useState({});

  useEffect(() => {
    fetchKeys();
  }, []);

  const fetchKeys = async () => {
    try {
      const res = await fetch('/api/api-key/list');
      const data = await res.json();
      if (data.success) {
        setKeys(data.apiKeys);
      }
    } catch (error) {
      console.error('Error fetching API keys', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      const res = await fetch('/api/api-key/create', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        setKeys([data.apiKey, ...keys]);
        setVisibleSecrets(prev => ({ ...prev, [data.apiKey._id]: true }));
      } else {
        alert(data.error || 'Failed to generate key');
      }
    } catch (error) {
      alert('Error generating key');
    } finally {
      setGenerating(false);
    }
  };

  const copyToClipboard = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(id);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const toggleSecret = (id) => {
    setVisibleSecrets(prev => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col mt-2">
      {/* Header Section */}
      <div className="px-8 py-8 border-b border-slate-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <p className="text-slate-500 font-medium text-sm">Manage your API keys for authenticating requests to the payment gateway.</p>
        </div>
        <button 
          onClick={handleGenerate} 
          disabled={generating}
          className="px-5 py-2.5 rounded-full border border-slate-200 text-slate-700 font-semibold text-[13px] hover:bg-slate-50 transition flex items-center gap-2 shadow-sm disabled:opacity-50"
        >
          <Plus size={16} strokeWidth={1.5} className="text-slate-500" />
          {generating ? 'Generating...' : 'Generate New Key'}
        </button>
      </div>
        {loading ? (
          <div className="p-12 text-center text-slate-500 flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="font-medium">Loading keys...</p>
          </div>
        ) : keys.length === 0 ? (
          <div className="p-16 text-center flex flex-col items-center">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-4 text-slate-300">
              <Key size={40} />
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">No API Keys Found</h3>
            <p className="text-slate-500 max-w-sm">Generate your first API key to start creating crypto invoices programmatically.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {keys.map((apiKey) => (
              <div key={apiKey._id} className="p-6 md:p-8 hover:bg-slate-50/50 transition-colors">
                <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-6">
                  <p className="text-sm text-slate-500 font-medium">Created on {new Date(apiKey.createdAt).toLocaleDateString()}</p>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold tracking-wider uppercase border ${
                    apiKey.status === 'active' 
                      ? 'bg-green-50 text-green-600 border-green-200' 
                      : 'bg-slate-50 text-slate-500 border-slate-200'
                  }`}>
                    {apiKey.status}
                  </span>
                </div>
                
                <div className="space-y-4 bg-slate-50 p-4 md:p-6 rounded-2xl border border-slate-100">
                  {/* Public Key */}
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">Public Key</label>
                    <div className="flex items-center gap-2">
                      <code className="flex-1 bg-white border border-slate-200 px-4 py-2.5 rounded-xl text-sm text-slate-700 font-mono shadow-sm break-all">
                        {apiKey.publicKey}
                      </code>
                      <button 
                        onClick={() => copyToClipboard(apiKey.publicKey, apiKey.publicKey)} 
                        className="p-2.5 bg-white border border-slate-200 text-slate-400 hover:text-blue-600 hover:border-blue-200 rounded-xl transition-all shadow-sm flex-shrink-0"
                        title="Copy Public Key"
                      >
                        {copiedKey === apiKey.publicKey ? <Check size={18} className="text-green-500" /> : <Copy size={18} />}
                      </button>
                    </div>
                  </div>

                  {/* Secret Key */}
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-2">
                      Secret Key
                      <span className="flex items-center gap-1 text-amber-600 bg-amber-100/50 border border-amber-200/50 px-2 py-0.5 rounded-full text-[10px] normal-case tracking-normal">
                        <AlertCircle size={12} /> Keep this secret
                      </span>
                    </label>
                    <div className="flex items-center gap-2">
                      <code className="flex-1 bg-white border border-slate-200 px-4 py-2.5 rounded-xl text-sm text-slate-700 font-mono shadow-sm break-all">
                        {visibleSecrets[apiKey._id] ? apiKey.secretKey : '••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••'}
                      </code>
                      <button 
                        onClick={() => toggleSecret(apiKey._id)}
                        className="p-2.5 bg-white border border-slate-200 text-slate-400 hover:text-slate-600 rounded-xl transition-all shadow-sm flex-shrink-0"
                        title={visibleSecrets[apiKey._id] ? "Hide Secret Key" : "Show Secret Key"}
                      >
                        {visibleSecrets[apiKey._id] ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                      <button 
                        onClick={() => copyToClipboard(apiKey.secretKey, apiKey.secretKey)} 
                        className="p-2.5 bg-white border border-slate-200 text-slate-400 hover:text-blue-600 hover:border-blue-200 rounded-xl transition-all shadow-sm flex-shrink-0"
                        title="Copy Secret Key"
                      >
                        {copiedKey === apiKey.secretKey ? <Check size={18} className="text-green-500" /> : <Copy size={18} />}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
    </div>
  );
}
