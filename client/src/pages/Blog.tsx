import { useState } from "react";
import { Link } from "wouter";
import { Helmet } from "react-helmet-async";
import { ArrowLeft, Calendar, Clock, Tag, User, Search } from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface BlogPost {
  id: number;
  title: string;
  excerpt: string;
  content: string;
  author: string;
  date: string;
  readTime: string;
  category: string;
  tags: string[];
  slug: string;
  imageUrl?: string;
}

/**
 * Blog Page Component
 * 
 * SEO IMPLEMENTATION NOTES:
 * This page is optimized for search engines with the following features:
 * 
 * 1. Semantic HTML Structure:
 *    - Proper use of <article>, <header>, <section> tags
 *    - Descriptive headings (h1, h2) for content hierarchy
 *    - Structured data-ready markup
 * 
 * 2. Meta Tags (would be implemented with react-helmet-async in production):
 *    - Title: "Blog DissertIA - Dicas de Redação, ENEM e Vestibulares"
 *    - Description: SEO-optimized description with keywords
 *    - Keywords: blog redação, dicas ENEM, vestibulares, etc.
 *    - Open Graph tags for social media sharing
 *    - Twitter Card tags for better Twitter previews
 *    - Canonical URL to prevent duplicate content issues
 * 
 * 3. Content Structure:
 *    - Unique, descriptive titles for each blog post
 *    - Rich excerpts with relevant keywords
 *    - Category and tag organization for better indexing
 *    - Author attribution and publication dates
 *    - Read time indicators for user engagement metrics
 * 
 * 4. URL Structure:
 *    - Clean, readable URLs using slugs (e.g., /blog/estruturar-redacao-nota-1000-enem)
 *    - Posts are ready for individual page implementation
 * 
 * 5. User Experience:
 *    - Search functionality for content discovery
 *    - Category filtering for better navigation
 *    - Responsive design for mobile-first indexing
 *    - Fast loading times with optimized components
 * 
 * For production, consider adding:
 * - react-helmet-async for dynamic meta tags
 * - Sitemap generation for search engines
 * - Schema.org structured data (JSON-LD)
 * - RSS feed for content syndication
 */
export default function Blog() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const blogPosts: BlogPost[] = [
    {
      id: 1,
      title: "Como Estruturar uma Redação Nota 1000 no ENEM",
      excerpt: "Descubra os segredos para criar uma redação perfeita seguindo os critérios de avaliação do ENEM. Aprenda técnicas comprovadas que levaram milhares de estudantes à nota máxima.",
      content: "",
      author: "Equipe DissertIA",
      date: "2025-10-20",
      readTime: "8 min",
      category: "Dicas de Redação",
      tags: ["ENEM", "Redação", "Nota 1000"],
      slug: "estruturar-redacao-nota-1000-enem"
    },
    {
      id: 2,
      title: "5 Erros Comuns que Diminuem sua Nota na Redação",
      excerpt: "Evite estes erros frequentes que podem custar pontos preciosos na sua redação. Saiba identificar e corrigir problemas antes de entregar seu texto.",
      content: "",
      author: "Prof. Ana Silva",
      date: "2025-10-18",
      readTime: "6 min",
      category: "Dicas de Redação",
      tags: ["Erros Comuns", "Correção", "Dicas"],
      slug: "erros-comuns-redacao"
    },
    {
      id: 3,
      title: "Como a Inteligência Artificial Pode Melhorar sua Escrita",
      excerpt: "Entenda como ferramentas de IA podem acelerar seu aprendizado e ajudá-lo a desenvolver habilidades de escrita mais rapidamente.",
      content: "",
      author: "Dr. Carlos Mendes",
      date: "2025-10-15",
      readTime: "10 min",
      category: "Tecnologia",
      tags: ["IA", "Aprendizado", "Tecnologia"],
      slug: "ia-melhorar-escrita"
    },
    {
      id: 4,
      title: "Repertório Sociocultural: O que é e Como Desenvolver",
      excerpt: "Aprenda a construir um repertório rico e relevante para suas redações. Descubra fontes confiáveis e técnicas de memorização eficientes.",
      content: "",
      author: "Prof. Marina Costa",
      date: "2025-10-12",
      readTime: "7 min",
      category: "Preparação",
      tags: ["Repertório", "Cultura", "Conhecimento"],
      slug: "repertorio-sociocultural"
    },
    {
      id: 5,
      title: "Cronograma de Estudos para o ENEM: Guia Completo",
      excerpt: "Monte um cronograma eficiente para estudar redação e todas as outras disciplinas. Dicas de organização e gestão de tempo para maximizar seu aprendizado.",
      content: "",
      author: "Equipe DissertIA",
      date: "2025-10-08",
      readTime: "12 min",
      category: "Preparação",
      tags: ["ENEM", "Cronograma", "Organização"],
      slug: "cronograma-estudos-enem"
    },
    {
      id: 6,
      title: "Conectivos: A Chave para uma Redação Coesa",
      excerpt: "Domine o uso de conectivos e operadores argumentativos para criar textos fluidos e bem articulados. Lista completa com exemplos práticos.",
      content: "",
      author: "Prof. João Santos",
      date: "2025-10-05",
      readTime: "9 min",
      category: "Técnicas",
      tags: ["Conectivos", "Coesão", "Gramática"],
      slug: "conectivos-redacao-coesa"
    }
  ];

  const categories = ["Todas", ...Array.from(new Set(blogPosts.map(post => post.category)))];

  const filteredPosts = blogPosts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         post.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         post.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = !selectedCategory || selectedCategory === "Todas" || post.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <>
      <Helmet>
        <title>Blog DissertIA - Dicas de Redação, ENEM e Vestibulares | DissertIA</title>
        <meta name="description" content="Aprenda técnicas de redação, dicas para o ENEM e vestibulares com a ajuda de especialistas. Artigos atualizados sobre como melhorar sua escrita com inteligência artificial." />
        <meta name="keywords" content="blog redação, dicas ENEM, vestibulares, redação nota 1000, técnicas de escrita, inteligência artificial, preparação ENEM" />
        
        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://dissertia.com/blog" />
        <meta property="og:title" content="Blog DissertIA - Dicas de Redação, ENEM e Vestibulares" />
        <meta property="og:description" content="Aprenda técnicas de redação, dicas para o ENEM e vestibulares com a ajuda de especialistas. Artigos atualizados sobre como melhorar sua escrita." />
        <meta property="og:image" content="https://dissertia.com/og-blog-image.jpg" />

        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:url" content="https://dissertia.com/blog" />
        <meta name="twitter:title" content="Blog DissertIA - Dicas de Redação, ENEM e Vestibulares" />
        <meta name="twitter:description" content="Aprenda técnicas de redação, dicas para o ENEM e vestibulares com a ajuda de especialistas." />
        <meta name="twitter:image" content="https://dissertia.com/og-blog-image.jpg" />

        {/* Additional SEO */}
        <meta name="robots" content="index, follow" />
        <meta name="author" content="DissertIA" />
        <link rel="canonical" href="https://dissertia.com/blog" />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-b from-bright-blue/10 to-white dark:from-bright-blue/5 dark:to-gray-900">
        {/* Header */}
        <header className="border-b bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm sticky top-0 z-50">
          <div className="container mx-auto px-6 py-4">
            <Link href="/" className="inline-flex items-center gap-2 text-bright-blue hover:text-bright-blue/80 smooth-transition" data-testid="link-back-home">
              <ArrowLeft className="h-5 w-5" />
              <span>Voltar para Início</span>
            </Link>
          </div>
        </header>

        {/* Hero Section */}
        <section className="py-12 md:py-16">
          <div className="container mx-auto px-6">
            <div className="text-center mb-12">
              <h1 className="text-4xl md:text-5xl font-bold text-deep-navy dark:text-white mb-4">
                Blog DissertIA
              </h1>
              <p className="text-lg text-deep-navy/70 dark:text-white/70 max-w-3xl mx-auto mb-8">
                Dicas, técnicas e estratégias para dominar a arte da redação e conquistar sua aprovação
              </p>

              {/* Search Bar */}
              <div className="max-w-2xl mx-auto relative mb-8">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-deep-navy/40 dark:text-white/40" />
                <Input
                  placeholder="Pesquisar artigos..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-12 h-12 text-base"
                  data-testid="input-search-blog"
                />
              </div>

              {/* Category Filter */}
              <div className="flex flex-wrap justify-center gap-2">
                {categories.map((category) => (
                  <Button
                    key={category}
                    variant={selectedCategory === category || (category === "Todas" && !selectedCategory) ? "default" : "outline"}
                    onClick={() => setSelectedCategory(category === "Todas" ? null : category)}
                    className={selectedCategory === category || (category === "Todas" && !selectedCategory) 
                      ? "bg-bright-blue hover:bg-bright-blue/90" 
                      : ""}
                    data-testid={`button-category-${category.toLowerCase().replace(/\s+/g, '-')}`}
                  >
                    {category}
                  </Button>
                ))}
              </div>
            </div>

            {/* Blog Posts Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPosts.length > 0 ? (
                filteredPosts.map((post) => (
                  <article key={post.id} data-testid={`article-${post.id}`}>
                    <Card className="h-full flex flex-col hover:shadow-lg smooth-transition">
                      <CardHeader>
                        <div className="flex items-center gap-2 mb-3">
                          <Badge variant="secondary" className="bg-bright-blue/10 text-bright-blue">
                            {post.category}
                          </Badge>
                        </div>
                        <CardTitle className="text-xl mb-2 line-clamp-2">
                          <a 
                            href={`/blog/${post.slug}`} 
                            className="hover:text-bright-blue smooth-transition"
                            data-testid={`link-post-${post.id}`}
                          >
                            {post.title}
                          </a>
                        </CardTitle>
                        <CardDescription className="line-clamp-3">
                          {post.excerpt}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="flex-grow">
                        <div className="flex flex-wrap gap-2">
                          {post.tags.map((tag, index) => (
                            <Badge key={index} variant="outline" className="text-xs" data-testid={`tag-${post.id}-${index}`}>
                              <Tag className="h-3 w-3 mr-1" />
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </CardContent>
                      <CardFooter className="text-sm text-deep-navy/60 dark:text-white/60 flex items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                          <span className="flex items-center gap-1" data-testid={`author-${post.id}`}>
                            <User className="h-4 w-4" />
                            {post.author}
                          </span>
                          <span className="flex items-center gap-1" data-testid={`date-${post.id}`}>
                            <Calendar className="h-4 w-4" />
                            {new Date(post.date).toLocaleDateString('pt-BR')}
                          </span>
                        </div>
                        <span className="flex items-center gap-1" data-testid={`readtime-${post.id}`}>
                          <Clock className="h-4 w-4" />
                          {post.readTime}
                        </span>
                      </CardFooter>
                    </Card>
                  </article>
                ))
              ) : (
                <div className="col-span-full text-center py-12">
                  <p className="text-deep-navy/70 dark:text-white/70 text-lg" data-testid="text-no-results">
                    Nenhum artigo encontrado. Tente uma busca diferente.
                  </p>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Newsletter CTA */}
        <section className="py-12 bg-bright-blue/5 dark:bg-bright-blue/10">
          <div className="container mx-auto px-6 text-center">
            <h2 className="text-2xl md:text-3xl font-bold text-deep-navy dark:text-white mb-4">
              Receba novos artigos por email
            </h2>
            <p className="text-deep-navy/70 dark:text-white/70 mb-6 max-w-2xl mx-auto">
              Assine nossa newsletter e receba dicas semanais de redação, estratégias para o ENEM e conteúdos exclusivos diretamente no seu email.
            </p>
            <Link href="/#newsletter" className="inline-block bg-bright-blue text-white px-8 py-3 rounded-lg hover:bg-bright-blue/90 smooth-transition" data-testid="button-newsletter-cta">
              Inscrever-se Agora
            </Link>
          </div>
        </section>
      </div>
    </>
  );
}
