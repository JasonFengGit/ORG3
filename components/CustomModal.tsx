import { Modal, Card } from "@ensdomains/thorin";
//for future modal, always use this one. may update older modal later

export default function CustomModal(props) {
    const { open, onDismiss, title } = props;
    return (
        <Modal open={open} onDismiss={onDismiss}>
            <Card title={title ? title : ""}
                style={{ padding: 30, width: 500 }}>
                {props.children}
            </Card>
        </Modal>)
}