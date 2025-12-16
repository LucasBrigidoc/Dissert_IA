import { Link, useParams } from "wouter";
import { Navigation } from "@/components/navigation";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import { getBlogPostBySlug, getAllBlogPosts } from "@shared/blog-posts";
import { Calendar, Clock, ArrowLeft, ArrowRight, Tag, User } from "lucide-react";
import { LiquidGlassCard } from "@/components/liquid-glass-card";

export default function BlogPost() {
  const params = useParams();
  const slug = params.slug as string;
  const post = getBlogPostBySlug(slug);
  const allPosts = getAllBlogPosts();

  if (!post) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="container mx-auto px-4 sm:px-6 py-24 text-center">
          <h1 className="text-3xl font-bold text-dark-blue mb-4">Artigo não encontrado</h1>
          <p className="text-soft-gray mb-8">O artigo que você está procurando não existe ou foi removido.</p>
          <Link href="/blog">
            <Button data-testid="button-back-to-blog">
              <ArrowLeft className="mr-2" size={18} />
              Voltar ao Blog
            </Button>
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  const currentIndex = allPosts.findIndex(p => p.slug === slug);
  const prevPost = currentIndex > 0 ? allPosts[currentIndex - 1] : null;
  const nextPost = currentIndex < allPosts.length - 1 ? allPosts[currentIndex + 1] : null;

  const renderContent = (content: string) => {
    const lines = content.split('\n');
    const elements: JSX.Element[] = [];
    let currentList: string[] = [];
    let listType: 'ul' | 'ol' | null = null;
    let keyCounter = 0;

    const getKey = () => `elem-${keyCounter++}`;

    const flushList = () => {
      if (currentList.length > 0 && listType) {
        const listKey = getKey();
        if (listType === 'ul') {
          elements.push(
            <ul key={listKey} className="list-disc list-inside space-y-2 text-soft-gray mb-6 ml-4">
              {currentList.map((item, i) => (
                <li key={`${listKey}-${i}`}>{item}</li>
              ))}
            </ul>
          );
        } else {
          elements.push(
            <ol key={listKey} className="list-decimal list-inside space-y-2 text-soft-gray mb-6 ml-4">
              {currentList.map((item, i) => (
                <li key={`${listKey}-${i}`}>{item}</li>
              ))}
            </ol>
          );
        }
        currentList = [];
        listType = null;
      }
    };

    lines.forEach((line) => {
      const trimmedLine = line.trim();

      if (trimmedLine.startsWith('# ')) {
        flushList();
        elements.push(
          <h1 key={getKey()} className="text-3xl font-bold text-dark-blue mb-6 mt-8">
            {trimmedLine.substring(2)}
          </h1>
        );
      } else if (trimmedLine.startsWith('## ')) {
        flushList();
        elements.push(
          <h2 key={getKey()} className="text-2xl font-semibold text-dark-blue mb-4 mt-8">
            {trimmedLine.substring(3)}
          </h2>
        );
      } else if (trimmedLine.startsWith('### ')) {
        flushList();
        elements.push(
          <h3 key={getKey()} className="text-xl font-semibold text-dark-blue mb-3 mt-6">
            {trimmedLine.substring(4)}
          </h3>
        );
      } else if (trimmedLine.startsWith('- **') || trimmedLine.startsWith('* **')) {
        if (listType !== 'ul') {
          flushList();
          listType = 'ul';
        }
        const itemContent = trimmedLine.substring(2).replace(/\*\*/g, '');
        currentList.push(itemContent);
      } else if (trimmedLine.startsWith('- ') || trimmedLine.startsWith('* ')) {
        if (listType !== 'ul') {
          flushList();
          listType = 'ul';
        }
        currentList.push(trimmedLine.substring(2));
      } else if (/^\d+\.\s/.test(trimmedLine)) {
        if (listType !== 'ol') {
          flushList();
          listType = 'ol';
        }
        currentList.push(trimmedLine.replace(/^\d+\.\s/, '').replace(/\*\*/g, ''));
      } else if (trimmedLine.startsWith('**') && trimmedLine.endsWith('**')) {
        flushList();
        elements.push(
          <p key={getKey()} className="font-semibold text-dark-blue mb-4">
            {trimmedLine.replace(/\*\*/g, '')}
          </p>
        );
      } else if (trimmedLine.length > 0) {
        flushList();
        const formattedLine = trimmedLine
          .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
          .replace(/`([^`]+)`/g, '<code class="bg-gray-100 px-1 rounded text-sm">$1</code>');
        elements.push(
          <p 
            key={getKey()} 
            className="text-soft-gray mb-4 leading-relaxed"
            dangerouslySetInnerHTML={{ __html: formattedLine }}
          />
        );
      }
    });

    flushList();
    return elements;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <section className="gradient-bg min-h-[40vh] flex flex-col justify-center relative overflow-hidden pt-24 pb-12">
        <div className="container mx-auto px-4 sm:px-6 w-full">
          <div className="max-w-4xl mx-auto">
            <Link href="/blog" className="inline-flex items-center text-white/80 hover:text-white mb-6 transition-colors" data-testid="link-back-to-blog">
              <ArrowLeft size={18} className="mr-2" />
              Voltar ao Blog
            </Link>
            
            <div className="flex items-center gap-3 mb-4">
              <span className="text-sm font-medium text-white bg-white/20 px-3 py-1 rounded-full">
                {post.category}
              </span>
            </div>
            
            <h1 className="font-bold text-white text-3xl sm:text-4xl md:text-5xl mb-6" data-testid="text-post-title">
              {post.title}
            </h1>
            
            <div className="flex flex-wrap items-center gap-4 text-white/80 text-sm mb-8">
              <span className="flex items-center gap-2">
                <User size={16} />
                {post.author}
              </span>
              <span className="flex items-center gap-2">
                <Calendar size={16} />
                {post.date}
              </span>
              <span className="flex items-center gap-2">
                <Clock size={16} />
                {post.readTime} de leitura
              </span>
            </div>
            
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <Link href="/pricing">
                <Button 
                  className="bg-white text-bright-blue px-8 py-3 font-semibold"
                  data-testid="button-post-hero-start"
                >
                  Começar Agora
                  <ArrowRight className="ml-2" size={18} />
                </Button>
              </Link>
              <span className="text-white/90 text-sm">
                Melhore suas redações com IA e alcance a nota 1000!
              </span>
            </div>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 sm:px-6 py-12">
        <div className="max-w-4xl mx-auto">
          <LiquidGlassCard className="p-8 md:p-12" data-testid="card-post-content">
            <article className="prose prose-lg max-w-none">
              {renderContent(post.content)}
            </article>
            
            <div className="mt-8 pt-8 border-t">
              <div className="flex flex-wrap items-center gap-2">
                <Tag size={16} className="text-soft-gray" />
                {post.tags.map((tag, index) => (
                  <span 
                    key={index}
                    className="text-xs font-medium text-bright-blue bg-bright-blue/10 px-3 py-1 rounded-full"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </LiquidGlassCard>

          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
            {prevPost && (
              <Link href={`/blog/${prevPost.slug}`} data-testid="link-prev-post">
                <LiquidGlassCard className="p-6 hover-elevate cursor-pointer h-full">
                  <div className="flex items-center gap-2 text-soft-gray mb-2">
                    <ArrowLeft size={16} />
                    <span className="text-sm">Artigo anterior</span>
                  </div>
                  <h3 className="font-semibold text-dark-blue line-clamp-2">{prevPost.title}</h3>
                </LiquidGlassCard>
              </Link>
            )}
            {nextPost && (
              <Link href={`/blog/${nextPost.slug}`} className={prevPost ? '' : 'md:col-start-2'} data-testid="link-next-post">
                <LiquidGlassCard className="p-6 hover-elevate cursor-pointer h-full">
                  <div className="flex items-center justify-end gap-2 text-soft-gray mb-2">
                    <span className="text-sm">Próximo artigo</span>
                    <ArrowRight size={16} />
                  </div>
                  <h3 className="font-semibold text-dark-blue text-right line-clamp-2">{nextPost.title}</h3>
                </LiquidGlassCard>
              </Link>
            )}
          </div>

          <div className="text-center mt-12">
            <p className="text-soft-gray mb-6">
              Pronto para melhorar suas redações com a ajuda da IA?
            </p>
            <Link href="/pricing">
              <Button 
                className="bg-gradient-to-r from-bright-blue to-dark-blue text-white px-8 py-3"
                data-testid="button-post-cta"
              >
                Comece Agora
                <ArrowRight className="ml-2" size={18} />
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
