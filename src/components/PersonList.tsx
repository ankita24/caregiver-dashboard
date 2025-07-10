import { useEffect, useState } from "react";
import { getParents } from "../services/firestore.js"; // ✅ You can rename this too later
import { useAuth } from "../hooks/useAuth.js";
import {
  Card,
  CardContent,
  Typography,
  Grid,
  CircularProgress,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
} from "@mui/material";
import AddMedicationForm from "./AddMedicationForm.js";
import MedicationList from "./MedicineList.js";
import AddParentForm from "./AddPersonForm.js";
import AddPersonForm from "./AddPersonForm.js";

interface Person {
  id: string;
  name: string;
  phone: string;
  relation: string;
  timezone: string;
}

export default function PersonList() {
  const { currentUser } = useAuth();
  const [people, setPeople] = useState<Person[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [selectedPerson, setSelectedPerson] = useState<Person | null>(null);
  const [openEditDialog, setOpenEditDialog] = useState<Person | null>(null);

  useEffect(() => {
    const fetchPeople = async () => {
      if (!currentUser) return;
      const data = await getParents(currentUser.uid); // Later rename to getPeople
      setPeople(data as Person[]);
      setLoading(false);
    };

    fetchPeople();
  }, [currentUser]);

  if (!currentUser) return null;
  if (loading) return <CircularProgress />;

  return (
    <Grid container spacing={2} mt={2}>
      {people.map((person) => (
        <Grid item xs={12} sm={6} md={4} key={person.id}>
          <Card variant="outlined">
            <CardContent>
              <Button onClick={() => setOpenEditDialog(person)}>Edit</Button>
              <Typography variant="h6">{person.name}</Typography>
              <Typography variant="body2">{person.phone}</Typography>
              <Typography variant="body2">{person.relation}</Typography>
              <Typography variant="caption" color="text.secondary">
                Timezone: {person.timezone}
              </Typography>
              <br />
              <Button
                variant="outlined"
                sx={{ mt: 1 }}
                onClick={() => {
                  setOpen(true);
                  setSelectedPerson(person);
                }}
              >
                + Add Medication
              </Button>
              <MedicationList
                personId={person.id}
                caregiverId={currentUser.uid}
              />
            </CardContent>
          </Card>
        </Grid>
      ))}

      {selectedPerson && (
        <Dialog
          open={open}
          onClose={() => setOpen(false)}
          fullWidth
          maxWidth="sm"
        >
          <DialogTitle>Add Medication for {selectedPerson.name}</DialogTitle>
          <DialogContent>
            <AddMedicationForm
              personId={selectedPerson.id}
              caregiverId={currentUser.uid}
              onClose={() => setOpen(false)}
            />
          </DialogContent>
        </Dialog>
      )}
      {openEditDialog?.id && (
        <Dialog
          open={!!openEditDialog?.id}
          onClose={()=>setOpenEditDialog(null)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>Add New Parent</DialogTitle>
          <DialogContent>
            <AddPersonForm person={openEditDialog} />{" "}
          </DialogContent>
        </Dialog>
      )}
    </Grid>
  );
}
