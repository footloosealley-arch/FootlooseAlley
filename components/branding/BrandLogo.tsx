import Image from "next/image";

interface BrandLogoProps {
  width?: number;
  height?: number;
  className?: string;
}

export default function BrandLogo({
  width = 240,
  height = 120,
  className,
}: BrandLogoProps) {
  return (
    <span
      className={`relative inline-block max-w-full align-middle print-color-adjust-exact ${className ?? ""}`}
      style={{ width, height }}
    >
      <Image
        src="/footloose-alley-logo.png"
        alt="Footloose Alley official logo"
        fill
        sizes={`${width}px`}
        className="object-contain"
        priority
      />
    </span>
  );
}
