'use client';

import "./globals.css";
import Link from "next/link";
import Image from "next/image";
import { useState } from "react";


export default function RootLayout({ children }) {
    const [showSun,setShowSun] = useState(true);
    const [lightmode, setLightmode] = useState(true);
    const [isHoverDisabled, setIsHoverDisabled] = useState(false);

    const handleClick = () => {
        setLightmode(!lightmode);
        setShowSun(!showSun);
        setIsHoverDisabled(true);
    };

    const handleMouseLeave = () => {
        setIsHoverDisabled(false);
    };

  return (
    <html lang="en" className={lightmode ? "light" : "dark"}>
      <body>
        <nav>
            <div className="flex">
                <Link className="block" href={`/`}>home</Link>
                <Link className="block" href={`/cool_guy/`}>cool guy</Link>
                <Link className="block" href={`/about_me/`}>about me</Link>
            </div>
            <div
                className="sun-div"
                onMouseLeave={handleMouseLeave}
                data-hover-disabled={isHoverDisabled}>
                <Image
                    className={showSun ? "sun" : "sun hidden"}
                    src="/sun.png"
                    alt="sun"
                    width={40}
                    height={40}
                    onClick={handleClick}
                />
                <Image
                className={showSun ? "sun-outline" : "sun-outline hidden"}
                src="/sun-outline.png"
                alt="sun"
                width={40}
                height={40}
                onClick={handleClick}
                />
            </div>
        </nav>
        {children}
      </body>
    </html>
  );
}
