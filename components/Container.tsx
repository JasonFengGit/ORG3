import { useState, useEffect } from "react";

export default function Container(props) {

    const getMargin = () => {
        // responsive margin
        if (window.innerWidth > 1200) {
            return 75;
        } else if (window.innerWidth > 992) {
            return 50;
        } else if (window.innerWidth > 768) {
            return 25;
        } else {
            return 12;
        }
    }

    // change width when resize
    const [margin, setMargin] = useState(0);
    
    useEffect(() => {
        setMargin(getMargin());
        const handleResize = () => {
            setMargin(getMargin());
        };
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    return <div style={{ width: `calc(100vw - ${margin}px)`, maxWidth: "1500px", margin: "0 auto", marginTop: props.marginTop ? '96px' : '0px' }}>
        {props.children}
    </div>
}