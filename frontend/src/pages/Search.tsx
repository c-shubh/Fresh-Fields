import type { ProductApiTypes } from "@backend/controller/product";
import {
  Box,
  Divider,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Drawer as MuiDrawer,
  styled,
} from "@mui/material";
import Grid from "@mui/material/Unstable_Grid2/Grid2";
import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import Product from "../components/Product";
import { zIndex } from "../constants";
import { API } from "../services";
import { errorSnackbar, getErrorMessage } from "../utils";

const drawerWidth = 240;

const Main = styled("main")(({ theme }) => ({
  flexGrow: 1,
  padding: theme.spacing(3),
  ...(true && {
    transition: theme.transitions.create("margin", {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.enteringScreen,
    }),
    marginLeft: 0,
  }),
}));

const Drawer = styled(MuiDrawer)({
  position: "relative", //imp
  width: drawerWidth, //drawer width
  "& .MuiDrawer-paper": {
    width: drawerWidth, //drawer width
    position: "absolute", //imp
    transition: "none !important",
  },
});

export default function PersistentDrawerLeft() {
  const { state } = useLocation();
  const [products, setProducts] = useState<
    ProductApiTypes["search"]["response"]["data"]
  >([]);

  useEffect(() => {
    const asyncFn = async () => {
      let errorMessage = "";
      try {
        // send request
        const response = await API.search({ q: state.q || "" });
        setProducts(response.data.data);
        return;
      } catch (error) {
        errorMessage = getErrorMessage(error);
      }
      errorSnackbar(errorMessage);
    };

    asyncFn();
  }, [state]);

  return (
    <Box sx={{ display: "flex", height: "100%" }}>
      <Drawer
        variant="permanent"
        anchor="left"
        sx={{ zIndex: zIndex.SearchPageDrawer }}
      >
        <List>
          {[].map((text) => (
            <ListItem key={text} disablePadding>
              <ListItemButton>
                {/* <ListItemIcon>
                  {index % 2 === 0 ? <InboxIcon /> : <MailIcon />}
                </ListItemIcon> */}
                <ListItemText primary={text} />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
        <Divider />
      </Drawer>
      <Main>
        <Grid container spacing={2}>
          {products.map((val) => (
            <Grid key={val._id}>
              <Product product={val} />
            </Grid>
          ))}
        </Grid>
      </Main>
    </Box>
  );
}
