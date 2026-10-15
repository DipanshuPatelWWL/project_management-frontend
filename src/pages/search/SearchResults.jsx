import React, { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { FiSearch, FiLayers, FiX } from "react-icons/fi";
import { searchGlobal } from "../../services/searchService";
import SearchCategoryTabs from "../../components/search/SearchCategoryTabs";
import SearchResultsList from "../../components/search/SearchResultsList";
import SearchEmptyState from "../../components/search/SearchEmptyState";
import Loader from "../../components/Loader";

const SearchResults = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const queryParam = searchParams.get("q") || "";

    const [searchInput, setSearchInput] = useState(queryParam);
    const [activeCategory, setActiveCategory] = useState("all");
    const [loading, setLoading] = useState(false);
    const [results, setResults] = useState({ data: {}, counts: {} });

    // Synchronize local input if URL param changes
    useEffect(() => {
        setSearchInput(queryParam);
    }, [queryParam]);

    const performSearch = useCallback(async (q) => {
        if (!q.trim()) {
            setResults({ data: {}, counts: {} });
            return;
        }

        try {
            setLoading(true);
            const res = await searchGlobal(q);
            if (res?.success) {
                setResults({
                    data: res.data || {},
                    counts: res.counts || {},
                });
            } else {
                setResults({ data: {}, counts: {} });
            }
        } catch (err) {
            console.error("Search failed:", err);
            setResults({ data: {}, counts: {} });
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (queryParam) {
            performSearch(queryParam);
        }
    }, [queryParam, performSearch]);

    const handleFormSubmit = (e) => {
        e.preventDefault();
        const trimmed = searchInput.trim();
        if (trimmed) {
            setSearchParams({ q: trimmed });
        }
    };

    const handleClear = () => {
        setSearchInput("");
        setSearchParams({});
        setResults({ data: {}, counts: {} });
    };

    const totalMatches = Object.values(results.counts || {}).reduce(
        (acc, count) => acc + (Number(count) || 0),
        0
    );

    const countsWithTotal = {
        ...(results.counts || {}),
        total: totalMatches,
    };

    return (
        <div className="w-full p-[30px] max-md:p-5 box-border">
            {/* Page Header */}
            <div className="mb-6">
                <h1 className="m-0 text-[28px] font-bold text-white tracking-normal">
                    Search Workspace
                </h1>
                <p className="m-0 mt-1.5 text-[#8f9bb3] text-[14px]">
                    {queryParam ? (
                        <>
                            Showing results for <span className="text-white font-semibold">"{queryParam}"</span> —{" "}
                            <span className="text-[#5865f2] font-semibold">{totalMatches} items found</span>
                        </>
                    ) : (
                        "Search projects, tasks, bugs, and teammates across your organization"
                    )}
                </p>
            </div>

            {/* In-Page Search Bar */}
            <div className="bg-[#171b2e] border border-[#282e45] rounded-[10px] p-5 mb-6">
                <form onSubmit={handleFormSubmit} className="relative flex items-center gap-3 max-sm:flex-col">
                    <div className="relative flex-1 w-full">
                        <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8f9bb3] pointer-events-none" />
                        <input
                            type="text"
                            value={searchInput}
                            onChange={(e) => setSearchInput(e.target.value)}
                            placeholder="Search by name, ID (e.g. BUG001, PRJ001), description, or email..."
                            className="w-full h-[42px] pl-10 pr-10 border border-[#30364d] rounded-lg bg-[#111422] text-white text-[14px] focus:border-[#5865f2] outline-none transition placeholder:text-[#5d6785]"
                        />
                        {searchInput && (
                            <button
                                type="button"
                                onClick={handleClear}
                                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-md text-[#8f9bb3] hover:text-white transition cursor-pointer"
                            >
                                <FiX className="w-4 h-4" />
                            </button>
                        )}
                    </div>

                    <button
                        type="submit"
                        className="h-[42px] px-6 bg-[#5865f2] hover:bg-[#4752c4] text-white text-[14px] font-semibold rounded-lg transition-colors cursor-pointer flex items-center justify-center shrink-0 max-sm:w-full"
                    >
                        Search
                    </button>
                </form>
            </div>

            {/* Category Tabs */}
            {queryParam && (
                <div className="mb-6">
                    <SearchCategoryTabs
                        activeCategory={activeCategory}
                        onSelectCategory={setActiveCategory}
                        counts={countsWithTotal}
                    />
                </div>
            )}

            {/* Results or Loading */}
            {loading ? (
                <div className="py-24 flex justify-center items-center">
                    <Loader size="lg" text="Searching workspace..." />
                </div>
            ) : !queryParam ? (
                <SearchEmptyState />
            ) : (
                <SearchResultsList
                    data={results.data}
                    activeCategory={activeCategory}
                    query={queryParam}
                />
            )}
        </div>
    );
};

export default SearchResults;
