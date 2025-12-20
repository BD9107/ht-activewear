import "@/App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import OrderForm from "@/pages/OrderForm";
import Success from "@/pages/Success";
import { Toaster } from "@/components/ui/sonner";

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<OrderForm />} />
          <Route path="/success" element={<Success />} />
        </Routes>
      </BrowserRouter>
      <Toaster />
    </div>
  );
}

export default App;
