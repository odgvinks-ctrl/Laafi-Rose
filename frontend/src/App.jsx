import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext.jsx";
import { PreferencesProvider } from "./context/PreferencesContext.jsx";
import Layout from "./components/Layout.jsx";
import Bienvenue from "./pages/Bienvenue.jsx";
import Accueil from "./pages/Accueil.jsx";
import Sinformer from "./pages/Sinformer.jsx";
import Fiche from "./pages/Fiche.jsx";
import Ecouter from "./pages/Ecouter.jsx";
import Questionnaire from "./pages/Questionnaire.jsx";
import Centres from "./pages/Centres.jsx";
import CentreDetail from "./pages/CentreDetail.jsx";
import RendezVous from "./pages/RendezVous.jsx";
import Assistant from "./pages/Assistant.jsx";
import Enregistres from "./pages/Enregistres.jsx";
import Journal from "./pages/Journal.jsx";
import Profil from "./pages/Profil.jsx";
import Notifications from "./pages/Notifications.jsx";
import SuiviDemande from "./pages/SuiviDemande.jsx";
import Connexion from "./pages/Connexion.jsx";
import NonTrouve from "./pages/NonTrouve.jsx";

function App() {
  return (
    <BrowserRouter>
      <PreferencesProvider>
        <AuthProvider>
          <Routes>
            <Route path="bienvenue" element={<Bienvenue />} />
            <Route path="connexion" element={<Connexion />} />

            <Route element={<Layout />}>
              <Route index element={<Accueil />} />
              <Route path="sinformer" element={<Sinformer />} />
              <Route path="sinformer/:slug" element={<Fiche />} />
              <Route path="ecouter/:slug" element={<Ecouter />} />
              <Route path="questionnaire" element={<Questionnaire />} />
              <Route path="centres" element={<Centres />} />
              <Route path="centres/:id" element={<CentreDetail />} />
              <Route path="centres/:id/rendez-vous" element={<RendezVous />} />
              <Route path="assistant" element={<Assistant />} />
              <Route path="enregistres" element={<Enregistres />} />
              <Route path="journal" element={<Journal />} />
              <Route path="profil" element={<Profil />} />
              <Route path="notifications" element={<Notifications />} />
              <Route path="rendez-vous/:reference" element={<SuiviDemande />} />
              <Route path="*" element={<NonTrouve />} />
            </Route>
          </Routes>
        </AuthProvider>
      </PreferencesProvider>
    </BrowserRouter>
  );
}

export default App;
