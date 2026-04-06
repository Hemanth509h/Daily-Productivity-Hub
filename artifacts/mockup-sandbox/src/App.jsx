import { useEffect, useState } from "react";
import { modules as discoveredModules } from "./.generated/mockup-components";
function _resolveComponent(mod, name) {
  const fns = Object.values(mod).filter(
    (v) => typeof v === "function"
  );
  return mod.default || mod.Preview || mod[name] || fns[fns.length - 1];
}
function PreviewRenderer({
  componentPath,
  modules
}) {
  const [Component, setComponent] = useState(null);
  const [error, setError] = useState(null);
  useEffect(() => {
    let cancelled = false;
    setComponent(null);
    setError(null);
    async function loadComponent() {
      const key = `./components/mockups/${componentPath}.tsx`;
      const loader = modules[key];
      if (!loader) {
        setError(`No component found at ${componentPath}.tsx`);
        return;
      }
      try {
        const mod = await loader();
        if (cancelled) {
          return;
        }
        const name = componentPath.split("/").pop();
        const comp = _resolveComponent(mod, name);
        if (!comp) {
          setError(
            `No exported React component found in ${componentPath}.tsx

Make sure the file has at least one exported function component.`
          );
          return;
        }
        setComponent(() => comp);
      } catch (e) {
        if (cancelled) {
          return;
        }
        const message = e instanceof Error ? e.message : String(e);
        setError(`Failed to load preview.
${message}`);
      }
    }
    void loadComponent();
    return () => {
      cancelled = true;
    };
  }, [componentPath, modules]);
  if (error) {
    return /* @__PURE__ */ React.createElement("pre", { style: { color: "red", padding: "2rem", fontFamily: "system-ui" } }, error);
  }
  if (!Component) return null;
  return /* @__PURE__ */ React.createElement(Component, null);
}
function getBasePath() {
  return import.meta.env.BASE_URL.replace(/\/$/, "");
}
function getPreviewExamplePath() {
  const basePath = getBasePath();
  return `${basePath}/preview/ComponentName`;
}
function Gallery() {
  return /* @__PURE__ */ React.createElement("div", { className: "min-h-screen bg-gray-50 flex items-center justify-center p-8" }, /* @__PURE__ */ React.createElement("div", { className: "text-center max-w-md" }, /* @__PURE__ */ React.createElement("h1", { className: "text-2xl font-semibold text-gray-900 mb-3" }, "Component Preview Server"), /* @__PURE__ */ React.createElement("p", { className: "text-gray-500 mb-4" }, "This server renders individual components for the workspace canvas."), /* @__PURE__ */ React.createElement("p", { className: "text-sm text-gray-400" }, "Access component previews at", " ", /* @__PURE__ */ React.createElement("code", { className: "bg-gray-100 px-1.5 py-0.5 rounded text-gray-600" }, getPreviewExamplePath()))));
}
function getPreviewPath() {
  const basePath = getBasePath();
  const { pathname } = window.location;
  const local = basePath && pathname.startsWith(basePath) ? pathname.slice(basePath.length) || "/" : pathname;
  const match = local.match(/^\/preview\/(.+)$/);
  return match ? match[1] : null;
}
function App() {
  const previewPath = getPreviewPath();
  if (previewPath) {
    return /* @__PURE__ */ React.createElement(
      PreviewRenderer,
      {
        componentPath: previewPath,
        modules: discoveredModules
      }
    );
  }
  return /* @__PURE__ */ React.createElement(Gallery, null);
}
var stdin_default = App;
export {
  stdin_default as default
};
