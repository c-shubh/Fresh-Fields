// https://github.com/vitejs/vite/issues/12423#issuecomment-2080351394
import "@mui/material/styles/styled";
//
import { Box } from "@mui/material";
import { SnackbarProvider } from "notistack";
import { ReactNode } from "react";
import {
  RouteObject,
  RouterProvider,
  createBrowserRouter,
} from "react-router-dom";
import "./App.css";
import AuthProvider from "./AuthProvider";
import FooterComponent from "./components/FooterComponent";
import Navbar from "./components/Navbar";
import Cart from "./pages/Cart";
import ErrorPage from "./pages/ErrorPage";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Product from "./pages/Product";
import Profile from "./pages/Profile";
import Search from "./pages/Search";
import SellerDashboard from "./pages/SellerDashboard";
import Signup from "./pages/Signup";
import { ProductMode } from "./utils";

function Layout(children: ReactNode) {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        minHeight: "100vh",
      }}
    >
      <Navbar />
      {children}
      <FooterComponent />
    </Box>
  );
}

function withLayout(routes: RouteObject[]) {
  return routes.map((route) => ({
    ...route,
    element: Layout(route.element),
    ...{ errorElement: route.errorElement ? Layout(route.errorElement) : null },
  }));
}

const router = createBrowserRouter([
  ...withLayout([
    { path: "/", element: <Home />, errorElement: <ErrorPage /> },
    { path: "/profile", element: <Profile /> },
    { path: "/search", element: <Search /> },
    { path: "/cart", element: <Cart /> },
    {
      path: "/product/:productId",
      element: <Product mode={ProductMode.VIEW} />,
    },
    { path: "/product/new", element: <Product mode={ProductMode.NEW} /> },
    {
      path: "/product/edit/:productId",
      element: <Product mode={ProductMode.EDIT} />,
    },
    { path: "/seller/dashboard", element: <SellerDashboard /> },
  ]),
  // add routes which do not need the layout (header and footer), below
  { path: "/login", element: <Login /> },
  { path: "/signup", element: <Signup /> },
]);

function App() {
  return (
    <AuthProvider>
      <SnackbarProvider />
      <RouterProvider router={router} />
    </AuthProvider>
  );
}

export default App;
