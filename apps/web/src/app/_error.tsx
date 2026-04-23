import { useEffect } from 'react';

export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center max-w-md p-8">
        <div className="text-6xl font-bold text-gray-900 mb-4">500</div>
        <h1 className="text-2xl font-semibold text-gray-900 mb-4">服务器错误</h1>
        <p className="text-gray-600 mb-8">
          抱歉，服务器遇到了一个错误。
        </p>
        <button
          onClick={() => reset()}
          className="inline-block px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
        >
          重试
        </button>
      </div>
    </div>
  );
}
