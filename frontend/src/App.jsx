import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
const queryClient = new QueryClient();
function Home() {
  return /* @__PURE__ */ React.createElement("div", { className: "min-h-screen w-full flex items-center justify-center bg-gray-50" }, /* @__PURE__ */ React.createElement("div", { className: "text-center" }, /* @__PURE__ */ React.createElement("h1", { className: "text-2xl font-bold text-gray-900" }, "Replit Agent is building..."), /* @__PURE__ */ React.createElement("p", { className: "mt-2 text-sm text-gray-600" }, "Your app will appear here once it's ready.")));
}
function Router() {
  return /* @__PURE__ */ React.createElement(Switch, null, /* @__PURE__ */ React.createElement(Route, { path: "/", component: Home }), /* @__PURE__ */ React.createElement(Route, { component: NotFound }));
}
function App() {
  return /* @__PURE__ */ React.createElement(QueryClientProvider, { client: queryClient }, /* @__PURE__ */ React.createElement(TooltipProvider, null, /* @__PURE__ */ React.createElement(WouterRouter, { base: import.meta.env.BASE_URL.replace(/\/$/, "") }, /* @__PURE__ */ React.createElement(Router, null)), /* @__PURE__ */ React.createElement(Toaster, null)));
}
var stdin_default = App;
export {
  stdin_default as default
};
