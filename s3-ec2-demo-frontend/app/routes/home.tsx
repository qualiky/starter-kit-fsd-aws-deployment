import { useEffect, useState } from "react";
import { Link } from "react-router";
import { api, type Post } from "../lib/api";
import { useAuth } from "../root";

export function meta() {
  return [
    { title: "PostShare – Feed" },
    { name: "description", content: "Browse all public posts" },
  ];
}

function PostCard({ post }: { post: Post }) {
  const isImage = post.file_type?.startsWith("image/");
  const initial = post.author[0]?.toUpperCase() ?? "?";

  return (
    <article className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      {isImage && post.file_url && (
        <img
          src={post.file_url}
          alt={post.title}
          className="w-full max-h-80 object-cover"
        />
      )}
      <div className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-semibold text-sm shrink-0">
            {initial}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-gray-800 truncate">
              {post.author}
            </p>
            <p className="text-xs text-gray-400">
              {new Date(post.created_at).toLocaleDateString(undefined, {
                year: "numeric",
                month: "short",
                day: "numeric",
              })}
            </p>
          </div>
        </div>

        <h2 className="text-base font-semibold text-gray-900 mb-1">
          {post.title}
        </h2>
        {post.description && (
          <p className="text-sm text-gray-600 leading-relaxed mb-3">
            {post.description}
          </p>
        )}

        {post.file_url && !isImage && (
          <a
            href={post.file_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-sm text-blue-600 hover:underline"
          >
            <span>📎</span> Download attachment
          </a>
        )}
      </div>
    </article>
  );
}

export default function Home() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { loggedIn } = useAuth();

  useEffect(() => {
    api
      .getPosts()
      .then(setPosts)
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <main className="max-w-2xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Feed</h1>
        {loggedIn && (
          <Link
            to="/upload"
            className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
          >
            + New Post
          </Link>
        )}
      </div>

      {loading && (
        <div className="text-center py-16 text-gray-400">Loading…</div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-4 text-sm">
          {error}
        </div>
      )}

      {!loading && !error && posts.length === 0 && (
        <div className="text-center py-16">
          <p className="text-gray-400 mb-4">No posts yet.</p>
          {loggedIn ? (
            <Link
              to="/upload"
              className="text-blue-600 hover:underline text-sm"
            >
              Be the first to post!
            </Link>
          ) : (
            <Link to="/register" className="text-blue-600 hover:underline text-sm">
              Register to start posting
            </Link>
          )}
        </div>
      )}

      <div className="space-y-4">
        {posts.map((post) => (
          <PostCard key={post.id} post={post} />
        ))}
      </div>
    </main>
  );
}
