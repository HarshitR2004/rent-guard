import { Routes, Route } from "react-router-dom";
import { Navbar } from "./components/Navbar";
import { Footer } from "./components/Footer";
import HomePage from "./pages/HomePage";
import PropertiesPage from "./pages/PropertiesPage";
import PropertyDetailsPage from "./pages/PropertyDetailsPage";
import MoveInPage from "./pages/MoveInPage";
import MoveOutPage from "./pages/MoveOutPage";

function App() {
  return (
    <div className="min-h-screen p-4 md:p-8 flex flex-col items-center">
      <Navbar />
      <main className="w-full max-w-5xl flex-grow">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/properties" element={<PropertiesPage />} />
          <Route path="/property/:id" element={<PropertyDetailsPage />} />
          <Route path="/property/:id/move-in" element={<MoveInPage />} />
          <Route path="/property/:id/move-out" element={<MoveOutPage />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

export default App;
