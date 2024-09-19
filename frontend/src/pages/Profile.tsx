import { Box, FormGroup, Stack, TextField, Typography } from "@mui/material";
import { useAuth } from "../hooks";

function PageTitle() {
  return (
    <>
      <Typography
        className="title"
        variant="h5"
        noWrap
        sx={{
          display: { xs: "none", md: "flex" },
          fontWeight: 700,
          color: "#2E2D2D",
          textDecoration: "none",
          marginBottom: 3,
          marginLeft: 3,
          marginRight: 3,
          textAlign: "center",
          paddingLeft: 3,
          maxWidth: 1200,
          borderBottom: "1px solid #ccc",
        }}
      >
        Profile Details
      </Typography>
    </>
  );
}

function EditMenu() {
  const { account } = useAuth();

  if (!account) return null;

  const userDetails = account.user;

  return (
    <>
      <Box
        sx={{
          padding: 2,
          border: "2px solid #ccc",
          width: 1000,
          backgroundColor: "#FDFBF6",
          // height : 1000
        }}
      >
        <form>
          <Stack spacing={2}>
            <FormGroup>
              <label htmlFor="email">Email</label>
              <TextField
                disabled
                size="small"
                id="email"
                type="email"
                value={userDetails.email}
                placeholder="Enter your email"
                variant="outlined"
              />
            </FormGroup>
            <FormGroup>
              <label htmlFor="username">Username</label>
              <TextField
                disabled
                size="small"
                type="text"
                id="username"
                value={userDetails.name}
                placeholder="Enter your username"
              />
            </FormGroup>
            <FormGroup>
              <label htmlFor="mobileNumber">Mobile number</label>
              <TextField
                disabled
                size="small"
                type="number"
                id="mobileNumber"
                value={userDetails.mobileNumber}
                placeholder="Enter your mobile number"
              />
            </FormGroup>
          </Stack>
        </form>
        {/* </CardContent>
      </Card> */}
      </Box>
    </>
  );
}

function Profile() {
  return (
    <Box
      sx={{
        alignItems: "center",
        margin: 10,
      }}
    >
      <div
        style={{
          // marginTop: 100,
          // marginLeft : 50,
          // marginRight : 50,
          padding: 3,
          alignItems: "center",
        }}
      >
        <PageTitle />
      </div>

      <Box
        sx={{
          display: "flex",

          // alignItems: "center",
          // padding : 3,
          // marginTop : 10,
        }}
      >
        <EditMenu />
      </Box>
    </Box>
  );
}

export default Profile;
