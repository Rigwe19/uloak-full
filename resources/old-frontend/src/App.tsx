import {
    BrowserRouter,
    Routes,
    Route,
    Navigate,
    useLocation,
} from 'react-router-dom';
import { PublicLayout, AppLayout } from './layouts/Layouts';
import { AnimatePresence, motion } from 'motion/react';

// Public Pages
import Home from './pages/Home';
import About from './pages/About';
import HowItWorks from './pages/HowItWorks';
import LegacyFilms from './pages/LegacyFilms';
import CommunityProjects from './pages/CommunityProjects';
import Contact from './pages/Contact';
import Auth from './pages/Auth';

// App Pages
import Dashboard from './pages/Dashboard';
import RoomView from './pages/RoomView';
import StoryViewer from './pages/StoryViewer';

import { AuthProvider } from './components/AuthProvider';
import { DataProvider } from './components/DataProvider';
import { AdminRoute, PrivateRoute } from './components/ProtectedRoute';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';

// Mock simple pages for the rest
const SimplePage = ({ title }: { title: string }) => (
    <div className="mx-auto min-h-screen max-w-4xl px-8 pt-40 pb-20">
        <h1 className="mb-8 text-5xl font-bold">{title}</h1>
        <p className="text-xl leading-relaxed text-text-muted">
            This space is being curated to reflect the rich history and legacy
            of {title.toLowerCase()}. Please check back soon for more
            information about ULOAK's mission in this area.
        </p>
    </div>
);

function RouterContent() {
    const location = useLocation();

    return (
        <Routes location={location}>
            {/* Public Marketing Routes */}
            <Route element={<PublicLayout />}>
                <Route path="/" element={<Home />} />
                <Route path="/about" element={<About />} />
                <Route path="/how-it-works" element={<HowItWorks />} />
                <Route path="/legacy-films" element={<LegacyFilms />} />
                <Route
                    path="/community-projects"
                    element={<CommunityProjects />}
                />
                <Route path="/contact" element={<Contact />} />
                {/* Login included in PublicLayout for now to keep transition logic consistent, 
            but we can hide Navbar/Footer for it if needed */}
                <Route path="/login" element={<Auth />} />
            </Route>

            {/* Authenticated/Dashboard Routes */}
            <Route path="/app" element={<AppLayout />}>
                <Route element={<PrivateRoute />}>
                    <Route index element={<Dashboard />} />
                    <Route path="room/:roomId" element={<RoomView />} />
                    <Route path="story/:storyId" element={<StoryViewer />} />
                </Route>
            </Route>

            {/* Admin Routes */}
            <Route path="/admin" element={<AdminRoute />}>
                <Route index element={<AdminDashboard />} />
            </Route>

            {/* Share Page (Public view of a room) */}
            <Route path="/share/:roomId" element={<RoomView />} />

            {/* Catch-all redirect */}
            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
}

export default function App() {
    return (
        <AuthProvider>
            <DataProvider>
                <BrowserRouter>
                    <RouterContent />
                </BrowserRouter>
            </DataProvider>
        </AuthProvider>
    );
}
