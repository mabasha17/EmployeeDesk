import React from "react"; // eslint-disable-line no-unused-vars
import { Navbar as BootstrapNavbar, Container } from "react-bootstrap";

const Navbar = () => {
  return (
    <BootstrapNavbar bg="dark" variant="dark" expand="lg">
      <Container>
        <BootstrapNavbar.Brand href="/">
          Employee Management System
        </BootstrapNavbar.Brand>
      </Container>
    </BootstrapNavbar>
  );
};

export default Navbar;
