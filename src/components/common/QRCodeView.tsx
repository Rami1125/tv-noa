import { useState } from "react";
import { QrCode } from "lucide-react";
import { cn } from "@/lib/utils";

interface QRCodeViewProps {
  value: string;
  size?: number;
  className?: string;
  caption?: string;
  showIcon?: boolean;
}

export function QRCodeView({
  value,
  size = 180,
  className,
  caption = "סרוק בנייד למפרט מלא והצגה לדלפק",
  showIcon = true,
}: QRCodeViewProps) {
  const [hasError, setHasError] = useState(false);

  // Use high-contrast, fast qrserver API with clean margins
  const encodedData = encodeURIComponent(value);
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&margin=2&format=svg&data=${encodedData}`;

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-2xl border border-sky-200/80 bg-white/95 p-3.5 shadow-xl backdrop-blur-md text-center select-none",
        className,
      )}
    >
      <div
        className="relative overflow-hidden rounded-xl border border-slate-200/80 bg-white p-1.5 shadow-inner"
        style={{ width: size, height: size }}
      >
        {!hasError ? (
          <img
            src={qrUrl}
            alt="קוד QR לדף מוצר"
            className="size-full object-contain"
            onError={() => setHasError(true)}
            loading="eager"
          />
        ) : (
          <div className="flex size-full flex-col items-center justify-center bg-slate-50 text-slate-400 p-2">
            <QrCode className="size-12 mb-1 text-sky-600" />
            <span className="text-[10px] font-mono text-slate-500 break-all leading-tight">
              {value}
            </span>
          </div>
        )}

        {/* Small Center Saban Logo / Badge */}
        {showIcon && !hasError && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="rounded-full bg-white/90 p-1 shadow-sm ring-1 ring-sky-500/30">
              <span className="flex size-5 items-center justify-center rounded-full bg-sky-600 text-[10px] font-black text-white">
                ס
              </span>
            </div>
          </div>
        )}
      </div>

      {caption && (
        <div className="mt-2 text-center max-w-[200px]">
          <p className="text-xs font-black text-slate-800 leading-tight">{caption}</p>
          <span className="text-[10px] font-semibold text-sky-600">ח. סבן חומרי בניין בע״מ</span>
        </div>
      )}
    </div>
  );
}
