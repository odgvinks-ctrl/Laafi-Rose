import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext.jsx";
import { PreferencesProvider } from "./context/PreferencesContext.jsx";
import Layout from "./components/Layout.jsx";
import LayoutSoignant from "./components/soignant/LayoutSoignant.jsx";
import RouteProtegee from "./components/RouteProtegee.jsx";
import Bienvenue from "./pages/Bienvenue.jsx";
import Accueil from "./pages/Accueil.jsx";
import Sinformer from "./pages/Sinformer.jsx";
import Fiche from "./pages/Fiche.jsx";
import Questionnaire from "./pages/Questionnaire.jsx";
import Centres from "./pages/Centres.jsx";
import CentreDetail from "./pages/CentreDetail.jsx";
import RendezVous from "./pages/RendezVous.jsx";
import Ecouter from "./pages/Ecouter.jsx";
import Assistant from "./pages/Assistant.jsx";
import Enregistres from "./pages/Enregistres.jsx";
import Profil from "./pages/Profil.jsx";
import MonSuivi from "./pages/MonSuivi.jsx";
import AlerteStatut from "./pages/AlerteStatut.jsx";
import Rappels from "./pages/Rappels.jsx";
import Marraines from "./pages/Marraines.jsx";
import Connexion from "./pages/Connexion.jsx";
import TableauDeBord from "./pages/soignant/TableauDeBord.jsx";
import Alertes from "./pages/soignant/Alertes.jsx";
import Patients from "./pages/soignant/Patients.jsx";
import PatientDetail from "./pages/soignant/PatientDetail.jsx";
import NouveauPatient from "./pages/soignant/NouveauPatient.jsx";
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
              <Route path="questionnaire" element={<Questionnaire />} />
              <Route path="centres" element={<Centres />} />
              <Route path="centres/:id" element={<CentreDetail />} />
              <Route path="centres/:id/rendez-vous" element={<RendezVous />} />
              <Route path="ecouter/:id" element={<Ecouter />} />
              <Route path="assistant" element={<Assistant />} />
              <Route path="enregistres" element={<Enregistres />} />
              <Route path="profil" element={<Profil />} />
              <Route path="rappels" element={<Rappels />} />
              <Route path="marraines" element={<Marraines />} />
              <Route
                path="mon-suivi"
                element={
                  <RouteProtegee roles={["patient"]}>
                    <MonSuivi />
                  </RouteProtegee>
                }
              />
              <Route
                path="alertes/:id"
                element={
                  <RouteProtegee roles={["patient"]}>
                    <AlerteStatut />
                  </RouteProtegee>
                }
              />
            </Route>

            <Route
              path="soignant"
              element={
                <RouteProtegee roles={["medecin", "centre"]}>
                  <LayoutSoignant />
                </RouteProtegee>
              }
            >
              <Route index element={<TableauDeBord />} />
              <Route path="alertes" element={<Alertes />} />
              <Route path="patients" element={<Patients />} />
              <Route path="patients/nouveau" element={<NouveauPatient />} />
              <Route path="patients/:id" element={<PatientDetail />} />
            </Route>

            <Route path="*" element={<NonTrouve />} />
          </Routes>
        </AuthProvider>
      </PreferencesProvider>
    </BrowserRouter>
  );
}

export default App;
