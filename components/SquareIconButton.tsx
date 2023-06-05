import React from "react";
import { Typography } from "@ensdomains/thorin";
import { useRouter } from "next/router";

export default function SquareIconButton({ link, icon, text }) {
    const router = useRouter();
    return <div className="square-icon-button"
        onClick={() => {
            router.push(link);
        }}>
        <img src={icon} alt={text} style={{ width: 60, height: 60 }} />
        <p style={{ fontSize: 15, color: "white", marginTop: 20 }}>{text}</p>
    </div>
}