const Footer = () => {
  return (
    <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-border/60 pt-6 text-[11px] text-muted-foreground">
      <div>© {new Date().getFullYear()} XContext</div>
      <div className="flex gap-4">
        <span>Privacy</span>
        <span>Terms</span>
        <span>Status</span>
      </div>
    </footer>
  );
};

export default Footer;
