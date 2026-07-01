import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster } from "sonner";
import "@/App.css";
import Layout from "@/components/Layout";
import Today from "@/pages/Today";
import AddChapter from "@/pages/AddChapter";
import AllChapters from "@/pages/AllChapters";
import CalendarPage from "@/pages/CalendarPage";

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route index element={<Today />} />
            <Route path="/add" element={<AddChapter />} />
            <Route path="/chapters" element={<AllChapters />} />
            <Route path="/calendar" element={<CalendarPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
      <Toaster
        position="bottom-center"
        theme="light"
        toastOptions={{
          style: {
            background: "#1A1A1A",
            color: "#fff",
            border: "none",
            borderRadius: "10px",
            fontFamily: "Karla, system-ui, sans-serif",
            fontWeight: 500,
          },
        }}
      />
    </div>
  );
}

export default App;
