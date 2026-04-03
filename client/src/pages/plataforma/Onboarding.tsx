import SaasDashboardLayout from "@/components/SaasDashboardLayout";
import { Construction } from "lucide-react";

export default function Onboarding() {
  return (
    <SaasDashboardLayout>
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 text-center">
        <div className="w-16 h-16 rounded-2xl bg-[#1a2744] flex items-center justify-center">
          <Construction size={32} className="text-[#C8102E]" />
        </div>
        <h1 className="text-2xl font-bold text-white">Onboarding</h1>
        <p className="text-gray-400 max-w-md">Guia de configuração inicial da plataforma OPERIS.</p>
        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-[#C8102E]/20 text-[#C8102E] border border-[#C8102E]/30">
          Em desenvolvimento — disponível em breve
        </span>
      </div>
    </SaasDashboardLayout>
  );
}
