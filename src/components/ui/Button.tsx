import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { Link } from 'react-router';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';
type Size = 'sm' | 'md' | 'lg';

const base =
  'inline-flex items-center justify-center gap-2 font-mono uppercase tracking-wider border transition-all duration-150 disabled:opacity-40 disabled:pointer-events-none select-none';

const variants: Record<Variant, string> = {
  primary: 'bg-ink text-paper border-ink hover:bg-paper hover:text-ink',
  secondary: 'bg-transparent text-ink border-ink hover:bg-ink hover:text-paper',
  ghost: 'bg-transparent text-ink border-transparent underline-offset-4 hover:underline',
  danger: 'bg-transparent text-red-800 border-red-800/40 hover:bg-red-800 hover:text-paper hover:border-red-800',
};

const sizes: Record<Size, string> = {
  sm: 'text-[11px] h-9 px-3',
  md: 'text-xs h-11 px-5',
  lg: 'text-xs sm:text-sm h-12 sm:h-14 px-6 sm:px-8',
};

interface CommonProps {
  variant?: Variant;
  size?: Size;
  className?: string;
  children: ReactNode;
}

type ButtonProps = CommonProps & ButtonHTMLAttributes<HTMLButtonElement> & { to?: undefined };
type LinkProps = CommonProps & { to: string; state?: unknown; onClick?: () => void };

export function Button(props: ButtonProps | LinkProps) {
  const { variant = 'primary', size = 'md', className = '', children } = props;
  const classes = `${base} ${variants[variant]} ${sizes[size]} ${className}`;

  if (props.to !== undefined) {
    return (
      <Link to={props.to} state={props.state} onClick={props.onClick} className={classes}>
        {children}
      </Link>
    );
  }

  const { variant: _v, size: _s, className: _c, children: _ch, to: _to, type = 'button', ...rest } = props;
  return (
    <button type={type} className={classes} {...rest}>
      {children}
    </button>
  );
}
