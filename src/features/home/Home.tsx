import { Button, Form, Input, Radio } from "antd"
import { Link } from "gatsby"
import { StaticImage } from "gatsby-plugin-image"
import * as React from "react"
import { FaBolt, FaChartLine } from "react-icons/fa"
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
    { to: "/plot", icon: <FaChartLine />, text: "Plot Demo" },
    { to: "/dynamic?league=mlb", icon: <FaBolt />, text: "Dynamic Demo" },
  ]

  return (
    <>
      <Container size={16} centered>
        <h2>Gatsby Template</h2>
        <p>Starter template for Gatsby projects with various reusable components</p>
      </Container>

      <Container bottom={32}>
        <StaticImage src="../../images/chicago-banner.jpg" alt="Train" placeholder="blurred" layout="constrained" />
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

      <Container top={32} bottom={16} width={400}>
        <Container centered>
          <Radio.Group
            options={[
              { label: 'Contact', value: 'contact' },
              { label: 'About', value: 'about' },
            ]}
            optionType="button"
            buttonStyle="solid"
            value={tab}
            onChange={({ target }) => { setTab(target.value) }}
          />
        </Container>

        {tab == 'contact' && (
          <Container>
            <Container centered>
              <h4>Contact Us</h4>
            </Container>
            <Form
              onFinish={(values) => { console.log(values) }}
              autoComplete="off"
              layout="vertical"
            >
              <Form.Item label="Name" name="name" rules={[{ required: true }]} >
                <Input />
              </Form.Item>
              <Form.Item label="Message" name="message" rules={[{ required: true }]} >
                <Input.TextArea />
              </Form.Item>
              <Container centered>
                <Form.Item>
                  <Button type="primary" htmlType="submit">Submit</Button>
                </Form.Item>
              </Container>
            </Form>
          </Container>
        )}

        {tab == 'about' && (
          <Container>
            <Container centered>
              <h4>About Us</h4>
            </Container>
            <Container width={350}>
              This is a starter template for building a static generated front-end.
              Content is pre-loaded and any dynamic content must be fetched in the
              client.
            </Container>
          </Container>
        )}
      </Container>
    </>
  )
}

export default Home
