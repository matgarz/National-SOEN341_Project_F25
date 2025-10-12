import { QRCodeSVG } from "qrcode.react";
import favicon from "../assets/project_favicon.svg";
import {
  Item,
  ItemContent,
} from "./ui/item";

type multipleOfSixteen = 0 | 16 | 32 | 48 | 64 | 80 | 96 | 112 | 128 | 144 | 160 | 176 | 192 | 208 | 224 | 240 | 256 | 272 | 288 | 304 | 320 | 336 | 352 | 368 | 384 | 400; 

type QRCodeProps = {
    link: string;
    size: multipleOfSixteen;
    title: string;
};

const padding = 32;
const innerImageSizeFactor = 4;

function QRCode({link, size, title} : QRCodeProps){

    return (
    <div className="flex w-full max-w-md flex-col gap-6">
        <Item variant="outline" size="sm" asChild width={size} height={size}>
            <a href={link}   target="_blank">
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
                        height: size/innerImageSizeFactor,
                        width: size/innerImageSizeFactor,
                        opacity: 1,
                        excavate: true,
                    }}
                    />
                </ItemContent>
            </a>
        </Item>
    </div>); 
}

export default QRCode;
