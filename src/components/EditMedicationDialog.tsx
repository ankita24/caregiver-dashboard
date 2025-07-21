// components/EditMedicationDialog.tsx
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Button,
    Stack,
  } from "@mui/material";
  import { useState } from "react";
import { updateMedication } from "../services/firestore.js";
  
  interface Props {
    open: boolean;
    onClose: () => void;
    onSuccess: () => void;
    caregiverId: string;
    personId: string;
    medication: {
      id: string;
      name: string;
      dosage: string;
      times: string[];
      alertAfterMinutes: number;
      notifyMethod: string;
    };
  }
  
  export default function EditMedicationDialog({
    open,
    onClose,
    onSuccess,
    caregiverId,
    personId,
    medication,
  }: Props) {
    const [name, setName] = useState(medication.name);
    const [dosage, setDosage] = useState(medication.dosage);
    const [times, setTimes] = useState(medication.times.join(", "));
    const [alertAfterMinutes, setAlertAfterMinutes] = useState(
      medication.alertAfterMinutes
    );
    const [notifyMethod, setNotifyMethod] = useState(medication.notifyMethod);
  
    const handleSubmit = async () => {
      await updateMedication(caregiverId, personId, medication.id, {
        name,
        dosage,
        times: times.split(",").map((t) => t.trim()),
        alertAfterMinutes,
        notifyMethod,
      });
  
      onSuccess();
      onClose();
    };
  
    return (
      <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
        <DialogTitle>Edit Medication</DialogTitle>
        <DialogContent>
          <Stack spacing={2} mt={2}>
            <TextField
              label="Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              fullWidth
            />
            <TextField
              label="Dosage"
              value={dosage}
              onChange={(e) => setDosage(e.target.value)}
              fullWidth
            />
            <TextField
              label="Times (comma separated)"
              value={times}
              onChange={(e) => setTimes(e.target.value)}
              fullWidth
            />
            <TextField
              label="Alert After (minutes)"
              type="number"
              value={alertAfterMinutes}
              onChange={(e) => setAlertAfterMinutes(Number(e.target.value))}
              fullWidth
            />
            <TextField
              label="Notify Method"
              value={notifyMethod}
              onChange={(e) => setNotifyMethod(e.target.value)}
              fullWidth
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <Button variant="contained" onClick={handleSubmit}>
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>
    );
  }
  