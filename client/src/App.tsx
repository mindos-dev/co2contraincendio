import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
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
import ExtintorPublico from "./pages/ExtintorPublico";
import Dashboard from "./pages/plataforma/Dashboard";
import Equipamentos from "./pages/plataforma/Equipamentos";
import Manutencoes from "./pages/plataforma/Manutencoes";
import QRCodes from "./pages/plataforma/QRCodes";
import Alertas from "./pages/plataforma/Alertas";
import Documentos from "./pages/plataforma/Documentos";
import Notificacoes from "./pages/plataforma/Notificacoes";
import Clientes from "./pages/plataforma/Clientes";
import Relatorios from "./pages/plataforma/Relatorios";
import BuscaInteligente from "./pages/plataforma/BuscaInteligente";
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
      <Route path="/blog" component={Blog} />
      <Route path="/blog/:slug" component={BlogPost} />

      {/* Página pública de equipamento via QR Code */}
      <Route path="/extintor/:code" component={ExtintorPublico} />

      {/* Plataforma SaaS */}
      <Route path="/app/login" component={SaasLogin} />
      <Route path="/app/dashboard" component={Dashboard} />
      <Route path="/app/equipamentos" component={Equipamentos} />
      <Route path="/app/manutencoes" component={Manutencoes} />
      <Route path="/app/qrcodes" component={QRCodes} />
      <Route path="/app/alertas" component={Alertas} />
      <Route path="/app/documentos" component={Documentos} />
       <Route path="/app/notificacoes" component={Notificacoes} />
      <Route path="/app/clientes" component={Clientes} />
      <Route path="/app/relatorios" component={Relatorios} />
      <Route path="/app/busca" component={BuscaInteligente} />
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
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
