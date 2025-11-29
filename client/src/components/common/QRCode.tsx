import { QRCodeSVG } from "qrcode.react";
import favicon from "../../assets/project_favicon.svg";
import { Item, ItemContent } from "../ui/item";
import { useRef } from "react";
import { Download } from "lucide-react";
import { Button } from "../ui/Button";

type multipleOfSixteen =
  | 0
  | 16
  | 32
  | 48
  | 64
  | 80
  | 96
  | 112
  | 128
  | 144
  | 160
  | 176
  | 192
  | 208
  | 224
  | 240
  | 256
  | 272
  | 288
  | 304
  | 320
  | 336
  | 352
  | 368
  | 384
  | 400;

type QRCodeProps = {
  link: string;
  size: multipleOfSixteen;
  title: string;
  showDownload?: boolean;
};

const padding = 32;
const innerImageSizeFactor = 8;

function QRCode({ link, size, title, showDownload = true }: QRCodeProps) {
  const qrRef = useRef<HTMLDivElement>(null);

  const handleDownload = () => {
    if (!qrRef.current) return;
    const svg = qrRef.current.querySelector("svg");
    if (!svg) return;
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const scale = 2;
    canvas.width = size * scale;
    canvas.height = size * scale;
    const svgData = new XMLSerializer().serializeToString(svg);
    const svgBlob = new Blob([svgData], {
      type: "image/svg+xml;charset=utf-8",
    });
    const url = URL.createObjectURL(svgBlob);
    const img = new Image();
    img.onload = () => {
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      canvas.toBlob((blob) => {
        if (!blob) return;
        const downloadUrl = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = downloadUrl;
        link.download = `${title.replace(/[^a-z0-9]/gi, "_").toLowerCase()}_qr_code.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(downloadUrl);
      });
      URL.revokeObjectURL(url);
    };
    img.src = url;
  };

  return (
    <div className="flex w-full max-w-md flex-col gap-6">
      <div ref={qrRef}>
        <Item variant="outline" size="sm" asChild width={size} height={size}>
          <div className="cursor-default">
            <ItemContent>
              <QRCodeSVG
                value={link}
                title={title} //TODO cahnge the title
                size={size - padding}
                bgColor={"#ffffff"}
                fgColor={"#000000"}
                level={"L"}
                imageSettings={{
                  src: favicon,
                  x: undefined,
                  y: undefined,
                  height: size / innerImageSizeFactor,
                  width: size / innerImageSizeFactor,
                  opacity: 1,
                  excavate: true,
                }}
              />
            </ItemContent>
          </div>
        </Item>
      </div>
      {showDownload && (
        <Button
          onClick={handleDownload}
          variant="outline"
          size="sm"
          className="w-full flex items-center justify-center gap-2"
        >
          <Download className="h-4 w-4" />
          Download QR Code
        </Button>
      )}
    </div>
  );
}

export default QRCode;
