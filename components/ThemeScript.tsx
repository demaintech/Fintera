import Script from "next/script";

const ThemeScript = () => {
  const script = `
    (function(){
      try{
        var theme = localStorage.getItem('theme');
        var resolved = null;
        if(theme === 'light' || theme === 'dark'){
          resolved = theme;
        } else if(window.matchMedia){
          resolved = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        }
        if(resolved){
          document.documentElement.setAttribute('data-theme', resolved);
          if(resolved === 'dark') document.documentElement.classList.add('dark');
          else document.documentElement.classList.remove('dark');
        }
      }catch(e){}
    })();
  `;

  return (
    <Script
      id="theme-switcher"
      strategy="beforeInteractive"
      suppressHydrationWarning // Add this prop to suppress the warning
    >
      {script}
    </Script>
  );
};

export default ThemeScript;