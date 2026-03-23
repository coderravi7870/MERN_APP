import { useState, useCallback, useEffect } from 'react';
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  addEdge,
  useNodesState,
  useEdgesState,
  BackgroundVariant,
} from 'reactflow';
import 'reactflow/dist/style.css';
import axios from 'axios';
import InputNode from './components/InputNode';
import ResultNode from './components/ResultNode';

// Register custom node types
const nodeTypes = {
  inputNode: InputNode,
  resultNode: ResultNode,
};

export default function App() {
  const [prompt, setPrompt] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);
  const [saveStatus, setSaveStatus] = useState(null); 

  const [history, setHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);

  // Stable callback to avoid stale closure in nodes
  const handlePromptChange = useCallback((value) => {
    setPrompt(value);
  }, []);

  // Initial nodes
  const createNodes = useCallback(
    () => [
      {
        id: '1',
        type: 'inputNode',
        position: { x: 80, y: 160 },
        data: { prompt: '', onPromptChange: handlePromptChange },
        draggable: true,
      },
      {
        id: '2',
        type: 'resultNode',
        position: { x: 540, y: 160 },
        data: { response: '', loading: false },
        draggable: true,
      },
    ],
    [handlePromptChange]
  );

  const initialEdges = [
    {
      id: 'e1-2',
      source: '1',
      target: '2',
      animated: true,
      style: { stroke: '#6366f1', strokeWidth: 2 },
    },
  ];

  const [nodes, setNodes, onNodesChange] = useNodesState(createNodes());
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  // Sync prompt state → InputNode data
  useEffect(() => {
    setNodes((nds) =>
      nds.map((node) =>
        node.id === '1'
          ? { ...node, data: { ...node.data, prompt, onPromptChange: handlePromptChange } }
          : node
      )
    );
  }, [prompt, handlePromptChange, setNodes]);

  // Sync response/loading state → ResultNode data
  useEffect(() => {
    setNodes((nds) =>
      nds.map((node) =>
        node.id === '2' ? { ...node, data: { response, loading } } : node
      )
    );
  }, [response, loading, setNodes]);

  // Run Flow: send prompt to backend → OpenRouter AI
  const handleRunFlow = async () => {
    if (!prompt.trim()) {
      alert('Please enter a prompt in the Input Node first!');
      return;
    }
    setLoading(true);
    setResponse('');
    setSaveStatus(null);

    try {
      const res = await axios.post(`${import.meta.env.VITE_API_URL}/ask-ai`, { prompt });
      setResponse(res.data.response);
    } catch (err) {
      const msg = err.response?.data?.error || 'Failed to get AI response. Check your API key.';
      setResponse(`⚠️ Error: ${msg}`);
    } finally {
      setLoading(false);
    }
  };

  // Save to MongoDB
  const handleSave = async () => {
    if (!prompt.trim() || !response) {
      alert('Please run the flow first before saving!');
      return;
    }
    setSaveStatus('saving');
    setPrompt('');
    setResponse('');
    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/save`, { prompt, response });
      setSaveStatus('saved');
    } catch (err) {
      setSaveStatus('error');
    }finally{
      setTimeout(() => setSaveStatus(null), 3000);
    }
  };

  // Fetch history from MongoDB
  const handleViewHistory = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/history`);
      setHistory(res.data);
      setShowHistory(true);
    } catch (err) {
      alert('Failed to fetch history from database.');
    }
  };

  const onConnect = useCallback(
    (params) =>
      setEdges((eds) =>
        addEdge({ ...params, animated: true, style: { stroke: '#6366f1', strokeWidth: 2 } }, eds)
      ),
    [setEdges]
  );

  return (
    <div className="h-screen flex flex-col" style={{ background: '#0f0f1a', fontFamily: 'DM Sans, sans-serif' }}>
      {/* ── Header ── */}
      <header
        className="flex items-center justify-between px-6 py-3 border-b shrink-0"
        style={{ background: '#13131f', borderColor: '#1e1e35' }}
      >
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div>
            <h1
              style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '14px' }}
              className="text-white font-semibold tracking-tight"
            >
              MERN AI Flow
            </h1>
            <p style={{ fontSize: '10px' }} className="text-gray-500">
              Powered by OpenRouter · MongoDB
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {/* Save status badge */}
          {saveStatus === 'saving' && (
            <span className="text-xs text-yellow-400 flex items-center gap-1">
              <div className="w-3 h-3 border border-yellow-400 border-t-transparent rounded-full animate-spin" />
              Saving...
            </span>
          )}
          {saveStatus === 'saved' && (
            <span className="text-xs text-emerald-400 flex items-center gap-1">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
              Saved to MongoDB!
            </span>
          )}
          {saveStatus === 'error' && (
            <span className="text-xs text-red-400">Save failed</span>
          )}

          <button
            onClick={handleViewHistory}
            className="text-xs px-3 py-1.5 rounded-lg text-gray-400 hover:text-white transition-colors"
            style={{ background: '#1e1e35' }}
          >
            📋 History
          </button>

          <button
            onClick={handleSave}
            disabled={!response || loading}
            className="text-xs px-3 py-1.5 rounded-lg font-medium transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            style={{ background: '#1e1e35', color: '#a5b4fc' }}
          >
            💾 Save to DB
          </button>

          <button
            onClick={handleRunFlow}
            disabled={loading}
            className="flex items-center gap-2 px-5 py-1.5 rounded-lg text-sm font-semibold text-white transition-all disabled:opacity-60 disabled:cursor-not-allowed shadow-lg shadow-indigo-900/40"
            style={{ background: loading ? '#3730a3' : '#4f46e5' }}
          >
            {loading ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                Running...
              </>
            ) : (
              <>
                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
                Run Flow
              </>
            )}
          </button>
        </div>
      </header>

      {/* ── React Flow Canvas ── */}
      <div className="flex-1 relative">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          nodeTypes={nodeTypes}
          fitView
          fitViewOptions={{ padding: 0.3 }}
          minZoom={0.3}
          maxZoom={2}
        >
          <Background
            variant={BackgroundVariant.Dots}
            gap={24}
            size={1}
            color="#1e1e35"
          />
          <Controls
            style={{ background: '#13131f', border: '1px solid #1e1e35', borderRadius: '8px' }}
          />
          <MiniMap
            nodeColor={(n) => (n.id === '1' ? '#6366f1' : '#10b981')}
            maskColor="rgba(0,0,0,0.6)"
            style={{ background: '#13131f', border: '1px solid #1e1e35', borderRadius: '8px' }}
          />
        </ReactFlow>
      </div>

      {/* ── History Modal ── */}
      {showHistory && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.7)' }}
          onClick={() => setShowHistory(false)}
        >
          <div
            className="w-full max-w-2xl rounded-2xl overflow-hidden shadow-2xl"
            style={{ background: '#13131f', border: '1px solid #1e1e35', maxHeight: '80vh' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className="flex items-center justify-between px-5 py-4 border-b"
              style={{ borderColor: '#1e1e35' }}
            >
              <h2
                style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '13px' }}
                className="text-indigo-300 font-medium tracking-widest uppercase"
              >
                MongoDB History (last 10)
              </h2>
              <button
                onClick={() => setShowHistory(false)}
                className="text-gray-500 hover:text-white transition-colors text-lg leading-none"
              >
                ×
              </button>
            </div>
            <div className="overflow-y-auto p-5 space-y-4" style={{ maxHeight: '65vh' }}>
              {history.length === 0 ? (
                <p
                  style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '12px' }}
                  className="text-gray-600 text-center py-8"
                >
                  // No records found in database
                </p>
              ) : (
                history.map((item) => (
                  <div
                    key={item._id}
                    className="rounded-xl p-4 space-y-2"
                    style={{ background: '#0a0a14', border: '1px solid #1e1e35' }}
                  >
                    <div className="flex items-center justify-between">
                      <span
                        style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '10px' }}
                        className="text-indigo-400 uppercase tracking-widest"
                      >
                        Prompt
                      </span>
                      <span
                        style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '10px' }}
                        className="text-gray-600"
                      >
                        {new Date(item.createdAt).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-gray-300 text-sm">{item.prompt}</p>
                    <span
                      style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '10px' }}
                      className="text-emerald-400 uppercase tracking-widest block mt-2"
                    >
                      Response
                    </span>
                    <p className="text-gray-400 text-sm line-clamp-3">{item.response}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
