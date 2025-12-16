import { Link } from "wouter";
import { Navigation } from "@/components/navigation";
import { Footer } from "@/components/footer";
import { LiquidGlassCard } from "@/components/liquid-glass-card";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, ArrowRight, BookOpen, PenTool, Lightbulb, GraduationCap, TrendingUp } from "lucide-react";

const blogPosts = [
  {
    id: 1,
    title: "10 Dicas Para Escrever uma Redação Nota 1000 no ENEM",
    excerpt: "Descubra as estratégias mais eficazes para alcançar a nota máxima na redação do ENEM, desde a estruturação até a argumentação.",
    category: "Dicas de Redação",
    readTime: "8 min",
    date: "15 Dez 2024",
    icon: PenTool,
  },
  {
    id: 2,
    title: "Como Usar Repertório Sociocultural de Forma Eficiente",
    excerpt: "Aprenda a utilizar referências culturais, históricas e filosóficas para enriquecer sua argumentação.",
    category: "Técnicas",
    readTime: "6 min",
    date: "12 Dez 2024",
    icon: BookOpen,
  },
  {
    id: 3,
    title: "Os Temas Mais Prováveis Para o ENEM 2025",
    excerpt: "Análise dos temas contemporâneos que têm maior probabilidade de aparecer na próxima prova do ENEM.",
    category: "Tendências",
    readTime: "10 min",
    date: "10 Dez 2024",
    icon: TrendingUp,
  },
  {
    id: 4,
    title: "Erros Mais Comuns na Redação e Como Evitá-los",
    excerpt: "Conheça os erros que mais prejudicam candidatos e aprenda estratégias para não cometê-los.",
    category: "Dicas de Redação",
    readTime: "7 min",
    date: "08 Dez 2024",
    icon: Lightbulb,
  },
  {
    id: 5,
    title: "Como a Inteligência Artificial Pode Ajudar nos Estudos",
    excerpt: "Entenda como ferramentas de IA podem potencializar seu aprendizado e melhorar sua escrita.",
    category: "Tecnologia",
    readTime: "5 min",
    date: "05 Dez 2024",
    icon: GraduationCap,
  },
  {
    id: 6,
    title: "Estrutura da Redação: O Guia Completo",
    excerpt: "Um guia passo a passo sobre como estruturar sua redação de forma clara e coesa.",
    category: "Técnicas",
    readTime: "12 min",
    date: "01 Dez 2024",
    icon: PenTool,
  },
];

export default function Blog() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <section className="gradient-bg min-h-[50vh] flex flex-col justify-center relative overflow-hidden pt-24 pb-12">
        <div className="container mx-auto px-4 sm:px-6 w-full">
          <div className="text-center text-white">
            <h1 className="font-bold mb-4 text-3xl sm:text-4xl md:text-5xl" data-testid="text-blog-title">
              Blog Dissert IA
            </h1>
            <p className="text-white/90 text-lg md:text-xl max-w-3xl mx-auto">
              Dicas, estratégias e conteúdos exclusivos para ajudar você a dominar a arte da redação
            </p>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {blogPosts.map((post) => {
            const IconComponent = post.icon;
            return (
              <LiquidGlassCard 
                key={post.id} 
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
            );
          })}
        </div>

        <div className="text-center mt-12">
          <p className="text-soft-gray mb-6">
            Em breve, mais conteúdos exclusivos para ajudar você a alcançar a nota 1000!
          </p>
          <Link href="/signup">
            <Button 
              className="bg-gradient-to-r from-bright-blue to-dark-blue text-white px-8 py-3"
              data-testid="button-blog-cta"
            >
              Comece Agora Gratuitamente
              <ArrowRight className="ml-2" size={18} />
            </Button>
          </Link>
        </div>
      </div>

      <Footer />
    </div>
  );
}
