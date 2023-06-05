import { message, Space } from "antd";
import { Button } from "antd";
import { relative } from "path";
import { Typography, Card, Skeleton, Avatar } from 'antd';
const { Meta } = Card;
import { toast } from 'react-toastify';
import { useEffect, useState } from "react";
const { Title, Text } = Typography;
import CopyShare from "../../utils/CopyShare";
import router from "next/router";

export default function CommunitySummaryCard({ ...props }) {

    const { communityName,
        ensDomain,
        memberNum,
        avatarSrc,
        telegram,
        twitter,
        website,
        discord,
    } = props.data;

    const [messageApi, contextHolder] = message.useMessage();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(true);
        if (props.data.ensDomain) {
            setLoading(false);
        }
    }, [props.data])

    /*
    const handleInvite = (link: string) => {
        messageApi.open({
            type: 'success',
            content: "Invitation linked copied!",
        });
        navigator.clipboard.writeText(link);
    }*/

    if (loading) {
        return (
            <Card style={{
                width: "100%", height: 550, borderRadius: "10px", backgroundColor: "white"
            }} loading={true}>
                {/* <Skeleton.Avatar active style={{ width: 140, height: 140 }} /> */}

            </Card>)
    }
    console.log("#####", props)
    return (
        <Card
            style={{
                width: "100%", borderRadius: "10px", backgroundColor: "white"
            }}
            className={"summary-card"}
        >
            {/* {contextHolder}
            <div style={{
                width: "100%", height: 100,
            }}> */}
            {/* </div> */}
            {/* <div style={{ width: "100%", height: 340, position: "relative" }}> */}
            <div style={{
                width: 84, height: 84, borderRadius: "50%", border: "5px white",
                margin: "24px auto", bottom: 70
            }}>
                <img src={avatarSrc} alt={`${communityName} avatar`} style={{ width: "100%", height: "100%", borderRadius: "50%" }} />
            </div>
            {props.isOwner && <Button
                type="primary"
                size="small"
                style={{
                    position: "absolute", top: 30, right: 19, width: 56, height: 26,
                    fontSize: 13
                }}
                onClick={() => {
                    props.setEditOpen(true)
                }}>
                Edit
            </Button>}
            <div style={{
                width: "100%",
                display: "flex",
                flexDirection: "column",
                alignItems: "center"
            }}>
                <Title level={3} style={{ margin: "6px 0" }}>{ensDomain}</Title>
                {/* <Text strong style={{ margin: "20px 0 10px 0", fontSize: 16 }}>{ensDomain}</Text> */}
                <Text strong style={{ margin: "10px 0 20px 0", fontSize: 16 }}>{memberNum} {memberNum == 1 ? "Member" : "Members"}</Text>
                {props.isOwner &&
                    <Button
                        type="primary"
                        style={{ width: "84%", height: 48, marginBottom: 16, fontWeight: "700", fontSize: "16px", lineHeight: "21px" }}
                        onClick={() => { router.push("/giveoutpass/" + ensDomain); }}
                    >
                        Give out membership
                    </Button>
                }
                {
                    //when the user is owner and rule created or when user is not owner
                    //and rule hasn't stopped
                    (props.isOwner && props.ruleCreated || !props.isOwner) && !props.stopped
                    &&
                    <Button
                        type={props.isOwner ? "default" : "primary"}
                        onClick={() => CopyShare(window.location.origin + '/join/' + ensDomain)}
                        style={{ width: "84%", height: 48, fontWeight: "700", fontSize: "16px", lineHeight: "21px" }}>
                        Share Invitation
                    </Button>
                }
                {/* {
                        //when the user is owner and the rules has not created
                        props.isOwner && !props.ruleCreated 
                        && <Button
                            onClick={() => {
                                props.setMintRuleOpen(true);
                            }}
                            style={{ width: "84%", height: 48, fontWeight: "700", fontSize: "16px", lineHeight: "21px" }}>
                            Create Mint Rules
                        </Button>
                    } */}
                {
                    //as long as the minting has been stopped
                    props.stopped && props.ruleCreated
                    && <Button
                        disabled
                        style={{ width: "80%", height: 48, fontWeight: "700", fontSize: "16px", lineHeight: "21px" }}>
                        Share Invitation
                    </Button>
                }



                <div style={{ width: 156, height: 24, display: "flex", justifyContent: "space-between", marginTop: "25px", marginBottom: "20px" }}>
                    {website ?
                        <a href={website} target="_blank"><img src="/img/website_icon.png" alt="website" style={{ width: 24, aspectRatio: 1 }} /></a>
                        :
                        <img src="/img/website_icon.png" alt="website" style={{ width: 24, aspectRatio: 1, opacity: 0.3 }} />
                    }

                    {discord ?
                        <a href={discord} target="_blank"><img src="/img/discord_icon.png" alt="website" style={{ width: 24, aspectRatio: 1 }} /></a>
                        :
                        <img src="/img/discord_icon.png" alt="discord" style={{ width: 24, aspectRatio: 1, opacity: 0.3 }} />
                    }

                    {twitter ?
                        <a href={twitter} target="_blank"><img src="/img/twitter_icon.png" alt="website" style={{ width: 24, aspectRatio: 1 }} /></a>
                        :
                        <img src="/img/twitter_icon.png" alt="twitter" style={{ width: 24, aspectRatio: 1, opacity: 0.3 }} />
                    }

                    {telegram ?
                        <a href={telegram} target="_blank"><img src="/img/telegram_icon.png" alt="website" style={{ width: 24, aspectRatio: 1 }} /></a>
                        :
                        <img src="/img/telegram_icon.png" alt="telegram" style={{ width: 24, aspectRatio: 1, opacity: 0.3 }} />
                    }

                </div>
            </div>
            {/* </div> */}
        </Card>
    )
}