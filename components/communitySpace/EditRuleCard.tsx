import { Button, message, Space } from "antd";
import { relative } from "path";
import { Typography, Card, Skeleton, Avatar } from 'antd';
const { Meta } = Card;
import { toast } from 'react-toastify';
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
const { Title, Text } = Typography;

export default function EditRuleCard(props) {
    const router = useRouter()

    return (
        <Card
            style={{
                width: 200, height: 200, overflow: "hidden", borderRadius: "10px", backgroundColor: "white", marginTop: "30px", marginBottom: "30px"
            }}
            onClick={() => {
                router.push("/edit/" + props.ens); // OK
            }}
        >
            <div style={{ width: "100%", height: "auto", position: "relative" }}>
                <div style={{
                    width: "100%", display: "flex", flexDirection: "column"
                }}>
                    <div>
                        <Text style={{ fontSize: "24px", fontWeight: "700" }} >Edit Membership</Text>
                    </div>
                </div>
            </div>
        </Card>
    )
}