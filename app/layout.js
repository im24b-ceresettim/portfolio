'use client';

import "./globals.css";
import Link from "next/link";
import Image from "next/image";
import { useState } from "react";


export default function RootLayout({ children }) {
    const [showSun,setShowSun] = useState(true);

  return (
    <html lang="en">
      <body>
        <nav className="sticky bg-white top-0 flex items-center justify-between border-b border-black">
            <div className="flex">
                <Link className="block" href={`/`}>home</Link>
                <Link className="block" href={`/cool_guy/`}>cool guy</Link>
            </div>
            <div className="sun-div cursor-pointer">
                <Image
                    className={showSun ? "sun" : "sun hidden"}
                    src="/sun.png"
                    alt="sun"
                    width={40}
                    height={40}
                    onClick={() => setShowSun(!showSun)}
                />
                <Image
                className={showSun ? "sun-outline" : "sun-outline hidden"}
                src="/sun-outline.png"
                alt="sun"
                width={40}
                height={40}
                onClick={() => setShowSun(!showSun)}
                />
            </div>
        </nav>
        {children}
      </body>
    </html>
  );
}
