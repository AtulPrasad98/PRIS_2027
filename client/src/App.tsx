import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import Contacts from "./pages/Contacts";
import ContactWorkspace from "./pages/ContactWorkspace";
import Pipeline from "./pages/Pipeline";
import Profile from "./pages/Profile";
import Projects from "./pages/Projects";
import FollowUps from "./pages/FollowUps";
import Notes from "./pages/Notes";
import Settings from "./pages/Settings";

function Router() {
  return <Switch>
    <Route path="/" component={Home} />
    <Route path="/contacts" component={Contacts} />
    <Route path="/contacts/:id" component={ContactWorkspace} />
    <Route path="/pipeline" component={Pipeline} />
    <Route path="/profile" component={Profile} />
    <Route path="/projects" component={Projects} />
    <Route path="/follow-ups" component={FollowUps} />
    <Route path="/notes" component={Notes} />
    <Route path="/settings" component={Settings} />
    <Route path="/404" component={NotFound} />
    <Route component={NotFound} />
  </Switch>;
}

export default function App() {
  return <ErrorBoundary><ThemeProvider defaultTheme="light" switchable><TooltipProvider><Toaster /><Router /></TooltipProvider></ThemeProvider></ErrorBoundary>;
}
