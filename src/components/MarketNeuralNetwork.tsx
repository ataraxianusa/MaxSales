import React from "react";

/**
 * Market Neural Network — Signature Element
 * Visual metaphor: Nodes = Market stalls, Connections = Sales channels
 * Batik pattern lines morph into neural network connections
 */
export default function MarketNeuralNetwork() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
      <svg
        viewBox="0 0 1200 800"
        className="w-full h-full opacity-[0.04] dark:opacity-[0.06]"
        preserveAspectRatio="xMidYMid slice"
      >
        <defs>
          <linearGradient id="conn-grad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#1E3A8A" />
            <stop offset="50%" stopColor="#8B5CF6" />
            <stop offset="100%" stopColor="#1E3A8A" />
          </linearGradient>
          <filter id="node-glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>

        {/* Connection lines */}
        <g stroke="url(#conn-grad)" strokeWidth="1" fill="none" opacity="0.6">
          <line x1="100" y1="200" x2="350" y2="180" className="animate-node-connection" />
          <line x1="350" y1="180" x2="600" y2="220" className="animate-node-connection" style={{ animationDelay: "0.3s" }} />
          <line x1="600" y1="220" x2="850" y2="190" className="animate-node-connection" style={{ animationDelay: "0.6s" }} />
          <line x1="850" y1="190" x2="1100" y2="210" className="animate-node-connection" style={{ animationDelay: "0.9s" }} />
          <line x1="150" y1="400" x2="400" y2="380" className="animate-node-connection" style={{ animationDelay: "0.2s" }} />
          <line x1="400" y1="380" x2="650" y2="420" className="animate-node-connection" style={{ animationDelay: "0.5s" }} />
          <line x1="650" y1="420" x2="900" y2="390" className="animate-node-connection" style={{ animationDelay: "0.8s" }} />
          <line x1="200" y1="600" x2="450" y2="580" className="animate-node-connection" style={{ animationDelay: "0.4s" }} />
          <line x1="450" y1="580" x2="700" y2="620" className="animate-node-connection" style={{ animationDelay: "0.7s" }} />
          <line x1="700" y1="620" x2="950" y2="590" className="animate-node-connection" style={{ animationDelay: "1.0s" }} />
          <line x1="350" y1="180" x2="400" y2="380" className="animate-node-connection" style={{ animationDelay: "0.4s" }} />
          <line x1="600" y1="220" x2="650" y2="420" className="animate-node-connection" style={{ animationDelay: "0.7s" }} />
          <line x1="850" y1="190" x2="900" y2="390" className="animate-node-connection" style={{ animationDelay: "1.0s" }} />
          <line x1="100" y1="200" x2="400" y2="380" className="animate-node-connection" style={{ animationDelay: "0.2s" }} />
          <line x1="350" y1="180" x2="650" y2="420" className="animate-node-connection" style={{ animationDelay: "0.5s" }} />
          <line x1="600" y1="220" x2="900" y2="390" className="animate-node-connection" style={{ animationDelay: "0.8s" }} />
          <line x1="400" y1="380" x2="700" y2="620" className="animate-node-connection" style={{ animationDelay: "0.7s" }} />
        </g>

        {/* Nodes — Market stalls */}
        <g filter="url(#node-glow)">
          <circle cx="100" cy="200" r="6" fill="#8B5CF6" className="animate-neural-pulse" />
          <circle cx="350" cy="180" r="8" fill="#8B5CF6" className="animate-neural-pulse" style={{ animationDelay: "0.5s" }} />
          <circle cx="600" cy="220" r="10" fill="#8B5CF6" className="animate-neural-pulse" style={{ animationDelay: "1s" }} />
          <circle cx="850" cy="190" r="7" fill="#8B5CF6" className="animate-neural-pulse" style={{ animationDelay: "1.5s" }} />
          <circle cx="1100" cy="210" r="6" fill="#8B5CF6" className="animate-neural-pulse" style={{ animationDelay: "2s" }} />
          <circle cx="150" cy="400" r="5" fill="#06B6D4" className="animate-neural-pulse" style={{ animationDelay: "0.3s" }} />
          <circle cx="400" cy="380" r="9" fill="#8B5CF6" className="animate-neural-pulse" style={{ animationDelay: "0.8s" }} />
          <circle cx="650" cy="420" r="7" fill="#06B6D4" className="animate-neural-pulse" style={{ animationDelay: "1.3s" }} />
          <circle cx="900" cy="390" r="8" fill="#8B5CF6" className="animate-neural-pulse" style={{ animationDelay: "1.8s" }} />
          <circle cx="200" cy="600" r="6" fill="#8B5CF6" className="animate-neural-pulse" style={{ animationDelay: "0.4s" }} />
          <circle cx="450" cy="580" r="8" fill="#06B6D4" className="animate-neural-pulse" style={{ animationDelay: "0.9s" }} />
          <circle cx="700" cy="620" r="10" fill="#8B5CF6" className="animate-neural-pulse" style={{ animationDelay: "1.4s" }} />
          <circle cx="950" cy="590" r="7" fill="#06B6D4" className="animate-neural-pulse" style={{ animationDelay: "1.9s" }} />
        </g>

        {/* Hexagonal batik pattern */}
        <g opacity="0.15" fill="none" stroke="#1E3A8A" strokeWidth="0.5">
          <polygon points="200,100 230,83 260,100 260,134 230,151 200,134" />
          <polygon points="500,150 530,133 560,150 560,184 530,201 500,184" />
          <polygon points="800,120 830,103 860,120 860,154 830,171 800,154" />
          <polygon points="300,350 330,333 360,350 360,384 330,401 300,384" />
          <polygon points="600,300 630,283 660,300 660,334 630,351 600,334" />
          <polygon points="900,350 930,333 960,350 960,384 930,401 900,384" />
          <polygon points="150,550 180,533 210,550 210,584 180,601 150,584" />
          <polygon points="450,500 480,483 510,500 510,534 480,551 450,534" />
          <polygon points="750,550 780,533 810,550 810,584 780,601 750,584" />
        </g>
      </svg>
    </div>
  );
}
