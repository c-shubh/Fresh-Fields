import type { ProductApiTypes } from "@backend/controller/product";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import RemoveIcon from "@mui/icons-material/Remove";
import { UserRole } from "@backend/types";

import {
  Badge,
  Box,
  Button,
  Card,
  CardActionArea,
  CardActions,
  CardContent,
  CardMedia,
  IconButton,
  // Input,
  // Stack,
  Typography,
} from "@mui/material";
import { useState } from "react";
import LinkHref from "./LinkHref";
import { useAuth } from "../hooks";
import { API } from "../services";
import { successSnackbar, getErrorMessage, errorSnackbar } from "../utils";

interface ProductProps {
  product: ProductApiTypes["getOne"]["response"]["data"];
  editable?: boolean;
  count?: number;
  delete?: () => void;
}

export default function Product(props: ProductProps) {
  const [quantity, setQuantity] = useState(1);
  const { product } = props;
  // const incrementQuantity = () => setQuantity(quantity + 1);
  // const decrementQuantity = () => setQuantity(Math.max(0, quantity - 1));

  const [isEditing, setIsEditing] = useState(false);
  const { account, isLoggedIn } = useAuth();

  // const handleAddToCartClick = () => {
  //   setIsEditing(true);
  // };

  const handleQuantityChange = (change: number) => {
    // quantity = quantity + change

    setQuantity((prev) => {
      const newQ = Math.max(0, prev + change);
      if (newQ == 0) {
        setIsEditing(false);
        return 1;
      }
      return newQ;
    }); // Ensure quantity is at least 1
  };

  return (
    <Badge badgeContent={props.count} color="primary">
      <Card sx={{ minWidth: 345, maxWidth: 345 }}>
        <CardActionArea
          href={`/product/${product._id}`}
          LinkComponent={LinkHref}
        >
          <CardMedia
            sx={{ height: 150 }}
            image={product.imageUrl}
            title={product.productName}
          />
          <CardContent>
            <Typography gutterBottom variant="h6" component="div">
              {product.productName}
            </Typography>
            <Box display={"flex"} flexDirection={"column"}>
              <Typography variant="h6" component={"span"}>
                {new Intl.NumberFormat("en-IN", {
                  style: "currency",
                  currency: "INR",
                  maximumFractionDigits: 0,
                }).format(product.price)}
              </Typography>{" "}
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
          <Box alignItems="center">
            {isLoggedIn &&
              account?.user.role === UserRole.user &&
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
                          { productId: product!._id },
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
                <Button
                  variant="contained"
                  color="success"
                  sx={{ mb: 1 }}
                  // onClick={() => handleAddToCartClick()}
                  onClick={async () => {
                    setIsEditing(true);
                    let errorMessage = "";
                    try {
                      await API.addOneProductToCart(
                        { productId: product!._id },
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
                  <Typography variant="body1" component="span">
                    Add to Cart
                  </Typography>
                </Button>
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
    </Badge>
  );
}
