import React from 'react';
// import { Book, Mail, MapPin, Phone, Facebook, Twitter, Instagram, Youtube, LinkedIn } from "lucide-react";
import { Book, Mail, MapPin, Phone } from "lucide-react";
import Link from "next/link";

interface FooterLink {
  label: string;
  href: string;
}

interface FooterSection {
  title: string;
  links: FooterLink[];
}

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const sections: FooterSection[] = [
    {
      title: "For Students",
      links: [
        { label: "Browse Tutors", href: "/tutors" },
        { label: "How It Works", href: "/how-it-works" },
        { label: "My Bookings", href: "/dashboard/bookings" },
        { label: "Pricing", href: "/pricing" },
      ],
    },
    {
      title: "For Tutors",
      links: [
        { label: "Become a Tutor", href: "/register?role=tutor" },
        { label: "Tutor Dashboard", href: "/tutor/dashboard" },
        { label: "Resources", href: "/resources" },
        { label: "Success Stories", href: "/stories" },
      ],
    },
    {
      title: "Company",
      links: [
        { label: "About Us", href: "/about" },
        { label: "Blog", href: "/blog" },
        { label: "Careers", href: "/careers" },
        { label: "Contact", href: "/contact" },
      ],
    },
    {
      title: "Support",
      links: [
        { label: "Help Center", href: "/help" },
        { label: "Terms of Service", href: "/terms" },
        { label: "Privacy Policy", href: "/privacy" },
        { label: "Safety Guidelines", href: "/safety" },
      ],
    },
  ];

//   const socialLinks = [
//     { icon: Facebook, href: "https://facebook.com", label: "Facebook" },
//     { icon: Twitter, href: "https://twitter.com", label: "Twitter" },
//     { icon: Instagram, href: "https://instagram.com", label: "Instagram" },
//     { icon: LinkedIn, href: "https://linkedin.com", label: "LinkedIn" },
//     { icon: Youtube, href: "https://youtube.com", label: "YouTube" },
//   ];

  return (
    <footer className="bg-muted/50 border-t border-border mt-auto">
      {/* Main Footer Content */}
      <div className="mx-auto w-full max-w-7xl px-4 py-12">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-6">
          {/* Brand Section */}
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <Book className="h-8 w-8 text-primary" />
              <span className="text-xl font-bold">SkillBridge</span>
            </Link>
            <p className="text-sm text-muted-foreground mb-6 max-w-sm">
              Connect with expert tutors and learn anything. Your bridge to knowledge and success.
            </p>
            
            {/* Contact Info */}
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <Mail className="h-4 w-4 shrink-0" />
                <a href="mailto:support@skillbridge.com" className="hover:text-primary transition-colors">
                  support@skillbridge.com
                </a>
              </div>
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <Phone className="h-4 w-4 shrink-0" />
                <a href="tel:+1234567890" className="hover:text-primary transition-colors">
                  +1 (234) 567-890
                </a>
              </div>
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4 shrink-0" />
                <span>123 Education St, Learning City</span>
              </div>
            </div>
          </div>

          {/* Link Sections */}
          {sections.map((section) => (
            <div key={section.title}>
              <h3 className="font-semibold mb-4 text-foreground">{section.title}</h3>
              <ul className="space-y-3">
                {section.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground hover:text-primary transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Newsletter Section */}
        <div className="mt-12 pt-8 border-t border-border">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 items-center">
            <div>
              <h3 className="font-semibold text-lg mb-2">Stay Updated</h3>
              <p className="text-sm text-muted-foreground">
                Subscribe to our newsletter for tips, updates, and special offers.
              </p>
            </div>
            <div className="flex gap-2">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-2 text-sm rounded-md border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring"
              />
              <button className="px-6 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:opacity-90 transition-opacity">
                Subscribe
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-border bg-muted/30">
        <div className="mx-auto w-full max-w-7xl px-4 py-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            {/* Copyright */}
            <p className="text-sm text-muted-foreground">
              © {currentYear} SkillBridge. All rights reserved.
            </p>

            {/* Social Links */}
            <div className="flex items-center gap-4">
              <span className="text-sm text-muted-foreground hidden md:inline">Follow us:</span>
              {/* <div className="flex gap-3">
                {socialLinks.map((social) => {
                  const Icon = social.icon;
                  return (
                    <a
                      key={social.label}
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={social.label}
                      className="h-9 w-9 flex items-center justify-center rounded-md border border-border hover:bg-muted hover:border-primary transition-colors"
                    >
                      <Icon className="h-4 w-4 text-muted-foreground hover:text-primary transition-colors" />
                    </a>
                  );
                })}
              </div> */}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}