import niuLogo from "@/assets/unilogo.png";

interface UniversityLogoProps {
  className?: string;
  imageClassName?: string;
}

function UniversityLogo({ className = "", imageClassName = "" }: UniversityLogoProps) {
  return (
    <div
      className={`flex items-center justify-center overflow-hidden rounded-[1.1rem] border border-red-100/20 bg-white shadow-[0_16px_34px_rgba(124,25,32,0.16)] ${className}`}
    >
      <img
        alt="Noida International University logo"
        className={`h-full w-full object-contain ${imageClassName}`}
        src={niuLogo}
      />
    </div>
  );
}

export default UniversityLogo;
