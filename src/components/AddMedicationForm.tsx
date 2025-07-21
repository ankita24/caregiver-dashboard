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
import { updateMedication } from "../services/firestore.js";

const NOTIFY_METHODS = ["sms", "call", "push"];

export default function AddMedicationForm({
  personId,
  caregiverId,
  onClose,
  onSuccess,medication
}: {
  personId: string;
  caregiverId: string;
  onClose?: () => void;
  onSuccess?:()=>void
  medication?: {
    id: string;
    name: string;
    dosage: string;
    times: string[];
    alertAfterMinutes: number;
    notifyMethod: string;
  };
}) {
  const [name, setName] = useState(medication?.name ?? '');
  const [dosage, setDosage] = useState(medication?.dosage ?? '');
  const [time, setTime] = useState(medication?.times?.join(', ') || '');
  const [times, setTimes] = useState<string[]>(medication?.times ?? []);
  const [alertAfter, setAlertAfter] = useState(medication?.alertAfterMinutes || 30); // minutes
  const [notifyMethod, setNotifyMethod] = useState(medication?.notifyMethod || 'sms');

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
      const data = {
        name,
        dosage,
        times,
        alertAfterMinutes: alertAfter,
        notifyMethod,
        updatedAt: Timestamp.now(),
      };
  
      if (medication?.id) {
        // Edit Mode
        await updateMedication(
          caregiverId,
          personId,
          medication.id,
          data
        );
      } else {
        // Add Mode
        await addDoc(
          collection(db, "caregivers", caregiverId, "people", personId, "medications"),
          {
            ...data,
            createdAt: Timestamp.now(),
          }
        );
      }
  
      onSuccess?.();
      onClose?.();
    } catch (error) {
      console.error("Error saving medication:", error);
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
        onChange={(e) => setAlertAfter(Number(e.target.value))}
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
