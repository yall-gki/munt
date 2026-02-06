"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

interface NewsArticle {
  title: string;
  link: string;
  publishedAt: string;
  source: {
    name: string;
  };
}

const CryptoNews: React.FC<{ coinId: string }> = ({ coinId }) => {
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);

    fetch(`/api/news?coin=${encodeURIComponent(coinId)}`)
      .then((res) => res.json())
      .then((data) => {
        setArticles(data.data || []);
      })
      .catch(() => {
        setError("Could not load news");
      })
      .finally(() => setLoading(false));
  }, [coinId]);

  if (loading) {
    return (
      <div className="h-64 flex items-center justify-center bg-zinc-900 rounded-xl border border-zinc-800">
        <Loader2 className="animate-spin h-6 w-6 text-blue-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-64 flex items-center justify-center bg-zinc-900 rounded-xl border border-zinc-800 text-red-500">
        ⚠️ {error}
      </div>
    );
  }

  return (
    <div className="bg-zinc-900 rounded-xl border border-zinc-800 overflow-hidden">
      <div className="px-4 py-2 border-b border-zinc-700 bg-zinc-800/90 text-white font-semibold text-sm">
        {coinId.toUpperCase()} News
      </div>
      <ul className="space-y-2 overflow-y-auto max-h-[480px] p-2">
        {articles.length === 0 && (
          <li className="text-zinc-400 text-sm text-center">
            No recent news
          </li>
        )}
        {articles.map((item, i) => (
          <li key={i} className="text-sm text-zinc-200">
            <a
              href={item.link}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 hover:underline"
            >
              {item.title}
            </a>
            <p className="text-xs text-zinc-500">
              {item.source.name} •{" "}
              {new Date(item.publishedAt).toLocaleDateString()}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default CryptoNews;
