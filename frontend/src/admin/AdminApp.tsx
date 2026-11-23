import { Route, Routes } from 'react-router-dom'
import { AuthProvider } from './AuthProvider'
import { AdminLayout } from './AdminLayout'
import { RequireAuth } from './RequireAuth'
import { ToastProvider } from './components/Toast'
import LoginPage from './pages/LoginPage'
import DashboardPage from './pages/DashboardPage'
import ProfilePage from './pages/ProfilePage'
import ProjectsPage from './pages/ProjectsPage'
import ProjectFormPage from './pages/ProjectFormPage'
import PostsPage from './pages/PostsPage'
import PostFormPage from './pages/PostFormPage'
import MessagesPage from './pages/MessagesPage'
import AdminNotFound from './pages/AdminNotFound'

export default function AdminApp() {
  return (
    <ToastProvider>
      <AuthProvider>
        <Routes>
          <Route path="login" element={<LoginPage />} />
          <Route element={<RequireAuth />}>
            <Route element={<AdminLayout />}>
              <Route index element={<DashboardPage />} />
              <Route path="profile" element={<ProfilePage />} />
              <Route path="projects" element={<ProjectsPage />} />
              <Route path="projects/new" element={<ProjectFormPage />} />
              <Route path="projects/:id" element={<ProjectFormPage />} />
              <Route path="posts" element={<PostsPage />} />
              <Route path="posts/new" element={<PostFormPage />} />
              <Route path="posts/:id" element={<PostFormPage />} />
              <Route path="messages" element={<MessagesPage />} />
              <Route path="*" element={<AdminNotFound />} />
            </Route>
          </Route>
        </Routes>
      </AuthProvider>
    </ToastProvider>
  )
}
