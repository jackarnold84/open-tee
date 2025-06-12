import { Link } from "gatsby"
import { StaticImage } from "gatsby-plugin-image"
import * as React from "react"
import { FaPlus } from "react-icons/fa"
import styled from "styled-components"
import Container from "../../components/Container"
import { MenuButton } from "../layout/Navigation"

const NavLink = styled(Link)`
  margin: auto;
  width: 100%;
  margin: 8px 0;
`;

const Home = () => {
  const [tab, setTab] = React.useState('contact')

  const links = [
    { to: "/create", icon: <FaPlus />, text: "Create Alert" },
  ]

  return (
    <>
      <Container size={16} centered>
        <h2>OpenTee</h2>
        <p>Stay informed with real-time alerts for available open tee time bookings</p>
      </Container>

      <Container bottom={32}>
        <StaticImage src="../../images/opentee-banner.png" alt="Golf Course Banner" placeholder="blurred" layout="constrained" />
      </Container>

      <Container width={500}>
        {links.map(link => (
          <Container key={link.to}>
            <NavLink to={link.to}>
              <MenuButton type="primary" icon={link.icon} size="large" block>
                {link.text}
              </MenuButton>
            </NavLink>
          </Container>
        ))}
      </Container>
    </>
  )
}

export default Home
