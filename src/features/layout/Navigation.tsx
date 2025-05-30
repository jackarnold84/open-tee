import { Button, List } from "antd"
import { Link } from "gatsby"
import * as React from "react"
import { FaBolt, FaChartLine, FaHome } from "react-icons/fa"
import styled from "styled-components"
import * as styles from "./layout.module.css"

export const MenuButton = styled(Button)`
  display: inline-flex;
  align-items: center;
  justify-content: center;

  & > span {
    margin-left: 6px;
  }
`;

interface NavigationProps {
  closeMenu: () => void;
}

const Navigation: React.FC<NavigationProps> = ({ closeMenu }) => {
  const links = [
    { to: "/", icon: <FaHome />, text: "Home" },
    { to: "/plot", icon: <FaChartLine />, text: "Plot Demo" },
    { to: "/dynamic?league=mlb", icon: <FaBolt />, text: "Dynamic Demo" },
  ]

  return (
    <>
      <List
        size="small"
        dataSource={links}
        renderItem={item => (
          <List.Item>
            <Link to={item.to} className={styles.navLink}>
              <MenuButton type="text" icon={item.icon} size="large" block onClick={closeMenu} >
                {item.text}
              </MenuButton>
            </Link>
          </List.Item>
        )}
      />
    </>
  )
}

export default Navigation
