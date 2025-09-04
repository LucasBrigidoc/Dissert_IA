interface HeroCharacterProps {
  variant?: "default" | "study" | "ai";
  size?: "sm" | "md" | "lg";
}

export function HeroCharacter({ variant = "default", size = "md" }: HeroCharacterProps) {
  const sizeClasses = {
    sm: "w-32 h-32",
    md: "w-64 h-64",
    lg: "w-96 h-96"
  };

  if (variant === "study") {
    return (
      <div className={`relative ${sizeClasses[size]} mx-auto`}>
        {/* Yellow bean bag chair */}
        <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-48 h-32 bg-yellow-400 rounded-full"></div>
        {/* Student character */}
        <div className="absolute bottom-12 left-1/2 transform -translate-x-1/2 w-16 h-24 bg-orange-300 rounded-t-full"></div>
        {/* Laptop */}
        <div className="absolute bottom-16 left-1/2 transform -translate-x-1/2 translate-x-2 w-12 h-8 bg-gray-800 rounded"></div>
        {/* Books */}
        <div className="absolute bottom-2 right-8 w-12 h-16 bg-blue-400 rounded"></div>
        {/* Plant */}
        <div className="absolute bottom-2 left-8 w-8 h-12 bg-green-400 rounded-t-full"></div>
      </div>
    );
  }

  if (variant === "ai") {
    return (
      <div className={`relative ${sizeClasses[size]} mx-auto`}>
        {/* Student character */}
        <div className="absolute bottom-16 left-1/2 transform -translate-x-1/2 w-20 h-28 bg-blue-400 rounded-t-full"></div>
        {/* AI symbol */}
        <div className="absolute top-8 right-8 w-12 h-12 bg-white rounded-lg flex items-center justify-center">
          <span className="text-bright-blue font-bold">AI</span>
        </div>
        {/* Books stack */}
        <div className="absolute bottom-0 right-4 w-16 h-12 bg-yellow-400 rounded"></div>
      </div>
    );
  }

  return (
    <div className={`relative ${sizeClasses[size]} mx-auto`}>
      <img 
        src="/imagem/22.png" 
        alt="Hero Character" 
        className={`${sizeClasses[size]} object-contain mx-auto`}
        data-testid="hero-character-image"
      />
    </div>
  );
}
