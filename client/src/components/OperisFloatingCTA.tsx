/**
 * OperisFloatingCTA — Botão flutuante fixo OPERIS IA
 * Visível em TODAS as páginas do site público (regra inegociável).
 * Posicionado no canto inferior esquerdo, acima do nível do WhatsApp float.
 * Design: escudo vermelho + texto "OPERIS IA" + pulsação sutil para chamar atenção.
 */
import { useState } from "react";
import { Link } from "wouter";

export default function OperisFloatingCTA() {
  const [hovered, setHovered] = useState(false);

  return (
    <>
      {/* Keyframes de pulsação */}
      <style>{`
        @keyframes operis-pulse {
          0%, 100% { box-shadow: 0 4px 20px rgba(200,16,46,0.55), 0 0 0 0 rgba(200,16,46,0.35); }
          50%       { box-shadow: 0 6px 28px rgba(200,16,46,0.70), 0 0 0 10px rgba(200,16,46,0); }
        }
        @keyframes operis-badge-pulse {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0.7; }
        }
        .operis-float-btn {
          position: fixed;
          bottom: 1.75rem;
          left: 1.75rem;
          z-index: 9998;
          display: flex;
          align-items: center;
          gap: 0;
          text-decoration: none;
          cursor: pointer;
          border: none;
          background: transparent;
          padding: 0;
        }
        .operis-float-pill {
          display: flex;
          align-items: center;
          gap: 0;
          background: #111111;
          border: 1.5px solid rgba(200,16,46,0.5);
          border-radius: 50px;
          overflow: hidden;
          transition: all 0.25s ease;
          animation: operis-pulse 2.8s ease-in-out infinite;
        }
        .operis-float-pill:hover {
          border-color: #C8102E;
          transform: translateY(-2px);
          animation: none;
          box-shadow: 0 8px 32px rgba(200,16,46,0.65);
        }
        .operis-float-icon {
          width: 48px;
          height: 48px;
          background: #C8102E;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          border-radius: 50px 0 0 50px;
        }
        .operis-float-text {
          padding: 0 14px 0 10px;
          display: flex;
          flex-direction: column;
          gap: 1px;
        }
        .operis-float-label {
          font-family: 'Barlow Condensed', 'Barlow', sans-serif;
          font-weight: 800;
          font-size: 13px;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: #ffffff;
          line-height: 1.1;
          display: flex;
          align-items: center;
          gap: 5px;
        }
        .operis-float-badge {
          font-family: 'Barlow Condensed', 'Barlow', sans-serif;
          font-weight: 700;
          font-size: 8px;
          color: #C8102E;
          border: 1px solid #C8102E;
          padding: 1px 4px;
          letter-spacing: 0.06em;
          animation: operis-badge-pulse 2.8s ease-in-out infinite;
        }
        .operis-float-sub {
          font-family: 'Barlow Condensed', 'Barlow', sans-serif;
          font-weight: 500;
          font-size: 9px;
          letter-spacing: 0.10em;
          text-transform: uppercase;
          color: rgba(255,255,255,0.45);
          line-height: 1.2;
          white-space: nowrap;
        }
        /* Mobile: apenas ícone, sem texto */
        @media (max-width: 640px) {
          .operis-float-text { display: none; }
          .operis-float-icon { border-radius: 50%; width: 52px; height: 52px; }
          .operis-float-pill { border-radius: 50%; }
        }
      `}</style>

      <Link href="/app/login" className="operis-float-btn" title="Acessar OPERIS IA — Inspeção e Laudos Inteligentes">
        <div
          className="operis-float-pill"
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
        >
          {/* Ícone escudo */}
          <div className="operis-float-icon">
            <svg width="26" height="29" viewBox="0 0 100 110" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M50 4 L92 22 L92 58 C92 80 72 98 50 106 C28 98 8 80 8 58 L8 22 Z" fill="rgba(255,255,255,0.15)" />
              <path d="M50 12 L85 27 L85 57 C85 76 68 92 50 99 C32 92 15 76 15 57 L15 27 Z" fill="none" stroke="rgba(255,255,255,0.30)" strokeWidth="2" />
              <text x="50" y="68" textAnchor="middle" fontFamily="'Barlow Condensed', sans-serif" fontWeight="900" fontSize="36" fill="#ffffff" letterSpacing="-1">OP</text>
            </svg>
          </div>

          {/* Texto (oculto em mobile) */}
          <div className="operis-float-text">
            <div className="operis-float-label">
              OPERIS
              <span className="operis-float-badge">IA</span>
            </div>
            <div className="operis-float-sub">
              {hovered ? "Acessar plataforma →" : "Inspeção · Laudos · IA"}
            </div>
          </div>
        </div>
      </Link>
    </>
  );
}
