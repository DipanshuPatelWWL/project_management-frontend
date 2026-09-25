const StatCard = ({ label, value }) => {
    return (
        <div className="relative min-w-0 overflow-hidden p-[21px] bg-[#171b2e] border border-[#282e45] rounded-xl text-left cursor-pointer shadow-[0_2px_10px_rgba(0,0,0,0.25)] hover:-translate-y-1 hover:border-[#30364d] hover:shadow-[0_16px_34px_rgba(0,0,0,0.45)] transition-all duration-200 before:content-[''] before:absolute before:top-0 before:left-0 before:w-full before:h-[3px] before:bg-[#5865f2] before:scale-x-[0.3] before:origin-left before:transition-transform before:duration-300 hover:before:scale-x-100">
            <p className="mb-2 text-[29px] leading-none font-bold text-[#5865f2] tracking-[-0.8px] tabular-nums">{value ?? "—"}</p>
            <p className="text-[13px] font-medium text-[#8f9bb3] m-0">{label}</p>
        </div>
    );
};

export default StatCard;