import Sidebar from "./Sidebar";

const AppLayout = ({ children }) => (
  <div style={{ display: "flex" }}>
    <Sidebar />
    <main style={{ flex: 1, padding: "32px 40px", maxWidth: 1200 }}>{children}</main>
  </div>
);

export default AppLayout;
