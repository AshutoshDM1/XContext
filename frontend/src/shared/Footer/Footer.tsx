import Section from '../Section/Section';

const Footer = () => {
  return (
    <Section>
      <footer className="flex flex-wrap items-center justify-between border-t border-border/60 text-xs pt-3 text-muted-foreground ">
        <div>© {new Date().getFullYear()} XContext</div>
        <div className="flex gap-4">
          <span>Privacy</span>
          <span>Terms</span>
          <span>Status</span>
        </div>
      </footer>
    </Section>
  );
};

export default Footer;
