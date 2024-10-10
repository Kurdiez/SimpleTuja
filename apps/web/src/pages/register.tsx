import AuthLayout from "@/components/common/AuthLayout";
import RegisterForm from "@/components/pages/register/RegisterForm";

export default function RegisterPage(): JSX.Element {
  return (
    <AuthLayout>
      <RegisterForm />
    </AuthLayout>
  );
}
