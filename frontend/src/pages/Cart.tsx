import type { CartApiTypes } from "@backend/controller/cart";
import { Button } from "@mui/material";
import Grid from "@mui/material/Unstable_Grid2/Grid2";
import { Box } from "@mui/system";
import { useEffect, useState } from "react";
import Product from "../components/Product";
import { useAuth } from "../hooks";
import { API } from "../services";
import { errorSnackbar, getErrorMessage } from "../utils";

export default function Cart() {
  const { account } = useAuth();
  const [products, setProducts] = useState<
    CartApiTypes["getAllProducts"]["response"]["data"]
  >([]);

  useEffect(() => {
    const asyncFn = async () => {
      if (!account) return;
      try {
        const ret = await API.getAllProductsFromCart(account.token);
        setProducts(ret.data.data);
      } catch (err) {
        errorSnackbar(getErrorMessage(err));
      }
    };
    asyncFn();
  }, [account]);

  return (
    <Box m={4}>
      <Grid container rowSpacing={1} spacing={2} sx={{ m: 4 }}>
        <Grid container spacing={2}>
          {products.map((val) => {
            if (!val || !val.product) return;
            return (
              <Grid key={val._id + ""}>
                <Product product={val.product} count={val.count} />
              </Grid>
            );
          })}
        </Grid>
      </Grid>
      <Button variant="contained" onClick={() => alert("Checked out")}>
        Checkout
      </Button>
    </Box>
  );
}
