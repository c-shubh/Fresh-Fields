import { UserRole } from "@backend/types";
import { Logout } from "@mui/icons-material";
import DashboardIcon from "@mui/icons-material/Dashboard";
import PlaceIcon from "@mui/icons-material/Place";
import SearchIcon from "@mui/icons-material/Search";
import Settings from "@mui/icons-material/Settings";
import ShoppingCartOutlinedIcon from "@mui/icons-material/ShoppingCartOutlined";
import { Button, Stack } from "@mui/material";
import AppBar from "@mui/material/AppBar";
import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import InputBase from "@mui/material/InputBase";
import ListItemIcon from "@mui/material/ListItemIcon";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import { styled } from "@mui/material/styles";
import * as React from "react";
import { Link, useNavigate } from "react-router-dom";
import Logo1 from "../assets/images/Logo1.png";
import "../component.css/HeaderStyle.css";
import { zIndex } from "../constants";
import { useAuth } from "../hooks";
import HStack from "./HStack";
import LinkHref from "./LinkHref";

const Search = styled(Box)(({ theme }) => ({
  position: "relative",
  flex: 1,
  borderRadius: theme.shape.borderRadius,
  backgroundColor: "white", // White background
  "&:hover": {
    backgroundColor: "#FEFDF7", // Lighter white on hover
  },
  width: "100%",
}));

const SearchIconWrapper = styled("div")(({ theme }) => ({
  padding: theme.spacing(0, 2),
  height: "100%",
  position: "absolute",
  color: "#333333",
  pointerEvents: "none",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
}));

const StyledInputBase = styled(InputBase)(({ theme }) => ({
  width: "100%",
  color: "inherit",
  "& .MuiInputBase-input": {
    color: "black",
    flex: 1,
    padding: theme.spacing(1, 1, 1, 0),
    // vertical padding + font size from searchIcon
    paddingLeft: `calc(1em + ${theme.spacing(4)})`,
    transition: theme.transitions.create("width"),
    "&::placeholder": {
      color: "black",
    },
  },
}));

function PrimarySearchAppBar() {
  const [query, setQuery] = React.useState("");

  const navigate = useNavigate();
  return (
    <Search
      component="form"
      onSubmit={(e) => {
        e.preventDefault();
        navigate("/search", { state: { q: query.trim() } });
      }}
    >
      <SearchIconWrapper>
        <SearchIcon />
      </SearchIconWrapper>
      <StyledInputBase
        placeholder="Search…"
        value={query}
        onChange={(v) => setQuery(v.target.value)}
      />
    </Search>
  );
}

function Logo() {
  return (
    <Box
      sx={{ display: "flex", alignItems: "center", textDecoration: "none" }}
      to={"/"}
      component={Link}
    >
      <Box
        component="img"
        sx={{
          height: 30,
          width: 30,
          mr: 1,
        }}
        alt="Logo"
        src={Logo1}
      />
      <Typography
        className="title"
        variant="h6"
        noWrap
        sx={{
          display: { xs: "none", md: "flex" },
          fontFamily: "cursive",
          fontWeight: 700,
          color: "#2E2D2D",
          textDecoration: "none",
        }}
      >
        Fresh Fields
      </Typography>
    </Box>
  );
}

function Location() {
  return (
    <Stack direction={"row"} spacing={1}>
      <PlaceIcon sx={{ color: "#2E2D2D" }} />
      <Typography
        variant="body1"
        sx={{
          display: { xs: "none", md: "flex" },
          color: "black",
          fontWeight: "medium",
          fontSize: "1 rem",
        }}
      >
        Hyderabad
      </Typography>
    </Stack>
  );
}

function Cart() {
  return (
    <IconButton href={"/cart"} LinkComponent={LinkHref}>
      <ShoppingCartOutlinedIcon
        sx={{
          fontSize: 30,
          color: "#2E2D2D",
        }}
      />
    </IconButton>
  );
}

interface ProfileProps {
  handleClick: (event: React.MouseEvent<HTMLElement>) => void;
  open: boolean;
  anchorEl: HTMLElement | null;
  handleClose: () => void;
  logout: () => void;
  role: UserRole;
}

function Profile({
  handleClick,
  open,
  anchorEl,
  handleClose,
  logout,
  role,
}: ProfileProps): React.ReactNode {
  const navigate = useNavigate();

  return (
    <>
      <Box sx={{ display: "flex", alignItems: "center", textAlign: "center" }}>
        <IconButton onClick={handleClick} size="small">
          <Avatar sx={{ width: 32, height: 32 }} />
        </IconButton>
      </Box>
      <Menu
        anchorEl={anchorEl}
        id="account-menu"
        open={open}
        onClose={handleClose}
        onClick={handleClose}
        PaperProps={{
          elevation: 0,
          sx: {
            overflow: "visible",
            filter: "drop-shadow(0px 2px 8px rgba(0,0,0,0.32))",
            mt: 1.5,
            "& .MuiAvatar-root": {
              width: 32,
              height: 32,
              ml: -0.5,
              mr: 1,
            },
            "&::before": {
              content: '""',
              display: "block",
              position: "absolute",
              top: 0,
              right: 14,
              width: 10,
              height: 10,
              bgcolor: "background.paper",
              transform: "translateY(-50%) rotate(45deg)",
              zIndex: 0,
            },
          },
        }}
        transformOrigin={{ horizontal: "right", vertical: "top" }}
        anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
      >
        {role === UserRole.seller && (
          <MenuItem
            onClick={() => {
              handleClose();
              navigate("/seller/dashboard");
            }}
          >
            <ListItemIcon>
              <DashboardIcon fontSize="small" />
            </ListItemIcon>
            Dashboard
          </MenuItem>
        )}
        <MenuItem
          onClick={() => {
            handleClose();
            navigate("/profile");
          }}
        >
          <ListItemIcon>
            <Settings fontSize="small" />
          </ListItemIcon>
          Settings
        </MenuItem>
        <MenuItem
          onClick={async () => {
            logout();
            handleClose();
            navigate("/");
          }}
        >
          <ListItemIcon>
            <Logout fontSize="small" />
          </ListItemIcon>
          Logout
        </MenuItem>
      </Menu>
    </>
  );
}

function LoginSignupButtons() {
  const navigate = useNavigate();
  return (
    <Box
      sx={{
        display: "flex",
        gap: 2,
      }}
    >
      <Button
        variant="text"
        onClick={() => {
          navigate("/login");
        }}
        sx={{
          color: "white",
          backgroundColor: "#4F9452",
          "&:hover": {
            backgroundColor: "#3f7641",
          },
        }}
      >
        Log In
      </Button>

      <Button
        variant="contained"
        onClick={() => {
          navigate("/signup");
        }}
        color="success"
      >
        Sign Up
      </Button>
    </Box>
  );
}

function Navbar() {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const { isLoggedIn, logout, account } = useAuth();
  const open = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <AppBar
      position="static"
      sx={(theme) => ({
        backgroundColor: "#64b367cd",
        // center navbar
        [theme.breakpoints.up("xl")]: {
          alignItems: "center",
          "& > div": {
            width: "100%",
          },
        },
        zIndex: zIndex.AppBar,
      })}
    >
      <Box maxWidth="xl">
        <Toolbar disableGutters component={HStack} spacing={3} mx={3}>
          <Logo />
          <Location />
          <PrimarySearchAppBar />
          {isLoggedIn ? (
            <>
              {account?.user.role === UserRole.buyer && <Cart />}
              <Profile
                role={
                  (account ? account.user.role : UserRole.buyer) as UserRole
                }
                {...{ handleClick, open, anchorEl, handleClose, logout }}
              />
            </>
          ) : (
            <LoginSignupButtons />
          )}
        </Toolbar>
      </Box>
    </AppBar>
  );
}

export default Navbar;
