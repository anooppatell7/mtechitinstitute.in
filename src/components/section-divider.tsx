
import { cn } from "@/lib/utils";

type DividerStyle = 'wave' | 'angle';

type SectionDividerProps = {
  style?: DividerStyle;
  className?: string;
  position?: 'top' | 'bottom';
};

const Wave = ({ position }: { position?: 'top' | 'bottom' }) => (
  <div
    className={cn(
      "absolute bottom-0 left-0 w-full overflow-hidden leading-none",
      position === 'top' && "top-0 -scale-y-100",
      position === 'bottom' && "bottom-0"
    )}
    style={{ transform: position === 'top' ? 'translateY(-1px) scaleY(-1)' : 'translateY(1px)'}}
  >
    <svg
      className="relative block h-[50px] w-full lg:h-[100px]"
      data-name="Layer 1"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 1200 120"
      preserveAspectRatio="none"
    >
      <path
        d="M985.66,92.83C906.67,72,823.78,31,743.84,14.19c-82.26-17.34-168.06-16.33-250.45.39-57.84,11.73-114,31.07-172,41.86A600.21,600.21,0,0,1,0,27.35V120H1200V95.8C1132.19,118.92,1055.71,111.31,985.66,92.83Z"
        className="fill-current"
      ></path>
    </svg>
  </div>
);


const Angle = ({ position }: { position?: 'top' | 'bottom' }) => (
    <div className="absolute inset-x-0 h-24 overflow-hidden"
     style={{ transform: position === 'top' ? 'scaleY(-1)' : '', top: position === 'top' ? '-1px' : 'auto', bottom: position === 'bottom' ? '-1px' : 'auto' }}
    >
        <svg
            className="h-full w-full"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
        >
            <polygon points="0,100 100,0 100,100" className="fill-current" />
        </svg>
    </div>
)


export default function SectionDivider({
  style = 'wave',
  className,
  position = 'bottom',
}: SectionDividerProps) {

  return (
    <div className={cn("pointer-events-none absolute left-0 w-full z-10", className)}>
        {style === 'wave' && <Wave position={position} />}
        {style === 'angle' && <Angle position={position} />}
    </div>
  );
}
