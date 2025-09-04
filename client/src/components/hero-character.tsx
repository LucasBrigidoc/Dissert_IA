interface HeroCharacterProps {
  variant?: "default" | "study" | "ai";
  size?: "sm" | "md" | "lg";
}

export function HeroCharacter({ variant = "default", size = "md" }: HeroCharacterProps) {
  const sizeClasses = {
    sm: "w-32 h-32",
    md: "w-[450px] h-[450px]",
    lg: "w-[500px] h-[500px]"
  };

  if (variant === "study") {
    return (
      <div className={`relative ${sizeClasses[size]} mx-auto`}>
        <img 
          src="/imagem/22.svg" 
          alt="Hero Character Study" 
          className={`${sizeClasses[size]} object-contain mx-auto`}
          data-testid="hero-character-study-image"
        />
      </div>
    );
  }

  if (variant === "ai") {
    return (
      <div className={`relative ${sizeClasses[size]} mx-auto`}>
        <img 
          src="/imagem/21.svg" 
          alt="Hero Character AI" 
          className={`${sizeClasses[size]} object-contain mx-auto`}
          data-testid="hero-character-ai-image"
        />
      </div>
    );
  }

  return (
    <div className={`relative ${sizeClasses[size]} mx-auto`}>
      <img 
        src="/imagem/21.svg" 
        alt="Hero Character" 
        className={`${sizeClasses[size]} object-contain mx-auto`}
        data-testid="hero-character-image"
      />
    </div>
  );
}
