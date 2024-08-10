import type { ProductApiTypes } from "@backend/controller/product";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import RemoveIcon from "@mui/icons-material/Remove";
import {
  Badge,
  Box,
  Card,
  CardActionArea,
  CardActions,
  CardContent,
  CardMedia,
  IconButton,
  Input,
  Stack,
  Typography,
} from "@mui/material";
import { useState } from "react";
import LinkHref from "./LinkHref";

interface ProductProps {
  product: ProductApiTypes["getOne"]["response"]["data"];
  editable?: boolean;
  count?: number;
  delete?: () => void;
}

export default function Product(props: ProductProps) {
  const [quantity, setQuantity] = useState(0);
  const { product } = props;
  const incrementQuantity = () => setQuantity(quantity + 1);
  const decrementQuantity = () => setQuantity(Math.max(0, quantity - 1));

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
            <Box>
              <Typography variant="h6" component={"span"}>
                {new Intl.NumberFormat("en-IN", {
                  style: "currency",
                  currency: "INR",
                  maximumFractionDigits: 0,
                }).format(product.price)}
              </Typography>{" "}
              <Typography
                variant="body2"
                component={"span"}
                color="text.secondary"
              >
                {product.description}
              </Typography>
            </Box>
          </CardContent>
        </CardActionArea>
        <CardActions>
          {/* <IconButton sx={{ color: "black" }}>
            <AddShoppingCartIcon />
          </IconButton>
          <IconButton sx={{ color: "black" }}>
            <RemoveShoppingCartOutlinedIcon />
          </IconButton> */}
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
