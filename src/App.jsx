import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import { AuthProvider } from "./context/AuthProvider";
import Home from "./pages/Home";
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";
import ForgotPassword from "./pages/ForgotPassword";
import UpdatePassword from "./pages/UpdatePassword";
import BrowseItems from "./pages/BrowseItems";
import ItemDetail from "./pages/ItemDetail";
import SellForm from "./pages/SellForm";
import PawnForm from "./pages/PawnForm";
import MyItems from "./pages/user/MyItems";
import EditItem from "./pages/EditItem";
import AdminDashboard from "./pages/admin/AdminDashboard";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";
import PrivateRoute from "./components/PrivateRoute";
import AdminRoute from "./components/AdminRoute";
import AuthCallback from "./components/AuthCallback";
import ErrorBoundary from "./components/ErrorBoundary";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Terms from "./pages/Terms";
import Privacy from "./pages/Privacy";
import FAQ from "./pages/FAQ";
import ThemeProvider from "./context/ThemeProvider";
import { useEffect, useState } from "react";

// Gold Listings Feature imports
import Listings from "./pages/Listings";
import ListingDetail from "./pages/ListingDetail";
import ManageListings from "./pages/admin/ManageListings";
import ListingInquiries from "./pages/admin/ListingInquiries";

function App() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-600 mb-4"></div>
        <p className="text-amber-600">Loading application...</p>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <Router>
        <AuthProvider>
          <ThemeProvider>
            <div className="flex flex-col min-h-screen">
              <Navbar />
              <main className="flex-grow pt-16">
                {" "}
                {/* Added pt-16 for padding-top to account for fixed navbar */}
                <Routes>
                  {/* Public Routes */}
                  <Route path="/" element={<Home />} />
                  <Route path="/signin" element={<SignIn />} />
                  <Route path="/signup" element={<SignUp />} />
                  <Route path="/forgot-password" element={<ForgotPassword />} />
                  <Route path="/update-password" element={<UpdatePassword />} />
                  <Route path="/auth/callback" element={<AuthCallback />} />
                  <Route path="/about" element={<About />} />
                  <Route path="/contact" element={<Contact />} />
                  <Route path="/terms" element={<Terms />} />
                  <Route path="/privacy" element={<Privacy />} />
                  <Route path="/faq" element={<FAQ />} />
                  
                  {/* Gold Listings Public Routes */}
                  <Route path="/listings" element={<Listings />} />
                  <Route path="/listing/:id" element={<ListingDetail />} />

                  {/* Admin Only Routes */}
                  <Route
                    path="/browse"
                    element={
                      <AdminRoute>
                        <BrowseItems />
                      </AdminRoute>
                    }
                  />
                  <Route
                    path="/admin"
                    element={
                      <AdminRoute>
                        <AdminDashboard />
                      </AdminRoute>
                    }
                  />
                  <Route
                    path="/admin/manage"
                    element={
                      <AdminRoute>
                        <ManageListings />
                      </AdminRoute>
                    }
                  />
                  <Route
                    path="/admin/inquiries"
                    element={
                      <AdminRoute>
                        <ListingInquiries />
                      </AdminRoute>
                    }
                  />

                  {/* Protected Routes for all authenticated users */}
                  <Route
                    path="/items/:id"
                    element={
                      <PrivateRoute>
                        <ItemDetail />
                      </PrivateRoute>
                    }
                  />
                  <Route
                    path="/sell-item"
                    element={
                      <PrivateRoute>
                        <SellForm />
                      </PrivateRoute>
                    }
                  />
                  <Route
                    path="/pawn-item"
                    element={
                      <PrivateRoute>
                        <PawnForm />
                      </PrivateRoute>
                    }
                  />
                  <Route
                    path="/my-items"
                    element={
                      <PrivateRoute>
                        <MyItems />
                      </PrivateRoute>
                    }
                  />
                  <Route
                    path="/my-items/edit/:id"
                    element={
                      <PrivateRoute>
                        <EditItem />
                      </PrivateRoute>
                    }
                  />
                  <Route
                    path="/profile"
                    element={
                      <PrivateRoute>
                        <Profile />
                      </PrivateRoute>
                    }
                  />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </main>
              <Footer />
            </div>
          </ThemeProvider>
        </AuthProvider>
      </Router>
    </ErrorBoundary>
  );
}

export default App;
