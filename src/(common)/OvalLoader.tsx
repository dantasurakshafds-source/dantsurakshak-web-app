"use client";

import React from "react";
import { Oval } from "react-loader-spinner";

export interface OvalLoaderProps {
  visible?: boolean;
  height?: string | number;
  width?: string | number;
  color?: string;
  secondaryColor?: string;
  strokeWidth?: string | number;
  strokeWidthSecondary?: string | number;
  ariaLabel?: string;
  wrapperStyle?: React.CSSProperties;
  wrapperClass?: string;
}

export default function OvalLoader({
  visible = true,
  height = "100",
  width = "100",
  color = "url(#ovalGradient)",
  secondaryColor = "url(#ovalGradient)",
  strokeWidth = 2,
  strokeWidthSecondary = 2,
  ariaLabel = "oval-loading",
  wrapperStyle = {},
  wrapperClass = "",
}: OvalLoaderProps) {
  return (
    <>
      <svg width="0" height="0" style={{ position: "absolute", width: 0, height: 0, pointerEvents: "none" }}>
        <defs>
          <linearGradient id="ovalGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="20.81%" stopColor="#56235E" />
            <stop offset="100%" stopColor="#C1392D" />
          </linearGradient>
        </defs>
      </svg>
      <Oval
        visible={visible}
        height={height}
        width={width}
        color={color}
        secondaryColor={secondaryColor}
        strokeWidth={strokeWidth}
        strokeWidthSecondary={strokeWidthSecondary}
        ariaLabel={ariaLabel}
        wrapperStyle={wrapperStyle}
        wrapperClass={wrapperClass}
      />
    </>
  );
}
