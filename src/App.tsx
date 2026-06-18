import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom"

import { Toaster } from "@/components/ui/sonner"
import { AppShell } from "@/components/layout/AppShell"
import { DocumentsListPage } from "@/pages/DocumentsListPage"
import { EditorPage } from "@/pages/EditorPage"
import { LoginPage } from "@/pages/LoginPage"
import { RegisterPage } from "@/pages/RegisterPage"
import { ProtectedRoute, GuestRoute } from "@/components/layout/AuthGuard"

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Guest Routes */}
        <Route element={<GuestRoute />}>
          <Route path="login" element={<LoginPage />} />
          <Route path="register" element={<RegisterPage />} />
        </Route>

        {/* Protected App Routes */}
        <Route element={<ProtectedRoute />}>
          <Route element={<AppShell />}>
            <Route index element={<DocumentsListPage />} />
            <Route path="documents/new" element={<EditorPage />} />
            <Route path="documents/:id" element={<EditorPage />} />
          </Route>
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <Toaster richColors position="top-center" />
    </BrowserRouter>
  )
}

export default App
