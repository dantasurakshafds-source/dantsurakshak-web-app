
"use client";

import React from "react";
import OvalLoader from "./OvalLoader";

export default function Loader() {
  return (
    <div
      className="main-page-loader"
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "calc(100vh - 120px)",
        width: "100%",
        padding: "20px",
        boxSizing: "border-box",
      }}
    >
      <OvalLoader
        visible={true}
        height="100"
        width="100"
        color="url(#ovalGradient)"
        secondaryColor="url(#ovalGradient)"
        strokeWidth={2}
        strokeWidthSecondary={2}
        ariaLabel="oval-loading"
      />
    </div>
  );
}

