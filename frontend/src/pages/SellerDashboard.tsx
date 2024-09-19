import type { ProductApiTypes } from "@backend/controller/product";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Stack,
} from "@mui/material";
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
  const [productToDelete, setProductToDelete] = useState<string | null>(null); // For managing which product to delete
  const [openDialog, setOpenDialog] = useState(false); // To manage dialog open state

  const deleteProduct = async (id: string, token: string) => {
    try {
      await API.deleteOneProduct(id, token);
      successSnackbar("Product deleted");
      setProducts(products.filter((product) => product._id !== id));
      handleCloseDialog();
    } catch (err) {
      errorSnackbar(getErrorMessage(err));
    }
  };

  const handleOpenDialog = (id: string) => {
    setProductToDelete(id);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setProductToDelete(null);
  };

  const confirmDelete = () => {
    if (productToDelete && account) {
      deleteProduct(productToDelete, account.token);
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
              delete={() => handleOpenDialog(val._id)} // Open dialog instead of immediate delete
              editable
              quantityInCart={0}
            />
          </Grid>
        ))}
      </Grid>

      {/* Confirmation Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this product? This action cannot be
            undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} color="primary">
            Cancel
          </Button>
          <Button onClick={confirmDelete} color="secondary" autoFocus>
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
}
