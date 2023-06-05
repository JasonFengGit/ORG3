import ConnectButtonWrapper from './connect-button'
import Container from './Container';
import { Logo } from './Logo';
import { TwitterOutlined } from '@ant-design/icons';

export default function Footer(props) {
    const { light } = props;
    return (
        <footer className={["footer", light && "footer-light"].join(" ")}>
            <Container>
                <div style={{
                    display: "flex", justifyContent: "space-bewtween", alignItems: "center",
                    height: "100%", width: "100%"
                }}>
                    <p>
                        org3.eth | ETHSF 2022 & ETHDenver 2023 Hackathon winners
                    </p>
                    <a style={{ marginLeft: 15, color: light ? "white" : "rgb(29, 155, 240)" }}
                        target="_blank"
                        href='https://twitter.com/org3_eth'
                    >
                        <TwitterOutlined />
                    </a>
                </div>
            </Container>
        </footer>
    )
}