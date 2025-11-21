import { Loader2 } from "lucide-react";

type LoadingProps = { size?: number } & React.HTMLAttributes<HTMLDivElement>;

export default function Loading({
  size = 32,
  className,
  ...props
}: LoadingProps) {
  return (
    <div className={`w-full flex justify-center  ${className}`} {...props}>
      <Loader2 className="animate-spin" size={size} />
    </div>
  );
}
