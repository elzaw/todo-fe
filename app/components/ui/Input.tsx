type Props = React.InputHTMLAttributes<HTMLInputElement> & {
    label?: string;
    error?: string;
};

export default function Input({ label, error, className = "", ...props }: Props) {
    return (
        <label className="block">
            {label && <div className="mb-1 text-sm font-medium">{label}</div>}
            <input
                className={[
                    "w-full rounded-xl border bg-white px-3 py-2 outline-none",
                    "focus:ring-2 focus:ring-black/10",
                    error ? "border-red-500" : "border-black/10",
                    className,
                ].join(" ")}
                {...props}
            />
            {error && <div className="mt-1 text-xs text-red-600">{error}</div>}
        </label>
    );
}
