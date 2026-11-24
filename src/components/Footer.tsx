// HOME-AC-18: "© <build year> <name>" and the way back to the terminal. Privacy link arrives in U-10.
export function Footer({ name, year, terminalLabel }: { name: string; year: number; terminalLabel: string }) {
  return (
    <footer className="site-footer band band--ink">
      <div className="footer-inner wrap">
        <span>
          © {year} {name}
        </span>
        <a href="/terminal" className="footer-link">
          {terminalLabel}
        </a>
      </div>
    </footer>
  );
}
