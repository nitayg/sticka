
import { ReactNode } from "react";
import Header from "./Header";
import Footer from "./Footer"; 

// Add a CSS class to the Layout component to prevent content from appearing above the header on mobile
import styles from '@/styles/layout.module.css';

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  return (
    <div className={styles.pageContainer}>
      <header className={`border-b border-border ${styles.headerFixed}`}>
        <Header title="אלבום מדבקות" />
      </header>
      <main className={styles.mainContent}>
        {children}
      </main>
      <footer className={`border-t border-border ${styles.footerFixed}`}>
        <Footer />
      </footer>
    </div>
  );
};

export default Layout;
