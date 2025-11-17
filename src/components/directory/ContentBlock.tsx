interface ContentBlockProps {
  title: string;
  content: string;
  className?: string;
}

export default function ContentBlock({ title, content, className = '' }: ContentBlockProps) {
  return (
    <div className={className}>
      <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
        {title}
      </h2>
      <div className="prose prose-lg max-w-none text-gray-700">
        <p className="leading-relaxed whitespace-pre-line">{content}</p>
      </div>
    </div>
  );
}

