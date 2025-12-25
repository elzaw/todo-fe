type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: "primary" | "secondary" | "danger";
};

export default function Button({ variant = "primary", className = "", ...props }: Props) {
    const base =
        "inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-black/10 disabled:opacity-60";
    const styles =
        variant === "primary"
            ? "bg-black text-white hover:bg-black/90"
            : variant === "danger"
                ? "bg-red-600 text-white hover:bg-red-600/90"
                : "bg-white border border-black/10 hover:bg-black/5";
    return <button className={[base, styles, className].join(" ")} {...props} />;
}
