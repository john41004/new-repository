import { createBrowserRouter } from "react-router-dom";
import Home from "./pages/Home/Home";
import AdminDashboard from "./pages/AdminDashboard/AdminDashboard";
import ProtectedRoute from "./Components/ProtectedRoute";
import Login from "./pages/Admin/Login/Login";
import ViewPDF from "./pages/ViewPDF/ViewPDF";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Home />,
  },
  {
    path: "/admin",
    element: <Login />,
  },
  {
    path: "/adminProject",
    element: (
      <ProtectedRoute>
        <AdminDashboard />
      </ProtectedRoute>
    ),
  },
  {
    // 🔥 Updated route with encoded ID
    path: "/print/:encodedId",
    element: <ViewPDF />,
  },
]);