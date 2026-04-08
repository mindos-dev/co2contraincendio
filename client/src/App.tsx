import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch, useLocation } from "wouter";
import { useEffect } from "react";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
// Site público
import Home from "./pages/Home";
import QuemSomos from "./pages/QuemSomos";
import Servicos from "./pages/Servicos";
import Contato from "./pages/Contato";
import Blog from "./pages/Blog";
import BlogPost from "./pages/BlogPost";
import SistemaSupressaoCO2 from "./pages/services/SistemaSupressaoCO2";
import RecargaCO2 from "./pages/services/RecargaCO2";
import SistemaSaponificante from "./pages/services/SistemaSaponificante";
import Hidrantes from "./pages/services/Hidrantes";
import AlarmeIncendio from "./pages/services/AlarmeIncendio";
import DetectorGas from "./pages/services/DetectorGas";
import VistoriaLaudoART from "./pages/services/VistoriaLaudoART";
import ManutencaoPreventiva from "./pages/services/ManutencaoPreventiva";
import ProjetoExaustao from "./pages/services/ProjetoExaustao";
import SistemasPreEngenheirados from "./pages/services/SistemasPreEngenheirados";
import ProtecaoVeiculosOffRoad from "./pages/services/ProtecaoVeiculosOffRoad";
import ProtecaoMaquinasCNC from "./pages/services/ProtecaoMaquinasCNC";
import ProtecaoPaineisEletricos from "./pages/services/ProtecaoPaineisEletricos";
import ProtecaoLaboratorios from "./pages/services/ProtecaoLaboratorios";
import ProtecaoCompartimentoMotor from "./pages/services/ProtecaoCompartimentoMotor";
import ProtecaoMaquinasIndustriais from "./pages/services/ProtecaoMaquinasIndustriais";
import ProtecaoGeradores from "@/pages/services/ProtecaoGeradores";
import AplicacoesEspeciais from "@/pages/services/AplicacoesEspeciais";
import Projetos from "./pages/Projetos";
import Parceiros from "./pages/Parceiros";

// Plataforma SaaS
import SaasLogin from "./pages/SaasLogin";
import SaasCadastro from "./pages/SaasCadastro";
import SaasEsqueciSenha from "./pages/SaasEsqueciSenha";
import SaasRedefinirSenha from "./pages/SaasRedefinirSenha";
import ExtintorPublico from "./pages/ExtintorPublico";
import EquipamentoPublico from "./pages/EquipamentoPublico";
import EquipamentoDetalhes from "./pages/plataforma/EquipamentoDetalhes";
import Dashboard from "./pages/plataforma/Dashboard";
import Equipamentos from "./pages/plataforma/Equipamentos";
import Manutencoes from "./pages/plataforma/Manutencoes";
import QRCodes from "./pages/plataforma/QRCodes";
import Alertas from "./pages/plataforma/Alertas";
import ScannerEquipamento from "./pages/plataforma/ScannerEquipamento";
import Documentos from "./pages/plataforma/Documentos";
import ArtOperis from "./pages/plataforma/ArtOperis";
import ArtDetalheView, { NovaArt } from "./pages/plataforma/ArtDetalhe";
import ArtAprovacoes from "./pages/plataforma/ArtAprovacoes";
import Notificacoes from "./pages/plataforma/Notificacoes";
import Clientes from "./pages/plataforma/Clientes";
import Relatorios from "./pages/plataforma/Relatorios";
import BuscaInteligente from "./pages/plataforma/BuscaInteligente";
import Usuarios from "./pages/app/Usuarios";
import OrdemServico from "./pages/plataforma/OrdemServico";
import Checklist from "./pages/plataforma/Checklist";
import Propostas from "./pages/plataforma/Propostas";
import Financeiro from "./pages/plataforma/Financeiro";
import NFSe from "./pages/plataforma/NFSe";
import Onboarding from "./pages/plataforma/Onboarding";
import Configuracoes from "./pages/plataforma/Configuracoes";
import Perfil from "./pages/plataforma/Perfil";
import Planos from "./pages/Planos";
import Assinatura from "./pages/plataforma/Assinatura";
import DashboardFinanceiro from "./pages/plataforma/DashboardFinanceiro";
// Enterprise modules
import DashboardExecutivo from "./pages/enterprise/DashboardExecutivo";
import GestaoObras from "./pages/enterprise/GestaoObras";
import GestaoFinanceiro from "./pages/enterprise/GestaoFinanceiro";
import GestaoMaoDeObra from "./pages/enterprise/GestaoMaoDeObra";
import GestaoNFe from "./pages/enterprise/GestaoNFe";
// Mobile Field Inspection
import MobileDashboard from "./pages/mobile/MobileDashboard";
import NovaVistoria from "./pages/mobile/NovaVistoria";
import ChecklistVistoria from "./pages/mobile/ChecklistVistoria";
import UploadImagens from "./pages/mobile/UploadImagens";
import GerarLaudo from "./pages/mobile/GerarLaudo";
import HistoricoLaudos from "./pages/mobile/HistoricoLaudos";
import OperisHome from "./pages/operis/OperisHome";
import NovaInspecao from "./pages/operis/NovaInspecao";
import InspecaoDetalhes from "./pages/operis/InspecaoDetalhes";
import LaudoPublico from "./pages/operis/LaudoPublico";
import AdminOperis from "./pages/operis/AdminOperis";
// Vistorias de Imóveis (OPERIS)
import VistoriasList from "./pages/operis/vistorias/VistoriasList";
import NovaVistoriaImovel from "./pages/operis/vistorias/NovaVistoria";
import VistoriaDetalhes from "./pages/operis/vistorias/VistoriaDetalhes";
import LaudoVistoriaPublico from "./pages/operis/vistorias/LaudoPublico";
import ComparadorVistorias from "./pages/operis/vistorias/ComparadorVistorias";
import PlanejadorManutencao from "./pages/operis/vistorias/PlanejadorManutencao";
import InspecaoPredial from "./pages/operis/engenharia/InspecaoPredial";
import VistoriaCautelar from "./pages/operis/engenharia/VistoriaCautelar";
import LaudoReforma from "./pages/operis/engenharia/LaudoReforma";
import ParceirosEngenheiros from "./pages/operis/ParceirosEngenheiros";
import VistoriaTecnicaBlindada from "./pages/VistoriaTecnicaBlindada";
// Legal pages
import PrivacyPolicy from "./pages/legal/PrivacyPolicy";
import TermsOfService from "./pages/legal/TermsOfService";
import CookiePolicy from "./pages/legal/CookiePolicy";
import Security from "./pages/legal/Security";
import Compliance from "./pages/legal/Compliance";
import CookieBanner from "./components/legal/CookieBanner";
function TitleManager() {
  const [location] = useLocation();
  useEffect(() => {
    if (location.startsWith("/operis") || location.startsWith("/app") || location.startsWith("/mobile")) {
      document.title = "OPERIS — Inspeção e Laudos Inteligentes";
    } else {
      document.title = "CO₂ Contra Incêndio | Sistemas Fixos de Combate a Incêndio — Belo Horizonte, MG";
    }
  }, [location]);
  return null;
}

function Router() {
  return (
    <Switch>
      {/* Site público */}
      <Route path="/" component={Home} />
      <Route path="/quem-somos" component={QuemSomos} />
      <Route path="/servicos" component={Servicos} />
      <Route path="/contato" component={Contato} />
      <Route path="/sistema-supressao-co2" component={SistemaSupressaoCO2} />
      <Route path="/recarga-co2" component={RecargaCO2} />
      <Route path="/sistema-saponificante" component={SistemaSaponificante} />
      <Route path="/coifas" component={SistemaSaponificante} />
      <Route path="/hidrantes" component={Hidrantes} />
      <Route path="/alarme-incendio" component={AlarmeIncendio} />
      <Route path="/detector-gas" component={DetectorGas} />
      <Route path="/vistoria-laudo-art" component={VistoriaLaudoART} />
      <Route path="/manutencao-preventiva" component={ManutencaoPreventiva} />
      <Route path="/projeto-exaustao" component={ProjetoExaustao} />
      <Route path="/sistemas-pre-engenheirados" component={SistemasPreEngenheirados} />
      <Route path="/protecao-veiculos-off-road" component={ProtecaoVeiculosOffRoad} />
      <Route path="/protecao-maquinas-cnc" component={ProtecaoMaquinasCNC} />
      <Route path="/protecao-paineis-eletricos" component={ProtecaoPaineisEletricos} />
      <Route path="/protecao-laboratorios" component={ProtecaoLaboratorios} />
      <Route path="/protecao-compartimento-motor" component={ProtecaoCompartimentoMotor} />
      <Route path="/protecao-maquinas-industriais" component={ProtecaoMaquinasIndustriais} />
      <Route path="/protecao-geradores" component={ProtecaoGeradores} />
          <Route path="/aplicacoes-especiais" component={AplicacoesEspeciais} />
      <Route path="/projetos" component={Projetos} />
      <Route path="/parceiros" component={Parceiros} />
      <Route path="/vistoria-tecnica-blindada" component={VistoriaTecnicaBlindada} />
      <Route path="/blog" component={Blog} />
      <Route path="/blog/:slug" component={BlogPost} />

      {/* Páginas públicas de equipamento via QR Code */}
      <Route path="/extintor/:code" component={ExtintorPublico} />
      <Route path="/equipamento/:code" component={EquipamentoPublico} />

      {/* OPERIS */}
      <Route path="/app/login" component={SaasLogin} />
      <Route path="/app/cadastro" component={SaasCadastro} />
      <Route path="/app/esqueci-senha" component={SaasEsqueciSenha} />
      <Route path="/app/redefinir-senha" component={SaasRedefinirSenha} />
      <Route path="/app/dashboard" component={Dashboard} />
      <Route path="/app/equipamentos" component={Equipamentos} />
      <Route path="/app/equipamentos/:id" component={EquipamentoDetalhes} />
      <Route path="/app/manutencoes" component={Manutencoes} />
      <Route path="/app/qrcodes" component={QRCodes} />
      <Route path="/app/alertas" component={Alertas} />
      <Route path="/app/scanner" component={ScannerEquipamento} />
      <Route path="/app/documentos" component={Documentos} />
      <Route path="/app/art" component={ArtOperis} />
      <Route path="/app/art/nova" component={NovaArt} />
      <Route path="/app/art/aprovacoes" component={ArtAprovacoes} />
      <Route path="/app/art/:id" component={ArtDetalheView} />
       <Route path="/app/notificacoes" component={Notificacoes} />
      <Route path="/app/clientes" component={Clientes} />
      <Route path="/app/relatorios" component={Relatorios} />
      <Route path="/app/busca" component={BuscaInteligente} />
      <Route path="/app/usuarios" component={Usuarios} />
      <Route path="/app/os" component={OrdemServico} />
      <Route path="/app/checklist" component={Checklist} />
      <Route path="/app/propostas" component={Propostas} />
      <Route path="/app/financeiro" component={Financeiro} />
      <Route path="/app/nfse" component={NFSe} />
      <Route path="/app/onboarding" component={Onboarding} />
      <Route path="/app/configuracoes" component={Configuracoes} />
      <Route path="/app/perfil" component={Perfil} />
      <Route path="/app/assinatura" component={Assinatura} />
      <Route path="/app/financeiro-mrr" component={DashboardFinanceiro} />
      <Route path="/planos" component={Planos} />
      {/* Enterprise */}
      <Route path="/app/executivo" component={DashboardExecutivo} />
      <Route path="/app/obras" component={GestaoObras} />
      <Route path="/app/financeiro-enterprise" component={GestaoFinanceiro} />
      <Route path="/app/mao-de-obra" component={GestaoMaoDeObra} />
      <Route path="/app/nfe" component={GestaoNFe} />
      {/* Mobile Field Inspection */}
      <Route path="/mobile" component={MobileDashboard} />
      <Route path="/mobile/nova-vistoria" component={NovaVistoria} />
      <Route path="/mobile/checklist/:id" component={ChecklistVistoria} />
      <Route path="/mobile/upload/:id" component={UploadImagens} />
      <Route path="/mobile/laudo/:id" component={GerarLaudo} />
      <Route path="/mobile/historico" component={HistoricoLaudos} />
      <Route path="/operis" component={OperisHome} />
      <Route path="/operis/nova" component={NovaInspecao} />
      <Route path="/operis/inspecao/:id" component={InspecaoDetalhes} />
      <Route path="/operis/laudo/:slug" component={LaudoPublico} />
      <Route path="/operis/admin" component={AdminOperis} />
      {/* Vistorias de Imóveis */}
      <Route path="/operis/vistorias" component={VistoriasList} />
      <Route path="/operis/vistorias/nova" component={NovaVistoriaImovel} />
      <Route path="/operis/vistorias/laudo/:slug" component={LaudoVistoriaPublico} />
      <Route path="/operis/vistorias/comparador" component={ComparadorVistorias} />
      <Route path="/operis/vistorias/manutencao" component={PlanejadorManutencao} />
      <Route path="/operis/vistorias/:id" component={VistoriaDetalhes} />
      {/* Engenharia Diagnóstica */}
      <Route path="/operis/engenharia/inspecao-predial" component={InspecaoPredial} />
      <Route path="/operis/engenharia/vistoria-cautelar" component={VistoriaCautelar} />
      <Route path="/operis/engenharia/laudo-reforma" component={LaudoReforma} />
      {/* Engenheiros Parceiros / Payout */}
      <Route path="/operis/parceiros-engenheiros" component={ParceirosEngenheiros} />
      {/* Legal pages */}
      <Route path="/legal/privacy" component={PrivacyPolicy} />
      <Route path="/legal/terms" component={TermsOfService} />
      <Route path="/legal/cookies" component={CookiePolicy} />
      <Route path="/legal/security" component={Security} />
      <Route path="/legal/compliance" component={Compliance} />
      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster />
          <TitleManager />
          <Router />
          <CookieBanner />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
