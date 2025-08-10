const Footer = () => {
  return (
    <footer className="border-t">
      <div className="mx-auto max-w-6xl px-4 py-8 text-sm text-muted-foreground flex items-center justify-between">
        <p>© {new Date().getFullYear()} BU_Basket</p>
        <a href="#" className="hover:text-foreground">Privacy</a>
      </div>
    </footer>
  );
};

export default Footer;
