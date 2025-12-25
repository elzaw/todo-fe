type Props = React.SelectHTMLAttributes<HTMLSelectElement> & {
    label?: string;
    error?: string;
};

export default function Select({ label, error, className = "", children, ...props }: Props) {
    return (
        <label className="block">
            {label && <div className="mb-1 text-sm font-medium">{label}</div>}
            <select
                className={[
                    "w-full rounded-xl border bg-white px-3 py-2 outline-none",
                    "focus:ring-2 focus:ring-black/10",
                    error ? "border-red-500" : "border-black/10",
                    className,
                ].join(" ")}
                {...props}
            >
                {children}
            </select>
            {error && <div className="mt-1 text-xs text-red-600">{error}</div>}
        </label>
    );
}
