import { Handle, Position } from 'reactflow';

const InputNode = ({ data }) => {
  return (
    <div
      style={{ fontFamily: 'DM Sans, sans-serif' }}
      className="w-80 rounded-2xl overflow-hidden shadow-2xl"
    >
      {/* Node Header */}
      <div className="bg-indigo-600 px-4 py-3 flex items-center gap-2">
        <div className="flex gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-indigo-300 opacity-70" />
          <span className="w-2.5 h-2.5 rounded-full bg-indigo-300 opacity-70" />
          <span className="w-2.5 h-2.5 rounded-full bg-indigo-300 opacity-70" />
        </div>
        <span
          style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '11px' }}
          className="text-indigo-100 font-medium tracking-widest uppercase ml-1"
        >
          Input Node
        </span>
        <div className="ml-auto w-2 h-2 rounded-full bg-green-400 animate-pulse" />
      </div>

      {/* Node Body */}
      <div className="bg-[#13131f] border border-indigo-900/50 p-4">
        <label
          style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '10px' }}
          className="text-indigo-400 uppercase tracking-widest mb-2 block"
        >
          Your Prompt
        </label>
        <textarea
          className="w-full bg-[#0a0a14] border border-indigo-900/60 rounded-xl p-3 text-gray-200 text-sm resize-none focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 placeholder-gray-600 transition-all"
          rows={5}
          placeholder="e.g. What is the capital of France?"
          value={data.prompt}
          onChange={(e) => data.onPromptChange(e.target.value)}
        />
        <p
          style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '10px' }}
          className="text-gray-600 mt-2"
        >
          {data.prompt.length} chars
        </p>
      </div>

      {/* Source handle (right side) */}
      <Handle
        type="source"
        position={Position.Right}
        style={{
          width: 12,
          height: 12,
          background: '#6366f1',
          border: '2px solid #818cf8',
          right: -6,
        }}
      />
    </div>
  );
};

export default InputNode;