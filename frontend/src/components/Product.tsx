import type { ProductApiTypes } from "@backend/controller/product";
import { UserRole } from "@backend/types";
import AddIcon from "@mui/icons-material/Add";
import AddShoppingCartIcon from "@mui/icons-material/AddShoppingCart";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import RemoveIcon from "@mui/icons-material/Remove";
import {
  Box,
  Card,
  CardActionArea,
  CardActions,
  CardContent,
  CardMedia,
  IconButton,
  Stack,
  Typography,
} from "@mui/material";
import { useState } from "react";
import { useAuth } from "../hooks";
import { API } from "../services";
import { errorSnackbar, getErrorMessage, successSnackbar } from "../utils";
import LinkHref from "./LinkHref";

interface ProductProps {
  product: ProductApiTypes["getOne"]["response"]["data"];
  quantityInCart: number;
  editable?: boolean;
  delete?: () => void; // used by seller
}

export default function Product(props: ProductProps) {
  const [quantity, setQuantity] = useState(props.quantityInCart);
  const { product } = props;
  const [isEditing, setIsEditing] = useState(quantity > 0);
  const { account, isLoggedIn } = useAuth();
  const handleQuantityChange = (change: number) => {
    setQuantity((prev) => {
      if (prev + change <= 0) {
        setIsEditing(false);
        return 0;
      }
      return prev + change;
    });
  };

  return (
    <Card sx={{ minWidth: 250, maxWidth: 250 }}>
      <CardActionArea href={`/product/${product._id}`} LinkComponent={LinkHref}>
        <CardMedia
          sx={{ height: 150 }}
          image={product.imageUrl}
          title={product.name}
        />
        <CardContent>
          {/* MARK: product name */}
          <Typography gutterBottom variant="h6" component="div">
            {product.name}
          </Typography>
          <Box display={"flex"} flexDirection={"column"}>
            <Stack direction={"row"} spacing={0} alignItems={"baseline"}>
              <Typography variant="h6" component={"span"}>
                {/* MARK: price */}
                {new Intl.NumberFormat("en-IN", {
                  style: "currency",
                  currency: "INR",
                  maximumFractionDigits: 0,
                }).format(product.price)}
              </Typography>
              <Typography>/{product.units}</Typography>
            </Stack>
            <Typography
              // variant="body2"
              // component={"span"}
              // color="text.secondary"
              // sx = {{
              //   mt : 1,
              //   whiteSpace : "nowrap",
              //   overflow : "hidden",
              //   textOverflow: "ellipsis"
              // }}
              variant="body2"
              component={"span"}
              color="text.secondary"
              sx={{
                mt: 1,
                display: "-webkit-box",
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
                textOverflow: "ellipsis",
                WebkitLineClamp: 3, // Adjust this number to the number of lines you want to display
                // lineClamp: 3, // This property might not be necessary for all browsers
                // You can add more styling as needed
              }}
            >
              {product.description}
            </Typography>
          </Box>
        </CardContent>
      </CardActionArea>
      <CardActions>
        {/* Add to cart button */}
        <Box>
          {isLoggedIn &&
            account?.user.role === UserRole.buyer &&
            (isEditing ? (
              <Box mb={1} display="flex" alignItems="center">
                {/* removing product to cart */}
                <IconButton
                  sx={{ color: "#64b367cd" }}
                  // onClick={() => handleQuantityChange(-1)}
                  onClick={async () => {
                    handleQuantityChange(-1);
                    let errorMessage = "";
                    try {
                      // send request
                      await API.removeOneProductFromCart(
                        product!._id,
                        account!.token,
                      );
                      successSnackbar("Product removed from cart");
                      return;
                    } catch (error) {
                      errorMessage = getErrorMessage(error);
                    }
                    errorSnackbar(errorMessage);
                  }}
                >
                  <RemoveIcon />
                </IconButton>
                <Typography sx={{ mx: 2 }}>{quantity}</Typography>
                {/* adding product to cart */}
                <IconButton
                  sx={{ color: "#64b367cd" }}
                  // onClick={() => handleQuantityChange(1)}
                  onClick={async () => {
                    handleQuantityChange(1);
                    let errorMessage = "";
                    try {
                      await API.addOneProductToCart(
                        // TODO: quantity
                        { product: product!._id, quantity: 1 },
                        account!.token,
                      );
                      successSnackbar("Product added to cart");
                      return;
                    } catch (error) {
                      errorMessage = getErrorMessage(error);
                    }
                    errorSnackbar(errorMessage);
                  }}
                >
                  <AddIcon />
                </IconButton>
              </Box>
            ) : (
              <IconButton
                // variant="contained"
                color="success"
                // sx={{ mb: 1 }}
                // onClick={() => handleAddToCartClick()}
                onClick={async () => {
                  setIsEditing(true);
                  handleQuantityChange(1);
                  let errorMessage = "";
                  try {
                    await API.addOneProductToCart(
                      // TODO: quantity
                      {
                        product: product!._id,
                        quantity: quantity === 0 ? 1 : quantity,
                      },
                      account!.token,
                    );
                    successSnackbar("Product added to cart");
                    return;
                  } catch (error) {
                    errorMessage = getErrorMessage(error);
                  }
                  errorSnackbar(errorMessage);
                }}
              >
                <AddShoppingCartIcon />
              </IconButton>
            ))}
        </Box>

        {/* Until here */}

        {props.editable && (
          <>
            <IconButton
              sx={{ color: "black" }}
              href={`/product/edit/${product._id}`}
              LinkComponent={LinkHref}
            >
              <EditIcon />
            </IconButton>
            <IconButton sx={{ color: "black" }} onClick={props.delete}>
              <DeleteIcon />
            </IconButton>
          </>
        )}
      </CardActions>
    </Card>
  );
}
