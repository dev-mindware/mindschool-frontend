import { Facebook, Instagram, Linkedin, Phone } from "lucide-react";

export const footerSections = [
  {
    title: "Empresa",
    links: [
      { name: "Sobre Nós", href: "/#about" },
      { name: "Carreiras", href: "/careers" },
      { name: "Blog", href: "/blog" },
      { name: "Contacto", href: "/#contact" },
    ],
  },
  {
    title: "Serviços",
    links: [
      { name: "Identidade Visual", href: "/service#branding-section" },
      { name: "Desenvolvimento Web", href: "/service#website-section" },
      { name: "Email Profissional", href: "/service#email-section" },
    ],
  },
  {
    title: "Legal",
    links: [
      { name: "Política de Privacidade", href: "/privacy-policy" },
      { name: "Termos de Serviço", href: "/terms-of-service" },
      { name: "Política de Cookies", href: "/cookie-policy" },
    ],
  },
];

export const socialLinks = [
  {
    icon: Facebook,
    href: "https://www.facebook.com/profile.php?id=61574905379786",
  },
  { icon: Instagram, href: "https://www.instagram.com/mind.ware/" },
  {
    icon: Phone,
    href: "https://api.whatsapp.com/send/?phone=926665793&text&type=phone_number&app_absent=0",
  },
  { icon: Linkedin, href: "https://www.linkedin.com/company/mindware-ces" },
];
