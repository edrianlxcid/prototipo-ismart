import Navbar from './Navbar';
import Footer from './Footer';
import './Layout.css';

function Layout({ children, user }) {
  return (
    <div className="layout-wrapper">
      <Navbar user={user} />
      <main className="layout-main">
        {children}
      </main>
      <Footer />
    </div>
  );
}

export default Layout;
