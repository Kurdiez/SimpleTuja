import { useRouter } from "next/router";
import AuthLayout from "@/components/common/AuthLayout";
import ResetPasswordForm from "@/components/pages/reset-password/ResetPasswordForm";

export default function ResetPasswordPage(): JSX.Element {
  const router = useRouter();
  const { token } = router.query;

  return (
    <AuthLayout>
      <ResetPasswordForm token={token as string} />
    </AuthLayout>
  );
}
