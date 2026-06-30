import { useState, useEffect, useRef } from "react"
import {
  LayoutDashboard, Map, Bus, Bell, BarChart2, Settings,
  ChevronLeft, ChevronRight, Search, Cloud, Wifi, User,
  Clock, AlertTriangle, CheckCircle, TrendingUp, TrendingDown,
  Activity, ArrowRight, X, Check, Info, Navigation,
  MapPin, Gauge, Users, Shield, Lock, Volume2,
  ChevronDown, Filter, Eye, Zap, Radio, LogOut,
  RefreshCw, Play, Route, Layers, Thermometer, Wind
} from "lucide-react"
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie
} from "recharts"

type Screen = "login" | "dashboard" | "map" | "routes" | "alerts" | "bunching" | "ai-rec" | "command-sent" | "analytics" | "settings"

// ─── Mock Data ────────────────────────────────────────────────────────────────

const BUSES = [
  { id: "B-101", route: "101", color: "#5B6CFF", status: "normal" as const, speed: 32, passengers: 28, capacity: 45, delay: 0, driver: "Ramesh Kumar", currentStop: "Central Station", nextStop: "Airport Rd Junction", eta: "3 min" },
  { id: "B-102A", route: "102", color: "#16C47F", status: "delayed" as const, speed: 18, passengers: 41, capacity: 45, delay: 7, driver: "Priya Sharma", currentStop: "MG Road", nextStop: "Silk Board", eta: "9 min" },
  { id: "B-102B", route: "102", color: "#16C47F", status: "crowded" as const, speed: 24, passengers: 44, capacity: 45, delay: 12, driver: "Amit Patel", currentStop: "Koramangala", nextStop: "MG Road", eta: "6 min" },
  { id: "B-201", route: "201", color: "#F4B400", status: "normal" as const, speed: 38, passengers: 19, capacity: 45, delay: 2, driver: "Suresh Nair", currentStop: "Whitefield", nextStop: "ITPL Gate", eta: "4 min" },
  { id: "B-302", route: "302", color: "#00C2A8", status: "normal" as const, speed: 29, passengers: 33, capacity: 45, delay: 0, driver: "Kavya Reddy", currentStop: "Indiranagar", nextStop: "Domlur", eta: "5 min" },
  { id: "B-404", route: "404", color: "#EF4444", status: "emergency" as const, speed: 0, passengers: 38, capacity: 45, delay: 23, driver: "Mohan Das", currentStop: "HSR Layout", nextStop: "BTM Layout", eta: "Stopped" },
]

const ROUTES = [
  { id: "101", name: "Central – Airport Express", origin: "Central Station", destination: "Kempegowda Intl Airport", activeBuses: 8, avgHeadway: 12, avgDelay: 1.2, crowding: 62, healthScore: 94, status: "operational" as const },
  { id: "102", name: "MG Road – Electronic City", origin: "MG Road", destination: "Electronic City Phase 1", activeBuses: 11, avgHeadway: 8, avgDelay: 9.4, crowding: 88, healthScore: 61, status: "delayed" as const },
  { id: "201", name: "Whitefield – Hebbal Ring", origin: "Whitefield", destination: "Hebbal Flyover", activeBuses: 6, avgHeadway: 15, avgDelay: 2.1, crowding: 45, healthScore: 89, status: "operational" as const },
  { id: "302", name: "Indiranagar Loop", origin: "Indiranagar 100ft Rd", destination: "Old Airport Rd", activeBuses: 5, avgHeadway: 18, avgDelay: 0, crowding: 71, healthScore: 97, status: "operational" as const },
  { id: "404", name: "HSR – BTM Express", origin: "HSR Layout", destination: "BTM 2nd Stage", activeBuses: 4, avgHeadway: 22, avgDelay: 23.1, crowding: 82, healthScore: 34, status: "disrupted" as const },
]

const ALERTS = [
  { id: "A1", title: "Bus Bunching Detected on Route 102", route: "102", time: "2 min ago", cause: "Traffic congestion at Silk Board junction", priority: "critical" as const, aiSummary: "Two buses are within 90 seconds of each other near Koramangala. Holding Bus 102B for 3 minutes will restore 8-minute headway with 91% confidence." },
  { id: "A2", title: "Bus B-404 Breakdown – HSR Layout", route: "404", time: "8 min ago", cause: "Mechanical failure – engine overheating", priority: "critical" as const, aiSummary: "Bus B-404 has stopped at HSR Layout. Recovery team dispatched. Estimated service gap: 25 min. Recommend deploying standby bus from Sector 12 depot." },
  { id: "A3", title: "High Occupancy Warning – Route 102", route: "102", time: "15 min ago", cause: "Peak hour demand spike at Electronic City", priority: "warning" as const, aiSummary: "Occupancy on Route 102 exceeded 95% for 15 consecutive minutes. Consider deploying 2 additional buses from nearby depot." },
  { id: "A4", title: "Route 201 Minor Delay – Road Work", route: "201", time: "22 min ago", cause: "BBMP road work near Whitefield Station", priority: "warning" as const, aiSummary: "Temporary 2-minute delay due to construction. Expected to clear in 30 min based on live city traffic data." },
  { id: "A5", title: "Bus B-201 Schedule Restored", route: "201", time: "45 min ago", cause: "Recovery from earlier congestion", priority: "resolved" as const, aiSummary: "Bus B-201 has returned to scheduled headway. No further action required." },
]

const ridershipData = [
  { day: "Mon", passengers: 42300 },
  { day: "Tue", passengers: 48200 },
  { day: "Wed", passengers: 51400 },
  { day: "Thu", passengers: 47800 },
  { day: "Fri", passengers: 53900 },
  { day: "Sat", passengers: 38100 },
  { day: "Sun", passengers: 29400 },
]

const peakHourData = [
  { hour: "6am", v: 3200 }, { hour: "7am", v: 8900 }, { hour: "8am", v: 15600 },
  { hour: "9am", v: 11200 }, { hour: "10am", v: 7400 }, { hour: "11am", v: 5600 },
  { hour: "12pm", v: 6800 }, { hour: "1pm", v: 7200 }, { hour: "2pm", v: 5900 },
  { hour: "3pm", v: 7100 }, { hour: "4pm", v: 9800 }, { hour: "5pm", v: 14700 },
  { hour: "6pm", v: 12300 }, { hour: "7pm", v: 8400 }, { hour: "8pm", v: 5200 },
]

const delayTrendData = [
  { t: "06:00", delay: 0.8 }, { t: "07:00", delay: 2.1 }, { t: "08:00", delay: 5.4 },
  { t: "09:00", delay: 7.8 }, { t: "10:00", delay: 4.2 }, { t: "11:00", delay: 2.1 },
  { t: "12:00", delay: 1.8 }, { t: "13:00", delay: 2.4 }, { t: "14:00", delay: 1.9 },
  { t: "15:00", delay: 3.1 }, { t: "16:00", delay: 6.2 }, { t: "Now", delay: 9.4 },
]

const headwayDevData = [
  { t: "08:00", headway: 8.1, target: 8 },
  { t: "08:10", headway: 7.8, target: 8 },
  { t: "08:20", headway: 7.4, target: 8 },
  { t: "08:30", headway: 6.2, target: 8 },
  { t: "08:40", headway: 4.8, target: 8 },
  { t: "08:50", headway: 3.1, target: 8 },
  { t: "09:00", headway: 1.8, target: 8 },
  { t: "Now", headway: 1.4, target: 8 },
]

const routePerfData = [
  { route: "101", health: 94 }, { route: "102", health: 61 },
  { route: "201", health: 89 }, { route: "302", health: 97 }, { route: "404", health: 34 },
]

// ─── Shared Components ────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { bg: string; text: string; dot: string; label: string }> = {
    operational: { bg: "bg-emerald-50", text: "text-emerald-700", dot: "bg-emerald-500", label: "Operational" },
    delayed: { bg: "bg-amber-50", text: "text-amber-700", dot: "bg-amber-500", label: "Delayed" },
    disrupted: { bg: "bg-red-50", text: "text-red-600", dot: "bg-red-500", label: "Disrupted" },
    normal: { bg: "bg-emerald-50", text: "text-emerald-700", dot: "bg-emerald-500", label: "On Time" },
    crowded: { bg: "bg-orange-50", text: "text-orange-700", dot: "bg-orange-500", label: "Crowded" },
    emergency: { bg: "bg-red-50", text: "text-red-600", dot: "bg-red-500", label: "Emergency" },
    critical: { bg: "bg-red-50", text: "text-red-600", dot: "bg-red-500", label: "Critical" },
    warning: { bg: "bg-amber-50", text: "text-amber-700", dot: "bg-amber-500", label: "Warning" },
    resolved: { bg: "bg-slate-50", text: "text-slate-600", dot: "bg-slate-400", label: "Resolved" },
  }
  const s = map[status] || map.normal
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${s.bg} ${s.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
      {s.label}
    </span>
  )
}

function HealthBar({ score }: { score: number }) {
  const color = score >= 80 ? "#16C47F" : score >= 60 ? "#F4B400" : "#EF4444"
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 bg-[#E8ECF5] rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all duration-700" style={{ width: `${score}%`, backgroundColor: color }} />
      </div>
      <span className="text-xs font-semibold font-mono tabular-nums" style={{ color }}>{score}</span>
    </div>
  )
}

function OccupancyRing({ pct, color = "#5B6CFF" }: { pct: number; color?: string }) {
  const r = 20, circ = 2 * Math.PI * r
  return (
    <svg width="52" height="52" viewBox="0 0 52 52">
      <circle cx="26" cy="26" r={r} fill="none" stroke="#E8ECF5" strokeWidth="4" />
      <circle cx="26" cy="26" r={r} fill="none" stroke={color} strokeWidth="4"
        strokeDasharray={circ} strokeDashoffset={circ * (1 - pct / 100)}
        strokeLinecap="round" transform="rotate(-90 26 26)" />
      <text x="26" y="30" textAnchor="middle" fontSize="11" fontWeight="700" fill="#1A1D29" fontFamily="JetBrains Mono">{pct}%</text>
    </svg>
  )
}

// ─── City Map SVG ─────────────────────────────────────────────────────────────

function CityMap({
  highlightRoute,
  onBusClick,
  zoom = false,
}: {
  highlightRoute?: string
  onBusClick?: (bus: typeof BUSES[0]) => void
  zoom?: boolean
}) {
  const dim = (route: string) => highlightRoute && highlightRoute !== route ? 0.18 : 0.9

  return (
    <div className="relative w-full h-full overflow-hidden">
      <style>{`
        @keyframes moveBus101 { from { offset-distance: 0% } to { offset-distance: 100% } }
        @keyframes moveBus102a { from { offset-distance: 5% } to { offset-distance: 105% } }
        @keyframes moveBus102b { from { offset-distance: 25% } to { offset-distance: 125% } }
        @keyframes moveBus201 { from { offset-distance: 0% } to { offset-distance: 100% } }
        @keyframes moveBus302 { from { offset-distance: 0% } to { offset-distance: 100% } }
        @keyframes emergencyPulse { 0%,100% { r: 9; } 50% { r: 14; } }
        @keyframes emergencyFade { 0%,100% { opacity: 0.25; } 50% { opacity: 0; } }
        @keyframes blink { 0%,100% { opacity:1 } 50% { opacity:0.35 } }
      `}</style>
      <svg viewBox={zoom ? "80 200 400 260" : "0 0 800 480"} className="w-full h-full" style={{ background: "#E8EFF9" }}>
        <defs>
          <path id="p101" d="M -10,118 L 810,118" />
          <path id="p102" d="M -10,368 Q 160,368 320,248 Q 480,118 660,118 L 810,118" />
          <path id="p201" d="M 318,-10 L 318,490" />
          <path id="p302" d="M 480,118 Q 690,140 690,290 Q 690,420 480,410 Q 330,410 330,310 Q 330,248 480,248 Q 590,248 590,185 Q 590,140 480,118" />
          <path id="p404" d="M -10,368 L 400,368" />
          <filter id="bsh"><feDropShadow dx="0" dy="2" stdDeviation="3" floodOpacity="0.2" /></filter>
          <filter id="glow"><feGaussianBlur stdDeviation="6" result="blur" /><feComposite in="SourceGraphic" in2="blur" operator="over" /></filter>
        </defs>

        {/* City blocks */}
        {[
          [0,0,140,110],[170,0,130,110],[340,0,120,110],[500,0,120,110],[660,0,140,110],
          [0,130,140,100],[170,130,130,100],[500,130,120,100],[660,130,140,100],
          [0,250,140,100],[500,250,160,100],[700,250,100,100],
          [0,380,140,100],[170,380,130,100],[340,380,120,100],[500,380,160,100],[700,380,100,100],
        ].map(([x,y,w,h],i) => (
          <rect key={i} x={x} y={y} width={w} height={h} fill="#F0F4FA" stroke="#DDE4F0" strokeWidth="0.5" />
        ))}

        {/* Park */}
        <rect x="340" y="130" width="120" height="100" fill="#E5F3EB" stroke="#C8E6C9" strokeWidth="0.5" />
        {[355,375,395,415,435].flatMap(x => [145,165,185,205,225].map(y => (
          <circle key={`t${x}${y}`} cx={x} cy={y} r="4" fill="#81C784" opacity="0.45" />
        )))}
        <text x="400" y="186" fontSize="9" fill="#5A8A5A" textAnchor="middle" fontFamily="Inter, sans-serif">Cubbon Park</text>

        {/* Lake */}
        <rect x="170" y="250" width="130" height="100" fill="#D4E8F7" stroke="#B0D4F1" strokeWidth="0.5" />
        <ellipse cx="235" cy="300" rx="52" ry="38" fill="#C2DDF5" opacity="0.7" />
        <text x="235" y="304" fontSize="9" fill="#6090B8" textAnchor="middle" fontFamily="Inter, sans-serif">Ulsoor Lake</text>

        {/* Roads */}
        {[118,248,368].map(y => <rect key={`hr${y}`} x="0" y={y-10} width="800" height="20" fill="white" opacity="0.92" />)}
        {[150,310,470,650].map(x => <rect key={`vr${x}`} x={x-10} y="0" width="20" height="480" fill="white" opacity="0.92" />)}

        {/* Road center dashes */}
        {[118,248,368].map(y => <line key={`hd${y}`} x1="0" y1={y} x2="800" y2={y} stroke="#DDE4F0" strokeWidth="0.8" strokeDasharray="10 8" />)}
        {[150,310,470,650].map(x => <line key={`vd${x}`} x1={x} y1="0" x2={x} y2="480" stroke="#DDE4F0" strokeWidth="0.8" strokeDasharray="10 8" />)}

        {/* Route lines */}
        <path d="M -10,116 L 810,116" stroke="#5B6CFF" strokeWidth="3.5" strokeOpacity={dim("101")} />
        <path d="M -10,366 Q 160,366 320,246 Q 480,116 660,116 L 810,116" stroke="#16C47F" strokeWidth="3.5" strokeOpacity={dim("102")} fill="none" />
        <path d="M 316,-10 L 316,490" stroke="#F4B400" strokeWidth="3.5" strokeOpacity={dim("201")} />
        <path d="M 480,116 Q 690,138 690,290 Q 690,420 480,410 Q 332,410 332,310 Q 332,248 480,248 Q 590,248 590,185 Q 590,138 480,116" stroke="#00C2A8" strokeWidth="3.5" strokeOpacity={dim("302")} fill="none" />
        <path d="M -10,366 L 400,366" stroke="#EF4444" strokeWidth="3.5" strokeOpacity={dim("404")} />

        {/* Bus stops */}
        {[
          [80,116],[160,116],[320,116],[480,116],[640,116],[740,116],
          [316,60],[316,200],[316,320],[316,420],
          [150,366],[280,366],
        ].map(([x,y],i) => (
          <g key={`stop${i}`}>
            <circle cx={x} cy={y} r="5" fill="white" stroke="#CBD3E8" strokeWidth="1.5" />
            <circle cx={x} cy={y} r="2" fill="#9DA8C7" />
          </g>
        ))}

        {/* Animated buses */}
        {/* Route 101 */}
        <circle r="9" fill="#5B6CFF" filter="url(#bsh)" style={{ offsetPath: "path('M -10,118 L 810,118')", animation: "moveBus101 18s linear infinite" }} onClick={() => onBusClick?.(BUSES[0])} className="cursor-pointer" />

        {/* Route 102 - bunching pair */}
        <circle r="9" fill="#16C47F" filter="url(#bsh)" style={{ offsetPath: "path('M -10,368 Q 160,368 320,248 Q 480,118 660,118 L 810,118')", animation: "moveBus102a 22s linear infinite" }} onClick={() => onBusClick?.(BUSES[1])} className="cursor-pointer" />
        <circle r="9" fill="#F4B400" filter="url(#bsh)" style={{ offsetPath: "path('M -10,368 Q 160,368 320,248 Q 480,118 660,118 L 810,118')", animation: "moveBus102b 22s linear infinite" }} onClick={() => onBusClick?.(BUSES[2])} className="cursor-pointer" />

        {/* Route 201 */}
        <circle r="9" fill="#F4B400" filter="url(#bsh)" style={{ offsetPath: "path('M 318,-10 L 318,490')", animation: "moveBus201 16s linear infinite" }} onClick={() => onBusClick?.(BUSES[3])} className="cursor-pointer" />

        {/* Route 302 */}
        <circle r="9" fill="#00C2A8" filter="url(#bsh)" style={{ offsetPath: "path('M 480,118 Q 690,140 690,290 Q 690,420 480,410 Q 330,410 330,310 Q 330,248 480,248 Q 590,248 590,185 Q 590,140 480,118')", animation: "moveBus302 20s linear infinite" }} onClick={() => onBusClick?.(BUSES[4])} className="cursor-pointer" />

        {/* Route 404 - STOPPED emergency */}
        <circle cx="200" cy="368" r="14" fill="#EF4444" opacity="0.15">
          <animate attributeName="r" values="9;20;9" dur="2s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="0.15;0;0.15" dur="2s" repeatCount="indefinite" />
        </circle>
        <circle cx="200" cy="368" r="9" fill="#EF4444" filter="url(#bsh)" onClick={() => onBusClick?.(BUSES[5])} className="cursor-pointer">
          <animate attributeName="opacity" values="1;0.4;1" dur="1.5s" repeatCount="indefinite" />
        </circle>

        {/* Legend */}
        <g transform="translate(12, 448)">
          {[
            { color: "#5B6CFF", label: "101" }, { color: "#16C47F", label: "102" },
            { color: "#F4B400", label: "201" }, { color: "#00C2A8", label: "302" }, { color: "#EF4444", label: "404" },
          ].map((r, i) => (
            <g key={i} transform={`translate(${i * 72}, 0)`}>
              <circle cx="6" cy="6" r="5" fill={r.color} />
              <text x="14" y="10" fontSize="9" fill="#5F6678" fontFamily="Inter, sans-serif">Rt {r.label}</text>
            </g>
          ))}
        </g>

        {/* Compass */}
        <g transform="translate(768, 26)">
          <circle r="16" fill="white" opacity="0.95" />
          <text x="0" y="-3" fontSize="9" fill="#5B6CFF" textAnchor="middle" fontWeight="700" fontFamily="Inter, sans-serif">N</text>
          <line x1="0" y1="-14" x2="0" y2="-6" stroke="#5B6CFF" strokeWidth="2" strokeLinecap="round" />
          <line x1="0" y1="4" x2="0" y2="12" stroke="#CBD3E8" strokeWidth="1.5" strokeLinecap="round" />
        </g>
      </svg>
    </div>
  )
}

// ─── Login Screen ─────────────────────────────────────────────────────────────

function LoginScreen({ onLogin }: { onLogin: () => void }) {
  const [id, setId] = useState("")
  const [pw, setPw] = useState("")
  const [remember, setRemember] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleLogin = () => {
    setLoading(true)
    setTimeout(onLogin, 1200)
  }

  return (
    <div className="flex h-screen w-full overflow-hidden" style={{ fontFamily: "Inter, sans-serif" }}>
      {/* Left panel */}
      <div className="relative flex flex-col justify-center w-[480px] min-w-[420px] h-full bg-white px-16 z-10">
        {/* Logo */}
        <div className="flex items-center gap-3 mb-14">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "linear-gradient(135deg, #7385FF, #5B6CFF)" }}>
            <Bus size={18} color="white" />
          </div>
          <span className="text-xl font-bold tracking-tight text-[#1A1D29]">Raah</span>
          <span className="text-xs px-2 py-0.5 rounded-full bg-[#EEF0FF] text-[#5B6CFF] font-medium">Operator</span>
        </div>

        <h1 className="text-3xl font-bold text-[#1A1D29] mb-2 tracking-tight">Welcome back</h1>
        <p className="text-[#5F6678] mb-10 text-sm">Sign in to access the transit command center.</p>

        <div className="flex flex-col gap-4">
          <div>
            <label className="block text-xs font-semibold text-[#5F6678] uppercase tracking-wider mb-2">Employee ID</label>
            <input
              type="text"
              value={id}
              onChange={e => setId(e.target.value)}
              placeholder="OPS-XXXXX"
              className="w-full h-12 px-4 rounded-xl border border-[#E8ECF5] bg-[#F8FAFD] text-[#1A1D29] placeholder-[#C0C7D8] focus:outline-none focus:ring-2 focus:ring-[#5B6CFF]/30 focus:border-[#5B6CFF] transition-all text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#5F6678] uppercase tracking-wider mb-2">Password</label>
            <input
              type="password"
              value={pw}
              onChange={e => setPw(e.target.value)}
              placeholder="••••••••"
              className="w-full h-12 px-4 rounded-xl border border-[#E8ECF5] bg-[#F8FAFD] text-[#1A1D29] placeholder-[#C0C7D8] focus:outline-none focus:ring-2 focus:ring-[#5B6CFF]/30 focus:border-[#5B6CFF] transition-all text-sm"
            />
          </div>

          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <div
                onClick={() => setRemember(r => !r)}
                className={`w-4 h-4 rounded flex items-center justify-center border transition-colors ${remember ? "bg-[#5B6CFF] border-[#5B6CFF]" : "border-[#CBD3E8]"}`}
              >
                {remember && <Check size={10} color="white" strokeWidth={3} />}
              </div>
              <span className="text-sm text-[#5F6678]">Remember me</span>
            </label>
            <button className="text-sm text-[#5B6CFF] font-medium hover:underline">Forgot password?</button>
          </div>

          <button
            onClick={handleLogin}
            disabled={loading}
            className="w-full h-12 rounded-xl font-semibold text-white text-sm transition-all duration-200 hover:opacity-90 active:scale-[0.98] mt-2 flex items-center justify-center gap-2 disabled:opacity-80"
            style={{ background: "linear-gradient(135deg, #7385FF, #5B6CFF)" }}
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Authenticating…
              </>
            ) : "Sign In"}
          </button>
        </div>

        <p className="text-xs text-[#C0C7D8] mt-10 text-center">
          Raah Transit Intelligence Platform v3.4 · BMTC Licensed
        </p>
      </div>

      {/* Right panel – illustration */}
      <div className="flex-1 relative overflow-hidden" style={{ background: "linear-gradient(135deg, #7385FF 0%, #5B6CFF 50%, #4855CC 100%)" }}>
        {/* Grid */}
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 800 600" preserveAspectRatio="xMidYMid slice">
          {[...Array(10)].map((_, i) => <line key={`gh${i}`} x1="0" y1={i*70} x2="800" y2={i*70} stroke="white" strokeOpacity="0.06" strokeWidth="1" />)}
          {[...Array(12)].map((_, i) => <line key={`gv${i}`} x1={i*75} y1="0" x2={i*75} y2="600" stroke="white" strokeOpacity="0.06" strokeWidth="1" />)}

          {/* Route lines */}
          <path d="M 0,220 L 800,220" stroke="white" strokeWidth="2.5" strokeOpacity="0.25" />
          <path d="M 0,380 Q 200,380 400,260 Q 600,140 800,180" stroke="#00C2A8" strokeWidth="2.5" strokeOpacity="0.5" fill="none" />
          <path d="M 300,0 L 280,600" stroke="#F4B400" strokeWidth="2" strokeOpacity="0.4" />
          <path d="M 550,100 Q 700,200 700,380 Q 680,480 550,490 Q 400,490 400,380 Q 400,260 550,240 Q 640,220 640,170 Q 640,130 550,100" stroke="white" strokeWidth="2" strokeOpacity="0.2" fill="none" />

          {/* Bus stop dots */}
          {[[80,220],[200,220],[400,220],[600,220],[300,120],[300,300],[300,440]].map(([x,y],i) => (
            <g key={`ls${i}`}>
              <circle cx={x} cy={y} r="5" fill="white" fillOpacity="0.5" />
              <circle cx={x} cy={y} r="9" fill="white" fillOpacity="0.1" />
            </g>
          ))}

          {/* Animated bus markers */}
          <circle r="10" fill="white" fillOpacity="0.9" style={{ offsetPath: "path('M 0,220 L 800,220')", animation: "moveBus101 15s linear infinite" }}>
          </circle>
          <circle r="10" fill="#00C2A8" style={{ offsetPath: "path('M 0,380 Q 200,380 400,260 Q 600,140 800,180')", animation: "moveBus102a 20s linear infinite" }} />

          {/* Network nodes */}
          {[[80,60],[720,80],[740,520],[60,500],[400,80],[360,530]].map(([x,y],i) => (
            <g key={`nn${i}`}>
              <circle cx={x} cy={y} r="5" fill="white" fillOpacity="0.4" />
              <circle cx={x} cy={y} r="12" fill="white" fillOpacity="0.08" />
            </g>
          ))}
          <line x1="80" y1="60" x2="400" y2="80" stroke="white" strokeOpacity="0.12" strokeWidth="1" strokeDasharray="4 4" />
          <line x1="400" y1="80" x2="720" y2="80" stroke="white" strokeOpacity="0.12" strokeWidth="1" strokeDasharray="4 4" />
          <line x1="720" y1="80" x2="740" y2="520" stroke="white" strokeOpacity="0.12" strokeWidth="1" strokeDasharray="4 4" />
          <line x1="740" y1="520" x2="360" y2="530" stroke="white" strokeOpacity="0.12" strokeWidth="1" strokeDasharray="4 4" />
          <line x1="360" y1="530" x2="60" y2="500" stroke="white" strokeOpacity="0.12" strokeWidth="1" strokeDasharray="4 4" />
          <line x1="60" y1="500" x2="80" y2="60" stroke="white" strokeOpacity="0.12" strokeWidth="1" strokeDasharray="4 4" />
        </svg>

        {/* Text overlay */}
        <div className="absolute bottom-12 left-12 right-12">
          <div className="text-white/40 text-xs font-mono uppercase tracking-widest mb-4">RAAH TRANSIT INTELLIGENCE</div>
          <div className="text-white text-3xl font-bold mb-2">City-wide command,<br />one console.</div>
          <div className="text-white/60 text-sm">Monitor 247 buses across 14 routes in real time.</div>
        </div>

        {/* Stats pills */}
        <div className="absolute top-10 left-12 flex gap-3">
          {[["247", "Active Buses"], ["14", "Routes"], ["99.2%", "Uptime"]].map(([v, l]) => (
            <div key={l} className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl px-4 py-2.5">
              <div className="text-white font-bold text-lg font-mono">{v}</div>
              <div className="text-white/60 text-xs">{l}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── Sidebar ──────────────────────────────────────────────────────────────────

const NAV = [
  { id: "dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { id: "map", icon: Map, label: "Live Map" },
  { id: "routes", icon: Route, label: "Routes" },
  { id: "alerts", icon: Bell, label: "Alerts", badge: 2 },
  { id: "analytics", icon: BarChart2, label: "Analytics" },
  { id: "settings", icon: Settings, label: "Settings" },
]

function Sidebar({ screen, setScreen, collapsed, onCollapse }: {
  screen: Screen, setScreen: (s: Screen) => void, collapsed: boolean, onCollapse: () => void
}) {
  return (
    <div
      className="flex flex-col h-full bg-white border-r border-[#E8ECF5] transition-all duration-300 z-20 flex-shrink-0"
      style={{ width: collapsed ? 64 : 240 }}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-5 border-b border-[#E8ECF5]">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: "linear-gradient(135deg, #7385FF, #5B6CFF)" }}>
          <Bus size={16} color="white" />
        </div>
        {!collapsed && (
          <div className="overflow-hidden">
            <div className="font-bold text-[#1A1D29] text-sm">Raah</div>
            <div className="text-[10px] text-[#5F6678]">Operator Console</div>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 px-2 py-4 flex flex-col gap-0.5">
        {NAV.map(item => {
          const active = screen === item.id
          return (
            <button
              key={item.id}
              onClick={() => setScreen(item.id as Screen)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 w-full text-left relative group
                ${active ? "bg-[#EEF0FF] text-[#5B6CFF]" : "text-[#5F6678] hover:bg-[#F8FAFD] hover:text-[#1A1D29]"}`}
            >
              <item.icon size={18} className="flex-shrink-0" />
              {!collapsed && <span className="flex-1">{item.label}</span>}
              {!collapsed && item.badge && (
                <span className="text-[10px] bg-[#EF4444] text-white rounded-full px-1.5 py-0.5 font-semibold">{item.badge}</span>
              )}
              {collapsed && item.badge && (
                <span className="absolute top-1 right-1 w-2 h-2 bg-[#EF4444] rounded-full" />
              )}
            </button>
          )
        })}
      </nav>

      {/* Profile + collapse */}
      <div className="border-t border-[#E8ECF5] p-2">
        <div className={`flex items-center gap-3 px-2 py-2 rounded-xl ${collapsed ? "justify-center" : ""}`}>
          <div className="w-7 h-7 rounded-lg bg-[#EEF0FF] flex items-center justify-center flex-shrink-0">
            <User size={14} className="text-[#5B6CFF]" />
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <div className="text-xs font-semibold text-[#1A1D29] truncate">Arjun Mehta</div>
              <div className="text-[10px] text-[#5F6678]">Senior Operator</div>
            </div>
          )}
        </div>
        <button
          onClick={onCollapse}
          className="w-full flex items-center justify-center gap-2 mt-1 py-2 rounded-xl text-[#5F6678] hover:bg-[#F8FAFD] hover:text-[#1A1D29] transition-colors text-xs"
        >
          {collapsed ? <ChevronRight size={15} /> : <><ChevronLeft size={15} /><span>Collapse</span></>}
        </button>
      </div>
    </div>
  )
}

// ─── Top Bar ──────────────────────────────────────────────────────────────────

function TopBar() {
  const [time, setTime] = useState(new Date())
  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(t)
  }, [])

  const fmt = time.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", second: "2-digit" })

  return (
    <div className="flex items-center gap-4 px-6 h-16 bg-white border-b border-[#E8ECF5] flex-shrink-0">
      {/* Search */}
      <div className="flex items-center gap-2 flex-1 max-w-xs h-9 px-3 rounded-xl bg-[#F8FAFD] border border-[#E8ECF5]">
        <Search size={14} className="text-[#C0C7D8] flex-shrink-0" />
        <input type="text" placeholder="Search bus, route, stop…" className="bg-transparent text-sm text-[#1A1D29] placeholder-[#C0C7D8] outline-none w-full" />
      </div>

      <div className="flex-1" />

      {/* Status chips */}
      <div className="flex items-center gap-3 text-xs">
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#F8FAFD] border border-[#E8ECF5] text-[#5F6678]">
          <Thermometer size={12} className="text-[#5B6CFF]" />
          <span>28°C</span>
          <Wind size={12} className="text-[#5B6CFF]" />
          <span>Partly Cloudy</span>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#E8FFF4] border border-[#B2DFDB] text-[#16C47F] font-medium">
          <div className="w-1.5 h-1.5 rounded-full bg-[#16C47F]" />
          Network Online
        </div>
        <div className="relative">
          <button className="w-9 h-9 rounded-xl bg-[#F8FAFD] border border-[#E8ECF5] flex items-center justify-center text-[#5F6678] hover:bg-[#F0F2F9] transition-colors">
            <Bell size={16} />
          </button>
          <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-[#EF4444] rounded-full text-[9px] text-white flex items-center justify-center font-bold">2</span>
        </div>
        <div className="text-[#1A1D29] font-mono font-semibold text-sm tabular-nums">{fmt}</div>
        <div className="w-8 h-8 rounded-full bg-[#EEF0FF] flex items-center justify-center">
          <User size={14} className="text-[#5B6CFF]" />
        </div>
      </div>
    </div>
  )
}

// ─── Dashboard Screen ─────────────────────────────────────────────────────────

function KPICard({ label, value, unit, sub, icon: Icon, color, trend }: {
  label: string, value: string | number, unit?: string, sub: string, icon: any, color: string, trend?: "up" | "down" | "neutral"
}) {
  return (
    <div className="bg-white rounded-2xl border border-[#E8ECF5] p-5 hover:shadow-md transition-shadow duration-200 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: `${color}18` }}>
          <Icon size={17} style={{ color }} />
        </div>
        {trend && (
          <div className={`flex items-center gap-1 text-xs font-medium ${trend === "up" ? "text-[#16C47F]" : trend === "down" ? "text-[#EF4444]" : "text-[#5F6678]"}`}>
            {trend === "up" ? <TrendingUp size={12} /> : trend === "down" ? <TrendingDown size={12} /> : null}
          </div>
        )}
      </div>
      <div>
        <div className="flex items-end gap-1">
          <span className="text-3xl font-bold text-[#1A1D29] font-mono tabular-nums tracking-tight">{value}</span>
          {unit && <span className="text-sm text-[#5F6678] mb-1">{unit}</span>}
        </div>
        <div className="text-xs text-[#5F6678] font-medium mt-0.5">{label}</div>
      </div>
      <div className="text-[10px] text-[#C0C7D8]">{sub}</div>
    </div>
  )
}

function DashboardScreen({ setScreen }: { setScreen: (s: Screen) => void }) {
  return (
    <div className="p-6 flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#1A1D29]">Network Overview</h1>
          <p className="text-sm text-[#5F6678] mt-0.5">Monday, 30 June 2025 · Peak hour in progress</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-2 px-4 py-2 rounded-xl border border-[#E8ECF5] text-sm text-[#5F6678] hover:bg-[#F0F2F9] transition-colors">
            <RefreshCw size={14} /> Refresh
          </button>
          <button onClick={() => setScreen("map")} className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm text-white font-medium transition-opacity hover:opacity-90" style={{ background: "linear-gradient(135deg, #7385FF, #5B6CFF)" }}>
            <Map size={14} /> Live Map
          </button>
        </div>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-4 xl:grid-cols-8 gap-4">
        <div className="xl:col-span-1 col-span-2"><KPICard label="Active Buses" value={247} sub="of 260 fleet" icon={Bus} color="#5B6CFF" trend="up" /></div>
        <div className="xl:col-span-1 col-span-2"><KPICard label="Running Routes" value={14} sub="all routes live" icon={Route} color="#16C47F" trend="neutral" /></div>
        <div className="xl:col-span-1 col-span-2"><KPICard label="Delayed Buses" value={23} sub="+5 from last hour" icon={AlertTriangle} color="#EF4444" trend="down" /></div>
        <div className="xl:col-span-1 col-span-2"><KPICard label="Avg Headway" value="9.4" unit="min" sub="target: 8 min" icon={Clock} color="#F4B400" /></div>
        <div className="xl:col-span-1 col-span-2"><KPICard label="Passengers Today" value="53.9k" sub="↑ 12% vs yesterday" icon={Users} color="#00C2A8" trend="up" /></div>
        <div className="xl:col-span-1 col-span-2"><KPICard label="Health Score" value={78} unit="/100" sub="2 routes critical" icon={Activity} color="#5B6CFF" /></div>
        <div className="xl:col-span-1 col-span-2"><KPICard label="System Uptime" value="99.2" unit="%" sub="Last 30 days" icon={Zap} color="#16C47F" trend="up" /></div>
        <div className="xl:col-span-1 col-span-2"><KPICard label="AI Actions Today" value={12} sub="8 approved" icon={Radio} color="#00C2A8" /></div>
      </div>

      {/* Main content: map + activity */}
      <div className="grid grid-cols-3 gap-4" style={{ height: 340 }}>
        {/* Map */}
        <div className="col-span-2 bg-white rounded-2xl border border-[#E8ECF5] overflow-hidden relative">
          <div className="absolute top-3 left-3 z-10 flex items-center gap-2">
            <div className="bg-white/90 backdrop-blur-sm rounded-xl px-3 py-1.5 text-xs font-semibold text-[#1A1D29] border border-[#E8ECF5]">Live Map Preview</div>
          </div>
          <button onClick={() => setScreen("map")} className="absolute bottom-3 right-3 z-10 bg-[#5B6CFF] text-white text-xs font-medium px-3 py-1.5 rounded-xl hover:opacity-90 transition-opacity flex items-center gap-1.5">
            <ArrowRight size={12} /> Full Map
          </button>
          <CityMap />
        </div>

        {/* Activity panel */}
        <div className="bg-white rounded-2xl border border-[#E8ECF5] flex flex-col overflow-hidden">
          <div className="px-4 py-3 border-b border-[#E8ECF5] flex items-center justify-between">
            <span className="text-sm font-semibold text-[#1A1D29]">Live Activity</span>
            <span className="text-[10px] text-[#5F6678]">Last 30 min</span>
          </div>
          <div className="flex-1 overflow-y-auto">
            {ALERTS.slice(0, 4).map(alert => (
              <div key={alert.id} className="px-4 py-3 border-b border-[#F0F2F9] last:border-0 hover:bg-[#F8FAFD] transition-colors cursor-pointer">
                <div className="flex items-start gap-2.5">
                  <div className={`mt-0.5 w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 ${alert.priority === "critical" ? "bg-red-50" : alert.priority === "warning" ? "bg-amber-50" : "bg-slate-50"}`}>
                    {alert.priority === "critical" ? <AlertTriangle size={12} className="text-[#EF4444]" /> :
                     alert.priority === "warning" ? <AlertTriangle size={12} className="text-[#F4B400]" /> :
                     <CheckCircle size={12} className="text-slate-400" />}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-[#1A1D29] leading-tight">{alert.title}</p>
                    <p className="text-[10px] text-[#5F6678] mt-0.5">Rt {alert.route} · {alert.time}</p>
                  </div>
                </div>
              </div>
            ))}
            {/* AI insight */}
            <div className="mx-3 my-3 p-3 rounded-xl" style={{ background: "linear-gradient(135deg, #EEF0FF, #F0F8FF)" }}>
              <div className="flex items-center gap-1.5 mb-1.5">
                <Zap size={11} className="text-[#5B6CFF]" />
                <span className="text-[10px] font-semibold text-[#5B6CFF] uppercase tracking-wide">AI Insight</span>
              </div>
              <p className="text-xs text-[#1A1D29] leading-relaxed">Route 102 is experiencing bus bunching near Silk Board. Recommend holding Bus 102B for 3 minutes.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-3 gap-4">
        {/* Ridership */}
        <div className="col-span-2 bg-white rounded-2xl border border-[#E8ECF5] p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="text-sm font-semibold text-[#1A1D29]">Weekly Ridership</div>
              <div className="text-xs text-[#5F6678]">Total passengers per day</div>
            </div>
            <span className="text-xs text-[#16C47F] font-medium bg-emerald-50 px-2.5 py-1 rounded-full">↑ 8.2% WoW</span>
          </div>
          <ResponsiveContainer width="100%" height={160}>
            <AreaChart data={ridershipData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="rgGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#5B6CFF" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#5B6CFF" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#F0F2F9" vertical={false} />
              <XAxis dataKey="day" tick={{ fontSize: 11, fill: "#9DA8C7" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "#9DA8C7" }} axisLine={false} tickLine={false} tickFormatter={v => `${(v/1000).toFixed(0)}k`} />
              <Tooltip formatter={(v: any) => [`${(v/1000).toFixed(1)}k`, "Passengers"]} contentStyle={{ borderRadius: 12, border: "1px solid #E8ECF5", fontSize: 12 }} />
              <Area type="monotone" dataKey="passengers" stroke="#5B6CFF" strokeWidth={2.5} fill="url(#rgGrad)" dot={false} activeDot={{ r: 4, fill: "#5B6CFF" }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Delay trend */}
        <div className="bg-white rounded-2xl border border-[#E8ECF5] p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="text-sm font-semibold text-[#1A1D29]">Avg Delay</div>
              <div className="text-xs text-[#5F6678]">Network-wide (min)</div>
            </div>
            <span className="text-xs text-[#EF4444] font-medium bg-red-50 px-2.5 py-1 rounded-full">9.4 min now</span>
          </div>
          <ResponsiveContainer width="100%" height={160}>
            <LineChart data={delayTrendData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F0F2F9" vertical={false} />
              <XAxis dataKey="t" tick={{ fontSize: 10, fill: "#9DA8C7" }} axisLine={false} tickLine={false} interval={2} />
              <YAxis tick={{ fontSize: 10, fill: "#9DA8C7" }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #E8ECF5", fontSize: 12 }} />
              <Line type="monotone" dataKey="delay" stroke="#EF4444" strokeWidth={2.5} dot={false} activeDot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "View Live Map", icon: Map, screen: "map", color: "#5B6CFF" },
          { label: "View Alerts", icon: Bell, screen: "alerts", color: "#EF4444" },
          { label: "Manage Fleet", icon: Bus, screen: "routes", color: "#16C47F" },
        ].map(a => (
          <button key={a.screen} onClick={() => setScreen(a.screen as Screen)}
            className="flex items-center gap-3 px-5 py-3.5 bg-white rounded-2xl border border-[#E8ECF5] hover:shadow-md transition-all duration-200 hover:border-transparent group text-left">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors" style={{ background: `${a.color}15` }}>
              <a.icon size={18} style={{ color: a.color }} />
            </div>
            <span className="text-sm font-semibold text-[#1A1D29]">{a.label}</span>
            <ArrowRight size={14} className="ml-auto text-[#C0C7D8] group-hover:text-[#5B6CFF] transition-colors" />
          </button>
        ))}
      </div>
    </div>
  )
}

// ─── Live Map Screen ──────────────────────────────────────────────────────────

function MapScreen() {
  const [selectedBus, setSelectedBus] = useState<typeof BUSES[0] | null>(null)
  const [filters, setFilters] = useState({ routes: true, stops: true, traffic: false, weather: false })

  return (
    <div className="relative h-full flex overflow-hidden">
      {/* Filters bar */}
      <div className="absolute top-4 left-4 z-10 flex items-center gap-2">
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl border border-[#E8ECF5] shadow-lg px-4 py-2 flex items-center gap-3">
          <Filter size={14} className="text-[#5F6678]" />
          {Object.entries(filters).map(([k, v]) => (
            <button key={k} onClick={() => setFilters(f => ({ ...f, [k]: !f[k as keyof typeof f] }))}
              className={`text-xs font-medium px-3 py-1.5 rounded-lg transition-colors capitalize ${v ? "bg-[#5B6CFF] text-white" : "bg-[#F0F2F9] text-[#5F6678] hover:bg-[#E8ECF5]"}`}>
              {k}
            </button>
          ))}
        </div>
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl border border-[#E8ECF5] shadow-lg flex items-center gap-2 px-3 py-2">
          <Search size={14} className="text-[#C0C7D8]" />
          <input placeholder="Search bus or route…" className="text-xs bg-transparent outline-none text-[#1A1D29] w-36 placeholder-[#C0C7D8]" />
        </div>
      </div>

      {/* Status legend */}
      <div className="absolute top-4 right-4 z-10 bg-white/95 backdrop-blur-sm rounded-2xl border border-[#E8ECF5] shadow-lg p-3">
        <div className="text-[10px] font-semibold text-[#5F6678] uppercase tracking-wider mb-2">Status</div>
        {[["#16C47F","On Time"], ["#F4B400","Delayed / Crowded"], ["#EF4444","Emergency"]].map(([c,l]) => (
          <div key={l} className="flex items-center gap-2 mb-1.5 last:mb-0">
            <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: c }} />
            <span className="text-xs text-[#5F6678]">{l}</span>
          </div>
        ))}
        <div className="mt-2 pt-2 border-t border-[#E8ECF5] text-[10px] text-[#5F6678]">Click bus to inspect</div>
      </div>

      {/* Map */}
      <div className="flex-1 h-full" onClick={() => !selectedBus && null}>
        <CityMap onBusClick={b => setSelectedBus(b)} />
      </div>

      {/* Bus detail panel */}
      {selectedBus && (
        <div className="w-80 h-full bg-white border-l border-[#E8ECF5] flex flex-col overflow-hidden shadow-xl z-10 flex-shrink-0">
          <div className="px-5 py-4 border-b border-[#E8ECF5] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center text-white font-bold text-sm" style={{ background: selectedBus.color }}>{selectedBus.id.slice(-3)}</div>
              <div>
                <div className="text-sm font-bold text-[#1A1D29]">{selectedBus.id}</div>
                <div className="text-[10px] text-[#5F6678]">Route {selectedBus.route}</div>
              </div>
            </div>
            <button onClick={() => setSelectedBus(null)} className="w-7 h-7 rounded-full bg-[#F0F2F9] flex items-center justify-center hover:bg-[#E8ECF5] transition-colors">
              <X size={13} className="text-[#5F6678]" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-4">
            <StatusBadge status={selectedBus.status} />

            <div className="grid grid-cols-2 gap-3">
              {[
                { label: "Speed", value: `${selectedBus.speed} km/h`, icon: Gauge },
                { label: "Passengers", value: `${selectedBus.passengers}/${selectedBus.capacity}`, icon: Users },
                { label: "Delay", value: selectedBus.delay ? `+${selectedBus.delay} min` : "On time", icon: Clock },
                { label: "ETA Next", value: selectedBus.eta, icon: Navigation },
              ].map(item => (
                <div key={item.label} className="bg-[#F8FAFD] rounded-xl p-3">
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <item.icon size={12} className="text-[#5F6678]" />
                    <span className="text-[10px] text-[#5F6678] font-medium">{item.label}</span>
                  </div>
                  <div className="text-sm font-bold text-[#1A1D29] font-mono">{item.value}</div>
                </div>
              ))}
            </div>

            <div className="bg-[#F8FAFD] rounded-xl p-4">
              <div className="text-xs font-semibold text-[#5F6678] mb-3">Route Progress</div>
              <div className="flex items-center gap-2 mb-2">
                <MapPin size={12} className="text-[#5B6CFF] flex-shrink-0" />
                <span className="text-xs text-[#1A1D29] font-medium">{selectedBus.currentStop}</span>
                <span className="text-[10px] text-[#C0C7D8] ml-auto">Current</span>
              </div>
              <div className="w-0.5 h-4 bg-[#E8ECF5] ml-1.5 my-0.5" />
              <div className="flex items-center gap-2">
                <MapPin size={12} className="text-[#16C47F] flex-shrink-0" />
                <span className="text-xs text-[#1A1D29] font-medium">{selectedBus.nextStop}</span>
                <span className="text-[10px] text-[#5B6CFF] ml-auto">{selectedBus.eta}</span>
              </div>
            </div>

            <div className="bg-[#F8FAFD] rounded-xl p-4">
              <div className="text-xs font-semibold text-[#5F6678] mb-2">Crew</div>
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-[#EEF0FF] flex items-center justify-center">
                  <User size={13} className="text-[#5B6CFF]" />
                </div>
                <div>
                  <div className="text-xs font-medium text-[#1A1D29]">{selectedBus.driver}</div>
                  <div className="text-[10px] text-[#5F6678]">Driver</div>
                </div>
              </div>
            </div>

            <div>
              <div className="text-xs font-semibold text-[#5F6678] mb-2">Occupancy</div>
              <div className="flex items-center gap-3">
                <OccupancyRing pct={Math.round(selectedBus.passengers / selectedBus.capacity * 100)} color={selectedBus.passengers / selectedBus.capacity > 0.9 ? "#EF4444" : selectedBus.passengers / selectedBus.capacity > 0.7 ? "#F4B400" : "#16C47F"} />
                <div className="text-xs text-[#5F6678] leading-relaxed">
                  {selectedBus.passengers} of {selectedBus.capacity} seats<br />
                  <span className={selectedBus.passengers / selectedBus.capacity > 0.9 ? "text-[#EF4444] font-semibold" : "text-[#16C47F] font-semibold"}>
                    {selectedBus.passengers / selectedBus.capacity > 0.9 ? "Near capacity" : selectedBus.passengers / selectedBus.capacity > 0.7 ? "Crowded" : "Comfortable"}
                  </span>
                </div>
              </div>
            </div>

            {selectedBus.status === "emergency" && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                <div className="flex items-center gap-2 text-[#EF4444] font-semibold text-xs mb-1">
                  <AlertTriangle size={13} />
                  Emergency Status
                </div>
                <p className="text-xs text-red-600">Vehicle stopped. Recovery team dispatched. ETA 12 minutes.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Routes Screen ────────────────────────────────────────────────────────────

function RoutesScreen({ setScreen }: { setScreen: (s: Screen) => void }) {
  const [search, setSearch] = useState("")
  const filtered = ROUTES.filter(r => r.name.toLowerCase().includes(search.toLowerCase()) || r.id.includes(search))

  return (
    <div className="p-6 flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#1A1D29]">Routes</h1>
          <p className="text-sm text-[#5F6678] mt-0.5">{ROUTES.length} routes · {ROUTES.filter(r => r.status === "operational").length} operational</p>
        </div>
        <div className="flex items-center gap-2 h-10 px-3 rounded-xl border border-[#E8ECF5] bg-white">
          <Search size={14} className="text-[#C0C7D8]" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search routes…" className="bg-transparent text-sm text-[#1A1D29] placeholder-[#C0C7D8] outline-none w-40" />
        </div>
      </div>

      {/* Route cards */}
      <div className="flex flex-col gap-3">
        {filtered.map(route => (
          <div key={route.id}
            onClick={() => setScreen("bunching")}
            className="bg-white rounded-2xl border border-[#E8ECF5] p-5 hover:shadow-md hover:border-[#D0D5F0] transition-all duration-200 cursor-pointer group">
            <div className="flex items-center gap-4">
              {/* Route number badge */}
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-white text-sm flex-shrink-0"
                style={{ background: route.status === "disrupted" ? "#EF4444" : route.status === "delayed" ? "#F4B400" : "#5B6CFF" }}>
                {route.id}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-semibold text-[#1A1D29]">{route.name}</span>
                  <StatusBadge status={route.status} />
                </div>
                <div className="text-xs text-[#5F6678]">{route.origin} → {route.destination}</div>
              </div>

              {/* Metrics */}
              <div className="hidden lg:grid grid-cols-4 gap-6 flex-shrink-0">
                {[
                  { label: "Buses", value: route.activeBuses },
                  { label: "Headway", value: `${route.avgHeadway}m` },
                  { label: "Avg Delay", value: route.avgDelay > 0 ? `+${route.avgDelay}m` : "0m" },
                  { label: "Crowding", value: `${route.crowding}%` },
                ].map(m => (
                  <div key={m.label} className="text-center">
                    <div className="text-base font-bold text-[#1A1D29] font-mono">{m.value}</div>
                    <div className="text-[10px] text-[#5F6678]">{m.label}</div>
                  </div>
                ))}
              </div>

              {/* Health */}
              <div className="w-36 flex-shrink-0">
                <div className="text-[10px] text-[#5F6678] mb-1.5">Health Score</div>
                <HealthBar score={route.healthScore} />
              </div>

              <ArrowRight size={16} className="text-[#C0C7D8] group-hover:text-[#5B6CFF] transition-colors flex-shrink-0" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Alerts Screen ────────────────────────────────────────────────────────────

function AlertsScreen({ setScreen }: { setScreen: (s: Screen) => void }) {
  const [tab, setTab] = useState<"critical" | "warning" | "resolved">("critical")
  const filtered = ALERTS.filter(a => a.priority === tab)

  return (
    <div className="p-6 flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#1A1D29]">Alert Center</h1>
          <p className="text-sm text-[#5F6678] mt-0.5">{ALERTS.filter(a => a.priority === "critical").length} critical · {ALERTS.filter(a => a.priority === "warning").length} warnings</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm border border-[#E8ECF5] text-[#5F6678] hover:bg-[#F0F2F9] transition-colors">
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-[#F0F2F9] rounded-xl p-1 w-fit">
        {(["critical", "warning", "resolved"] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-5 py-2 rounded-lg text-sm font-medium capitalize transition-all ${tab === t ? "bg-white text-[#1A1D29] shadow-sm" : "text-[#5F6678] hover:text-[#1A1D29]"}`}>
            {t} {t !== "resolved" && <span className="ml-1 text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-[#F0F2F9]">{ALERTS.filter(a => a.priority === t).length}</span>}
          </button>
        ))}
      </div>

      {/* Alert cards */}
      <div className="flex flex-col gap-3">
        {filtered.map(alert => (
          <div key={alert.id} className="bg-white rounded-2xl border border-[#E8ECF5] p-5 hover:shadow-md transition-shadow">
            <div className="flex items-start gap-4">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${alert.priority === "critical" ? "bg-red-50" : alert.priority === "warning" ? "bg-amber-50" : "bg-slate-50"}`}>
                {alert.priority === "resolved" ? <CheckCircle size={18} className="text-slate-400" /> : <AlertTriangle size={18} className={alert.priority === "critical" ? "text-[#EF4444]" : "text-[#F4B400]"} />}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-semibold text-[#1A1D29]">{alert.title}</span>
                  <StatusBadge status={alert.priority} />
                </div>
                <div className="text-xs text-[#5F6678] mb-2">Route {alert.route} · {alert.time} · {alert.cause}</div>

                {/* AI Summary */}
                <div className="bg-[#F8FAFD] rounded-xl p-3 mb-3">
                  <div className="flex items-center gap-1.5 mb-1">
                    <Zap size={11} className="text-[#5B6CFF]" />
                    <span className="text-[10px] font-semibold text-[#5B6CFF] uppercase tracking-wide">AI Summary</span>
                  </div>
                  <p className="text-xs text-[#1A1D29] leading-relaxed">{alert.aiSummary}</p>
                </div>

                {alert.priority !== "resolved" && (
                  <div className="flex items-center gap-2">
                    <button onClick={() => setScreen("bunching")} className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-medium border border-[#E8ECF5] text-[#5F6678] hover:bg-[#F0F2F9] transition-colors">
                      <Eye size={12} /> Investigate
                    </button>
                    <button onClick={() => setScreen("ai-rec")} className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-medium text-white transition-opacity hover:opacity-90" style={{ background: "#5B6CFF" }}>
                      <Check size={12} /> Approve Action
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="bg-white rounded-2xl border border-[#E8ECF5] p-12 flex flex-col items-center gap-3">
            <CheckCircle size={32} className="text-[#16C47F]" />
            <p className="text-sm text-[#5F6678]">No {tab} alerts — all clear.</p>
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Bus Bunching Investigation ───────────────────────────────────────────────

function BunchingScreen({ setScreen }: { setScreen: (s: Screen) => void }) {
  const stops = ["Central", "MG Road", "Koramangala", "Silk Board", "HSR", "Electronic City"]
  const busPositions = [
    { id: "B-102A", stop: 2, delay: 7, color: "#16C47F" },
    { id: "B-102B", stop: 2, delay: 12, color: "#F4B400" },
  ]

  return (
    <div className="p-6 flex flex-col gap-5 h-full overflow-auto">
      <div className="flex items-center gap-3">
        <button onClick={() => setScreen("alerts")} className="flex items-center gap-1.5 text-sm text-[#5F6678] hover:text-[#1A1D29] transition-colors">
          <ChevronLeft size={16} /> Back
        </button>
        <div>
          <h1 className="text-2xl font-bold text-[#1A1D29]">Bus Bunching — Route 102</h1>
          <p className="text-sm text-[#5F6678] mt-0.5">MG Road → Electronic City · Detected 2 min ago</p>
        </div>
        <button onClick={() => setScreen("ai-rec")} className="ml-auto flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm text-white font-medium hover:opacity-90 transition-opacity" style={{ background: "linear-gradient(135deg, #7385FF, #5B6CFF)" }}>
          <Zap size={14} /> View AI Recommendation
        </button>
      </div>

      <div className="grid grid-cols-3 gap-4" style={{ minHeight: 520 }}>
        {/* Left — Route timeline */}
        <div className="bg-white rounded-2xl border border-[#E8ECF5] p-5 flex flex-col">
          <div className="text-sm font-semibold text-[#1A1D29] mb-4">Route Timeline</div>
          <div className="relative flex-1">
            {/* Timeline line */}
            <div className="absolute left-3 top-0 bottom-0 w-0.5 bg-[#E8ECF5]" />
            <div className="flex flex-col gap-0">
              {stops.map((stop, i) => {
                const busHere = busPositions.filter(b => b.stop === i)
                return (
                  <div key={stop} className="relative pl-8 pb-6">
                    <div className="absolute left-0 w-6 h-6 rounded-full border-2 border-[#E8ECF5] bg-white flex items-center justify-center">
                      <div className={`w-2 h-2 rounded-full ${busHere.length > 1 ? "bg-[#EF4444]" : busHere.length === 1 ? "bg-[#16C47F]" : "bg-[#E8ECF5]"}`} />
                    </div>
                    <div className="text-xs font-medium text-[#1A1D29]">{stop}</div>
                    {busHere.length > 0 && (
                      <div className="flex gap-1 mt-1.5">
                        {busHere.map(b => (
                          <div key={b.id} className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium text-white" style={{ background: b.color }}>
                            {b.id.slice(-4)} +{b.delay}m
                          </div>
                        ))}
                      </div>
                    )}
                    {busHere.length > 1 && (
                      <div className="mt-1 text-[10px] text-[#EF4444] font-semibold flex items-center gap-1">
                        <AlertTriangle size={9} /> Bunching detected
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>

          {/* Bus spacing */}
          <div className="border-t border-[#E8ECF5] pt-4">
            <div className="text-xs font-semibold text-[#5F6678] mb-2">Bus Spacing</div>
            <div className="flex items-center gap-2 bg-[#F8FAFD] rounded-xl p-3">
              <div className="w-3 h-3 rounded-full bg-[#16C47F]" />
              <div className="flex-1 relative h-1.5 bg-[#E8ECF5] rounded-full overflow-visible">
                <div className="absolute h-full rounded-full bg-[#EF4444]/30" style={{ left: "30%", width: "8%" }} />
                <div className="absolute w-3 h-3 rounded-full bg-[#16C47F] border-2 border-white shadow-sm -top-0.5" style={{ left: "30%" }} />
                <div className="absolute w-3 h-3 rounded-full bg-[#F4B400] border-2 border-white shadow-sm -top-0.5" style={{ left: "36%" }} />
              </div>
              <div className="w-3 h-3 rounded-full bg-[#E8ECF5]" />
            </div>
            <div className="text-[10px] text-[#EF4444] text-center mt-2 font-semibold">Gap: 1.4 min (target: 8 min)</div>
          </div>
        </div>

        {/* Middle — Map */}
        <div className="bg-white rounded-2xl border border-[#E8ECF5] overflow-hidden relative">
          <div className="absolute top-3 left-3 z-10 bg-white/90 backdrop-blur-sm rounded-xl px-3 py-1.5 border border-[#E8ECF5]">
            <div className="text-[10px] font-semibold text-[#EF4444] flex items-center gap-1"><AlertTriangle size={10} /> Bunching Zone</div>
          </div>
          <CityMap highlightRoute="102" zoom />
          <div className="absolute bottom-3 left-3 right-3 bg-amber-50 border border-amber-200 rounded-xl p-3">
            <div className="text-xs font-semibold text-amber-800 mb-0.5">B-102A & B-102B — 1.4 min apart</div>
            <div className="text-[10px] text-amber-700">Target headway: 8 min · Silk Board congestion</div>
          </div>
        </div>

        {/* Right — AI Analysis */}
        <div className="bg-white rounded-2xl border border-[#E8ECF5] p-5 flex flex-col gap-4 overflow-y-auto">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-[#EEF0FF] flex items-center justify-center">
              <Zap size={15} className="text-[#5B6CFF]" />
            </div>
            <div>
              <div className="text-sm font-bold text-[#1A1D29]">AI Analysis</div>
              <div className="text-[10px] text-[#5F6678]">Raah Intelligence v3.4</div>
            </div>
          </div>

          <div>
            <div className="text-xs font-semibold text-[#5F6678] uppercase tracking-wider mb-2">Likely Causes</div>
            <div className="flex flex-col gap-2">
              {[
                { cause: "Traffic congestion", pct: 68, color: "#EF4444" },
                { cause: "Passenger overload", pct: 21, color: "#F4B400" },
                { cause: "Signal delay", pct: 8, color: "#5B6CFF" },
                { cause: "Unexpected dwell time", pct: 3, color: "#C0C7D8" },
              ].map(c => (
                <div key={c.cause}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-[#1A1D29]">{c.cause}</span>
                    <span className="text-xs font-semibold font-mono" style={{ color: c.color }}>{c.pct}%</span>
                  </div>
                  <div className="h-1.5 bg-[#E8ECF5] rounded-full overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${c.pct}%`, background: c.color }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Headway chart */}
          <div>
            <div className="text-xs font-semibold text-[#5F6678] uppercase tracking-wider mb-2">Headway Deviation</div>
            <ResponsiveContainer width="100%" height={110}>
              <LineChart data={headwayDevData} margin={{ top: 0, right: 0, left: -24, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F0F2F9" vertical={false} />
                <XAxis dataKey="t" tick={{ fontSize: 9, fill: "#9DA8C7" }} axisLine={false} tickLine={false} interval={1} />
                <YAxis tick={{ fontSize: 9, fill: "#9DA8C7" }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ borderRadius: 10, border: "1px solid #E8ECF5", fontSize: 11 }} />
                <Line type="monotone" dataKey="target" stroke="#E8ECF5" strokeWidth={1.5} dot={false} strokeDasharray="4 4" />
                <Line type="monotone" dataKey="headway" stroke="#EF4444" strokeWidth={2.5} dot={false} activeDot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
            <div className="text-[10px] text-[#EF4444] text-center font-medium mt-1">Current: 1.4 min (target: 8 min)</div>
          </div>

          {/* Root cause */}
          <div className="bg-[#FFF8E1] border border-amber-200 rounded-xl p-3">
            <div className="text-[10px] font-bold text-amber-800 uppercase tracking-wide mb-1.5">Root Cause Summary</div>
            <p className="text-xs text-amber-900 leading-relaxed">Silk Board junction congestion caused Bus 102A to dwell 7 minutes longer than scheduled, allowing Bus 102B to close the gap from 8 minutes to 1.4 minutes. The bunching is compounding due to shared passenger load.</p>
          </div>

          {/* Confidence */}
          <div className="flex items-center justify-between px-4 py-3 bg-[#F8FAFD] rounded-xl">
            <span className="text-xs text-[#5F6678]">Recommendation confidence</span>
            <span className="text-sm font-bold text-[#16C47F] font-mono">91%</span>
          </div>

          <button onClick={() => setScreen("ai-rec")} className="w-full py-3 rounded-xl text-sm font-semibold text-white hover:opacity-90 transition-opacity" style={{ background: "linear-gradient(135deg, #7385FF, #5B6CFF)" }}>
            View Recommendation →
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── AI Recommendation Screen ─────────────────────────────────────────────────

function AIRecScreen({ setScreen }: { setScreen: (s: Screen) => void }) {
  const [duration, setDuration] = useState(3)

  return (
    <div className="flex items-center justify-center min-h-full p-8 bg-[#F8FAFD]">
      <div className="w-full max-w-lg">
        {/* AI badge */}
        <div className="flex items-center justify-center mb-6">
          <div className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold text-[#5B6CFF]" style={{ background: "linear-gradient(135deg, #EEF0FF, #F0F8FF)", border: "1px solid #D0D5F8" }}>
            <Zap size={15} />
            Raah AI Recommendation
          </div>
        </div>

        {/* Main card */}
        <div className="bg-white rounded-3xl border border-[#E8ECF5] shadow-xl overflow-hidden">
          {/* Header */}
          <div className="p-6 border-b border-[#E8ECF5]" style={{ background: "linear-gradient(135deg, #EEF0FF 0%, #F8FAFD 100%)" }}>
            <div className="text-xs font-semibold text-[#5B6CFF] uppercase tracking-widest mb-2">Recommended Action</div>
            <h2 className="text-2xl font-bold text-[#1A1D29] mb-1">Hold Bus B-102B</h2>
            <p className="text-sm text-[#5F6678]">Route 102 · MG Road – Electronic City</p>
          </div>

          {/* Metrics */}
          <div className="grid grid-cols-2 gap-0 divide-x divide-y divide-[#E8ECF5]">
            {[
              { label: "Duration", value: `${duration} min`, unit: "", color: "#5B6CFF", big: true },
              { label: "Expected Improvement", value: "28", unit: "%", color: "#16C47F", big: true },
              { label: "Passenger Wait Time", value: "−2.4", unit: "min", color: "#00C2A8", big: false },
              { label: "Confidence", value: "91", unit: "%", color: "#F4B400", big: false },
            ].map((m, i) => (
              <div key={m.label} className="p-5">
                <div className="text-xs text-[#5F6678] mb-2">{m.label}</div>
                <div className="flex items-end gap-1">
                  <span className="text-3xl font-bold font-mono tabular-nums" style={{ color: m.color }}>{m.value}</span>
                  <span className="text-base text-[#5F6678] mb-1">{m.unit}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Reason */}
          <div className="p-5 bg-[#F8FAFD] border-t border-[#E8ECF5]">
            <div className="text-xs font-semibold text-[#5F6678] uppercase tracking-wider mb-2">Reasoning</div>
            <p className="text-sm text-[#1A1D29] leading-relaxed">
              Holding Bus B-102B at MG Road for {duration} minutes will restore the target 8-minute headway. This action minimizes total passenger wait time across the route while allowing Bus 102A to clear the Silk Board congestion zone.
            </p>
          </div>

          {/* Duration modifier */}
          <div className="px-5 pb-5">
            <div className="text-xs font-semibold text-[#5F6678] mb-3">Modify Hold Duration</div>
            <div className="flex items-center gap-3">
              <button onClick={() => setDuration(d => Math.max(1, d - 1))} className="w-9 h-9 rounded-xl border border-[#E8ECF5] flex items-center justify-center text-[#5F6678] hover:bg-[#F0F2F9] transition-colors font-bold">−</button>
              <div className="flex-1 h-2 bg-[#E8ECF5] rounded-full relative cursor-pointer">
                <div className="h-full rounded-full bg-[#5B6CFF]" style={{ width: `${((duration - 1) / 9) * 100}%` }} />
                <div className="absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-[#5B6CFF] border-2 border-white shadow-sm" style={{ left: `calc(${((duration - 1) / 9) * 100}% - 8px)` }} />
              </div>
              <button onClick={() => setDuration(d => Math.min(10, d + 1))} className="w-9 h-9 rounded-xl border border-[#E8ECF5] flex items-center justify-center text-[#5F6678] hover:bg-[#F0F2F9] transition-colors font-bold">+</button>
              <span className="text-sm font-bold text-[#1A1D29] font-mono w-14 text-center">{duration} min</span>
            </div>
          </div>

          {/* Actions */}
          <div className="grid grid-cols-2 gap-3 p-5 pt-0">
            <button onClick={() => setScreen("command-sent")} className="flex items-center justify-center gap-2 py-3.5 rounded-2xl text-sm font-semibold text-white hover:opacity-90 transition-all active:scale-[0.98]" style={{ background: "linear-gradient(135deg, #16C47F, #0EA868)" }}>
              <Check size={16} /> Approve
            </button>
            <button onClick={() => setScreen("alerts")} className="flex items-center justify-center gap-2 py-3.5 rounded-2xl text-sm font-semibold bg-[#F0F2F9] text-[#5F6678] hover:bg-[#E8ECF5] transition-colors">
              <X size={16} /> Reject
            </button>
          </div>
        </div>

        <button onClick={() => setScreen("bunching")} className="mt-4 w-full text-center text-sm text-[#5F6678] hover:text-[#1A1D29] transition-colors">
          ← Back to investigation
        </button>
      </div>
    </div>
  )
}

// ─── Command Sent Screen ──────────────────────────────────────────────────────

function CommandSentScreen({ setScreen }: { setScreen: (s: Screen) => void }) {
  const [step, setStep] = useState(0)

  useEffect(() => {
    const timers = [
      setTimeout(() => setStep(1), 400),
      setTimeout(() => setStep(2), 1200),
      setTimeout(() => setStep(3), 2000),
      setTimeout(() => setStep(4), 2800),
    ]
    return () => timers.forEach(clearTimeout)
  }, [])

  const updates = [
    "Command transmitted to Driver — Mohan Das",
    "Conductor acknowledged hold instruction",
    "ETA recalculated for 47 downstream stops",
    "Network headway model updated",
  ]

  return (
    <div className="flex items-center justify-center min-h-full bg-[#F8FAFD]">
      <style>{`
        @keyframes scaleIn { from { transform: scale(0); opacity: 0 } to { transform: scale(1); opacity: 1 } }
        @keyframes drawCheck { from { stroke-dashoffset: 80 } to { stroke-dashoffset: 0 } }
        @keyframes fadeSlide { from { opacity: 0; transform: translateY(8px) } to { opacity: 1; transform: translateY(0) } }
      `}</style>
      <div className="flex flex-col items-center gap-8 max-w-sm text-center">
        {/* Success animation */}
        <div className="relative">
          <svg width="100" height="100" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="48" fill="#E8FFF4" style={{ animation: step >= 1 ? "scaleIn 0.4s cubic-bezier(.34,1.56,.64,1) forwards" : "none", transformOrigin: "50% 50%" }} />
            <circle cx="50" cy="50" r="48" fill="none" stroke="#16C47F" strokeWidth="2.5" opacity="0.5" style={{ animation: step >= 1 ? "scaleIn 0.5s cubic-bezier(.34,1.56,.64,1) forwards" : "none", transformOrigin: "50% 50%" }} />
            {step >= 1 && (
              <polyline points="28,52 44,68 74,34" fill="none" stroke="#16C47F" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round"
                style={{ strokeDasharray: 80, strokeDashoffset: 80, animation: "drawCheck 0.5s 0.3s ease-out forwards" }} />
            )}
          </svg>
        </div>

        <div style={{ animation: step >= 1 ? "fadeSlide 0.4s 0.2s ease-out both" : "none" }}>
          <h2 className="text-2xl font-bold text-[#1A1D29] mb-1">Command Sent Successfully</h2>
          <p className="text-sm text-[#5F6678]">Hold Bus B-102B · 3 minutes at MG Road</p>
        </div>

        {/* Status updates */}
        <div className="w-full flex flex-col gap-2">
          {updates.map((update, i) => (
            <div key={i}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl bg-white border transition-all duration-300 ${i < step ? "border-[#16C47F]/30 opacity-100" : "border-[#E8ECF5] opacity-30"}`}
              style={{ animation: i < step ? `fadeSlide 0.3s ${i * 0.1}s ease-out both` : "none" }}>
              <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${i < step ? "bg-[#16C47F]" : "bg-[#E8ECF5]"}`}>
                {i < step ? <Check size={11} color="white" strokeWidth={3} /> : <div className="w-1.5 h-1.5 rounded-full bg-[#C0C7D8]" />}
              </div>
              <span className="text-xs text-[#1A1D29] text-left">{update}</span>
            </div>
          ))}
        </div>

        {step >= 4 && (
          <div style={{ animation: "fadeSlide 0.4s ease-out both" }}>
            <div className="bg-[#EEF0FF] rounded-xl p-4 mb-4 text-left">
              <div className="text-xs font-semibold text-[#5B6CFF] mb-1">Projected Impact</div>
              <div className="text-sm text-[#1A1D29]">Headway will restore to <strong>7.8 min</strong> within 12 minutes. Passenger wait time reduced by <strong>2.4 min</strong> on average.</div>
            </div>
            <button onClick={() => setScreen("dashboard")} className="w-full py-3.5 rounded-2xl text-sm font-semibold text-white hover:opacity-90 transition-opacity" style={{ background: "linear-gradient(135deg, #7385FF, #5B6CFF)" }}>
              Continue Monitoring
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Analytics Screen ─────────────────────────────────────────────────────────

function AnalyticsScreen() {
  return (
    <div className="p-6 flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#1A1D29]">Analytics</h1>
          <p className="text-sm text-[#5F6678] mt-0.5">June 2025 · Network performance overview</p>
        </div>
        <div className="flex items-center gap-2">
          {["Today", "7D", "30D", "Custom"].map(p => (
            <button key={p} className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${p === "7D" ? "bg-[#5B6CFF] text-white" : "bg-white border border-[#E8ECF5] text-[#5F6678] hover:bg-[#F0F2F9]"}`}>{p}</button>
          ))}
        </div>
      </div>

      {/* KPI summary */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: "Total Ridership", value: "311.1k", sub: "This week", color: "#5B6CFF" },
          { label: "On-Time Rate", value: "82.4%", sub: "Target: 90%", color: "#F4B400" },
          { label: "Avg Delay", value: "3.8 min", sub: "Network-wide", color: "#EF4444" },
          { label: "Fuel Efficiency", value: "4.2 km/L", sub: "+0.3 vs last week", color: "#16C47F" },
        ].map(k => (
          <div key={k.label} className="bg-white rounded-2xl border border-[#E8ECF5] p-5">
            <div className="text-xs text-[#5F6678] mb-2">{k.label}</div>
            <div className="text-2xl font-bold font-mono tabular-nums" style={{ color: k.color }}>{k.value}</div>
            <div className="text-[10px] text-[#C0C7D8] mt-1">{k.sub}</div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-2 gap-4">
        {/* Ridership area */}
        <div className="bg-white rounded-2xl border border-[#E8ECF5] p-5">
          <div className="text-sm font-semibold text-[#1A1D29] mb-1">Daily Ridership</div>
          <div className="text-xs text-[#5F6678] mb-4">This week vs last week</div>
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={ridershipData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="ag1" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#5B6CFF" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#5B6CFF" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#F0F2F9" vertical={false} />
              <XAxis dataKey="day" tick={{ fontSize: 11, fill: "#9DA8C7" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "#9DA8C7" }} axisLine={false} tickLine={false} tickFormatter={v => `${(v/1000).toFixed(0)}k`} />
              <Tooltip formatter={(v: any) => [`${(v/1000).toFixed(1)}k`, "Passengers"]} contentStyle={{ borderRadius: 12, border: "1px solid #E8ECF5", fontSize: 12 }} />
              <Area type="monotone" dataKey="passengers" stroke="#5B6CFF" strokeWidth={2.5} fill="url(#ag1)" dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Peak hours bar */}
        <div className="bg-white rounded-2xl border border-[#E8ECF5] p-5">
          <div className="text-sm font-semibold text-[#1A1D29] mb-1">Peak Hour Distribution</div>
          <div className="text-xs text-[#5F6678] mb-4">Passengers per hour today</div>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={peakHourData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }} barSize={12}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F0F2F9" vertical={false} />
              <XAxis dataKey="hour" tick={{ fontSize: 10, fill: "#9DA8C7" }} axisLine={false} tickLine={false} interval={1} />
              <YAxis tick={{ fontSize: 10, fill: "#9DA8C7" }} axisLine={false} tickLine={false} tickFormatter={v => `${(v/1000).toFixed(0)}k`} />
              <Tooltip formatter={(v: any) => [`${(v/1000).toFixed(1)}k`, "Passengers"]} contentStyle={{ borderRadius: 12, border: "1px solid #E8ECF5", fontSize: 12 }} />
              <Bar dataKey="v" fill="#5B6CFF" radius={[4, 4, 0, 0]}>
                {peakHourData.map((e, i) => <Cell key={i} fill={e.v > 10000 ? "#5B6CFF" : "#C7CEFF"} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* Route performance */}
        <div className="bg-white rounded-2xl border border-[#E8ECF5] p-5">
          <div className="text-sm font-semibold text-[#1A1D29] mb-4">Route Health Scores</div>
          <div className="flex flex-col gap-3">
            {ROUTES.map(r => (
              <div key={r.id} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-xs flex-shrink-0"
                  style={{ background: r.healthScore >= 80 ? "#5B6CFF" : r.healthScore >= 60 ? "#F4B400" : "#EF4444" }}>
                  {r.id}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-medium text-[#1A1D29] truncate mb-1">{r.name}</div>
                  <HealthBar score={r.healthScore} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Delay trends */}
        <div className="bg-white rounded-2xl border border-[#E8ECF5] p-5">
          <div className="text-sm font-semibold text-[#1A1D29] mb-1">Delay Trend</div>
          <div className="text-xs text-[#5F6678] mb-4">Average delay today (minutes)</div>
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={delayTrendData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F0F2F9" vertical={false} />
              <XAxis dataKey="t" tick={{ fontSize: 10, fill: "#9DA8C7" }} axisLine={false} tickLine={false} interval={2} />
              <YAxis tick={{ fontSize: 10, fill: "#9DA8C7" }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #E8ECF5", fontSize: 12 }} />
              <Line type="monotone" dataKey="delay" stroke="#EF4444" strokeWidth={2.5} dot={false} activeDot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}

// ─── Settings Screen ──────────────────────────────────────────────────────────

function SettingsScreen() {
  const [notifs, setNotifs] = useState({ critical: true, warnings: true, ai: true, email: false })
  const [theme, setTheme] = useState("light")

  const Section = ({ title, children }: { title: string, children: React.ReactNode }) => (
    <div className="bg-white rounded-2xl border border-[#E8ECF5] overflow-hidden">
      <div className="px-6 py-4 border-b border-[#E8ECF5]">
        <div className="text-sm font-semibold text-[#1A1D29]">{title}</div>
      </div>
      <div className="p-6">{children}</div>
    </div>
  )

  const Toggle = ({ value, onChange }: { value: boolean, onChange: () => void }) => (
    <button onClick={onChange} className={`w-10 h-6 rounded-full transition-all duration-200 relative flex-shrink-0 ${value ? "bg-[#5B6CFF]" : "bg-[#CBD3E8]"}`}>
      <div className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow-sm transition-all duration-200 ${value ? "left-5" : "left-1"}`} />
    </button>
  )

  return (
    <div className="p-6 flex flex-col gap-5 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-[#1A1D29]">Settings</h1>
        <p className="text-sm text-[#5F6678] mt-0.5">Operator preferences and account configuration</p>
      </div>

      {/* Profile */}
      <Section title="Operator Profile">
        <div className="flex items-center gap-4 mb-5">
          <div className="w-14 h-14 rounded-2xl bg-[#EEF0FF] flex items-center justify-center">
            <User size={24} className="text-[#5B6CFF]" />
          </div>
          <div>
            <div className="text-base font-bold text-[#1A1D29]">Arjun Mehta</div>
            <div className="text-sm text-[#5F6678]">Senior Network Operator · OPS-00147</div>
            <div className="text-xs text-[#5B6CFF] mt-0.5">arjun.mehta@bmtc.gov.in</div>
          </div>
        </div>
        <button className="px-4 py-2 rounded-xl text-sm border border-[#E8ECF5] text-[#5F6678] hover:bg-[#F0F2F9] transition-colors">Edit Profile</button>
      </Section>

      {/* Notifications */}
      <Section title="Notification Preferences">
        <div className="flex flex-col gap-4">
          {[
            { key: "critical", label: "Critical alerts", sub: "Breakdowns, emergencies" },
            { key: "warnings", label: "Warning alerts", sub: "Delays, high occupancy" },
            { key: "ai", label: "AI recommendations", sub: "Suggested operator actions" },
            { key: "email", label: "Email digests", sub: "Daily summary reports" },
          ].map(item => (
            <div key={item.key} className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium text-[#1A1D29]">{item.label}</div>
                <div className="text-xs text-[#5F6678]">{item.sub}</div>
              </div>
              <Toggle value={notifs[item.key as keyof typeof notifs]} onChange={() => setNotifs(n => ({ ...n, [item.key]: !n[item.key as keyof typeof n] }))} />
            </div>
          ))}
        </div>
      </Section>

      {/* Map preferences */}
      <Section title="Map Preferences">
        <div className="flex flex-col gap-3">
          {["Show bus stop labels", "Show route numbers on map", "Animate bus movement", "Show traffic layer by default"].map(pref => (
            <div key={pref} className="flex items-center justify-between">
              <span className="text-sm text-[#1A1D29]">{pref}</span>
              <Toggle value={true} onChange={() => {}} />
            </div>
          ))}
        </div>
      </Section>

      {/* Security */}
      <Section title="Security">
        <div className="flex flex-col gap-3">
          {[
            { icon: Lock, label: "Change Password", action: "Update" },
            { icon: Shield, label: "Two-Factor Authentication", action: "Enabled" },
          ].map(item => (
            <div key={item.label} className="flex items-center justify-between py-1">
              <div className="flex items-center gap-3">
                <item.icon size={15} className="text-[#5F6678]" />
                <span className="text-sm text-[#1A1D29]">{item.label}</span>
              </div>
              <button className={`text-xs font-medium px-3 py-1.5 rounded-lg ${item.action === "Enabled" ? "bg-emerald-50 text-emerald-700" : "border border-[#E8ECF5] text-[#5F6678] hover:bg-[#F0F2F9]"} transition-colors`}>
                {item.action}
              </button>
            </div>
          ))}
        </div>
      </Section>

      <div className="text-xs text-[#C0C7D8] text-center">Raah Transit Intelligence Platform v3.4.1 · © 2025 BMTC · Licensed</div>
    </div>
  )
}

// ─── App ──────────────────────────────────────────────────────────────────────

export default function App() {
  const [screen, setScreen] = useState<Screen>("login")
  const [collapsed, setCollapsed] = useState(false)

  if (screen === "login") {
    return <LoginScreen onLogin={() => setScreen("dashboard")} />
  }

  return (
    <div style={{ fontFamily: "'Inter', 'system-ui', sans-serif" }} className="flex h-screen bg-[#F8FAFD] overflow-hidden">
      <Sidebar screen={screen} setScreen={setScreen} collapsed={collapsed} onCollapse={() => setCollapsed(c => !c)} />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <TopBar />
        <div className="flex-1 overflow-auto" style={{ scrollbarWidth: "thin", scrollbarColor: "#E8ECF5 transparent" }}>
          {screen === "dashboard" && <DashboardScreen setScreen={setScreen} />}
          {screen === "map" && <MapScreen />}
          {screen === "routes" && <RoutesScreen setScreen={setScreen} />}
          {screen === "alerts" && <AlertsScreen setScreen={setScreen} />}
          {screen === "bunching" && <BunchingScreen setScreen={setScreen} />}
          {screen === "ai-rec" && <AIRecScreen setScreen={setScreen} />}
          {screen === "command-sent" && <CommandSentScreen setScreen={setScreen} />}
          {screen === "analytics" && <AnalyticsScreen />}
          {screen === "settings" && <SettingsScreen />}
        </div>
      </div>
    </div>
  )
}
