export default function AuditPage() {
  return (
    <iframe
      src="/audit-tool.html"
      title="Keys to AI Audit"
      style={{
        position: "fixed",
        inset: 0,
        width: "100vw",
        height: "100vh",
        border: 0,
        display: "block"
      }}
    />
  );
}
