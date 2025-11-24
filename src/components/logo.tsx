
import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";

type LogoProps = {
  className?: string;
  textClassName?: string;
};

export default function Logo({ className, textClassName }: LogoProps) {
  return (
    <Link
      href="/"
      className={cn(
        "flex items-center gap-2 text-primary hover:text-primary/80 transition-colors",
        className
      )}
    >
      <Image
        src="https://res.cloudinary.com/dzr4xjizf/image/upload/v1763979689/MTECHITINSTITUTE_logo.png"
        alt="MTech IT Institute Logo"
        width={40}
        height={40}
        className="h-10 w-10 object-contain"
      />
      <span
        className={cn(
          "font-headline text-xl font-bold tracking-tight",
          textClassName
        )}
      >
        MTech IT Institute
      </span>
    </Link>
  );
}
