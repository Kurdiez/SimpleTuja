import AuthLayout from "@/components/common/AuthLayout";
import ForgotPasswordForm from "@/components/pages/forgot-password/ForgotPasswordForm";

export default function ResetPasswordPage(): JSX.Element {
  return (
    <AuthLayout>
      <ForgotPasswordForm />
    </AuthLayout>
  );
}
