import React from "react";

const COLOR_MAP = {
    blue: {
        text: "text-[#60a5fa]",
        iconBg: "bg-[#1e3a8a]/20 border border-[#1e3a8a]/40",
    },
    green: {
        text: "text-[#34d399]",
        iconBg: "bg-[#065f46]/20 border border-[#065f46]/40",
    },
    purple: {
        text: "text-[#c084fc]",
        iconBg: "bg-[#581c87]/20 border border-[#581c87]/40",
    },
    red: {
        text: "text-[#f87171]",
        iconBg: "bg-[#881337]/20 border border-[#881337]/40",
    },
    amber: {
        text: "text-[#fbbf24]",
        iconBg: "bg-[#78350f]/20 border border-[#78350f]/40",
    },
    cyan: {
        text: "text-[#38bdf8]",
        iconBg: "bg-[#155e75]/20 border border-[#155e75]/40",
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
                        className="relative p-5 rounded-[10px] bg-[#171b2e] border border-[#282e45] hover:border-[#384160] transition-colors shadow-sm"
                    >
                        <div className="flex items-start justify-between gap-3">
                            <div>
                                <span className="text-[12px] font-semibold text-[#8f9bb3] uppercase tracking-wider">
                                    {card.title}
                                </span>
                                <div className="text-[26px] font-bold text-white mt-1 leading-tight tracking-tight">
                                    {card.value ?? 0}
                                </div>
                            </div>

                            {card.icon && (
                                <div
                                    className={`w-11 h-11 rounded-lg flex items-center justify-center text-xl shrink-0 ${colorConfig.iconBg} ${colorConfig.text}`}
                                >
                                    {card.icon}
                                </div>
                            )}
                        </div>

                        {card.progress !== undefined && (
                            <div className="mt-3">
                                <div className="flex items-center justify-between text-[11px] mb-1">
                                    <span className="text-[#8f9bb3]">Completion Rate</span>
                                    <span className={`font-bold ${colorConfig.text}`}>
                                        {card.progress}%
                                    </span>
                                </div>
                                <div className="w-full h-1.5 rounded-full bg-[#111422] overflow-hidden">
                                    <div
                                        className="h-full rounded-full transition-all duration-500 bg-[#5865f2]"
                                        style={{ width: `${Math.min(100, Math.max(0, card.progress))}%` }}
                                    />
                                </div>
                            </div>
                        )}

                        {card.subtext && (
                            <div className="mt-3 pt-2.5 border-t border-[#282e45] text-[12px] text-[#8f9bb3] flex items-center justify-between">
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
