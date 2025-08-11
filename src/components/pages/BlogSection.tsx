import React from 'react';
import { Calendar } from 'lucide-react';

interface BlogSectionProps {
  t: (key: string) => string;
}

const BlogSection: React.FC<BlogSectionProps> = ({ t }) => {
  const posts = [
    {
      title: t('blog.post1.title'),
      excerpt: t('blog.post1.excerpt'),
      date: t('blog.post1.date')
    },
    {
      title: t('blog.post2.title'),
      excerpt: t('blog.post2.excerpt'),
      date: t('blog.post2.date')
    },
    {
      title: t('blog.post3.title'),
      excerpt: t('blog.post3.excerpt'),
      date: t('blog.post3.date')
    }
  ];

  return (
    <div className="max-w-6xl mx-auto">
      <h2 className="font-jersey text-4xl md:text-6xl text-[#fffc00] mb-12 text-center">
        {t('blog.title')}
      </h2>
      
      <div className="grid md:grid-cols-3 gap-8">
        {posts.map((post, index) => (
          <article
            key={index}
            className="bg-black/50 border border-[#85fbff] rounded-lg p-6 hover:border-[#fffc00] transition-all duration-300 hover:shadow-lg hover:shadow-[#85fbff]/20"
          >
            <h3 className="font-jersey text-2xl text-white mb-4">
              {post.title}
            </h3>
            
            <p className="font-ubuntu text-white/80 mb-4 line-clamp-3">
              {post.excerpt}
            </p>
            
            <div className="flex items-center gap-2 text-[#85fbff]">
              <Calendar size={16} />
              <span className="font-ubuntu text-sm">
                {post.date}
              </span>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
};

export default BlogSection;
