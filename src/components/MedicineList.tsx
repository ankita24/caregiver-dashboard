// components/MedicationList.tsx

import { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  query,
  orderBy,
  DocumentData,
} from "firebase/firestore";
import { db } from "../firebase.js";
import {
  List,
  ListItem,
  ListItemText,
  Typography,
  Chip,
  Stack,
  Divider,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
} from "@mui/material";
import AddMedicationForm from "./AddMedicationForm.js";
import { deleteMedication, getParents } from "../services/firestore.js";

interface Medication {
  id: string;
  name: string;
  dosage: string;
  times: string[];
  alertAfterMinutes: number;
  notifyMethod: string;
}

export default function MedicationList({
  caregiverId,
  personId,
}: {
  caregiverId: string;
  personId: string;
}) {
  const [medications, setMedications] = useState<Medication[]>([]);
  const [medicationDialogOpen, setMedicationDialogOpen] = useState(false);
  const [selectedMedication, setSelectedMedication] =
    useState<Medication | null>(null);

  useEffect(() => {
    const fetchMedications = async () => {
      const q = query(
        collection(
          db,
          "caregivers",
          caregiverId,
          "people",
          personId,
          "medications"
        ),
        orderBy("createdAt", "desc")
      );

      const snapshot = await getDocs(q);
      const meds = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as DocumentData),
      })) as Medication[];

      setMedications(meds);
    };

    fetchMedications();
  }, [caregiverId, personId]);

  if (medications.length === 0) {
    return (
      <Typography variant="body2" sx={{ mt: 1 }}>
        No medications added yet.
      </Typography>
    );
  }

  return (
    <List dense sx={{ mt: 2 }}>
      {medications.map((med) => (
        <div key={med.id}>
          <ListItem alignItems="flex-start" style={{ paddingLeft: 0 }}>
            <ListItemText
              primary={
                <Typography fontWeight="bold">
                  {med.name} — {med.dosage}
                </Typography>
              }
              secondary={
                <>
                  <Stack
                    direction="row"
                    spacing={1}
                    sx={{ mt: 0.5, flexWrap: "wrap" }}
                  >
                    {med.times.map((t, i) => (
                      <Chip key={i} label={`⏰ ${t}`} size="small" />
                    ))}
                  </Stack>
                  <Typography variant="caption" display="block" mt={1}>
                    Alert After: {med.alertAfterMinutes} min • Notify by:{" "}
                    {med.notifyMethod.toUpperCase()}
                  </Typography>
                </>
              }
            />
          </ListItem>
          <Button
            size="small"
            onClick={() => {
              setSelectedMedication(med); // Pass the selected medication
              setMedicationDialogOpen(true);
            }}
          >
            Edit
          </Button>
          <Button
            size="small"
            color="error"
            onClick={async () => {
              if (confirm("Are you sure you want to delete this medication?")) {
                await deleteMedication(caregiverId, personId, med.id);
                await getParents(caregiverId); // Refresh the list after deletion
              }
            }}
          >
            Delete
          </Button>
          <Divider component="li" />
        </div>
      ))}
      {medicationDialogOpen && (
        <Dialog
          open={medicationDialogOpen}
          onClose={() => setMedicationDialogOpen(false)}
          fullWidth
          maxWidth="sm"
        >
          <DialogTitle>Edit Medication for {personId}</DialogTitle>
          <DialogContent>
            <AddMedicationForm
              personId={personId}
              caregiverId={caregiverId}
              medication={selectedMedication || undefined}
              onClose={() => {
                setMedicationDialogOpen(false);
                setSelectedMedication(null);
              }}
              onSuccess={() => getParents(caregiverId)}
            />
          </DialogContent>
        </Dialog>
      )}
    </List>
  );
}
