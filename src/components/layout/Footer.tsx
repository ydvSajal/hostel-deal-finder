import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="border-t">
      <div className="mx-auto max-w-6xl px-4 py-8 text-sm text-muted-foreground flex items-center justify-between">
        <p>© {new Date().getFullYear()} BU_Basket</p>
        <Link to="/privacy" className="hover:text-foreground">Privacy</Link>
      </div>
    </footer>
  );
};

export default Footer;
