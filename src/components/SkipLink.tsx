// HOME-AC-11: first focusable element; jumps past the header to main#main.
export function SkipLink({ label }: { label: string }) {
  return (
    <a href="#main" className="skip-link">
      {label}
    </a>
  );
}
