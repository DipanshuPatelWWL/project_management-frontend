import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { FiSearch, FiX, FiLoader, FiArrowRight } from "react-icons/fi";
import { searchGlobal } from "../../services/searchService";
import SearchResultItem from "./SearchResultItem";

const GlobalSearch = () => {
    const navigate = useNavigate();
    const [query, setQuery] = useState("");
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [results, setResults] = useState({ data: {}, counts: {} });

    const containerRef = useRef(null);
    const inputRef = useRef(null);
    const debounceTimeoutRef = useRef(null);

    // Escape key closes search dropdown
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === "Escape") {
                setIsOpen(false);
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, []);

    // Click outside to dismiss dropdown
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (containerRef.current && !containerRef.current.contains(e.target)) {
                setIsOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Debounced search
    useEffect(() => {
        if (!query.trim()) {
            setResults({ data: {}, counts: {} });
            setLoading(false);
            return;
        }

        setLoading(true);
        if (debounceTimeoutRef.current) {
            clearTimeout(debounceTimeoutRef.current);
        }

        debounceTimeoutRef.current = setTimeout(async () => {
            try {
                const res = await searchGlobal(query);
                if (res?.success) {
                    setResults({
                        data: res.data || {},
                        counts: res.counts || {},
                    });
                }
            } catch (err) {
                console.error("Search failed:", err);
            } finally {
                setLoading(false);
            }
        }, 280);

        return () => {
            if (debounceTimeoutRef.current) {
                clearTimeout(debounceTimeoutRef.current);
            }
        };
    }, [query]);

    // Handle form submit / pressing Enter
    const handleSubmit = (e) => {
        e.preventDefault();
        if (!query.trim()) return;

        setIsOpen(false);
        navigate(`/search?q=${encodeURIComponent(query.trim())}`);
    };

    const handleClear = () => {
        setQuery("");
        setResults({ data: {}, counts: {} });
        setIsOpen(false);
    };

    const totalMatches = Object.values(results.counts || {}).reduce((acc, c) => acc + (Number(c) || 0), 0);

    return (
        <div ref={containerRef} className="relative w-full max-w-md mx-4">
            {/* Search Input Bar */}
            <form onSubmit={handleSubmit} className="relative flex items-center">
                <FiSearch className="absolute left-3.5 w-4 h-4 text-[#8f9bb3] pointer-events-none" />

                <input
                    ref={inputRef}
                    type="text"
                    value={query}
                    onChange={(e) => {
                        setQuery(e.target.value);
                        setIsOpen(true);
                    }}
                    onFocus={() => setIsOpen(true)}
                    placeholder="Search tasks, bugs, projects, people..."
                    className="w-full bg-[#111422] border border-[#30364d] text-[13px] text-[#dfe3ee] rounded-lg pl-10 pr-20 py-2 outline-none focus:border-[#5865f2] focus:ring-1 focus:ring-[#5865f2] transition placeholder:text-[#5d6785]"
                />

                <div className="absolute right-2.5 flex items-center gap-1.5">
                    {loading ? (
                        <FiLoader className="w-3.5 h-3.5 text-[#5865f2] animate-spin" />
                    ) : query ? (
                        <button
                            type="button"
                            onClick={handleClear}
                            className="p-1 rounded-md text-[#8f9bb3] hover:text-white transition cursor-pointer"
                        >
                            <FiX className="w-3.5 h-3.5" />
                        </button>
                    ) : null}
                </div>
            </form>

            {/* Quick Floating Dropdown */}
            {isOpen && query.trim() && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-[#171b2e] border border-[#30364d] rounded-xl shadow-[0_20px_60px_rgba(0,0,0,0.5)] z-50 overflow-hidden animate-fade-in max-h-[460px] flex flex-col">
                    <div className="p-2.5 overflow-y-auto space-y-3 divide-y divide-[#282e45]">
                        {loading && !totalMatches ? (
                            <div className="py-8 text-center text-[13px] text-[#8f9bb3] flex items-center justify-center gap-2">
                                <FiLoader className="w-4 h-4 text-[#5865f2] animate-spin" />
                                <span>Searching workspace...</span>
                            </div>
                        ) : totalMatches === 0 ? (
                            <div className="py-6 text-center text-[13px] text-[#8f9bb3]">
                                No quick matches found for <strong className="text-white">"{query}"</strong>
                            </div>
                        ) : (
                            <>
                                {/* Tasks preview */}
                                {results.data?.tasks?.length > 0 && (
                                    <div className="pt-2 first:pt-0">
                                        <div className="px-2 pb-1 text-[11px] font-bold uppercase tracking-wider text-[#8f9bb3]">
                                            Tasks ({results.data.tasks.length})
                                        </div>
                                        {results.data.tasks.slice(0, 3).map((item) => (
                                            <SearchResultItem
                                                key={item._id}
                                                item={item}
                                                category="tasks"
                                                compact
                                                onSelect={() => setIsOpen(false)}
                                            />
                                        ))}
                                    </div>
                                )}

                                {/* Bugs preview */}
                                {results.data?.bugs?.length > 0 && (
                                    <div className="pt-2 first:pt-0">
                                        <div className="px-2 pb-1 text-[11px] font-bold uppercase tracking-wider text-[#8f9bb3]">
                                            Bugs ({results.data.bugs.length})
                                        </div>
                                        {results.data.bugs.slice(0, 3).map((item) => (
                                            <SearchResultItem
                                                key={item._id}
                                                item={item}
                                                category="bugs"
                                                compact
                                                onSelect={() => setIsOpen(false)}
                                            />
                                        ))}
                                    </div>
                                )}

                                {/* Projects preview */}
                                {results.data?.projects?.length > 0 && (
                                    <div className="pt-2 first:pt-0">
                                        <div className="px-2 pb-1 text-[11px] font-bold uppercase tracking-wider text-[#8f9bb3]">
                                            Projects ({results.data.projects.length})
                                        </div>
                                        {results.data.projects.slice(0, 3).map((item) => (
                                            <SearchResultItem
                                                key={item._id}
                                                item={item}
                                                category="projects"
                                                compact
                                                onSelect={() => setIsOpen(false)}
                                            />
                                        ))}
                                    </div>
                                )}

                                {/* People preview */}
                                {results.data?.users?.length > 0 && (
                                    <div className="pt-2 first:pt-0">
                                        <div className="px-2 pb-1 text-[11px] font-bold uppercase tracking-wider text-[#8f9bb3]">
                                            People ({results.data.users.length})
                                        </div>
                                        {results.data.users.slice(0, 3).map((item) => (
                                            <SearchResultItem
                                                key={item._id}
                                                item={item}
                                                category="users"
                                                compact
                                                onSelect={() => setIsOpen(false)}
                                            />
                                        ))}
                                    </div>
                                )}
                            </>
                        )}
                    </div>

                    {/* Footer - View All Results */}
                    <button
                        type="button"
                        onClick={handleSubmit}
                        className="w-full flex items-center justify-between px-4 py-2.5 bg-[#111422] border-t border-[#282e45] text-[12px] font-semibold text-[#818cf8] hover:text-white hover:bg-[#1f243d] transition cursor-pointer"
                    >
                        <span>
                            Press <kbd className="px-1.5 py-0.5 bg-[#171b2e] rounded text-[10px] text-[#dfe3ee] border border-[#30364d]">Enter</kbd> to see all {totalMatches} results
                        </span>
                        <FiArrowRight className="w-3.5 h-3.5" />
                    </button>
                </div>
            )}
        </div>
    );
};

export default GlobalSearch;
