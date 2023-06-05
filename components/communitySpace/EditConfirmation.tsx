import { Modal, Button, Card, Typography } from "@ensdomains/thorin";
import { AlertSVG } from "@ensdomains/thorin";
import React from "react";

export default function EditConfirmation({ ...props }) {
    const { open, setEditOpen, link } = props;


    return (
        <Modal open={open} onDismiss={() => { setEditOpen(false) }}>
            <Card style={{ width: 500, padding: 50, textAlign: "center" }}>
                <AlertSVG style={{ width: 50, height: 50, color: "hsl(216 100% 61%)", margin: "auto" }} />
                <Typography>You are about to leave ORG3 and go to the ENS website, please remember to come back!</Typography>
                <div style={{ width: "100%", display: "flex", marginTop: 10 }}>
                    <Button style={{ marginRight: 10 }} colorStyle="accentSecondary"
                        onClick={() => { setEditOpen(false) }}
                    >Cancel</Button>
                    <Button as="a" target="_blank" href={link} onClick={() => { setEditOpen(false) }}> Go to ENS and edit </Button>
                </div>
            </Card>
        </Modal>
    );
}