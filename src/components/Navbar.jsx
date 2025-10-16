/* eslint-disable jsx-a11y/anchor-is-valid */
import React, { useState, useEffect } from "react";
import Logo from "../assets/images/logo.png";
import { HiOutlineBars3 } from "react-icons/hi2";
import Box from "@mui/material/Box";
import Drawer from "@mui/material/Drawer";
import List from "@mui/material/List";
import Divider from "@mui/material/Divider";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import HomeIcon from "@mui/icons-material/Home";
import InfoIcon from "@mui/icons-material/Info";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import GroupsIcon from "@mui/icons-material/Groups";
import ContactsIcon from "@mui/icons-material/Contacts";
import Diversity3Icon from "@mui/icons-material/Diversity3";

const Navbar = () => {
  const [openMenu, setOpenMenu] = useState(false);
  const [isTop, setIsTop] = useState(true);

  const menuOptions = [
    { text: "Home", icon: <HomeIcon />, href: "#" },
    { text: "Features", icon: <InfoIcon />, href: "#features" },
    {
      text: "How It Works",
      icon: <HelpOutlineIcon />,
      href: "#how-it-works",
    },
    { text: "About Us", icon: <ContactsIcon />, href: "#about" },
    { text: "Our Team", icon: <GroupsIcon />, href: "#team" },
    { text: "Contact Us", icon: <Diversity3Icon />, href: "#contact" },
  ];

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      setIsTop(scrollY < 50);

      const sections = document.querySelectorAll("section[id]");
      const links = document.querySelectorAll(".nav-link");

      sections.forEach((section) => {
        const top = section.offsetTop - 100;
        const bottom = top + section.offsetHeight;
        const id = section.getAttribute("id");

        if (scrollY >= top && scrollY < bottom) {
          links.forEach((link) => {
            link.classList.remove("active");
            if (link.getAttribute("href") === `#${id}`) {
              link.classList.add("active");
            }
          });
        }
      });
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav className={`navbar ${isTop ? "transparent" : "solid"}`}>
      <div className="nav-logo-container">
        <img src={Logo} alt="logo" />
        <span className="brand-text">DialiEase</span>
      </div>
      <div className="navbar-links-container">
        {menuOptions.map((item) => (
          <a key={item.text} href={item.href} className="nav-link">
            {item.text}
          </a>
        ))}
        <button className="primary-button">Login</button>
      </div>
      <div className="navbar-menu-container">
        <HiOutlineBars3 onClick={() => setOpenMenu(true)} />
      </div>
      <Drawer open={openMenu} onClose={() => setOpenMenu(false)} anchor="right">
        <Box
          sx={{ width: 250 }}
          role="presentation"
          onClick={() => setOpenMenu(false)}
          onKeyDown={() => setOpenMenu(false)}
        >
          <List>
            {menuOptions.map((item) => (
              <ListItem key={item.text} disablePadding>
                <ListItemButton component="a" href={item.href}>
                  <ListItemIcon>{item.icon}</ListItemIcon>
                  <ListItemText primary={item.text} />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
          <Divider />
        </Box>
      </Drawer>
    </nav>
  );
};

export default Navbar;
