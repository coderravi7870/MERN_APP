import { Handle, Position } from 'reactflow';

const ResultNode = ({ data }) => {
  return (
    <div
      style={{ fontFamily: 'DM Sans, sans-serif' }}
      className="w-80 rounded-2xl overflow-hidden shadow-2xl"
    >
      {/* Node Header */}
      <div className="bg-emerald-700 px-4 py-3 flex items-center gap-2">
        <div className="flex gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-300 opacity-70" />
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-300 opacity-70" />
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-300 opacity-70" />
        </div>
        <span
          style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '11px' }}
          className="text-emerald-100 font-medium tracking-widest uppercase ml-1"
        >
          Result Node
        </span>
        {data.loading && (
          <div className="ml-auto flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 bg-yellow-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
            <div className="w-1.5 h-1.5 bg-yellow-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
            <div className="w-1.5 h-1.5 bg-yellow-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
          </div>
        )}
        {!data.loading && data.response && (
          <div className="ml-auto w-2 h-2 rounded-full bg-emerald-400" />
        )}
      </div>

      {/* Node Body */}
      <div className="bg-[#13131f] border border-emerald-900/50 p-4">
        <label
          style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '10px' }}
          className="text-emerald-400 uppercase tracking-widest mb-2 block"
        >
          AI Response
        </label>
        <div className="w-full bg-[#0a0a14] border border-emerald-900/60 rounded-xl p-3 min-h-[128px] text-sm">
          {data.loading ? (
            <div className="flex flex-col gap-2 mt-1">
              <div className="h-2.5 bg-emerald-900/50 rounded animate-pulse w-3/4" />
              <div className="h-2.5 bg-emerald-900/50 rounded animate-pulse w-full" />
              <div className="h-2.5 bg-emerald-900/50 rounded animate-pulse w-5/6" />
              <div className="h-2.5 bg-emerald-900/50 rounded animate-pulse w-2/3" />
            </div>
          ) : data.response ? (
            <p className="text-gray-200 whitespace-pre-wrap leading-relaxed">{data.response}</p>
          ) : (
            <p
              style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '11px' }}
              className="text-gray-600 italic mt-1"
            >
              // response will appear here...
            </p>
          )}
        </div>
      </div>

      {/* Target handle (left side) */}
      <Handle
        type="target"
        position={Position.Left}
        style={{
          width: 12,
          height: 12,
          background: '#10b981',
          border: '2px solid #34d399',
          left: -6,
        }}
      />
    </div>
  );
};

export default ResultNode;