export default function LoadingSpinner({ text = "Loading..." }: { text?: string }) {
    return (
        <div className="loading-spinner">
            <div className="loading-spinner__ring">
                <div className="loading-spinner__ring-inner" />
            </div>
            <p className="loading-spinner__text">{text}</p>
        </div>
    );
}
