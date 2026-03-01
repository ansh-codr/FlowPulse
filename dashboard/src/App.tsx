import { BrowserRouter, Route, Routes } from "react-router-dom";
import { DashboardLayout } from "./layouts/DashboardLayout";
import { HomePage } from "./pages/Home";
import { TimelinePage } from "./pages/Timeline";
import { HeatmapPage } from "./pages/Heatmap";
import { TopAppsPage } from "./pages/TopApps";
import { SessionsPage } from "./pages/Sessions";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<DashboardLayout />}>
          <Route index element={<HomePage />} />
          <Route path="timeline" element={<TimelinePage />} />
          <Route path="heatmap" element={<HeatmapPage />} />
          <Route path="top-apps" element={<TopAppsPage />} />
          <Route path="sessions" element={<SessionsPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
