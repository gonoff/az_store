import Image from 'next/image';
import Link from 'next/link';
import { cn } from '@/lib/utils';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  className?: string;
  href?: string;
}

const sizeConfig = {
  sm: {
    logo: 24,
    text: 'text-lg',
  },
  md: {
    logo: 32,
    text: 'text-xl',
  },
  lg: {
    logo: 40,
    text: 'text-2xl',
  },
};

export function Logo({ size = 'md', showText = true, className, href = '/' }: LogoProps) {
  const config = sizeConfig[size];

  const content = (
    <div className={cn('flex items-center gap-2', className)}>
      <Image
        src="/azteam_logo.svg"
        alt="AZTEAM Logo"
        width={config.logo}
        height={config.logo}
        priority
      />
      {showText && (
        <span
          className={cn('font-bold tracking-tight text-primary', config.text)}
          style={{ fontFamily: 'var(--font-heading), ui-sans-serif, system-ui, sans-serif' }}
        >
          AZ Team
        </span>
      )}
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="hover:opacity-90 transition-opacity">
        {content}
      </Link>
    );
  }

  return content;
}
