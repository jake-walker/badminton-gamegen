import { LoadingButton } from "@mui/lab";
import { useFormStatus } from "react-dom";

export default function SubmitButton({ text = "Submit" }: { text: string }) {
  const { pending } = useFormStatus();

  return (
    <LoadingButton loading={pending} variant="contained" type="submit">
      {text}
    </LoadingButton>
  )
}
