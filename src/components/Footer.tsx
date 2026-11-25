type Props = { name: string; year: number; terminalLabel: string; privacyLabel: string };

// HOME-AC-18: "© <build year> <name>" and the way back to the terminal. HOME-AC-27: the privacy notice.
export function Footer({ name, year, terminalLabel, privacyLabel }: Props) {
  return (
    <footer className="site-footer band band--ink">
      <div className="footer-inner wrap">
        <span>
          © {year} {name}
        </span>
        <span className="footer-links">
          <a href="/privacy" className="footer-link">
            {privacyLabel}
          </a>
          <a href="/terminal" className="footer-link">
            {terminalLabel}
          </a>
        </span>
      </div>
    </footer>
  );
}
