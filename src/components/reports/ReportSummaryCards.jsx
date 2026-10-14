import React from "react";

const COLOR_MAP = {
    blue: {
        bg: "bg-[#101b38]",
        border: "border-[#1e3a8a]/40",
        text: "text-[#60a5fa]",
        iconBg: "bg-[#1e3a8a]/30",
        glow: "shadow-[0_0_20px_rgba(37,99,235,0.15)]",
    },
    green: {
        bg: "bg-[#0b241b]",
        border: "border-[#065f46]/40",
        text: "text-[#34d399]",
        iconBg: "bg-[#065f46]/30",
        glow: "shadow-[0_0_20px_rgba(5,150,105,0.15)]",
    },
    purple: {
        bg: "bg-[#1f1538]",
        border: "border-[#581c87]/40",
        text: "text-[#c084fc]",
        iconBg: "bg-[#581c87]/30",
        glow: "shadow-[0_0_20px_rgba(147,51,234,0.15)]",
    },
    red: {
        bg: "bg-[#2b1119]",
        border: "border-[#881337]/40",
        text: "text-[#f87171]",
        iconBg: "bg-[#881337]/30",
        glow: "shadow-[0_0_20px_rgba(225,29,72,0.15)]",
    },
    amber: {
        bg: "bg-[#271d0e]",
        border: "border-[#78350f]/40",
        text: "text-[#fbbf24]",
        iconBg: "bg-[#78350f]/30",
        glow: "shadow-[0_0_20px_rgba(217,119,6,0.15)]",
    },
    cyan: {
        bg: "bg-[#0b232e]",
        border: "border-[#155e75]/40",
        text: "text-[#38bdf8]",
        iconBg: "bg-[#155e75]/30",
        glow: "shadow-[0_0_20px_rgba(8,145,178,0.15)]",
    },
};

const ReportSummaryCards = ({ cards = [] }) => {
    if (!cards || cards.length === 0) return null;

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {cards.map((card, idx) => {
                const colorConfig = COLOR_MAP[card.color] || COLOR_MAP.blue;

                return (
                    <div
                        key={card.id || card.title || idx}
                        className={`relative p-5 rounded-2xl border transition-all duration-200 hover:-translate-y-0.5 ${colorConfig.bg} ${colorConfig.border} ${colorConfig.glow}`}
                    >
                        <div className="flex items-start justify-between gap-3">
                            <div>
                                <span className="text-[12px] font-semibold text-[#94a3b8] uppercase tracking-wider">
                                    {card.title}
                                </span>
                                <div className="text-[28px] font-bold text-white mt-1 leading-tight tracking-tight">
                                    {card.value ?? 0}
                                </div>
                            </div>

                            {card.icon && (
                                <div
                                    className={`w-11 h-11 rounded-xl flex items-center justify-center text-xl shrink-0 ${colorConfig.iconBg} ${colorConfig.text}`}
                                >
                                    {card.icon}
                                </div>
                            )}
                        </div>

                        {card.progress !== undefined && (
                            <div className="mt-3">
                                <div className="flex items-center justify-between text-[11px] mb-1">
                                    <span className="text-[#94a3b8]">Completion Rate</span>
                                    <span className={`font-bold ${colorConfig.text}`}>
                                        {card.progress}%
                                    </span>
                                </div>
                                <div className="w-full h-1.5 rounded-full bg-[#1e293b] overflow-hidden">
                                    <div
                                        className={`h-full rounded-full transition-all duration-500 bg-gradient-to-r from-blue-500 to-indigo-500`}
                                        style={{ width: `${Math.min(100, Math.max(0, card.progress))}%` }}
                                    />
                                </div>
                            </div>
                        )}

                        {card.subtext && (
                            <div className="mt-3 pt-2.5 border-t border-[#334155]/30 text-[12px] text-[#94a3b8] flex items-center justify-between">
                                <span>{card.subtext}</span>
                                {card.badge && (
                                    <span
                                        className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${colorConfig.iconBg} ${colorConfig.text}`}
                                    >
                                        {card.badge}
                                    </span>
                                )}
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
};

export default ReportSummaryCards;
