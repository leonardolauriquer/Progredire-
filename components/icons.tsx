
import React from 'react';

export const LogoIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    {...props}
  >
    <path d="M12 2a10 10 0 1 0 10 10" />
    <path d="M12 18a6 6 0 1 0 0-12v12z" />
    <path d="M12 12a2 2 0 1 0 0-4 2 2 0 0 0 0 4z" />
  </svg>
);

export const SparklesIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 24 24" 
    fill="currentColor" 
    {...props}
  >
    <path fillRule="evenodd" d="M9 4.5a.75.75 0 01.721.544l.813 2.846a3.75 3.75 0 002.846.813l2.846-.813a.75.75 0 01.976.976l-.813 2.846a3.75 3.75 0 00.813 2.846l2.846.813a.75.75 0 010 1.442l-2.846.813a3.75 3.75 0 00-.813 2.846l.813 2.846a.75.75 0 01-.976.976l-2.846-.813a3.75 3.75 0 00-2.846.813l-.813 2.846a.75.75 0 01-1.442 0l-.813-2.846a3.75 3.75 0 00-2.846-.813l-2.846.813a.75.75 0 01-.976-.976l.813-2.846a3.75 3.75 0 00-.813-2.846l-2.846-.813a.75.75 0 010-1.442l2.846-.813a3.75 3.75 0 00.813-2.846l-.813-2.846A.75.75 0 019 4.5zM18 1.5a.75.75 0 01.728.568l.258 1.036a.75.75 0 001.036.258l1.036-.258A.75.75 0 0122.5 3.75l-.258 1.036a.75.75 0 00.258 1.036l1.036.258a.75.75 0 010 1.456l-1.036.258a.75.75 0 00-.258 1.036l.258 1.036a.75.75 0 01-1.456.364l-1.036-.258a.75.75 0 00-1.036.258l-.258 1.036a.75.75 0 01-1.456 0l-.258-1.036a.75.75 0 00-1.036-.258l-1.036.258a.75.75 0 01-.364-1.456l1.036-.258a.75.75 0 00.258-1.036l-.258-1.036a.75.75 0 011.456-.364l1.036.258a.75.75 0 001.036-.258l.258-1.036A.75.75 0 0118 1.5zM12 6.75a.75.75 0 01.75.75v.008a.75.75 0 01-1.5 0V7.5a.75.75 0 01.75-.75z" clipRule="evenodd" />
  </svg>
);

export const MenuIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
  </svg>
);

export const XIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
);

export const PencilSquareIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
    </svg>
);

export const ClockIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
    </svg>
);

export const CogIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12a7.5 7.5 0 0 0 15 0m-15 0a7.5 7.5 0 1 1 15 0m-15 0H3m18 0h-1.5m-15 0a7.5 7.5 0 1 1 15 0m-15 0H3m18 0h-1.5m-15 0a7.5 7.5 0 1 1 15 0m-15 0H3m18 0h-1.5" />
    </svg>
);

export const ChartBarIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" />
    </svg>
);

export const HomeIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h7.5" />
    </svg>
);

export const QuestionMarkCircleIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 5.25h.008v.008H12v-.008Z" />
    </svg>
);
  
export const ChevronDownIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
    </svg>
);

export const UserIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
    </svg>
);

export const BuildingOfficeIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6h1.5m-1.5 3h1.5m-1.5 3h1.5M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21" />
    </svg>
);

export const ArrowTrendingUpIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 18 9-9 4.5 4.5L21.75 6" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 18H2.25" />
    </svg>
);

export const ArrowTrendingDownIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 6 9 9 4.5-4.5L21.75 18" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6H2.25" />
    </svg>
);

export const BrainIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.5 12.75a.75.75 0 01.75-.75h3a.75.75 0 010 1.5h-3a.75.75 0 01-.75-.75zm-3.383-2.425a.75.75 0 010 1.06l-1.06 1.06a.75.75 0 01-1.06-1.06l1.06-1.06a.75.75 0 011.06 0zm11.822 1.06a.75.75 0 01-1.06 0l-1.06-1.06a.75.75 0 111.06-1.06l1.06 1.06a.75.75 0 010 1.06zM4.5 15.75a.75.75 0 01.75-.75h13.5a.75.75 0 010 1.5H5.25a.75.75 0 01-.75-.75zM5.333 3.321C6.273 2.51 7.494 2 8.813 2c1.675 0 3.234.806 4.28 2.055A4.45 4.45 0 0115.188 6c.01 0 .02 0 .029 0a4.45 4.45 0 012.075 4.025 4.45 4.45 0 01-1.875 3.498C14.73 15.343 13.9 16.5 13.9 17.75V20.5a.75.75 0 01-1.5 0v-2.75c0-1.25-.83-2.407-1.498-3.477A4.45 4.45 0 017.029 10.025a4.45 4.45 0 012.075-4.025A4.488 4.488 0 018.813 4.5c0-.01 0-.02 0-.029a4.45 4.45 0 01-1.425-2.075c-.07-.156-.137-.314-.203-.474a4.512 4.512 0 00-1.852-2.101z" />
    </svg>
);

export const ShieldCheckIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.286z" />
    </svg>
);

export const InstagramIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.85s-.011 3.584-.069 4.85c-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07s-3.584-.012-4.85-.07c-3.252-.148-4.771-1.691-4.919-4.919-.058-1.265-.069-1.645-.069-4.85s.011-3.584.069-4.85c.149-3.225 1.664-4.771 4.919-4.919C8.416 2.175 8.796 2.163 12 2.163zm0 1.441c-3.193 0-3.563.012-4.788.068-2.923.134-4.142 1.358-4.28 4.28C2.863 9.236 2.85 9.605 2.85 12c0 2.395.013 2.764.068 3.988.138 2.923 1.357 4.142 4.28 4.28 1.225.056 1.595.068 4.788.068s3.563-.012 4.788-.068c2.923-.134 4.142-1.358 4.28-4.28.055-1.224.068-1.593.068-3.988s-.013-2.764-.068-3.988c-.138-2.923-1.357-4.142-4.28-4.28C15.563 3.615 15.193 3.604 12 3.604z" />
      <path d="M12 6.847c-2.846 0-5.153 2.307-5.153 5.153s2.307 5.153 5.153 5.153 5.153-2.307 5.153-5.153-2.307-5.153-5.153-5.153zm0 8.862c-2.046 0-3.709-1.663-3.709-3.709s1.663-3.709 3.709-3.709 3.709 1.663 3.709 3.709-1.663 3.709-3.709 3.709z" />
      <path d="M16.949 6.203c-.765 0-1.384.62-1.384 1.384s.62 1.384 1.384 1.384 1.384-.62 1.384-1.384-.619-1.384-1.384-1.384z" />
    </svg>
);

export const InovaCorpLogo: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg viewBox="0 0 100 25" fill="currentColor" {...props}>
      <path d="M0 0 H 25 V 25 H 0 Z M 12.5 12.5 A 12.5 12.5 0 0 1 25 25 L 12.5 25 Z" />
      <text x="30" y="18" fontFamily="Arial, sans-serif" fontSize="16" fontWeight="bold">InovaCorp</text>
    </svg>
);
  
export const VerticeLogo: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg viewBox="0 0 100 25" fill="currentColor" {...props}>
      <path d="M0 25 L 12.5 0 L 25 25 Z" />
      <text x="30" y="18" fontFamily="Arial, sans-serif" fontSize="16" fontWeight="bold">Vértice</text>
    </svg>
);

export const NexusTechLogo: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg viewBox="0 0 120 25" fill="currentColor" {...props}>
      <path d="M0 12.5 L 12.5 0 L 25 12.5 L 12.5 25 Z M 15 12.5 L 22.5 5 L 30 12.5 L 22.5 20 Z" />
      <text x="35" y="18" fontFamily="Arial, sans-serif" fontSize="16" fontWeight="bold">NexusTech</text>
    </svg>
);

export const AuraDigitalLogo: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg viewBox="0 0 125 25" fill="currentColor" {...props}>
      <circle cx="12.5" cy="12.5" r="12.5" />
      <circle cx="12.5" cy="12.5" r="6" fill="none" stroke="white" strokeWidth="2" />
      <text x="30" y="18" fontFamily="Arial, sans-serif" fontSize="16" fontWeight="bold">AuraDigital</text>
    </svg>
);