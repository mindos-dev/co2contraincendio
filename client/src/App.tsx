import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
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
import Projetos from "./pages/Projetos";
import Parceiros from "./pages/Parceiros";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/quem-somos" component={QuemSomos} />
      <Route path="/servicos" component={Servicos} />
      <Route path="/contato" component={Contato} />
      <Route path="/sistema-supressao-co2" component={SistemaSupressaoCO2} />
      <Route path="/recarga-co2" component={RecargaCO2} />
      <Route path="/sistema-saponificante" component={SistemaSaponificante} />
      <Route path="/hidrantes" component={Hidrantes} />
      <Route path="/alarme-incendio" component={AlarmeIncendio} />
      <Route path="/detector-gas" component={DetectorGas} />
      <Route path="/vistoria-laudo-art" component={VistoriaLaudoART} />
      <Route path="/manutencao-preventiva" component={ManutencaoPreventiva} />
      <Route path="/projeto-exaustao" component={ProjetoExaustao} />
      <Route path="/projetos" component={Projetos} />
      <Route path="/parceiros" component={Parceiros} />
      <Route path="/blog" component={Blog} />
      <Route path="/blog/:slug" component={BlogPost} />
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
