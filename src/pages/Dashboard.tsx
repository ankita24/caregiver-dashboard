// pages/Dashboard.tsx
import {
  Button,
  Container,
  Typography,
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
} from "@mui/material";
import { signOut } from "firebase/auth";
import { auth } from "../firebase.js";
import ParentList from "../components/PersonList.js";
import AddParentForm from "../components/AddPersonForm.js";
import { useState } from "react";
import { getParents } from "../services/firestore.js";
import { useAuth } from "../hooks/useAuth.js";

export default function Dashboard() {
  const [open, setOpen] = useState(false);

  const handleLogout = () => signOut(auth);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);
  const { currentUser } = useAuth();
  

  return (
    <Container maxWidth="md">
      <Box
        sx={{ mt: 6, mb: 4, display: "flex", justifyContent: "space-between" }}
      >
        <Typography variant="h4">Dashboard</Typography>
        <Button variant="outlined" color="secondary" onClick={handleLogout}>
          Logout
        </Button>
      </Box>

      <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 2 }}>
        <Button variant="contained" onClick={handleOpen}>
          + Add Parent
        </Button>
      </Box>

      <ParentList />

      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>Add New Parent</DialogTitle>
        <DialogContent>
          <AddParentForm
            onClose={() => setOpen(false)}
            onSuccess={() => getParents(currentUser?.uid ?? '')}
          />
        </DialogContent>
      </Dialog>
    </Container>
  );
}
