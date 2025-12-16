import { Link } from "wouter";
import { Helmet } from "react-helmet-async";
import { Navigation } from "@/components/navigation";
import { Footer } from "@/components/footer";
import { LiquidGlassCard } from "@/components/liquid-glass-card";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, ArrowRight, BookOpen, PenTool, Lightbulb, GraduationCap, TrendingUp } from "lucide-react";
import { getAllBlogPosts } from "@shared/blog-posts";

const iconMap: Record<string, any> = {
  "Dicas de Redação": PenTool,
  "Técnicas": BookOpen,
  "Tendências": TrendingUp,
  "Tecnologia": GraduationCap,
};

export default function Blog() {
  const blogPosts = getAllBlogPosts();

  return (
    <div className="min-h-screen bg-gray-50">
      <Helmet>
        <title>Blog Dissert IA - Dicas de Redação para Vestibulares e Concursos</title>
        <meta name="description" content="Dicas, estratégias e conteúdos exclusivos para ajudar você a dominar a arte da redação e alcançar a nota máxima em vestibulares e concursos públicos. Aprenda técnicas comprovadas com a Dissert IA." />
        <meta name="keywords" content="redação vestibular, redação concurso, dicas redação, como escrever redação, técnicas de redação, proposta de intervenção, repertório sociocultural, Dissert IA" />
        <link rel="canonical" href="https://dissertia.com.br/blog" />
        <meta property="og:title" content="Blog Dissert IA - Dicas de Redação para Vestibulares e Concursos" />
        <meta property="og:description" content="Dicas, estratégias e conteúdos exclusivos para ajudar você a dominar a arte da redação e alcançar a nota máxima em vestibulares e concursos." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://dissertia.com.br/blog" />
        <meta property="og:image" content="https://dissertia.com.br/og-blog.png" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Blog Dissert IA - Dicas de Redação para Vestibulares e Concursos" />
        <meta name="twitter:description" content="Dicas, estratégias e conteúdos exclusivos para ajudar você a dominar a arte da redação." />
        <meta name="twitter:image" content="https://dissertia.com.br/og-blog.png" />
      </Helmet>
      <Navigation />
      
      <section className="gradient-bg min-h-[50vh] flex flex-col justify-center relative overflow-hidden pt-24 pb-12">
        <div className="container mx-auto px-4 sm:px-6 w-full">
          <div className="text-center text-white">
            <h1 className="font-bold mb-4 text-3xl sm:text-4xl md:text-5xl" data-testid="text-blog-title">
              Blog Dissert IA
            </h1>
            <p className="text-white/90 text-lg md:text-xl max-w-3xl mx-auto mb-8">
              Informações, dicas e estratégias completas para você aprender a escrever redações incríveis. Aprenda técnicas de argumentação, estruturação de texto, uso de repertório sociocultural e muito mais para conquistar a nota máxima!
            </p>
            <Link href="/pricing">
              <Button 
                className="bg-white text-bright-blue px-8 py-3 font-semibold"
                data-testid="button-blog-hero-start"
              >
                Pratique com as Ferramentas de IA
                <ArrowRight className="ml-2" size={18} />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {blogPosts.map((post) => {
            const IconComponent = iconMap[post.category] || Lightbulb;
            return (
              <Link key={post.id} href={`/blog/${post.slug}`}>
                <LiquidGlassCard 
                  className="p-6 flex flex-col h-full hover-elevate cursor-pointer"
                  data-testid={`card-blog-post-${post.id}`}
                >
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-10 h-10 bg-bright-blue rounded-lg flex items-center justify-center">
                      <IconComponent className="text-white" size={20} />
                    </div>
                    <span className="text-xs font-medium text-bright-blue bg-bright-blue/10 px-3 py-1 rounded-full">
                      {post.category}
                    </span>
                  </div>
                  
                  <h3 className="text-lg font-semibold text-dark-blue mb-3 line-clamp-2" data-testid={`text-blog-title-${post.id}`}>
                    {post.title}
                  </h3>
                  
                  <p className="text-soft-gray text-sm mb-4 flex-grow line-clamp-3">
                    {post.excerpt}
                  </p>
                  
                  <div className="flex items-center justify-between text-xs text-soft-gray border-t pt-4">
                    <div className="flex items-center gap-3">
                      <span className="flex items-center gap-1">
                        <Calendar size={14} />
                        {post.date}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock size={14} />
                        {post.readTime}
                      </span>
                    </div>
                    <ArrowRight size={16} className="text-bright-blue" />
                  </div>
                </LiquidGlassCard>
              </Link>
            );
          })}
        </div>

        <div className="text-center mt-12">
          <p className="text-soft-gray mb-6">
            Em breve, mais conteúdos exclusivos para ajudar você a alcançar a nota 1000!
          </p>
          <Link href="/pricing">
            <Button 
              className="bg-gradient-to-r from-bright-blue to-dark-blue text-white px-8 py-3"
              data-testid="button-blog-cta"
            >
              Comece Agora
              <ArrowRight className="ml-2" size={18} />
            </Button>
          </Link>
        </div>
      </div>

      <Footer />
    </div>
  );
}
