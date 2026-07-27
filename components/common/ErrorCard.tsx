interface ErrorCardProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
}

export default function ErrorCard({
  title = "Something went wrong",
  message = "Unable to load data.",
  onRetry,
}: ErrorCardProps) {
  return (
    <div className="rounded-xl border border-red-200 bg-red-50 p-6">
      <h3 className="text-lg font-semibold text-red-700">
        {title}
      </h3>

      <p className="mt-2 text-sm text-red-600">
        {message}
      </p>

      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-5 rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-700"
        >
          Retry
        </button>
      )}
    </div>
  );
}