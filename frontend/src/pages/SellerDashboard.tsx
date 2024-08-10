import type { ProductApiTypes } from "@backend/controller/product";
import { Box, Button, Stack } from "@mui/material";
import Grid from "@mui/material/Unstable_Grid2/Grid2";
import { useEffect, useState } from "react";
import LinkHref from "../components/LinkHref";
import Product from "../components/Product";
import { useAuth } from "../hooks";
import { API } from "../services";
import { errorSnackbar, getErrorMessage, successSnackbar } from "../utils";

export default function SellerDashboard() {
  const { account } = useAuth();
  const [products, setProducts] = useState<
    ProductApiTypes["getAll"]["response"]["data"]
  >([]);

  const deleteProduct = (id: string, token: string) => async () => {
    try {
      await API.deleteOneProduct(id, token);
      successSnackbar("Product deleted");
      setProducts(products.filter((product) => product._id !== id));
    } catch (err) {
      errorSnackbar(getErrorMessage(err));
    }
  };

  useEffect(() => {
    const asyncFn = async () => {
      try {
        const ret = await API.getAllProducts();
        setProducts(ret.data.data);
      } catch (err) {
        errorSnackbar(getErrorMessage(err));
      }
    };

    asyncFn();
  }, [account]);

  if (!account) {
    return <div>Loading...</div>;
  }

  return (
    <Stack spacing={2} m={4}>
      <Box>
        <Button
          variant="contained"
          href="/product/new"
          LinkComponent={LinkHref}
        >
          New Product
        </Button>
      </Box>
      <Grid container spacing={2}>
        {products.map((val) => (
          <Grid key={val._id}>
            <Product
              product={val}
              delete={deleteProduct(val._id, account.token)}
              editable
            />
          </Grid>
        ))}
      </Grid>
    </Stack>
  );
}
