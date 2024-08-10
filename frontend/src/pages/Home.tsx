import type { ProductApiTypes } from "@backend/controller/product";
import Grid from "@mui/material/Unstable_Grid2/Grid2";
import { useEffect, useState } from "react";
import Product from "../components/Product";
import { API } from "../services";
import { errorSnackbar, getErrorMessage } from "../utils";

export default function Home() {
  const [products, setProducts] = useState<
    ProductApiTypes["getAll"]["response"]["data"]
  >([]);

  useEffect(() => {
    const asyncFn = async () => {
      try {
        const response = await API.getAllProducts();
        setProducts(response.data.data);
      } catch (error) {
        errorSnackbar(getErrorMessage(error));
      }
    };

    asyncFn();
  }, []);

  return (
    <Grid container rowSpacing={1} spacing={2} sx={{ m: 4 }}>
      <Grid container spacing={2}>
        {products.map((val) => (
          <Grid key={val._id}>
            <Product product={val} />
          </Grid>
        ))}
      </Grid>
    </Grid>
  );
}
