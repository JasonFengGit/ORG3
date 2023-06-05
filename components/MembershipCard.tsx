import React from "react";
import { useState } from "react";
import { Card } from "antd";

export default function MembershipCard(props) {
    const { text, data } = props;
    //add loading functionality later
    if (props.data < 0 || props.data == undefined) {
        return (
            <Card style={{
                width: "100%", height: 150, borderRadius: "10px",
                backgroundColor: "rgba(78,134,247,0.1)",
                marginTop: 25
            }} loading={true}>
            </Card>)
    }

    return (
        <div style={{
            width: "100%", height: 150, borderRadius: 20,
            padding: 20, color: "#4E86F7",
            backgroundColor: "rgba(78,134,247,0.1)",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            marginTop: 25
        }}>
            <div style={{ display: "flex" }}>
                <img src="/user_check_icon.png" alt="icon"
                    style={{
                        lineHeight: "25px", display: "inline-block",
                        marginRight: 10, width: 25, height: 25
                    }} />
                <p style={{ lineHeight: "25px" }}>
                    {text}
                </p>
            </div>
            <p style={{ fontSize: 40, fontWeight: "bold" }}>{data}</p>
        </div>
    )
}