import React from "react";
import SearchResultItem from "./SearchResultItem";
import SearchEmptyState from "./SearchEmptyState";

const CATEGORY_LABELS = {
    tasks: "Tasks",
    bugs: "Bugs",
    projects: "Projects",
    users: "Team Members",
    clients: "Clients",
    companies: "Companies",
};

const SearchResultsList = ({
    data = {},
    activeCategory = "all",
    query = "",
    onSelect,
}) => {
    const categories = ["tasks", "bugs", "projects", "users", "clients", "companies"];

    // If specific category is selected
    if (activeCategory !== "all") {
        const items = data[activeCategory] || [];
        if (items.length === 0) {
            return (
                <div className="bg-[#171b2e] border border-[#282e45] rounded-[10px] p-8 text-center text-[#8f9bb3] text-[13px]">
                    No {CATEGORY_LABELS[activeCategory] || activeCategory} match "{query}".
                </div>
            );
        }

        return (
            <div className="space-y-3">
                {items.map((item) => (
                    <SearchResultItem
                        key={item._id}
                        item={item}
                        category={activeCategory}
                        onSelect={onSelect}
                    />
                ))}
            </div>
        );
    }

    // All categories grouped
    let totalItems = 0;
    categories.forEach((cat) => {
        totalItems += (data[cat] || []).length;
    });

    if (totalItems === 0) {
        return <SearchEmptyState query={query} />;
    }

    return (
        <div className="space-y-6">
            {categories.map((cat) => {
                const items = data[cat] || [];
                if (items.length === 0) return null;

                return (
                    <div key={cat} className="space-y-3">
                        <div className="flex items-center justify-between text-[12px] font-bold text-[#8f9bb3] uppercase tracking-[0.06em] px-1">
                            <span>{CATEGORY_LABELS[cat] || cat}</span>
                            <span className="text-[11px] font-normal text-[#7f8aa5]">
                                {items.length} {items.length === 1 ? "match" : "matches"}
                            </span>
                        </div>

                        <div className="space-y-2.5">
                            {items.map((item) => (
                                <SearchResultItem
                                    key={item._id}
                                    item={item}
                                    category={cat}
                                    onSelect={onSelect}
                                />
                            ))}
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export default SearchResultsList;
