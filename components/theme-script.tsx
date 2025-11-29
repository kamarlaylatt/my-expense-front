export function ThemeScript() {
  return (
    <script
      dangerouslySetInnerHTML={{
        __html: `
          try {
            const theme = localStorage.getItem('theme') || 'dark';
            document.documentElement.classList.add(theme);
          } catch (e) {}
        `,
      }}
    />
  );
}
