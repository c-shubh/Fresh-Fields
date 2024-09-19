import type { ProductApiTypes } from "@backend/controller/product";
import { UserRole } from "@backend/types";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import {
  Box,
  Button,
  Container,
  FormControl,
  Grid,
  InputAdornment,
  InputLabel,
  OutlinedInput,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../hooks";
import { API } from "../services";
import {
  errorSnackbar,
  getErrorMessage,
  ProductMode,
  successSnackbar,
} from "../utils";

interface ProductProps {
  mode: ProductMode;
}

/**
 * Used for the following:
 * 1. Display existing product details
 * 2. Edit existing product
 * 3. Create new product
 */
export default function ProductPage(props: ProductProps) {
  const navigate = useNavigate();
  const { account, isLoggedIn } = useAuth();
  const params = useParams<{ productId?: string }>();
  // stores current product
  const [product, setProduct] = useState<
    ProductApiTypes["getOne"]["response"]["data"] | null
  >(null);
  // form for new/edit product
  type FormValuesT = Omit<NonNullable<typeof product>, "_id"> & {
    _id?: string;
  };
  const { register, reset, handleSubmit } = useForm<FormValuesT>({
    defaultValues: useMemo(() => {
      if (product) return product;
      return {};
    }, [product]),
  });

  const isViewMode = props.mode === ProductMode.VIEW;
  const isNewMode = props.mode === ProductMode.NEW;
  const isEditMode = props.mode === ProductMode.EDIT;

  // fetch current product details if in view/edit mode
  useEffect(() => {
    const asyncFn = async (productId: string) => {
      try {
        const ret = await API.getOneProduct(productId);
        setProduct(ret.data.data);
        reset(ret.data.data);
      } catch (err) {
        errorSnackbar(getErrorMessage(err));
      }
    };

    if ((isViewMode || isEditMode) && params.productId) {
      asyncFn(params.productId);
    }
  }, [isEditMode, isViewMode, params.productId, reset]);

  const onSubmit = async (data: FormValuesT) => {
    let errorMessage;
    if (isNewMode) {
      try {
        // send request
        await API.createProduct(data, account!.token);
        // show snackbar
        successSnackbar("Product created successfully");
        navigate("/seller/dashboard");
        return;
      } catch (error) {
        errorMessage = getErrorMessage(error);
      }
      errorSnackbar(errorMessage);
    } else if (isEditMode && data._id) {
      try {
        // send request
        await API.updateOneProduct(data._id, data, account!.token);
        // show snackbar
        successSnackbar("Product edited successfully");
        return;
      } catch (error) {
        errorMessage = getErrorMessage(error);
      }
      errorSnackbar(errorMessage);
    }
  };

  // if in view/edit mode and product hasn't loaded, show loading
  if ((isViewMode || isEditMode) && !product) {
    return <div>Loading...</div>;
  }

  return (
    <Container
      sx={{ py: 8 }}
      component={"form"}
      onSubmit={handleSubmit(onSubmit)}
    >
      <Grid container spacing={4}>
        <Grid item xs={12} md={6}>
          {product ? (
            <img
              src={product.imageUrl}
              alt={product.name}
              style={{ width: "100%", borderRadius: "10px" }}
            />
          ) : (
            <TextField
              fullWidth
              type="url"
              label="Image URL"
              required
              {...register("imageUrl")}
            />
          )}
        </Grid>
        <Grid item xs={12} md={6}>
          <Stack spacing={3}>
            <Typography variant="overline" display="block" gutterBottom>
              Product Details
            </Typography>
            {/* MARK: Name */}
            {isViewMode && product ? (
              <Typography variant="h4" gutterBottom>
                {product.name}
              </Typography>
            ) : (
              <TextField label="Product name" required {...register("name")} />
            )}
            {/* MARK: description */}
            {isViewMode && product ? (
              <Typography variant="body1" color="textSecondary" paragraph>
                {product.description}
              </Typography>
            ) : (
              <TextField
                multiline
                rows={5}
                label="Product Description"
                required
                {...register("description")}
              />
            )}

            {/* MARK: price */}
            {isViewMode && product ? (
              <Stack direction={"row"} spacing={0} alignItems={"baseline"}>
                <Typography variant="h5" gutterBottom>
                  {new Intl.NumberFormat("en-IN", {
                    style: "currency",
                    currency: "INR",
                    maximumFractionDigits: 0,
                  }).format(product.price)}
                </Typography>
                <Typography>/{product.units}</Typography>
              </Stack>
            ) : (
              <FormControl fullWidth sx={{ m: 1 }}>
                <InputLabel htmlFor="outlined-adornment-amount">
                  Amount
                </InputLabel>
                <OutlinedInput
                  id="outlined-adornment-amount"
                  startAdornment={
                    <InputAdornment position="start">₹</InputAdornment>
                  }
                  label="Amount"
                  required
                  {...register("price")}
                />
              </FormControl>
            )}
            {/* MARK: Quantity */}
            <Box display="flex" alignItems="center" mt={2}>
              {isViewMode && product ? (
                <Typography>
                  Quantity available: {product.quantity} {product.units}
                </Typography>
              ) : (
                // <Paper
                //   variant="outlined"
                //   sx={{ display: "flex", alignItems: "center" }}
                // >
                //   <IconButton onClick={decreaseQuantity}>
                //     <RemoveIcon />
                //   </IconButton>
                //   <InputBase
                //     value={quantity}
                //     readOnly
                //     inputProps={{
                //       style: {
                //         textAlign: "center",
                //       },
                //     }}
                //     sx={{ width: 50 }}
                //   />
                //   <IconButton onClick={increaseQuantity}>
                //     <AddIcon />
                //   </IconButton>
                // </Paper>
                <Stack direction={"row"} spacing={4}>
                  <TextField
                    label="Quantity"
                    type="number"
                    required
                    {...register("quantity")}
                  />
                  <TextField
                    label="Units"
                    type="text"
                    inputProps={{
                      list: "units",
                    }}
                    required
                    {...register("units")}
                  />
                  <datalist id="units">
                    <option value="kg" />
                    <option value="g" />
                  </datalist>
                </Stack>
              )}
            </Box>
            {isEditMode || isNewMode ? (
              <Button
                variant="contained"
                color="primary"
                size="large"
                sx={{ ml: 2 }}
                startIcon={<AddIcon />}
                type="submit"
              >
                Save details
              </Button>
            ) : isLoggedIn && account?.user.role === UserRole.buyer ? (
              <Stack direction={"row"}>
                <Button
                  variant="contained"
                  color="primary"
                  size="large"
                  sx={{ ml: 2 }}
                  startIcon={<AddIcon />}
                  onClick={async () => {
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
                  Add To Cart
                </Button>
                <Button
                  variant="contained"
                  color="primary"
                  size="large"
                  sx={{ ml: 2 }}
                  startIcon={<RemoveIcon />}
                  onClick={async () => {
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
                  Remove from cart
                </Button>
              </Stack>
            ) : null}
          </Stack>
        </Grid>
      </Grid>
    </Container>
  );
}
