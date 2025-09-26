import { useState } from "react";
import { useLocation } from "wouter";
import { ArrowLeft, FileText, Play, Search, Edit3, PenTool, Loader2, Save, X, HelpCircle, Info, Lightbulb } from "lucide-react";
import { EssayResult } from "@/pages/essay-result";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LiquidGlassCard } from "@/components/liquid-glass-card";
import { StructurePreview } from "@/components/structure-preview";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { EssayStructure, Section } from "@shared/schema";
import { AIUsageProgress } from "@/components/ai-usage-progress";

interface StructureGuide {
  whenToUse: string[];
  whenNotToUse: string[];
  advantages: string[];
}

interface StructureWithGuide extends EssayStructure {
  guide?: StructureGuide;
}

interface UseStructureProps {
  structures: EssayStructure[];
  onBack: () => void;
  onSaveStructure?: (structure: EssayStructure) => void;
}

export function UseStructure({ structures, onBack, onSaveStructure }: UseStructureProps) {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  // 7 Estruturas Predefinidas Coringa
  const predefinedStructures: StructureWithGuide[] = [
    {
      id: "model-1",
      name: "Modelo 1: Universal Clássico", 
      userId: "system",
      sections: [
        {
          id: "m1-intro",
          title: "Introdução",
          description: "O filósofo John Rawls, em sua \"Teoria da Justiça\", defendia que uma sociedade bem ordenada deve garantir oportunidades equitativas e proteção aos mais vulneráveis. Contudo, a realidade brasileira contemporânea apresenta significativas distorções desse ideal, especialmente quando se observa a persistência da problemática (tema específico), que se manifesta como um desafio multidimensional na sociedade atual. Nesse contexto, tal questão é agravada por falhas sistemáticas na implementação de soluções efetivas e pelo desengajamento de diversos atores sociais em relação às transformações necessárias.",
          guidelines: "Estrutura: Filósofo + Ideal + Realidade Atual + Tema Específico + Agravamento por Falhas + Desengajamento Social"
        },
        {
          id: "m1-dev1",
          title: "Primeiro Desenvolvimento - Falhas de Implementação",
          description: "Primeiramente, dados de [instituição competente] revelam que (inserir estatística relevante). Diante desse cenário, observam-se falhas sistemáticas na implementação de soluções para a problemática, evidenciadas por (inadequação de recursos aplicados, descontinuidade de ações, falta de coordenação entre setores, ausência de planejamento integrado, burocratização de processos). Os órgãos responsáveis por (área relacionada ao tema) consistentemente demonstram (ineficiência operacional, falta de monitoramento, ausência de adaptação às demandas, resistência a inovações, desalinhamento de objetivos) que comprometem a efetividade das iniciativas voltadas para (problema específico). Assim, essa disfunção na implementação perpetua um ciclo onde problemas persistem apesar da existência de marcos legais e recursos destinados à sua solução.",
          guidelines: "Estrutura: Dados + Falhas Sistemáticas + Detalhamento das Deficiências + Órgãos Responsáveis + Consequências"
        },
        {
          id: "m1-dev2",
          title: "Segundo Desenvolvimento - Desengajamento Social", 
          description: "Ademais, o sociólogo Robert Putnam demonstrou que a vitalidade democrática e a solução de problemas coletivos dependem fundamentalmente do engajamento ativo dos diversos atores sociais. Nessa perspectiva, verifica-se um preocupante desengajamento em relação à problemática, manifestado através de (indiferença social diante do problema, falta de mobilização coletiva, ausência de pressão por mudanças, terceirização de responsabilidades, conformismo diante de injustiças). Diferentes segmentos da sociedade - incluindo (cidadãos, organizações, lideranças, formadores de opinião, grupos de interesse) - falham em exercer adequadamente (fiscalização social, participação ativa, cobrança por resultados, construção de soluções colaborativas) necessárias para enfrentar (problema específico). Dessarte, essa omissão coletiva resulta na ausência de pressão efetiva por transformações, permitindo que problemas se perpetuem sem a devida atenção.",
          guidelines: "Estrutura: Robert Putnam + Engajamento Democrático + Desengajamento Social + Diferentes Segmentos + Consequências"
        },
        {
          id: "m1-concl",
          title: "Conclusão",
          description: "Em síntese, superar essa problemática exige tanto aprimoramento dos processos de implementação quanto fortalecimento do engajamento social. Portanto, [Órgão competente], em articulação com [parceiros estratégicos], deve desenvolver [programa integrado] por meio de [ações específicas: modernização de processos, transparência, participação social, monitoramento contínuo], visando [objetivo central] e assegurar soluções efetivas e duradouras. Assim, será possível aproximar a realidade brasileira dos ideais de justiça propostos por Rawls, mediante implementação em [prazo], investimento de [recursos] e sistema de avaliação com indicadores de [efetividade e engajamento].",
          guidelines: "Estrutura: Síntese + Órgão + Programa + Ações Específicas + Objetivo + Referência ao Filósofo + Cronograma"
        }
      ],
      guide: {
        whenToUse: ["Qualquer tema que você não souber exatamente como abordar", "Temas sobre direitos fundamentais (educação, saúde, moradia)", "Problemas de gestão pública e eficiência estatal", "Questões de cidadania e participação democrática"],
        whenNotToUse: ["Quando outro modelo se encaixa perfeitamente no tema", "Temas muito específicos que pedem abordagem especializada"],
        advantages: ["Funciona para 95% dos temas", "Argumentação sólida e respeitada", "Linguagem acadêmica que impressiona corretores"]
      },
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: "model-2", 
      name: "Modelo 2: Desigualdades Estruturais",
      userId: "system",
      sections: [
        {
          id: "m2-intro",
          title: "Introdução",
          description: "As sociedades modernas enfrentam desafios estruturais que resultam da forma como recursos, oportunidades e poder são distribuídos entre diferentes grupos sociais. O sociólogo Pierre Bourdieu demonstrou como diferentes formas de capital se combinam para perpetuar desigualdades estruturais que limitam o potencial humano. Entretanto, essa dinâmica manifesta-se de forma particularmente problemática na questão (tema específico), evidenciando como desigualdades estruturais podem perpetuar injustiças sociais. Nesse sentido, tal cenário é potencializado pela concentração inadequada de recursos e oportunidades e pela exclusão sistemática de grupos vulneráveis dos processos de desenvolvimento social.",
          guidelines: "Estrutura: Desafios Modernos + Pierre Bourdieu + Desigualdades + Tema Específico + Concentração + Exclusão"
        },
        {
          id: "m2-dev1",
          title: "Primeiro Desenvolvimento - Concentração Inadequada",
          description: "Inicialmente, dados de [centro de pesquisas sociais] demonstram que (inserir estatística relevante sobre concentração ou distribuição). Dessa forma, verifica-se concentração inadequada de recursos e oportunidades relacionados ao tema, evidenciada por (monopolização de benefícios por grupos privilegiados, barreiras estruturais de acesso, centralização excessiva de decisões, manutenção de privilégios históricos, desigualdade na distribuição de recursos). Diferentes atores - incluindo (instituições dominantes, grupos de interesse, organizações estabelecidas, setores específicos) - sistematicamente controlam (distribuição de oportunidades, processos decisórios, acesso a recursos, definição de prioridades) de maneira que perpetua (problema específico). Assim, essa concentração estrutural impede que benefícios se distribuam equitativamente, mantendo desigualdades que agravam a problemática em questão.",
          guidelines: "Estrutura: Dados + Concentração Inadequada + Atores Dominantes + Controle de Recursos + Consequências"
        },
        {
          id: "m2-dev2",
          title: "Segundo Desenvolvimento - Exclusão Sistemática",
          description: "Outrossim, Amartya Sen argumentava que o desenvolvimento verdadeiro deve expandir as capacidades e liberdades de todos os grupos sociais, especialmente os mais vulneráveis. Nessa perspectiva, grupos vulneráveis enfrentam exclusão sistemática dos processos relacionados ao tema, caracterizada por (discriminação estrutural, falta de representatividade, barreiras de acesso, ausência de políticas específicas, invisibilidade social). Populações como (grupos vulneráveis específicos ao contexto do tema) são consistentemente privadas de (acesso equitativo a oportunidades, participação efetiva em decisões, representação adequada, recursos necessários) que poderiam contribuir significativamente para enfrentar (problema específico). Dessarte, essa exclusão não apenas prejudica os grupos afetados, mas também priva a sociedade de contribuições valiosas para a solução coletiva do problema.",
          guidelines: "Estrutura: Amartya Sen + Desenvolvimento + Exclusão Sistemática + Grupos Vulneráveis + Consequências Duplas"
        },
        {
          id: "m2-concl",
          title: "Conclusão",
          description: "Portanto, enfrentar essa questão demanda tanto redistribuição de recursos quanto inclusão efetiva de grupos vulneráveis. Nessa perspectiva, [Ministério competente], em coordenação com [organizações da sociedade civil], deve implementar [programa de inclusão e redistribuição] através de [medidas específicas: políticas redistributivas, ações afirmativas, democratização de oportunidades, fortalecimento de grupos vulneráveis], objetivando [promoção de equidade] e desenvolvimento social inclusivo. Assim, será possível concretizar as capacidades humanas propostas por Sen, mediante [cronograma], [investimentos direcionados] e [sistema de monitoramento inclusivo].",
          guidelines: "Estrutura: Síntese + Ministério + Programa + Medidas Específicas + Objetivo + Referência a Sen + Cronograma"
        }
      ],
      guide: {
        whenToUse: ["Temas sobre desigualdade social e concentração de renda", "Problemas de acesso a oportunidades", "Questões de exclusão social e marginalização", "Discriminação racial, de gênero ou social"],
        whenNotToUse: ["Problemas comportamentais ou psicológicos", "Questões ambientais sem componente social forte", "Temas puramente técnicos ou legais"],
        advantages: ["Excelente para questões de equidade e justiça social", "Abordagem sociológica sofisticada", "Muito atual e relevante para debates contemporâneos"]
      },
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: "model-3",
      name: "Modelo 3: Herança Histórico-Cultural", 
      userId: "system",
      sections: [
        {
          id: "m3-intro",
          title: "Introdução",
          description: "A formação histórica de uma sociedade deixa marcas profundas que continuam influenciando a realidade contemporânea, criando tanto potencialidades quanto obstáculos estruturais para o desenvolvimento humano integral. Sérgio Buarque de Holanda, em \"Raízes do Brasil\", demonstrou como padrões históricos se perpetuam através de instituições e mentalidades que resistem a transformações. Todavia, essa herança histórica manifesta-se de forma problemática na questão (tema específico), evidenciando como padrões do passado ainda moldam desafios do presente. Assim sendo, tal perpetuação é alimentada pela manutenção de estruturas excludentes historicamente consolidadas e pela reprodução de mentalidades que naturalizam injustiças.",
          guidelines: "Estrutura: Formação Histórica + Sérgio Buarque + Padrões Históricos + Tema Específico + Estruturas + Mentalidades"
        },
        {
          id: "m3-dev1",
          title: "Primeiro Desenvolvimento - Estruturas Excludentes",
          description: "Primordialmente, pesquisas de [instituto de estudos sociais] revelam que (inserir dado sobre persistência de padrões históricos). Diante disso, persistem estruturas excludentes historicamente consolidadas, manifestando-se através de (concentração de privilégios em grupos tradicionais, manutenção de hierarquias sociais, reprodução de padrões de dominação, controle de narrativas dominantes, resistência a mudanças estruturais). Grupos detentores de poder histórico - incluindo (elites estabelecidas, instituições tradicionais, organizações dominantes, setores conservadores) - sistematicamente impedem (democratização de oportunidades, reformas estruturais necessárias, redistribuição de poder, modernização de instituições) que poderiam reduzir (problema específico). Assim, essa perpetuação de estruturas excludentes mantém inalterados os padrões que historicamente beneficiaram poucos em detrimento da maioria da população.",
          guidelines: "Estrutura: Pesquisas + Estruturas Excludentes + Grupos Dominantes + Impedição de Mudanças + Consequências"
        },
        {
          id: "m3-dev2",
          title: "Segundo Desenvolvimento - Mentalidades Naturalizadoras",
          description: "Além disso, Paulo Freire alertava sobre a persistência de mentalidades que naturalizam a opressão e impedem o desenvolvimento de consciência crítica necessária para transformações sociais. Nessa perspectiva, observa-se reprodução de mentalidades que naturalizam a problemática, caracterizada por (aceitação passiva de desigualdades, normalização de injustiças, reprodução de preconceitos estruturais, resistência a questionamentos, conformismo diante de problemas). Instituições socializadoras - como (sistemas educativos, meios de comunicação, organizações sociais, grupos de referência) - continuam transmitindo (valores que perpetuam o problema, mentalidades excludentes, preconceitos estruturais, conformismo social) que dificultam o reconhecimento e enfrentamento de (problema específico). Dessarte, essas mentalidades cristalizadas impedem que a sociedade desenvolva consciência crítica suficiente para questionar estruturas problemáticas e construir alternativas transformadoras.",
          guidelines: "Estrutura: Paulo Freire + Mentalidades Naturalizadoras + Instituições Socializadoras + Transmissão de Valores + Consequências"
        },
        {
          id: "m3-concl",
          title: "Conclusão",
          description: "Em suma, superar heranças históricas problemáticas requer tanto democratização de estruturas quanto transformação de mentalidades naturalizadoras. Por conseguinte, [Órgão governamental], através de [políticas estruturais], deve implementar [programa de transformação social] mediante [ações específicas: reformas democratizantes, educação crítica, desconstrução de preconceitos, fortalecimento de grupos historicamente excluídos], com o objetivo de [transformação estrutural] e promoção de justiça social. Assim, será possível superar as contradições históricas e construir uma sociedade mais democrática e igualitária, através de [implementação gradual], [investimentos transformadores] e [monitoramento de mudanças estruturais].",
          guidelines: "Estrutura: Síntese + Órgão + Programa + Ações Específicas + Objetivo + Superação Histórica + Cronograma"
        }
      ],
      guide: {
        whenToUse: ["Questões raciais e discriminação histórica", "Problemas de coronelismo e concentração de poder", "Machismo e questões de gênero", "Questões agrárias e concentração de terras"],
        whenNotToUse: ["Problemas técnicos ou tecnológicos recentes", "Questões globais sem raiz histórica nacional", "Temas que exigem abordagem econômica"],
        advantages: ["Conecta passado e presente de forma convincente", "Abordagem histórica respeitada por corretores", "Muito eficaz para temas brasileiros específicos"]
      },
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: "model-4",
      name: "Modelo 4: Fatores Econômico-Sociais",
      userId: "system", 
      sections: [
        {
          id: "m4-intro",
          title: "Introdução",
          description: "O desenvolvimento social sustentável pressupõe a existência de condições econômicas que permitam a todas as pessoas desenvolver seu potencial e contribuir para o progresso coletivo. Amartya Sen, em \"Desenvolvimento como Liberdade\", argumentava que o verdadeiro progresso deve expandir as capacidades humanas através da equidade econômica e social. Entretanto, a persistência da questão (tema específico) revela como fatores econômicos estruturais podem limitar essas oportunidades de desenvolvimento. Nesse contexto, tal problemática é intensificada pela distribuição inadequada de recursos econômicos e pela insuficiência de mecanismos que democratizem oportunidades de desenvolvimento.",
          guidelines: "Estrutura: Desenvolvimento Sustentável + Amartya Sen + Capacidades Humanas + Tema Específico + Distribuição + Mecanismos"
        },
        {
          id: "m4-dev1",
          title: "Primeiro Desenvolvimento - Distribuição Inadequada",
          description: "Em primeira análise, dados de [instituição de pesquisa econômica] demonstram que (inserir estatística sobre distribuição de recursos ou oportunidades). Nesse sentido, verifica-se distribuição inadequada de recursos econômicos relacionados ao tema, evidenciada pela (concentração de recursos em poucos grupos, desigualdade no acesso a oportunidades econômicas, monopolização de setores estratégicos, barreiras econômicas estruturais, privilégios econômicos históricos). Diferentes atores econômicos - incluindo (grandes organizações, grupos dominantes, setores concentrados, instituições estabelecidas) - sistematicamente controlam (distribuição de oportunidades econômicas, acesso a recursos produtivos, processos de desenvolvimento, benefícios econômicos) de forma que perpetua (problema específico). Assim, essa concentração econômica impede que oportunidades de desenvolvimento se democratizem, mantendo desigualdades que intensificam a problemática.",
          guidelines: "Estrutura: Dados Econômicos + Distribuição Inadequada + Atores Econômicos + Controle de Recursos + Consequências"
        },
        {
          id: "m4-dev2",
          title: "Segundo Desenvolvimento - Insuficiência de Mecanismos Democratizadores",
          description: "Outrossim, Joseph Stiglitz demonstrou que sistemas econômicos necessitam de mecanismos redistributivos e democratizadores para garantir desenvolvimento socialmente sustentável. Nessa perspectiva, observa-se insuficiência de mecanismos que democratizem oportunidades econômicas, caracterizada por (limitações de políticas redistributivas, ausência de programas de inclusão econômica, concentração de benefícios, inadequação de sistemas de apoio, fraqueza de políticas de acesso). Instituições responsáveis - como (órgãos de desenvolvimento, sistemas de crédito, políticas públicas, organizações de fomento) - não implementam adequadamente (redistribuição efetiva de oportunidades, democratização de acesso, políticas de inclusão econômica, sistemas de apoio) necessários para enfrentar (problema específico). Dessarte, essa insuficiência permite que desigualdades econômicas se aprofundem, impedindo que o desenvolvimento se traduza em melhoria generalizada das condições sociais.",
          guidelines: "Estrutura: Joseph Stiglitz + Mecanismos Democratizadores + Instituições Responsáveis + Implementação + Consequências"
        },
        {
          id: "m4-concl",
          title: "Conclusão",
          description: "Portanto, construir um modelo de desenvolvimento econômico-social equitativo requer tanto redistribuição de recursos quanto fortalecimento de mecanismos democratizadores. Nessa perspectiva, [Ministério competente], em coordenação com [órgãos de desenvolvimento], deve implementar [programa de desenvolvimento inclusivo] através de [medidas concretas: políticas redistributivas, democratização de oportunidades, fortalecimento de grupos vulneráveis, sistemas de apoio], visando [desenvolvimento equitativo] e promoção de justiça social. Assim, será possível concretizar o desenvolvimento como liberdade proposto por Sen, mediante [cronograma de implementação], [investimentos sociais] e [sistema de monitoramento distributivo].",
          guidelines: "Estrutura: Síntese + Ministério + Programa + Medidas Concretas + Objetivo + Referência a Sen + Cronograma"
        }
      ],
      guide: {
        whenToUse: ["Questões de distribuição de renda", "Acesso ao ensino superior e mercado de trabalho", "Políticas de desenvolvimento regional", "Microcrédito e inclusão bancária"],
        whenNotToUse: ["Questões puramente sociais sem componente econômico", "Problemas comportamentais", "Temas culturais sem aspecto econômico"],
        advantages: ["Abordagem econômica sofisticada", "Conecta teoria econômica com política social", "Muito adequado para temas de desenvolvimento"]
      },
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: "model-5",
      name: "Modelo 5: Mudanças Comportamentais",
      userId: "system",
      sections: [
        {
          id: "m5-intro",
          title: "Introdução",
          description: "Os padrões comportamentais de uma sociedade refletem valores, crenças e atitudes que influenciam diretamente a forma como problemas coletivos são percebidos e enfrentados. Albert Bandura, através da \"teoria da aprendizagem social\", demonstrou que comportamentos são aprendidos e reproduzidos através da observação e imitação de modelos sociais. Contudo, esses padrões comportamentais manifestam-se de forma problemática na questão (tema específico), evidenciando como dinâmicas comportamentais podem perpetuar ou agravar questões coletivas. Assim sendo, tal situação é intensificada pela reprodução de padrões comportamentais inadequados e pela ausência de modelos comportamentais positivos que inspirem transformações sociais.",
          guidelines: "Estrutura: Padrões Comportamentais + Albert Bandura + Aprendizagem Social + Tema Específico + Padrões Inadequados + Modelos Positivos"
        },
        {
          id: "m5-dev1",
          title: "Primeiro Desenvolvimento - Padrões Inadequados",
          description: "Primordialmente, pesquisas de [centro de estudos comportamentais] revelam que (inserir dado sobre comportamentos ou atitudes sociais). Dessa forma, verifica-se reprodução sistemática de padrões comportamentais inadequados relacionados ao tema, caracterizados por (normalização de comportamentos problemáticos, reprodução de atitudes prejudiciais, resistência a mudanças comportamentais, perpetuação de práticas inadequadas, conformismo diante de problemas). Diferentes grupos sociais - incluindo (formadores de opinião, lideranças, educadores, comunicadores, influenciadores) - frequentemente demonstram (comportamentos que perpetuam o problema, atitudes inadequadas, resistência a transformações, reprodução de modelos negativos) que são inconscientemente assimilados e reproduzidos pela população, contribuindo para a manutenção de (problema específico). Assim, essa reprodução de padrões inadequados cria um ciclo onde comportamentos problemáticos são naturalizados e transmitidos como condutas socialmente aceitáveis.",
          guidelines: "Estrutura: Pesquisas + Padrões Inadequados + Grupos Sociais + Comportamentos Problemáticos + Ciclo de Reprodução"
        },
        {
          id: "m5-dev2",
          title: "Segundo Desenvolvimento - Ausência de Modelos Positivos",
          description: "Além disso, Viktor Frankl demonstrou que a presença de modelos significativos e inspiradores é essencial para motivar transformações comportamentais duradouras e construtivas. Nessa perspectiva, observa-se carência de modelos comportamentais positivos relacionados ao tema, evidenciada pela (ausência de referências inspiradoras, falta de exemplos transformadores, carência de narrativas motivadoras, insuficiência de casos de sucesso, limitação de modelos construtivos). Instituições e lideranças - como (sistemas educativos, meios de comunicação, organizações sociais, lideranças comunitárias) - não conseguem apresentar adequadamente (modelos de comportamento construtivo, exemplos de transformação positiva, histórias inspiradoras, casos de superação) que poderiam motivar mudanças comportamentais relacionadas a (problema específico). Dessarte, essa ausência de inspiração deixa a sociedade sem referências positivas para orientar transformações comportamentais, dificultando processos de mudança social construtiva.",
          guidelines: "Estrutura: Viktor Frankl + Modelos Positivos + Carência de Referências + Instituições e Lideranças + Ausência de Inspiração"
        },
        {
          id: "m5-concl",
          title: "Conclusão",
          description: "Em suma, transformar padrões comportamentais coletivos requer tanto desconstrução de modelos inadequados quanto promoção de referências positivas inspiradoras. Por conseguinte, [Ministério competente], em parceria com [educadores e comunicadores], deve implementar [programa de transformação comportamental] através de [ações específicas: campanhas educativas, formação de modelos positivos, criação de narrativas inspiradoras, desenvolvimento de referências construtivas], com o objetivo de [transformação comportamental] e promoção de mudanças sociais duradouras. Assim, será possível aplicar os princípios da aprendizagem social para transformações positivas, mediante [implementação gradual], [investimento em educação comportamental] e [monitoramento de mudanças sociais].",
          guidelines: "Estrutura: Síntese + Ministério + Programa + Ações Específicas + Objetivo + Aprendizagem Social + Cronograma"
        }
      ],
      guide: {
        whenToUse: ["Bullying e violência escolar", "Violência contra mulher e machismo", "Preconceito e discriminação social", "Consumismo e meio ambiente"],
        whenNotToUse: ["Problemas estruturais ou institucionais", "Questões econômicas complexas", "Temas que exigem abordagem legal"],
        advantages: ["Foca na mudança de mentalidade", "Abordagem psicológica respeitada", "Ideal para temas comportamentais"]
      },
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: "model-6", 
      name: "Modelo 6: Questões Jurídico-Institucionais",
      userId: "system",
      sections: [
        {
          id: "m6-intro",
          title: "Introdução",
          description: "O funcionamento adequado de uma sociedade democrática pressupõe a existência de marcos normativos eficazes e instituições capazes de garantir direitos e solucionar problemas coletivos. Ronald Dworkin, em sua teoria sobre a \"integridade do direito\", defendia que princípios de igualdade e justiça devem ser concretamente efetivados, não apenas formalmente declarados. Todavia, a persistência da questão (tema específico) revela contradições entre marcos legais estabelecidos e sua aplicação efetiva na realidade social. Nesse contexto, tal inefetividade é intensificada por deficiências nos sistemas de aplicação normativa e pela inadequação das estruturas institucionais responsáveis pela garantia de direitos.",
          guidelines: "Estrutura: Sociedade Democrática + Ronald Dworkin + Integridade do Direito + Tema Específico + Deficiências + Inadequação"
        },
        {
          id: "m6-dev1",
          title: "Primeiro Desenvolvimento - Deficiências de Aplicação",
          description: "Primordialmente, dados de [órgão de controle institucional] revelam que (inserir estatística sobre aplicação de normas ou efetividade institucional). Diante disso, observam-se deficiências sistemáticas nos processos de aplicação normativa relacionados ao tema, evidenciadas por (morosidade nos processos, custos elevados de acesso, complexidade excessiva de procedimentos, desigualdades no tratamento, burocratização que dificulta efetivação). Instituições aplicadoras - incluindo (órgãos de controle, tribunais, organizações reguladoras, entidades fiscalizadoras) - sistematicamente falham em garantir (celeridade na resolução, acesso democrático aos direitos, igualdade de tratamento, proteção efetiva) relacionados ao enfrentamento de (problema específico). Assim, essa ineficiência na aplicação transforma direitos formalmente assegurados em meras declarações, perpetuando lacunas entre a norma e sua efetivação prática.",
          guidelines: "Estrutura: Dados Institucionais + Deficiências Sistemáticas + Instituições Aplicadoras + Falhas + Consequências"
        },
        {
          id: "m6-dev2",
          title: "Segundo Desenvolvimento - Inadequação Institucional",
          description: "Além disso, Norberto Bobbio alertava que a proliferação normativa sem estruturas institucionais adequadas compromete gravemente a eficácia dos sistemas jurídicos. Nessa perspectiva, verifica-se inadequação das estruturas institucionais para enfrentar demandas contemporâneas relacionadas ao tema, caracterizada por (desatualização de marcos normativos, conflitos de competências, sobreposição de atribuições, falta de especialização, ausência de mecanismos de avaliação). Diferentes instituições - como (órgãos públicos, entidades reguladoras, organizações de controle, sistemas de justiça) - sistematicamente apresentam (desalinhamento de competências, falta de coordenação, ausência de especialização, resistência a modernizações) necessárias para enfrentar adequadamente (problema específico). Dessarte, essas inadequações institucionais criam lacunas operacionais que impedem que o sistema normativo cumpra sua função transformadora.",
          guidelines: "Estrutura: Norberto Bobbio + Inadequação Institucional + Diferentes Instituições + Desalinhamento + Lacunas Operacionais"
        },
        {
          id: "m6-concl",
          title: "Conclusão",
          description: "Em suma, a efetivação plena de direitos e soluções institucionais requer tanto modernização dos sistemas de aplicação quanto adequação das estruturas institucionais. Por conseguinte, [Poder competente], em articulação com [órgãos especializados], deve promover [reforma ou modernização institucional] mediante [ações específicas: atualização normativa, especialização institucional, criação de mecanismos de controle, otimização de processos], com a finalidade de [efetividade institucional] e garantir soluções efetivas. Assim, será possível concretizar a integridade do direito defendida por Dworkin, através de [implementação gradual], [investimentos em modernização] e [sistema de monitoramento de efetividade].",
          guidelines: "Estrutura: Síntese + Poder Competente + Reforma + Ações Específicas + Finalidade + Dworkin + Cronograma"
        }
      ],
      guide: {
        whenToUse: ["Morosidade do judiciário", "Efetivação de direitos constitucionais", "Problemas no sistema prisional", "Acesso à justiça e defensoria pública"],
        whenNotToUse: ["Problemas comportamentais ou culturais", "Questões econômicas sem aspecto legal", "Temas que exigem abordagem social"],
        advantages: ["Abordagem jurídica técnica e respeitada", "Ideal para temas sobre direitos e justiça", "Linguagem sofisticada para o direito"]
      },
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: "model-7",
      name: "Modelo 7: Informação e Comunicação Social", 
      userId: "system",
      sections: [
        {
          id: "m7-intro",
          title: "Introdução",
          description: "A qualidade da democracia e a capacidade de uma sociedade enfrentar seus desafios dependem fundamentalmente da qualidade da informação disponível e da capacidade crítica da população para processar conteúdos complexos. Jürgen Habermas, em sua teoria sobre \"esfera pública\", defendia que a democracia depende de espaços comunicacionais onde diferentes perspectivas podem ser debatidas de forma racional e informada. Entretanto, os processos comunicacionais contemporâneos não têm contribuído adequadamente para solucionar questões como (tema específico), revelando como distorções na comunicação social podem perpetuar problemas coletivos. Nesse sentido, essa disfunção é agravada pela manipulação de informações por grupos de interesse e pela passividade crítica da população diante de conteúdos informacionais.",
          guidelines: "Estrutura: Qualidade da Democracia + Jürgen Habermas + Esfera Pública + Tema Específico + Manipulação + Passividade"
        },
        {
          id: "m7-dev1",
          title: "Primeiro Desenvolvimento - Manipulação Informacional",
          description: "Primordialmente, dados de [institutos de pesquisa em comunicação] revelam que (inserir estatística sobre qualidade informacional ou concentração midiática). Nesse sentido, verifica-se manipulação sistemática de fluxos informacionais relacionados ao tema, evidenciada por (controle de narrativas por grupos específicos, produção direcionada de conteúdos, uso de algoritmos para amplificar certas perspectivas, financiamento de narrativas específicas, omissão de informações relevantes). Diferentes atores comunicacionais - incluindo (conglomerados de mídia, plataformas digitais, grupos de interesse, organizações influentes) - sistematicamente distorcem (percepção pública sobre o problema, debates democráticos sobre soluções, acesso a informações diversificadas, compreensão sobre causas) relacionados a (problema específico). Assim, essa manipulação informacional impede que a população tenha acesso a informações equilibradas e diversificadas, dificultando a formação de opiniões fundamentadas e a mobilização para soluções efetivas.",
          guidelines: "Estrutura: Dados de Comunicação + Manipulação Informacional + Atores Comunicacionais + Distorção + Consequências"
        },
        {
          id: "m7-dev2",
          title: "Segundo Desenvolvimento - Passividade Crítica",
          description: "Outrossim, Neil Postman alertava sobre os riscos de uma sociedade que privilegia entretenimento sobre reflexão crítica, comprometendo a capacidade de análise profunda de questões complexas. Nessa perspectiva, observa-se passividade crítica da população diante de informações sobre o tema, caracterizada por (consumo acrítico de informações, preferência por conteúdos superficiais, resistência a análises complexas, polarização emocional, ausência de verificação de fontes). Cidadãos e diferentes grupos sociais - incluindo (usuários de redes sociais, consumidores de mídia, formadores de opinião, lideranças) - consistentemente evitam (aprofundamento em questões complexas, verificação de informações, busca por perspectivas diversificadas, reflexão crítica sobre fontes) necessários para compreender adequadamente (problema específico). Dessarte, essa passividade intelectual transforma a população em receptores passivos de informação, impedindo o desenvolvimento de capacidade crítica necessária para participar efetivamente de debates democráticos.",
          guidelines: "Estrutura: Neil Postman + Passividade Crítica + Diferentes Grupos + Evitam Análise + Receptores Passivos"
        },
        {
          id: "m7-concl",
          title: "Conclusão",
          description: "Portanto, democratizar a comunicação requer tanto regulação de práticas manipuladoras quanto desenvolvimento de capacidades críticas na população. Nessa perspectiva, [Ministério competente], em parceria com [universidades e sociedade civil], deve criar [programa de educação midiática e democratização comunicacional] através de [ações específicas: regulação de práticas manipuladoras, programas de alfabetização midiática, fortalecimento de fontes diversificadas, criação de espaços de debate qualificado], visando [democratização da comunicação] e desenvolvimento de cidadania crítica. Assim, será possível concretizar a esfera pública democrática proposta por Habermas, mediante [implementação gradual], [investimento em educação midiática] e [sistema de monitoramento da qualidade informacional].",
          guidelines: "Estrutura: Síntese + Ministério + Programa + Ações Específicas + Objetivo + Habermas + Cronograma"
        }
      ],
      guide: {
        whenToUse: ["Fake news e desinformação", "Concentração de mídia", "Redes sociais e polarização", "Educação midiática"],
        whenNotToUse: ["Problemas que não envolvem comunicação", "Questões puramente econômicas ou sociais", "Temas técnicos sem componente comunicacional"],
        advantages: ["Muito atual e relevante", "Conecta tecnologia com questões sociais", "Abordagem comunicacional sofisticada"]
      },
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ];

  const [selectedStructure, setSelectedStructure] = useState<EssayStructure | null>(null);
  const [activeFilter, setActiveFilter] = useState<'all' | 'predefined' | 'custom'>('all');
  const [essayTopic, setEssayTopic] = useState("");
  const [additionalInstructions, setAdditionalInstructions] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedEssay, setGeneratedEssay] = useState("");
  const [showResult, setShowResult] = useState(false);
  const [usedStructure, setUsedStructure] = useState<EssayStructure | null>(null);
  const [suggestedStructure, setSuggestedStructure] = useState<EssayStructure | null>(null);
  
  // Combinar estruturas predefinidas com estruturas do usuário
  const allStructures = [...predefinedStructures, ...structures];
  
  // Aplicar filtros e busca
  const filteredStructures = allStructures.filter((structure) => {
    // Filtro por tipo
    if (activeFilter === 'predefined' && structure.userId !== 'system') return false;
    if (activeFilter === 'custom' && structure.userId === 'system') return false;
    
    // Filtro por busca
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase();
      return structure.name.toLowerCase().includes(searchLower);
    }
    
    return true;
  });
  
  const filteredPredefined = filteredStructures.filter(s => s.userId === 'system');
  const filteredCustom = filteredStructures.filter(s => s.userId !== 'system');
  const selectedPredefinedStructure = selectedStructure && predefinedStructures.find(s => s.id === selectedStructure.id);


  const generateEssayContent = (structure: EssayStructure, topic: string, instructions: string): string => {
    const sections = Array.isArray(structure.sections) ? structure.sections as Section[] : [];
    let essay = "";
    
    essay += `**${topic}**\n\n`;
    
    sections.forEach((section, index) => {
      essay += `**${section.title || `Seção ${index + 1}`}**\n\n`;
      
      if (section.description) {
        essay += `${section.description}\n\n`;
      }
      
      // Gerar conteúdo baseado no tipo de seção e tema
      switch (section.title?.toLowerCase()) {
        case 'introdução':
          essay += `A questão sobre "${topic}" tem se tornado cada vez mais relevante em nossa sociedade contemporânea. Este tema desperta debates importantes e merece uma análise cuidadosa dos seus múltiplos aspectos.\n\n`;
          break;
        case 'desenvolvimento':
        case 'desenvolvimento 1':
        case 'desenvolvimento 2':
          essay += `No que se refere a ${topic.toLowerCase()}, é fundamental considerarmos os diversos fatores que influenciam esta questão. Os dados atuais demonstram a complexidade do tema e a necessidade de uma abordagem multidisciplinar para sua compreensão.\n\n`;
          break;
        case 'conclusão':
          essay += `Em síntese, a questão sobre "${topic}" demanda atenção especial da sociedade e das instituições. É necessário que sejam implementadas medidas efetivas para abordar adequadamente esta temática, promovendo o bem-estar social e o desenvolvimento sustentável.\n\n`;
          break;
        default:
          essay += `Em relação a ${topic.toLowerCase()}, esta seção aborda aspectos fundamentais que contribuem para uma compreensão mais ampla do tema proposto.\n\n`;
      }
    });
    
    if (instructions.trim()) {
      essay += `\n---\n**Instruções consideradas:** ${instructions}\n`;
    }
    
    return essay;
  };

  // Função para sugerir o melhor modelo baseado no tema
  const suggestBestModel = () => {
    if (!essayTopic.trim()) {
      toast({
        title: "Campo obrigatório",
        description: "Insira o tema da redação para receber sugestões.",
        variant: "destructive",
      });
      return;
    }

    const topic = essayTopic.toLowerCase();
    let bestMatch = predefinedStructures[0]; // Padrão: Universal Clássico
    
    // Análise de palavras-chave para sugerir o melhor modelo
    if (topic.includes('desigualdade') || topic.includes('distribuição') || topic.includes('renda') || topic.includes('exclusão') || topic.includes('discriminação')) {
      bestMatch = predefinedStructures[1]; // Desigualdades Estruturais
    } else if (topic.includes('histórico') || topic.includes('cultura') || topic.includes('tradição') || topic.includes('racial') || topic.includes('gênero') || topic.includes('machismo')) {
      bestMatch = predefinedStructures[2]; // Herança Histórico-Cultural
    } else if (topic.includes('econômic') || topic.includes('desenvolviment') || topic.includes('mercado') || topic.includes('emprego') || topic.includes('renda')) {
      bestMatch = predefinedStructures[3]; // Fatores Econômico-Sociais
    } else if (topic.includes('comportament') || topic.includes('violênc') || topic.includes('bullying') || topic.includes('preconceito') || topic.includes('consumismo')) {
      bestMatch = predefinedStructures[4]; // Mudanças Comportamentais
    } else if (topic.includes('justiça') || topic.includes('direito') || topic.includes('lei') || topic.includes('judiciário') || topic.includes('constitucional')) {
      bestMatch = predefinedStructures[5]; // Questões Jurídico-Institucionais
    } else if (topic.includes('mídia') || topic.includes('informação') || topic.includes('comunicação') || topic.includes('fake news') || topic.includes('redes sociais')) {
      bestMatch = predefinedStructures[6]; // Informação e Comunicação Social
    }

    setSelectedStructure(bestMatch);
    setSuggestedStructure(bestMatch);
    
    toast({
      title: "✨ Modelo sugerido!",
      description: `"${bestMatch.name}" é o melhor modelo para seu tema.`,
    });
  };

  const handleGenerateEssay = async () => {
    if (!essayTopic.trim()) {
      toast({
        title: "Campo obrigatório",
        description: "Insira o tema da redação.",
        variant: "destructive",
      });
      return;
    }

    // Usar estrutura selecionada ou estrutura de exemplo por padrão
    const structureToUse = selectedStructure || predefinedStructures[0];
    if (!structureToUse) {
      toast({
        title: "Erro",
        description: "Nenhuma estrutura disponível.",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    
    try {
      // Generate essay using AI
      const response = await apiRequest("/api/essays/generate", {
        method: "POST",
        body: JSON.stringify({
          structureName: structureToUse.name,
          sections: Array.isArray(structureToUse.sections) ? structureToUse.sections : [],
          topic: essayTopic.trim(),
          additionalInstructions: additionalInstructions.trim() || undefined
        }),
      });

      if (response.success) {
        setGeneratedEssay(response.essay);
        setUsedStructure(structureToUse);
        setShowResult(true);
        
        toast({
          title: "Redação gerada com sucesso!",
          description: "Sua redação foi criada com IA seguindo a estrutura selecionada.",
        });
      } else {
        throw new Error(response.message || "Failed to generate essay");
      }
    } catch (error: any) {
      console.error("Essay generation error:", error);
      
      // Check for rate limiting (HTTP 429 status)
      if (error.status === 429) {
        toast({
          title: "Limite de uso atingido",
          description: "Você pode gerar 3 redações por hora. Tente novamente mais tarde.",
          variant: "destructive",
        });
      } else {
        // Fallback to local generation if AI fails
        const fallbackEssay = generateEssayContent(structureToUse, essayTopic, additionalInstructions);
        setGeneratedEssay(fallbackEssay);
        setUsedStructure(structureToUse);
        setShowResult(true);
        
        const errorMessage = error.status >= 400 && error.status < 500 
          ? "Erro na solicitação. Verifique os dados informados." 
          : "A IA está indisponível. Redação gerada com estrutura básica.";
        
        toast({
          title: "Redação gerada (modo offline)",
          description: errorMessage,
          variant: "default",
        });
      }
    } finally {
      setIsGenerating(false);
    }
  };

  // Se estiver mostrando resultado, renderizar tela de resultado
  if (showResult && generatedEssay && usedStructure) {
    return (
      <EssayResult
        essay={generatedEssay}
        topic={essayTopic}
        structure={usedStructure}
        instructions={additionalInstructions}
        onBack={() => {
          // Voltar direto para tela principal (estilo.tsx)
          onBack();
        }}
        onEdit={() => {
          setShowResult(false);
          // Manter os dados para continuar editando
        }}
        onNewEssay={() => {
          setShowResult(false);
          setGeneratedEssay("");
          setUsedStructure(null);
          setEssayTopic("");
          setAdditionalInstructions("");
          setSelectedStructure(null);
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-blue-50/30 to-purple-50/20">
      {/* Header */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md shadow-sm border-b border-white/20">
        <div className="container mx-auto px-4 sm:px-6 py-3 sm:py-4">
          {/* Mobile Layout */}
          <div className="flex sm:hidden items-center justify-between">
            <Button 
              variant="outline" 
              onClick={onBack} 
              size="sm"
              className="flex items-center space-x-1 h-8 px-2 text-xs"
              data-testid="button-voltar"
            >
              <ArrowLeft size={14} />
              <span>Voltar</span>
            </Button>
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-bright-blue to-purple-600 rounded-full flex items-center justify-center">
                <FileText className="text-white" size={14} />
              </div>
              <h1 className="text-sm font-bold text-dark-blue truncate">Usar Estrutura</h1>
            </div>
          </div>
          
          {/* Desktop Layout */}
          <div className="hidden sm:flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <Button 
                variant="outline" 
                onClick={onBack} 
                size="sm"
                className="flex items-center space-x-2"
                data-testid="button-voltar"
              >
                <ArrowLeft size={16} />
                <span>Voltar</span>
              </Button>
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-br from-bright-blue to-purple-600 rounded-full flex items-center justify-center">
                  <FileText className="text-white" size={20} />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-dark-blue">Usar Estrutura Existente</h1>
                </div>
              </div>
            </div>
            <div>
              <p className="text-soft-gray">Selecione uma estrutura salva e gere redações seguindo esse modelo</p>
            </div>
          </div>
        </div>
        
        {/* AI Usage Progress - Integrado no header */}
        <div className="border-t border-white/10">
          <div className="container mx-auto px-4 sm:px-6 py-1.5 sm:py-2">
            <AIUsageProgress variant="inline" />
          </div>
        </div>
      </div>

      {/* Conteúdo principal com espaçamento para header fixo */}
      <div className="container mx-auto px-3 md:px-4 py-4 md:py-8 pt-32 md:pt-36">

        <div className="space-y-3 md:space-y-6">
          {/* Proposta de Redação - PRIMEIRO ELEMENTO */}
          <LiquidGlassCard className="p-3 md:p-6">
            <div className="flex items-center gap-2 mb-3 md:mb-4">
              <PenTool className="h-4 w-4 md:h-5 md:w-5 text-bright-blue" />
              <h3 className="text-base md:text-lg font-semibold text-dark-blue">
                1. Proposta de Redação
              </h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
              <div>
                <Label htmlFor="essay-topic" className="text-sm md:text-base text-dark-blue font-medium">
                  Proposta da Redação *
                </Label>
                <Textarea
                  id="essay-topic"
                  placeholder="Ex: A importância da educação digital no século XXI"
                  value={essayTopic}
                  onChange={(e) => setEssayTopic(e.target.value)}
                  rows={3}
                  className="mt-1 text-sm md:text-base min-h-[70px] md:min-h-[80px]"
                  data-testid="textarea-tema-redacao"
                />
                <p className="text-xs text-soft-gray mt-1">
                  Defina claramente a proposta central da sua redação
                </p>
              </div>

              <div>
                <Label htmlFor="additional-instructions" className="text-sm md:text-base text-dark-blue font-medium">
                  Instruções Especiais (opcional)
                </Label>
                <Textarea
                  id="additional-instructions"
                  placeholder="Ex: Abordagem argumentativa, público jovem, incluir dados estatísticos..."
                  value={additionalInstructions}
                  onChange={(e) => setAdditionalInstructions(e.target.value)}
                  rows={3}
                  className="mt-1 text-sm md:text-base min-h-[70px] md:min-h-[80px]"
                  data-testid="textarea-instrucoes-adicionais"
                />
                <p className="text-xs text-soft-gray mt-1">
                  Requisitos específicos, tom, estilo ou público-alvo
                </p>
              </div>
            </div>
          </LiquidGlassCard>

          {/* Modelos Disponíveis - UNIFICADO */}
          <LiquidGlassCard className="p-3 md:p-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-3 md:mb-4 gap-2">
              <h2 className="text-lg md:text-xl font-semibold text-dark-blue">
                2. Selecione um Modelo
              </h2>
              <div className="flex items-center gap-1 md:gap-2">
                <Badge variant="outline" className="text-gray-600 border-gray-600 text-xs px-2 py-1">
                  {predefinedStructures.length} predefinidos
                </Badge>
                <Badge variant="outline" className="text-blue-600 border-blue-600 text-xs px-2 py-1">
                  {structures.length} personalizadas
                </Badge>
              </div>
            </div>

            {/* Filtros e Busca */}
            <div className="mb-4 md:mb-6 space-y-3 md:space-y-4">
              {/* Botões de Filtro */}
              <div className="flex flex-wrap gap-2 md:gap-3">
                <Button
                  variant={activeFilter === 'all' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setActiveFilter('all')}
                  className={`text-xs md:text-sm h-8 md:h-10 px-3 md:px-4 ${
                    activeFilter === 'all' 
                      ? 'bg-bright-blue hover:bg-blue-600 text-white' 
                      : 'border-bright-blue text-bright-blue hover:bg-bright-blue/10'
                  }`}
                  data-testid="button-filter-all"
                >
                  <span className="hidden sm:inline">Todos os Modelos</span>
                  <span className="sm:hidden">Todos</span>
                </Button>
                <Button
                  variant={activeFilter === 'predefined' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setActiveFilter('predefined')}
                  className={`text-xs md:text-sm h-8 md:h-10 px-3 md:px-4 ${
                    activeFilter === 'predefined' 
                      ? 'bg-bright-blue hover:bg-blue-600 text-white' 
                      : 'border-bright-blue text-bright-blue hover:bg-bright-blue/10'
                  }`}
                  data-testid="button-filter-predefined"
                >
                  Predefinidos
                </Button>
                <Button
                  variant={activeFilter === 'custom' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setActiveFilter('custom')}
                  className={`text-xs md:text-sm h-8 md:h-10 px-3 md:px-4 ${
                    activeFilter === 'custom' 
                      ? 'bg-bright-blue hover:bg-blue-600 text-white' 
                      : 'border-bright-blue text-bright-blue hover:bg-bright-blue/10'
                  }`}
                  data-testid="button-filter-custom"
                >
                  Personalizadas
                </Button>
              </div>
              
              {/* Busca e Sugestão */}
              <div className="flex flex-col sm:flex-row gap-2 md:gap-4 items-start sm:items-center justify-between">
                <div className="relative w-full sm:max-w-md sm:flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-3 w-3 md:h-4 md:w-4 text-soft-gray" />
                  <Input
                    placeholder="Buscar estruturas..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-8 md:pl-10 h-8 md:h-10 text-sm md:text-base"
                    data-testid="input-buscar-estruturas"
                  />
                </div>
                <Button
                  onClick={suggestBestModel}
                  variant="outline"
                  size="sm"
                  className={`flex-shrink-0 w-full sm:w-auto text-xs md:text-sm h-8 md:h-10 px-3 md:px-4 ${
                    essayTopic.trim() 
                      ? 'border-green-500 text-green-600 hover:bg-green-50' 
                      : 'border-gray-500 text-gray-600 hover:bg-gray-50'
                  }`}
                  disabled={!essayTopic.trim()}
                  data-testid="button-sugerir-modelo"
                >
                  <Lightbulb className="mr-1 md:mr-2 h-3 w-3 md:h-4 md:w-4" />
                  <span className="hidden sm:inline">Sugerir Melhor Modelo</span>
                  <span className="sm:hidden">Sugerir</span>
                </Button>
              </div>
            </div>

            {/* Modelos Predefinidos */}
            {(activeFilter === 'all' || activeFilter === 'predefined') && (
              <div className="mb-4 md:mb-6">
                <h3 className="text-base md:text-lg font-medium text-dark-blue mb-2 md:mb-3 flex items-center gap-2">
                  <span className="w-5 h-5 md:w-6 md:h-6 bg-gray-100 rounded-full flex items-center justify-center text-xs text-gray-600">P</span>
                  <span className="hidden sm:inline">Modelos Predefinidos Coringa</span>
                  <span className="sm:hidden">Predefinidos</span>
                </h3>
              
              {filteredPredefined.length === 0 ? (
                <div className="text-center py-4 md:py-6 text-soft-gray">
                  <FileText className="mx-auto h-6 w-6 md:h-8 md:w-8 mb-2 opacity-50" />
                  <p className="text-xs md:text-sm">Nenhum modelo predefinido encontrado</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-4">
                  {filteredPredefined.map((structure) => (
                    <Card 
                      key={structure.id}
                      className={`cursor-pointer transition-all hover:shadow-md border-2 ${
                        selectedStructure?.id === structure.id
                          ? suggestedStructure?.id === structure.id
                            ? 'ring-2 ring-green-500 bg-green-50/50 border-green-400'
                            : 'ring-2 ring-bright-blue bg-bright-blue/5 border-bright-blue'
                          : suggestedStructure?.id === structure.id
                          ? 'ring-2 ring-green-500 bg-green-50/30 border-green-300'
                          : 'hover:bg-gray-50 border-gray-200'
                      }`}
                      onClick={() => setSelectedStructure(structure)}
                      data-testid={`card-estrutura-${structure.id}`}
                    >
                      <CardHeader className="pb-2 px-3 md:px-6 pt-3 md:pt-6">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <CardTitle className="text-sm md:text-base text-dark-blue line-clamp-2">
                              {structure.name}
                            </CardTitle>
                            {suggestedStructure?.id === structure.id && (
                              <Badge variant="outline" className="mt-1 text-xs text-green-600 border-green-600">
                                ✨ Sugerido
                              </Badge>
                            )}
                          </div>
                          <div className="flex flex-col items-end gap-1">
                            <Badge variant="secondary" className="text-xs">
                              {Array.isArray(structure.sections) ? structure.sections.length : 0} seções
                            </Badge>
                            {structure.userId === 'system' && 'guide' in structure && structure.guide && (
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-5 w-5 md:h-6 md:w-6 p-0 text-bright-blue hover:bg-bright-blue/10"
                                    onClick={(e) => e.stopPropagation()}
                                    data-testid={`button-guide-${structure.id}`}
                                  >
                                    <HelpCircle className="h-3 w-3 md:h-4 md:w-4" />
                                  </Button>
                                </DialogTrigger>
                                <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                                  <DialogHeader>
                                    <DialogTitle className="text-xl font-semibold text-dark-blue">
                                      Guia de Uso: {structure.name}
                                    </DialogTitle>
                                  </DialogHeader>

                                  {structure.guide && (
                                    <div className="space-y-6">
                                      {/* Quando Usar */}
                                      <div>
                                        <h3 className="text-lg font-semibold text-gray-600 mb-3 flex items-center">
                                          <span className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center mr-2 text-sm">✓</span>
                                          Quando Usar
                                        </h3>
                                        <ul className="space-y-2">
                                          {(structure as StructureWithGuide).guide?.whenToUse?.map((item: string, index: number) => (
                                            <li key={index} className="flex items-start gap-2 text-gray-700">
                                              <span className="text-gray-500 mt-1">•</span>
                                              <span>{item}</span>
                                            </li>
                                          )) || []}
                                        </ul>
                                      </div>

                                      {/* Quando NÃO Usar */}
                                      <div>
                                        <h3 className="text-lg font-semibold text-red-600 mb-3 flex items-center">
                                          <span className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center mr-2 text-sm">✗</span>
                                          Quando NÃO Usar
                                        </h3>
                                        <ul className="space-y-2">
                                          {(structure as StructureWithGuide).guide?.whenNotToUse?.map((item: string, index: number) => (
                                            <li key={index} className="flex items-start gap-2 text-gray-700">
                                              <span className="text-red-500 mt-1">•</span>
                                              <span>{item}</span>
                                            </li>
                                          )) || []}
                                        </ul>
                                      </div>

                                      {/* Vantagens */}
                                      <div>
                                        <h3 className="text-lg font-semibold text-blue-600 mb-3 flex items-center">
                                          <span className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mr-2 text-sm">⭐</span>
                                          Vantagens
                                        </h3>
                                        <ul className="space-y-2">
                                          {(structure as StructureWithGuide).guide?.advantages?.map((item: string, index: number) => (
                                            <li key={index} className="flex items-start gap-2 text-gray-700">
                                              <span className="text-blue-500 mt-1">•</span>
                                              <span>{item}</span>
                                            </li>
                                          )) || []}
                                        </ul>
                                      </div>

                                      {/* Estrutura do Modelo */}
                                      <div>
                                        <h3 className="text-lg font-semibold text-purple-600 mb-3 flex items-center">
                                          <span className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center mr-2 text-sm">📝</span>
                                          Estrutura do Modelo
                                        </h3>
                                        <div className="grid gap-3">
                                          {Array.isArray(structure.sections) && (structure.sections as Section[]).map((section, index) => (
                                            <div key={index} className="p-4 bg-gray-50 rounded-lg border">
                                              <h4 className="font-semibold text-gray-800 mb-2">
                                                {section.title}
                                              </h4>
                                              <p className="text-sm text-gray-600 mb-2">
                                                {section.description}
                                              </p>
                                              {section.guidelines && (
                                                <p className="text-xs text-gray-500 italic">
                                                  {section.guidelines}
                                                </p>
                                              )}
                                            </div>
                                          ))}
                                        </div>
                                      </div>
                                    </div>
                                  )}
                                </DialogContent>
                              </Dialog>
                            )}
                          </div>
                        </div>
                        <CardDescription className="text-xs mt-1">
                          Modelo predefinido com guia de uso
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="pt-0 px-3 md:px-6 pb-3 md:pb-6">
                        <div className="text-xs md:text-sm text-soft-gray">
                          {Array.isArray(structure.sections) && structure.sections.length > 0 && (
                            <div className="flex flex-wrap gap-1">
                              {(structure.sections as Section[]).slice(0, 1).map((section, index) => (
                                <Badge key={index} variant="outline" className="text-xs">
                                  {section.title || `Seção ${index + 1}`}
                                </Badge>
                              ))}
                              {structure.sections.length > 1 && (
                                <Badge variant="outline" className="text-xs">
                                  +{structure.sections.length - 1} mais
                                </Badge>
                              )}
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
              </div>
            )}

            {/* Estruturas Personalizadas */}
            {(structures.length > 0 || searchTerm.trim()) && (activeFilter === 'all' || activeFilter === 'custom') && (
              <div>
                <h3 className="text-base md:text-lg font-medium text-dark-blue mb-2 md:mb-3 flex items-center gap-2">
                  <span className="w-5 h-5 md:w-6 md:h-6 bg-blue-100 rounded-full flex items-center justify-center text-xs text-blue-600">U</span>
                  <span className="hidden sm:inline">Suas Estruturas Personalizadas</span>
                  <span className="sm:hidden">Personalizadas</span>
                </h3>
                
                {filteredCustom.length === 0 ? (
                  <div className="text-center py-4 md:py-6 text-soft-gray">
                    <FileText className="mx-auto h-6 w-6 md:h-8 md:w-8 mb-2 opacity-50" />
                    <p className="text-xs md:text-sm">
                      {searchTerm || activeFilter === 'custom' ? 'Nenhuma estrutura personalizada encontrada' : 'Crie suas estruturas na página "Criar Estrutura"'}
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-4">
                    {filteredCustom.map((structure) => (
                      <Card 
                        key={structure.id}
                        className={`cursor-pointer transition-all hover:shadow-md border-2 ${
                          selectedStructure?.id === structure.id 
                            ? 'ring-2 ring-bright-blue bg-bright-blue/5 border-bright-blue' 
                            : 'hover:bg-gray-50 border-blue-200'
                        }`}
                        onClick={() => setSelectedStructure(structure)}
                        data-testid={`card-estrutura-user-${structure.id}`}
                      >
                        <CardHeader className="pb-2 px-3 md:px-6 pt-3 md:pt-6">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              <CardTitle className="text-sm md:text-base text-dark-blue line-clamp-2">
                                {structure.name}
                              </CardTitle>
                              <CardDescription className="text-xs mt-1">
                                Criada em {new Date(structure.createdAt!).toLocaleDateString('pt-BR')}
                              </CardDescription>
                            </div>
                            <Badge variant="secondary" className="text-xs">
                              {Array.isArray(structure.sections) ? structure.sections.length : 0} seções
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent className="pt-0 px-3 md:px-6 pb-3 md:pb-6">
                          <div className="text-xs md:text-sm text-soft-gray">
                            {Array.isArray(structure.sections) && structure.sections.length > 0 && (
                              <div className="flex flex-wrap gap-1">
                                {(structure.sections as Section[]).slice(0, 1).map((section, index) => (
                                  <Badge key={index} variant="outline" className="text-xs">
                                    {section.title || `Seção ${index + 1}`}
                                  </Badge>
                                ))}
                                {structure.sections.length > 1 && (
                                  <Badge variant="outline" className="text-xs">
                                    +{structure.sections.length - 1} mais
                                  </Badge>
                                )}
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            )}
          </LiquidGlassCard>

          {/* Estrutura Selecionada - Segunda linha */}
          {selectedStructure && (
            <LiquidGlassCard className="p-3 md:p-6">
              <div className="flex flex-col lg:flex-row items-start justify-between gap-4 lg:gap-6">
                {/* Informações da estrutura */}
                <div className="flex-1 w-full lg:w-auto">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-3 mb-3 md:mb-4">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                      <h2 className="text-lg md:text-xl font-semibold text-dark-blue">
                        {selectedStructure.name}
                      </h2>
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge variant="secondary" className="text-xs">
                          {Array.isArray(selectedStructure.sections) ? selectedStructure.sections.length : 0} seções
                        </Badge>
                        {selectedStructure.userId === 'system' && (
                          <Badge variant="outline" className={`text-xs ${
                            suggestedStructure?.id === selectedStructure.id 
                              ? 'text-green-600 border-green-600' 
                              : 'text-bright-blue border-bright-blue'
                          }`}>
                            {suggestedStructure?.id === selectedStructure.id ? '✨ Sugerido' : 'Predefinido'}
                          </Badge>
                        )}
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedStructure(null);
                        setSuggestedStructure(null);
                      }}
                      className="border-red-400 text-red-600 hover:bg-red-50 text-xs md:text-sm h-8 md:h-10 px-3 md:px-4 w-full sm:w-auto"
                      data-testid="button-desselecionar-modelo"
                    >
                      <X className="mr-1 md:mr-2 h-3 w-3 md:h-4 md:w-4" />
                      Desselecionar
                    </Button>
                  </div>
                  
                  {/* Preview das seções */}
                  <div className="space-y-2">
                    {Array.isArray(selectedStructure.sections) && selectedStructure.sections.length > 0 && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-3">
                        {(selectedStructure.sections as Section[]).map((section, index) => (
                          <div key={index} className="p-2 md:p-3 bg-bright-blue/5 rounded-lg border border-bright-blue/20">
                            <h4 className="font-medium text-dark-blue text-xs md:text-sm">
                              {section.title || `Seção ${index + 1}`}
                            </h4>
                            <p className="text-xs text-soft-gray mt-1 line-clamp-2">
                              {section.description}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Botões de ação */}
                <div className="flex flex-row lg:flex-col gap-2 lg:gap-3 w-full lg:min-w-[200px] lg:w-auto">
                  {selectedPredefinedStructure?.guide && (
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-gray-500 text-gray-600 hover:bg-gray-50 text-xs md:text-sm h-8 md:h-10 px-3 md:px-4 flex-1 lg:flex-none"
                          data-testid="button-view-guide-selected"
                        >
                          <Info className="mr-1 md:mr-2 h-3 w-3 md:h-4 md:w-4" />
                          <span className="hidden sm:inline">Ver Guia de Uso</span>
                          <span className="sm:hidden">Guia</span>
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle className="text-xl font-semibold text-dark-blue">
                            Guia de Uso: {selectedStructure.name}
                          </DialogTitle>
                        </DialogHeader>
                        {selectedPredefinedStructure.guide && (
                          <div className="space-y-6">
                            <div>
                              <h3 className="text-lg font-semibold text-gray-600 mb-3 flex items-center">
                                <span className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center mr-2 text-sm">✓</span>
                                Quando Usar
                              </h3>
                              <ul className="space-y-2">
                                {selectedPredefinedStructure.guide.whenToUse.map((item, index) => (
                                  <li key={index} className="flex items-start gap-2 text-gray-700">
                                    <span className="text-gray-500 mt-1">•</span>
                                    <span>{item}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                            <div>
                              <h3 className="text-lg font-semibold text-red-600 mb-3 flex items-center">
                                <span className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center mr-2 text-sm">✗</span>
                                Quando NÃO Usar
                              </h3>
                              <ul className="space-y-2">
                                {selectedPredefinedStructure.guide.whenNotToUse.map((item, index) => (
                                  <li key={index} className="flex items-start gap-2 text-gray-700">
                                    <span className="text-red-500 mt-1">•</span>
                                    <span>{item}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                            <div>
                              <h3 className="text-lg font-semibold text-blue-600 mb-3 flex items-center">
                                <span className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mr-2 text-sm">⭐</span>
                                Vantagens
                              </h3>
                              <ul className="space-y-2">
                                {selectedPredefinedStructure.guide.advantages.map((item, index) => (
                                  <li key={index} className="flex items-start gap-2 text-gray-700">
                                    <span className="text-blue-500 mt-1">•</span>
                                    <span>{item}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        )}
                      </DialogContent>
                    </Dialog>
                  )}
                  <Button
                    variant="outline"
                    className="border-bright-blue text-bright-blue hover:bg-bright-blue/10"
                    onClick={() => {
                      if (selectedStructure) {
                        // Salvar dados da estrutura temporariamente no sessionStorage
                        sessionStorage.setItem('structureToEdit', JSON.stringify(selectedStructure));
                        // Salvar página atual como página anterior
                        sessionStorage.setItem('previousPage', window.location.pathname + window.location.search);
                        // Navegar para nova página de edição
                        setLocation('/edit-structure');
                      }
                    }}
                    data-testid="button-editar-estrutura"
                  >
                    <Edit3 className="mr-2 h-4 w-4" />
                    Editar Estrutura
                  </Button>
                </div>
              </div>
            </LiquidGlassCard>
          )}

          {/* Botão de Geração - SEMPRE VISÍVEL NO FINAL */}
          <LiquidGlassCard>
            <div className="flex items-center gap-2 mb-4">
              <Play className="h-5 w-5 text-bright-blue" />
              <h3 className="text-lg font-semibold text-dark-blue">
                3. Gerar Redação
              </h3>
            </div>
            
            <div className="text-center">
              <p className="text-sm text-soft-gray mb-4">
                {selectedStructure 
                  ? suggestedStructure?.id === selectedStructure.id
                    ? `🌟 Gerar redação com modelo sugerido: ${selectedStructure.name}`
                    : `✅ Gerar redação com: ${selectedStructure.name}` 
                  : '⚠️ Selecione um modelo ou use a estrutura padrão'
                }
              </p>
              <Button
                onClick={handleGenerateEssay}
                disabled={!essayTopic.trim() || isGenerating}
                className="bg-bright-blue hover:bg-blue-600 px-8 py-3 text-lg"
                data-testid="button-gerar-redacao"
              >
                {isGenerating ? (
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                ) : (
                  <Play className="mr-2 h-5 w-5" />
                )}
                {isGenerating ? "Gerando Redação..." : "Gerar Redação com IA"}
              </Button>
            </div>
          </LiquidGlassCard>



          
        </div>
      </div>
    </div>
  );
}