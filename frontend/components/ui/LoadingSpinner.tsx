export default function LoadingSpinner({ text = "Loading..." }: { text?: string }) {
    return (
        <div className="flex flex-col items-center justify-center gap-[14px] px-5 py-[60px]">
            <div className="w-10 h-10 rounded-full border-[3px] border-[#e8ecf1] border-t-[#2563a8] animate-spin" />
            <p className="text-[13px] font-medium text-slate-400">{text}</p>
        </div>
    );
}
