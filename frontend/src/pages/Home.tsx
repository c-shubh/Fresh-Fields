import type { ProductApiTypes } from "@backend/controller/product";
import Grid from "@mui/material/Unstable_Grid2/Grid2";
import { useEffect, useState } from "react";
import Product from "../components/Product";
import { API } from "../services";
import { errorSnackbar, getErrorMessage } from "../utils";
import { CartApiTypes } from "@backend/controller/cart";
import { useAuth } from "../hooks";
import { UserRole } from "@backend/types";

export default function Home() {
  const { account, isLoggedIn } = useAuth();
  const [products, setProducts] = useState<
    ProductApiTypes["getAll"]["response"]["data"]
  >([]);
  // cart only comes into play when user is a buyer
  const [cart, setCart] = useState<
    CartApiTypes["getCart"]["response"]["data"] | null
  >(null);

  useEffect(() => {
    const asyncFn = async () => {
      try {
        const responses = await Promise.all(
          isLoggedIn && account?.user.role === UserRole.buyer
            ? [API.getAllProducts(), API.getAllProductsFromCart(account!.token)]
            : [API.getAllProducts()], // just show all products to non logged in ppl and sellers
        );
        if (responses.length == 2) {
          setCart(responses[1].data.data);
        }
        setProducts(responses[0].data.data);
      } catch (error) {
        errorSnackbar(getErrorMessage(error));
      }
    };

    asyncFn();
  }, [account, isLoggedIn]);

  if (account && account.user.role === UserRole.buyer && !cart) {
    return <div>Loading...</div>;
  }

  console.log(cart);
  return (
    <Grid
      container
      rowSpacing={1}
      spacing={2}
      sx={{ m: 4 }}
      justifyContent={"center"}
    >
      {products.map((val) => (
        <Grid key={val._id}>
          <Product
            product={val}
            quantityInCart={
              cart?.items.find((ele) => ele.product._id === val._id)
                ?.quantity || 0
            }
          />
        </Grid>
      ))}
    </Grid>
  );
}
