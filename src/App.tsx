import { BrowserRouter, Routes, Route } from "react-router-dom";
import GuestLayout from "./layouts/GuestLayout";
import AuthenticatedLayout from "./layouts/AuthenticatedLayout";
import DemoLayout from "./layouts/DemoLayout";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import UpdatePassword from "./pages/UpdatePassword";
import Dashboard from "./pages/Dashboard";
import SmartSummary from "./pages/SmartSummary";
import Upload from "./pages/Upload";
import Workspace from "./pages/Workspace";
import Quiz from "./pages/Quiz";
import Flashcards from "./pages/Flashcards";
import Profile from "./pages/Profile";
import Missions from "./pages/Missions";
import Analytics from "./pages/Analytics";
import Settings from "./pages/Settings";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Guest routes */}
        <Route element={<GuestLayout />}>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/update-password" element={<UpdatePassword />} />
        </Route>

        {/* Authenticated routes */}
        <Route element={<AuthenticatedLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/upload" element={<Upload />} />
          <Route path="/workspace" element={<Workspace />} />
          <Route path="/summary" element={<SmartSummary />} />
          <Route path="/quiz" element={<Quiz />} />
          <Route path="/flashcards" element={<Flashcards />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/missions" element={<Missions />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/settings" element={<Settings />} />
        </Route>

        {/* Demo routes — no auth required */}
        <Route element={<DemoLayout />}>
          <Route path="/demo" element={<Dashboard />} />
          <Route path="/demo/upload" element={<Upload />} />
          <Route path="/demo/workspace" element={<Workspace />} />
          <Route path="/demo/summary" element={<SmartSummary />} />
          <Route path="/demo/quiz" element={<Quiz />} />
          <Route path="/demo/flashcards" element={<Flashcards />} />
          <Route path="/demo/profile" element={<Profile />} />
          <Route path="/demo/missions" element={<Missions />} />
          <Route path="/demo/analytics" element={<Analytics />} />
          <Route path="/demo/settings" element={<Settings />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Landing />} />
      </Routes>
    </BrowserRouter>
  );
}