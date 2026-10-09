import { Navigate, Route, Routes } from 'react-router-dom'
import { GuestRoute } from './components/routing/GuestRoute'
import { ProtectedRoute } from './components/routing/ProtectedRoute'
import { SuperAdminRoute } from './components/routing/SuperAdminRoute'
import { AppShell } from './components/layout/AppShell'
import { AddTask } from './pages/AddTask'
import { AuthPage } from './pages/AuthPage'
import { Dashboard } from './pages/Dashboard'
import { Analytics } from './pages/Analytics'
import { FocusMode } from './pages/FocusMode'
import { Completed } from './pages/Completed'
import { ForwardedTasks } from './pages/ForwardedTasks'
import { SuperAdmin } from './pages/SuperAdmin'
import { TaskTracker } from './pages/TaskTracker'

export default function App() {
  return (
    <Routes>
      <Route element={<GuestRoute />}>
        <Route path="login" element={<AuthPage />} />
        <Route path="auth" element={<Navigate to="/login" replace />} />
      </Route>

      <Route element={<ProtectedRoute />}>
        <Route element={<AppShell />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="add-task" element={<AddTask />} />
          <Route path="tracker" element={<TaskTracker />} />
          <Route path="forwarded" element={<ForwardedTasks />} />
          <Route path="completed" element={<Completed />} />
          <Route path="analytics" element={<Analytics />} />
          <Route path="focus" element={<FocusMode />} />
          <Route element={<SuperAdminRoute />}>
            <Route path="super-admin" element={<SuperAdmin />} />
          </Route>
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  )
}
