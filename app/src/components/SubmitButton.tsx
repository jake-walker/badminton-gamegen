import { Button, CircularProgress } from "@mui/material";
import { useFormStatus } from "react-dom";

export default function SubmitButton({ text = "Submit" }: { text: string }) {
  const { pending } = useFormStatus();

  return (
    <Button variant="contained" type="submit">
      {pending ? <CircularProgress /> : text}
    </Button>
  );
}
