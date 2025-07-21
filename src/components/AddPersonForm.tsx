// components/AddParentForm.tsx
import {
  Button,
  TextField,
  MenuItem,
  Typography,
  Paper,
  Box,
} from "@mui/material";
import { useState } from "react";
import { useAuth } from "../hooks/useAuth.js";
import { addParent, updatePerson } from "../services/firestore.js";
interface Person {
  id: string;
  name: string;
  phone: string;
  relation: string;
  timezone: string;
}

export default function AddPersonForm({
  person,
  onSuccess,
  onClose,
}: {
  person?: Person | undefined;
  onSuccess: () => void;
  onClose: () => void;
}) {
  const { currentUser } = useAuth();
  const [name, setName] = useState(person?.name ?? "");
  const [phone, setPhone] = useState(person?.phone ?? "");
  const [relation, setRelation] = useState(person?.relation ?? "");
  const [timezone, setTimezone] = useState(person?.timezone ?? "Asia/Kolkata");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    setLoading(true);
    try {
      if (person?.id)
        await updatePerson(currentUser.uid, person.id, {
          name,
          phone,
          relation,
          timezone,
        });
      else
        await addParent({
          caregiverUID: currentUser.uid,
          name,
          phone,
          relation,
          timezone,
        });
      setName("");
      setPhone("");
      setTimezone("Asia/Kolkata");
      onSuccess();
      onClose();
      alert(`Person ${person?.id ? "saved" : "added"} successfully!`);
    } catch (error) {
      console.error(error);
      alert("Error adding parent");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Paper elevation={2} sx={{ p: 4 }}>
      <Typography variant="h6" gutterBottom>
        {person?.id ? "Edit" : "Add"} Person
      </Typography>
      <Box component="form" onSubmit={handleSubmit}>
        <TextField
          label="Person's Name"
          fullWidth
          required
          margin="normal"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <TextField
          label="Person's Phone Number"
          type="phone"
          fullWidth
          required
          margin="normal"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          error={!!phone && !/^\d{10,15}$/.test(phone)}
          helperText={
            !!phone && !/^\d{10,15}$/.test(phone)
              ? "Enter a valid phone number (10–15 digits)"
              : ""
          }
        />
        <TextField
          select
          label="Relation"
          value={relation}
          onChange={(e) => setRelation(e.target.value)}
          fullWidth
        >
          <MenuItem value="mother">Mother</MenuItem>
          <MenuItem value="father">Father</MenuItem>
          <MenuItem value="spouse">Spouse</MenuItem>
          <MenuItem value="sibling">Sibling</MenuItem>
          <MenuItem value="friend">Friend</MenuItem>
          <MenuItem value="other">Other</MenuItem>
        </TextField>
        <TextField
          select
          label="Timezone"
          fullWidth
          margin="normal"
          value={timezone}
          onChange={(e) => setTimezone(e.target.value)}
        >
          <MenuItem value="Asia/Kolkata">Asia/Kolkata</MenuItem>
          <MenuItem value="UTC">UTC</MenuItem>
          <MenuItem value="America/New_York">America/New_York</MenuItem>
        </TextField>

        <Button
          type="submit"
          variant="contained"
          sx={{ mt: 2 }}
          disabled={loading}
        >
          {loading ? "Saving..." : `${person?.id ? "Edit" : "Add"} Person`}
        </Button>
      </Box>
    </Paper>
  );
}
