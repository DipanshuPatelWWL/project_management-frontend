import React from "react";
import { FiSearch, FiHelpCircle } from "react-icons/fi";

const SearchEmptyState = ({ query }) => {
    return (
        <div className="bg-[#171b2e] border border-[#282e45] rounded-[10px] p-10 text-center max-w-lg mx-auto shadow-sm">
            <div className="w-14 h-14 mx-auto mb-4 rounded-xl bg-[#222942] flex items-center justify-center text-[#5865f2]">
                <FiSearch className="w-7 h-7" />
            </div>

            <h3 className="text-[16px] font-bold text-white mb-2">
                No matching results found
            </h3>

            {query ? (
                <p className="text-[13px] text-[#8f9bb3] mb-6">
                    We couldn't find anything matching <span className="text-[#5865f2] font-semibold">"{query}"</span>.
                </p>
            ) : (
                <p className="text-[13px] text-[#8f9bb3] mb-6">
                    Start typing to search tasks, bugs, projects, and team members across your workspace.
                </p>
            )}

            <div className="bg-[#111422] border border-[#282e45] rounded-lg p-4 text-left space-y-2 text-[12px]">
                <div className="flex items-center gap-2 text-[#dfe3ee] font-semibold text-[11px] uppercase tracking-wider">
                    <FiHelpCircle className="w-3.5 h-3.5 text-[#5865f2]" /> Search Tips:
                </div>
                <ul className="list-disc list-inside space-y-1 text-[#8f9bb3] text-[12px]">
                    <li>Check your spelling for any typos.</li>
                    <li>Search by Task or Project title (e.g., <code className="text-[#dfe3ee]">Auth</code>, <code className="text-[#dfe3ee]">Payment</code>).</li>
                    <li>Search by sequential ID (e.g., <code className="text-[#dfe3ee]">BUG001</code>, <code className="text-[#dfe3ee]">PRJ001</code>).</li>
                    <li>Search by teammate's first name, last name, or email.</li>
                </ul>
            </div>
        </div>
    );
};

export default SearchEmptyState;
