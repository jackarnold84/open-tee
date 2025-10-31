import { GithubFilled, MenuOutlined } from "@ant-design/icons"
import { Button, ConfigProvider, Drawer } from "antd"
import { Link } from "gatsby"
import * as React from "react"
import { MdAccountCircle } from "react-icons/md"
import '../../styles/global.css'
import { useAuth } from "./AuthProvider"
import * as styles from "./layout.module.css"
import Navigation from "./Navigation"

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { isLoggedIn } = useAuth();

  const [openMenu, setOpenMenu] = React.useState(false);
  const [isMounted, setIsMounted] = React.useState(false);

  React.useEffect(() => {
    setIsMounted(true);
  }, []);

  const showMenu = () => {
    setOpenMenu(true);
  };

  const closeMenu = () => {
    setOpenMenu(false);
  };

  return (
    <>
      <ConfigProvider>
        <div className={styles.pageContainer}>
          <header className={styles.header}>
            <div className={styles.headerContent}>
              <div className={styles.menuButtonHolder}>
                <Button
                  type="primary"
                  className={styles.menuButton}
                  icon={<MenuOutlined />}
                  onClick={showMenu}
                />
              </div>
              <h3 className={styles.title}>
                <Link to="/" className={styles.link}>
                  OpenTee
                </Link>
              </h3>
              <div className={styles.signInButtonHolder}>
                {isMounted &&
                  <Link to="/account">
                    {isLoggedIn ? (
                      <Button
                        type="primary"
                        className={styles.menuButton}
                        icon={<MdAccountCircle />}
                        size="large"
                      />
                    ) : (
                      <Button
                        type="ghost"
                        className={`${styles.menuButton} ${styles.menuTextButton}`}
                      >
                        Sign In
                      </Button>
                    )}
                  </Link>
                }
              </div>
            </div>
          </header>

          <div className={styles.contentWrapper}>
            <div className={styles.bodyContainer}>
              {children}
            </div>
          </div>

          <footer className={styles.footer}>
            <div className={styles.footerContent}>
              <span className={styles.footerText}>
                Created by Jack Arnold
              </span>
              <span>
                <Button
                  type="primary"
                  size="small"
                  className={styles.githubButton}
                  icon={<GithubFilled />}
                  href="https://github.com/jackarnold84/open-tee"
                >
                  Github
                </Button>
              </span>
            </div>
          </footer>
        </div>

        <Drawer title="OpenTee" onClose={closeMenu} open={openMenu} placement="top">
          <Navigation closeMenu={closeMenu} />
        </Drawer>
      </ConfigProvider>
    </>
  )
}

export default Layout
