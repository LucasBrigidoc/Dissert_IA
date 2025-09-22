import { useLocation } from "wouter";
import { CreateStructure } from "@/pages/create-structure";

export default function CreateStructurePage() {
  const [, setLocation] = useLocation();

  const handleBack = () => {
    // Always go back to the estilo page
    setLocation('/estilo');
  };

  return (
    <CreateStructure 
      onBack={handleBack}
    />
  );
}