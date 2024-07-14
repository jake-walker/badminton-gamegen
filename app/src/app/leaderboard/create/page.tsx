"use client";

// eslint-disable-next-line import/order, import/no-unresolved, import/extensions
import SubmitButton from "@/components/SubmitButton";
import { Box, Stack, TextField } from "@mui/material";
import { useFormState } from "react-dom";
import newGroup from "./actions";

export default function CreateGroup() {
  const [state, formAction] = useFormState(newGroup, { errors: {} });

  return (
    <Box sx={{ mx: 2 }}>
      <form action={formAction}>
        <Stack gap={2}>
          <TextField label="Name" name="name" variant="outlined" error={(state.errors?.name?.length || 0) > 0} helperText={state.errors?.name?.join(". ") || ""} />
          <SubmitButton text="Create" />
        </Stack>
      </form>
    </Box>
  );
}
