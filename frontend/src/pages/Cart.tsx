import type { CartApiTypes } from "@backend/controller/cart";
import CurrencyRupeeIcon from "@mui/icons-material/CurrencyRupee";
import DeleteIcon from "@mui/icons-material/Delete";
import { Button, Stack } from "@mui/material";
import Grid from "@mui/material/Unstable_Grid2/Grid2";
import { Box } from "@mui/system";
import { useEffect, useState } from "react";
import Product from "../components/Product";
import { useAuth } from "../hooks";
import { API } from "../services";
import { errorSnackbar, getErrorMessage, successSnackbar } from "../utils";

let num = 0;

export default function Cart() {
  const { account } = useAuth();
  const [cart, setCart] = useState<
    CartApiTypes["getCart"]["response"]["data"] | null
  >(null);

  useEffect(() => {
    const asyncFn = async () => {
      if (!account) return;
      try {
        const ret = await API.getAllProductsFromCart(account.token);
        setCart(ret.data.data);
      } catch (err) {
        errorSnackbar(getErrorMessage(err));
      }
    };
    asyncFn();
  }, [account]);

  // TODO: clear list when all items are removed
  // const removeOne = () => {};

  if (!cart) {
    return <div>Loading...</div>;
  }

  return (
    <Box m={4}>
      {num++}
      <Grid container rowSpacing={1} spacing={2} sx={{ m: 4 }}>
        <Grid container spacing={2}>
          {cart.items.map((val) => {
            if (!val || !val.product) return;
            return (
              <Grid key={val._id + ""}>
                <Product product={val.product} quantityInCart={val.quantity} />
              </Grid>
            );
          })}
        </Grid>
      </Grid>
      <Stack direction={"row"} spacing={2}>
        <Button
          variant="contained"
          onClick={async () => {
            try {
              await API.clearCart(account!.token);
              successSnackbar("Cart cleared");
              cart.items = [];
              setCart(cart);
            } catch (err) {
              errorSnackbar(getErrorMessage(err));
            }
          }}
          startIcon={<DeleteIcon />}
        >
          Clear cart
        </Button>
        <Button
          variant="contained"
          onClick={() => alert("Checked out")}
          startIcon={<CurrencyRupeeIcon />}
        >
          Checkout
        </Button>
      </Stack>
    </Box>
  );
}
