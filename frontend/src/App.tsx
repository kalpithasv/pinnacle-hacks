import { Routes, Route } from "react-router-dom";
import { Toaster } from "./components/ui/toaster";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import StartupDetail from "./pages/StartupDetail";
import Investors from "./pages/Investors";
import Dashboard from "./pages/Dashboard";
import Matchmaking from "./pages/Matchmaking";
import Login from "./pages/Login";
import Register from "./pages/Register";
import SubmitStartup from "./pages/SubmitStartup";
import Analysis from "./pages/Analysis";

function App() {
  return (
    <div className="min-h-screen bg-background">
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="startups/:id" element={<StartupDetail />} />
          <Route path="investors" element={<Investors />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="matchmaking" element={<Matchmaking />} />
          <Route path="submit" element={<SubmitStartup />} />
          <Route path="analysis" element={<Analysis />} />
        </Route>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Routes>
      <Toaster />
    </div>
  );
}

export default App;
