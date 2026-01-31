import { Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Report from "./pages/Report";
import MyReports from "./pages/MyReports";
import CouncilDashboard from "./pages/CouncilDashboard";
import Login from "./pages/Login";
import RequireAuth from "./components/RequireAuth";

export default function App() {
  return (
    <div className="h-full flex flex-col">
      <Navbar />
      <div className="flex-1 min-h-0">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/report/:id" element={<Report />} />
          <Route path="/login" element={<Login />} />

          <Route
            path="/my-reports"
            element={
              <RequireAuth>
                <MyReports />
              </RequireAuth>
            }
          />

          <Route
            path="/council"
            element={
              <RequireAuth>
                <CouncilDashboard />
              </RequireAuth>
            }
          />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </div>
  );
return (
  <div className="p-6">
    <h1 className="text-2xl font-bold">Ni Pothole is running</h1>
  </div>
);

}
