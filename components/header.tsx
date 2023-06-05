import ConnectButtonWrapper from './connect-button'
import Container from './Container';
import { Logo } from './Logo';

export default function Header({ position, setEditProfileLink, setProfileEditOpen }) {
  return (
    <header className={['header', [position && `header--${position}`]].join(' ')}>
      <Container>
        <div className='header__wrapper'>
          <Logo />
          <ConnectButtonWrapper setEditProfileLink={setEditProfileLink} setProfileEditOpen={setProfileEditOpen} />
        </div>
      </Container>
    </header>
  )
}