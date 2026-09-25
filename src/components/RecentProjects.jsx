import Loader from "./Loader";

const RecentProjects = ({ projects, loading, error }) => {
    if (loading) return <Loader size="sm" />;
    if (error) {
        return (
            <p className="flex items-center gap-2.5 my-4 py-3.5 px-[18px] text-[#ff9da9] text-[13px] font-semibold bg-[rgba(220,38,38,0.12)] border border-[rgba(220,38,38,0.35)] border-l-4 border-l-[#a83d4c] rounded-[10px]">
                {error}
            </p>
        );
    }
    if (!projects || projects.length === 0) {
        return (
            <p className="p-[55px_20px] text-center text-[#7f8aa5] bg-[#171b2e] rounded-xl border border-[#282e45] m-0">
                No projects found.
            </p>
        );
    }

    return (
        <div className="w-full overflow-x-auto">
            <table className="w-full border-separate border-spacing-0 overflow-hidden text-[14px] bg-[#171b2e] border border-[#282e45] rounded-xl shadow-[0_12px_30px_rgba(0,0,0,0.25)]">
                <thead>
                    <tr>
                        <th className="py-[15px] px-[18px] text-left text-[#8f9bb3] text-[11px] font-bold uppercase tracking-[0.08em] bg-[#1c2136] border-b border-[#282e45] whitespace-nowrap hover:text-white transition-colors first:rounded-tl-xl last:rounded-tr-xl">
                            Project Name
                        </th>
                        <th className="py-[15px] px-[18px] text-left text-[#8f9bb3] text-[11px] font-bold uppercase tracking-[0.08em] bg-[#1c2136] border-b border-[#282e45] whitespace-nowrap hover:text-white transition-colors">
                            Status
                        </th>
                        <th className="py-[15px] px-[18px] text-left text-[#8f9bb3] text-[11px] font-bold uppercase tracking-[0.08em] bg-[#1c2136] border-b border-[#282e45] whitespace-nowrap hover:text-white transition-colors">
                            Progress
                        </th>
                        <th className="py-[15px] px-[18px] text-left text-[#8f9bb3] text-[11px] font-bold uppercase tracking-[0.08em] bg-[#1c2136] border-b border-[#282e45] whitespace-nowrap hover:text-white transition-colors first:rounded-tl-xl last:rounded-tr-xl">
                            Deadline
                        </th>
                    </tr>
                </thead>
                <tbody>
                    {projects.map((project, idx) => (
                        <tr
                            key={project._id}
                            className={`bg-[#171b2e] even:bg-[#191d32] hover:bg-[#1f2440] hover:translate-x-[3px] hover:shadow-[inset_4px_0_0_#5865f2] relative z-[1] transition-all duration-200 group ${
                                idx === projects.length - 1 ? "[&>td]:border-b-0" : ""
                            }`}
                        >
                            <td className="py-[15px] px-[18px] text-[#eef1f8] font-semibold border-b border-[#282e45] group-hover:pl-[23px] group-hover:text-[#9fb0ff] transition-all">
                                {project.projectName}
                            </td>
                            <td className="py-[15px] px-[18px] text-[#b7bfd6] border-b border-[#282e45] group-hover:text-[#eef1f8] transition-all">
                                <span className="inline-flex items-center justify-center min-w-[78px] py-1.5 px-3 rounded-full text-[11px] font-bold border capitalize transition-transform hover:-translate-y-0.5 text-[#7fe3a8] bg-[#1c3a2e] border-[#2c5443]">
                                    {project.status}
                                </span>
                            </td>
                            <td className="py-[15px] px-[18px] text-[#b7bfd6] border-b border-[#282e45] group-hover:text-[#eef1f8] transition-all">
                                {project.progress}%
                            </td>
                            <td className="py-[15px] px-[18px] text-[#b7bfd6] border-b border-[#282e45] group-hover:text-[#eef1f8] transition-all">
                                {project.deadline
                                    ? new Date(project.deadline).toLocaleDateString()
                                    : "—"}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default RecentProjects;