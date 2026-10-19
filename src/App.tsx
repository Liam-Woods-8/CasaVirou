import { Route, Routes } from 'react-router';
import { useCurrentUser } from './store/selectors';
import { AppLayout, FocusLayout, Page, RequireAuth } from './components/layout/Layouts';
import { Button } from './components/ui/Button';
import { EmptyState } from './components/ui/primitives';
import { SignIn, SignUp, Welcome } from './pages/Auth';
import { Complete, Share } from './pages/Complete';
import { Discover } from './pages/Discover';
import { Explore, ExplorePostPage } from './pages/Explore';
import { Home } from './pages/Home';
import { Landing } from './pages/Landing';
import { MaterialDetail } from './pages/MaterialDetail';
import { MaterialForm } from './pages/MaterialForm';
import { Materials } from './pages/Materials';
import { MyProjects, MyProjectsIndex, ProjectsLayout } from './pages/MyProjects';
import { EditProfile, Profile } from './pages/Profile';
import { ProjectDetails } from './pages/ProjectDetails';
import { Tutorial } from './pages/Tutorial';

function IndexRoute() {
  return useCurrentUser() ? <Home /> : <Landing />;
}

function NotFound() {
  return (
    <Page narrow>
      <EmptyState title="Page not found." body="That link doesn't lead anywhere." action={<Button to="/">Go home</Button>} />
    </Page>
  );
}

export default function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route index element={<IndexRoute />} />
        <Route path="signin" element={<SignIn />} />
        <Route path="signup" element={<SignUp />} />
        <Route path="explore" element={<Explore />} />
        <Route path="explore/:postId" element={<ExplorePostPage />} />
        <Route path="projects/:projectId" element={<ProjectDetails />} />

        <Route element={<RequireAuth />}>
          <Route path="welcome" element={<Welcome />} />
          <Route path="projects" element={<ProjectsLayout />}>
            <Route index element={<Discover />} />
            <Route path="mine" element={<MyProjectsIndex />} />
            <Route path="mine/:tab" element={<MyProjects />} />
          </Route>
          <Route path="materials" element={<Materials />} />
          <Route path="materials/:itemId" element={<MaterialDetail />} />
          <Route path="profile" element={<Profile />} />
          <Route path="profile/edit" element={<EditProfile />} />
        </Route>

        <Route path="*" element={<NotFound />} />
      </Route>

      <Route element={<RequireAuth />}>
        <Route element={<FocusLayout />}>
          <Route path="materials/new" element={<MaterialForm />} />
          <Route path="materials/:itemId/edit" element={<MaterialForm />} />
          <Route path="projects/:projectId/tutorial" element={<Tutorial />} />
          <Route path="projects/:projectId/complete" element={<Complete />} />
          <Route path="projects/:projectId/share" element={<Share />} />
        </Route>
      </Route>
    </Routes>
  );
}
