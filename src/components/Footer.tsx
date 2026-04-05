import { Mail, ExternalLink } from "lucide-react";

const footerLinks = {
  Products: ["Swap", "Staking", "Portfolio", "Trading"],
  Information: ["Fees", "Security", "APIs", "Terms of Service"],
  Resources: ["Help Center", "Blog", "API Docs", "Refer & Earn"],
  Help: ["Support Center", "Raise Ticket", "User Guide", "Status"],
};

const Footer = () => {
  return (
    <footer className="bg-foreground text-background">
      <div className="container py-12 md:py-16">
        <div className="flex flex-wrap items-center justify-between gap-4 pb-8 mb-8 border-b border-background/10">
          <h3 className="text-xl font-bold">24x7 Customer Support</h3>
          <div className="flex flex-wrap items-center gap-6">
            <a href="mailto:support@anexmintmining.com" className="flex items-center gap-2 text-sm text-background/70 hover:text-background transition-colors">
              <Mail className="w-4 h-4" /> support@anexmintmining.com
            </a>
            <a href="#" className="flex items-center gap-2 text-sm text-background/70 hover:text-background transition-colors">
              <ExternalLink className="w-4 h-4" /> Raise a Ticket
            </a>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h4 className="font-semibold text-sm mb-4 text-background/90">{category}</h4>
              <ul className="space-y-2.5">
                {links.map((link) => (
                  <li key={link}>
                    <a href="#" className="text-sm text-background/50 hover:text-background transition-colors">
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-background/10 pt-6 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2 font-bold text-lg">
            <div className="w-7 h-7 rounded-md bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-extrabold text-xs">A</span>
            </div>
            AnexmintMining
          </div>
          <p className="text-xs text-background/40">
            © {new Date().getFullYear()} AnexmintMining. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
