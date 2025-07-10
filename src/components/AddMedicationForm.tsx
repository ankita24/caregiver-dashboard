// components/AddMedicationForm.tsx
import {
  TextField,
  Button,
  Box,
  MenuItem,
  Typography,
  Chip,
  Stack,
} from "@mui/material";
import { useState } from "react";
import { Timestamp, collection, addDoc } from "firebase/firestore";
import { db } from "../firebase.js";

const NOTIFY_METHODS = ["sms", "call", "push"];

export default function AddMedicationForm({
  personId,
  caregiverId,
  onClose,
}: {
  personId: string;
  caregiverId: string;
  onClose?: () => void;
}) {
  const [name, setName] = useState("");
  const [dosage, setDosage] = useState("");
  const [time, setTime] = useState("");
  const [times, setTimes] = useState<string[]>([]);
  const [alertAfter, setAlertAfter] = useState("30"); // minutes
  const [notifyMethod, setNotifyMethod] = useState("sms");

  const handleAddTime = () => {
    if (time && !times.includes(time)) {
      setTimes([...times, time]);
      setTime("");
    }
  };

  const handleRemoveTime = (t: string) => {
    setTimes(times.filter((x) => x !== t));
  };

  const handleSubmit = async (e: React.FormEvent) => {

    e.preventDefault();
    if (!name || !dosage || times.length === 0) return;

    try {
      await addDoc(
        collection(
          db,
          "caregivers",
          caregiverId,
          "people",
          personId,
          "medications"
        ),
        {
          name,
          dosage,
          times,
          alertAfterMinutes: parseInt(alertAfter),
          notifyMethod,
          createdAt: Timestamp.now(),
        }
      );
      onClose?.();
    } catch (error) {
      console.error("Error adding medication:", error);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
      <TextField
        label="Medicine Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        fullWidth
        required
        margin="normal"
      />
      <TextField
        label="Dosage"
        value={dosage}
        onChange={(e) => setDosage(e.target.value)}
        fullWidth
        required
        margin="normal"
      />
      <Box display={"flex"} gap={4} alignItems="baseline">
        <TextField
          label="Add Time (e.g. 09:00)"
          value={time}
          type="time"
          InputLabelProps={{ shrink: true }}
          onChange={(e) => setTime(e.target.value)}
          margin="normal"
        />
        <Button onClick={handleAddTime} sx={{ mb: 2,height:'30px' }} variant='contained'>
          + Add Time
        </Button>
      </Box>

      <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap", mb: 2 }}>
        {times.map((t) => (
          <Chip key={t} label={t} onDelete={() => handleRemoveTime(t)} />
        ))}
      </Stack>

      <TextField
        label="Alert After (minutes)"
        value={alertAfter}
        type="number"
        onChange={(e) => setAlertAfter(e.target.value)}
        fullWidth
        required
        margin="normal"
      />

      <TextField
        label="Notify Method"
        select
        value={notifyMethod}
        onChange={(e) => setNotifyMethod(e.target.value)}
        fullWidth
        margin="normal"
      >
        {NOTIFY_METHODS.map((method) => (
          <MenuItem key={method} value={method}>
            {method.toUpperCase()}
          </MenuItem>
        ))}
      </TextField>

      <Box mt={2}>
        <Button variant="contained" type="submit">
          Add Medication
        </Button>
      </Box>
    </Box>
  );
}
