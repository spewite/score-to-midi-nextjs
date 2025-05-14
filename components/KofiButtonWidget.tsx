// components/KofiButtonWidget.tsx
"use client";

import Image from 'next/image';
import Link from 'next/link';

const KofiButtonWidget = () => {
  return (
    <Link href="https://ko-fi.com/X8X11EXQLW" target="_blank" rel="noopener noreferrer">
      <Image
        height={36}
        width={146}
        style={{ border: '0px', height: '36px', width: 'auto' }}
        src="https://storage.ko-fi.com/cdn/kofi5.png?v=6"
        alt="Buy Me a Coffee at ko-fi.com"
      />
    </Link>
  );
};

export default KofiButtonWidget;

